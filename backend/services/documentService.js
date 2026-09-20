const Order = require("../models/Order");
const Invoice = require("../models/Invoice");


// =====================================================
// DOCUMENT ENGINE
// =====================================================
// Handles:
// - Invoice calculations
// - Invoice numbering
// - Creating invoices from orders
// - Retrieving invoices
// =====================================================


// =====================================================
// CALCULATE ORDER TOTALS
// =====================================================

const calculateOrderTotals = (order) => {

  if (!order) {
    throw new Error(
      "Order information is required"
    );
  }


  if (
    !Array.isArray(order.items) ||
    order.items.length === 0
  ) {

    throw new Error(
      "Order must contain at least one item"
    );

  }


  let subtotal = 0;


  const items =
    order.items.map((item) => {

      const price =
        Number(item.price);

      const quantity =
        Number(item.quantity);


      if (
        !Number.isFinite(price) ||
        price < 0
      ) {

        throw new Error(
          `Invalid price for ${item.name}`
        );

      }


      if (
        !Number.isFinite(quantity) ||
        quantity < 1 ||
        !Number.isInteger(quantity)
      ) {

        throw new Error(
          `Invalid quantity for ${item.name}`
        );

      }


      const itemSubtotal =
        Number(
          (price * quantity).toFixed(2)
        );


      subtotal +=
        itemSubtotal;


      return {

        product:
          item.product,

        name:
          item.name,

        price,

        quantity,

        subtotal:
          itemSubtotal

      };

    });


  subtotal =
    Number(
      subtotal.toFixed(2)
    );


  return {

    items,

    subtotal,

    total:
      subtotal

  };

};


// =====================================================
// GENERATE INVOICE NUMBER
// =====================================================

const generateInvoiceNumber =
  async (business) => {

    if (!business) {
      throw new Error(
        "Business information is required"
      );
    }


    const businessId =
      business._id || business;


    const count =
      await Invoice.countDocuments({

        business:
          businessId

      });


    const number =
      count + 1;


    return (
      "INV-" +
      String(number).padStart(
        6,
        "0"
      )
    );

  };


// =====================================================
// CREATE INVOICE FROM ORDER
// =====================================================

const createInvoiceFromOrder =
  async ({
    business,
    order,
    user = null
  }) => {

    if (!business) {
      throw new Error(
        "Business information is required"
      );
    }


    if (!order) {
      throw new Error(
        "Order information is required"
      );
    }


    const businessId =
      business._id || business;


    const orderId =
      order._id || order;


    // ================================================
    // GET ORDER
    // ================================================

    let orderDocument;


    if (
      typeof order === "object" &&
      order.items
    ) {

      orderDocument =
        order;

    } else {

      orderDocument =
        await Order.findOne({

          _id:
            orderId,

          business:
            businessId

        });

    }


    if (!orderDocument) {

      throw new Error(
        "Order not found"
      );

    }


    // ================================================
    // CALCULATE TOTALS
    // ================================================

    const totals =
      calculateOrderTotals(
        orderDocument
      );


    // ================================================
    // GENERATE NUMBER
    // ================================================

    const invoiceNumber =
      await generateInvoiceNumber(
        business
      );


    // ================================================
    // DETERMINE PAYMENT STATUS
    // ================================================

    let paymentStatus =
      "unpaid";


    if (
      orderDocument.paymentStatus ===
      "paid"
    ) {

      paymentStatus =
        "paid";

    } else if (
      orderDocument.paymentStatus ===
      "pending"
    ) {

      paymentStatus =
        "unpaid";

    } else if (
      orderDocument.paymentStatus ===
      "cancelled"
    ) {

      paymentStatus =
        "cancelled";

    }


    // ================================================
    // CREATE INVOICE
    // ================================================

    const invoice =
      await Invoice.create({

        business:
          businessId,

        customer:
          orderDocument.customer ||
          null,

        invoiceNumber,

        items:
          totals.items,

        subtotal:
          totals.subtotal,

        total:
          totals.total,

        paymentStatus

      });


    return invoice;

  };


