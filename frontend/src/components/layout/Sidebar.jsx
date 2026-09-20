import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import {
  FaHome,
  FaBoxOpen,
  FaWarehouse,
  FaUsers,
  FaShoppingCart,
  FaFileInvoice,
  FaReceipt,
  FaTruck,
  FaChartBar,
  FaCog,
  FaRobot,
  FaSignOutAlt,
  FaChevronLeft,
  FaChevronRight,
  FaMoneyBillWave,
  FaFileAlt,
  FaChartLine,
  FaCalculator,
  FaTimes,
  FaShoppingBag,
  FaComments,
  FaListAlt
} from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";

import "./Sidebar.css";


function Sidebar({ mobileOpen = false, onClose }) {

  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const [collapsed, setCollapsed] = useState(false);


  // =====================================================
  // MENU
  // =====================================================

  const menu = [

    // ===================================================
    // MAIN
    // ===================================================

    {
      section: "MAIN",

      items: [

        {
          name: "Dashboard",
          icon: <FaHome />,
          path: "/dashboard"
        },

        {
          name: "Products",
          icon: <FaBoxOpen />,
          path: "/products"
        },

        {
          name: "Inventory",
          icon: <FaWarehouse />,
          path: "/inventory"
        },

        {
          name: "Suppliers",
          icon: <FaTruck />,
          path: "/suppliers"
        },

        {
          name: "Customers",
          icon: <FaUsers />,
          path: "/customers"
        },

        {
          name: "Orders",
          icon: <FaShoppingCart />,
          path: "/orders"
        }

      ]
    },


    // ===================================================
    // SALES & FINANCE
    // ===================================================

    {
      section: "SALES & FINANCE",

      items: [

        {
          name: "Invoices",
          icon: <FaFileInvoice />,
          path: "/invoices"
        },

        {
          name: "Quotes",
          icon: <FaFileAlt />,
          path: "/quotes"
        },

        {
          name: "Receipts",
          icon: <FaReceipt />,
          path: "/receipts"
        },

        {
          name: "Expenses",
          icon: <FaMoneyBillWave />,
          path: "/expenses"
        },

        {
          name: "Accounting",
          icon: <FaCalculator />,
          path: "/accounting"
        },

        {
          name: "Finance",
          icon: <FaMoneyBillWave />,
          path: "/finance"
        }

      ]
    },


    // ===================================================
    // ANALYTICS
    // ===================================================

    {
      section: "ANALYTICS",

      items: [

        {
          name: "Reports",
          icon: <FaChartBar />,
          path: "/reports"
        },

        {
          name: "Analytics",
          icon: <FaChartLine />,
          path: "/analytics"
        },

        {
          name: "Business Health",
          icon: <FaChartLine />,
          path: "/business-health"
        },

        {
          name: "Forecast",
          icon: <FaChartLine />,
          path: "/forecast"
        }

      ]
    },


    // ===================================================
    // INTELLIGENCE
    // ===================================================

    {
      section: "INTELLIGENCE",

      items: [

        {
          name: "AI Assistant",
          icon: <FaRobot />,
          path: "/ai-assistant"
        }

      ]
    },


    // ===================================================
    // SYSTEM
    // ===================================================

    {
      section: "SYSTEM",

      items: [

        {
          name: "Settings",
          icon: <FaCog />,
          path: "/settings"
        }

      ]
    }

  ];


  // =====================================================
  // MARKETPLACE MENU
  // =====================================================

  const marketplaceMenu = [

    {
      name: "Marketplace",
      icon: <FaShoppingBag />,
      path: "/marketplace"
    },

    {
      name: "My Listings",
      icon: <FaListAlt />,
      path: "/marketplace/my-listings"
    },

    {
      name: "Messages",
      icon: <FaComments />,
      path: "/marketplace/messages",
      badge: 12
    }

  ];


  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {

    logout();

    if (onClose) {
      onClose();
    }

    navigate("/login");

  };


  // =====================================================
  // NAVIGATION
  // =====================================================

  const handleNavigation = () => {

    if (window.innerWidth <= 900 && onClose) {
      onClose();
    }

  };


  // =====================================================
  // OWNER
  // =====================================================

  const ownerName =
    user?.fullName ||
    user?.name ||
    user?.username ||
    "Business Owner";

  const ownerInitial =
    ownerName.charAt(0).toUpperCase();


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <>

      {/* =================================================
          MOBILE OVERLAY
      ================================================= */}

      {mobileOpen && (

        <div
          className="sidebar-mobile-overlay"
          onClick={onClose}
        />

      )}


      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside
        className={`
          busybiz-sidebar
          ${collapsed ? "sidebar-collapsed" : ""}
          ${mobileOpen ? "sidebar-mobile-open" : ""}
        `}
      >


        {/* =================================================
            BRAND
        ================================================= */}

        <div className="sidebar-brand">

          <div className="sidebar-brand-logo">
            B
          </div>


          {!collapsed && (

            <div className="sidebar-brand-text">

              <strong>
                BusyBiz
              </strong>

              <span>
                Manage • Analyze • Grow
              </span>

            </div>

          )}


          {/* MOBILE CLOSE */}

          <button
            type="button"
            className="sidebar-mobile-close"
            onClick={onClose}
            title="Close menu"
          >

            <FaTimes />

          </button>

        </div>


        {/* =================================================
            NAVIGATION
        ================================================= */}

        <nav className="sidebar-navigation">


          {/* =================================================
              MAIN BUSINESS MENU
          ================================================= */}

          {menu.map((group) => (

            <div
              className="sidebar-menu-group"
              key={group.section}
            >

              {!collapsed && (

                <div className="sidebar-section-title">
                  {group.section}
                </div>

              )}


              {group.items.map((item) => (

                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={handleNavigation}
                  className={({ isActive }) =>
                    `sidebar-nav-item ${
                      isActive
                        ? "sidebar-nav-item-active"
                        : ""
                    }`
                  }
                  title={collapsed ? item.name : ""}
                >

                  <span className="sidebar-nav-icon">
                    {item.icon}
                  </span>


                  {!collapsed && (

                    <span className="sidebar-nav-name">
                      {item.name}
                    </span>

                  )}


                  {/* AI BADGE */}

                  {!collapsed &&
                    item.name === "AI Assistant" && (

                    <span className="sidebar-ai-badge">
                      AI
                    </span>

                  )}

                </NavLink>

              ))}

            </div>

          ))}


          {/* =================================================
              MARKETPLACE
          ================================================= */}

          <div className="sidebar-menu-group marketplace-sidebar-group">


            {!collapsed && (

              <div className="sidebar-section-title">
                MARKETPLACE
              </div>

            )}


            {marketplaceMenu.map((item) => (

              <NavLink
                key={item.path}
                to={item.path}
                onClick={handleNavigation}
                className={({ isActive }) =>
                  `sidebar-nav-item marketplace-nav-item ${
                    isActive
                      ? "sidebar-nav-item-active marketplace-active"
                      : ""
                  }`
                }
                title={collapsed ? item.name : ""}
              >

                <span className="sidebar-nav-icon">
                  {item.icon}
                </span>


                {!collapsed && (

                  <span className="sidebar-nav-name">
                    {item.name}
                  </span>

                )}


                {/* MESSAGE BADGE */}

                {!collapsed &&
                  item.name === "Messages" &&
                  item.badge && (

                  <span className="sidebar-message-badge">
                    {item.badge}
                  </span>

                )}

              </NavLink>

            ))}

          </div>

        </nav>


        {/* =================================================
            OWNER
        ================================================= */}

        <div className="sidebar-owner">

          <div className="sidebar-owner-avatar">
            {ownerInitial}
          </div>


          {!collapsed && (

            <div className="sidebar-owner-info">

              <strong>
                {ownerName}
              </strong>

              <span>
                Business Owner
              </span>

            </div>

          )}

        </div>


        {/* =================================================
            LOGOUT + COLLAPSE
        ================================================= */}

        <div className="sidebar-bottom">


          {/* LOGOUT */}

          <button
            type="button"
            className="sidebar-logout"
            onClick={handleLogout}
            title={collapsed ? "Logout" : ""}
          >

            <FaSignOutAlt />

            {!collapsed && (

              <span>
                Logout
              </span>

            )}

          </button>


          {/* COLLAPSE */}

          <button
            type="button"
            className="sidebar-collapse-button"
            onClick={() => setCollapsed(!collapsed)}
            title={
              collapsed
                ? "Expand sidebar"
                : "Collapse sidebar"
            }
          >

            {collapsed
              ? <FaChevronRight />
              : <FaChevronLeft />
            }


            {!collapsed && (

              <span>
                Collapse
              </span>

            )}

          </button>

        </div>

      </aside>

    </>

  );

}


export default Sidebar;