const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const User = require("../models/User");
const protect = require("../middleware/authMiddleware");

const router = express.Router();


// =====================================================
// UPLOAD DIRECTORY
// =====================================================

const uploadDirectory = path.join(
  __dirname,
  "../uploads/profiles"
);

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true
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

    const extension =
      path.extname(file.originalname).toLowerCase();

    const userId =
      req.user?._id || req.user?.id;

    cb(
      null,
      `profile-${userId}-${Date.now()}${extension}`
    );
  }

});


// =====================================================
// FILE FILTER
// =====================================================

const fileFilter = (req, file, cb) => {

  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp"
  ];

  if (allowedTypes.includes(file.mimetype)) {

    cb(null, true);

  } else {

    cb(
      new Error(
        "Only JPG, JPEG, PNG and WEBP images are allowed."
      )
    );

  }

};


// =====================================================
// UPLOAD CONFIGURATION
// =====================================================

const upload = multer({

  storage,

  fileFilter,

  limits: {
    fileSize: 5 * 1024 * 1024
  }

});


// =====================================================
// GET PROFILE
// =====================================================

router.get(
  "/profile",
  protect,
  async (req, res) => {

    try {

      const userId =
        req.user?._id || req.user?.id;

      if (!userId) {

        return res.status(401).json({
          message: "User not authenticated."
        });

      }

      const user =
        await User.findById(userId)
          .select("-password");

      if (!user) {

        return res.status(404).json({
          message: "User not found."
        });

      }

      res.json({
        user
      });

    } catch (error) {

      console.error(
        "GET PROFILE ERROR:",
        error
      );

      res.status(500).json({
        message: error.message
      });

    }

  }
);


// =====================================================
// UPLOAD PROFILE PICTURE
// =====================================================

router.put(
  "/profile-picture",
  protect,
  upload.single("profilePicture"),
  async (req, res) => {

    try {

      if (!req.file) {

        return res.status(400).json({
          message: "Please select a profile picture."
        });

      }

      const userId =
        req.user?._id || req.user?.id;

      if (!userId) {

        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }

        return res.status(401).json({
          message: "User not authenticated."
        });

      }

      const user =
        await User.findById(userId);

      if (!user) {

        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }

        return res.status(404).json({
          message: "User not found."
        });

      }


      // ================================================
      // DELETE OLD PROFILE IMAGE
      // ================================================

      if (
        user.profilePicture &&
        user.profilePicture.startsWith(
          "/uploads/profiles/"
        )
      ) {

        const oldImagePath =
          path.join(
            __dirname,
            "..",
            user.profilePicture
          );

        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }

      }


      // ================================================
      // SAVE NEW IMAGE PATH
      // ================================================

      user.profilePicture =
        `/uploads/profiles/${req.file.filename}`;

      await user.save();


      // ================================================
      // RETURN USER
      // ================================================

      res.status(200).json({

        message:
          "Profile picture updated successfully.",

        user: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          profilePicture: user.profilePicture,
          role: user.role
        }

      });

    } catch (error) {

      console.error(
        "PROFILE PICTURE ERROR:",
        error
      );

      if (
        req.file &&
        fs.existsSync(req.file.path)
      ) {

        try {
          fs.unlinkSync(req.file.path);
        } catch (cleanupError) {
          console.error(
            "FILE CLEANUP ERROR:",
            cleanupError
          );
        }

      }

      res.status(500).json({
        message: error.message
      });

    }

  }
);


// =====================================================
// DELETE PROFILE PICTURE
// =====================================================

router.delete(
  "/profile-picture",
  protect,
  async (req, res) => {

    try {

      const userId =
        req.user?._id || req.user?.id;

      const user =
        await User.findById(userId);

      if (!user) {

        return res.status(404).json({
          message: "User not found."
        });

      }


      if (
        user.profilePicture &&
        user.profilePicture.startsWith(
          "/uploads/profiles/"
        )
      ) {

        const imagePath =
          path.join(
            __dirname,
            "..",
            user.profilePicture
          );

        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }

      }


      user.profilePicture = null;

      await user.save();


      res.json({

        message:
          "Profile picture removed successfully.",

        user: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          profilePicture: null,
          role: user.role
        }

      });

    } catch (error) {

      console.error(
        "DELETE PROFILE PICTURE ERROR:",
        error
      );

      res.status(500).json({
        message: error.message
      });

    }

  }
);


module.exports = router;