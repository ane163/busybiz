const mongoose = require("mongoose");

const quoteItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null
    },

    name: {
      type: String,
      required: true
    },

    price: {
      type: Number,
      required: true,
      min: 0
    },

    quantity: {
      type: Number,
      required: true,
      min: 1
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0
    }
  },
  {
    _id: false
  }
);


const quoteSchema = new mongoose.Schema(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      default: null
    },

    quoteNumber: {
      type: String,
      required: true
    },

    items: {
      type: [quoteItemSchema],
      required: true
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0
    },

    total: {
      type: Number,
      required: true,
      min: 0
    },

    expiryDate: {
      type: Date,
      default: null
    },

    notes: {
      type: String,
      default: ""
    },

    status: {
      type: String,
      enum: [
        "draft",
        "sent",
        "accepted",
        "rejected",
        "expired"
      ],
      default: "draft"
    }
  },
  {
    timestamps: true
  }
);


module.exports = mongoose.model(
  "Quote",
  quoteSchema
);