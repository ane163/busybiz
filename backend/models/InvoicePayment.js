const mongoose = require("mongoose");


// =====================================================
// INVOICE PAYMENT SCHEMA
// =====================================================

const invoicePaymentSchema = new mongoose.Schema(
  {
    // ===================================================
    // BUSINESS
    // ===================================================

    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true
    },


    // ===================================================
    // INVOICE
    // ===================================================

    invoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
      required: true
    },


    // ===================================================
    // CUSTOMER
    // ===================================================

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      default: null
    },


    // ===================================================
    // AMOUNT
    // ===================================================

    amount: {
      type: Number,
      required: true,
      min: 0
    },


    // ===================================================
    // PAYMENT METHOD
    // ===================================================

    paymentMethod: {
      type: String,
      enum: [
        "cash",
        "ecocash",
        "card",
        "bank",
        "other"
      ],
      default: "cash"
    },


    // ===================================================
    // PAYMENT STATUS
    // ===================================================

    status: {
      type: String,
      enum: [
        "completed",
        "pending",
        "failed",
        "refunded",
        "cancelled"
      ],
      default: "completed"
    },


    // ===================================================
    // TRANSACTION REFERENCE
    // ===================================================

    transactionReference: {
      type: String,
      default: ""
    },


    // ===================================================
    // PAYMENT DATE
    // ===================================================

    paymentDate: {
      type: Date,
      default: Date.now
    },


    // ===================================================
    // NOTES
    // ===================================================

    notes: {
      type: String,
      default: "",
      trim: true
    }
  },
  {
    timestamps: true
  }
);


// =====================================================
// INDEXES
// =====================================================

invoicePaymentSchema.index({
  business: 1,
  invoice: 1,
  createdAt: -1
});

invoicePaymentSchema.index({
  business: 1,
  paymentDate: -1
});

invoicePaymentSchema.index({
  business: 1,
  customer: 1
});


// =====================================================
// EXPORT
// =====================================================

module.exports =
  mongoose.model(
    "InvoicePayment",
    invoicePaymentSchema
  );