const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const MarketplaceListing = require("../models/MarketplaceListing");

const protect = require("../middleware/authMiddleware");
const {
  businessAccess,
} = require("../middleware/businessAccessMiddleware");
const requirePlan = require("../middleware/subscriptionMiddleware");

const router = express.Router();

// =====================================================
// UPLOAD DIRECTORY
// =====================================================

const uploadDirectory = path.join(
  process.cwd(),
  "uploads",
  "marketplace"
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
    const extension = path
      .extname(file.originalname)
      .toLowerCase();

    const filename = `marketplace-${Date.now()}-${Math.round(
      Math.random() * 1000000000
    )}${extension}`;

    cb(null, filename);
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
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only JPG, JPEG, PNG and WEBP images are allowed."
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
    files: 8,
    fileSize: 5 * 1024 * 1024,
  },
});

// =====================================================
// HELPERS
// =====================================================

const toNumber = (value) => {
  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
};

// =====================================================
// ESCAPE REGEX
// =====================================================

const escapeRegex = (value) => {
  return String(value).replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
};

// =====================================================
// DELETE UPLOADED FILES
// =====================================================

const deleteUploadedFiles = (files = []) => {
  if (!Array.isArray(files)) {
    return;
  }

  files.forEach((file) => {
    try {
      if (
        file &&
        file.path &&
        fs.existsSync(file.path)
      ) {
        fs.unlinkSync(file.path);
      }
    } catch (error) {
      console.error(
        "DELETE MARKETPLACE FILE ERROR:",
        error
      );
    }
  });
};

// =====================================================
// DELETE LISTING IMAGES
// =====================================================

const deleteListingImages = (images = []) => {
  if (!Array.isArray(images)) {
    return;
  }

  images.forEach((imagePath) => {
    if (typeof imagePath !== "string") {
      return;
    }

    const filename = path.basename(imagePath);

    const imageFile = path.join(
      uploadDirectory,
      filename
    );

    try {
      if (fs.existsSync(imageFile)) {
        fs.unlinkSync(imageFile);
      }
    } catch (error) {
      console.error(
        "DELETE MARKETPLACE IMAGE ERROR:",
        error
      );
    }
  });
};

// =====================================================
// CREATE LISTING
// =====================================================

