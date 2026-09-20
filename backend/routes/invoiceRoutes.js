const express = require("express");
const mongoose = require("mongoose");

const Invoice = require("../models/Invoice");
const Product = require("../models/Product");
const Customer = require("../models/Customer");
const Quote = require("../models/Quote");

const protect = require("../middleware/authMiddleware");

const requirePlan = require("../middleware/subscriptionMiddleware");

const {
  businessAccess,
  requireRole
} = require("../middleware/businessAccessMiddleware");

const {
  createInvoiceNotification,
  createSuccessNotification,
  createWarningNotification
} = require("../services/notificationService");

const router = express.Router();


// =====================================================
// PLAN ACCESS
// =====================================================

const allowedPlans = [
  "free",
  "starter",
  "professional"
];


// =====================================================
// GENERATE INVOICE NUMBER
// =====================================================

const generateInvoiceNumber = async (businessId) => {

  const year =
    new Date().getFullYear();

  const prefix =
    `INV-${year}-`;

  const lastInvoice =
    await Invoice.findOne({

      business:
        businessId,

      invoiceNumber:
        new RegExp(`^${prefix}`)

    })
      .sort({
        createdAt: -1
      });

  let nextNumber = 1;

  if (lastInvoice) {

    const lastNumber =
      parseInt(
        lastInvoice.invoiceNumber
          .replace(prefix, ""),
        10
      );

    if (
      Number.isFinite(lastNumber)
    ) {

      nextNumber =
        lastNumber + 1;

    }

  }

  return (
    prefix +
    String(nextNumber)
      .padStart(5, "0")
  );
};


// =====================================================
// CALCULATE INVOICE ITEMS
// =====================================================

const processInvoiceItems = async ({
  items,
  businessId
}) => {

  if (
    !Array.isArray(items) ||
    items.length === 0
  ) {

    throw new Error(
      "Invoice must contain at least one item"
    );

  }

  const invoiceItems = [];

  let subtotal = 0;


  for (
    const item of items
  ) {

    if (!item.name && !item.product) {

      throw new Error(
        "Each invoice item must have a product or name"
      );

    }


    const quantity =
      Number(item.quantity);


    if (
      !Number.isInteger(quantity) ||
      quantity < 1
    ) {

      throw new Error(
        `Invalid quantity for ${item.name || "item"}`
      );

    }


    // =================================================
    // PRODUCT-BASED ITEM
    // =================================================

    if (item.product) {

      if (
        !mongoose.Types.ObjectId.isValid(
          item.product
        )
      ) {

        throw new Error(
          `Invalid product ID: ${item.product}`
        );

      }


      const product =
        await Product.findOne({

          _id:
            item.product,

          business:
            businessId

        });


      if (!product) {

        throw new Error(
          `Product not found: ${item.product}`
        );

      }


      const price =
        Number(product.price);


      if (
        !Number.isFinite(price) ||
        price < 0
      ) {

        throw new Error(
          `Invalid price for ${product.name}`
        );

      }


      const itemSubtotal =
        price * quantity;


      subtotal +=
        itemSubtotal;


      invoiceItems.push({

        product:
          product._id,

        name:
          product.name,

        price,

        quantity,

        subtotal:
          itemSubtotal

      });

    }

    // =================================================
    // CUSTOM ITEM
    // =================================================

    else {

      const price =
        Number(item.price);


      if (
        !Number.isFinite(price) ||
        price < 0
      ) {

        throw new Error(
          `Invalid price for ${item.name}`
        );

      }


      const itemSubtotal =
        price * quantity;


      subtotal +=
        itemSubtotal;


      invoiceItems.push({

        product:
          null,

        name:
          String(item.name).trim(),

        price,

        quantity,

        subtotal:
          itemSubtotal

      });

    }

  }


  return {

    invoiceItems,

    subtotal

  };
};


// =====================================================
// UPDATE OVERDUE STATUS
// =====================================================

const updateOverdueStatus = async (
  invoice
) => {

  if (
    !invoice ||
    invoice.paymentStatus ===
      "paid" ||
    invoice.paymentStatus ===
      "cancelled"
  ) {

    return invoice;

  }


  if (
    invoice.dueDate &&
    new Date(invoice.dueDate) <
      new Date()
  ) {

    if (
      invoice.paymentStatus ===
      "unpaid"
    ) {

      invoice.paymentStatus =
        "overdue";

      await invoice.save();

    }

  }


  return invoice;
};


// =====================================================
// GET ALL INVOICES
// =====================================================

