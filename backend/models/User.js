const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // =====================================================
    // USER NAME
    // =====================================================

    name: {
      type: String,
      required: true,
      trim: true,
    },

    // =====================================================
    // EMAIL
    // =====================================================

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    // =====================================================
    // PROFILE PICTURE
    // =====================================================

    profilePicture: {
      type: String,
      default: null,
    },

    // =====================================================
    // PASSWORD
    // =====================================================

    password: {
      type: String,
      required: true,
    },

    // =====================================================
    // USER ROLE
    // =====================================================

    role: {
      type: String,
      enum: ["customer", "business", "admin"],
      default: "customer",
    },

    // Account status is controlled by administrators.
    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);