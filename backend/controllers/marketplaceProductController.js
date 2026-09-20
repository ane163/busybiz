const MarketplaceProduct = require("../models/MarketplaceProduct");

// =====================================================
// CREATE MARKETPLACE PRODUCT
// =====================================================
const createProduct = async (req, res) => {
  try {
    const {
      name,
      category,
      description,
      price,
      quantity,
      location,
    } = req.body;

    // Validate required fields
    if (
      !name ||
      !category ||
      !description ||
      price === undefined ||
      quantity === undefined ||
      !location
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields.",
      });
    }

    // Make sure the user is authenticated
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    // Get uploaded image paths
    const images = req.files
      ? req.files.map((file) => `/uploads/marketplace/${file.filename}`)
      : [];

    const product = await MarketplaceProduct.create({
      seller: req.user._id,
      name: name.trim(),
      category: category.trim(),
      description: description.trim(),
      price: Number(price),
      quantity: Number(quantity),
      location: location.trim(),
      images,
    });

    const populatedProduct = await MarketplaceProduct.findById(
      product._id
    ).populate("seller", "name email profilePicture");

    return res.status(201).json({
      success: true,
      message: "Marketplace listing created successfully.",
      product: populatedProduct,
    });
  } catch (error) {
    console.error("Create marketplace product error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create marketplace listing.",
      error: error.message,
    });
  }
};

// =====================================================
// GET ALL MARKETPLACE PRODUCTS
// =====================================================
const getProducts = async (req, res) => {
  try {
    const products = await MarketplaceProduct.find({
      status: "active",
    })
      .populate("seller", "name email profilePicture")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Get marketplace products error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch marketplace listings.",
      error: error.message,
    });
  }
};

// =====================================================
// GET SINGLE MARKETPLACE PRODUCT
// =====================================================
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await MarketplaceProduct.findById(id).populate(
      "seller",
      "name email profilePicture"
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Marketplace listing not found.",
      });
    }

    // Increase product views
    product.views += 1;
    await product.save();

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Get marketplace product error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch marketplace listing.",
      error: error.message,
    });
  }
};

// =====================================================
// GET SELLER'S PRODUCTS
// =====================================================
const getMyProducts = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const products = await MarketplaceProduct.find({
      seller: req.user._id,
      status: { $ne: "deleted" },
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Get my marketplace products error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch your listings.",
      error: error.message,
    });
  }
};

// =====================================================
// UPDATE MARKETPLACE PRODUCT
// =====================================================
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const product = await MarketplaceProduct.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Marketplace listing not found.",
      });
    }

    // Only the seller who created the listing can update it
    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to update this listing.",
      });
    }

    const {
      name,
      category,
      description,
      price,
      quantity,
      location,
      status,
    } = req.body;

    if (name !== undefined) product.name = name.trim();
    if (category !== undefined) product.category = category.trim();
    if (description !== undefined) {
      product.description = description.trim();
    }
    if (price !== undefined) product.price = Number(price);
    if (quantity !== undefined) product.quantity = Number(quantity);
    if (location !== undefined) product.location = location.trim();

    if (
      status !== undefined &&
      ["active", "paused", "sold"].includes(status)
    ) {
      product.status = status;
    }

    // Add newly uploaded images if provided
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(
        (file) => `/uploads/marketplace/${file.filename}`
      );

      product.images = [...product.images, ...newImages];
    }

    await product.save();

    const updatedProduct = await MarketplaceProduct.findById(
      product._id
    ).populate("seller", "name email profilePicture");

    return res.status(200).json({
      success: true,
      message: "Marketplace listing updated successfully.",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Update marketplace product error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update marketplace listing.",
      error: error.message,
    });
  }
};

// =====================================================
// PAUSE / ACTIVATE PRODUCT
// =====================================================
const toggleProductStatus = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const product = await MarketplaceProduct.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Marketplace listing not found.",
      });
    }

    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to change this listing.",
      });
    }

    if (product.status === "active") {
      product.status = "paused";
    } else if (product.status === "paused") {
      product.status = "active";
    }

    await product.save();

    return res.status(200).json({
      success: true,
      message: `Listing ${product.status === "active" ? "activated" : "paused"} successfully.`,
      product,
    });
  } catch (error) {
    console.error("Toggle marketplace product status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to change listing status.",
      error: error.message,
    });
  }
};

// =====================================================
// DELETE MARKETPLACE PRODUCT
// =====================================================
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const product = await MarketplaceProduct.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Marketplace listing not found.",
      });
    }

    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to delete this listing.",
      });
    }

    // Soft delete
    product.status = "deleted";

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Marketplace listing deleted successfully.",
    });
  } catch (error) {
    console.error("Delete marketplace product error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete marketplace listing.",
      error: error.message,
    });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  getMyProducts,
  updateProduct,
  toggleProductStatus,
  deleteProduct,
};