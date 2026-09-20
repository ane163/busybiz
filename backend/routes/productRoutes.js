const express = require("express");
const mongoose = require("mongoose");

const Product = require("../models/Product");
const Inventory = require("../models/Inventory");

const protect = require("../middleware/authMiddleware");

const {
  businessAccess
} = require("../middleware/businessAccessMiddleware");

const upload = require("../middleware/upload");

const router = express.Router();


// =====================================================
// GET ALL PRODUCTS
// =====================================================

router.get(
  "/",
  protect,
  businessAccess,
  async (req, res) => {
    try {

      const products =
        await Product.find({
          business: req.business._id
        }).sort({
          createdAt: -1
        });

      res.status(200).json(products);

    } catch (error) {

      console.error(
        "GET PRODUCTS ERROR:",
        error
      );

      res.status(500).json({
        message:
          "Unable to load products."
      });

    }
  }
);


// =====================================================
// GET ONE PRODUCT
// =====================================================

router.get(
  "/:id",
  protect,
  businessAccess,
  async (req, res) => {

    try {

      if (
        !mongoose.Types.ObjectId.isValid(
          req.params.id
        )
      ) {

        return res.status(400).json({
          message:
            "Invalid product ID."
        });

      }

      const product =
        await Product.findOne({

          _id:
            req.params.id,

          business:
            req.business._id

        });

      if (!product) {

        return res.status(404).json({
          message:
            "Product not found."
        });

      }

      res.status(200).json(product);

    } catch (error) {

      console.error(
        "GET PRODUCT ERROR:",
        error
      );

      res.status(500).json({
        message:
          "Unable to load product."
      });

    }

  }
);


// =====================================================
// CREATE PRODUCT
// =====================================================

router.post(
  "/",
  protect,
  businessAccess,
  upload.single("image"),
  async (req, res) => {

    try {

      console.log(
        "CREATE PRODUCT BODY:",
        req.body
      );

      console.log(
        "CREATE PRODUCT FILE:",
        req.file
      );

      const {
        name,
        description,
        price,
        category,
        costPrice
      } = req.body || {};


      // =================================================
      // VALIDATE NAME
      // =================================================

      if (
        !name ||
        !String(name).trim()
      ) {

        return res.status(400).json({

          message:
            "Product name is required."

        });

      }


      // =================================================
      // VALIDATE SELLING PRICE
      // =================================================

      if (
        price === undefined ||
        price === null ||
        price === ""
      ) {

        return res.status(400).json({

          message:
            "Product price is required."

        });

      }


      const numericPrice =
        Number(price);


      if (
        !Number.isFinite(
          numericPrice
        ) ||
        numericPrice < 0
      ) {

        return res.status(400).json({

          message:
            "Product price must be a valid positive number."

        });

      }


      // =================================================
      // VALIDATE COST PRICE
      // =================================================

      const numericCostPrice =
        costPrice === undefined ||
        costPrice === null ||
        costPrice === ""
          ? 0
          : Number(costPrice);


      if (
        !Number.isFinite(
          numericCostPrice
        ) ||
        numericCostPrice < 0
      ) {

        return res.status(400).json({

          message:
            "Product cost price must be a valid positive number."

        });

      }


      // =================================================
      // IMAGE
      // =================================================

      let imagePath = "";


      if (req.file) {

        imagePath =
          `/uploads/${req.file.filename}`;

      }


      // =================================================
      // CREATE PRODUCT
      // =================================================

      const product =
        await Product.create({

          business:
            req.business._id,

          name:
            String(name).trim(),

          description:
            description
              ? String(description).trim()
              : "",

          price:
            numericPrice,

          costPrice:
            numericCostPrice,

          category:
            category
              ? String(category).trim()
              : "",

          image:
            imagePath

        });


      // =================================================
      // AUTOMATICALLY CREATE INVENTORY
      // =================================================

      let inventory = null;

      try {

        inventory =
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

      } catch (inventoryError) {

        console.error(
          "CREATE PRODUCT INVENTORY ERROR:",
          inventoryError
        );

        // If inventory creation fails,
        // remove the product so we don't
        // leave an incomplete product.

        await Product.findByIdAndDelete(
          product._id
        );

        throw new Error(
          "Product was not created because its inventory record could not be created."
        );

      }


      // =================================================
      // RESPONSE
      // =================================================

      return res.status(201).json({

        message:
          "Product created successfully.",

        product,

        inventory

      });

    } catch (error) {

      console.error(
        "CREATE PRODUCT ERROR:",
        error
      );

      return res.status(500).json({

        message:
          error.message ||
          "Unable to create product."

      });

    }

  }
);


