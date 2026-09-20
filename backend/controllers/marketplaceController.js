const mongoose = require("mongoose");

const MarketplaceListing = require("../models/MarketplaceListing");
const User = require("../models/User");

// =====================================================
// CREATE MARKETPLACE LISTING
// =====================================================

const createListing = async (req, res) => {
  try {
    const {
      business,
      name,
      description,
      price,
      currency,
      category,
      condition,
      images,
      coverImage,
      location,
      contactPhone,
      contactEmail,
      expiresAt,
    } = req.body;

    // -------------------------------------------------
    // VALIDATION
    // -------------------------------------------------

    if (!business) {
      return res.status(400).json({
        success: false,
        message: "Business is required",
      });
    }

    if (
      !name ||
      !description ||
      price === undefined ||
      !category ||
      !location
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, description, price, category and location are required",
      });
    }

    if (Number(price) < 0) {
      return res.status(400).json({
        success: false,
        message: "Price cannot be negative",
      });
    }

    // -------------------------------------------------
    // CREATE LISTING
    // -------------------------------------------------

    const listing = await MarketplaceListing.create({
      seller: req.user._id,
      business,
      name,
      description,
      price,
      currency: currency || "USD",
      category,
      condition: condition || "new",
      images: Array.isArray(images) ? images : [],
      coverImage: coverImage || "",
      location,
      contactPhone: contactPhone || "",
      contactEmail: contactEmail || "",
      expiresAt: expiresAt || null,
      status: "active",
    });

    const populatedListing =
      await MarketplaceListing.findById(listing._id)
        .populate(
          "seller",
          "name email profilePicture phone"
        )
        .populate(
          "business",
          "businessName logo phone email location"
        );

    return res.status(201).json({
      success: true,
      message:
        "Marketplace listing created successfully",
      listing: populatedListing,
    });
  } catch (error) {
    console.error(
      "CREATE MARKETPLACE LISTING ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to create marketplace listing",
      error: error.message,
    });
  }
};

// =====================================================
// GET ALL MARKETPLACE LISTINGS
// =====================================================

const getListings = async (req, res) => {
  try {
    const {
      search,
      category,
      location,
      condition,
      minPrice,
      maxPrice,
      status,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {
      status: status || "active",
      isApproved: true,
    };

    // -------------------------------------------------
    // SEARCH
    // -------------------------------------------------

    if (search) {
      filter.$text = {
        $search: search,
      };
    }

    // -------------------------------------------------
    // CATEGORY
    // -------------------------------------------------

    if (category) {
      filter.category = category;
    }

    // -------------------------------------------------
    // LOCATION
    // -------------------------------------------------

    if (location) {
      filter.location = {
        $regex: location,
        $options: "i",
      };
    }

    // -------------------------------------------------
    // CONDITION
    // -------------------------------------------------

    if (condition) {
      filter.condition = condition;
    }

    // -------------------------------------------------
    // PRICE RANGE
    // -------------------------------------------------

    if (
      minPrice !== undefined ||
      maxPrice !== undefined
    ) {
      filter.price = {};

      if (minPrice !== undefined) {
        filter.price.$gte = Number(minPrice);
      }

      if (maxPrice !== undefined) {
        filter.price.$lte = Number(maxPrice);
      }
    }

    // -------------------------------------------------
    // PAGINATION
    // -------------------------------------------------

    const pageNumber = Math.max(
      Number(page) || 1,
      1
    );

    const limitNumber = Math.min(
      Math.max(Number(limit) || 20, 1),
      100
    );

    const skip =
      (pageNumber - 1) * limitNumber;

    // -------------------------------------------------
    // GET LISTINGS
    // -------------------------------------------------

    const [listings, total] =
      await Promise.all([
        MarketplaceListing.find(filter)
          .populate(
            "seller",
            "name email profilePicture phone"
          )
          .populate(
            "business",
            "businessName logo phone email location"
          )
          .sort({
            isFeatured: -1,
            createdAt: -1,
          })
          .skip(skip)
          .limit(limitNumber)
          .lean(),

        MarketplaceListing.countDocuments(
          filter
        ),
      ]);

    return res.status(200).json({
      success: true,
      listings,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.ceil(
          total / limitNumber
        ),
      },
    });
  } catch (error) {
    console.error(
      "GET MARKETPLACE LISTINGS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load marketplace listings",
      error: error.message,
    });
  }
};

