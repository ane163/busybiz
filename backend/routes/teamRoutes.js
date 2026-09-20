const express = require("express");

const Business = require("../models/Business");
const BusinessMember = require("../models/BusinessMember");
const User = require("../models/User");

const protect = require("../middleware/authMiddleware");

const router = express.Router();


// =====================================================
// GET MY TEAM
// =====================================================

router.get("/", protect, async (req, res) => {
  try {

    const business = await Business.findOne({
      owner: req.user.id
    });

    if (!business) {
      return res.status(404).json({
        message: "Business not found"
      });
    }


    const members = await BusinessMember.find({
      business: business._id
    })
      .populate(
        "user",
        "name email role"
      )
      .sort({
        createdAt: 1
      });


    res.json(members);

  } catch (error) {

    console.error(
      "GET TEAM ERROR:",
      error
    );

    res.status(500).json({
      message: error.message
    });
  }
});


// =====================================================
// ADD TEAM MEMBER
// =====================================================

router.post("/add", protect, async (req, res) => {
  try {

    const business = await Business.findOne({
      owner: req.user.id
    });

    if (!business) {
      return res.status(404).json({
        message: "Business not found"
      });
    }


    const {
      email,
      role
    } = req.body;


    if (!email) {
      return res.status(400).json({
        message: "User email is required"
      });
    }


    const allowedRoles = [
      "admin",
      "manager",
      "employee"
    ];


    const memberRole =
      role || "employee";


    if (
      !allowedRoles.includes(memberRole)
    ) {
      return res.status(400).json({
        message: "Invalid team member role"
      });
    }


    // Find user
    const user = await User.findOne({
      email: email.toLowerCase().trim()
    });


    if (!user) {
      return res.status(404).json({
        message:
          "No BusyBiz user found with that email"
      });
    }


    // Owner cannot be added again
    if (
      user._id.toString() ===
      req.user.id.toString()
    ) {
      return res.status(400).json({
        message:
          "The business owner is already a team member"
      });
    }


    // Check existing membership
    const existingMember =
      await BusinessMember.findOne({
        business: business._id,
        user: user._id
      });


    if (existingMember) {
      return res.status(400).json({
        message:
          "This user is already a member of your business"
      });
    }


    // Create member
    const member =
      await BusinessMember.create({
        business: business._id,
        user: user._id,
        role: memberRole,
        status: "active"
      });


    const populatedMember =
      await BusinessMember.findById(
        member._id
      ).populate(
        "user",
        "name email role"
      );


    res.status(201).json({
      message:
        "Team member added successfully",
      member: populatedMember
    });

  } catch (error) {

    console.error(
      "ADD TEAM MEMBER ERROR:",
      error
    );

    res.status(500).json({
      message: error.message
    });
  }
});


// =====================================================
// UPDATE TEAM MEMBER ROLE
// =====================================================

router.put(
  "/:id/role",
  protect,
  async (req, res) => {
    try {

      const business =
        await Business.findOne({
          owner: req.user.id
        });


      if (!business) {
        return res.status(404).json({
          message: "Business not found"
        });
      }


      const {
        role
      } = req.body;


      const allowedRoles = [
        "admin",
        "manager",
        "employee"
      ];


      if (
        !allowedRoles.includes(role)
      ) {
        return res.status(400).json({
          message:
            "Invalid team member role"
        });
      }


      const member =
        await BusinessMember.findOne({
          _id: req.params.id,
          business: business._id
        });


      if (!member) {
        return res.status(404).json({
          message:
            "Team member not found"
        });
      }


      if (
        member.role === "owner"
      ) {
        return res.status(400).json({
          message:
            "The owner role cannot be changed"
        });
      }


      member.role = role;

      await member.save();


      const updatedMember =
        await BusinessMember.findById(
          member._id
        ).populate(
          "user",
          "name email role"
        );


      res.json({
        message:
          "Team member role updated successfully",
        member: updatedMember
      });

    } catch (error) {

      console.error(
        "UPDATE TEAM ROLE ERROR:",
        error
      );

      res.status(500).json({
        message: error.message
      });
    }
  }
);


// =====================================================
// REMOVE TEAM MEMBER
// =====================================================

router.delete(
  "/:id",
  protect,
  async (req, res) => {
    try {

      const business =
        await Business.findOne({
          owner: req.user.id
        });


      if (!business) {
        return res.status(404).json({
          message: "Business not found"
        });
      }


      const member =
        await BusinessMember.findOne({
          _id: req.params.id,
          business: business._id
        });


      if (!member) {
        return res.status(404).json({
          message:
            "Team member not found"
        });
      }


      if (
        member.role === "owner"
      ) {
        return res.status(400).json({
          message:
            "The business owner cannot be removed"
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
        "REMOVE TEAM MEMBER ERROR:",
        error
      );

      res.status(500).json({
        message: error.message
      });
    }
  }
);


module.exports = router;