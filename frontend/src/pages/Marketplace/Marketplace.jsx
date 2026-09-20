import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaSearch,
  FaHeart,
  FaMapMarkerAlt,
  FaChevronDown,
  FaPlus,
  FaFilter,
  FaEye,
  FaCheckCircle,
  FaPhone,
  FaWhatsapp,
  FaPaperclip,
  FaSmile,
  FaPaperPlane,
  FaShareAlt,
  FaFlag,
  FaBan,
  FaTrash,
  FaChevronLeft,
  FaChevronRight,
  FaStore,
  FaBoxes,
  FaEnvelope,
  FaShoppingBag,
  FaTimes,
} from "react-icons/fa";

import "./Marketplace.css";

const products = [
  {
    id: 1,
    name: "iPhone 13 Pro",
    category: "Smartphones",
    condition: "New",
    price: 650,
    location: "Harare, Zimbabwe",
    seller: "ABC Electronics",
    sellerShort: "ABC",
    sellerColor: "black",
    verified: true,
    views: 324,
    quantity: 2,
    listed: "2 days ago",
    image:
      "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&w=900&q=85",
    description:
      "iPhone 13 Pro in excellent condition. No scratches, battery health 92%. Comes with original box, charger and accessories.",
  },
  {
    id: 2,
    name: "HP Pavilion Laptop",
    category: "Laptops",
    condition: "New",
    price: 450,
    location: "Harare, Zimbabwe",
    seller: "Tech World",
    sellerShort: "TW",
    verified: true,
    views: 210,
    quantity: 5,
    listed: "3 days ago",
    image:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=85",
    description:
      "HP Pavilion laptop suitable for business, school and everyday professional use.",
  },
  {
    id: 3,
    name: "Office Desk",
    category: "Office Furniture",
    condition: "Used",
    price: 180,
    location: "Bulawayo, Zimbabwe",
    seller: "Office Solutions",
    sellerShort: "OS",
    verified: true,
    views: 119,
    quantity: 3,
    listed: "4 days ago",
    image:
      "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=900&q=85",
    description:
      "Modern office desk in good condition. Suitable for home offices and corporate environments.",
  },
  {
    id: 4,
    name: "3 Seater Sofa",
    category: "Furniture",
    condition: "Used",
    price: 350,
    location: "Harare, Zimbabwe",
    seller: "Home Comforts",
    sellerShort: "HC",
    verified: true,
    views: 96,
    quantity: 1,
    listed: "5 days ago",
    image:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=85",
    description:
      "Comfortable three-seater sofa in good condition. Perfect for homes, offices and reception areas.",
  },
  {
    id: 5,
    name: "Honda CB 125",
    category: "Motorbikes",
    condition: "Used",
    price: 900,
    location: "Harare, Zimbabwe",
    seller: "Ride Center",
    sellerShort: "RC",
    verified: true,
    views: 87,
    quantity: 1,
    listed: "6 days ago",
    image:
      "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=900&q=85",
    description:
      "Reliable Honda motorcycle suitable for commuting and business deliveries.",
  },
  {
    id: 6,
    name: 'Samsung 43" Smart TV',
    category: "Televisions",
    condition: "New",
    price: 320,
    location: "Harare, Zimbabwe",
    seller: "Tech World",
    sellerShort: "TW",
    verified: true,
    views: 82,
    quantity: 4,
    listed: "1 week ago",
    image:
      "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=900&q=85",
    description:
      "Samsung smart television with excellent picture quality and smart connectivity.",
  },
  {
    id: 7,
    name: "Hisense Fridge",
    category: "Appliances",
    condition: "New",
    price: 480,
    location: "Harare, Zimbabwe",
    seller: "Home Appliances",
    sellerShort: "HA",
    verified: true,
    views: 72,
    quantity: 2,
    listed: "1 week ago",
    image:
      "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?auto=format&fit=crop&w=900&q=85",
    description:
      "Large Hisense refrigerator suitable for homes, restaurants and offices.",
  },
  {
    id: 8,
    name: "Washing Machine",
    category: "Appliances",
    condition: "Used",
    price: 250,
    location: "Harare, Zimbabwe",
    seller: "Home Comforts",
    sellerShort: "HC",
    verified: true,
    views: 64,
    quantity: 1,
    listed: "1 week ago",
    image:
      "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=900&q=85",
    description:
      "Washing machine in good working condition and ready for collection.",
  },
];

