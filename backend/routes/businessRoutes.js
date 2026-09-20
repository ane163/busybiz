const express = require("express");

const Business = require("../models/Business");
const BusinessMember = require("../models/BusinessMember");

const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();


// =====================================================
// CREATE BUSINESS
// =====================================================

router.post(
  "/",
  protect,
  upload.single("image"),
  async (req, res) => {
    try {

      const business = await Business.create({
        owner: req.user.id,
        businessName: req.body.businessName,
        category: req.body.category,
        description: req.body.description,
        phone: req.body.phone,
        location: req.body.location,
        image: req.file
          ? `/uploads/${req.file.filename}`
          : ""
      });


      // Create owner as first team member
      await BusinessMember.create({
        business: business._id,
        user: req.user.id,
        role: "owner",
        status: "active"
      });


      res.status(201).json({
        message: "Business created successfully",
        business
      });

    } catch (error) {

      console.error(
        "CREATE BUSINESS ERROR:",
        error
      );

      res.status(500).json({
        message: error.message
      });
    }
  }
);


// =====================================================
// GET MY BUSINESS
// =====================================================

router.get(
  "/my-business",
  protect,
  async (req, res) => {
    try {

      const business = await Business.findOne({
        owner: req.user.id
      }).populate(
        "owner",
        "name email"
      );


      if (!business) {
        return res.status(404).json({
          message:
            "You have not created a business yet"
        });
      }


      // Make sure owner has membership
      const ownerMembership =
        await BusinessMember.findOne({
          business: business._id,
          user: req.user.id
        });


      if (!ownerMembership) {

        await BusinessMember.create({
          business: business._id,
          user: req.user.id,
          role: "owner",
          status: "active"
        });

      }


      res.json(business);

    } catch (error) {

      console.error(
        "GET MY BUSINESS ERROR:",
        error
      );

      res.status(500).json({
        message: error.message
      });
    }
  }
);


// =====================================================
// GET ALL BUSINESSES
// =====================================================

router.get(
  "/",
  async (req, res) => {
    try {

      const businesses =
        await Business.find()
          .populate(
            "owner",
            "name email"
          );


      res.json(businesses);

    } catch (error) {

      console.error(
        "GET BUSINESSES ERROR:",
        error
      );

      res.status(500).json({
        message: error.message
      });
    }
  }
);


module.exports = router;