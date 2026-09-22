import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaStore,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaBoxOpen,
  FaCheckCircle,
  FaSpinner
} from "react-icons/fa";

import MarketplaceListing from "./MarketplaceListing";
import "./MarketplaceSellerProfile.css";

const MarketplaceSellerProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // =====================================================
  // STATE
  // =====================================================

  const [seller, setSeller] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // API URL
  // =====================================================

  const API_URL =
    import.meta.env.VITE_API_URL ||
    "https://busybiz-5.onrender.com/api";

  // =====================================================
  // LOAD SELLER PROFILE
  // =====================================================

  useEffect(() => {
    const fetchSellerProfile = async () => {
      if (!id) {
        setError("Seller ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/marketplace/seller/${id}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to load seller profile."
          );
        }

        if (!data.success) {
          throw new Error(
            data.message ||
              "Seller profile could not be loaded."
          );
        }

        setSeller(data.seller || null);
        setListings(
          Array.isArray(data.listings)
            ? data.listings
            : []
        );
      } catch (err) {
        console.error(
          "SELLER PROFILE ERROR:",
          err
        );

        setError(
          err.message ||
            "Unable to load seller profile."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSellerProfile();
  }, [id, API_URL]);

  // =====================================================
  // GO BACK
  // =====================================================

  const handleBack = () => {
    navigate(-1);
  };

  // =====================================================
  // FAVORITE
  // =====================================================

  const handleFavorite = (product) => {
    console.log(
      "Favorite seller product:",
      product
    );
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="marketplace-seller-profile-page">
        <div className="marketplace-seller-loading">
          <FaSpinner className="marketplace-spinner" />

          <h3>
            Loading seller profile...
          </h3>

          <p>
            Please wait while we load the
            seller's information.
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="marketplace-seller-profile-page">
        <div className="marketplace-seller-profile-topbar">
          <button
            type="button"
            className="marketplace-back-button"
            onClick={handleBack}
          >
            <FaArrowLeft />
            <span>Back</span>
          </button>
        </div>

        <div className="marketplace-seller-error">
          <FaStore />

          <h2>
            Unable to load seller profile
          </h2>

          <p>{error}</p>

          <button
            type="button"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // =====================================================
  // NO SELLER
  // =====================================================

  if (!seller) {
    return (
      <div className="marketplace-seller-profile-page">
        <div className="marketplace-seller-profile-topbar">
          <button
            type="button"
            className="marketplace-back-button"
            onClick={handleBack}
          >
            <FaArrowLeft />
            <span>Back</span>
          </button>
        </div>

        <div className="marketplace-seller-error">
          <FaStore />

          <h2>
            Seller not found
          </h2>

          <p>
            This seller profile is no longer
            available.
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // SELLER DATA
  // =====================================================

  const sellerName =
    seller.businessName ||
    seller.name ||
    "Business";

  const sellerDescription =
    seller.description ||
    "No business description available.";

  const sellerLocation =
    seller.location ||
    "Location not provided";

  const sellerPhone =
    seller.phone || "";

  const sellerEmail =
    seller.email || "";

  const sellerLogo =
    seller.logo || "";

  const sellerInitial =
    sellerName
      .charAt(0)
      .toUpperCase();

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="marketplace-seller-profile-page">

      {/* =================================================
          TOP BAR
      ================================================= */}

      <div className="marketplace-seller-profile-topbar">

        <button
          type="button"
          className="marketplace-back-button"
          onClick={handleBack}
        >
          <FaArrowLeft />

          <span>
            Back to Marketplace
          </span>
        </button>

      </div>

      {/* =================================================
          SELLER HEADER
      ================================================= */}

      <section className="marketplace-seller-header">

        <div className="marketplace-seller-header-inner">

          {/* LOGO */}

          <div className="marketplace-seller-profile-logo">

            {sellerLogo ? (
              <img
                src={sellerLogo}
                alt={sellerName}
                onError={(event) => {
                  event.currentTarget.style.display =
                    "none";
                }}
              />
            ) : (
              <span>
                {sellerInitial}
              </span>
            )}

          </div>

          {/* INFORMATION */}

          <div className="marketplace-seller-header-info">

            <div className="marketplace-seller-name-row">

              <h1>
                {sellerName}
              </h1>

              <FaCheckCircle
                className="marketplace-seller-verified"
                title="Verified Business"
              />

            </div>

            <p className="marketplace-seller-description">
              {sellerDescription}
            </p>

            {/* LOCATION */}

            <div className="marketplace-seller-contact-item">

              <FaMapMarkerAlt />

              <span>
                {sellerLocation}
              </span>

            </div>

            {/* PHONE */}

            {sellerPhone && (
              <div className="marketplace-seller-contact-item">

                <FaPhone />

                <span>
                  {sellerPhone}
                </span>

              </div>
            )}

            {/* EMAIL */}

            {sellerEmail && (
              <div className="marketplace-seller-contact-item">

                <FaEnvelope />

                <span>
                  {sellerEmail}
                </span>

              </div>
            )}

          </div>

        </div>

      </section>

      {/* =================================================
          SELLER CONTENT
      ================================================= */}

      <main className="marketplace-seller-profile-content">

        {/* =================================================
            STATS
        ================================================= */}

        <section className="marketplace-seller-stats">

          <div className="marketplace-seller-stat">

            <div className="marketplace-seller-stat-icon">
              <FaBoxOpen />
            </div>

            <div>
              <strong>
                {listings.length}
              </strong>

              <span>
                Active Listings
              </span>
            </div>

          </div>

          <div className="marketplace-seller-stat">

            <div className="marketplace-seller-stat-icon">
              <FaStore />
            </div>

            <div>
              <strong>
                Business
              </strong>

              <span>
                Marketplace Seller
              </span>
            </div>

          </div>

        </section>

        {/* =================================================
            PRODUCTS
        ================================================= */}

        <section className="marketplace-seller-products">

          <div className="marketplace-seller-products-header">

            <div>
              <h2>
                Products from {sellerName}
              </h2>

              <p>
                Browse this seller's available
                marketplace listings.
              </p>
            </div>

            <span className="marketplace-seller-product-count">
              {listings.length}{" "}
              {listings.length === 1
                ? "listing"
                : "listings"}
            </span>

          </div>

          {/* =================================================
              NO PRODUCTS
          ================================================= */}

          {listings.length === 0 ? (
            <div className="marketplace-no-seller-products">

              <FaBoxOpen />

              <h3>
                No active listings
              </h3>

              <p>
                This seller currently has no
                active marketplace listings.
              </p>

            </div>
          ) : (
            <div className="marketplace-seller-products-grid">

              {listings.map((product) => (
                <MarketplaceListing
                  key={
                    product._id ||
                    product.id
                  }
                  product={product}
                  onFavorite={
                    handleFavorite
                  }
                />
              ))}

            </div>
          )}

        </section>

      </main>

    </div>
  );
};

export default MarketplaceSellerProfile;
