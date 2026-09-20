const express = require("express");
const mongoose = require("mongoose");

const Quote = require("../models/Quote");
const Product = require("../models/Product");
const Customer = require("../models/Customer");

const protect = require("../middleware/authMiddleware");

const requirePlan = require("../middleware/subscriptionMiddleware");

const {
  businessAccess,
  requireRole
} = require("../middleware/businessAccessMiddleware");

const {
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
// GENERATE QUOTE NUMBER
// =====================================================

const generateQuoteNumber = async (businessId) => {

  const year =
    new Date().getFullYear();

  const prefix =
    `QUO-${year}-`;

  const lastQuote =
    await Quote.findOne({

      business:
        businessId,

      quoteNumber:
        new RegExp(`^${prefix}`)

    })
      .sort({
        createdAt: -1
      });

  let nextNumber = 1;

  if (lastQuote) {

    const lastNumber =
      parseInt(
        lastQuote.quoteNumber.replace(
          prefix,
          ""
        ),
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
// PROCESS QUOTE ITEMS
// =====================================================

const processQuoteItems = async ({
  items,
  businessId
}) => {

  if (
    !Array.isArray(items) ||
    items.length === 0
  ) {

    throw new Error(
      "Quote must contain at least one item"
    );

  }

  const quoteItems = [];

  let subtotal = 0;


  for (
    const item of items
  ) {

    if (
      !item.name &&
      !item.product
    ) {

      throw new Error(
        "Each quote item must have a product or name"
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
    // PRODUCT ITEM
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


      quoteItems.push({

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


      const itemName =
        String(
          item.name
        ).trim();


      if (!itemName) {

        throw new Error(
          "Custom item name is required"
        );

      }


      const itemSubtotal =
        price * quantity;


      subtotal +=
        itemSubtotal;


      quoteItems.push({

        product:
          null,

        name:
          itemName,

        price,

        quantity,

        subtotal:
          itemSubtotal

      });

    }

  }


  return {

    quoteItems,

    subtotal

  };
};


// =====================================================
// UPDATE EXPIRED QUOTES
// =====================================================

const updateExpiredStatus = async (
  quote
) => {

  if (
    !quote ||
    quote.status === "accepted" ||
    quote.status === "rejected" ||
    quote.status === "expired"
  ) {

    return quote;

  }


  if (
    quote.expiryDate &&
    new Date(
      quote.expiryDate
    ) < new Date()
  ) {

    quote.status =
      "expired";

    await quote.save();

  }


  return quote;
};


// =====================================================
// GET ALL QUOTES
// =====================================================

router.get(
  "/",
  protect,
  businessAccess,
  requirePlan(allowedPlans),
  async (req, res) => {

    try {

      const {
        status,
        customer,
        search
      } = req.query;


      const filter = {

        business:
          req.business._id

      };


      if (status) {

        filter.status =
          status;

      }


      if (customer) {

        filter.customer =
          customer;

      }


      if (search) {

        filter.quoteNumber = {

          $regex:
            search,

          $options:
            "i"

        };

      }


      const quotes =
        await Quote.find(
          filter
        )
          .populate("customer")
          .sort({
            createdAt: -1
          });


      for (
        const quote of quotes
      ) {

        await updateExpiredStatus(
          quote
        );

      }


      res.status(200).json(
        quotes
      );

    } catch (error) {

      console.error(
        "GET QUOTES ERROR:",
        error
      );

      res.status(500).json({

        message:
          error.message ||
          "Unable to load quotes"

      });

    }

  }
);


// =====================================================
// GET ONE QUOTE
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
            "Invalid quote ID"

        });

      }


      const quote =
        await Quote.findOne({

          _id:
            req.params.id,

          business:
            req.business._id

        })
          .populate("customer")
          .populate("items.product");


      if (!quote) {

        return res.status(404).json({

          message:
            "Quote not found"

        });

      }


      await updateExpiredStatus(
        quote
      );


      res.status(200).json(
        quote
      );

    } catch (error) {

      console.error(
        "GET QUOTE ERROR:",
        error
      );

      res.status(500).json({

        message:
          error.message ||
          "Unable to load quote"

      });

    }

  }
);


// =====================================================
// CREATE QUOTE
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
        expiryDate,
        notes,
        status
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
      // PROCESS ITEMS
      // =================================================

      let processed;

      try {

        processed =
          await processQuoteItems({

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
        quoteItems,
        subtotal
      } = processed;


      // =================================================
      // VALIDATE STATUS
      // =================================================

      const allowedStatuses = [
        "draft",
        "sent"
      ];


      const quoteStatus =
        status || "draft";


      if (
        !allowedStatuses.includes(
          quoteStatus
        )
      ) {

        return res.status(400).json({

          message:
            "New quotes can only be created as draft or sent"

        });

      }


      // =================================================
      // GENERATE NUMBER
      // =================================================

      const quoteNumber =
        await generateQuoteNumber(
          business._id
        );


      // =================================================
      // CREATE QUOTE
      // =================================================

      const quote =
        await Quote.create({

          business:
            business._id,

          customer:
            customer || null,

          quoteNumber,

          items:
            quoteItems,

          subtotal,

          total:
            subtotal,

          expiryDate:
            expiryDate || null,

          notes:
            typeof notes === "string"
              ? notes.trim()
              : "",

          status:
            quoteStatus

        });


      // =================================================
      // NOTIFICATION
      // =================================================

      try {

        await createSuccessNotification({

          business,

          user:
            req.user._id,

          title:
            "Quote Created",

          message:
            `Quote ${quote.quoteNumber} has been created.`,

          link:
            `/quotes/${quote._id}`

        });

      } catch (notificationError) {

        console.error(
          "QUOTE NOTIFICATION ERROR:",
          notificationError
        );

      }


      const populatedQuote =
        await Quote.findById(
          quote._id
        )
          .populate("customer")
          .populate("items.product");


      res.status(201).json({

        message:
          "Quote created successfully",

        quote:
          populatedQuote

      });

    } catch (error) {

      console.error(
        "CREATE QUOTE ERROR:",
        error
      );

      res.status(500).json({

        message:
          error.message ||
          "Unable to create quote"

      });

    }

  }
);