// =====================================================
// GET SINGLE MARKETPLACE LISTING
// =====================================================

const getListingById = async (req, res) => {
  try {
    const { id } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid marketplace listing ID",
      });
    }

    const listing =
      await MarketplaceListing.findById(id)
        .populate(
          "seller",
          "name email profilePicture phone"
        )
        .populate(
          "business",
          "businessName logo phone email location"
        );

    if (!listing) {
      return res.status(404).json({
        success: false,
        message:
          "Marketplace listing not found",
      });
    }

    // -------------------------------------------------
    // INCREMENT VIEWS
    // -------------------------------------------------

    listing.views =
      Number(listing.views || 0) + 1;

    await listing.save();

    return res.status(200).json({
      success: true,
      listing,
    });
  } catch (error) {
    console.error(
      "GET MARKETPLACE LISTING ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load marketplace listing",
      error: error.message,
    });
  }
};

// =====================================================
// GET SELLER PROFILE
// =====================================================
//
// THIS IS THE IMPORTANT FUNCTION FOR:
// GET /api/marketplace/seller/:sellerId
//
// =====================================================

const getSellerProfile = async (req, res) => {
  try {
    const { sellerId } = req.params;

    console.log(
      "GET SELLER PROFILE:",
      sellerId
    );

    // -------------------------------------------------
    // VALIDATE SELLER ID
    // -------------------------------------------------

    if (
      !sellerId ||
      !mongoose.Types.ObjectId.isValid(
        sellerId
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid seller ID",
        sellerId,
        listings: [],
      });
    }

    // -------------------------------------------------
    // FIND USER
    // -------------------------------------------------

    const seller =
      await User.findById(sellerId)
        .select(
          [
            "name",
            "email",
            "phone",
            "profilePicture",
            "profileImage",
            "location",
            "city",
            "bio",
            "description",
            "businessName",
            "companyName",
            "verified",
            "isVerified",
            "createdAt",
          ].join(" ")
        )
        .lean();

    // -------------------------------------------------
    // SELLER DOES NOT EXIST
    // -------------------------------------------------

    if (!seller) {
      console.log(
        "SELLER NOT FOUND:",
        sellerId
      );

      return res.status(404).json({
        success: false,
        message: "Seller profile not found.",
        sellerId,
        listings: [],
      });
    }

    // -------------------------------------------------
    // FIND SELLER LISTINGS
    // -------------------------------------------------

    const listings =
      await MarketplaceListing.find({
        seller: sellerId,
        status: "active",
        isApproved: true,
      })
        .populate(
          "seller",
          "name email profilePicture phone"
        )
        .populate(
          "business",
          "businessName logo phone email location"
        )
        .sort({
          createdAt: -1,
        })
        .lean();

    // -------------------------------------------------
    // FIND BUSINESS INFORMATION
    // -------------------------------------------------

    let business = null;

    if (listings.length > 0) {
      const firstListing =
        listings[0];

      if (
        firstListing.business
      ) {
        business =
          firstListing.business;
      }
    }

    // -------------------------------------------------
    // CALCULATE SELLER STATISTICS
    // -------------------------------------------------

    const totalListings =
      listings.length;

    let totalViews = 0;
    let totalLikes = 0;

    listings.forEach((listing) => {
      totalViews += Number(
        listing.views || 0
      );

      totalLikes += Number(
        listing.likesCount || 0
      );
    });

    // -------------------------------------------------
    // BUSINESS NAME
    // -------------------------------------------------

    const businessName =
      business?.businessName ||
      seller.businessName ||
      seller.companyName ||
      seller.name ||
      "Business Seller";

    // -------------------------------------------------
    // LOCATION
    // -------------------------------------------------

    const location =
      business?.location ||
      seller.location ||
      seller.city ||
      "Location not provided";

    // -------------------------------------------------
    // PHONE
    // -------------------------------------------------

    const phone =
      business?.phone ||
      seller.phone ||
      "";

    // -------------------------------------------------
    // EMAIL
    // -------------------------------------------------

    const email =
      business?.email ||
      seller.email ||
      "";

    // -------------------------------------------------
    // LOGO
    // -------------------------------------------------

    const logo =
      business?.logo ||
      seller.profilePicture ||
      seller.profileImage ||
      "";

    // -------------------------------------------------
    // VERIFIED
    // -------------------------------------------------

    const verified =
      Boolean(
        seller.verified ||
        seller.isVerified
      );

    // -------------------------------------------------
    // MEMBER SINCE
    // -------------------------------------------------

    const memberSince =
      seller.createdAt ||
      null;

    // -------------------------------------------------
    // RETURN PROFILE
    // -------------------------------------------------

    return res.status(200).json({
      success: true,

      seller: {
        _id: seller._id,

        sellerId: seller._id,

        name: seller.name || "",

        businessName,

        companyName:
          seller.companyName || "",

        email,

        phone,

        location,

        description:
          seller.description ||
          seller.bio ||
          "",

        bio:
          seller.bio || "",

        logo,

        profilePicture:
          seller.profilePicture || "",

        profileImage:
          seller.profileImage || "",

        verified,

        rating: seller.rating || null,

        reviews:
          seller.reviews ||
          seller.reviewCount ||
          0,

        totalListings,

        totalViews,

        totalLikes,

        memberSince,

        createdAt:
          seller.createdAt,

        business: business
          ? {
              _id: business._id,
              businessName:
                business.businessName,
              logo:
                business.logo || "",
              phone:
                business.phone || "",
              email:
                business.email || "",
              location:
                business.location || "",
            }
          : null,
      },

      listings,

      statistics: {
        totalListings,
        totalViews,
        totalLikes,
      },
    });
  } catch (error) {
    console.error(
      "GET SELLER PROFILE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load seller profile",
      error: error.message,
      listings: [],
    });
  }
};

