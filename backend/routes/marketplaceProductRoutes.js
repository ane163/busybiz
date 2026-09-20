const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const protect = require("../middleware/authMiddleware");

const {
  createProduct,
  getProducts,
  getProductById,
  getMyProducts,
  updateProduct,
  toggleProductStatus,
  deleteProduct,
} = require("../controllers/marketplaceProductController");

const router = express.Router();

// =====================================================
// CREATE UPLOAD DIRECTORY
// =====================================================

const uploadDirectory = path.join(
  __dirname,
  "../uploads/marketplace"
);

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true,
  });
}

// =====================================================
// MULTER STORAGE
// =====================================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);

    cb(null, uniqueName);
  },
});

// =====================================================
// FILE FILTER
// =====================================================

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only JPG, JPEG, PNG, WEBP and GIF images are allowed."
      ),
      false
    );
  }
};

// =====================================================
// MULTER UPLOAD
// =====================================================

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 10,
  },
});

// =====================================================
// CREATE LISTING
// POST /api/marketplace/products
// =====================================================

router.post(
  "/",
  protect,
  upload.array("images", 10),
  createProduct
);

// =====================================================
// GET ALL ACTIVE LISTINGS
// GET /api/marketplace/products
// =====================================================

router.get(
  "/",
  getProducts
);

// =====================================================
// GET MY LISTINGS
// GET /api/marketplace/products/my-listings
// =====================================================

router.get(
  "/my-listings",
  protect,
  getMyProducts
);

// =====================================================
// GET SINGLE LISTING
// GET /api/marketplace/products/:id
// =====================================================

router.get(
  "/:id",
  getProductById
);

// =====================================================
// UPDATE LISTING
// PUT /api/marketplace/products/:id
// =====================================================

router.put(
  "/:id",
  protect,
  upload.array("images", 10),
  updateProduct
);

// =====================================================
// PAUSE / ACTIVATE LISTING
// PATCH /api/marketplace/products/:id/status
// =====================================================

router.patch(
  "/:id/status",
  protect,
  toggleProductStatus
);

// =====================================================
// DELETE LISTING
// DELETE /api/marketplace/products/:id
// =====================================================

router.delete(
  "/:id",
  protect,
  deleteProduct
);

// =====================================================
// MULTER ERROR HANDLER
// =====================================================

router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "Each image must be 5MB or smaller.",
      });
    }

    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "You can upload a maximum of 10 images.",
      });
    }

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  next();
});

module.exports = router;