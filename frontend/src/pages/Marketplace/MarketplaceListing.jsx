import React from "react";
import { useNavigate } from "react-router-dom";

import {
  FaHeart,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaEye,
  FaStore
} from "react-icons/fa";

import "./MarketplaceListing.css";

function MarketplaceListing({
  product = {},
  onFavorite,
  isFavorite = false
}) {
  const navigate = useNavigate();

  // =====================================================
  // PRODUCT DATA
  // =====================================================

  const {
    _id,
    id,

    name,
    title,

    price = 0,
    currency = "USD",

    image,
    images = [],

    category = "General",
    condition = "new",
    location = "Harare, Zimbabwe",

    business,
    seller,

    views = 0,
    status,
    quantity,
    verified,
    createdAt
  } = product;

  // =====================================================
  // PRODUCT ID
  // =====================================================

  const productId = _id || id || null;

  // =====================================================
  // NORMALIZE BUSINESS
  // =====================================================

  let businessData = {};

  if (
    business &&
    typeof business === "object"
  ) {
    businessData = business;
  }

  // =====================================================
  // NORMALIZE SELLER
  // =====================================================

  let sellerData = {};

  if (
    seller &&
    typeof seller === "object"
  ) {
    sellerData = seller;
  }

  // =====================================================
  // BUSINESS ID
  // =====================================================

  const businessId =
    businessData?._id ||
    businessData?.id ||
    null;

  // =====================================================
  // SELLER ID
  // =====================================================

  const sellerId =
    sellerData?._id ||
    sellerData?.id ||
    null;

  // =====================================================
  // PRODUCT NAME
  // =====================================================

  const productName =
    title ||
    name ||
    "Product";

  // =====================================================
  // PRODUCT IMAGE
  // =====================================================

  const productImage =
    image ||
    (
      Array.isArray(images) &&
      images.length > 0
    )
      ? images[0]
      : null;

  // =====================================================
  // SELLER / BUSINESS NAME
  // =====================================================

  const sellerName =
    businessData?.businessName ||
    businessData?.name ||
    sellerData?.businessName ||
    sellerData?.name ||
    sellerData?.fullName ||
    "Business";

  // =====================================================
  // SELLER INITIAL
  // =====================================================

  const sellerInitial =
    sellerName
      .charAt(0)
      .toUpperCase();

  // =====================================================
  // SELLER LOGO
  // =====================================================

  const sellerLogo =
    businessData?.logo ||
    businessData?.image ||
    sellerData?.logo ||
    sellerData?.profilePicture ||
    null;

  // =====================================================
  // VERIFIED
  // =====================================================

  const isVerified =
    verified ??
    businessData?.verified ??
    sellerData?.verified ??
    true;

  // =====================================================
  // PRICE
  // =====================================================

  const formattedPrice =
    Number(price || 0).toLocaleString(
      "en-US",
      {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }
    );

  // =====================================================
  // CONDITION
  // =====================================================

  const normalizedCondition =
    String(condition || "new")
      .toLowerCase();

  const isUsed =
    normalizedCondition === "used";

  // =====================================================
  // STATUS
  // =====================================================

  const listingStatus =
    status ||
    condition ||
    "New";

  // =====================================================
  // VIEW PRODUCT
  // =====================================================

  const handleViewProduct = () => {
    if (!productId) {
      console.warn(
        "MarketplaceListing: Product ID is missing.",
        product
      );

      return;
    }

    navigate(
      `/marketplace/product/${productId}`
    );
  };

  // =====================================================
  // VIEW SELLER PROFILE
  // =====================================================

  const handleViewSeller = (event) => {
    event.stopPropagation();

    /*
     * IMPORTANT:
     *
     * We ONLY use an actual MongoDB ID here.
     *
     * We do NOT use:
     *
     * businessName
     * name
     * sellerName
     *
     * as the ID.
     */

    if (!businessId) {
      console.warn(
        "MarketplaceListing: Business ID is missing.",
        {
          product,
          business,
          seller
        }
      );

      return;
    }

    console.log(
      "Opening seller profile:",
      businessId
    );

    navigate(
      `/marketplace/seller/${businessId}`
    );
  };

  // =====================================================
  // FAVORITE
  // =====================================================

  const handleFavorite = (event) => {
    event.stopPropagation();

    if (onFavorite) {
      onFavorite(product);
    }
  };

  // =====================================================
  // IMAGE ERROR
  // =====================================================

  const handleImageError = (event) => {
    event.currentTarget.style.display =
      "none";

    const parent =
      event.currentTarget.parentElement;

    if (parent) {
      parent.classList.add(
        "marketplace-image-fallback"
      );
    }
  };

  // =====================================================
  // LISTING DATE
  // =====================================================

  const getListingDate = () => {
    if (!createdAt) {
      return "Recently listed";
    }

    const date =
      new Date(createdAt);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "Recently listed";
    }

    const now =
      new Date();

    const difference =
      now.getTime() -
      date.getTime();

    const days =
      Math.floor(
        difference /
          (1000 * 60 * 60 * 24)
      );

    if (days <= 0) {
      return "Today";
    }

    if (days === 1) {
      return "1 day ago";
    }

    if (days < 30) {
      return `${days} days ago`;
    }

    return date.toLocaleDateString(
      "en-US",
      {
        day: "numeric",
        month: "short",
        year: "numeric"
      }
    );
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <article
      className="marketplace-listing-card"
      onClick={handleViewProduct}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (
          event.key === "Enter" ||
          event.key === " "
        ) {
          event.preventDefault();

          handleViewProduct();
        }
      }}
    >

      {/* =================================================
          IMAGE
      ================================================= */}

      <div className="marketplace-listing-image-wrapper">

        {/* CONDITION */}

        <span
          className={`marketplace-condition-badge ${
            isUsed
              ? "marketplace-condition-used"
              : "marketplace-condition-new"
          }`}
        >
          {listingStatus}
        </span>

        {/* FAVORITE */}

        <button
          type="button"
          className={`marketplace-favorite-button ${
            isFavorite
              ? "marketplace-favorite-active"
              : ""
          }`}
          onClick={handleFavorite}
          aria-label={
            isFavorite
              ? "Remove from favorites"
              : "Add to favorites"
          }
        >
          <FaHeart />
        </button>

        {/* PRODUCT IMAGE */}

        <div className="marketplace-listing-image">

          {productImage ? (
            <img
              src={productImage}
              alt={productName}
              onError={handleImageError}
            />
          ) : (
            <div className="marketplace-listing-no-image">

              <FaStore />

              <span>
                No Image
              </span>

            </div>
          )}

        </div>

      </div>

      {/* =================================================
          PRODUCT INFORMATION
      ================================================= */}

      <div className="marketplace-listing-content">

        {/* NAME + PRICE */}

        <div className="marketplace-listing-title-row">

          <h3>
            {productName}
          </h3>

          <div className="marketplace-listing-price">

            <span>
              {currency}
            </span>

            {formattedPrice}

          </div>

        </div>

        {/* CATEGORY + CONDITION */}

        <div className="marketplace-listing-meta">

          <span>
            {condition}
          </span>

          <span className="marketplace-meta-dot">
            •
          </span>

          <span>
            {category}
          </span>

        </div>

        {/* LOCATION */}

        <div className="marketplace-listing-location">

          <FaMapMarkerAlt />

          <span>
            {location}
          </span>

        </div>

        {/* =================================================
            SELLER
        ================================================= */}

        <div
          className="marketplace-listing-seller"
          onClick={handleViewSeller}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (
              event.key === "Enter" ||
              event.key === " "
            ) {
              event.preventDefault();

              handleViewSeller(event);
            }
          }}
          title={
            businessId
              ? "View seller profile"
              : "Seller profile unavailable"
          }
        >

          {/* SELLER AVATAR */}

          <div className="marketplace-seller-avatar">

            {sellerLogo ? (
              <img
                src={sellerLogo}
                alt={sellerName}
              />
            ) : (
              sellerInitial
            )}

          </div>

          {/* SELLER DETAILS */}

          <div className="marketplace-seller-details">

            <div className="marketplace-seller-name">

              <strong>
                {sellerName}
              </strong>

              {isVerified && (
                <FaCheckCircle
                  className="marketplace-verified-icon"
                  title="Verified Business"
                />
              )}

            </div>

            <span>
              {getListingDate()}
            </span>

          </div>

          {/* VIEWS */}

          <div className="marketplace-listing-views">

            <FaEye />

            <span>
              {views || 0}
            </span>

          </div>

        </div>

        {/* =================================================
            QUANTITY
        ================================================= */}

        {quantity !== undefined &&
          quantity !== null && (
            <div className="marketplace-listing-stock">

              <span>
                {quantity > 0
                  ? `${quantity} available`
                  : "Out of stock"}
              </span>

            </div>
          )}

      </div>

    </article>
  );
}

export default MarketplaceListing;