const express = require("express");

const Inventory = require("../models/Inventory");
const Product = require("../models/Product");

const protect =
  require("../middleware/authMiddleware");

const {
  businessAccess,
  requireRole
} = require(
  "../middleware/businessAccessMiddleware"
);

const {
  createLowStockNotification
} = require(
  "../services/notificationService"
);

const router = express.Router();


// =====================================================
// GET ALL INVENTORY
// =====================================================

router.get(
  "/",
  protect,
  businessAccess,
  async (req, res) => {

    try {

      const inventory =
        await Inventory.find({
          business:
            req.business._id
        })
          .populate("product")
          .sort({
            createdAt: -1
          });

      res.status(200).json(
        inventory
      );

    } catch (error) {

      console.error(
        "GET INVENTORY ERROR:",
        error
      );

      res.status(500).json({

        message:
          error.message ||
          "Unable to load inventory"

      });

    }

  }
);


// =====================================================
// CREATE MISSING INVENTORY RECORDS
// =====================================================
// This creates inventory records for existing products
// that were created before automatic inventory creation
// was added to the product route.
// =====================================================

router.post(
  "/create-missing",
  protect,
  businessAccess,
  requireRole(
    "owner",
    "admin",
    "manager"
  ),
  async (req, res) => {

    try {

      const products =
        await Product.find({
          business:
            req.business._id
        });


      let created = 0;


      for (
        const product of products
      ) {

        const existingInventory =
          await Inventory.findOne({

            business:
              req.business._id,

            product:
              product._id

          });


        if (!existingInventory) {

          await Inventory.create({

            business:
              req.business._id,

            product:
              product._id,

            quantity:
              0,

            lowStockLimit:
              5

          });

          created++;

        }

      }


      res.status(200).json({

        message:
          created === 0
            ? "All products already have inventory records."
            : `${created} missing inventory record${created === 1 ? "" : "s"} created successfully.`,

        created

      });

    } catch (error) {

      console.error(
        "CREATE MISSING INVENTORY ERROR:",
        error
      );

      res.status(500).json({

        message:
          error.message ||
          "Unable to create missing inventory records"

      });

    }

  }
);


// =====================================================
// GET LOW STOCK PRODUCTS
// =====================================================

router.get(
  "/low-stock",
  protect,
  businessAccess,
  async (req, res) => {

    try {

      const inventory =
        await Inventory.find({
          business:
            req.business._id
        })
          .populate("product")
          .sort({
            quantity: 1
          });


      const lowStock =
        inventory.filter(
          (item) =>
            Number(item.quantity) <=
            Number(item.lowStockLimit)
        );


      res.status(200).json(
        lowStock
      );

    } catch (error) {

      console.error(
        "GET LOW STOCK ERROR:",
        error
      );

      res.status(500).json({

        message:
          error.message ||
          "Unable to load low stock products"

      });

    }

  }
);


// =====================================================
// GET OUT OF STOCK PRODUCTS
// =====================================================

router.get(
  "/out-of-stock",
  protect,
  businessAccess,
  async (req, res) => {

    try {

      const inventory =
        await Inventory.find({

          business:
            req.business._id,

          quantity:
            0

        })
          .populate("product")
          .sort({
            updatedAt: -1
          });


      res.status(200).json(
        inventory
      );

    } catch (error) {

      console.error(
        "GET OUT OF STOCK ERROR:",
        error
      );

      res.status(500).json({

        message:
          error.message ||
          "Unable to load out of stock products"

      });

    }

  }
);


// =====================================================
// GET INVENTORY SUMMARY
// =====================================================

router.get(
  "/summary",
  protect,
  businessAccess,
  async (req, res) => {

    try {

      const inventory =
        await Inventory.find({
          business:
            req.business._id
        });


      let totalProducts =
        inventory.length;

      let totalUnits = 0;

      let lowStockCount = 0;

      let outOfStockCount = 0;


      for (
        const item of inventory
      ) {

        const quantity =
          Number(
            item.quantity
          ) || 0;


        const lowStockLimit =
          Number(
            item.lowStockLimit
          ) || 0;


        totalUnits +=
          quantity;


        if (
          quantity === 0
        ) {

          outOfStockCount++;

        } else if (
          quantity <=
          lowStockLimit
        ) {

          lowStockCount++;

        }

      }


      res.status(200).json({

        totalProducts,

        totalUnits,

        lowStockCount,

        outOfStockCount

      });

    } catch (error) {

      console.error(
        "GET INVENTORY SUMMARY ERROR:",
        error
      );

      res.status(500).json({

        message:
          error.message ||
          "Unable to load inventory summary"

      });

    }

  }
);


// =====================================================
// GET ONE INVENTORY RECORD
// =====================================================

router.get(
  "/:id",
  protect,
  businessAccess,
  async (req, res) => {

    try {

      const inventory =
        await Inventory.findOne({

          _id:
            req.params.id,

          business:
            req.business._id

        })
          .populate("product");


      if (!inventory) {

        return res.status(404).json({

          message:
            "Inventory record not found"

        });

      }


      res.status(200).json(
        inventory
      );

    } catch (error) {

      console.error(
        "GET INVENTORY ERROR:",
        error
      );

      res.status(500).json({

        message:
          error.message ||
          "Unable to load inventory"

      });

    }

  }
);