router.post(
  "/",
  protect,
  businessAccess,
  requirePlan([
    "professional",
    "Professional",
  ]),
  upload.array("images", 8),

  async (req, res) => {
    try {
      const business = req.business;

      if (!business) {
        deleteUploadedFiles(req.files);

        return res.status(400).json({
          success: false,
          message:
            "Business information is required.",
        });
      }

      const {
        title,
        description,
        price,
        currency,
        category,
        location,
        condition,
        quantity,
        contactPhone,
        contactEmail,
        contactWhatsApp,
      } = req.body;

      // =================================================
      // VALIDATION
      // =================================================

      if (!title || !title.trim()) {
        deleteUploadedFiles(req.files);

        return res.status(400).json({
          success: false,
          message:
            "Product title is required.",
        });
      }

      if (
        !description ||
        !description.trim()
      ) {
        deleteUploadedFiles(req.files);

        return res.status(400).json({
          success: false,
          message:
            "Product description is required.",
        });
      }

      if (
        price === undefined ||
        price === null ||
        price === ""
      ) {
        deleteUploadedFiles(req.files);

        return res.status(400).json({
          success: false,
          message:
            "Product price is required.",
        });
      }

      const numericPrice = toNumber(price);

      if (numericPrice < 0) {
        deleteUploadedFiles(req.files);

        return res.status(400).json({
          success: false,
          message:
            "Price cannot be negative.",
        });
      }

      if (
        !category ||
        !category.trim()
      ) {
        deleteUploadedFiles(req.files);

        return res.status(400).json({
          success: false,
          message:
            "Product category is required.",
        });
      }

      if (
        !location ||
        !location.trim()
      ) {
        deleteUploadedFiles(req.files);

        return res.status(400).json({
          success: false,
          message:
            "Product location is required.",
        });
      }

      // =================================================
      // IMAGES
      // =================================================

      const imageUrls = Array.isArray(
        req.files
      )
        ? req.files.map(
            (file) =>
              `/uploads/marketplace/${file.filename}`
          )
        : [];

      if (imageUrls.length === 0) {
        return res.status(400).json({
          success: false,
          message:
            "Please upload at least one product image.",
        });
      }

      // =================================================
      // CREATE LISTING
      // =================================================

      const listing =
        await MarketplaceListing.create({
          business: business._id,
          seller: req.user._id,

          title: title.trim(),

          description:
            description.trim(),

          price: numericPrice,

          currency:
            currency &&
            currency.trim()
              ? currency.trim()
              : "USD",

          category:
            category.trim(),

          location:
            location.trim(),

          condition:
            condition &&
            condition.trim()
              ? condition.trim()
              : "new",

          quantity: Math.max(
            0,
            Math.floor(
              toNumber(
                quantity || 1
              )
            )
          ),

          images: imageUrls,

          coverImage:
            imageUrls[0] || "",

          contactPhone:
            contactPhone &&
            contactPhone.trim()
              ? contactPhone.trim()
              : "",

          contactEmail:
            contactEmail &&
            contactEmail.trim()
              ? contactEmail.trim()
              : "",

          contactWhatsApp:
            contactWhatsApp &&
            contactWhatsApp.trim()
              ? contactWhatsApp.trim()
              : "",

          status: "active",

          isApproved: true,
        });

      // =================================================
      // POPULATE CREATED LISTING
      // =================================================

      const populatedListing =
        await MarketplaceListing.findById(
          listing._id
        )
          .populate(
            "business",
            "businessName category description phone location image"
          )
          .populate(
            "seller",
            "name email profilePicture"
          )
          .lean();

      return res.status(201).json({
        success: true,

        message:
          "Marketplace listing created successfully.",

        listing: populatedListing,
      });
    } catch (error) {
      console.error(
        "CREATE MARKETPLACE LISTING ERROR:",
        error
      );

      deleteUploadedFiles(req.files);

      return res.status(500).json({
        success: false,

        message:
          error.message ||
          "Unable to create marketplace listing.",
      });
    }
  }
);

// =====================================================
// GET MY LISTINGS
// =====================================================

router.get(
  "/mine",
  protect,
  businessAccess,
  requirePlan([
    "professional",
    "Professional",
  ]),

  async (req, res) => {
    try {
      const listings =
        await MarketplaceListing.find({
          business: req.business._id,
          seller: req.user._id,
        })
          .populate(
            "business",
            "businessName category description phone location image"
          )
          .populate(
            "seller",
            "name email profilePicture"
          )
          .sort({
            createdAt: -1,
          })
          .lean();

      return res.json({
        success: true,
        count: listings.length,
        listings,
      });
    } catch (error) {
      console.error(
        "GET MY MARKETPLACE LISTINGS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load your marketplace listings.",
      });
    }
  }
);

// =====================================================
// GET LIKED LISTINGS
// =====================================================

router.get(
  "/liked",
  protect,

  async (req, res) => {
    try {
      const listings =
        await MarketplaceListing.find({
          likes: req.user._id,
          status: "active",
          isApproved: true,
        })
          .populate(
            "business",
            "businessName category description phone location image"
          )
          .populate(
            "seller",
            "name email profilePicture"
          )
          .sort({
            createdAt: -1,
          })
          .lean();

      return res.json({
        success: true,
        count: listings.length,
        listings,
      });
    } catch (error) {
      console.error(
        "GET LIKED MARKETPLACE LISTINGS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load liked listings.",
      });
    }
  }
);

// =====================================================
// GET ALL MARKETPLACE LISTINGS
// =====================================================

