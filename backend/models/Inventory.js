const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },

    quantity: {
      type: Number,
      default: 0,
      min: 0
    },

    lowStockLimit: {
      type: Number,
      default: 5,
      min: 0
    }
  },
  {
    timestamps: true
  }
);

inventorySchema.index(
  { business: 1, product: 1 },
  { unique: true }
);

module.exports = mongoose.model("Inventory", inventorySchema);