// =====================================================
// CREATE INVENTORY RECORD
// =====================================================

router.post(
  "/",
  protect,
  businessAccess,
  requireRole(
    "owner",
    "admin",
    "manager"
  ),
  async (req, res) => {

    try {

      const {
        product,
        quantity,
        lowStockLimit
      } = req.body;


      // ================================================
      // VALIDATE PRODUCT
      // ================================================

      if (!product) {

        return res.status(400).json({

          message:
            "Product ID is required"

        });

      }


      const productExists =
        await Product.findOne({

          _id:
            product,

          business:
            req.business._id

        });


      if (!productExists) {

        return res.status(404).json({

          message:
            "Product not found"

        });

      }


      // ================================================
      // CHECK DUPLICATE INVENTORY
      // ================================================

      const existingInventory =
        await Inventory.findOne({

          business:
            req.business._id,

          product

        });


      if (existingInventory) {

        return res.status(400).json({

          message:
            "Inventory already exists for this product"

        });

      }


      // ================================================
      // VALIDATE QUANTITY
      // ================================================

      const inventoryQuantity =
        quantity === undefined
          ? 0
          : Number(quantity);


      if (
        !Number.isFinite(
          inventoryQuantity
        ) ||
        inventoryQuantity < 0 ||
        !Number.isInteger(
          inventoryQuantity
        )
      ) {

        return res.status(400).json({

          message:
            "Quantity must be a non-negative whole number"

        });

      }


      // ================================================
      // VALIDATE LOW STOCK LIMIT
      // ================================================

      const limit =
        lowStockLimit === undefined
          ? 5
          : Number(lowStockLimit);


      if (
        !Number.isFinite(limit) ||
        limit < 0 ||
        !Number.isInteger(limit)
      ) {

        return res.status(400).json({

          message:
            "Low stock limit must be a non-negative whole number"

        });

      }


      // ================================================
      // CREATE INVENTORY
      // ================================================

      const inventory =
        await Inventory.create({

          business:
            req.business._id,

          product:
            productExists._id,

          quantity:
            inventoryQuantity,

          lowStockLimit:
            limit

        });


      const populatedInventory =
        await Inventory.findById(
          inventory._id
        )
          .populate("product");


      // ================================================
      // LOW STOCK NOTIFICATION
      // ================================================

      if (
        inventoryQuantity <=
        limit
      ) {

        try {

          await createLowStockNotification({

            business:
              req.business,

            product:
              productExists,

            quantity:
              inventoryQuantity,

            lowStockLimit:
              limit

          });

        } catch (notificationError) {

          console.error(
            "LOW STOCK NOTIFICATION ERROR:",
            notificationError
          );

        }

      }


      res.status(201).json({

        message:
          "Inventory created successfully",

        inventory:
          populatedInventory

      });

    } catch (error) {

      console.error(
        "CREATE INVENTORY ERROR:",
        error
      );

      res.status(500).json({

        message:
          error.message ||
          "Unable to create inventory"

      });

    }

  }
);


// =====================================================
// ADD STOCK
// =====================================================

router.post(
  "/:id/add-stock",
  protect,
  businessAccess,
  requireRole(
    "owner",
    "admin",
    "manager"
  ),
  async (req, res) => {

    try {

      const {
        quantity
      } = req.body;


      const amount =
        Number(quantity);


      if (
        !Number.isFinite(amount) ||
        amount <= 0 ||
        !Number.isInteger(amount)
      ) {

        return res.status(400).json({

          message:
            "Stock quantity must be a positive whole number"

        });

      }


      const inventory =
        await Inventory.findOne({

          _id:
            req.params.id,

          business:
            req.business._id

        })
          .populate("product");


      if (!inventory) {

        return res.status(404).json({

          message:
            "Inventory record not found"

        });

      }


      inventory.quantity =
        Number(inventory.quantity) +
        amount;


      await inventory.save();


      res.status(200).json({

        message:
          "Stock added successfully",

        inventory

      });

    } catch (error) {

      console.error(
        "ADD STOCK ERROR:",
        error
      );

      res.status(500).json({

        message:
          error.message ||
          "Unable to add stock"

      });

    }

  }
);


// =====================================================
// REMOVE STOCK
// =====================================================

