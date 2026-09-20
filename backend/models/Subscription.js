const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    // =====================================================
    // USER
    // =====================================================

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
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
      default: "free"
    },

    // =====================================================
    // STATUS
    // =====================================================

    status: {
      type: String,
      enum: [
        "trial",
        "active",
        "past_due",
        "expired",
        "cancelled"
      ],
      default: "trial"
    },

    // =====================================================
    // PRICING
    // =====================================================

    price: {
      type: Number,
      default: 0
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
    // TRIAL
    // =====================================================

    trialStart: {
      type: Date,
      default: Date.now
    },

    trialEnd: {
      type: Date
    },

    // =====================================================
    // BILLING PERIOD
    // =====================================================

    startDate: {
      type: Date
    },

    endDate: {
      type: Date
    },

    nextBillingDate: {
      type: Date
    },

    // =====================================================
    // AUTO RENEWAL
    // =====================================================

    autoRenew: {
      type: Boolean,
      default: true
    },

    cancelAtPeriodEnd: {
      type: Boolean,
      default: false
    },

    cancelledAt: {
      type: Date,
      default: null
    },

    cancellationReason: {
      type: String,
      default: ""
    },

    // =====================================================
    // BILLING INFORMATION
    // =====================================================

    billingName: {
      type: String,
      default: ""
    },

    billingEmail: {
      type: String,
      default: ""
    },

    // =====================================================
    // PAYMENT PROVIDER
    // =====================================================

    paymentProvider: {
      type: String,
      enum: [
        "none",
        "paynow",
        "stripe",
        "manual"
      ],
      default: "none"
    },

    providerCustomerId: {
      type: String,
      default: null
    },

    providerSubscriptionId: {
      type: String,
      default: null
    },

    providerPriceId: {
      type: String,
      default: null
    },

    // =====================================================
    // LAST PAYMENT
    // =====================================================

    lastPaymentId: {
      type: String,
      default: null
    },

    lastPaymentDate: {
      type: Date,
      default: null
    },

    lastPaymentStatus: {
      type: String,
      enum: [
        "none",
        "pending",
        "paid",
        "failed"
      ],
      default: "none"
    },

    paymentFailureReason: {
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
    "Subscription",
    subscriptionSchema
  );