import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaHeart,
  FaMapMarkerAlt,
  FaBoxOpen,
  FaSpinner,
  FaExclamationCircle,
  FaArrowLeft,
  FaStore,
} from "react-icons/fa";

import "./MyListings.css";

function MyListings() {
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  // =====================================================
  // API BASE URL
  // =====================================================

  const API_BASE_URL = "http://localhost:5000/api";

  // =====================================================
  // GET AUTH TOKEN
  // =====================================================

  const getToken = () => {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("accessToken")
    );
  };

  // =====================================================
  // LOAD MY LISTINGS
  // =====================================================

  const fetchMyListings = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        setError("You are not logged in.");
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/marketplace/mine`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load your listings."
        );
      }

      setListings(
        Array.isArray(data.listings)
          ? data.listings
          : []
      );
    } catch (err) {
      console.error(
        "MY LISTINGS ERROR:",
        err
      );

      setError(
        err.message ||
          "Unable to load your marketplace listings."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD ON PAGE OPEN
  // =====================================================

  useEffect(() => {
    fetchMyListings();
  }, []);

  // =====================================================
  // GET PRODUCT IMAGE
  // =====================================================

  const getProductImage = (listing) => {
    if (
      listing?.coverImage &&
      typeof listing.coverImage === "string"
    ) {
      return listing.coverImage;
    }

    if (
      Array.isArray(listing?.images) &&
      listing.images.length > 0
    ) {
      return listing.images[0];
    }

    return null;
  };

  // =====================================================
  // IMAGE URL
  // =====================================================

  const getImageUrl = (image) => {
    if (!image) {
      return null;
    }

    if (
      image.startsWith("http://") ||
      image.startsWith("https://")
    ) {
      return image;
    }

    return `http://localhost:5000${image}`;
  };

  // =====================================================
  // FORMAT PRICE
  // =====================================================

  const formatPrice = (price, currency) => {
    const numericPrice = Number(price || 0);

    return `${currency || "USD"} ${numericPrice.toLocaleString(
      "en-US",
      {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }
    )}`;
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "Recently";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Recently";
    }

    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // =====================================================
  // STATUS CLASS
  // =====================================================

  const getStatusClass = (status) => {
    switch (status) {
      case "active":
        return "my-listing-status-active";

      case "sold":
        return "my-listing-status-sold";

      case "inactive":
        return "my-listing-status-inactive";

      case "expired":
        return "my-listing-status-expired";

      case "removed":
        return "my-listing-status-removed";

      default:
        return "my-listing-status-inactive";
    }
  };

  // =====================================================
  // VIEW LISTING
  // =====================================================

  const handleViewListing = (listing) => {
    const listingId =
      listing?._id || listing?.id;

    if (!listingId) {
      return;
    }

    navigate(
      `/marketplace/product/${listingId}`
    );
  };

  // =====================================================
  // EDIT LISTING
  // =====================================================

  const handleEditListing = (event, listing) => {
    event.stopPropagation();

    const listingId =
      listing?._id || listing?.id;

    if (!listingId) {
      return;
    }

    navigate(
      `/marketplace/edit-listing/${listingId}`
    );
  };

  // =====================================================
  // DELETE LISTING
  // =====================================================

  const handleDeleteListing = async (
    event,
    listing
  ) => {
    event.stopPropagation();

    const listingId =
      listing?._id || listing?.id;

    if (!listingId) {
      return;
    }

    const productName =
      listing.title ||
      listing.name ||
      "this listing";

    const confirmed = window.confirm(
      `Are you sure you want to delete "${productName}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(listingId);
      setError("");

      const token = getToken();

      if (!token) {
        throw new Error(
          "You are not logged in."
        );
      }

      const response = await fetch(
        `${API_BASE_URL}/marketplace/${listingId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete listing."
        );
      }

      setListings((currentListings) =>
        currentListings.filter(
          (item) =>
            (item._id || item.id) !==
            listingId
        )
      );
    } catch (err) {
      console.error(
        "DELETE LISTING ERROR:",
        err
      );

      setError(
        err.message ||
          "Unable to delete listing."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // =====================================================
  // CREATE LISTING
  // =====================================================

  const handleCreateListing = () => {
    navigate(
      "/marketplace/create-listing"
    );
  };

  // =====================================================
  // BACK TO MARKETPLACE
  // =====================================================

  const handleBack = () => {
    navigate("/marketplace");
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="my-listings-page">
        <div className="my-listings-loading">
          <FaSpinner className="my-listings-spinner" />

          <h3>
            Loading your listings...
          </h3>

          <p>
            Please wait while we load your
            marketplace products.
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="my-listings-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="my-listings-header">

        <div className="my-listings-header-left">

          <button
            type="button"
            className="my-listings-back-button"
            onClick={handleBack}
          >
            <FaArrowLeft />

            <span>
              Marketplace
            </span>
          </button>

          <div className="my-listings-title-section">

            <div className="my-listings-title-icon">
              <FaBoxOpen />
            </div>

            <div>
              <h1>
                My Listings
              </h1>

              <p>
                Manage your marketplace products
              </p>
            </div>

          </div>

        </div>

        <button
          type="button"
          className="my-listings-create-button"
          onClick={handleCreateListing}
        >
          <FaPlus />

          <span>
            Create Listing
          </span>
        </button>

      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="my-listings-error">

          <FaExclamationCircle />

          <span>
            {error}
          </span>

          <button
            type="button"
            onClick={fetchMyListings}
          >
            Retry
          </button>

        </div>
      )}

      {/* =================================================
          SUMMARY
      ================================================= */}

      <div className="my-listings-summary">

        <div className="my-listings-summary-card">

          <div className="my-listings-summary-icon">
            <FaBoxOpen />
          </div>

          <div>
            <span>
              Total Listings
            </span>

            <strong>
              {listings.length}
            </strong>
          </div>

        </div>

        <div className="my-listings-summary-card">

          <div className="my-listings-summary-icon">
            <FaEye />
          </div>

          <div>
            <span>
              Total Views
            </span>

            <strong>
              {listings.reduce(
                (total, listing) =>
                  total +
                  Number(
                    listing.views || 0
                  ),
                0
              )}
            </strong>
          </div>

        </div>

        <div className="my-listings-summary-card">

          <div className="my-listings-summary-icon">
            <FaHeart />
          </div>

          <div>
            <span>
              Total Likes
            </span>

            <strong>
              {listings.reduce(
                (total, listing) =>
                  total +
                  Number(
                    listing.likesCount || 0
                  ),
                0
              )}
            </strong>
          </div>

        </div>

        <div className="my-listings-summary-card">

          <div className="my-listings-summary-icon">
            <FaStore />
          </div>

          <div>
            <span>
              Active
            </span>

            <strong>
              {
                listings.filter(
                  (listing) =>
                    listing.status ===
                    "active"
                ).length
              }
            </strong>
          </div>

        </div>

      </div>

      {/* =================================================
          EMPTY STATE
      ================================================= */}

      {listings.length === 0 ? (
        <div className="my-listings-empty">

          <div className="my-listings-empty-icon">
            <FaBoxOpen />
          </div>

          <h2>
            You have no listings yet
          </h2>

          <p>
            Start selling by creating your
            first marketplace listing.
          </p>

          <button
            type="button"
            onClick={handleCreateListing}
            className="my-listings-empty-button"
          >
            <FaPlus />

            Create Your First Listing
          </button>

        </div>
      ) : (

        /* =================================================
           LISTINGS GRID
        ================================================= */

        <div className="my-listings-grid">

          {listings.map((listing) => {
            const listingId =
              listing._id ||
              listing.id;

            const productName =
              listing.title ||
              listing.name ||
              "Untitled Product";

            const image =
              getProductImage(listing);

            const imageUrl =
              getImageUrl(image);

            const business =
              listing.business &&
              typeof listing.business ===
                "object"
                ? listing.business
                : {};

            const businessName =
              business.businessName ||
              business.name ||
              "Your Business";

            return (
              <article
                key={listingId}
                className="my-listing-card"
                onClick={() =>
                  handleViewListing(
                    listing
                  )
                }
              >

                {/* IMAGE */}

                <div className="my-listing-image-wrapper">

                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={productName}
                      className="my-listing-image"
                      onError={(event) => {
                        event.currentTarget.style.display =
                          "none";

                        const fallback =
                          event.currentTarget
                            .parentElement
                            ?.querySelector(
                              ".my-listing-image-fallback"
                            );

                        if (fallback) {
                          fallback.style.display =
                            "flex";
                        }
                      }}
                    />
                  ) : null}

                  <div
                    className="my-listing-image-fallback"
                    style={{
                      display: imageUrl
                        ? "none"
                        : "flex",
                    }}
                  >
                    <FaStore />

                    <span>
                      No Image
                    </span>
                  </div>

                  {/* STATUS */}

                  <span
                    className={`my-listing-status ${getStatusClass(
                      listing.status
                    )}`}
                  >
                    {listing.status ||
                      "active"}
                  </span>

                </div>

                {/* CONTENT */}

                <div className="my-listing-content">

                  <div className="my-listing-top">

                    <h3>
                      {productName}
                    </h3>

                    <strong className="my-listing-price">
                      {formatPrice(
                        listing.price,
                        listing.currency
                      )}
                    </strong>

                  </div>

                  <div className="my-listing-meta">

                    <span>
                      {listing.category ||
                        "General"}
                    </span>

                    <span>
                      •
                    </span>

                    <span>
                      {listing.condition ||
                        "New"}
                    </span>

                  </div>

                  <div className="my-listing-location">

                    <FaMapMarkerAlt />

                    <span>
                      {listing.location ||
                        "Location not specified"}
                    </span>

                  </div>

                  <div className="my-listing-business">

                    <FaStore />

                    <span>
                      {businessName}
                    </span>

                  </div>

                  {/* STATS */}

                  <div className="my-listing-stats">

                    <span>
                      <FaEye />

                      {listing.views || 0}
                    </span>

                    <span>
                      <FaHeart />

                      {listing.likesCount ||
                        0}
                    </span>

                    <span>
                      {listing.quantity ??
                        0}{" "}
                      available
                    </span>

                  </div>

                  <div className="my-listing-date">
                    Listed{" "}
                    {formatDate(
                      listing.createdAt
                    )}
                  </div>

                  {/* ACTIONS */}

                  <div className="my-listing-actions">

                    <button
                      type="button"
                      className="my-listing-view-button"
                      onClick={(event) => {
                        event.stopPropagation();

                        handleViewListing(
                          listing
                        );
                      }}
                    >
                      <FaEye />

                      View
                    </button>

                    <button
                      type="button"
                      className="my-listing-edit-button"
                      onClick={(event) =>
                        handleEditListing(
                          event,
                          listing
                        )
                      }
                    >
                      <FaEdit />

                      Edit
                    </button>

                    <button
                      type="button"
                      className="my-listing-delete-button"
                      onClick={(event) =>
                        handleDeleteListing(
                          event,
                          listing
                        )
                      }
                      disabled={
                        deletingId ===
                        listingId
                      }
                    >
                      {deletingId ===
                      listingId ? (
                        <FaSpinner className="my-listings-spinner" />
                      ) : (
                        <FaTrash />
                      )}

                      Delete
                    </button>

                  </div>

                </div>

              </article>
            );
          })}

        </div>
      )}

    </div>
  );
}

export default MyListings;