router.get(
  "/",

  async (req, res) => {
    try {
      const {
        search,
        category,
        location,
        condition,
        minPrice,
        maxPrice,
        sort,
      } = req.query;

      const filter = {
        status: "active",
        isApproved: true,
      };

      // =================================================
      // SEARCH
      // =================================================

      if (
        search &&
        search.trim()
      ) {
        const escapedSearch =
          escapeRegex(
            search.trim()
          );

        filter.$or = [
          {
            title: {
              $regex:
                escapedSearch,
              $options: "i",
            },
          },

          {
            description: {
              $regex:
                escapedSearch,
              $options: "i",
            },
          },

          {
            category: {
              $regex:
                escapedSearch,
              $options: "i",
            },
          },

          {
            location: {
              $regex:
                escapedSearch,
              $options: "i",
            },
          },
        ];
      }

      // =================================================
      // CATEGORY
      // =================================================

      if (
        category &&
        category.trim()
      ) {
        const escapedCategory =
          escapeRegex(
            category.trim()
          );

        filter.category = {
          $regex: `^${escapedCategory}$`,
          $options: "i",
        };
      }

      // =================================================
      // LOCATION
      // =================================================

      if (
        location &&
        location.trim()
      ) {
        const escapedLocation =
          escapeRegex(
            location.trim()
          );

        filter.location = {
          $regex:
            escapedLocation,
          $options: "i",
        };
      }

      // =================================================
      // CONDITION
      // =================================================

      if (
        condition &&
        condition.trim()
      ) {
        filter.condition =
          condition.trim();
      }

      // =================================================
      // PRICE
      // =================================================

      if (
        (minPrice !== undefined &&
          minPrice !== "") ||
        (maxPrice !== undefined &&
          maxPrice !== "")
      ) {
        filter.price = {};

        if (
          minPrice !== undefined &&
          minPrice !== ""
        ) {
          filter.price.$gte =
            Math.max(
              0,
              toNumber(minPrice)
            );
        }

        if (
          maxPrice !== undefined &&
          maxPrice !== ""
        ) {
          filter.price.$lte =
            Math.max(
              0,
              toNumber(maxPrice)
            );
        }
      }

      // =================================================
      // SORT
      // =================================================

      let sortOption = {
        createdAt: -1,
      };

      if (sort === "price_low") {
        sortOption = {
          price: 1,
        };
      }

      if (sort === "price_high") {
        sortOption = {
          price: -1,
        };
      }

      if (sort === "popular") {
        sortOption = {
          views: -1,
          createdAt: -1,
        };
      }

      if (sort === "likes") {
        sortOption = {
          likesCount: -1,
          createdAt: -1,
        };
      }

      // =================================================
      // QUERY
      // =================================================

      const listings =
        await MarketplaceListing.find(
          filter
        )
          .populate(
            "business",
            "businessName category description phone location image"
          )
          .populate(
            "seller",
            "name email profilePicture"
          )
          .sort(sortOption)
          .lean();

      return res.json({
        success: true,
        count: listings.length,
        listings,
      });
    } catch (error) {
      console.error(
        "GET MARKETPLACE LISTINGS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load marketplace.",
      });
    }
  }
);

// =====================================================
// CONTACT SELLER
// =====================================================

