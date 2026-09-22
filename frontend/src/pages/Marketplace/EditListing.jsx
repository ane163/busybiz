import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  FaArrowLeft,
  FaSave,
  FaImage,
  FaTrash,
  FaSpinner,
  FaTimes,
  FaMapMarkerAlt,
  FaTag,
  FaMoneyBillWave,
  FaBoxes,
  FaPhone,
  FaEnvelope,
  FaWhatsapp,
} from "react-icons/fa";

import "./EditListing.css";

function EditListing() {
  const navigate = useNavigate();
  const { id } = useParams();

  // =====================================================
  // STATE
  // =====================================================

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [listing, setListing] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    currency: "USD",
    category: "",
    condition: "new",
    quantity: "1",
    location: "",
    contactPhone: "",
    contactEmail: "",
    contactWhatsApp: "",
    status: "active",
  });

  const [selectedImages, setSelectedImages] =
    useState([]);

  // =====================================================
  // API
  // =====================================================

  const API_BASE_URL = "https://busybiz-5.onrender.com/api";

  // =====================================================
  // TOKEN
  // =====================================================

  const getToken = () => {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("accessToken")
    );
  };

  // =====================================================
  // LOAD LISTING
  // =====================================================

  useEffect(() => {
    if (!id) {
      setError("Listing ID is missing.");
      setLoading(false);
      return;
    }

    fetchListing();
  }, [id]);

  // =====================================================
  // FETCH LISTING
  // =====================================================

  const fetchListing = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/marketplace/${id}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load marketplace listing."
        );
      }

      const item = data.listing;

      if (!item) {
        throw new Error(
          "Marketplace listing was not found."
        );
      }

      setListing(item);

      setFormData({
        title: item.title || "",
        description: item.description || "",
        price:
          item.price !== undefined &&
          item.price !== null
            ? String(item.price)
            : "",
        currency: item.currency || "USD",
        category: item.category || "",
        condition: item.condition || "new",
        quantity:
          item.quantity !== undefined &&
          item.quantity !== null
            ? String(item.quantity)
            : "1",
        location: item.location || "",
        contactPhone: item.contactPhone || "",
        contactEmail: item.contactEmail || "",
        contactWhatsApp:
          item.contactWhatsApp || "",
        status: item.status || "active",
      });
    } catch (err) {
      console.error(
        "LOAD EDIT LISTING ERROR:",
        err
      );

      setError(
        err.message ||
          "Unable to load listing."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // HANDLE INPUT
  // =====================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // =====================================================
  // IMAGE SELECTION
  // =====================================================

  const handleImageChange = (event) => {
    const files = Array.from(
      event.target.files || []
    );

    if (files.length === 0) {
      return;
    }

    if (files.length > 8) {
      setError(
        "You can upload a maximum of 8 images."
      );

      event.target.value = "";
      return;
    }

    const invalidFile = files.find(
      (file) =>
        ![
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/webp",
        ].includes(file.type)
    );

    if (invalidFile) {
      setError(
        "Only JPG, JPEG, PNG and WEBP images are allowed."
      );

      event.target.value = "";
      return;
    }

    const oversizedFile = files.find(
      (file) =>
        file.size >
        5 * 1024 * 1024
    );

    if (oversizedFile) {
      setError(
        "Each image must be 5MB or smaller."
      );

      event.target.value = "";
      return;
    }

    setSelectedImages(files);
    setError("");
  };

  // =====================================================
  // REMOVE SELECTED IMAGE
  // =====================================================

  const removeSelectedImage = (index) => {
    setSelectedImages((previous) =>
      previous.filter(
        (_, imageIndex) =>
          imageIndex !== index
      )
    );
  };

  // =====================================================
  // IMAGE URL
  // =====================================================

  const getImageUrl = (image) => {
    if (!image) {
      return "";
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
  // SUBMIT
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    // ---------------------------------------------------
    // VALIDATION
    // ---------------------------------------------------

    if (!formData.title.trim()) {
      setError(
        "Product title is required."
      );
      return;
    }

    if (!formData.description.trim()) {
      setError(
        "Product description is required."
      );
      return;
    }

    if (
      formData.price === "" ||
      Number.isNaN(Number(formData.price))
    ) {
      setError(
        "Please enter a valid price."
      );
      return;
    }

    if (Number(formData.price) < 0) {
      setError(
        "Price cannot be negative."
      );
      return;
    }

    if (!formData.category.trim()) {
      setError(
        "Product category is required."
      );
      return;
    }

    if (!formData.location.trim()) {
      setError(
        "Product location is required."
      );
      return;
    }

    if (
      formData.quantity !== "" &&
      Number(formData.quantity) < 0
    ) {
      setError(
        "Quantity cannot be negative."
      );
      return;
    }

    // ---------------------------------------------------
    // TOKEN
    // ---------------------------------------------------

    const token = getToken();

    if (!token) {
      setError(
        "You are not logged in. Please log in again."
      );
      return;
    }

    // ---------------------------------------------------
    // FORM DATA
    // ---------------------------------------------------

    const data = new FormData();

    data.append(
      "title",
      formData.title.trim()
    );

    data.append(
      "description",
      formData.description.trim()
    );

    data.append(
      "price",
      String(Number(formData.price))
    );

    data.append(
      "currency",
      formData.currency.trim() ||
        "USD"
    );

    data.append(
      "category",
      formData.category.trim()
    );

    data.append(
      "condition",
      formData.condition
    );

    data.append(
      "quantity",
      String(
        Math.max(
          0,
          Math.floor(
            Number(
              formData.quantity || 0
            )
          )
        )
      )
    );

    data.append(
      "location",
      formData.location.trim()
    );

    data.append(
      "contactPhone",
      formData.contactPhone.trim()
    );

    data.append(
      "contactEmail",
      formData.contactEmail.trim()
    );

    data.append(
      "contactWhatsApp",
      formData.contactWhatsApp.trim()
    );

    data.append(
      "status",
      formData.status
    );

    // ---------------------------------------------------
    // NEW IMAGES
    // ---------------------------------------------------

    selectedImages.forEach((file) => {
      data.append("images", file);
    });

    // ---------------------------------------------------
    // SAVE
    // ---------------------------------------------------

    try {
      setSaving(true);

      const response = await fetch(
        `${API_BASE_URL}/marketplace/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: data,
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Failed to update listing."
        );
      }

      setSuccess(
        "Marketplace listing updated successfully."
      );

      if (result.listing) {
        setListing(result.listing);
      }

      setSelectedImages([]);

      // -------------------------------------------------
      // RETURN TO MY LISTINGS
      // -------------------------------------------------

      setTimeout(() => {
        navigate(
          "/marketplace/my-listings"
        );
      }, 1000);
    } catch (err) {
      console.error(
        "UPDATE LISTING ERROR:",
        err
      );

      setError(
        err.message ||
          "Unable to update listing."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // DELETE LISTING
  // =====================================================

  const handleDelete = async () => {
    const confirmed =
      window.confirm(
        "Are you sure you want to permanently delete this listing?"
      );

    if (!confirmed) {
      return;
    }

    const token = getToken();

    if (!token) {
      setError(
        "You are not logged in."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/marketplace/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Failed to delete listing."
        );
      }

      navigate(
        "/marketplace/my-listings"
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
      setSaving(false);
    }
  };

  // =====================================================
  // CANCEL
  // =====================================================

  const handleCancel = () => {
    navigate(
      "/marketplace/my-listings"
    );
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="edit-listing-page">

        <div className="edit-listing-loading">

          <FaSpinner className="edit-listing-spinner" />

          <h2>
            Loading listing...
          </h2>

          <p>
            Please wait while we load
            the product information.
          </p>

        </div>

      </div>
    );
  }

  // =====================================================
  // ERROR WITH NO LISTING
  // =====================================================

  if (!listing) {
    return (
      <div className="edit-listing-page">

        <div className="edit-listing-error-page">

          <FaTimes />

          <h2>
            Listing not found
          </h2>

          <p>
            {error ||
              "This marketplace listing could not be found."}
          </p>

          <button
            type="button"
            onClick={handleCancel}
          >
            Back to My Listings
          </button>

        </div>

      </div>
    );
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="edit-listing-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="edit-listing-header">

        <button
          type="button"
          className="edit-listing-back"
          onClick={handleCancel}
        >
          <FaArrowLeft />

          <span>
            My Listings
          </span>
        </button>

        <div>

          <h1>
            Edit Listing
          </h1>

          <p>
            Update your marketplace product
          </p>

        </div>

      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="edit-listing-alert edit-listing-alert-error">
          <FaTimes />

          <span>
            {error}
          </span>
        </div>
      )}

      {/* =================================================
          SUCCESS
      ================================================= */}

      {success && (
        <div className="edit-listing-alert edit-listing-alert-success">
          <FaSave />

          <span>
            {success}
          </span>
        </div>
      )}

      {/* =================================================
          FORM
      ================================================= */}

      <form
        className="edit-listing-form"
        onSubmit={handleSubmit}
      >

        {/* =================================================
            PRODUCT INFORMATION
        ================================================= */}

        <section className="edit-listing-section">

          <div className="edit-listing-section-header">

            <div className="edit-listing-section-icon">
              <FaTag />
            </div>

            <div>

              <h2>
                Product Information
              </h2>

              <p>
                Update the basic information
                about your product.
              </p>

            </div>

          </div>

          <div className="edit-listing-form-grid">

            {/* TITLE */}

            <div className="edit-listing-field edit-listing-full">

              <label htmlFor="title">
                Product Title
                <span>*</span>
              </label>

              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter product title"
                maxLength={150}
              />

            </div>

            {/* DESCRIPTION */}

            <div className="edit-listing-field edit-listing-full">

              <label htmlFor="description">
                Description
                <span>*</span>
              </label>

              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your product"
                rows={6}
                maxLength={5000}
              />

              <small>
                {formData.description.length}
                /5000 characters
              </small>

            </div>

            {/* CATEGORY */}

            <div className="edit-listing-field">

              <label htmlFor="category">
                Category
                <span>*</span>
              </label>

              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="">
                  Select category
                </option>

                <option value="Electronics">
                  Electronics
                </option>

                <option value="Computers">
                  Computers
                </option>

                <option value="Phones">
                  Phones
                </option>

                <option value="Vehicles">
                  Vehicles
                </option>

                <option value="Furniture">
                  Furniture
                </option>

                <option value="Clothing">
                  Clothing
                </option>

                <option value="Home">
                  Home & Garden
                </option>

                <option value="Services">
                  Services
                </option>

                <option value="Other">
                  Other
                </option>

              </select>

            </div>

            {/* CONDITION */}

            <div className="edit-listing-field">

              <label htmlFor="condition">
                Condition
              </label>

              <select
                id="condition"
                name="condition"
                value={formData.condition}
                onChange={handleChange}
              >
                <option value="new">
                  New
                </option>

                <option value="used">
                  Used
                </option>

                <option value="refurbished">
                  Refurbished
                </option>

              </select>

            </div>

          </div>

        </section>

        {/* =================================================
            PRICE & STOCK
        ================================================= */}

        <section className="edit-listing-section">

          <div className="edit-listing-section-header">

            <div className="edit-listing-section-icon">
              <FaMoneyBillWave />
            </div>

            <div>

              <h2>
                Price & Stock
              </h2>

              <p>
                Update pricing and availability.
              </p>

            </div>

          </div>

          <div className="edit-listing-form-grid">

            {/* PRICE */}

            <div className="edit-listing-field">

              <label htmlFor="price">
                Price
                <span>*</span>
              </label>

              <div className="edit-listing-input-with-icon">

                <FaMoneyBillWave />

                <input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0.00"
                />

              </div>

            </div>

            {/* CURRENCY */}

            <div className="edit-listing-field">

              <label htmlFor="currency">
                Currency
              </label>

              <select
                id="currency"
                name="currency"
                value={formData.currency}
                onChange={handleChange}
              >
                <option value="USD">
                  USD
                </option>

                <option value="ZWG">
                  ZWG
                </option>

                <option value="ZAR">
                  ZAR
                </option>

                <option value="EUR">
                  EUR
                </option>

                <option value="GBP">
                  GBP
                </option>

              </select>

            </div>

            {/* QUANTITY */}

            <div className="edit-listing-field">

              <label htmlFor="quantity">
                Quantity
              </label>

              <div className="edit-listing-input-with-icon">

                <FaBoxes />

                <input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="1"
                />

              </div>

            </div>

            {/* STATUS */}

            <div className="edit-listing-field">

              <label htmlFor="status">
                Listing Status
              </label>

              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="active">
                  Active
                </option>

                <option value="inactive">
                  Inactive
                </option>

                <option value="sold">
                  Sold
                </option>

              </select>

            </div>

          </div>

        </section>

        {/* =================================================
            LOCATION
        ================================================= */}

        <section className="edit-listing-section">

          <div className="edit-listing-section-header">

            <div className="edit-listing-section-icon">
              <FaMapMarkerAlt />
            </div>

            <div>

              <h2>
                Location
              </h2>

              <p>
                Tell buyers where the product
                is located.
              </p>

            </div>

          </div>

          <div className="edit-listing-form-grid">

            <div className="edit-listing-field edit-listing-full">

              <label htmlFor="location">
                Product Location
                <span>*</span>
              </label>

              <div className="edit-listing-input-with-icon">

                <FaMapMarkerAlt />

                <input
                  id="location"
                  name="location"
                  type="text"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Harare, Zimbabwe"
                />

              </div>

            </div>

          </div>

        </section>

        {/* =================================================
            CONTACT
        ================================================= */}

        <section className="edit-listing-section">

          <div className="edit-listing-section-header">

            <div className="edit-listing-section-icon">
              <FaPhone />
            </div>

            <div>

              <h2>
                Contact Information
              </h2>

              <p>
                Update how buyers can contact you.
              </p>

            </div>

          </div>

          <div className="edit-listing-form-grid">

            {/* PHONE */}

            <div className="edit-listing-field">

              <label htmlFor="contactPhone">
                Phone
              </label>

              <div className="edit-listing-input-with-icon">

                <FaPhone />

                <input
                  id="contactPhone"
                  name="contactPhone"
                  type="text"
                  value={
                    formData.contactPhone
                  }
                  onChange={handleChange}
                  placeholder="+263..."
                />

              </div>

            </div>

            {/* EMAIL */}

            <div className="edit-listing-field">

              <label htmlFor="contactEmail">
                Email
              </label>

              <div className="edit-listing-input-with-icon">

                <FaEnvelope />

                <input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  value={
                    formData.contactEmail
                  }
                  onChange={handleChange}
                  placeholder="seller@example.com"
                />

              </div>

            </div>

            {/* WHATSAPP */}

            <div className="edit-listing-field edit-listing-full">

              <label htmlFor="contactWhatsApp">
                WhatsApp
              </label>

              <div className="edit-listing-input-with-icon">

                <FaWhatsapp />

                <input
                  id="contactWhatsApp"
                  name="contactWhatsApp"
                  type="text"
                  value={
                    formData.contactWhatsApp
                  }
                  onChange={handleChange}
                  placeholder="+263..."
                />

              </div>

            </div>

          </div>

        </section>

        {/* =================================================
            IMAGES
        ================================================= */}

        <section className="edit-listing-section">

          <div className="edit-listing-section-header">

            <div className="edit-listing-section-icon">
              <FaImage />
            </div>

            <div>

              <h2>
                Product Images
              </h2>

              <p>
                Upload new images to replace
                the current product images.
              </p>

            </div>

          </div>

          {/* CURRENT IMAGES */}

          {Array.isArray(
            listing.images
          ) &&
            listing.images.length > 0 && (
              <div className="edit-listing-current-images">

                <h3>
                  Current Images
                </h3>

                <div className="edit-listing-image-grid">

                  {listing.images.map(
                    (image, index) => (
                      <div
                        className="edit-listing-image-item"
                        key={`${image}-${index}`}
                      >

                        <img
                          src={getImageUrl(
                            image
                          )}
                          alt={`Product ${index + 1}`}
                          onError={(
                            event
                          ) => {
                            event.currentTarget.style.display =
                              "none";
                          }}
                        />

                      </div>
                    )
                  )}

                </div>

              </div>
            )}

          {/* NEW IMAGES */}

          <div className="edit-listing-upload">

            <label
              htmlFor="images"
              className="edit-listing-upload-box"
            >

              <FaImage />

              <strong>
                Choose New Images
              </strong>

              <span>
                JPG, JPEG, PNG or WEBP
              </span>

              <small>
                Maximum 8 images, 5MB each
              </small>

            </label>

            <input
              id="images"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              multiple
              onChange={
                handleImageChange
              }
            />

          </div>

          {/* SELECTED IMAGES */}

          {selectedImages.length >
            0 && (
            <div className="edit-listing-selected-images">

              <h3>
                New Images
              </h3>

              <div className="edit-listing-image-grid">

                {selectedImages.map(
                  (file, index) => (
                    <div
                      className="edit-listing-selected-image"
                      key={`${file.name}-${index}`}
                    >

                      <img
                        src={URL.createObjectURL(
                          file
                        )}
                        alt={file.name}
                      />

                      <button
                        type="button"
                        onClick={() =>
                          removeSelectedImage(
                            index
                          )
                        }
                        aria-label="Remove image"
                      >
                        <FaTimes />
                      </button>

                    </div>
                  )
                )}

              </div>

              <p className="edit-listing-image-warning">
                Uploading new images will replace
                the existing listing images.
              </p>

            </div>
          )}

        </section>

        {/* =================================================
            ACTIONS
        ================================================= */}

        <div className="edit-listing-actions">

          <button
            type="button"
            className="edit-listing-delete"
            onClick={handleDelete}
            disabled={saving}
          >
            <FaTrash />

            Delete Listing
          </button>

          <div className="edit-listing-actions-right">

            <button
              type="button"
              className="edit-listing-cancel"
              onClick={handleCancel}
              disabled={saving}
            >
              <FaTimes />

              Cancel
            </button>

            <button
              type="submit"
              className="edit-listing-save"
              disabled={saving}
            >
              {saving ? (
                <>
                  <FaSpinner className="edit-listing-spinner" />

                  Saving...
                </>
              ) : (
                <>
                  <FaSave />

                  Save Changes
                </>
              )}
            </button>

          </div>

        </div>

      </form>

    </div>
  );
}

export default EditListing;
