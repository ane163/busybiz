const express = require("express");

const BusinessMember = require("../models/BusinessMember");
const Business = require("../models/Business");
const User = require("../models/User");

const protect = require("../middleware/authMiddleware");
const {
  businessAccess,
  requireRole
} = require("../middleware/businessAccessMiddleware");

const router = express.Router();


// =====================================================
// GET BUSINESS MEMBERS
// =====================================================

router.get(
  "/",
  protect,
  businessAccess,
  async (req, res) => {
    try {

      const members = await BusinessMember.find({
        business: req.business._id
      })
        .populate("user", "name email")
        .sort({
          createdAt: -1
        });

      res.json(members);

    } catch (error) {

      console.error(
        "GET BUSINESS MEMBERS ERROR:",
        error
      );

      res.status(500).json({
        message: error.message
      });
    }
  }
);


// =====================================================
// ADD MEMBER
// =====================================================

router.post(
  "/",
  protect,
  businessAccess,
  requireRole("owner", "admin"),
  async (req, res) => {

    try {

      const {
        email,
        role
      } = req.body;


      if (!email) {
        return res.status(400).json({
          message: "Email is required"
        });
      }


      const user = await User.findOne({
        email: email.toLowerCase()
      });


      if (!user) {
        return res.status(404).json({
          message:
            "User not found. The user must create a BusyBiz account first."
        });
      }


      if (user._id.toString() === req.user.id) {
        return res.status(400).json({
          message:
            "You are already the owner of this business."
        });
      }


      const existingMember =
        await BusinessMember.findOne({
          business: req.business._id,
          user: user._id
        });


      if (existingMember) {
        return res.status(400).json({
          message:
            "This user is already a member of your business."
        });
      }


      const allowedRoles = [
        "admin",
        "manager",
        "employee"
      ];


      const memberRole =
        allowedRoles.includes(role)
          ? role
          : "employee";


      const member =
        await BusinessMember.create({

          business:
            req.business._id,

          user:
            user._id,

          role:
            memberRole,

          status:
            "active"
        });


      const populatedMember =
        await BusinessMember.findById(
          member._id
        ).populate(
          "user",
          "name email"
        );


      res.status(201).json({

        message:
          "Team member added successfully",

        member:
          populatedMember
      });


    } catch (error) {

      console.error(
        "ADD BUSINESS MEMBER ERROR:",
        error
      );

      res.status(500).json({
        message: error.message
      });
    }
  }
);


// =====================================================
// CHANGE MEMBER ROLE
// =====================================================

router.put(
  "/:id/role",
  protect,
  businessAccess,
  requireRole("owner", "admin"),
  async (req, res) => {

    try {

      const {
        role
      } = req.body;


      const allowedRoles = [
        "admin",
        "manager",
        "employee"
      ];


      if (!allowedRoles.includes(role)) {
        return res.status(400).json({
          message: "Invalid role"
        });
      }


      const member =
        await BusinessMember.findOneAndUpdate(

          {
            _id:
              req.params.id,

            business:
              req.business._id
          },

          {
            role
          },

          {
            new: true,
            runValidators: true
          }

        ).populate(
          "user",
          "name email"
        );


      if (!member) {
        return res.status(404).json({
          message:
            "Team member not found"
        });
      }


      res.json({

        message:
          "Member role updated successfully",

        member
      });


    } catch (error) {

      console.error(
        "UPDATE MEMBER ROLE ERROR:",
        error
      );

      res.status(500).json({
        message: error.message
      });
    }
  }
);


// =====================================================
// REMOVE MEMBER
// =====================================================

router.delete(
  "/:id",
  protect,
  businessAccess,
  requireRole("owner", "admin"),
  async (req, res) => {

    try {

      const member =
        await BusinessMember.findOne({

          _id:
            req.params.id,

          business:
            req.business._id
        });


      if (!member) {
        return res.status(404).json({
          message:
            "Team member not found"
        });
      }


      await BusinessMember.findByIdAndDelete(
        member._id
      );


      res.json({
        message:
          "Team member removed successfully"
      });


    } catch (error) {

      console.error(
        "REMOVE MEMBER ERROR:",
        error
      );

      res.status(500).json({
        message: error.message
      });
    }
  }
);


module.exports = router;