router.get(
  "/:id/contact",

  async (req, res) => {
    try {
      const { id } =
        req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid listing ID.",
        });
      }

      const listing =
        await MarketplaceListing.findOne(
          {
            _id: id,
            status: "active",
          }
        )
          .populate(
            "seller",
            "name email"
          )
          .populate(
            "business",
            "businessName category description phone location image"
          );

      if (!listing) {
        return res.status(404).json({
          success: false,
          message:
            "Marketplace listing not found.",
        });
      }

      listing.inquiriesCount =
        toNumber(
          listing.inquiriesCount
        ) + 1;

      await listing.save();

      const sellerId =
        listing.seller?._id ||
        listing.seller;

      return res.json({
        success: true,

        message:
          "Seller contact information retrieved successfully.",

        seller: {
          id: sellerId,

          name:
            listing.seller?.name ||
            "Seller",

          email:
            listing.contactEmail ||
            listing.seller?.email ||
            "",
        },

        business: {
          id:
            listing.business?._id ||
            null,

          name:
            listing.business
              ?.businessName ||
            "",
        },

        contact: {
          phone:
            listing.contactPhone ||
            listing.business?.phone ||
            "",

          email:
            listing.contactEmail ||
            listing.business?.email ||
            listing.seller?.email ||
            "",

          whatsapp:
            listing.contactWhatsApp ||
            listing.business?.phone ||
            "",
        },

        listing: {
          id: listing._id,

          title:
            listing.title,

          price:
            listing.price,
        },
      });
    } catch (error) {
      console.error(
        "CONTACT SELLER ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to retrieve seller contact information.",
      });
    }
  }
);

// =====================================================
// SELLER PROFILE
//
// ACCEPTS:
// 1. Business ID
// 2. User/Seller ID
//
// IMPORTANT:
// Business model uses "image", NOT "logo".
// =====================================================

router.get(
  "/seller/:id",

  async (req, res) => {
    try {
      const { id } =
        req.params;

      console.log(
        "========================================"
      );

      console.log(
        "MARKETPLACE SELLER PROFILE REQUEST"
      );

      console.log(
        "Received ID:",
        id
      );

      console.log(
        "========================================"
      );

      // =================================================
      // VALIDATE ID
      // =================================================

      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid seller ID.",
          sellerId: id,
        });
      }

      // =================================================
      // FIRST: SEARCH BY BUSINESS ID
      // =================================================

      let listings =
        await MarketplaceListing.find(
          {
            business: id,
            status: "active",
            isApproved: true,
          }
        )
          .populate(
            "business",
            "businessName category description phone location image"
          )
          .populate(
            "seller",
            "name email profilePicture"
          )
          .sort({
            createdAt: -1,
          })
          .lean();

      console.log(
        "Listings found using business ID:",
        listings.length
      );

      // =================================================
      // SECOND: SEARCH BY SELLER/USER ID
      // =================================================

      if (
        listings.length === 0
      ) {
        listings =
          await MarketplaceListing.find(
            {
              seller: id,
              status: "active",
              isApproved: true,
            }
          )
            .populate(
              "business",
              "businessName category description phone location image"
            )
            .populate(
              "seller",
              "name email profilePicture"
            )
            .sort({
              createdAt: -1,
            })
            .lean();

        console.log(
          "Listings found using seller ID:",
          listings.length
        );
      }

      // =================================================
      // NO LISTINGS
      // =================================================

      if (
        listings.length === 0
      ) {
        console.log(
          "SELLER PROFILE NOT FOUND:",
          id
        );

        return res.status(404).json({
          success: false,

          message:
            "Seller profile not found.",

          sellerId: id,

          listings: [],
        });
      }

      // =================================================
      // GET FIRST LISTING
      // =================================================

      const firstListing =
        listings[0];

      const business =
        firstListing.business ||
        null;

      const seller =
        firstListing.seller ||
        null;

      // =================================================
      // BUILD SELLER PROFILE
      // =================================================

      const sellerProfile = {
        _id:
          business?._id ||
          seller?._id ||
          id,

        businessName:
          business?.businessName ||
          seller?.name ||
          "Seller",

        name:
          business?.businessName ||
          seller?.name ||
          "Seller",

        // IMPORTANT:
        // Business schema uses "image"
        image:
          business?.image ||
          "",

        // Also provide logo for frontend
        // components that expect "logo".
        logo:
          business?.image ||
          "",

        category:
          business?.category ||
          "",

        description:
          business?.description ||
          "",

        location:
          business?.location ||
          "",

        phone:
          business?.phone ||
          "",

        email:
          seller?.email ||
          "",

        sellerId:
          seller?._id ||
          null,

        businessId:
          business?._id ||
          null,
      };

      // =================================================
      // RESPONSE
      // =================================================

      return res.json({
        success: true,

        seller:
          sellerProfile,

        listings,

        count:
          listings.length,
      });
    } catch (error) {
      console.error(
        "========================================"
      );

      console.error(
        "SELLER PROFILE ERROR:"
      );

      console.error(error);

      console.error(
        "========================================"
      );

      return res.status(500).json({
        success: false,

        message:
          "Unable to load seller profile.",

        error:
          process.env.NODE_ENV ===
          "development"
            ? error.message
            : undefined,
      });
    }
  }
);

