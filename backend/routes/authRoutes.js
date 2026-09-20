const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Subscription = require("../models/Subscription");

const router = express.Router();

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const safeUser = (user) => ({
  id: user._id,
  _id: user._id,
  name: user.name,
  email: user.email,
  profilePicture: user.profilePicture || null,
  role: user.role,
  status: user.status || "active",
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

// =====================================================
// REGISTER USER
// =====================================================
router.post("/register", async (req, res) => {
  try {
    const name = String(req.body?.name || "").trim();
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || "");
    // Public registration can never create an administrator account.
    // Admin accounts are provisioned server-side.
    const role = ["customer", "business"].includes(req.body?.role)
      ? req.body.role
      : "customer";

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("AUTH CONFIG ERROR: JWT_SECRET is missing");
      return res.status(500).json({
        success: false,
        message: "Server authentication is not configured correctly",
      });
    }

    const existingUser = await User.findOne({ email }).select("_id");
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: hashedPassword, role });

    const trialStart = new Date();
    const trialEnd = new Date(trialStart);
    trialEnd.setDate(trialEnd.getDate() + 14);

    let subscription;
    try {
      subscription = await Subscription.create({
        user: user._id,
        plan: "free",
        status: "trial",
        price: 0,
        currency: "USD",
        billingCycle: "monthly",
        trialStart,
        trialEnd,
        autoRenew: true,
        paymentProvider: "none",
      });
    } catch (subscriptionError) {
      await User.findByIdAndDelete(user._id);
      throw subscriptionError;
    }

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: safeUser(user),
      subscription: {
        plan: subscription.plan,
        status: subscription.status,
        trialStart: subscription.trialStart,
        trialEnd: subscription.trialEnd,
      },
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Registration failed. Please try again.",
    });
  }
});

// =====================================================
// LOGIN USER
// =====================================================
router.post("/login", async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || "");

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("AUTH CONFIG ERROR: JWT_SECRET is missing");
      return res.status(500).json({
        success: false,
        message: "Server authentication is not configured correctly",
      });
    }

    const user = await User.findOne({ email });

    if (!user || !user.password) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    let passwordMatch = false;
    try {
      passwordMatch = await bcrypt.compare(password, user.password);
    } catch (bcryptError) {
      console.error("PASSWORD VERIFICATION ERROR:", bcryptError.message);
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (user.status === "suspended") {
      return res.status(403).json({
        success: false,
        message: "This account has been suspended. Please contact BusyBiz support.",
      });
    }

    const token = jwt.sign(
      { id: user._id.toString(), role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      message: "Login successful",
      token,
      user: safeUser(user),
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to log in right now. Please try again.",
    });
  }
});

module.exports = router;