// =====================================================
// UPDATE MARKETPLACE LISTING
// =====================================================

const updateListing = async (req, res) => {
  try {
    const { id } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid marketplace listing ID",
      });
    }

    const listing =
      await MarketplaceListing.findById(id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message:
          "Marketplace listing not found",
      });
    }

    // -------------------------------------------------
    // OWNERSHIP CHECK
    // -------------------------------------------------

    if (
      listing.seller.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not allowed to edit this listing",
      });
    }

    const allowedFields = [
      "name",
      "description",
      "price",
      "currency",
      "category",
      "condition",
      "images",
      "coverImage",
      "location",
      "contactPhone",
      "contactEmail",
      "expiresAt",
      "status",
    ];

    allowedFields.forEach((field) => {
      if (
        req.body[field] !== undefined
      ) {
        listing[field] =
          req.body[field];
      }
    });

    await listing.save();

    const updatedListing =
      await MarketplaceListing.findById(id)
        .populate(
          "seller",
          "name email profilePicture phone"
        )
        .populate(
          "business",
          "businessName logo phone email location"
        );

    return res.status(200).json({
      success: true,
      message:
        "Marketplace listing updated successfully",
      listing: updatedListing,
    });
  } catch (error) {
    console.error(
      "UPDATE MARKETPLACE LISTING ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update marketplace listing",
      error: error.message,
    });
  }
};

// =====================================================
// DELETE MARKETPLACE LISTING
// =====================================================

const deleteListing = async (req, res) => {
  try {
    const { id } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid marketplace listing ID",
      });
    }

    const listing =
      await MarketplaceListing.findById(id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message:
          "Marketplace listing not found",
      });
    }

    // -------------------------------------------------
    // OWNERSHIP CHECK
    // -------------------------------------------------

    if (
      listing.seller.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not allowed to delete this listing",
      });
    }

    await listing.deleteOne();

    return res.status(200).json({
      success: true,
      message:
        "Marketplace listing deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE MARKETPLACE LISTING ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete marketplace listing",
      error: error.message,
    });
  }
};

// =====================================================
// LIKE / UNLIKE LISTING
// =====================================================

const toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid marketplace listing ID",
      });
    }

    const listing =
      await MarketplaceListing.findById(id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message:
          "Marketplace listing not found",
      });
    }

    const alreadyLiked =
      listing.likes.some(
        (user) =>
          user.toString() ===
          userId.toString()
      );

    if (alreadyLiked) {
      listing.likes =
        listing.likes.filter(
          (user) =>
            user.toString() !==
            userId.toString()
        );
    } else {
      listing.likes.push(userId);
    }

    listing.likesCount =
      listing.likes.length;

    await listing.save();

    return res.status(200).json({
      success: true,
      liked: !alreadyLiked,
      likesCount:
        listing.likesCount,
      message: alreadyLiked
        ? "Listing unliked"
        : "Listing liked successfully",
    });
  } catch (error) {
    console.error(
      "TOGGLE MARKETPLACE LIKE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update like",
      error: error.message,
    });
  }
};

// =====================================================
// GET USER'S LIKES
// =====================================================

const getLikedListings = async (
  req,
  res
) => {
  try {
    const listings =
      await MarketplaceListing.find({
        likes: req.user._id,
        status: "active",
        isApproved: true,
      })
        .populate(
          "seller",
          "name email profilePicture phone"
        )
        .populate(
          "business",
          "businessName logo phone email location"
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      listings,
    });
  } catch (error) {
    console.error(
      "GET LIKED LISTINGS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load liked listings",
      error: error.message,
    });
  }
};

// =====================================================
// GET MY MARKETPLACE LISTINGS
// =====================================================

const getMyListings = async (
  req,
  res
) => {
  try {
    const listings =
      await MarketplaceListing.find({
        seller: req.user._id,
      })
        .populate(
          "seller",
          "name email profilePicture phone"
        )
        .populate(
          "business",
          "businessName logo phone email location"
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
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
        "Failed to load your marketplace listings",
      error: error.message,
    });
  }
};

// =====================================================
// CONTACT SELLER
// =====================================================

const contactSeller = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid marketplace listing ID",
      });
    }

    const listing =
      await MarketplaceListing.findById(id)
        .populate(
          "seller",
          "name email"
        )
        .populate(
          "business",
          "businessName"
        );

    if (!listing) {
      return res.status(404).json({
        success: false,
        message:
          "Marketplace listing not found",
      });
    }

    // -------------------------------------------------
    // PREVENT SELF CONTACT
    // -------------------------------------------------

    if (
      listing.seller &&
      listing.seller._id.toString() ===
        req.user._id.toString()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot contact yourself about your own listing",
      });
    }

    // -------------------------------------------------
    // INCREASE INQUIRIES
    // -------------------------------------------------

    listing.inquiriesCount =
      Number(
        listing.inquiriesCount || 0
      ) + 1;

    await listing.save();

    return res.status(200).json({
      success: true,
      message:
        "Seller contact information retrieved",

      seller: {
        id:
          listing.seller?._id,
        name:
          listing.seller?.name || "",
        email:
          listing.seller?.email || "",
      },

      business: {
        id:
          listing.business?._id,
        name:
          listing.business?.businessName ||
          "",
      },

      contact: {
        phone:
          listing.contactPhone || "",
        email:
          listing.contactEmail || "",
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
        "Failed to contact seller",
      error: error.message,
    });
  }
};

// =====================================================
// GET FEATURED LISTINGS
// =====================================================

const getFeaturedListings = async (
  req,
  res
) => {
  try {
    const listings =
      await MarketplaceListing.find({
        status: "active",
        isApproved: true,
        isFeatured: true,

        $or: [
          {
            featuredUntil: null,
          },
          {
            featuredUntil: {
              $gt: new Date(),
            },
          },
        ],
      })
        .populate(
          "seller",
          "name profilePicture phone"
        )
        .populate(
          "business",
          "businessName logo phone email location"
        )
        .sort({
          createdAt: -1,
        })
        .limit(20);

    return res.status(200).json({
      success: true,
      listings,
    });
  } catch (error) {
    console.error(
      "GET FEATURED LISTINGS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load featured listings",
      error: error.message,
    });
  }
};

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  createListing,
  getListings,
  getListingById,
  getSellerProfile,
  updateListing,
  deleteListing,
  toggleLike,
  getLikedListings,
  getMyListings,
  contactSeller,
  getFeaturedListings,
};