router.get(
  "/",
  protect,
  businessAccess,
  requirePlan(allowedPlans),
  async (req, res) => {

    try {

      const {
        paymentStatus,
        customer,
        search
      } = req.query;


      const filter = {

        business:
          req.business._id

      };


      if (
        paymentStatus
      ) {

        filter.paymentStatus =
          paymentStatus;

      }


      if (
        customer
      ) {

        filter.customer =
          customer;

      }


      if (
        search
      ) {

        filter.invoiceNumber =
          {
            $regex:
              search,
            $options:
              "i"
          };

      }


      const invoices =
        await Invoice.find(
          filter
        )
          .populate("customer")
          .sort({
            createdAt: -1
          });


      // Update overdue invoices

      for (
        const invoice of invoices
      ) {

        await updateOverdueStatus(
          invoice
        );

      }


      res.status(200).json(
        invoices
      );

    } catch (error) {

      console.error(
        "GET INVOICES ERROR:",
        error
      );

      res.status(500).json({

        message:
          error.message ||
          "Unable to load invoices"

      });

    }

  }
);


// =====================================================
// GET ONE INVOICE
// =====================================================

router.get(
  "/:id",
  protect,
  businessAccess,
  requirePlan(allowedPlans),
  async (req, res) => {

    try {

      if (
        !mongoose.Types.ObjectId.isValid(
          req.params.id
        )
      ) {

        return res.status(400).json({

          message:
            "Invalid invoice ID"

        });

      }


      const invoice =
        await Invoice.findOne({

          _id:
            req.params.id,

          business:
            req.business._id

        })
          .populate("customer")
          .populate("items.product");


      if (!invoice) {

        return res.status(404).json({

          message:
            "Invoice not found"

        });

      }


      await updateOverdueStatus(
        invoice
      );


      res.status(200).json(
        invoice
      );

    } catch (error) {

      console.error(
        "GET INVOICE ERROR:",
        error
      );

      res.status(500).json({

        message:
          error.message ||
          "Unable to load invoice"

      });

    }

  }
);


// =====================================================
// CREATE INVOICE
// =====================================================

router.post(
  "/",
  protect,
  businessAccess,
  requireRole(
    "owner",
    "admin"
  ),
  requirePlan(allowedPlans),
  async (req, res) => {

    try {

      const business =
        req.business;


      const {
        customer,
        items,
        dueDate,
        notes,
        sourceQuote
      } = req.body;


      // =================================================
      // CUSTOMER VALIDATION
      // =================================================

      if (customer) {

        if (
          !mongoose.Types.ObjectId.isValid(
            customer
          )
        ) {

          return res.status(400).json({

            message:
              "Invalid customer ID"

          });

        }


        const customerExists =
          await Customer.findOne({

            _id:
              customer,

            business:
              business._id

          });


        if (!customerExists) {

          return res.status(404).json({

            message:
              "Customer not found"

          });

        }

      }


      // =================================================
      // SOURCE QUOTE VALIDATION
      // =================================================

      let quote = null;

      if (sourceQuote) {

        if (
          !mongoose.Types.ObjectId.isValid(
            sourceQuote
          )
        ) {

          return res.status(400).json({

            message:
              "Invalid quote ID"

          });

        }


        quote =
          await Quote.findOne({

            _id:
              sourceQuote,

            business:
              business._id

          });


        if (!quote) {

          return res.status(404).json({

            message:
              "Source quote not found"

          });

        }

      }


      // =================================================
      // PROCESS ITEMS
      // =================================================

      let processed;

      try {

        processed =
          await processInvoiceItems({

            items,

            businessId:
              business._id

          });

      } catch (itemError) {

        return res.status(400).json({

          message:
            itemError.message

        });

      }


      const {
        invoiceItems,
        subtotal
      } = processed;


      // =================================================
      // GENERATE NUMBER
      // =================================================

      const invoiceNumber =
        await generateInvoiceNumber(
          business._id
        );


      // =================================================
      // CREATE INVOICE
      // =================================================

      const invoice =
        await Invoice.create({

          business:
            business._id,

          customer:
            customer || null,

          sourceQuote:
            sourceQuote || null,

          invoiceNumber,

          items:
            invoiceItems,

          subtotal,

          total:
            subtotal,

          dueDate:
            dueDate || null,

          notes:
            typeof notes === "string"
              ? notes.trim()
              : "",

          paymentStatus:
            "unpaid"

        });


      // =================================================
      // NOTIFICATION
      // =================================================

      try {

        await createInvoiceNotification({

          business,

          invoice,

          user:
            req.user._id

        });

      } catch (notificationError) {

        console.error(
          "INVOICE NOTIFICATION ERROR:",
          notificationError
        );

      }


      // =================================================
      // RESPONSE
      // =================================================

      const populatedInvoice =
        await Invoice.findById(
          invoice._id
        )
          .populate("customer")
          .populate("items.product");


      res.status(201).json({

        message:
          "Invoice created successfully",

        invoice:
          populatedInvoice

      });

    } catch (error) {

      console.error(
        "CREATE INVOICE ERROR:",
        error
      );

      res.status(500).json({

        message:
          error.message ||
          "Unable to create invoice"

      });

    }

  }
);


