const mongoose = require("mongoose");


// =====================================================
// MESSAGE SCHEMA
// =====================================================

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000
    },

    read: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);


// =====================================================
// CHAT SCHEMA
// =====================================================

const chatSchema = new mongoose.Schema(
  {
    // Marketplace listing being discussed
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MarketplaceListing",
      required: true
    },


    // Buyer + seller
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      }
    ],


    // Messages
    messages: [
      messageSchema
    ]
  },
  {
    timestamps: true
  }
);


// =====================================================
// INDEXES
// =====================================================

// Makes finding a user's chats faster
chatSchema.index({
  participants: 1,
  updatedAt: -1
});


// Makes finding a conversation for a listing faster
chatSchema.index({
  listing: 1,
  participants: 1
});


// =====================================================
// MODEL
// =====================================================

module.exports =
  mongoose.model(
    "Chat",
    chatSchema
  );