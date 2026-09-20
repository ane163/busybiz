const bcrypt = require("bcryptjs");
const User = require("../models/User");

async function ensureAdmin() {
  const email = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const password = String(process.env.ADMIN_PASSWORD || "");

  if (!email || !password) {
    console.warn("ADMIN_EMAIL / ADMIN_PASSWORD not configured; admin bootstrap skipped.");
    return;
  }

  if (password.length < 8) {
    console.warn("ADMIN_PASSWORD must be at least 8 characters; admin bootstrap skipped.");
    return;
  }

  const existingAdmin = await User.findOne({ role: "admin" });
  if (existingAdmin) return;

  const existing = await User.findOne({ email });

  if (existing) {
    existing.role = "admin";
    existing.status = "active";
    await existing.save();
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  await User.create({
    name: "BusyBiz Administrator",
    email,
    password: hashedPassword,
    role: "admin",
    status: "active",
  });

  console.log(`BusyBiz administrator provisioned: ${email}`);
}

module.exports = ensureAdmin;
