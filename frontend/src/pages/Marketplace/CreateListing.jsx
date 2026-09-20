import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaImage,
  FaPlus,
  FaTimes,
  FaTag,
  FaMoneyBillWave,
  FaBoxes,
  FaMapMarkerAlt,
  FaAlignLeft,
  FaUpload,
} from "react-icons/fa";
import "./CreateListing.css";

const CreateListing = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    price: "",
    quantity: "",
    location: "",
  });

  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const categories = [
    "Electronics",
    "Computers & Laptops",
    "Phones & Tablets",
    "Clothing & Fashion",
    "Home & Garden",
    "Furniture",
    "Vehicles",
    "Machinery & Equipment",
    "Agriculture",
    "Food & Groceries",
    "Beauty & Health",
    "Books & Education",
    "Services",
    "Other",
  ];

  // =====================================================
  // CLEAN UP IMAGE PREVIEWS
  // =====================================================

  useEffect(() => {
    return () => {
      previewImages.forEach((image) => {
        if (image.url) {
          URL.revokeObjectURL(image.url);
        }
      });
    };
  }, [previewImages]);

  // =====================================================
  // GET AUTHENTICATION TOKEN
  // =====================================================

  const getAuthToken = () => {
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("accessToken");

    return token;
  };

  // =====================================================
  // HANDLE INPUT CHANGES
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // =====================================================
  // HANDLE IMAGE UPLOAD
  // =====================================================

  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);

    if (selectedFiles.length === 0) {
      return;
    }

    const remainingSlots = 6 - images.length;

    if (remainingSlots <= 0) {
      setError("You can upload a maximum of 6 images.");
      e.target.value = "";
      return;
    }

    const filesToAdd = selectedFiles.slice(0, remainingSlots);

    // Check file sizes
    const oversizedFiles = filesToAdd.filter(
      (file) => file.size > 5 * 1024 * 1024
    );

    if (oversizedFiles.length > 0) {
      setError(
        "Each image must be 5MB or smaller."
      );
      e.target.value = "";
      return;
    }

    // Check image types
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    const invalidFiles = filesToAdd.filter(
      (file) => !allowedTypes.includes(file.type)
    );

    if (invalidFiles.length > 0) {
      setError(
        "Only JPG, JPEG, PNG, WEBP and GIF images are allowed."
      );
      e.target.value = "";
      return;
    }

    const newPreviews = filesToAdd.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    setImages((prev) => [
      ...prev,
      ...filesToAdd,
    ]);

    setPreviewImages((prev) => [
      ...prev,
      ...newPreviews,
    ]);

    if (selectedFiles.length > remainingSlots) {
      setError(
        `Only ${remainingSlots} more image(s) can be added.`
      );
    } else {
      setError("");
    }

    // Allow selecting the same file again later
    e.target.value = "";
  };

  // =====================================================
  // REMOVE IMAGE
  // =====================================================

  const removeImage = (index) => {
    setPreviewImages((prev) => {
      const updated = [...prev];

      if (updated[index]?.url) {
        URL.revokeObjectURL(updated[index].url);
      }

      updated.splice(index, 1);

      return updated;
    });

    setImages((prev) => {
      const updated = [...prev];

      updated.splice(index, 1);

      return updated;
    });

    setError("");
  };

  // =====================================================
  // SUBMIT LISTING
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // =====================================================
    // AUTHENTICATION CHECK
    // =====================================================

    const token = getAuthToken();

    if (!token) {
      setError(
        "You must be logged in to create a marketplace listing."
      );

      return;
    }

    // =====================================================
    // VALIDATION
    // =====================================================

    if (!formData.name.trim()) {
      setError("Please enter a product name.");
      return;
    }

    if (!formData.category) {
      setError("Please select a category.");
      return;
    }

    if (!formData.description.trim()) {
      setError("Please enter a product description.");
      return;
    }

    if (
      formData.description.trim().length < 10
    ) {
      setError(
        "Product description must contain at least 10 characters."
      );
      return;
    }

    if (
      formData.price === "" ||
      Number(formData.price) <= 0
    ) {
      setError("Please enter a valid price.");
      return;
    }

    if (
      formData.quantity === "" ||
      Number(formData.quantity) < 0 ||
      !Number.isInteger(Number(formData.quantity))
    ) {
      setError(
        "Please enter a valid whole-number quantity."
      );
      return;
    }

    if (!formData.location.trim()) {
      setError("Please enter the product location.");
      return;
    }

    // =====================================================
    // CREATE FORM DATA
    // =====================================================

    try {
      setLoading(true);

      const data = new FormData();

      data.append(
        "name",
        formData.name.trim()
      );

      data.append(
        "category",
        formData.category
      );

      data.append(
        "description",
        formData.description.trim()
      );

      data.append(
        "price",
        formData.price
      );

      data.append(
        "quantity",
        formData.quantity
      );

      data.append(
        "location",
        formData.location.trim()
      );

      // Add images
      images.forEach((image) => {
        data.append("images", image);
      });

      // =====================================================
      // SEND REQUEST
      // =====================================================

      const response = await fetch(
        "http://localhost:5000/api/marketplace/products",
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
          },

          body: data,
        }
      );

      // =====================================================
      // READ RESPONSE
      // =====================================================

      let result;

      try {
        result = await response.json();
      } catch {
        result = {
          message:
            "The server returned an invalid response.",
        };
      }

      // =====================================================
      // HANDLE AUTHENTICATION ERROR
      // =====================================================

      if (response.status === 401) {
        setError(
          "Your login session has expired. Please log in again."
        );

        return;
      }

      // =====================================================
      // HANDLE OTHER ERRORS
      // =====================================================

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Failed to create marketplace listing."
        );
      }

      // =====================================================
      // SUCCESS
      // =====================================================

      setSuccess(
        "Your listing has been created successfully!"
      );

      // Clear form
      setFormData({
        name: "",
        category: "",
        description: "",
        price: "",
        quantity: "",
        location: "",
      });

      // Revoke image URLs
      previewImages.forEach((image) => {
        if (image.url) {
          URL.revokeObjectURL(image.url);
        }
      });

      setImages([]);
      setPreviewImages([]);

      // Redirect
      setTimeout(() => {
        navigate("/marketplace/my-listings");
      }, 1200);
    } catch (err) {
      console.error(
        "Create listing error:",
        err
      );

      setError(
        err.message ||
          "Something went wrong while creating your listing."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // CANCEL
  // =====================================================

  const handleCancel = () => {
    if (loading) {
      return;
    }

    navigate("/marketplace");
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="create-listing-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="create-listing-header">

        <button
          type="button"
          className="back-button"
          onClick={() => navigate(-1)}
          disabled={loading}
        >
          <FaArrowLeft />
          Back
        </button>

        <div>
          <h1>Create a Listing</h1>

          <p>
            Sell your products and reach customers
            through the marketplace.
          </p>
        </div>

      </div>

      {/* =====================================================
          FORM
      ===================================================== */}

      <form
        className="create-listing-form"
        onSubmit={handleSubmit}
      >

        {/* =====================================================
            BASIC INFORMATION
        ===================================================== */}

        <section className="listing-section">

          <div className="section-heading">

            <FaTag />

            <div>
              <h2>Product Information</h2>

              <p>
                Provide the basic details about your product.
              </p>
            </div>

          </div>

          <div className="form-grid">

            {/* PRODUCT NAME */}

            <div className="form-group full-width">

              <label htmlFor="name">
                Product Name
                <span>*</span>
              </label>

              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. HP EliteBook 840 G8"
                maxLength={100}
                disabled={loading}
              />

            </div>

            {/* CATEGORY */}

            <div className="form-group">

              <label htmlFor="category">
                Category
                <span>*</span>
              </label>

              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                disabled={loading}
              >

                <option value="">
                  Select a category
                </option>

                {categories.map(
                  (category) => (
                    <option
                      key={category}
                      value={category}
                    >
                      {category}
                    </option>
                  )
                )}

              </select>

            </div>

            {/* LOCATION */}

            <div className="form-group">

              <label htmlFor="location">
                Location
                <span>*</span>
              </label>

              <div className="input-with-icon">

                <FaMapMarkerAlt />

                <input
                  id="location"
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Harare"
                  maxLength={100}
                  disabled={loading}
                />

              </div>

            </div>

            {/* DESCRIPTION */}

            <div className="form-group full-width">

              <label htmlFor="description">
                Description
                <span>*</span>
              </label>

              <div className="textarea-wrapper">

                <FaAlignLeft />

                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your product, its condition, features and any other important information..."
                  rows="6"
                  maxLength={2000}
                  disabled={loading}
                />

              </div>

              <small>
                {formData.description.length}/2000
                {" "}
                characters
              </small>

            </div>

          </div>

        </section>

        {/* =====================================================
            PRICE & STOCK
        ===================================================== */}

        <section className="listing-section">

          <div className="section-heading">

            <FaMoneyBillWave />

            <div>
              <h2>Price & Stock</h2>

              <p>
                Set the selling price and available quantity.
              </p>
            </div>

          </div>

          <div className="form-grid">

            {/* PRICE */}

            <div className="form-group">

              <label htmlFor="price">
                Price (USD)
                <span>*</span>
              </label>

              <div className="input-with-prefix">

                <span>$</span>

                <input
                  id="price"
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  disabled={loading}
                />

              </div>

            </div>

            {/* QUANTITY */}

            <div className="form-group">

              <label htmlFor="quantity">
                Available Quantity
                <span>*</span>
              </label>

              <div className="input-with-icon">

                <FaBoxes />

                <input
                  id="quantity"
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="e.g. 10"
                  min="0"
                  step="1"
                  disabled={loading}
                />

              </div>

            </div>

          </div>

        </section>

        {/* =====================================================
            IMAGES
        ===================================================== */}

        <section className="listing-section">

          <div className="section-heading">

            <FaImage />

            <div>

              <h2>Product Images</h2>

              <p>
                Add clear images to help customers
                understand your product.
              </p>

            </div>

          </div>

          <div className="image-upload-area">

            {/* UPLOAD BUTTON */}

            <label
              htmlFor="product-images"
              className="image-upload-box"
            >

              <FaUpload />

              <strong>
                Click to upload images
              </strong>

              <span>
                PNG, JPG, JPEG, WEBP or GIF
              </span>

              <small>
                Maximum 6 images • 5MB each
              </small>

            </label>

            <input
              id="product-images"
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
              multiple
              onChange={handleImageChange}
              hidden
              disabled={loading}
            />

            {/* IMAGE PREVIEWS */}

            {previewImages.length > 0 && (

              <div className="image-preview-grid">

                {previewImages.map(
                  (image, index) => (

                    <div
                      className="image-preview"
                      key={`${image.url}-${index}`}
                    >

                      <img
                        src={image.url}
                        alt={`Product preview ${
                          index + 1
                        }`}
                      />

                      {index === 0 && (
                        <span className="main-image-label">
                          Main Image
                        </span>
                      )}

                      <button
                        type="button"
                        className="remove-image-button"
                        onClick={() =>
                          removeImage(index)
                        }
                        aria-label={`Remove image ${
                          index + 1
                        }`}
                        disabled={loading}
                      >
                        <FaTimes />
                      </button>

                    </div>

                  )
                )}

                {images.length < 6 && (

                  <label
                    htmlFor="product-images"
                    className="add-more-image"
                  >

                    <FaPlus />

                    <span>
                      Add More
                    </span>

                  </label>

                )}

              </div>

            )}

          </div>

        </section>

        {/* =====================================================
            MESSAGES
        ===================================================== */}

        {error && (
          <div
            className="listing-message error-message"
            role="alert"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            className="listing-message success-message"
            role="status"
          >
            {success}
          </div>
        )}

        {/* =====================================================
            ACTION BUTTONS
        ===================================================== */}

        <div className="listing-actions">

          <button
            type="button"
            className="cancel-listing-button"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="publish-listing-button"
            disabled={loading}
          >

            {loading ? (
              <>
                <span className="button-spinner"></span>
                Publishing...
              </>
            ) : (
              <>
                <FaUpload />
                Publish Listing
              </>
            )}

          </button>

        </div>

      </form>

    </div>
  );
};

export default CreateListing;