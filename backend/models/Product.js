const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    // =====================================================
    // BUSINESS
    // =====================================================

    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true
    },

    // =====================================================
    // PRODUCT INFORMATION
    // =====================================================

    name: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      default: "",
      trim: true
    },

    // =====================================================
    // PRICING
    // =====================================================

    price: {
      type: Number,
      required: true,
      min: 0
    },

    // What the business pays to acquire/make the product
    costPrice: {
      type: Number,
      default: 0,
      min: 0
    },

    // =====================================================
    // PRODUCT DETAILS
    // =====================================================

    category: {
      type: String,
      default: "",
      trim: true
    },

    image: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);


// =====================================================
// INDEXES
// =====================================================

productSchema.index({
  business: 1,
  createdAt: -1
});

productSchema.index({
  business: 1,
  category: 1
});


module.exports =
  mongoose.model(
    "Product",
    productSchema
  );