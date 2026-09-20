const mongoose = require("mongoose");


// =====================================================
// INVOICE ITEM SCHEMA
// =====================================================

const invoiceItemSchema =
  new mongoose.Schema(
    {
      product: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
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


// =====================================================
// INVOICE SCHEMA
// =====================================================

const invoiceSchema =
  new mongoose.Schema(
    {
      business: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "Business",
        required: true
      },


      customer: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        default: null
      },


      // Invoice created from a quote
      sourceQuote: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "Quote",
        default: null
      },


      invoiceNumber: {
        type: String,
        required: true
      },


      items: {
        type: [invoiceItemSchema],
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


      dueDate: {
        type: Date,
        default: null
      },


      notes: {
        type: String,
        default: ""
      },


      paymentStatus: {
        type: String,

        enum: [
          "unpaid",
          "partially_paid",
          "paid",
          "overdue",
          "cancelled"
        ],

        default: "unpaid"
      }
    },

    {
      timestamps: true
    }
  );


// =====================================================
// PREVENT DUPLICATE INVOICE NUMBERS
// PER BUSINESS
// =====================================================

invoiceSchema.index(
  {
    business: 1,
    invoiceNumber: 1
  },
  {
    unique: true
  }
);


// =====================================================
// EXPORT
// =====================================================

module.exports =
  mongoose.model(
    "Invoice",
    invoiceSchema
  );