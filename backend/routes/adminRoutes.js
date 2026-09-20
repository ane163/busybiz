const express = require("express");
const bcrypt = require("bcryptjs");

const adminOnly = require("../middleware/adminMiddleware");
const User = require("../models/User");
const Business = require("../models/Business");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Invoice = require("../models/Invoice");
const Expense = require("../models/Expense");
const Subscription = require("../models/Subscription");

const router = express.Router();
router.use(adminOnly);

const safeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  status: user.status || "active",
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

router.get("/overview", async (req, res) => {
  try {
    const [
      users, businesses, products, orders, invoices, expenses,
      subscriptions, paidOrders, recentUsers, recentBusinesses
    ] = await Promise.all([
      User.countDocuments(),
      Business.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      Invoice.countDocuments(),
      Expense.countDocuments(),
      Subscription.countDocuments(),
      Order.aggregate([
        { $match: { paymentStatus: "paid", status: { $ne: "cancelled" } } },
        { $group: { _id: null, total: { $sum: "$total" } } }
      ]),
      User.find().select("-password").sort({ createdAt: -1 }).limit(8),
      Business.find().sort({ createdAt: -1 }).limit(8).populate("owner", "name email")
    ]);

    const [expenseTotal] = await Expense.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const [subscriptionRevenue] = await Subscription.aggregate([
      { $match: { status: { $in: ["active", "trial"] } } },
      { $group: { _id: null, monthlyValue: { $sum: "$price" } } }
    ]);

    res.json({
      success: true,
      stats: {
        users, businesses, products, orders, invoices, expenses, subscriptions,
        grossSales: paidOrders[0]?.total || 0,
        totalExpenses: expenseTotal?.total || 0,
        subscriptionValue: subscriptionRevenue?.monthlyValue || 0,
      },
      recentUsers: recentUsers.map(safeUser),
      recentBusinesses,
    });
  } catch (error) {
    console.error("ADMIN OVERVIEW ERROR:", error);
    res.status(500).json({ success: false, message: "Unable to load admin overview" });
  }
});

router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json({ success: true, users: users.map(safeUser) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Unable to load users" });
  }
});

router.patch("/users/:id/status", async (req, res) => {
  try {
    if (String(req.user._id) === String(req.params.id)) {
      return res.status(400).json({ success: false, message: "You cannot suspend your own admin account." });
    }
    const status = req.body?.status;
    if (!["active", "suspended"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid account status." });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, user: safeUser(user) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Unable to update user status" });
  }
});

router.patch("/users/:id/role", async (req, res) => {
  try {
    if (String(req.user._id) === String(req.params.id)) {
      return res.status(400).json({ success: false, message: "You cannot change your own admin role." });
    }
    const role = req.body?.role;
    if (!["customer", "business", "admin"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role." });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, user: safeUser(user) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Unable to update user role" });
  }
});

router.get("/businesses", async (req, res) => {
  try {
    const businesses = await Business.find()
      .sort({ createdAt: -1 })
      .populate("owner", "name email");
    res.json({ success: true, businesses });
  } catch (error) {
    res.status(500).json({ success: false, message: "Unable to load businesses" });
  }
});

router.get("/subscriptions", async (req, res) => {
  try {
    const subscriptions = await Subscription.find()
      .sort({ createdAt: -1 })
      .populate("user", "name email");
    res.json({ success: true, subscriptions });
  } catch (error) {
    res.status(500).json({ success: false, message: "Unable to load subscriptions" });
  }
});

router.patch("/subscriptions/:id", async (req, res) => {
  try {
    const allowed = ["free", "starter", "professional"];
    const statuses = ["trial", "active", "past_due", "expired", "cancelled"];
    const update = {};
    if (allowed.includes(req.body?.plan)) update.plan = req.body.plan;
    if (statuses.includes(req.body?.status)) update.status = req.body.status;
    if (req.body?.price !== undefined && Number.isFinite(Number(req.body.price))) update.price = Number(req.body.price);
    if (!Object.keys(update).length) {
      return res.status(400).json({ success: false, message: "No valid subscription changes supplied." });
    }
    const subscription = await Subscription.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate("user", "name email");
    if (!subscription) return res.status(404).json({ success: false, message: "Subscription not found" });
    res.json({ success: true, subscription });
  } catch (error) {
    res.status(500).json({ success: false, message: "Unable to update subscription" });
  }
});

router.put("/credentials", async (req, res) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const currentPassword = String(req.body?.currentPassword || "");
    const newPassword = String(req.body?.newPassword || "");

    const admin = await User.findById(req.user._id);
    if (!admin) return res.status(404).json({ success: false, message: "Admin account not found" });

    if (!currentPassword || !(await bcrypt.compare(currentPassword, admin.password))) {
      return res.status(401).json({ success: false, message: "Current password is incorrect." });
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: "Enter a valid admin email." });
    }
    if (newPassword && newPassword.length < 8) {
      return res.status(400).json({ success: false, message: "New password must be at least 8 characters." });
    }

    if (email && email !== admin.email) {
      const exists = await User.findOne({ email, _id: { $ne: admin._id } });
      if (exists) return res.status(409).json({ success: false, message: "That email is already in use." });
      admin.email = email;
    }
    if (newPassword) admin.password = await bcrypt.hash(newPassword, 12);
    await admin.save();

    res.json({
      success: true,
      message: "Admin credentials updated. Please log in again.",
      user: safeUser(admin),
    });
  } catch (error) {
    console.error("ADMIN CREDENTIAL ERROR:", error);
    res.status(500).json({ success: false, message: "Unable to update admin credentials" });
  }
});

module.exports = router;
