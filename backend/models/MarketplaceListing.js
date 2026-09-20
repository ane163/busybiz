const mongoose = require("mongoose");


// =====================================================
// MARKETPLACE LISTING SCHEMA
// =====================================================

const marketplaceListingSchema = new mongoose.Schema(
  {

    // ===================================================
    // SELLER
    // ===================================================

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },


    // ===================================================
    // BUSINESS
    // ===================================================

    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true
    },


    // ===================================================
    // PRODUCT INFORMATION
    // ===================================================

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000
    },


    // ===================================================
    // PRICE
    // ===================================================

    price: {
      type: Number,
      required: true,
      min: 0
    },

    currency: {
      type: String,
      default: "USD",
      trim: true
    },


    // ===================================================
    // CATEGORY
    // ===================================================

    category: {
      type: String,
      default: "Other",
      trim: true
    },


    // ===================================================
    // CONDITION
    // ===================================================

    condition: {
      type: String,
      enum: [
        "new",
        "used",
        "refurbished"
      ],
      default: "new"
    },


    // ===================================================
    // QUANTITY
    // ===================================================

    quantity: {
      type: Number,
      default: 1,
      min: 0
    },


    // ===================================================
    // LOCATION
    // ===================================================

    location: {
      type: String,
      default: "",
      trim: true
    },


    // ===================================================
    // IMAGES
    // ===================================================

    images: {
      type: [String],
      default: []
    },


    // ===================================================
    // COVER IMAGE
    // ===================================================

    coverImage: {
      type: String,
      default: "",
      trim: true
    },


    // ===================================================
    // CONTACT INFORMATION
    // ===================================================

    contactPhone: {
      type: String,
      default: "",
      trim: true
    },

    contactEmail: {
      type: String,
      default: "",
      trim: true
    },

    contactWhatsApp: {
      type: String,
      default: "",
      trim: true
    },


    // ===================================================
    // LISTING STATUS
    // ===================================================

    status: {
      type: String,
      enum: [
        "active",
        "inactive",
        "sold",
        "expired",
        "removed"
      ],
      default: "active",
      index: true
    },


    // ===================================================
    // APPROVAL
    // ===================================================

    isApproved: {
      type: Boolean,
      default: true
    },

    rejectionReason: {
      type: String,
      default: ""
    },


    // ===================================================
    // ENGAGEMENT
    // ===================================================

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],

    likesCount: {
      type: Number,
      default: 0,
      min: 0
    },

    views: {
      type: Number,
      default: 0,
      min: 0
    },

    inquiriesCount: {
      type: Number,
      default: 0,
      min: 0
    },


    // ===================================================
    // FEATURED LISTING
    // ===================================================

    isFeatured: {
      type: Boolean,
      default: false
    },

    featuredUntil: {
      type: Date,
      default: null
    },


    // ===================================================
    // EXPIRATION
    // ===================================================

    expiresAt: {
      type: Date,
      default: null
    }

  },
  {
    timestamps: true
  }
);


// =====================================================
// INDEXES
// =====================================================

marketplaceListingSchema.index({
  status: 1,
  createdAt: -1
});

marketplaceListingSchema.index({
  business: 1,
  status: 1
});

marketplaceListingSchema.index({
  seller: 1,
  status: 1
});

marketplaceListingSchema.index({
  category: 1,
  status: 1
});

marketplaceListingSchema.index({
  location: 1,
  status: 1
});

marketplaceListingSchema.index({
  price: 1,
  status: 1
});


// =====================================================
// EXPORT
// =====================================================

module.exports =
  mongoose.model(
    "MarketplaceListing",
    marketplaceListingSchema
  );