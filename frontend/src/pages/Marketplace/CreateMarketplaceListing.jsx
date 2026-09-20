import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaArrowLeft,
  FaCloudUploadAlt,
  FaTimes,
  FaImage,
  FaPlus,
  FaSave
} from "react-icons/fa";

import "./CreateMarketplaceListing.css";


function CreateMarketplaceListing() {

  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [images, setImages] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    type: "Product",
    price: "",
    currency: "USD",
    condition: "New",
    quantity: "1",
    location: "",
    description: "",
    phone: "",
    whatsapp: "",
    negotiable: false
  });

  const [errors, setErrors] = useState({});


  // =====================================================
  // INPUT CHANGE
  // =====================================================

  const handleChange = (event) => {

    const {
      name,
      value,
      type,
      checked
    } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value
    }));


    if (errors[name]) {

      setErrors((previous) => ({
        ...previous,
        [name]: ""
      }));

    }

  };


  // =====================================================
  // IMAGE UPLOAD
  // =====================================================

  const handleImageSelect = (event) => {

    const files = Array.from(
      event.target.files || []
    );

    if (!files.length) {
      return;
    }


    const remaining =
      6 - images.length;

    const selectedFiles =
      files.slice(0, remaining);


    const newImages =
      selectedFiles.map((file) => ({
        id:
          `${file.name}-${Date.now()}-${Math.random()}`,
        file,
        preview:
          URL.createObjectURL(file)
      }));


    setImages((previous) => [
      ...previous,
      ...newImages
    ]);


    event.target.value = "";

  };


  // =====================================================
  // REMOVE IMAGE
  // =====================================================

  const removeImage = (id) => {

    setImages((previous) => {

      const image =
        previous.find(
          (item) => item.id === id
        );

      if (image?.preview) {
        URL.revokeObjectURL(
          image.preview
        );
      }

      return previous.filter(
        (item) => item.id !== id
      );

    });

  };


  // =====================================================
  // VALIDATION
  // =====================================================

  const validateForm = () => {

    const newErrors = {};


    if (!formData.title.trim()) {

      newErrors.title =
        "Listing title is required.";

    }


    if (!formData.category) {

      newErrors.category =
        "Please select a category.";

    }


    if (!formData.price) {

      newErrors.price =
        "Price is required.";

    } else if (
      Number(formData.price) < 0
    ) {

      newErrors.price =
        "Price cannot be negative.";

    }


    if (!formData.location.trim()) {

      newErrors.location =
        "Location is required.";

    }


    if (!formData.description.trim()) {

      newErrors.description =
        "Please add a description.";

    }


    if (!formData.phone.trim()) {

      newErrors.phone =
        "Contact number is required.";

    }


    setErrors(newErrors);

    return (
      Object.keys(newErrors).length === 0
    );

  };


  // =====================================================
  // SAVE LISTING
  // =====================================================

  const handleSubmit = async (event) => {

    event.preventDefault();


    if (!validateForm()) {
      return;
    }


    /*
      =====================================================
      BACKEND INTEGRATION

      Later replace this section with your API call.

      Example:

      const form = new FormData();

      Object.keys(formData).forEach((key) => {
        form.append(key, formData[key]);
      });

      images.forEach((image) => {
        form.append("images", image.file);
      });

      await api.post(
        "/marketplace/listings",
        form
      );
      =====================================================
    */


    const listing = {
      ...formData,
      images: images.map(
        (image) => image.preview
      )
    };


    console.log(
      "Marketplace listing:",
      listing
    );


    alert(
      "Marketplace listing created successfully!"
    );


    navigate("/marketplace");

  };


  // =====================================================
  // CANCEL
  // =====================================================

  const handleCancel = () => {

    navigate("/marketplace");

  };


  return (

    <div className="create-marketplace-page">


      {/* =================================================
          HEADER
      ================================================= */}

      <div className="create-marketplace-header">

        <button
          type="button"
          className="create-marketplace-back"
          onClick={handleCancel}
        >

          <FaArrowLeft />

          <span>
            Back to Marketplace
          </span>

        </button>


        <div className="create-marketplace-header-title">

          <h1>
            Create Listing
          </h1>

          <p>
            Add a product or service to the marketplace
          </p>

        </div>

      </div>


      {/* =================================================
          FORM
      ================================================= */}

      <form
        className="create-marketplace-form"
        onSubmit={handleSubmit}
      >


        {/* =================================================
            LEFT COLUMN
        ================================================= */}

        <div className="create-marketplace-main">


          {/* =================================================
              BASIC INFORMATION
          ================================================= */}

          <section className="create-marketplace-card">

            <div className="create-marketplace-card-header">

              <div>

                <h2>
                  Basic Information
                </h2>

                <p>
                  Tell buyers what you are selling.
                </p>

              </div>

            </div>


            {/* TITLE */}

            <div className="create-marketplace-field">

              <label htmlFor="title">
                Listing Title
                <span>*</span>
              </label>

              <input
                id="title"
                name="title"
                type="text"
                placeholder="e.g. iPhone 15 Pro Max"
                value={formData.title}
                onChange={handleChange}
              />

              {errors.title && (

                <small className="create-marketplace-error">
                  {errors.title}
                </small>

              )}

            </div>


            {/* CATEGORY / TYPE */}

            <div className="create-marketplace-row">


              <div className="create-marketplace-field">

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

                  <option value="Phones">
                    Phones & Tablets
                  </option>

                  <option value="Computers">
                    Computers
                  </option>

                  <option value="Vehicles">
                    Vehicles
                  </option>

                  <option value="Clothing">
                    Clothing & Fashion
                  </option>

                  <option value="Home">
                    Home & Furniture
                  </option>

                  <option value="Food">
                    Food & Beverages
                  </option>

                  <option value="Services">
                    Services
                  </option>

                  <option value="Agriculture">
                    Agriculture
                  </option>

                  <option value="Other">
                    Other
                  </option>

                </select>

                {errors.category && (

                  <small className="create-marketplace-error">
                    {errors.category}
                  </small>

                )}

              </div>


              <div className="create-marketplace-field">

                <label htmlFor="type">
                  Listing Type
                </label>

                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                >

                  <option value="Product">
                    Product
                  </option>

                  <option value="Service">
                    Service
                  </option>

                </select>

              </div>

            </div>


            {/* CONDITION */}

            <div className="create-marketplace-field">

              <label htmlFor="condition">
                Condition
              </label>

              <select
                id="condition"
                name="condition"
                value={formData.condition}
                onChange={handleChange}
              >

                <option value="New">
                  New
                </option>

                <option value="Used - Like New">
                  Used - Like New
                </option>

                <option value="Used - Good">
                  Used - Good
                </option>

                <option value="Used - Fair">
                  Used - Fair
                </option>

                <option value="Refurbished">
                  Refurbished
                </option>

              </select>

            </div>

          </section>


          {/* =================================================
              PRICE
          ================================================= */}

          <section className="create-marketplace-card">

            <div className="create-marketplace-card-header">

              <div>

                <h2>
                  Pricing & Availability
                </h2>

                <p>
                  Set your selling price and available quantity.
                </p>

              </div>

            </div>


            <div className="create-marketplace-row">


              <div className="create-marketplace-field">

                <label htmlFor="price">
                  Price
                  <span>*</span>
                </label>

                <div className="create-marketplace-price-input">

                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                  >

                    <option value="USD">
                      USD
                    </option>

                    <option value="ZWL">
                      ZWL
                    </option>

                    <option value="ZAR">
                      ZAR
                    </option>

                  </select>

                  <input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={handleChange}
                  />

                </div>

                {errors.price && (

                  <small className="create-marketplace-error">
                    {errors.price}
                  </small>

                )}

              </div>


              <div className="create-marketplace-field">

                <label htmlFor="quantity">
                  Quantity Available
                </label>

                <input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="1"
                  placeholder="1"
                  value={formData.quantity}
                  onChange={handleChange}
                />

              </div>

            </div>


            <label className="create-marketplace-checkbox">

              <input
                type="checkbox"
                name="negotiable"
                checked={formData.negotiable}
                onChange={handleChange}
              />

              <span>
                Price is negotiable
              </span>

            </label>

          </section>


          {/* =================================================
              DESCRIPTION
          ================================================= */}

          <section className="create-marketplace-card">

            <div className="create-marketplace-card-header">

              <div>

                <h2>
                  Description
                </h2>

                <p>
                  Give buyers useful information about your listing.
                </p>

              </div>

            </div>


            <div className="create-marketplace-field">

              <label htmlFor="description">
                Description
                <span>*</span>
              </label>

              <textarea
                id="description"
                name="description"
                rows="7"
                maxLength="2000"
                placeholder="Describe your product or service, including important features, specifications, delivery information and anything else buyers should know..."
                value={formData.description}
                onChange={handleChange}
              />

              <div className="create-marketplace-character-count">

                {formData.description.length}
                {" / 2000"}

              </div>

              {errors.description && (

                <small className="create-marketplace-error">
                  {errors.description}
                </small>

              )}

            </div>

          </section>


          {/* =================================================
              LOCATION & CONTACT
          ================================================= */}

          <section className="create-marketplace-card">

            <div className="create-marketplace-card-header">

              <div>

                <h2>
                  Location & Contact
                </h2>

                <p>
                  Help buyers know where and how to reach you.
                </p>

              </div>

            </div>


            <div className="create-marketplace-field">

              <label htmlFor="location">
                Location
                <span>*</span>
              </label>

              <input
                id="location"
                name="location"
                type="text"
                placeholder="e.g. Harare, Zimbabwe"
                value={formData.location}
                onChange={handleChange}
              />

              {errors.location && (

                <small className="create-marketplace-error">
                  {errors.location}
                </small>

              )}

            </div>


            <div className="create-marketplace-row">


              <div className="create-marketplace-field">

                <label htmlFor="phone">
                  Phone Number
                  <span>*</span>
                </label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+263 77 123 4567"
                  value={formData.phone}
                  onChange={handleChange}
                />

                {errors.phone && (

                  <small className="create-marketplace-error">
                    {errors.phone}
                  </small>

                )}

              </div>


              <div className="create-marketplace-field">

                <label htmlFor="whatsapp">
                  WhatsApp Number
                </label>

                <input
                  id="whatsapp"
                  name="whatsapp"
                  type="tel"
                  placeholder="+263 77 123 4567"
                  value={formData.whatsapp}
                  onChange={handleChange}
                />

              </div>

            </div>

          </section>

        </div>


        {/* =================================================
            RIGHT COLUMN
        ================================================= */}

        <aside className="create-marketplace-sidebar">


          {/* =================================================
              IMAGES
          ================================================= */}

          <section className="create-marketplace-card">

            <div className="create-marketplace-card-header">

              <div>

                <h2>
                  Product Images
                </h2>

                <p>
                  Add up to 6 images.
                </p>

              </div>

            </div>


            <div className="create-marketplace-upload-area">

              {images.length === 0 ? (

                <button
                  type="button"
                  className="create-marketplace-upload-button"
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                >

                  <FaCloudUploadAlt />

                  <strong>
                    Upload Images
                  </strong>

                  <span>
                    PNG, JPG or WEBP
                  </span>

                </button>

              ) : (

                <div className="create-marketplace-image-grid">

                  {images.map(
                    (image, index) => (

                      <div
                        className={`create-marketplace-image ${
                          index === 0
                            ? "create-marketplace-main-image"
                            : ""
                        }`}
                        key={image.id}
                      >

                        <img
                          src={image.preview}
                          alt={`Listing ${index + 1}`}
                        />

                        {index === 0 && (

                          <span className="create-marketplace-main-label">
                            Main Image
                          </span>

                        )}

                        <button
                          type="button"
                          onClick={() =>
                            removeImage(image.id)
                          }
                          title="Remove image"
                        >

                          <FaTimes />

                        </button>

                      </div>

                    )
                  )}


                  {images.length < 6 && (

                    <button
                      type="button"
                      className="create-marketplace-add-image"
                      onClick={() =>
                        fileInputRef.current?.click()
                      }
                    >

                      <FaPlus />

                      <span>
                        Add
                      </span>

                    </button>

                  )}

                </div>

              )}

            </div>


            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              multiple
              onChange={handleImageSelect}
              hidden
            />


            <div className="create-marketplace-image-note">

              <FaImage />

              <span>
                The first image will be used as the main listing image.
              </span>

            </div>

          </section>


          {/* =================================================
              PREVIEW
          ================================================= */}

          <section className="create-marketplace-preview">

            <div className="create-marketplace-preview-header">

              <h2>
                Listing Preview
              </h2>

              <span>
                Preview
              </span>

            </div>


            <div className="create-marketplace-preview-image">

              {images.length > 0 ? (

                <img
                  src={images[0].preview}
                  alt="Preview"
                />

              ) : (

                <div>

                  <FaImage />

                  <span>
                    No image
                  </span>

                </div>

              )}

            </div>


            <div className="create-marketplace-preview-body">

              <span className="create-marketplace-preview-category">

                {formData.category ||
                  "Category"}

              </span>


              <h3>

                {formData.title ||
                  "Your listing title"}

              </h3>


              <strong>

                {formData.price
                  ? `${formData.currency} ${Number(
                      formData.price
                    ).toLocaleString()}`
                  : "Price"}

              </strong>


              <p>

                {formData.location ||
                  "Location"}

              </p>

            </div>

          </section>

        </aside>

      </form>


      {/* =================================================
          FOOTER ACTIONS
      ================================================= */}

      <div className="create-marketplace-actions">

        <button
          type="button"
          className="create-marketplace-cancel"
          onClick={handleCancel}
        >

          Cancel

        </button>


        <button
          type="button"
          className="create-marketplace-draft"
          onClick={() => {

            console.log(
              "Draft saved:",
              formData
            );

            alert(
              "Listing saved as draft."
            );

          }}
        >

          <FaSave />

          Save Draft

        </button>


        <button
          type="submit"
          form="marketplace-create-form"
          className="create-marketplace-publish"
          onClick={handleSubmit}
        >

          <FaCloudUploadAlt />

          Publish Listing

        </button>

      </div>

    </div>

  );

}


export default CreateMarketplaceListing;