// =====================================================
// UPDATE QUOTE
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

      const quote =
        await Quote.findOne({

          _id:
            req.params.id,

          business:
            req.business._id

        });


      if (!quote) {

        return res.status(404).json({

          message:
            "Quote not found"

        });

      }


      await updateExpiredStatus(
        quote
      );


      if (
        quote.status === "expired" ||
        quote.status === "accepted" ||
        quote.status === "rejected"
      ) {

        return res.status(400).json({

          message:
            `A ${quote.status} quote cannot be edited`

        });

      }


      const {
        customer,
        items,
        expiryDate,
        notes,
        status
      } = req.body;


      // =================================================
      // CUSTOMER
      // =================================================

      if (
        customer !== undefined
      ) {

        if (
          customer === null ||
          customer === ""
        ) {

          quote.customer =
            null;

        } else {

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
                req.business._id

            });


          if (!customerExists) {

            return res.status(404).json({

              message:
                "Customer not found"

            });

          }


          quote.customer =
            customer;

        }

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
            await processQuoteItems({

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


        quote.items =
          processed.quoteItems;

        quote.subtotal =
          processed.subtotal;

        quote.total =
          processed.subtotal;

      }


      // =================================================
      // EXPIRY DATE
      // =================================================

      if (
        expiryDate !== undefined
      ) {

        quote.expiryDate =
          expiryDate || null;

      }


      // =================================================
      // NOTES
      // =================================================

      if (
        notes !== undefined
      ) {

        quote.notes =
          typeof notes === "string"
            ? notes.trim()
            : "";

      }


      // =================================================
      // STATUS
      // =================================================

      if (
        status !== undefined
      ) {

        const allowedStatuses = [
          "draft",
          "sent"
        ];


        if (
          !allowedStatuses.includes(
            status
          )
        ) {

          return res.status(400).json({

            message:
              "Invalid quote status"

          });

        }


        quote.status =
          status;

      }


      await quote.save();


      try {

        await createSuccessNotification({

          business:
            req.business,

          user:
            req.user._id,

          title:
            "Quote Updated",

          message:
            `Quote ${quote.quoteNumber} has been updated.`,

          link:
            `/quotes/${quote._id}`

        });

      } catch (notificationError) {

        console.error(
          "QUOTE UPDATE NOTIFICATION ERROR:",
          notificationError
        );

      }


      const populatedQuote =
        await Quote.findById(
          quote._id
        )
          .populate("customer")
          .populate("items.product");


      res.status(200).json({

        message:
          "Quote updated successfully",

        quote:
          populatedQuote

      });

    } catch (error) {

      console.error(
        "UPDATE QUOTE ERROR:",
        error
      );

      res.status(500).json({

        message:
          error.message ||
          "Unable to update quote"

      });

    }

  }
);


// =====================================================
// SEND QUOTE
// =====================================================

router.put(
  "/:id/send",
  protect,
  businessAccess,
  requireRole(
    "owner",
    "admin"
  ),
  requirePlan(allowedPlans),
  async (req, res) => {

    try {

      const quote =
        await Quote.findOne({

          _id:
            req.params.id,

          business:
            req.business._id

        });


      if (!quote) {

        return res.status(404).json({

          message:
            "Quote not found"

        });

      }


      await updateExpiredStatus(
        quote
      );


      if (
        quote.status ===
        "expired"
      ) {

        return res.status(400).json({

          message:
            "Expired quote cannot be sent"

        });

      }


      if (
        quote.status ===
        "accepted"
      ) {

        return res.status(400).json({

          message:
            "Accepted quote cannot be sent again"

        });

      }


      if (
        quote.status ===
        "rejected"
      ) {

        return res.status(400).json({

          message:
            "Rejected quote cannot be sent"

        });

      }


      quote.status =
        "sent";


      await quote.save();


      try {

        await createSuccessNotification({

          business:
            req.business,

          user:
            req.user._id,

          title:
            "Quote Sent",

          message:
            `Quote ${quote.quoteNumber} is now marked as sent.`,

          link:
            `/quotes/${quote._id}`

        });

      } catch (notificationError) {

        console.error(
          "QUOTE SEND NOTIFICATION ERROR:",
          notificationError
        );

      }


      res.status(200).json({

        message:
          "Quote marked as sent",

        quote

      });

    } catch (error) {

      console.error(
        "SEND QUOTE ERROR:",
        error
      );

      res.status(500).json({

        message:
          error.message ||
          "Unable to send quote"

      });

    }

  }
);