// =====================================================
// LIKE / UNLIKE
// =====================================================

router.post(
  "/:id/like",
  protect,

  async (req, res) => {
    try {
      const { id } =
        req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid marketplace listing ID.",
        });
      }

      const listing =
        await MarketplaceListing.findOne(
          {
            _id: id,
            status: "active",
          }
        );

      if (!listing) {
        return res.status(404).json({
          success: false,
          message:
            "Marketplace listing not found.",
        });
      }

      if (
        !Array.isArray(
          listing.likes
        )
      ) {
        listing.likes = [];
      }

      const userId =
        req.user._id.toString();

      const alreadyLiked =
        listing.likes.some(
          (user) =>
            user.toString() ===
            userId
        );

      if (alreadyLiked) {
        listing.likes =
          listing.likes.filter(
            (user) =>
              user.toString() !==
              userId
          );

        listing.likesCount =
          listing.likes.length;

        await listing.save();

        return res.json({
          success: true,
          liked: false,
          likesCount:
            listing.likesCount,
        });
      }

      listing.likes.push(
        req.user._id
      );

      listing.likesCount =
        listing.likes.length;

      await listing.save();

      return res.json({
        success: true,
        liked: true,
        likesCount:
          listing.likesCount,
      });
    } catch (error) {
      console.error(
        "LIKE ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to update like.",
      });
    }
  }
);

// =====================================================
// GET SINGLE LISTING
//
// KEEP THIS AFTER ALL NAMED ROUTES
// =====================================================

router.get(
  "/:id",

  async (req, res) => {
    try {
      const { id } =
        req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid listing ID.",
        });
      }

      const listing =
        await MarketplaceListing.findOne(
          {
            _id: id,
            status: "active",
          }
        )
          .populate(
            "business",
            "businessName category description phone location image"
          )
          .populate(
            "seller",
            "name email profilePicture"
          );

      if (!listing) {
        return res.status(404).json({
          success: false,
          message:
            "Marketplace listing not found.",
        });
      }

      listing.views =
        toNumber(
          listing.views
        ) + 1;

      await listing.save();

      return res.json({
        success: true,

        listing:
          listing.toObject(),
      });
    } catch (error) {
      console.error(
        "GET SINGLE LISTING ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load marketplace listing.",
      });
    }
  }
);

// =====================================================
// UPDATE LISTING
// =====================================================

