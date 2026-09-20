import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  FaArrowLeft,
  FaHeart,
  FaShareAlt,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaEye,
  FaBox,
  FaTag,
  FaClock,
  FaUser,
  FaComments,
  FaPhone,
  FaWhatsapp,
  FaStore,
  FaChevronLeft,
  FaChevronRight,
  FaFlag,
  FaBan,
  FaTimes
} from "react-icons/fa";

import "./MarketplaceProductDetails.css";


function MarketplaceProductDetails() {

  const navigate = useNavigate();
  const { id } = useParams();


  // =====================================================
  // STATE
  // =====================================================

  const [product, setProduct] = useState(null);

  const [loading, setLoading] = useState(true);

  const [selectedImage, setSelectedImage] = useState(0);

  const [isFavorite, setIsFavorite] = useState(false);

  const [showReport, setShowReport] = useState(false);


  // =====================================================
  // DEMO PRODUCT
  // Replace this with your API request later
  // =====================================================

  const demoProduct = {

    _id: id || "demo-product",

    name: "iPhone 13 Pro",

    price: 650,

    currency: "USD",

    condition: "New",

    category: "Smartphones",

    location: "Harare, Zimbabwe",

    quantity: 2,

    views: 324,

    listed: "2 days ago",

    description:
      "iPhone 13 Pro in excellent condition. No scratches, battery health 92%. Comes with original box, charger and accessories. Available for immediate collection.",

    images: [

      "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&w=1000&q=85",

      "https://images.unsplash.com/photo-1592286927505-2fd0d4f3f0f3?auto=format&fit=crop&w=1000&q=85",

      "https://images.unsplash.com/photo-1611472173362-3f53dbd40a5a?auto=format&fit=crop&w=1000&q=85",

      "https://images.unsplash.com/photo-1603921326210-6edd2d60ca68?auto=format&fit=crop&w=1000&q=85",

      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1000&q=85"

    ],

    seller: {

      name: "ABC Electronics",

      businessName: "ABC Electronics",

      verified: true,

      memberSince: "Jan 2022",

      location: "Harare, Zimbabwe",

      phone: "+263 77 123 4567",

      whatsapp: "+263771234567",

      reviews: 128,

      logo: null

    }

  };


  // =====================================================
  // LOAD PRODUCT
  // =====================================================

  useEffect(() => {

    const loadProduct = async () => {

      try {

        setLoading(true);

        /*
          Later connect your backend here.

          Example:

          const response = await api.get(
            `/marketplace/products/${id}`
          );

          setProduct(response.data);

        */

        await new Promise(
          (resolve) =>
            setTimeout(resolve, 300)
        );

        setProduct(demoProduct);

      } catch (error) {

        console.error(
          "Failed to load marketplace product:",
          error
        );

      } finally {

        setLoading(false);

      }

    };


    loadProduct();

  }, [id]);


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (

      <div className="marketplace-product-loading">

        <div className="marketplace-loading-spinner" />

        <p>
          Loading product...
        </p>

      </div>

    );

  }


  // =====================================================
  // PRODUCT NOT FOUND
  // =====================================================

  if (!product) {

    return (

      <div className="marketplace-product-not-found">

        <FaBox />

        <h2>
          Product not found
        </h2>

        <p>
          This marketplace listing may have
          been removed or is no longer available.
        </p>

        <button
          type="button"
          onClick={() =>
            navigate("/marketplace")
          }
        >
          Back to Marketplace
        </button>

      </div>

    );

  }


  // =====================================================
  // DATA
  // =====================================================

  const images =
    product.images?.length
      ? product.images
      : product.image
        ? [product.image]
        : [];


  const seller =
    product.seller || {};


  const sellerName =
    seller.businessName ||
    seller.name ||
    "Business Seller";


  const sellerInitial =
    sellerName.charAt(0).toUpperCase();


  const verified =
    seller.verified ??
    product.verified ??
    true;


  const price =
    Number(product.price || 0)
      .toLocaleString(
        "en-US",
        {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2
        }
      );


  // =====================================================
  // IMAGE NAVIGATION
  // =====================================================

  const previousImage = () => {

    if (!images.length) {
      return;
    }

    setSelectedImage(
      (current) =>
        current === 0
          ? images.length - 1
          : current - 1
    );

  };


  const nextImage = () => {

    if (!images.length) {
      return;
    }

    setSelectedImage(
      (current) =>
        current === images.length - 1
          ? 0
          : current + 1
    );

  };


  // =====================================================
  // FAVORITE
  // =====================================================

  const handleFavorite = () => {

    setIsFavorite(
      (current) => !current
    );

  };


  // =====================================================
  // SHARE
  // =====================================================

  const handleShare = async () => {

    const shareData = {

      title: product.name,

      text:
        `${product.name} - ${product.currency || "USD"} ${price}`,

      url: window.location.href

    };


    try {

      if (
        navigator.share
      ) {

        await navigator.share(
          shareData
        );

      } else {

        await navigator.clipboard.writeText(
          window.location.href
        );

        alert(
          "Product link copied to clipboard."
        );

      }

    } catch (error) {

      console.log(
        "Share cancelled."
      );

    }

  };


  // =====================================================
  // CHAT SELLER
  // =====================================================

  const handleChatSeller = () => {

    navigate(
      `/marketplace/messages?seller=${seller._id || seller.id || ""}&product=${product._id || product.id || id}`
    );

  };


  // =====================================================
  // CALL SELLER
  // =====================================================

  const handleCallSeller = () => {

    if (!seller.phone) {
      return;
    }

    window.location.href =
      `tel:${seller.phone}`;

  };


  // =====================================================
  // WHATSAPP
  // =====================================================

  const handleWhatsApp = () => {

    if (!seller.whatsapp && !seller.phone) {
      return;
    }

    const phone =
      seller.whatsapp ||
      seller.phone;

    const message =
      encodeURIComponent(
        `Hello, I am interested in your ${product.name} listed on BusyBiz Marketplace.`
      );

    window.open(
      `https://wa.me/${phone.replace(/\D/g, "")}?text=${message}`,
      "_blank",
      "noopener,noreferrer"
    );

  };


  // =====================================================
  // BACK
  // =====================================================

  const handleBack = () => {

    navigate(-1);

  };


  return (

    <div className="marketplace-product-page">


      {/* =================================================
          TOP BAR
      ================================================= */}

      <div className="marketplace-product-topbar">

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


        <div className="marketplace-product-actions">

          <button
            type="button"
            onClick={handleShare}
          >

            <FaShareAlt />

            <span>
              Share
            </span>

          </button>


          <button
            type="button"
            className={
              isFavorite
                ? "marketplace-save-active"
                : ""
            }
            onClick={handleFavorite}
          >

            <FaHeart />

            <span>
              {isFavorite
                ? "Saved"
                : "Save"}
            </span>

          </button>

        </div>

      </div>


      {/* =================================================
          BREADCRUMB
      ================================================= */}

      <div className="marketplace-product-breadcrumb">

        <span
          onClick={() =>
            navigate("/marketplace")
          }
        >
          Marketplace
        </span>

        <span>
          ›
        </span>

        <span>
          {product.category}
        </span>

        <span>
          ›
        </span>

        <span>
          {product.name}
        </span>

      </div>


      {/* =================================================
          MAIN PRODUCT
      ================================================= */}

      <div className="marketplace-product-main">


        {/* =================================================
            IMAGE GALLERY
        ================================================= */}

        <section className="marketplace-product-gallery">


          {/* THUMBNAILS */}

          <div className="marketplace-product-thumbnails">

            {images.map(
              (image, index) => (

                <button
                  type="button"
                  key={`${image}-${index}`}
                  className={
                    selectedImage === index
                      ? "marketplace-thumbnail-active"
                      : ""
                  }
                  onClick={() =>
                    setSelectedImage(index)
                  }
                >

                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                  />

                </button>

              )
            )}


            {images.length > 5 && (

              <button
                type="button"
                className="marketplace-more-images"
              >
                +{images.length - 5}
              </button>

            )}

          </div>


          {/* MAIN IMAGE */}

          <div className="marketplace-product-main-image">

            {images.length > 0 ? (

              <img
                src={images[selectedImage]}
                alt={product.name}
              />

            ) : (

              <div className="marketplace-no-product-image">

                <FaStore />

                <span>
                  No image available
                </span>

              </div>

            )}


            {images.length > 1 && (

              <>

                <button
                  type="button"
                  className="marketplace-image-arrow marketplace-image-arrow-left"
                  onClick={previousImage}
                  aria-label="Previous image"
                >

                  <FaChevronLeft />

                </button>


                <button
                  type="button"
                  className="marketplace-image-arrow marketplace-image-arrow-right"
                  onClick={nextImage}
                  aria-label="Next image"
                >

                  <FaChevronRight />

                </button>

              </>

            )}

          </div>

        </section>


        {/* =================================================
            PRODUCT INFORMATION
        ================================================= */}

        <section className="marketplace-product-information">


          {/* CONDITION */}

          <div className="marketplace-product-condition-row">

            <span className="marketplace-product-condition">

              {product.condition}

            </span>

            {product.quantity > 0 && (

              <span className="marketplace-in-stock">

                <span />

                In Stock

              </span>

            )}

          </div>


          {/* TITLE */}

          <h1>
            {product.name}
          </h1>


          {/* PRICE */}

          <div className="marketplace-product-price">

            <span>
              {product.currency || "USD"}
            </span>

            {price}

          </div>


          {/* QUICK DETAILS */}

          <div className="marketplace-product-quick-details">


            <div>

              <FaTag />

              <span>

                <small>
                  Condition
                </small>

                {product.condition || "New"}

              </span>

            </div>


            <div>

              <FaMapMarkerAlt />

              <span>

                <small>
                  Location
                </small>

                {product.location || "Zimbabwe"}

              </span>

            </div>


            <div>

              <FaTag />

              <span>

                <small>
                  Category
                </small>

                {product.category || "General"}

              </span>

            </div>


            <div>

              <FaClock />

              <span>

                <small>
                  Listed
                </small>

                {product.listed || "Recently"}

              </span>

            </div>


            <div>

              <FaEye />

              <span>

                <small>
                  Views
                </small>

                {product.views || 0}

              </span>

            </div>


            <div>

              <FaBox />

              <span>

                <small>
                  Quantity
                </small>

                {product.quantity ?? 0} Available

              </span>

            </div>

          </div>


          {/* DESCRIPTION */}

          <div className="marketplace-product-description">

            <h3>
              Description
            </h3>

            <p>
              {product.description ||
                "No description has been provided for this listing."}
            </p>

          </div>

        </section>

      </div>


      {/* =================================================
          SELLER + CONTACT
      ================================================= */}

      <div className="marketplace-product-bottom">


        {/* =================================================
            SELLER INFORMATION
        ================================================= */}

        <section className="marketplace-seller-information">

          <h3>
            Seller Information
          </h3>


          <div className="marketplace-seller-profile-row">


            <div className="marketplace-large-seller-avatar">

              {seller.logo ? (

                <img
                  src={seller.logo}
                  alt={sellerName}
                />

              ) : (

                sellerInitial

              )}

            </div>


            <div className="marketplace-seller-profile-details">

              <div className="marketplace-seller-profile-name">

                <strong>
                  {sellerName}
                </strong>

                {verified && (

                  <FaCheckCircle
                    title="Verified Business"
                  />

                )}

              </div>


              {verified && (

                <span className="marketplace-verified-business">
                  Verified Business
                </span>

              )}


              <span>
                Member since {seller.memberSince || "2024"}
              </span>


              <span>

                <FaMapMarkerAlt />

                {seller.location ||
                  product.location ||
                  "Zimbabwe"}

              </span>


              {seller.reviews !== undefined && (

                <span>
                  {seller.reviews} reviews
                </span>

              )}

            </div>

          </div>


          <button
            type="button"
            className="marketplace-view-seller-button"
            onClick={() =>
              navigate(
                `/marketplace/seller/${seller._id || seller.id || ""}`
              )
            }
          >

            View Seller Profile

          </button>

        </section>


        {/* =================================================
            CONTACT SELLER
        ================================================= */}

        <section className="marketplace-contact-seller">

          <h3>
            Contact Seller
          </h3>


          <div className="marketplace-contact-buttons">

            <button
              type="button"
              className="marketplace-chat-button"
              onClick={handleChatSeller}
            >

              <FaComments />

              Chat with Seller

            </button>


            <button
              type="button"
              className="marketplace-call-button"
              onClick={handleCallSeller}
            >

              <FaPhone />

              Call Seller

            </button>


            <button
              type="button"
              className="marketplace-whatsapp-button"
              onClick={handleWhatsApp}
            >

              <FaWhatsapp />

              WhatsApp Seller

            </button>

          </div>


          <div className="marketplace-safety-notice">

            <strong>
              Safety reminder
            </strong>

            <p>
              BusyBiz does not process payments for
              Marketplace transactions. Buyers and sellers
              arrange payment and delivery directly.
            </p>

          </div>

        </section>

      </div>


      {/* =================================================
          REPORT
      ================================================= */}

      <div className="marketplace-product-report">

        <button
          type="button"
          onClick={() =>
            setShowReport(true)
          }
        >

          <FaFlag />

          Report this listing

        </button>

      </div>


      {/* =================================================
          REPORT MODAL
      ================================================= */}

      {showReport && (

        <div
          className="marketplace-report-overlay"
          onClick={() =>
            setShowReport(false)
          }
        >

          <div
            className="marketplace-report-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <button
              type="button"
              className="marketplace-report-close"
              onClick={() =>
                setShowReport(false)
              }
            >

              <FaTimes />

            </button>


            <FaFlag className="marketplace-report-icon" />


            <h2>
              Report Listing
            </h2>


            <p>
              Why are you reporting this listing?
            </p>


            <button
              type="button"
              onClick={() =>
                setShowReport(false)
              }
            >
              Suspicious or fraudulent
            </button>


            <button
              type="button"
              onClick={() =>
                setShowReport(false)
              }
            >
              Incorrect information
            </button>


            <button
              type="button"
              onClick={() =>
                setShowReport(false)
              }
            >
              Prohibited item
            </button>


            <button
              type="button"
              onClick={() =>
                setShowReport(false)
              }
            >
              Other
            </button>

          </div>

        </div>

      )}

    </div>

  );

}


export default MarketplaceProductDetails;