import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaSearch,
  FaBoxOpen,
  FaWarehouse,
  FaUsers,
  FaShoppingCart,
  FaFileInvoice,
  FaReceipt,
  FaMoneyBillWave,
  FaChartLine,
  FaArrowRight,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimes,
  FaBuilding,
  FaTruck,
  FaFileAlt,
  FaRobot,
  FaChartBar,
  FaSyncAlt,
  FaCog,
  FaQuoteRight,
  FaCalculator,
  FaChartPie,
  FaTrophy
} from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";
import ProfileMenu from "../../components/dashboard/ProfileMenu";
import NotificationBell from "../../components/NotificationBell";
import api from "../../services/api";

import "./Dashboard.css";

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // =====================================================
  // STATE
  // =====================================================

  const [summary, setSummary] = useState(null);
  const [salesAnalytics, setSalesAnalytics] = useState(null);
  const [bestSelling, setBestSelling] = useState(null);
  const [health, setHealth] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [reports, setReports] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // =====================================================
  // OWNER INFORMATION
  // =====================================================

  const ownerName =
    user?.fullName ||
    user?.name ||
    user?.username ||
    "Business Owner";

  const ownerFirstName =
    ownerName.split(" ")[0] || "Business Owner";

  const ownerInitial =
    ownerName.charAt(0).toUpperCase();

  const profilePicture =
    user?.profilePicture ||
    user?.avatar ||
    "";

  // =====================================================
  // SEARCHABLE PAGES
  // =====================================================

  const searchablePages = [
    {
      name: "Dashboard",
      description: "Business overview",
      path: "/dashboard",
      icon: <FaChartLine />
    },
    {
      name: "Products",
      description: "Manage products",
      path: "/products",
      icon: <FaBoxOpen />
    },
    {
      name: "Inventory",
      description: "Manage stock and inventory",
      path: "/inventory",
      icon: <FaWarehouse />
    },
    {
      name: "Customers",
      description: "Manage your customers",
      path: "/customers",
      icon: <FaUsers />
    },
    {
      name: "Orders",
      description: "Sales and orders",
      path: "/orders",
      icon: <FaShoppingCart />
    },
    {
      name: "Invoices",
      description: "Create and manage invoices",
      path: "/invoices",
      icon: <FaFileInvoice />
    },
    {
      name: "Receipts",
      description: "Manage receipts",
      path: "/receipts",
      icon: <FaReceipt />
    },
    {
      name: "Suppliers",
      description: "Manage suppliers",
      path: "/suppliers",
      icon: <FaTruck />
    },
    {
      name: "Expenses",
      description: "Track business expenses",
      path: "/expenses",
      icon: <FaMoneyBillWave />
    },
    {
      name: "Accounting",
      description: "Business accounting",
      path: "/accounting",
      icon: <FaCalculator />
    },
    {
      name: "Finance",
      description: "Financial management",
      path: "/finance",
      icon: <FaMoneyBillWave />
    },
    {
      name: "Reports",
      description: "Business reports",
      path: "/reports",
      icon: <FaChartBar />
    },
    {
      name: "Advanced Reports",
      description: "Detailed business reports",
      path: "/advancedreports",
      icon: <FaChartPie />
    },
    {
      name: "Analytics",
      description: "Business analytics",
      path: "/analytics",
      icon: <FaChartLine />
    },
    {
      name: "Quotes",
      description: "Create quotations",
      path: "/quotes",
      icon: <FaQuoteRight />
    },
    {
      name: "Forecast",
      description: "Sales forecasting",
      path: "/forecast",
      icon: <FaChartLine />
    },
    {
      name: "Business Health",
      description: "Monitor business health",
      path: "/business-health",
      icon: <FaCheckCircle />
    },
    {
      name: "AI Assistant",
      description: "Business AI assistant",
      path: "/ai-assistant",
      icon: <FaRobot />
    },
    {
      name: "Documents",
      description: "Manage business documents",
      path: "/documents",
      icon: <FaFileAlt />
    },
    {
      name: "My Business",
      description: "Manage your business",
      path: "/my-business",
      icon: <FaBuilding />
    },
    {
      name: "Billing",
      description: "Manage subscription and billing",
      path: "/billing",
      icon: <FaMoneyBillWave />
    },
    {
      name: "Notifications",
      description: "View business notifications",
      path: "/notifications",
      icon: <FaCheckCircle />
    },
    {
      name: "Profile",
      description: "Manage your profile",
      path: "/profile",
      icon: <FaUsers />
    },
    {
      name: "Settings",
      description: "Business settings",
      path: "/settings",
      icon: <FaCog />
    }
  ];

  // =====================================================
  // SEARCH RESULTS
  // =====================================================

  const searchResults = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return searchablePages.slice(0, 8);
    }

    return searchablePages.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
    );
  }, [searchTerm]);

  // =====================================================
  // FORMAT MONEY
  // =====================================================

  const money = (value) => {
    const parsed = Number(value);

    if (!Number.isFinite(parsed)) {
      return "0.00";
    }

    return parsed.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // =====================================================
  // FORMAT NUMBER
  // =====================================================

  const number = (value) => {
    const parsed = Number(value);

    if (!Number.isFinite(parsed)) {
      return "0";
    }

    return parsed.toLocaleString();
  };

  // =====================================================
  // LOAD DASHBOARD
  // =====================================================

  const loadDashboard = async () => {
    try {
      setError("");

      const results = await Promise.allSettled([
        api.get("/dashboard/summary"),

        api.get(
          "/dashboard/sales-analytics?period=7"
        ),

        api.get(
          "/dashboard/best-selling-products?limit=5"
        ),

        api.get("/dashboard/health"),

        api.get(
          "/dashboard/forecast?days=30"
        ),

        api.get("/dashboard/reports"),

        api.get("/dashboard/ai-insights")
      ]);

      const [
        summaryResult,
        salesResult,
        productsResult,
        healthResult,
        forecastResult,
        reportsResult,
        aiResult
      ] = results;

      // =================================================
      // SUMMARY
      // =================================================

      if (summaryResult.status === "fulfilled") {
        setSummary(
          summaryResult.value?.data || {}
        );
      } else {
        console.error(
          "Dashboard summary error:",
          summaryResult.reason
        );

        setSummary({});
      }

      // =================================================
      // SALES ANALYTICS
      // =================================================

      if (salesResult.status === "fulfilled") {
        setSalesAnalytics(
          salesResult.value?.data || {}
        );
      } else {
        console.error(
          "Sales analytics error:",
          salesResult.reason
        );

        setSalesAnalytics({});
      }

      // =================================================
      // BEST SELLING
      // =================================================

      if (productsResult.status === "fulfilled") {
        setBestSelling(
          productsResult.value?.data || {}
        );
      } else {
        console.error(
          "Best-selling products error:",
          productsResult.reason
        );

        setBestSelling({});
      }

      // =================================================
      // HEALTH
      // =================================================

      if (healthResult.status === "fulfilled") {
        setHealth(
          healthResult.value?.data || {}
        );
      } else {
        console.error(
          "Business health error:",
          healthResult.reason
        );

        setHealth({});
      }

      // =================================================
      // FORECAST
      // =================================================

      if (forecastResult.status === "fulfilled") {
        setForecast(
          forecastResult.value?.data || {}
        );
      } else {
        console.error(
          "Forecast error:",
          forecastResult.reason
        );

        setForecast({});
      }

      // =================================================
      // REPORTS
      // =================================================

      if (reportsResult.status === "fulfilled") {
        setReports(
          reportsResult.value?.data || {}
        );
      } else {
        console.error(
          "Reports error:",
          reportsResult.reason
        );

        setReports({});
      }

      // =================================================
      // AI INSIGHTS
      // =================================================

      if (aiResult.status === "fulfilled") {
        setAiInsights(
          aiResult.value?.data || {}
        );
      } else {
        console.error(
          "AI insights error:",
          aiResult.reason
        );

        setAiInsights({});
      }

      // =================================================
      // MAIN ERROR
      // =================================================

      if (summaryResult.status === "rejected") {
        setError(
          summaryResult.reason?.response?.data?.message ||
            "Unable to load the dashboard."
        );
      }
    } catch (err) {
      console.error(
        "DASHBOARD ERROR:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Unable to load dashboard data."
      );
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    const initializeDashboard = async () => {
      setLoading(true);

      await loadDashboard();

      setLoading(false);
    };

    initializeDashboard();

    // loadDashboard is intentionally called once
    // when the dashboard component mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // =====================================================
  // REFRESH
  // =====================================================

  const handleRefresh = async () => {
    try {
      setRefreshing(true);

      await loadDashboard();
    } finally {
      setRefreshing(false);
    }
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // =====================================================
  // SEARCH
  // =====================================================

  const openSearchResult = (path) => {
    setSearchTerm("");
    setSearchOpen(false);

    navigate(path);
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === "Escape") {
      setSearchTerm("");
      setSearchOpen(false);
    }

    if (
      event.key === "Enter" &&
      searchResults.length > 0
    ) {
      openSearchResult(
        searchResults[0].path
      );
    }
  };

  // =====================================================
  // QUICK ACTIONS
  // =====================================================

  const quickActions = [
    {
      title: "New Sale",
      description: "Create a new order",
      icon: <FaShoppingCart />,
      path: "/orders"
    },
    {
      title: "Add Product",
      description: "Add a product",
      icon: <FaBoxOpen />,
      path: "/products"
    },
    {
      title: "Add Customer",
      description: "Create customer",
      icon: <FaUsers />,
      path: "/customers"
    },
    {
      title: "Create Invoice",
      description: "Generate invoice",
      icon: <FaFileInvoice />,
      path: "/invoices"
    },
    {
      title: "Add Expense",
      description: "Record expense",
      icon: <FaMoneyBillWave />,
      path: "/expenses"
    },
    {
      title: "Add Supplier",
      description: "Add supplier",
      icon: <FaTruck />,
      path: "/suppliers"
    }
  ];

  // =====================================================
  // DERIVED DATA
  // =====================================================

  const totalRevenue =
    summary?.totalRevenue ??
    reports?.overview?.revenue ??
    0;

  const totalExpenses =
    summary?.totalExpenses ??
    reports?.overview?.expenses ??
    0;

  const totalProfit =
    summary?.profit ??
    reports?.overview?.profit ??
    0;

  const profitMargin =
    Number(totalRevenue) > 0
      ? (Number(totalProfit) / Number(totalRevenue)) * 100
      : 0;

  const salesData = Array.isArray(
    salesAnalytics?.analytics
  )
    ? salesAnalytics.analytics
    : [];

  const topProducts = Array.isArray(
    bestSelling?.products
  )
    ? bestSelling.products
    : [];

  const lowStockProducts = Array.isArray(
    summary?.lowStockProducts
  )
    ? summary.lowStockProducts
    : [];

  const aiInsightList = Array.isArray(
    aiInsights?.insights
  )
    ? aiInsights.insights
    : [];

  const forecastAmount =
    forecast?.projectedRevenue ?? 0;

  // =====================================================
  // LOADING SCREEN
  // =====================================================

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-loading">
          <div className="dashboard-loading-spinner">
            <FaSyncAlt />
          </div>

          <h2>
            Loading BusyBiz...
          </h2>

          <p>
            Preparing your business dashboard.
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // MAIN
  // =====================================================

  return (
    <div className="dashboard-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="dashboard-header">

        <div className="dashboard-header-left">
          <div>
            <h1 className="dashboard-title">
              Dashboard
            </h1>

            <p className="dashboard-subtitle">
              Here's what's happening with your business today.
            </p>
          </div>
        </div>

        <div className="dashboard-header-right">

          {/* SEARCH */}

          <div className="dashboard-search-wrapper">

            <button
              type="button"
              className="dashboard-search-button"
              onClick={() => {
                setSearchOpen(
                  (current) => !current
                );

                if (searchOpen) {
                  setSearchTerm("");
                }
              }}
              title="Search BusyBiz"
              aria-label="Search BusyBiz"
            >
              <FaSearch />
            </button>

            {searchOpen && (
              <div className="dashboard-search-box">

                <div className="dashboard-search-input-wrapper">

                  <FaSearch />

                  <input
                    autoFocus
                    type="text"
                    placeholder="Search BusyBiz..."
                    value={searchTerm}
                    onChange={(event) =>
                      setSearchTerm(
                        event.target.value
                      )
                    }
                    onKeyDown={
                      handleSearchKeyDown
                    }
                  />

                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() =>
                        setSearchTerm("")
                      }
                      aria-label="Clear search"
                    >
                      <FaTimes />
                    </button>
                  )}

                </div>

                <div className="dashboard-search-results">

                  {searchResults.length === 0 ? (
                    <div className="dashboard-search-empty">

                      <FaSearch />

                      <p>
                        No results found
                      </p>

                      <small>
                        Try products, invoices,
                        customers, reports or settings.
                      </small>

                    </div>
                  ) : (
                    searchResults.map((item) => (
                      <button
                        type="button"
                        key={item.path}
                        className="dashboard-search-result"
                        onClick={() =>
                          openSearchResult(
                            item.path
                          )
                        }
                      >

                        <span className="dashboard-search-result-icon">
                          {item.icon}
                        </span>

                        <span>
                          <strong>
                            {item.name}
                          </strong>

                          <small>
                            {item.description}
                          </small>
                        </span>

                        <FaArrowRight />

                      </button>
                    ))
                  )}

                </div>

              </div>
            )}

          </div>

          {/* NOTIFICATIONS */}

          <div className="dashboard-notification-wrapper">
            <NotificationBell />
          </div>

          {/* OWNER */}

          <div className="dashboard-owner">

            <div className="dashboard-owner-avatar">

              {profilePicture ? (
                <img
                  src={profilePicture}
                  alt={ownerName}
                  onError={(event) => {
                    event.currentTarget.style.display =
                      "none";
                  }}
                />
              ) : (
                <span>
                  {ownerInitial}
                </span>
              )}

            </div>

            <div className="dashboard-owner-info">

              <strong>
                {ownerName}
              </strong>

              <span>
                Business Owner
              </span>

            </div>

            <ProfileMenu />

          </div>

        </div>

      </header>

      {/* =================================================
          WELCOME
      ================================================= */}

      <section className="dashboard-welcome">

        <div className="dashboard-welcome-content">

          <span className="dashboard-welcome-label">
            BUSINESS OVERVIEW
          </span>

          <h2 className="dashboard-welcome-title">
            Welcome back, {ownerFirstName}.
          </h2>

          <p className="dashboard-welcome-text">
            Keep track of your sales, customers,
            inventory and financial performance
            from one place.
          </p>

        </div>

        <button
          type="button"
          className="dashboard-refresh-button"
          onClick={handleRefresh}
          disabled={refreshing}
        >

          <FaSyncAlt
            className={
              refreshing
                ? "dashboard-spin"
                : ""
            }
          />

          {refreshing
            ? "Refreshing..."
            : "Refresh"}

        </button>

      </section>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="dashboard-error">

          <div>
            <FaExclamationTriangle />

            <span>
              {error}
            </span>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
          >
            Try Again
          </button>

        </div>
      )}

      {/* =================================================
          FINANCIAL OVERVIEW
      ================================================= */}

      <section className="dashboard-section">

        <div className="dashboard-section-header">

          <div>

            <span className="dashboard-section-label">
              PERFORMANCE
            </span>

            <h2>
              Financial Overview
            </h2>

          </div>

        </div>

        <div className="dashboard-kpi-grid">

          {/* TODAY */}

          <div className="dashboard-kpi-card">

            <div className="dashboard-kpi-top">

              <span className="dashboard-kpi-icon sales">
                <FaShoppingCart />
              </span>

              <span className="dashboard-kpi-status positive">
                Today
              </span>

            </div>

            <p className="dashboard-kpi-label">
              Today's Sales
            </p>

            <h3 className="dashboard-kpi-value">
              ${money(summary?.todaySales)}
            </h3>

            <div className="dashboard-kpi-footer">
              Sales recorded today
            </div>

          </div>

          {/* REVENUE */}

          <div className="dashboard-kpi-card">

            <div className="dashboard-kpi-top">

              <span className="dashboard-kpi-icon revenue">
                <FaMoneyBillWave />
              </span>

              <span className="dashboard-kpi-status positive">
                Revenue
              </span>

            </div>

            <p className="dashboard-kpi-label">
              Total Revenue
            </p>

            <h3 className="dashboard-kpi-value">
              ${money(totalRevenue)}
            </h3>

            <div className="dashboard-kpi-footer">
              Overall business revenue
            </div>

          </div>

          {/* EXPENSES */}

          <div className="dashboard-kpi-card">

            <div className="dashboard-kpi-top">

              <span className="dashboard-kpi-icon expense">
                <FaMoneyBillWave />
              </span>

              <span className="dashboard-kpi-status warning">
                Expenses
              </span>

            </div>

            <p className="dashboard-kpi-label">
              Total Expenses
            </p>

            <h3 className="dashboard-kpi-value">
              ${money(totalExpenses)}
            </h3>

            <div className="dashboard-kpi-footer">
              Business expenses recorded
            </div>

          </div>

          {/* PROFIT */}

          <div className="dashboard-kpi-card dashboard-kpi-card-profit">

            <div className="dashboard-kpi-top">

              <span className="dashboard-kpi-icon profit">
                <FaChartLine />
              </span>

              <span className="dashboard-kpi-status positive">
                Profit
              </span>

            </div>

            <p className="dashboard-kpi-label">
              Net Profit
            </p>

            <h3 className="dashboard-kpi-value">
              ${money(totalProfit)}
            </h3>

            <div className="dashboard-kpi-footer">
              {money(profitMargin)}% profit margin
            </div>

          </div>

        </div>

      </section>

      {/* =================================================
          QUICK ACTIONS
      ================================================= */}

      <section className="dashboard-section">

        <div className="dashboard-section-header">

          <div>

            <span className="dashboard-section-label">
              SHORTCUTS
            </span>

            <h2>
              Quick Actions
            </h2>

          </div>

          <span className="dashboard-section-description">
            Get things done faster
          </span>

        </div>

        <div className="dashboard-quick-actions">

          {quickActions.map((action) => (
            <button
              type="button"
              key={action.title}
              className="dashboard-quick-action"
              onClick={() =>
                navigate(action.path)
              }
            >

              <span className="dashboard-quick-action-icon">
                {action.icon}
              </span>

              <span className="dashboard-quick-action-content">

                <strong>
                  {action.title}
                </strong>

                <small>
                  {action.description}
                </small>

              </span>

              <FaArrowRight className="dashboard-quick-arrow" />

            </button>
          ))}

        </div>

      </section>

      {/* =================================================
          BUSINESS STATISTICS
      ================================================= */}

      <section className="dashboard-section">

        <div className="dashboard-section-header">

          <div>

            <span className="dashboard-section-label">
              BUSINESS
            </span>

            <h2>
              Business Statistics
            </h2>

          </div>

        </div>

        <div className="dashboard-stat-grid">

          {/* PRODUCTS */}

          <div className="dashboard-stat-card">

            <div className="dashboard-stat-icon">
              <FaBoxOpen />
            </div>

            <div className="dashboard-stat-content">

              <span>
                Products
              </span>

              <strong>
                {number(summary?.productCount)}
              </strong>

            </div>

            <button
              type="button"
              onClick={() =>
                navigate("/products")
              }
            >
              View
            </button>

          </div>

          {/* CUSTOMERS */}

          <div className="dashboard-stat-card">

            <div className="dashboard-stat-icon">
              <FaUsers />
            </div>

            <div className="dashboard-stat-content">

              <span>
                Customers
              </span>

              <strong>
                {number(summary?.customerCount)}
              </strong>

            </div>

            <button
              type="button"
              onClick={() =>
                navigate("/customers")
              }
            >
              View
            </button>

          </div>

          {/* ORDERS */}

          <div className="dashboard-stat-card">

            <div className="dashboard-stat-icon">
              <FaShoppingCart />
            </div>

            <div className="dashboard-stat-content">

              <span>
                Orders
              </span>

              <strong>
                {number(summary?.orderCount)}
              </strong>

            </div>

            <button
              type="button"
              onClick={() =>
                navigate("/orders")
              }
            >
              View
            </button>

          </div>

          {/* LOW STOCK */}

          <div className="dashboard-stat-card">

            <div className="dashboard-stat-icon warning">
              <FaWarehouse />
            </div>

            <div className="dashboard-stat-content">

              <span>
                Low Stock
              </span>

              <strong>
                {number(summary?.lowStockCount)}
              </strong>

            </div>

            <button
              type="button"
              onClick={() =>
                navigate("/inventory")
              }
            >
              Check
            </button>

          </div>

        </div>

      </section>

      {/* =================================================
          HEALTH + SALES
      ================================================= */}

      <section className="dashboard-two-column">

        {/* HEALTH */}

        <div className="dashboard-panel">

          <div className="dashboard-panel-header">

            <div>

              <span className="dashboard-section-label">
                HEALTH
              </span>

              <h2>
                Business Health
              </h2>

            </div>

            <FaChartLine />

          </div>

          <div className="dashboard-health-content">

            <div className="dashboard-health-score">

              <div className="dashboard-health-circle">

                <strong>
                  {number(health?.score)}
                </strong>

                <span>
                  /100
                </span>

              </div>

            </div>

            <div className="dashboard-health-info">

              <span className="dashboard-health-label">
                CURRENT STATUS
              </span>

              <h3>
                {String(
                  health?.status ||
                    "Needs Attention"
                ).toUpperCase()}
              </h3>

              <p>
                Your overall business health based
                on revenue, profit, orders, customers
                and inventory.
              </p>

            </div>

          </div>

          <div className="dashboard-billing-list">

            <div className="dashboard-billing-item">

              <span>
                <FaMoneyBillWave />
                Revenue
              </span>

              <strong>
                ${money(health?.revenue)}
              </strong>

            </div>

            <div className="dashboard-billing-item">

              <span>
                <FaMoneyBillWave />
                Expenses
              </span>

              <strong>
                ${money(health?.expenses)}
              </strong>

            </div>

            <div className="dashboard-billing-item">

              <span>
                <FaChartLine />
                Profit
              </span>

              <strong>
                ${money(health?.profit)}
              </strong>

            </div>

            <div className="dashboard-billing-item">

              <span>
                <FaExclamationTriangle />
                Low Stock
              </span>

              <strong>
                {number(health?.lowStock)}
              </strong>

            </div>

          </div>

        </div>

        {/* SALES */}

        <div className="dashboard-panel">

          <div className="dashboard-panel-header">

            <div>

              <span className="dashboard-section-label">
                SALES
              </span>

              <h2>
                Sales Performance
              </h2>

            </div>

            <FaChartBar />

          </div>

          <div className="dashboard-billing-list">

            {salesData.length === 0 ? (
              <div className="dashboard-empty">

                <FaChartLine />

                <p>
                  No sales analytics available yet.
                </p>

              </div>
            ) : (
              salesData.map((day, index) => (
                <div
                  className="dashboard-billing-item"
                  key={
                    day?.date ||
                    day?.label ||
                    `sales-${index}`
                  }
                >

                  <span>
                    <FaChartLine />
                    {day?.label || day?.date || "Sales"}
                  </span>

                  <strong>
                    ${money(day?.sales)}
                  </strong>

                </div>
              ))
            )}

          </div>

          <button
            type="button"
            className="dashboard-panel-button"
            onClick={() =>
              navigate("/analytics")
            }
          >

            View Analytics

            <FaArrowRight />

          </button>

        </div>

      </section>

      {/* =================================================
          SALES FORECAST
      ================================================= */}

      <section className="dashboard-section">

        <div className="dashboard-section-header">

          <div>

            <span className="dashboard-section-label">
              FORECAST
            </span>

            <h2>
              Sales Forecast
            </h2>

          </div>

          <button
            type="button"
            className="dashboard-link-button"
            onClick={() =>
              navigate("/forecast")
            }
          >

            View Forecast

            <FaArrowRight />

          </button>

        </div>

        <div className="dashboard-kpi-grid">

          <div className="dashboard-kpi-card">

            <div className="dashboard-kpi-top">

              <span className="dashboard-kpi-icon revenue">
                <FaChartLine />
              </span>

              <span className="dashboard-kpi-status positive">
                {forecast?.trend || "stable"}
              </span>

            </div>

            <p className="dashboard-kpi-label">
              Projected Revenue
            </p>

            <h3 className="dashboard-kpi-value">
              ${money(forecastAmount)}
            </h3>

            <div className="dashboard-kpi-footer">
              Next {number(forecast?.days || 30)} days
            </div>

          </div>

          <div className="dashboard-kpi-card">

            <div className="dashboard-kpi-top">

              <span className="dashboard-kpi-icon sales">
                <FaMoneyBillWave />
              </span>

              <span className="dashboard-kpi-status positive">
                Average
              </span>

            </div>

            <p className="dashboard-kpi-label">
              Average Daily Sales
            </p>

            <h3 className="dashboard-kpi-value">
              ${money(forecast?.averageDailySales)}
            </h3>

            <div className="dashboard-kpi-footer">
              Based on recent sales
            </div>

          </div>

          <div className="dashboard-kpi-card">

            <div className="dashboard-kpi-top">

              <span className="dashboard-kpi-icon profit">
                <FaChartLine />
              </span>

              <span className="dashboard-kpi-status positive">
                Trend
              </span>

            </div>

            <p className="dashboard-kpi-label">
              Sales Direction
            </p>

            <h3 className="dashboard-kpi-value">
              {String(
                forecast?.trend ||
                  "stable"
              ).toUpperCase()}
            </h3>

            <div className="dashboard-kpi-footer">
              Based on the last 30 days
            </div>

          </div>

        </div>

      </section>

      {/* =================================================
          TOP PRODUCTS
      ================================================= */}

      <section className="dashboard-section">

        <div className="dashboard-section-header">

          <div>

            <span className="dashboard-section-label">
              PRODUCTS
            </span>

            <h2>
              Best-Selling Products
            </h2>

          </div>

          <button
            type="button"
            className="dashboard-link-button"
            onClick={() =>
              navigate("/products")
            }
          >

            View Products

            <FaArrowRight />

          </button>

        </div>

        {topProducts.length === 0 ? (
          <div className="dashboard-empty">

            <FaBoxOpen />

            <h3>
              No product sales yet
            </h3>

            <p>
              Your best-selling products will appear here
              once orders are recorded.
            </p>

          </div>
        ) : (
          <div className="dashboard-low-stock-list">

            {topProducts.map((product, index) => (
              <div
                className="dashboard-low-stock-item"
                key={
                  product?.productId ||
                  product?.id ||
                  product?.rank ||
                  `top-product-${index}`
                }
              >

                <div className="dashboard-low-stock-product">

                  <span className="dashboard-low-stock-icon">
                    <FaTrophy />
                  </span>

                  <div>

                    <strong>
                      #{product?.rank || index + 1}{" "}
                      {product?.name || "Unnamed Product"}
                    </strong>

                    <span>
                      {number(product?.quantitySold)}
                      {" "}units sold
                    </span>

                  </div>

                </div>

                <span className="dashboard-stock-count">

                  ${money(product?.revenue)}

                  <small>
                    revenue
                  </small>

                </span>

              </div>
            ))}

          </div>
        )}

      </section>

      {/* =================================================
          LOW STOCK
      ================================================= */}

      <section className="dashboard-section">

        <div className="dashboard-section-header">

          <div>

            <span className="dashboard-section-label">
              INVENTORY
            </span>

            <h2>
              Low Stock Products
            </h2>

          </div>

          <button
            type="button"
            className="dashboard-link-button"
            onClick={() =>
              navigate("/inventory")
            }
          >

            View Inventory

            <FaArrowRight />

          </button>

        </div>

        {lowStockProducts.length === 0 ? (
          <div className="dashboard-empty">

            <FaCheckCircle />

            <h3>
              Inventory looks good
            </h3>

            <p>
              No products are currently low on stock.
            </p>

          </div>
        ) : (
          <div className="dashboard-low-stock-list">

            {lowStockProducts.map(
              (product, index) => (
                <div
                  className="dashboard-low-stock-item"
                  key={
                    product?.id ||
                    product?._id ||
                    `${product?.name || "product"}-${index}`
                  }
                >

                  <div className="dashboard-low-stock-product">

                    <span className="dashboard-low-stock-icon">
                      <FaExclamationTriangle />
                    </span>

                    <div>

                      <strong>
                        {product?.name ||
                          "Unnamed Product"}
                      </strong>

                      <span>
                        Low-stock limit:
                        {" "}
                        {number(
                          product?.lowStockLimit
                        )}
                      </span>

                    </div>

                  </div>

                  <span className="dashboard-stock-count">

                    {number(product?.stock)}

                    <small>
                      units
                    </small>

                  </span>

                </div>
              )
            )}

          </div>
        )}

      </section>

      {/* =================================================
          AI BUSINESS INSIGHTS
      ================================================= */}

      <section className="dashboard-section">

        <div className="dashboard-section-header">

          <div>

            <span className="dashboard-section-label">
              INTELLIGENCE
            </span>

            <h2>
              Business Insights
            </h2>

          </div>

          <button
            type="button"
            className="dashboard-link-button"
            onClick={() =>
              navigate("/ai-assistant")
            }
          >

            AI Assistant

            <FaArrowRight />

          </button>

        </div>

        {aiInsightList.length === 0 ? (
          <div className="dashboard-empty">

            <FaRobot />

            <h3>
              No insights available
            </h3>

            <p>
              BusyBiz will generate business insights
              as more data becomes available.
            </p>

          </div>
        ) : (
          <div className="dashboard-management-grid">

            {aiInsightList.map(
              (insight, index) => (
                <div
                  className="dashboard-management-button"
                  key={
                    `${insight?.title || "insight"}-${index}`
                  }
                >

                  <span>

                    {insight?.type === "warning" ? (
                      <FaExclamationTriangle />
                    ) : insight?.type === "positive" ? (
                      <FaCheckCircle />
                    ) : insight?.type === "action" ? (
                      <FaArrowRight />
                    ) : (
                      <FaRobot />
                    )}

                  </span>

                  <div>

                    <strong>
                      {insight?.title ||
                        "Business Insight"}
                    </strong>

                    <small>
                      {insight?.message ||
                        "No additional information available."}
                    </small>

                  </div>

                </div>
              )
            )}

          </div>
        )}

      </section>

      {/* =================================================
          REPORT OVERVIEW
      ================================================= */}

      <section className="dashboard-two-column">

        {/* REPORT */}

        <div className="dashboard-panel">

          <div className="dashboard-panel-header">

            <div>

              <span className="dashboard-section-label">
                REPORTING
              </span>

              <h2>
                Business Report
              </h2>

            </div>

            <FaChartPie />

          </div>

          <div className="dashboard-billing-list">

            <div className="dashboard-billing-item">

              <span>
                <FaMoneyBillWave />
                Revenue
              </span>

              <strong>
                ${money(reports?.overview?.revenue)}
              </strong>

            </div>

            <div className="dashboard-billing-item">

              <span>
                <FaMoneyBillWave />
                Expenses
              </span>

              <strong>
                ${money(reports?.overview?.expenses)}
              </strong>

            </div>

            <div className="dashboard-billing-item">

              <span>
                <FaChartLine />
                Profit
              </span>

              <strong>
                ${money(reports?.overview?.profit)}
              </strong>

            </div>

            <div className="dashboard-billing-item">

              <span>
                <FaShoppingCart />
                Orders
              </span>

              <strong>
                {number(reports?.overview?.orders)}
              </strong>

            </div>

            <div className="dashboard-billing-item">

              <span>
                <FaReceipt />
                Average Order
              </span>

              <strong>
                ${money(
                  reports?.overview?.averageOrderValue
                )}
              </strong>

            </div>

          </div>

          <button
            type="button"
            className="dashboard-panel-button"
            onClick={() =>
              navigate("/advancedreports")
            }
          >

            Advanced Reports

            <FaArrowRight />

          </button>

        </div>

        {/* PAYMENT METHODS */}

        <div className="dashboard-panel">

          <div className="dashboard-panel-header">

            <div>

              <span className="dashboard-section-label">
                PAYMENTS
              </span>

              <h2>
                Payment Methods
              </h2>

            </div>

            <FaReceipt />

          </div>

          <div className="dashboard-billing-list">

            {Object.entries(
              reports?.paymentMethods || {}
            ).length === 0 ? (
              <div className="dashboard-empty">

                <FaReceipt />

                <p>
                  No payment data available.
                </p>

              </div>
            ) : (
              Object.entries(
                reports?.paymentMethods || {}
              ).map(([method, data]) => (
                <div
                  className="dashboard-billing-item"
                  key={method}
                >

                  <span>

                    <FaMoneyBillWave />

                    {String(method)
                      .charAt(0)
                      .toUpperCase() +
                      String(method).slice(1)}

                  </span>

                  <strong>
                    ${money(data?.revenue)}
                  </strong>

                </div>
              ))
            )}

          </div>

        </div>

      </section>

      {/* =================================================
          MANAGEMENT
      ================================================= */}

      <section className="dashboard-section">

        <div className="dashboard-section-header">

          <div>

            <span className="dashboard-section-label">
              MANAGEMENT
            </span>

            <h2>
              Business Management
            </h2>

          </div>

        </div>

        <div className="dashboard-management-grid">

          {searchablePages
            .filter((item) =>
              [
                "Suppliers",
                "Expenses",
                "Accounting",
                "Finance",
                "Reports",
                "Advanced Reports",
                "Analytics",
                "Quotes",
                "Forecast",
                "Business Health",
                "AI Assistant",
                "Documents",
                "My Business",
                "Billing",
                "Notifications",
                "Settings"
              ].includes(item.name)
            )
            .map((item) => (
              <button
                type="button"
                key={item.path}
                className="dashboard-management-button"
                onClick={() =>
                  navigate(item.path)
                }
              >

                <span>
                  {item.icon}
                </span>

                <div>

                  <strong>
                    {item.name}
                  </strong>

                  <small>
                    {item.description}
                  </small>

                </div>

                <FaArrowRight />

              </button>
            ))}

        </div>

      </section>

      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="dashboard-footer">

        <div>

          <strong>
            BusyBiz
          </strong>

          <span>
            Manage • Analyze • Grow
          </span>

        </div>

        <button
          type="button"
          className="dashboard-logout-button"
          onClick={handleLogout}
        >
          Logout
        </button>

      </footer>

    </div>
  );
}

export default Dashboard;