const conversations = [
  {
    id: 1,
    name: "ABC Electronics",
    short: "ABC",
    message: "Yes, it is available.",
    time: "10:30 AM",
    unread: true,
  },
  {
    id: 2,
    name: "Tech World",
    short: "TW",
    message: "Can you do $400?",
    time: "9:15 AM",
    unread: true,
  },
  {
    id: 3,
    name: "Home Comforts",
    short: "HC",
    message: "Okay, sounds good.",
    time: "Yesterday",
    unread: false,
  },
  {
    id: 4,
    name: "Office Solutions",
    short: "OS",
    message: "Where can I collect it?",
    time: "Yesterday",
    unread: false,
  },
  {
    id: 5,
    name: "John Smith",
    short: "JS",
    message: "Thanks",
    time: "2 days ago",
    unread: false,
  },
];

const listingRows = [
  {
    name: "iPhone 13 Pro",
    image: products[0].image,
    price: 650,
    views: 324,
    messages: 18,
    status: "Active",
  },
  {
    name: "HP Pavilion Laptop",
    image: products[1].image,
    price: 450,
    views: 210,
    messages: 12,
    status: "Active",
  },
  {
    name: "Office Desk",
    image: products[2].image,
    price: 180,
    views: 119,
    messages: 7,
    status: "Active",
  },
  {
    name: "3 Seater Sofa",
    image: products[3].image,
    price: 350,
    views: 96,
    messages: 5,
    status: "Active",
  },
  {
    name: 'Samsung 43" Smart TV',
    image: products[5].image,
    price: 320,
    views: 82,
    messages: 4,
    status: "Active",
  },
];

