const protect = require("./authMiddleware");

const adminOnly = async (req, res, next) => {
  await protect(req, res, () => {
    if (req.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Administrator access required",
      });
    }
    next();
  });
};

module.exports = adminOnly;