// =====================================================
// CREATE INVOICE FROM QUOTE
// =====================================================

const createInvoiceFromQuote =
  async ({
    business,
    quote,
    user = null
  }) => {

    if (!business) {

      throw new Error(
        "Business information is required"
      );

    }


    if (!quote) {

      throw new Error(
        "Quote information is required"
      );

    }


    const businessId =
      business._id || business;


    const quoteId =
      quote._id || quote;


    // ================================================
    // VALIDATE QUOTE OBJECT
    // ================================================

    const quoteDocument =
      typeof quote === "object"
        ? quote
        : null;


    if (!quoteDocument) {

      throw new Error(
        "Quote object is required"
      );

    }


    if (
      !Array.isArray(
        quoteDocument.items
      ) ||
      quoteDocument.items.length === 0
    ) {

      throw new Error(
        "Quote must contain at least one item"
      );

    }


    // ================================================
    // CALCULATE TOTALS
    // ================================================

    const totals =
      calculateOrderTotals(
        quoteDocument
      );


    // ================================================
    // GENERATE NUMBER
    // ================================================

    const invoiceNumber =
      await generateInvoiceNumber(
        business
      );


    // ================================================
    // CREATE INVOICE
    // ================================================

    const invoice =
      await Invoice.create({

        business:
          businessId,

        customer:
          quoteDocument.customer ||
          null,

        sourceQuote:
          quoteId,

        invoiceNumber,

        items:
          totals.items,

        subtotal:
          totals.subtotal,

        total:
          totals.total,

        dueDate:
          quoteDocument.validUntil ||
          null,

        notes:
          quoteDocument.notes ||
          "",

        paymentStatus:
          "unpaid"

      });


    return invoice;

  };


// =====================================================
// GET ONE INVOICE
// =====================================================

const getInvoiceData =
  async ({
    business,
    invoiceId
  }) => {

    if (!business) {

      throw new Error(
        "Business information is required"
      );

    }


    if (!invoiceId) {

      throw new Error(
        "Invoice ID is required"
      );

    }


    const businessId =
      business._id || business;


    const invoice =
      await Invoice.findOne({

        _id:
          invoiceId,

        business:
          businessId

      })
        .populate("customer")
        .populate("sourceQuote");


    if (!invoice) {

      throw new Error(
        "Invoice not found"
      );

    }


    return invoice;

  };


// =====================================================
// GET ALL INVOICES
// =====================================================

const getBusinessInvoices =
  async ({
    business,
    limit = 100
  }) => {

    if (!business) {

      throw new Error(
        "Business information is required"
      );

    }


    const businessId =
      business._id || business;


    const invoices =
      await Invoice.find({

        business:
          businessId

      })
        .populate("customer")
        .populate("sourceQuote")
        .sort({
          createdAt: -1
        })
        .limit(
          Number(limit) || 100
        );


    return invoices;

  };


// =====================================================
// UPDATE INVOICE PAYMENT STATUS
// =====================================================

const updateInvoicePaymentStatus =
  async ({
    business,
    invoiceId,
    paymentStatus
  }) => {

    const allowedStatuses = [

      "unpaid",

      "partially_paid",

      "paid",

      "overdue",

      "cancelled"

    ];


    if (
      !allowedStatuses.includes(
        paymentStatus
      )
    ) {

      throw new Error(
        "Invalid invoice payment status"
      );

    }


    const businessId =
      business._id || business;


    const invoice =
      await Invoice.findOneAndUpdate(

        {

          _id:
            invoiceId,

          business:
            businessId

        },

        {

          paymentStatus

        },

        {

          new:
            true

        }

      );


    if (!invoice) {

      throw new Error(
        "Invoice not found"
      );

    }


    return invoice;

  };


// =====================================================
// EXPORT
// =====================================================

module.exports = {

  calculateOrderTotals,

  generateInvoiceNumber,

  createInvoiceFromOrder,

  createInvoiceFromQuote,

  getInvoiceData,

  getBusinessInvoices,

  updateInvoicePaymentStatus

};