// =====================================================
// UPDATE PRODUCT
// =====================================================

router.put(
  "/:id",
  protect,
  businessAccess,
  upload.single("image"),
  async (req, res) => {

    try {

      // =================================================
      // VALIDATE ID
      // =================================================

      if (
        !mongoose.Types.ObjectId.isValid(
          req.params.id
        )
      ) {

        return res.status(400).json({

          message:
            "Invalid product ID."

        });

      }


      const {
        name,
        description,
        price,
        category,
        costPrice
      } = req.body || {};


      // =================================================
      // VALIDATE NAME
      // =================================================

      if (
        name !== undefined &&
        !String(name).trim()
      ) {

        return res.status(400).json({

          message:
            "Product name cannot be empty."

        });

      }


      // =================================================
      // VALIDATE PRICE
      // =================================================

      if (
        price !== undefined &&
        price !== ""
      ) {

        const numericPrice =
          Number(price);

        if (
          !Number.isFinite(
            numericPrice
          ) ||
          numericPrice < 0
        ) {

          return res.status(400).json({

            message:
              "Product price must be a valid positive number."

          });

        }

      }


      // =================================================
      // VALIDATE COST PRICE
      // =================================================

      if (
        costPrice !== undefined &&
        costPrice !== ""
      ) {

        const numericCostPrice =
          Number(costPrice);

        if (
          !Number.isFinite(
            numericCostPrice
          ) ||
          numericCostPrice < 0
        ) {

          return res.status(400).json({

            message:
              "Product cost price must be a valid positive number."

          });

        }

      }


      // =================================================
      // FIND PRODUCT
      // =================================================

      const product =
        await Product.findOne({

          _id:
            req.params.id,

          business:
            req.business._id

        });


      if (!product) {

        return res.status(404).json({

          message:
            "Product not found."

        });

      }


      // =================================================
      // UPDATE FIELDS
      // =================================================

      if (name !== undefined) {

        product.name =
          String(name).trim();

      }


      if (description !== undefined) {

        product.description =
          String(description).trim();

      }


      if (
        price !== undefined &&
        price !== ""
      ) {

        product.price =
          Number(price);

      }


      if (
        costPrice !== undefined &&
        costPrice !== ""
      ) {

        product.costPrice =
          Number(costPrice);

      }


      if (category !== undefined) {

        product.category =
          String(category).trim();

      }


      // =================================================
      // UPDATE IMAGE
      // =================================================

      if (req.file) {

        product.image =
          `/uploads/${req.file.filename}`;

      }


      // =================================================
      // SAVE PRODUCT
      // =================================================

      await product.save();


      // =================================================
      // ENSURE INVENTORY EXISTS
      // =================================================

      let inventory =
        await Inventory.findOne({

          business:
            req.business._id,

          product:
            product._id

        });


      if (!inventory) {

        inventory =
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

      }


      // =================================================
      // RESPONSE
      // =================================================

      return res.status(200).json({

        message:
          "Product updated successfully.",

        product,

        inventory

      });

    } catch (error) {

      console.error(
        "UPDATE PRODUCT ERROR:",
        error
      );

      return res.status(500).json({

        message:
          error.message ||
          "Unable to update product."

      });

    }

  }
);


// =====================================================
// DELETE PRODUCT
// =====================================================

router.delete(
  "/:id",
  protect,
  businessAccess,
  async (req, res) => {

    try {

      if (
        !mongoose.Types.ObjectId.isValid(
          req.params.id
        )
      ) {

        return res.status(400).json({

          message:
            "Invalid product ID."

        });

      }


      const product =
        await Product.findOne({

          _id:
            req.params.id,

          business:
            req.business._id

        });


      if (!product) {

        return res.status(404).json({

          message:
            "Product not found."

        });

      }


      // =================================================
      // DELETE INVENTORY FIRST
      // =================================================

      await Inventory.deleteMany({

        business:
          req.business._id,

        product:
          product._id

      });


      // =================================================
      // DELETE PRODUCT
      // =================================================

      await Product.findByIdAndDelete(
        product._id
      );


      return res.status(200).json({

        message:
          "Product deleted successfully.",

        product

      });

    } catch (error) {

      console.error(
        "DELETE PRODUCT ERROR:",
        error
      );

      return res.status(500).json({

        message:
          error.message ||
          "Unable to delete product."

      });

    }

  }
);


module.exports = router;