const mongoose = require("mongoose");


// =====================================================
// ORDER ITEM SCHEMA
// =====================================================

const orderItemSchema = new mongoose.Schema(
  {
    // ===================================================
    // PRODUCT
    // ===================================================

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },


    // ===================================================
    // PRODUCT NAME SNAPSHOT
    // ===================================================

    name: {
      type: String,
      required: true,
      trim: true
    },


    // ===================================================
    // SELLING PRICE SNAPSHOT
    // ===================================================

    price: {
      type: Number,
      required: true,
      min: 0
    },


    // ===================================================
    // COST PRICE / COGS SNAPSHOT
    // ===================================================

    /*
      This stores what the business paid for the product
      at the time the order was created.

      Example:

      Selling price = $20
      Cost price    = $12
      Quantity      = 2

      Revenue = $40
      COGS    = $24
      Gross Profit = $16
    */

    costPrice: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },


    // ===================================================
    // QUANTITY
    // ===================================================

    quantity: {
      type: Number,
      required: true,
      min: 1
    },


    // ===================================================
    // SUBTOTAL
    // ===================================================

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


// =====================================================
// ORDER SCHEMA
// =====================================================

const orderSchema = new mongoose.Schema(
  {
    // ===================================================
    // BUSINESS
    // ===================================================

    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true
    },


    // ===================================================
    // CUSTOMER
    // ===================================================

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      default: null
    },


    // ===================================================
    // PRODUCTS
    // ===================================================

    items: {
      type: [orderItemSchema],
      required: true,

      validate: {
        validator: (items) =>
          Array.isArray(items) &&
          items.length > 0,

        message:
          "An order must contain at least one product"
      }
    },


    // ===================================================
    // TOTAL
    // ===================================================

    total: {
      type: Number,
      required: true,
      min: 0
    },


    // ===================================================
    // PAYMENT METHOD
    // ===================================================

    paymentMethod: {
      type: String,

      enum: [
        "cash",
        "ecocash",
        "card",
        "bank",
        "other"
      ],

      default: "cash"
    },


    // ===================================================
    // PAYMENT STATUS
    // ===================================================

    paymentStatus: {
      type: String,

      enum: [
        "pending",
        "paid",
        "cancelled"
      ],

      default: "paid"
    },


    // ===================================================
    // ORDER STATUS
    // ===================================================

    status: {
      type: String,

      enum: [
        "completed",
        "pending",
        "cancelled"
      ],

      default: "completed"
    },


    // ===================================================
    // CANCELLATION INFORMATION
    // ===================================================

    cancelledAt: {
      type: Date,
      default: null
    },


    cancellationReason: {
      type: String,
      default: "",
      trim: true
    },


    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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

orderSchema.index({
  business: 1,
  createdAt: -1
});


orderSchema.index({
  business: 1,
  status: 1
});


orderSchema.index({
  business: 1,
  customer: 1
});


// =====================================================
// EXPORT
// =====================================================

module.exports =
  mongoose.model(
    "Order",
    orderSchema
  );