function Marketplace() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [location, setLocation] = useState("All Locations");
  const [condition, setCondition] = useState("All Conditions");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("Newest");
  const [selectedProduct, setSelectedProduct] = useState(products[0]);
  const [likedProducts, setLikedProducts] = useState([]);
  const [message, setMessage] = useState("");
  const [activeConversation, setActiveConversation] = useState(
    conversations[0]
  );
  const [showFilters, setShowFilters] = useState(false);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (search.trim()) {
      const searchValue = search.toLowerCase();

      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(searchValue) ||
          product.category.toLowerCase().includes(searchValue) ||
          product.seller.toLowerCase().includes(searchValue)
      );
    }

    if (category !== "All Categories") {
      result = result.filter((product) => product.category === category);
    }

    if (location !== "All Locations") {
      result = result.filter((product) => product.location === location);
    }

    if (condition !== "All Conditions") {
      result = result.filter((product) => product.condition === condition);
    }

    if (minPrice !== "") {
      result = result.filter((product) => product.price >= Number(minPrice));
    }

    if (maxPrice !== "") {
      result = result.filter((product) => product.price <= Number(maxPrice));
    }

    if (sort === "Price: Low to High") {
      result.sort((a, b) => a.price - b.price);
    }

    if (sort === "Price: High to Low") {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [
    search,
    category,
    location,
    condition,
    minPrice,
    maxPrice,
    sort,
  ]);

  const toggleLike = (id) => {
    setLikedProducts((current) =>
      current.includes(id)
        ? current.filter((productId) => productId !== id)
        : [...current, id]
    );
  };

  const selectProduct = (product) => {
    setSelectedProduct(product);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const sendMessage = () => {
    if (!message.trim()) return;

    setMessage("");
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("All Categories");
    setLocation("All Locations");
    setCondition("All Conditions");
    setMinPrice("");
    setMaxPrice("");
    setSort("Newest");
  };

  const categories = [
    "All Categories",
    "Smartphones",
    "Laptops",
    "Office Furniture",
    "Furniture",
    "Motorbikes",
    "Televisions",
    "Appliances",
  ];

  return (
    <div className="marketplace-page">
      {/* PAGE HEADER */}
      <div className="marketplace-header">
        <div>
          <div className="marketplace-title-row">
            <h1>Marketplace</h1>

            <span className="marketplace-subtitle">
              Buy, sell and connect with verified businesses in Zimbabwe.
            </span>
          </div>
        </div>

        <div className="marketplace-header-actions">
          <button className="header-icon-button" title="Notifications">
            <span className="notification-dot"></span>
            <FaEnvelope />
          </button>

          <button className="header-icon-button" title="Messages">
            <FaEnvelope />
          </button>

          <div className="marketplace-user">
            <div className="user-avatar">JD</div>

            <div>
              <strong>John Doe</strong>
              <small>Professional</small>
            </div>

            <FaChevronDown className="user-chevron" />
          </div>
        </div>
      </div>

      {/* TOP MARKETPLACE AREA */}
      <div className="marketplace-main-area">
        {/* LEFT SECTION */}
        <section className="marketplace-browse">
          {/* SEARCH BAR */}
          <div className="marketplace-search-row">
            <div className="marketplace-search">
              <FaSearch />
              <input
                type="text"
                placeholder="Search for products, brands, categories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              {search && (
                <button
                  className="clear-search"
                  onClick={() => setSearch("")}
                >
                  <FaTimes />
                </button>
              )}
            </div>

            <div className="filter-select">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
              <FaChevronDown />
            </div>

            <div className="filter-select location-select">
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              >
                <option>All Locations</option>
                <option>Harare, Zimbabwe</option>
                <option>Bulawayo, Zimbabwe</option>
              </select>
              <FaChevronDown />
            </div>

            <button
              className="sell-product-button"
              onClick={() => navigate("/marketplace/create")}
            >
              <FaPlus />
              Sell a Product
            </button>
          </div>

          {/* FILTER ROW */}
          <div className="marketplace-filter-row">
            <button
              className="mobile-filter-button"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FaFilter />
              Filters
            </button>

            <div className={`desktop-filters ${showFilters ? "open" : ""}`}>
              <div className="filter-select gold-filter">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {categories.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
                <FaChevronDown />
              </div>

              <div className="filter-select">
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                >
                  <option>All Conditions</option>
                  <option>New</option>
                  <option>Used</option>
                </select>
                <FaChevronDown />
              </div>

              <div className="price-input">
                <input
                  type="number"
                  placeholder="Min Price"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
                <span>USD</span>
              </div>

              <div className="price-input">
                <input
                  type="number"
                  placeholder="Max Price"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
                <span>USD</span>
              </div>

              <button className="clear-filter-button" onClick={clearFilters}>
                Clear
              </button>
            </div>

            <div className="sort-select">
              <span>Sort by:</span>

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option>Newest</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
              </select>

              <FaChevronDown />
            </div>
          </div>

          {/* PRODUCTS */}
          <div className="product-grid">
            {filteredProducts.map((product) => (
              <article
                className={`product-card ${
                  selectedProduct.id === product.id ? "selected" : ""
                }`}
                key={product.id}
                onClick={() => selectProduct(product)}
              >
                <div className="product-image-wrapper">
                  <img src={product.image} alt={product.name} />

                  <span
                    className={`condition-badge ${
                      product.condition === "Used" ? "used" : ""
                    }`}
                  >
                    {product.condition}
                  </span>

                  <button
                    className={`favorite-button ${
                      likedProducts.includes(product.id) ? "liked" : ""
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(product.id);
                    }}
                  >
                    <FaHeart />
                  </button>
                </div>

                <div className="product-card-content">
                  <div className="product-name-price">
                    <h3>{product.name}</h3>
                    <strong>${product.price}</strong>
                  </div>

                  <div className="product-meta">
                    <span>{product.condition}</span>
                    <span>•</span>
                    <span>{product.category}</span>
                  </div>

                  <div className="product-location">
                    <FaMapMarkerAlt />
                    <span>{product.location}</span>
                  </div>

                  <div className="product-seller">
                    <div className="seller-mini-avatar">
                      {product.sellerShort}
                    </div>

                    <div>
                      <strong>{product.seller}</strong>

                      <div className="verified-label">
                        {product.verified && (
                          <>
                            <FaCheckCircle />
                            Verified Business
                          </>
                        )}
                        <span className="gold-dot"></span>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="empty-products">
              <FaStore />
              <h3>No products found</h3>
              <p>Try changing your search or filters.</p>
              <button onClick={clearFilters}>Clear Filters</button>
            </div>
          )}

          {/* PAGINATION */}
          <div className="marketplace-pagination">
            <button>
              <FaChevronLeft />
            </button>

            <button className="active">1</button>
            <button>2</button>
            <button>3</button>
            <button>4</button>

            <span>...</span>

            <button>12</button>

            <button>
              <FaChevronRight />
            </button>
          </div>
        </section>

        {/* PRODUCT DETAILS */}
        <aside className="marketplace-product-details">
          <div className="details-breadcrumb">
            Marketplace
            <span>›</span>
            {selectedProduct.category}
            <span>›</span>
            {selectedProduct.name}
          </div>

          <div className="details-content">
            <div className="details-gallery">
              <div className="thumbnail-column">
                <div className="thumbnail active">
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                  />
                </div>

                <div className="thumbnail">
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                  />
                </div>

                <div className="thumbnail">
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                  />
                </div>

                <div className="thumbnail">
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                  />
                </div>

                <div className="thumbnail-more">+3</div>
              </div>

              <div className="main-product-image">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                />
              </div>
            </div>

            <div className="product-detail-info">
              <div className="detail-title-row">
                <div>
                  <h2>{selectedProduct.name}</h2>
                  <div className="detail-price">
                    ${selectedProduct.price}
                  </div>
                </div>
              </div>

              <div className="detail-stock">
                <span className="stock-dot"></span>
                In Stock
              </div>

              <div className="detail-information-grid">
                <div>
                  <span>Condition</span>
                  <strong>{selectedProduct.condition}</strong>
                </div>

                <div>
                  <span>Location</span>
                  <strong>{selectedProduct.location}</strong>
                </div>

                <div>
                  <span>Category</span>
                  <strong>{selectedProduct.category}</strong>
                </div>

                <div>
                  <span>Listed</span>
                  <strong>{selectedProduct.listed}</strong>
                </div>

                <div>
                  <span>
                    <FaEye /> Views
                  </span>
                  <strong>{selectedProduct.views}</strong>
                </div>

                <div>
                  <span>Quantity</span>
                  <strong>{selectedProduct.quantity} Available</strong>
                </div>
              </div>

              <div className="product-description">
                <h4>DESCRIPTION</h4>
                <p>{selectedProduct.description}</p>
                <p>Available for immediate collection.</p>
              </div>
            </div>
          </div>

          {/* SELLER + CONTACT */}
          <div className="seller-contact-section">
            <div className="seller-information">
              <h4>SELLER INFORMATION</h4>

              <div className="seller-profile-inline">
                <div className="large-seller-avatar">
                  {selectedProduct.sellerShort}
                </div>

                <div>
                  <strong>{selectedProduct.seller}</strong>

                  <div className="seller-verified">
                    <FaCheckCircle />
                    Verified Business
                    <span className="gold-dot"></span>
                  </div>

                  <p>Member since Jan 2022</p>
                </div>
              </div>

              <div className="seller-location">
                <FaMapMarkerAlt />
                {selectedProduct.location}
              </div>

              <div className="seller-rating">
                <span>★★★★★</span>
                <small>(128 reviews)</small>
              </div>

              <button
                className="view-seller-button"
                onClick={() =>
                  navigate(
                    `/marketplace/seller/${encodeURIComponent(
                      selectedProduct.seller
                    )}`
                  )
                }
              >
                View Seller Profile
              </button>
            </div>

            <div className="contact-seller">
              <h4>CONTACT SELLER</h4>

              <div className="contact-buttons">
                <button
                  onClick={() =>
                    setActiveConversation({
                      id: selectedProduct.id,
                      name: selectedProduct.seller,
                      short: selectedProduct.sellerShort,
                      message: "Start a conversation",
                      time: "Now",
                    })
                  }
                >
                  <FaEnvelope />
                  Chat with Seller
                </button>

                <button>
                  <FaPhone />
                  Call Seller
                </button>

                <button className="whatsapp-button">
                  <FaWhatsapp />
                  WhatsApp Seller
                </button>
              </div>

              <div className="marketplace-warning">
                <strong>Important</strong>
                <p>
                  BusyBiz does not process payments for Marketplace
                  transactions. Buyers and sellers arrange payment, delivery
                  and collection directly.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* BOTTOM SECTION */}
      <div className="marketplace-bottom">
        {/* MY LISTINGS */}
        <section className="my-listings-section">
          <div className="section-heading">
            <div>
              <h2>My Listings</h2>
              <p>Manage your marketplace listings and performance.</p>
            </div>

            <button
              className="add-listing-button"
              onClick={() => navigate("/marketplace/create")}
            >
              <FaPlus />
              Add New Listing
            </button>
          </div>

          {/* STAT CARDS */}
          <div className="listing-stats">
            <div className="listing-stat">
              <div className="stat-icon">
                <FaShoppingBag />
              </div>

              <div>
                <span>Active Listings</span>
                <strong>12</strong>
              </div>
            </div>

            <div className="listing-stat">
              <div className="stat-icon">
                <FaEye />
              </div>

              <div>
                <span>Total Views</span>
                <strong>324</strong>
              </div>
            </div>

            <div className="listing-stat">
              <div className="stat-icon">
                <FaEnvelope />
              </div>

              <div>
                <span>Messages</span>
                <strong>47</strong>
              </div>
            </div>

            <div className="listing-stat">
              <div className="stat-icon">
                <FaCheckCircle />
              </div>

              <div>
                <span>Sold Items</span>
                <strong>8</strong>
              </div>
            </div>
          </div>

          <div className="listing-tabs">
            <button>All Listings</button>
            <button className="active">Active (12)</button>
            <button>Sold (8)</button>
            <button>Hidden (3)</button>
          </div>

          <div className="listing-table-wrapper">
            <table className="listing-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Views</th>
                  <th>Messages</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {listingRows.map((listing) => (
                  <tr key={listing.name}>
                    <td>
                      <div className="table-product">
                        <img src={listing.image} alt={listing.name} />
                        <span>{listing.name}</span>
                      </div>
                    </td>

                    <td>${listing.price}</td>
                    <td>{listing.views}</td>
                    <td>{listing.messages}</td>

                    <td>
                      <span className="active-status">
                        {listing.status}
                      </span>
                    </td>

                    <td>
                      <div className="table-actions">
                        <button>Edit</button>
                        <button>Hide</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="listing-footer">
            <span>Showing 1 to 5 of 12 listings</span>

            <div>
              <button>
                <FaChevronLeft />
              </button>
              <button className="active">1</button>
              <button>2</button>
              <button>3</button>
              <button>
                <FaChevronRight />
              </button>
            </div>
          </div>
        </section>

        {/* MESSAGES */}
        <section className="marketplace-messages">
          <div className="messages-heading">
            <h2>Messages</h2>
          </div>

          <div className="messages-search">
            <FaSearch />
            <input placeholder="Search conversations..." />
          </div>

          <div className="conversation-list">
            {conversations.map((conversation) => (
              <button
                className={`conversation-item ${
                  activeConversation.id === conversation.id ? "active" : ""
                }`}
                key={conversation.id}
                onClick={() => setActiveConversation(conversation)}
              >
                <div className="conversation-avatar">
                  {conversation.short}
                </div>

                <div className="conversation-content">
                  <div>
                    <strong>{conversation.name}</strong>
                    <small>{conversation.time}</small>
                  </div>

                  <p>{conversation.message}</p>
                </div>

                {conversation.unread && (
                  <span className="unread-dot">1</span>
                )}
              </button>
            ))}
          </div>

          <button className="view-conversations">
            View all conversations →
          </button>
        </section>

        {/* CHAT */}
        <section className="marketplace-chat">
          <div className="chat-header">
            <div className="chat-seller">
              <div className="conversation-avatar">
                {activeConversation.short}
              </div>

              <div>
                <strong>{activeConversation.name}</strong>
                <span>Online</span>
              </div>
            </div>

            <div className="chat-header-actions">
              <button>
                <FaPhone />
              </button>
              <button>
                <FaEnvelope />
              </button>
            </div>
          </div>

          <div className="chat-product">
            <img
              src={selectedProduct.image}
              alt={selectedProduct.name}
            />

            <div>
              <strong>{selectedProduct.name}</strong>
              <span>${selectedProduct.price}</span>
            </div>

            <button>View Product</button>
          </div>

          <div className="chat-messages">
            <div className="chat-message seller-message">
              <span>Is the iPhone still available?</span>
              <small>10:28 AM ✓✓</small>
            </div>

            <div className="chat-message buyer-message">
              <span>Yes, it is available.</span>
              <small>10:29 AM</small>
            </div>

            <div className="chat-message buyer-message">
              <span>Can you do $600?</span>
              <small>10:29 AM ✓✓</small>
            </div>

            <div className="chat-message seller-message">
              <span>I can do $625.</span>
              <small>10:30 AM</small>
            </div>

            <div className="chat-message buyer-message">
              <span>Okay. Where can I collect it?</span>
              <small>10:30 AM ✓✓</small>
            </div>

            <div className="chat-message seller-message">
              <span>You can collect in Avondale, Harare.</span>
              <small>10:30 AM</small>
            </div>
          </div>

          <div className="chat-input-area">
            <button>
              <FaPaperclip />
            </button>

            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
              placeholder="Type a message..."
            />

            <button>
              <FaSmile />
            </button>

            <button className="send-message-button" onClick={sendMessage}>
              <FaPaperPlane />
            </button>
          </div>
        </section>

        {/* SELLER INFO */}
        <aside className="seller-info-panel">
          <h4>Seller Info</h4>

          <div className="seller-info-avatar">
            {selectedProduct.sellerShort}
          </div>

          <h3>{selectedProduct.seller}</h3>

          <div className="seller-info-verified">
            <FaCheckCircle />
            Verified Business
            <span className="gold-dot"></span>
          </div>

          <div className="seller-info-location">
            <FaMapMarkerAlt />
            {selectedProduct.location}
          </div>

          <button
            className="black-profile-button"
            onClick={() =>
              navigate(
                `/marketplace/seller/${encodeURIComponent(
                  selectedProduct.seller
                )}`
              )
            }
          >
            View Profile
          </button>

          <button className="white-listings-button">
            View Listings
          </button>

          <div className="seller-options">
            <span>Options</span>

            <button>
              <FaFlag />
              Report Seller
            </button>

            <button>
              <FaBan />
              Block Seller
            </button>

            <button>
              <FaTrash />
              Clear Conversation
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Marketplace;