router.put(
  "/:id",
  protect,
  businessAccess,
  requirePlan([
    "professional",
    "Professional",
  ]),
  upload.array("images", 8),

  async (req, res) => {
    try {
      const { id } =
        req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        deleteUploadedFiles(
          req.files
        );

        return res.status(400).json({
          success: false,
          message:
            "Invalid marketplace listing ID.",
        });
      }

      const listing =
        await MarketplaceListing.findOne(
          {
            _id: id,
            business:
              req.business._id,
            seller:
              req.user._id,
          }
        );

      if (!listing) {
        deleteUploadedFiles(
          req.files
        );

        return res.status(404).json({
          success: false,
          message:
            "Marketplace listing not found.",
        });
      }

      // =================================================
      // TEXT FIELDS
      // =================================================

      const fields = [
        "title",
        "description",
        "currency",
        "category",
        "location",
        "condition",
        "contactPhone",
        "contactEmail",
        "contactWhatsApp",
        "status",
      ];

      fields.forEach(
        (field) => {
          if (
            req.body[field] !==
            undefined
          ) {
            const value =
              req.body[field];

            listing[field] =
              typeof value ===
              "string"
                ? value.trim()
                : value;
          }
        }
      );

      // =================================================
      // PRICE
      // =================================================

      if (
        req.body.price !==
        undefined
      ) {
        const numericPrice =
          toNumber(
            req.body.price
          );

        if (
          numericPrice < 0
        ) {
          deleteUploadedFiles(
            req.files
          );

          return res.status(400).json({
            success: false,
            message:
              "Price cannot be negative.",
          });
        }

        listing.price =
          numericPrice;
      }

      // =================================================
      // QUANTITY
      // =================================================

      if (
        req.body.quantity !==
        undefined
      ) {
        listing.quantity =
          Math.max(
            0,
            Math.floor(
              toNumber(
                req.body.quantity
              )
            )
          );
      }

      // =================================================
      // REPLACE IMAGES
      // =================================================

      if (
        req.files &&
        req.files.length > 0
      ) {
        const oldImages =
          Array.isArray(
            listing.images
          )
            ? [
                ...listing.images,
              ]
            : [];

        const newImages =
          req.files.map(
            (file) =>
              `/uploads/marketplace/${file.filename}`
          );

        listing.images =
          newImages.slice(
            0,
            8
          );

        listing.coverImage =
          listing.images[0] ||
          "";

        deleteListingImages(
          oldImages
        );
      }

      await listing.save();

      const updatedListing =
        await MarketplaceListing.findById(
          listing._id
        )
          .populate(
            "business",
            "businessName category description phone location image"
          )
          .populate(
            "seller",
            "name email profilePicture"
          )
          .lean();

      return res.json({
        success: true,

        message:
          "Marketplace listing updated successfully.",

        listing:
          updatedListing,
      });
    } catch (error) {
      console.error(
        "UPDATE LISTING ERROR:",
        error
      );

      deleteUploadedFiles(
        req.files
      );

      return res.status(500).json({
        success: false,

        message:
          error.message ||
          "Unable to update marketplace listing.",
      });
    }
  }
);

// =====================================================
// DELETE LISTING
// =====================================================

router.delete(
  "/:id",
  protect,
  businessAccess,
  requirePlan([
    "professional",
    "Professional",
  ]),

  async (req, res) => {
    try {
      const { id } =
        req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid marketplace listing ID.",
        });
      }

      const listing =
        await MarketplaceListing.findOne(
          {
            _id: id,
            business:
              req.business._id,
            seller:
              req.user._id,
          }
        );

      if (!listing) {
        return res.status(404).json({
          success: false,
          message:
            "Marketplace listing not found.",
        });
      }

      const listingImages =
        Array.isArray(
          listing.images
        )
          ? listing.images
          : [];

      deleteListingImages(
        listingImages
      );

      await listing.deleteOne();

      return res.json({
        success: true,

        message:
          "Marketplace listing deleted successfully.",
      });
    } catch (error) {
      console.error(
        "DELETE LISTING ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to delete marketplace listing.",
      });
    }
  }
);

// =====================================================
// MULTER ERROR HANDLER
// =====================================================

router.use(
  (
    error,
    req,
    res,
    next
  ) => {
    if (
      error instanceof
      multer.MulterError
    ) {
      if (
        error.code ===
        "LIMIT_FILE_SIZE"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Each image must be 5MB or smaller.",
        });
      }

      if (
        error.code ===
        "LIMIT_FILE_COUNT"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "You can upload a maximum of 8 images.",
        });
      }

      if (
        error.code ===
        "LIMIT_UNEXPECTED_FILE"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Unexpected image upload field.",
        });
      }

      return res.status(400).json({
        success: false,
        message:
          error.message,
      });
    }

    if (error) {
      return res.status(400).json({
        success: false,
        message:
          error.message ||
          "Image upload failed.",
      });
    }

    next();
  }
);

// =====================================================
// EXPORT
// =====================================================

module.exports = router;