// =====================================================
// ACCEPT QUOTE
// =====================================================

router.put(
  "/:id/accept",
  protect,
  businessAccess,
  requireRole(
    "owner",
    "admin"
  ),
  requirePlan(allowedPlans),
  async (req, res) => {

    try {

      const quote =
        await Quote.findOne({

          _id:
            req.params.id,

          business:
            req.business._id

        });


      if (!quote) {

        return res.status(404).json({

          message:
            "Quote not found"

        });

      }


      await updateExpiredStatus(
        quote
      );


      if (
        quote.status ===
        "expired"
      ) {

        return res.status(400).json({

          message:
            "Expired quote cannot be accepted"

        });

      }


      if (
        quote.status ===
        "rejected"
      ) {

        return res.status(400).json({

          message:
            "Rejected quote cannot be accepted"

        });

      }


      quote.status =
        "accepted";


      await quote.save();


      try {

        await createSuccessNotification({

          business:
            req.business,

          user:
            req.user._id,

          title:
            "Quote Accepted",

          message:
            `Quote ${quote.quoteNumber} has been accepted.`,

          link:
            `/quotes/${quote._id}`

        });

      } catch (notificationError) {

        console.error(
          "QUOTE ACCEPT NOTIFICATION ERROR:",
          notificationError
        );

      }


      res.status(200).json({

        message:
          "Quote accepted successfully",

        quote

      });

    } catch (error) {

      console.error(
        "ACCEPT QUOTE ERROR:",
        error
      );

      res.status(500).json({

        message:
          error.message ||
          "Unable to accept quote"

      });

    }

  }
);


// =====================================================
// REJECT QUOTE
// =====================================================

router.put(
  "/:id/reject",
  protect,
  businessAccess,
  requireRole(
    "owner",
    "admin"
  ),
  requirePlan(allowedPlans),
  async (req, res) => {

    try {

      const quote =
        await Quote.findOne({

          _id:
            req.params.id,

          business:
            req.business._id

        });


      if (!quote) {

        return res.status(404).json({

          message:
            "Quote not found"

        });

      }


      if (
        quote.status ===
        "accepted"
      ) {

        return res.status(400).json({

          message:
            "An accepted quote cannot be rejected"

        });

      }


      if (
        quote.status ===
        "expired"
      ) {

        return res.status(400).json({

          message:
            "An expired quote cannot be rejected"

        });

      }


      quote.status =
        "rejected";


      await quote.save();


      try {

        await createWarningNotification({

          business:
            req.business,

          user:
            req.user._id,

          title:
            "Quote Rejected",

          message:
            `Quote ${quote.quoteNumber} has been rejected.`,

          link:
            `/quotes/${quote._id}`

        });

      } catch (notificationError) {

        console.error(
          "QUOTE REJECT NOTIFICATION ERROR:",
          notificationError
        );

      }


      res.status(200).json({

        message:
          "Quote rejected successfully",

        quote

      });

    } catch (error) {

      console.error(
        "REJECT QUOTE ERROR:",
        error
      );

      res.status(500).json({

        message:
          error.message ||
          "Unable to reject quote"

      });

    }

  }
);


// =====================================================
// CHECK QUOTE STATUS
// =====================================================

router.put(
  "/:id/check-status",
  protect,
  businessAccess,
  requirePlan(allowedPlans),
  async (req, res) => {

    try {

      const quote =
        await Quote.findOne({

          _id:
            req.params.id,

          business:
            req.business._id

        });


      if (!quote) {

        return res.status(404).json({

          message:
            "Quote not found"

        });

      }


      await updateExpiredStatus(
        quote
      );


      res.status(200).json({

        message:
          "Quote status checked",

        status:
          quote.status,

        quote

      });

    } catch (error) {

      console.error(
        "CHECK QUOTE STATUS ERROR:",
        error
      );

      res.status(500).json({

        message:
          error.message ||
          "Unable to check quote status"

      });

    }

  }
);


// =====================================================
// DELETE QUOTE
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

      const quote =
        await Quote.findOne({

          _id:
            req.params.id,

          business:
            req.business._id

        });


      if (!quote) {

        return res.status(404).json({

          message:
            "Quote not found"

        });

      }


      if (
        quote.status ===
        "accepted"
      ) {

        return res.status(400).json({

          message:
            "Accepted quotes cannot be deleted"

        });

      }


      await Quote.findByIdAndDelete(
        quote._id
      );


      res.status(200).json({

        message:
          "Quote deleted successfully"

      });

    } catch (error) {

      console.error(
        "DELETE QUOTE ERROR:",
        error
      );

      res.status(500).json({

        message:
          error.message ||
          "Unable to delete quote"

      });

    }

  }
);


module.exports = router;