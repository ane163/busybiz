const mongoose = require("mongoose");

const businessSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    businessName: {
      type: String,
      required: true
    },

    category: {
      type: String,
      required: true
    },

    description: {
      type: String,
      required: true
    },

    phone: {
      type: String,
      required: true
    },

    location: {
      type: String,
      required: true
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


module.exports = mongoose.model("Business", businessSchema);