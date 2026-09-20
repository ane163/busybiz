const mongoose = require("mongoose");

const inventoryTransactionSchema = new mongoose.Schema(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true
    },

    type: {
      type: String,
      enum: [
        "stock_in",
        "stock_out",
        "adjustment",
        "sale",
        "return"
      ],
      required: true
    },

    quantity: {
      type: Number,
      required: true
    },

    previousQuantity: {
      type: Number,
      required: true,
      min: 0
    },

    newQuantity: {
      type: Number,
      required: true,
      min: 0
    },

    reason: {
      type: String,
      default: "",
      trim: true
    },

    reference: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },

    referenceType: {
      type: String,
      enum: [
        "Order",
        "Product",
        "Manual",
        null
      ],
      default: null
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    }
  },
  {
    timestamps: true
  }
);

inventoryTransactionSchema.index({
  business: 1,
  product: 1,
  createdAt: -1
});

module.exports = mongoose.model(
  "InventoryTransaction",
  inventoryTransactionSchema
);