router.post(
  "/:id/remove-stock",
  protect,
  businessAccess,
  requireRole(
    "owner",
    "admin",
    "manager"
  ),
  async (req, res) => {

    try {

      const {
        quantity
      } = req.body;


      const amount =
        Number(quantity);


      if (
        !Number.isFinite(amount) ||
        amount <= 0 ||
        !Number.isInteger(amount)
      ) {

        return res.status(400).json({

          message:
            "Stock quantity must be a positive whole number"

        });

      }


      const inventory =
        await Inventory.findOne({

          _id:
            req.params.id,

          business:
            req.business._id

        })
          .populate("product");


      if (!inventory) {

        return res.status(404).json({

          message:
            "Inventory record not found"

        });

      }


      if (
        Number(inventory.quantity) <
        amount
      ) {

        return res.status(400).json({

          message:
            `Cannot remove ${amount} units. ` +
            `Only ${inventory.quantity} units are available.`

        });

      }


      inventory.quantity =
        Number(inventory.quantity) -
        amount;


      await inventory.save();


      // ================================================
      // LOW STOCK CHECK
      // ================================================

      if (
        Number(inventory.quantity) <=
        Number(inventory.lowStockLimit)
      ) {

        try {

          await createLowStockNotification({

            business:
              req.business,

            product:
              inventory.product,

            quantity:
              inventory.quantity,

            lowStockLimit:
              inventory.lowStockLimit

          });

        } catch (notificationError) {

          console.error(
            "LOW STOCK NOTIFICATION ERROR:",
            notificationError
          );

        }

      }


      res.status(200).json({

        message:
          "Stock removed successfully",

        inventory

      });

    } catch (error) {

      console.error(
        "REMOVE STOCK ERROR:",
        error
      );

      res.status(500).json({

        message:
          error.message ||
          "Unable to remove stock"

      });

    }

  }
);


// =====================================================
// SET STOCK
// =====================================================

router.put(
  "/:id/set-stock",
  protect,
  businessAccess,
  requireRole(
    "owner",
    "admin",
    "manager"
  ),
  async (req, res) => {

    try {

      const {
        quantity
      } = req.body;


      const newQuantity =
        Number(quantity);


      if (
        !Number.isFinite(newQuantity) ||
        newQuantity < 0 ||
        !Number.isInteger(newQuantity)
      ) {

        return res.status(400).json({

          message:
            "Quantity must be a non-negative whole number"

        });

      }


      const inventory =
        await Inventory.findOne({

          _id:
            req.params.id,

          business:
            req.business._id

        })
          .populate("product");


      if (!inventory) {

        return res.status(404).json({

          message:
            "Inventory record not found"

        });

      }


      inventory.quantity =
        newQuantity;


      await inventory.save();


      // ================================================
      // LOW STOCK CHECK
      // ================================================

      if (
        newQuantity <=
        Number(inventory.lowStockLimit)
      ) {

        try {

          await createLowStockNotification({

            business:
              req.business,

            product:
              inventory.product,

            quantity:
              newQuantity,

            lowStockLimit:
              inventory.lowStockLimit

          });

        } catch (notificationError) {

          console.error(
            "LOW STOCK NOTIFICATION ERROR:",
            notificationError
          );

        }

      }


      res.status(200).json({

        message:
          "Stock updated successfully",

        inventory

      });

    } catch (error) {

      console.error(
        "SET STOCK ERROR:",
        error
      );

      res.status(500).json({

        message:
          error.message ||
          "Unable to update stock"

      });

    }

  }
);


// =====================================================
// UPDATE LOW STOCK LIMIT
// =====================================================

router.put(
  "/:id/low-stock-limit",
  protect,
  businessAccess,
  requireRole(
    "owner",
    "admin",
    "manager"
  ),
  async (req, res) => {

    try {

      const {
        lowStockLimit
      } = req.body;


      const limit =
        Number(lowStockLimit);


      if (
        !Number.isFinite(limit) ||
        limit < 0 ||
        !Number.isInteger(limit)
      ) {

        return res.status(400).json({

          message:
            "Low stock limit must be a non-negative whole number"

        });

      }


      const inventory =
        await Inventory.findOne({

          _id:
            req.params.id,

          business:
            req.business._id

        })
          .populate("product");


      if (!inventory) {

        return res.status(404).json({

          message:
            "Inventory record not found"

        });

      }


      inventory.lowStockLimit =
        limit;


      await inventory.save();


      res.status(200).json({

        message:
          "Low stock limit updated successfully",

        inventory

      });

    } catch (error) {

      console.error(
        "UPDATE LOW STOCK LIMIT ERROR:",
        error
      );

      res.status(500).json({

        message:
          error.message ||
          "Unable to update low stock limit"

      });

    }

  }
);


// =====================================================
// DELETE INVENTORY RECORD
// =====================================================

router.delete(
  "/:id",
  protect,
  businessAccess,
  requireRole(
    "owner",
    "admin"
  ),
  async (req, res) => {

    try {

      const inventory =
        await Inventory.findOneAndDelete({

          _id:
            req.params.id,

          business:
            req.business._id

        });


      if (!inventory) {

        return res.status(404).json({

          message:
            "Inventory record not found"

        });

      }


      res.status(200).json({

        message:
          "Inventory record deleted successfully"

      });

    } catch (error) {

      console.error(
        "DELETE INVENTORY ERROR:",
        error
      );

      res.status(500).json({

        message:
          error.message ||
          "Unable to delete inventory"

      });

    }

  }
);


module.exports = router;