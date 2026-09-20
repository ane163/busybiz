const express = require("express");
const mongoose = require("mongoose");

const Supplier = require("../models/Supplier");

const protect = require("../middleware/authMiddleware");

const {
  businessAccess,
  requireRole
} = require("../middleware/businessAccessMiddleware");

const router = express.Router();


// =====================================================
// GET ALL SUPPLIERS
// =====================================================

router.get(
  "/",
  protect,
  businessAccess,
  async (req, res) => {
    try {

      const suppliers = await Supplier.find({
        business: req.business._id
      }).sort({
        createdAt: -1
      });

      res.status(200).json(suppliers);

    } catch (error) {

      console.error(
        "GET SUPPLIERS ERROR:",
        error
      );

      res.status(500).json({
        message:
          error.message ||
          "Unable to load suppliers"
      });

    }
  }
);


// =====================================================
// GET ONE SUPPLIER
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
            "Invalid supplier ID"
        });
      }

      const supplier =
        await Supplier.findOne({
          _id: req.params.id,
          business: req.business._id
        });

      if (!supplier) {
        return res.status(404).json({
          message:
            "Supplier not found"
        });
      }

      res.status(200).json(
        supplier
      );

    } catch (error) {

      console.error(
        "GET SUPPLIER ERROR:",
        error
      );

      res.status(500).json({
        message:
          error.message ||
          "Unable to load supplier"
      });

    }
  }
);


// =====================================================
// CREATE SUPPLIER
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
        name,
        companyName,
        contactPerson,
        phone,
        email,
        address,
        notes,
        status
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
            "Supplier name is required"
        });

      }


      // =================================================
      // VALIDATE EMAIL
      // =================================================

      if (
        email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
          String(email).trim()
        )
      ) {

        return res.status(400).json({
          message:
            "Please enter a valid email address"
        });

      }


      // =================================================
      // STATUS
      // =================================================

      const supplierStatus =
        status || "active";

      if (
        ![
          "active",
          "inactive"
        ].includes(
          supplierStatus
        )
      ) {

        return res.status(400).json({
          message:
            "Invalid supplier status"
        });

      }


      // =================================================
      // CREATE
      // =================================================

      const supplier =
        await Supplier.create({

          business:
            req.business._id,

          name:
            String(name).trim(),

          companyName:
            companyName
              ? String(companyName).trim()
              : "",

          contactPerson:
            contactPerson
              ? String(contactPerson).trim()
              : "",

          phone:
            phone
              ? String(phone).trim()
              : "",

          email:
            email
              ? String(email).trim().toLowerCase()
              : "",

          address:
            address
              ? String(address).trim()
              : "",

          notes:
            notes
              ? String(notes).trim()
              : "",

          status:
            supplierStatus

        });


      res.status(201).json({

        message:
          "Supplier created successfully",

        supplier

      });

    } catch (error) {

      console.error(
        "CREATE SUPPLIER ERROR:",
        error
      );

      res.status(500).json({

        message:
          error.message ||
          "Unable to create supplier"

      });

    }
  }
);


// =====================================================
// UPDATE SUPPLIER
// =====================================================

router.put(
  "/:id",
  protect,
  businessAccess,
  requireRole(
    "owner",
    "admin",
    "manager"
  ),
  async (req, res) => {

    try {

      if (
        !mongoose.Types.ObjectId.isValid(
          req.params.id
        )
      ) {

        return res.status(400).json({
          message:
            "Invalid supplier ID"
        });

      }


      const supplier =
        await Supplier.findOne({

          _id:
            req.params.id,

          business:
            req.business._id

        });


      if (!supplier) {

        return res.status(404).json({
          message:
            "Supplier not found"
        });

      }


      const {
        name,
        companyName,
        contactPerson,
        phone,
        email,
        address,
        notes,
        status
      } = req.body || {};


      // =================================================
      // NAME
      // =================================================

      if (
        name !== undefined
      ) {

        if (
          !String(name).trim()
        ) {

          return res.status(400).json({
            message:
              "Supplier name cannot be empty"
          });

        }

        supplier.name =
          String(name).trim();

      }


      // =================================================
      // EMAIL
      // =================================================

      if (
        email !== undefined
      ) {

        if (
          email &&
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
            String(email).trim()
          )
        ) {

          return res.status(400).json({
            message:
              "Please enter a valid email address"
          });

        }

        supplier.email =
          email
            ? String(email).trim().toLowerCase()
            : "";

      }


      // =================================================
      // OTHER FIELDS
      // =================================================

      if (
        companyName !== undefined
      ) {

        supplier.companyName =
          String(companyName).trim();

      }


      if (
        contactPerson !== undefined
      ) {

        supplier.contactPerson =
          String(contactPerson).trim();

      }


      if (
        phone !== undefined
      ) {

        supplier.phone =
          String(phone).trim();

      }


      if (
        address !== undefined
      ) {

        supplier.address =
          String(address).trim();

      }


      if (
        notes !== undefined
      ) {

        supplier.notes =
          String(notes).trim();

      }


      // =================================================
      // STATUS
      // =================================================

      if (
        status !== undefined
      ) {

        if (
          ![
            "active",
            "inactive"
          ].includes(
            status
          )
        ) {

          return res.status(400).json({
            message:
              "Invalid supplier status"
          });

        }

        supplier.status =
          status;

      }


      await supplier.save();


      res.status(200).json({

        message:
          "Supplier updated successfully",

        supplier

      });

    } catch (error) {

      console.error(
        "UPDATE SUPPLIER ERROR:",
        error
      );

      res.status(500).json({

        message:
          error.message ||
          "Unable to update supplier"

      });

    }
  }
);


// =====================================================
// DELETE SUPPLIER
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

      if (
        !mongoose.Types.ObjectId.isValid(
          req.params.id
        )
      ) {

        return res.status(400).json({
          message:
            "Invalid supplier ID"
        });

      }


      const supplier =
        await Supplier.findOneAndDelete({

          _id:
            req.params.id,

          business:
            req.business._id

        });


      if (!supplier) {

        return res.status(404).json({
          message:
            "Supplier not found"
        });

      }


      res.status(200).json({

        message:
          "Supplier deleted successfully",

        supplier

      });

    } catch (error) {

      console.error(
        "DELETE SUPPLIER ERROR:",
        error
      );

      res.status(500).json({

        message:
          error.message ||
          "Unable to delete supplier"

      });

    }
  }
);


module.exports = router;