const Business = require("../models/Business");
const BusinessMember = require("../models/BusinessMember");


// =====================================================
// GET BUSINESS FOR CURRENT USER
// =====================================================

const getUserBusiness = async (userId) => {

  // ---------------------------------------------------
  // FIRST: CHECK IF USER IS THE BUSINESS OWNER
  // ---------------------------------------------------

  const ownedBusiness = await Business.findOne({
    owner: userId
  });

  if (ownedBusiness) {
    return {
      business: ownedBusiness,
      role: "owner"
    };
  }


  // ---------------------------------------------------
  // SECOND: CHECK BUSINESS MEMBERSHIP
  // ---------------------------------------------------

  const membership =
    await BusinessMember.findOne({
      user: userId,
      status: "active"
    }).populate("business");

  if (!membership || !membership.business) {
    return null;
  }


  return {
    business: membership.business,
    role: membership.role
  };
};


// =====================================================
// REQUIRE BUSINESS ACCESS
// =====================================================

const businessAccess = async (
  req,
  res,
  next
) => {

  try {

    const userId = req.user.id;

    const result =
      await getUserBusiness(userId);


    if (!result) {
      return res.status(403).json({
        message:
          "You do not belong to a business"
      });
    }


    // Store business information
    // inside the request

    req.business =
      result.business;

    req.businessRole =
      result.role;


    next();

  } catch (error) {

    console.error(
      "BUSINESS ACCESS ERROR:",
      error
    );

    res.status(500).json({
      message: error.message
    });

  }
};


// =====================================================
// CHECK USER ROLE
// =====================================================

const requireRole = (
  ...allowedRoles
) => {

  return (req, res, next) => {

    if (!req.businessRole) {
      return res.status(403).json({
        message:
          "Business access required"
      });
    }


    if (
      !allowedRoles.includes(
        req.businessRole
      )
    ) {

      return res.status(403).json({
        message:
          "You do not have permission to perform this action"
      });

    }


    next();

  };

};


module.exports = {
  businessAccess,
  requireRole,
  getUserBusiness
};