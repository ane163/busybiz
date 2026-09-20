const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema(
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
    // SUPPLIER INFORMATION
    // =====================================================

    name: {
      type: String,
      required: true,
      trim: true
    },

    companyName: {
      type: String,
      default: "",
      trim: true
    },

    contactPerson: {
      type: String,
      default: "",
      trim: true
    },

    // =====================================================
    // CONTACT
    // =====================================================

    phone: {
      type: String,
      default: "",
      trim: true
    },

    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true
    },

    address: {
      type: String,
      default: "",
      trim: true
    },

    // =====================================================
    // ADDITIONAL INFORMATION
    // =====================================================

    notes: {
      type: String,
      default: "",
      trim: true
    },

    // =====================================================
    // STATUS
    // =====================================================

    status: {
      type: String,
      enum: [
        "active",
        "inactive"
      ],
      default: "active"
    }
  },
  {
    timestamps: true
  }
);


// =====================================================
// INDEXES
// =====================================================

supplierSchema.index({
  business: 1,
  createdAt: -1
});

supplierSchema.index({
  business: 1,
  name: 1
});

supplierSchema.index({
  business: 1,
  status: 1
});


// =====================================================
// EXPORT
// =====================================================

module.exports =
  mongoose.model(
    "Supplier",
    supplierSchema
  );