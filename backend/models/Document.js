const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    originalName: {
      type: String,
      required: true
    },

    description: {
      type: String,
      default: "",
      trim: true
    },

    type: {
      type: String,
      default: "Document",
      trim: true
    },

    mimeType: {
      type: String,
      required: true
    },

    size: {
      type: Number,
      default: 0
    },

    fileName: {
      type: String,
      required: true
    },

    filePath: {
      type: String,
      required: true
    },

    fileUrl: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "Document",
  documentSchema
);