const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
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
  "../public/uploads/profiles"
);


if (!fs.existsSync(uploadDirectory)) {

  fs.mkdirSync(
    uploadDirectory,
    {
      recursive: true
    }
  );

}


// =====================================================
// MULTER STORAGE
// =====================================================

const storage = multer.diskStorage({

  destination: (req, file, cb) => {

    cb(
      null,
      uploadDirectory
    );

  },


  filename: (req, file, cb) => {

    const extension =
      path.extname(
        file.originalname
      ).toLowerCase();

    const filename =
      `profile-${req.user._id}-${Date.now()}${extension}`;

    cb(
      null,
      filename
    );

  }

});


// =====================================================
// FILE FILTER
// =====================================================

const fileFilter = (
  req,
  file,
  cb
) => {

  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp"
  ];


  if (
    allowedTypes.includes(
      file.mimetype
    )
  ) {

    cb(
      null,
      true
    );

  } else {

    cb(
      new Error(
        "Only JPG, JPEG, PNG and WEBP images are allowed."
      )
    );

  }

};


// =====================================================
// MULTER
// =====================================================

const upload = multer({

  storage,

  fileFilter,

  limits: {
    fileSize: 5 * 1024 * 1024
  }

});


// =====================================================
// REGISTER
// =====================================================

router.post(
  "/register",
  async (req, res) => {

    try {

      const {
        fullName,
        email,
        password
      } = req.body;


      if (
        !fullName ||
        !email ||
        !password
      ) {

        return res.status(400).json({
          message:
            "Full name, email and password are required."
        });

      }


      const existingUser =
        await User.findOne({
          email:
            email.toLowerCase()
        });


      if (existingUser) {

        return res.status(400).json({
          message:
            "An account with this email already exists."
        });

      }


      const hashedPassword =
        await bcrypt.hash(
          password,
          10
        );


      const user =
        await User.create({

          fullName,

          email:
            email.toLowerCase(),

          password:
            hashedPassword,

          profilePicture:
            null,

          role:
            "user"

        });


      const token =
        jwt.sign(

          {
            id:
              user._id,

            role:
              user.role

          },

          process.env.JWT_SECRET,

          {
            expiresIn:
              "7d"
          }

        );


      res.status(201).json({

        message:
          "Registration successful.",

        token,

        user: {

          _id:
            user._id,

          fullName:
            user.fullName,

          email:
            user.email,

          profilePicture:
            user.profilePicture,

          role:
            user.role

        }

      });


    } catch (error) {

      console.error(
        "REGISTER ERROR:",
        error
      );


      res.status(500).json({

        message:
          error.message

      });

    }

  }
);


// =====================================================
// LOGIN
// =====================================================

router.post(
  "/login",
  async (req, res) => {

    try {

      const {
        email,
        password
      } = req.body;


      if (
        !email ||
        !password
      ) {

        return res.status(400).json({

          message:
            "Email and password are required."

        });

      }


      const user =
        await User.findOne({

          email:
            email.toLowerCase()

        });


      if (!user) {

        return res.status(401).json({

          message:
            "Invalid email or password."

        });

      }


      const passwordMatch =
        await bcrypt.compare(
          password,
          user.password
        );


      if (!passwordMatch) {

        return res.status(401).json({

          message:
            "Invalid email or password."

        });

      }


      const token =
        jwt.sign(

          {
            id:
              user._id,

            role:
              user.role

          },

          process.env.JWT_SECRET,

          {
            expiresIn:
              "7d"
          }

        );


      res.json({

        message:
          "Login successful.",

        token,

        user: {

          _id:
            user._id,

          fullName:
            user.fullName,

          email:
            user.email,

          profilePicture:
            user.profilePicture,

          role:
            user.role

        }

      });


    } catch (error) {

      console.error(
        "LOGIN ERROR:",
        error
      );


      res.status(500).json({

        message:
          error.message

      });

    }

  }
);


// =====================================================
// GET MY PROFILE
// =====================================================

router.get(
  "/profile",
  protect,
  async (req, res) => {

    try {

      const user =
        await User.findById(
          req.user._id
        ).select(
          "-password"
        );


      if (!user) {

        return res.status(404).json({

          message:
            "User not found."

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

        message:
          error.message

      });

    }

  }
);


// =====================================================
// UPDATE PROFILE PICTURE
// =====================================================

router.put(
  "/profile-picture",
  protect,
  upload.single("profilePicture"),
  async (req, res) => {

    try {

      if (!req.file) {

        return res.status(400).json({

          message:
            "Please select an image."

        });

      }


      const user =
        await User.findById(
          req.user._id
        );


      if (!user) {

        return res.status(404).json({

          message:
            "User not found."

        });

      }


      // ==========================================
      // DELETE OLD IMAGE
      // ==========================================

      if (
        user.profilePicture &&
        user.profilePicture.startsWith(
          "/uploads/profiles/"
        )
      ) {

        const oldImage =
          path.join(
            __dirname,
            "../public",
            user.profilePicture
          );


        if (
          fs.existsSync(oldImage)
        ) {

          fs.unlinkSync(
            oldImage
          );

        }

      }


      // ==========================================
      // SAVE NEW IMAGE
      // ==========================================

      user.profilePicture =
        `/uploads/profiles/${req.file.filename}`;


      await user.save();


      res.json({

        message:
          "Profile picture updated successfully.",

        user: {

          _id:
            user._id,

          fullName:
            user.fullName,

          email:
            user.email,

          profilePicture:
            user.profilePicture,

          role:
            user.role

        }

      });


    } catch (error) {

      console.error(
        "PROFILE PICTURE ERROR:",
        error
      );


      res.status(500).json({

        message:
          error.message

      });

    }

  }
);


// =====================================================
// REMOVE PROFILE PICTURE
// =====================================================

router.delete(
  "/profile-picture",
  protect,
  async (req, res) => {

    try {

      const user =
        await User.findById(
          req.user._id
        );


      if (!user) {

        return res.status(404).json({

          message:
            "User not found."

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
            "../public",
            user.profilePicture
          );


        if (
          fs.existsSync(imagePath)
        ) {

          fs.unlinkSync(
            imagePath
          );

        }

      }


      user.profilePicture =
        null;


      await user.save();


      res.json({

        message:
          "Profile picture removed.",

        user: {

          _id:
            user._id,

          fullName:
            user.fullName,

          email:
            user.email,

          profilePicture:
            null,

          role:
            user.role

        }

      });


    } catch (error) {

      console.error(
        "REMOVE PROFILE PICTURE ERROR:",
        error
      );


      res.status(500).json({

        message:
          error.message

      });

    }

  }
);


module.exports = router;