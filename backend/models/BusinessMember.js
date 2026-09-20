const mongoose = require("mongoose");

const businessMemberSchema = new mongoose.Schema(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    role: {
      type: String,
      enum: [
        "owner",
        "admin",
        "manager",
        "employee"
      ],
      default: "employee"
    },

    status: {
      type: String,
      enum: [
        "active",
        "pending",
        "suspended"
      ],
      default: "active"
    }
  },
  {
    timestamps: true
  }
);


// A user can only have one membership
// in the same business
businessMemberSchema.index(
  {
    business: 1,
    user: 1
  },
  {
    unique: true
  }
);


module.exports = mongoose.model(
  "BusinessMember",
  businessMemberSchema
);