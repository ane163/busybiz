const mongoose = require("mongoose");

const businessSettingsSchema = new mongoose.Schema(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      unique: true,
    },

    currency: {
      type: String,
      default: "USD",
      trim: true,
    },

    taxEnabled: {
      type: Boolean,
      default: false,
    },

    taxRate: {
      type: Number,
      default: 0,
      min: 0,
    },

    invoicePrefix: {
      type: String,
      default: "INV-",
      trim: true,
    },

    receiptPrefix: {
      type: String,
      default: "REC-",
      trim: true,
    },

    quotePrefix: {
      type: String,
      default: "QUO-",
      trim: true,
    },

    lowStockNotifications: {
      type: Boolean,
      default: true,
    },

    orderNotifications: {
      type: Boolean,
      default: true,
    },

    invoiceNotifications: {
      type: Boolean,
      default: true,
    },

    paymentNotifications: {
      type: Boolean,
      default: true,
    },

    teamNotifications: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "BusinessSettings",
  businessSettingsSchema
);