// =====================================================
// CREATE INVOICE FROM QUOTE
// =====================================================

router.post(
  "/from-quote/:quoteId",
  protect,
  businessAccess,
  requireRole(
    "owner",
    "admin"
  ),
  requirePlan(allowedPlans),
  async (req, res) => {

    try {

      const business =
        req.business;


      const quote =
        await Quote.findOne({

          _id:
            req.params.quoteId,

          business:
            business._id

        });


      if (!quote) {

        return res.status(404).json({

          message:
            "Quote not found"

        });

      }


      if (
        quote.status ===
        "rejected"
      ) {

        return res.status(400).json({

          message:
            "Rejected quotes cannot be converted into invoices"

        });

      }


      if (
        quote.status ===
        "expired"
      ) {

        return res.status(400).json({

          message:
            "Expired quotes cannot be converted into invoices"

        });

      }


      // =================================================
      // CHECK CUSTOMER
      // =================================================

      if (
        quote.customer
      ) {

        const customer =
          await Customer.findOne({

            _id:
              quote.customer,

            business:
              business._id

          });


        if (!customer) {

          return res.status(404).json({

            message:
              "Quote customer no longer exists"

          });

        }

      }


      // =================================================
      // GENERATE NUMBER
      // =================================================

      const invoiceNumber =
        await generateInvoiceNumber(
          business._id
        );


      // =================================================
      // CREATE FROM QUOTE
      // =================================================

      const invoice =
        await Invoice.create({

          business:
            business._id,

          customer:
            quote.customer || null,

          sourceQuote:
            quote._id,

          invoiceNumber,

          items:
            quote.items,

          subtotal:
            quote.subtotal,

          total:
            quote.total,

          dueDate:
            req.body.dueDate ||
            null,

          notes:
            req.body.notes ||
            quote.notes ||
            "",

          paymentStatus:
            "unpaid"

        });


      // =================================================
      // MARK QUOTE ACCEPTED
      // =================================================

      if (
        quote.status !==
        "accepted"
      ) {

        quote.status =
          "accepted";

        await quote.save();

      }


      // =================================================
      // NOTIFICATION
      // =================================================

      try {

        await createInvoiceNotification({

          business,

          invoice,

          user:
            req.user._id

        });

      } catch (notificationError) {

        console.error(
          "QUOTE INVOICE NOTIFICATION ERROR:",
          notificationError
        );

      }


      const populatedInvoice =
        await Invoice.findById(
          invoice._id
        )
          .populate("customer")
          .populate("items.product");


      res.status(201).json({

        message:
          "Invoice created from quote successfully",

        invoice:
          populatedInvoice

      });

    } catch (error) {

      console.error(
        "CREATE INVOICE FROM QUOTE ERROR:",
        error
      );

      res.status(500).json({

        message:
          error.message ||
          "Unable to create invoice from quote"

      });

    }

  }
);


// =====================================================
// UPDATE INVOICE
// =====================================================

router.put(
  "/:id",
  protect,
  businessAccess,
  requireRole(
    "owner",
    "admin"
  ),
  requirePlan(allowedPlans),
  async (req, res) => {

    try {

      const invoice =
        await Invoice.findOne({

          _id:
            req.params.id,

          business:
            req.business._id

        });


      if (!invoice) {

        return res.status(404).json({

          message:
            "Invoice not found"

        });

      }


      if (
        invoice.paymentStatus ===
        "paid"
      ) {

        return res.status(400).json({

          message:
            "Paid invoices cannot be edited"

        });

      }


      const {
        customer,
        items,
        dueDate,
        notes
      } = req.body;


      // =================================================
      // CUSTOMER
      // =================================================

      if (
        customer !== undefined &&
        customer !== null &&
        customer !== ""
      ) {

        const customerExists =
          await Customer.findOne({

            _id:
              customer,

            business:
              req.business._id

          });


        if (!customerExists) {

          return res.status(404).json({

            message:
              "Customer not found"

          });

        }


        invoice.customer =
          customer;

      }


      if (
        customer === null ||
        customer === ""
      ) {

        invoice.customer =
          null;

      }


      // =================================================
      // ITEMS
      // =================================================

      if (
        items !== undefined
      ) {

        let processed;

        try {

          processed =
            await processInvoiceItems({

              items,

              businessId:
                req.business._id

            });

        } catch (itemError) {

          return res.status(400).json({

            message:
              itemError.message

          });

        }


        invoice.items =
          processed.invoiceItems;

        invoice.subtotal =
          processed.subtotal;

        invoice.total =
          processed.subtotal;

      }


      // =================================================
      // OTHER FIELDS
      // =================================================

      if (
        dueDate !== undefined
      ) {

        invoice.dueDate =
          dueDate || null;

      }


      if (
        notes !== undefined
      ) {

        invoice.notes =
          typeof notes === "string"
            ? notes.trim()
            : "";

      }


      await invoice.save();


      // =================================================
      // NOTIFICATION
      // =================================================

      try {

        await createSuccessNotification({

          business:
            req.business,

          user:
            req.user._id,

          title:
            "Invoice Updated",

          message:
            `Invoice ${invoice.invoiceNumber} has been updated.`,

          link:
            `/invoices/${invoice._id}`

        });

      } catch (notificationError) {

        console.error(
          "INVOICE UPDATE NOTIFICATION ERROR:",
          notificationError
        );

      }


      const populatedInvoice =
        await Invoice.findById(
          invoice._id
        )
          .populate("customer")
          .populate("items.product");


      res.status(200).json({

        message:
          "Invoice updated successfully",

        invoice:
          populatedInvoice

      });

    } catch (error) {

      console.error(
        "UPDATE INVOICE ERROR:",
        error
      );

      res.status(500).json({

        message:
          error.message ||
          "Unable to update invoice"

      });

    }

  }
);


