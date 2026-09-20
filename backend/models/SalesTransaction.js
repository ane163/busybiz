const mongoose = require("mongoose");

const salesTransactionSchema = new mongoose.Schema(
  {
    // =====================================================
    // BUSINESS
    // =====================================================

    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true
    },

    // =====================================================
    // ORDER
    // =====================================================

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true
    },

    // =====================================================
    // CUSTOMER
    // =====================================================

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      default: null
    },

    // =====================================================
    // TRANSACTION TYPE
    // =====================================================

    type: {
      type: String,
      enum: [
        "sale",
        "refund"
      ],
      default: "sale"
    },

    // =====================================================
    // AMOUNT
    // =====================================================

    amount: {
      type: Number,
      required: true,
      min: 0
    },

    // =====================================================
    // PAYMENT METHOD
    // =====================================================

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

    // =====================================================
    // PAYMENT STATUS
    // =====================================================

    status: {
      type: String,
      enum: [
        "pending",
        "paid",
        "cancelled",
        "refunded"
      ],
      default: "paid"
    },

    // =====================================================
    // DESCRIPTION
    // =====================================================

    description: {
      type: String,
      default: ""
    },

    // =====================================================
    // TRANSACTION DATE
    // =====================================================

    transactionDate: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true
  }
);


// =====================================================
// INDEXES
// =====================================================

salesTransactionSchema.index({
  business: 1,
  transactionDate: -1
});

salesTransactionSchema.index({
  business: 1,
  status: 1
});


module.exports =
  mongoose.model(
    "SalesTransaction",
    salesTransactionSchema
  );