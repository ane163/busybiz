const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    // =====================================================
    // GET AUTHORIZATION HEADER
    // =====================================================

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "No authentication token provided"
      });
    }

    // =====================================================
    // CHECK BEARER FORMAT
    // =====================================================

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Invalid authorization format"
      });
    }

    // =====================================================
    // GET TOKEN
    // =====================================================

    const token = authHeader.substring(7).trim();

    if (!token) {
      return res.status(401).json({
        message: "Authentication token is missing"
      });
    }

    // =====================================================
    // CHECK JWT SECRET
    // =====================================================

    if (!process.env.JWT_SECRET) {
      console.error(
        "AUTH ERROR: JWT_SECRET is not configured"
      );

      return res.status(500).json({
        message: "Server authentication configuration error"
      });
    }

    // =====================================================
    // VERIFY TOKEN
    // =====================================================

    let decoded;

    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );
    } catch (jwtError) {
      console.error(
        "JWT VERIFY ERROR:",
        jwtError.message
      );

      return res.status(401).json({
        message: "Invalid token"
      });
    }

    // =====================================================
    // CHECK USER ID
    // =====================================================

    if (!decoded || !decoded.id) {
      return res.status(401).json({
        message: "Invalid token payload"
      });
    }

    // =====================================================
    // FIND USER
    // =====================================================

    const user = await User.findById(
      decoded.id
    ).select("-password");

    if (!user) {
      return res.status(401).json({
        message: "User associated with token not found"
      });
    }

    // =====================================================
    // ATTACH USER TO REQUEST
    // =====================================================

    req.user = user;

    // =====================================================
    // CONTINUE
    // =====================================================

    next();

  } catch (error) {

    console.error(
      "AUTH MIDDLEWARE ERROR:",
      error
    );

    return res.status(500).json({
      message: "Authentication error"
    });
  }
};

module.exports = protect;