// =====================================================
// CANCEL INVOICE
// =====================================================

router.put(
  "/:id/cancel",
  protect,
  businessAccess,
  requireRole(
    "owner",
    "admin"
  ),
  requirePlan(allowedPlans),
  async (req, res) => {

    try {

      const invoice =
        await Invoice.findOne({

          _id:
            req.params.id,

          business:
            req.business._id

        });


      if (!invoice) {

        return res.status(404).json({

          message:
            "Invoice not found"

        });

      }


      if (
        invoice.paymentStatus ===
        "paid"
      ) {

        return res.status(400).json({

          message:
            "Paid invoices cannot be cancelled"

        });

      }


      invoice.paymentStatus =
        "cancelled";


      await invoice.save();


      try {

        await createWarningNotification({

          business:
            req.business,

          user:
            req.user._id,

          title:
            "Invoice Cancelled",

          message:
            `Invoice ${invoice.invoiceNumber} has been cancelled.`,

          link:
            `/invoices/${invoice._id}`

        });

      } catch (notificationError) {

        console.error(
          "CANCEL INVOICE NOTIFICATION ERROR:",
          notificationError
        );

      }


      res.status(200).json({

        message:
          "Invoice cancelled successfully",

        invoice

      });

    } catch (error) {

      console.error(
        "CANCEL INVOICE ERROR:",
        error
      );

      res.status(500).json({

        message:
          error.message ||
          "Unable to cancel invoice"

      });

    }

  }
);


// =====================================================
// MARK OVERDUE
// =====================================================

router.put(
  "/:id/check-status",
  protect,
  businessAccess,
  requirePlan(allowedPlans),
  async (req, res) => {

    try {

      const invoice =
        await Invoice.findOne({

          _id:
            req.params.id,

          business:
            req.business._id

        });


      if (!invoice) {

        return res.status(404).json({

          message:
            "Invoice not found"

        });

      }


      await updateOverdueStatus(
        invoice
      );


      res.status(200).json({

        message:
          "Invoice status checked",

        paymentStatus:
          invoice.paymentStatus,

        invoice

      });

    } catch (error) {

      console.error(
        "CHECK INVOICE STATUS ERROR:",
        error
      );

      res.status(500).json({

        message:
          error.message ||
          "Unable to check invoice status"

      });

    }

  }
);


// =====================================================
// DELETE INVOICE
// =====================================================

router.delete(
  "/:id",
  protect,
  businessAccess,
  requireRole(
    "owner",
    "admin"
  ),
  requirePlan(allowedPlans),
  async (req, res) => {

    try {

      const invoice =
        await Invoice.findOne({

          _id:
            req.params.id,

          business:
            req.business._id

        });


      if (!invoice) {

        return res.status(404).json({

          message:
            "Invoice not found"

        });

      }


      if (
        invoice.paymentStatus ===
        "paid"
      ) {

        return res.status(400).json({

          message:
            "Paid invoices cannot be deleted"

        });

      }


      await Invoice.findByIdAndDelete(
        invoice._id
      );


      res.status(200).json({

        message:
          "Invoice deleted successfully"

      });

    } catch (error) {

      console.error(
        "DELETE INVOICE ERROR:",
        error
      );

      res.status(500).json({

        message:
          error.message ||
          "Unable to delete invoice"

      });

    }

  }
);


module.exports = router;