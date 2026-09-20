const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    // =====================================================
    // BUSINESS
    // ==============a=======================================

    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true
    },

    // =====================================================
    // CUSTOMER INFORMATION
    // =====================================================

    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: ""
    },

    phone: {
      type: String,
      trim: true,
      default: ""
    },

    address: {
      type: String,
      trim: true,
      default: ""
    },

    // =====================================================
    // CUSTOMER STATUS
    // =====================================================

    status: {
      type: String,
      enum: [
        "active",
        "inactive",
        "blocked"
      ],
      default: "active",
      index: true
    },

    // =====================================================
    // FINANCIAL INFORMATION
    // =====================================================

    totalOrders: {
      type: Number,
      default: 0,
      min: 0
    },

    totalSpent: {
      type: Number,
      default: 0,
      min: 0
    },

    // =====================================================
    // NOTES
    // =====================================================

    notes: {
      type: String,
      trim: true,
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

customerSchema.index({
  business: 1,
  name: 1
});

customerSchema.index({
  business: 1,
  email: 1
});

customerSchema.index({
  business: 1,
  phone: 1
});


// =====================================================
// EXPORT
// =====================================================

module.exports = mongoose.model(
  "Customer",
  customerSchema
);