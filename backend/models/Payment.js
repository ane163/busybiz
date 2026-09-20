const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    // =====================================================
    // USER
    // =====================================================

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // =====================================================
    // SUBSCRIPTION
    // =====================================================

    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
      required: true
    },

    // =====================================================
    // PLAN
    // =====================================================

    plan: {
      type: String,
      enum: [
        "free",
        "starter",
        "professional"
      ],
      required: true
    },

    // =====================================================
    // PAYMENT AMOUNT
    // =====================================================

    amount: {
      type: Number,
      required: true,
      min: 0
    },

    currency: {
      type: String,
      default: "USD"
    },

    billingCycle: {
      type: String,
      enum: [
        "monthly",
        "yearly"
      ],
      default: "monthly"
    },

    // =====================================================
    // PAYMENT STATUS
    // =====================================================

    status: {
      type: String,
      enum: [
        "pending",
        "paid",
        "failed",
        "refunded",
        "cancelled"
      ],
      default: "pending"
    },

    // =====================================================
    // PAYMENT PROVIDER
    // =====================================================

    provider: {
      type: String,
      enum: [
        "none",
        "paynow",
        "stripe",
        "manual"
      ],
      default: "none"
    },

    // =====================================================
    // PROVIDER INFORMATION
    // =====================================================

    transactionId: {
      type: String,
      default: null
    },

    providerTransactionId: {
      type: String,
      default: null
    },

    providerCustomerId: {
      type: String,
      default: null
    },

    // =====================================================
    // PAYMENT DATES
    // =====================================================

    paymentDate: {
      type: Date,
      default: null
    },

    failureReason: {
      type: String,
      default: ""
    },

    invoice: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Invoice",
  default: null
},
    // =====================================================
    // DESCRIPTION
    // =====================================================

    description: {
      type: String,
      default: ""
    }
  },

  {
    timestamps: true
  }
);

module.exports =
  mongoose.model(
    "Payment",
    paymentSchema
  );