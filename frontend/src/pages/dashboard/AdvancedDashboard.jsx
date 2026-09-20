import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";
import "./AdvancedDashboard.css";

function AdvancedDashboard() {
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState(null);
  const [insights, setInsights] = useState(null);
  const [accounting, setAccounting] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAdvancedDashboard();
  }, []);

  const loadAdvancedDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        analyticsResponse,
        insightsResponse,
        accountingResponse
      ] = await Promise.all([
        api.get("/analytics/summary"),
        api.get("/business-insights"),
        api.get("/accounting/summary")
      ]);

      setAnalytics(analyticsResponse.data);
      setInsights(insightsResponse.data);
      setAccounting(accountingResponse.data);

    } catch (error) {
      console.error(
        "ADVANCED DASHBOARD ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load advanced dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="advanced-dashboard-page">
        <div className="advanced-dashboard-loading">
          Loading advanced dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="advanced-dashboard-page">

      {/* HEADER */}
      <div className="advanced-dashboard-header">

        <div>
          <h1 className="advanced-dashboard-title">
            Advanced Dashboard
          </h1>

          <p className="advanced-dashboard-subtitle">
            Complete overview of your business performance.
          </p>
        </div>

        <button
          className="advanced-dashboard-refresh-btn"
          onClick={loadAdvancedDashboard}
        >
          Refresh
        </button>

      </div>


      {/* ERROR */}
      {error && (
        <div className="advanced-dashboard-error">
          <p>{error}</p>

          <button onClick={loadAdvancedDashboard}>
            Try Again
          </button>
        </div>
      )}


      {/* KPI CARDS */}
      {analytics && (
        <div className="advanced-dashboard-kpi-grid">

          <div className="advanced-dashboard-kpi-card">
            <span className="advanced-dashboard-kpi-label">
              Total Sales
            </span>

            <strong className="advanced-dashboard-kpi-value">
              $
              {Number(
                analytics.sales?.total || 0
              ).toFixed(2)}
            </strong>

            <span className="advanced-dashboard-kpi-description">
              Paid orders
            </span>
          </div>


          <div className="advanced-dashboard-kpi-card">
            <span className="advanced-dashboard-kpi-label">
              Revenue
            </span>

            <strong className="advanced-dashboard-kpi-value">
              $
              {Number(
                accounting?.revenue?.total || 0
              ).toFixed(2)}
            </strong>

            <span className="advanced-dashboard-kpi-description">
              Orders + invoices
            </span>
          </div>


          <div className="advanced-dashboard-kpi-card">
            <span className="advanced-dashboard-kpi-label">
              Expenses
            </span>

            <strong className="advanced-dashboard-kpi-value">
              $
              {Number(
                accounting?.expenses?.total || 0
              ).toFixed(2)}
            </strong>

            <span className="advanced-dashboard-kpi-description">
              Total business expenses
            </span>
          </div>


          <div className="advanced-dashboard-kpi-card">
            <span className="advanced-dashboard-kpi-label">
              Net Profit
            </span>

            <strong className="advanced-dashboard-kpi-value">
              $
              {Number(
                accounting?.profit?.net || 0
              ).toFixed(2)}
            </strong>

            <span className="advanced-dashboard-kpi-description">
              {Number(
                accounting?.profit?.margin || 0
              ).toFixed(2)}
              % margin
            </span>
          </div>

        </div>
      )}


      {/* BUSINESS HEALTH */}
      {insights && (
        <div className="advanced-dashboard-section">

          <div className="advanced-dashboard-section-header">
            <div>
              <h2>Business Health</h2>

              <p>
                Automated analysis of your business.
              </p>
            </div>

            <button
              onClick={() =>
                navigate("/business-health")
              }
            >
              View Details
            </button>
          </div>


          <div className="advanced-dashboard-health-card">

            <div className="advanced-dashboard-health-score">
              <strong>
                {insights.health?.score || 0}
              </strong>

              <span>/100</span>
            </div>


            <div className="advanced-dashboard-health-info">

              <h3>
                {String(
                  insights.health?.status ||
                    "unknown"
                ).toUpperCase()}
              </h3>

              <p>
                Current business health status
              </p>

            </div>

          </div>

        </div>
      )}


      {/* BUSINESS STATISTICS */}
      {analytics && (
        <div className="advanced-dashboard-section">

          <div className="advanced-dashboard-section-header">
            <div>
              <h2>Business Statistics</h2>

              <p>
                Current business activity.
              </p>
            </div>
          </div>


          <div className="advanced-dashboard-stat-grid">

            <div className="advanced-dashboard-stat-card">
              <span>Products</span>
              <strong>
                {analytics.business?.products || 0}
              </strong>
            </div>

            <div className="advanced-dashboard-stat-card">
              <span>Customers</span>
              <strong>
                {analytics.business?.customers || 0}
              </strong>
            </div>

            <div className="advanced-dashboard-stat-card">
              <span>Orders</span>
              <strong>
                {analytics.business?.orders || 0}
              </strong>
            </div>

            <div className="advanced-dashboard-stat-card">
              <span>Inventory Value</span>
              <strong>
                $
                {Number(
                  analytics.inventory?.value || 0
                ).toFixed(2)}
              </strong>
            </div>

            <div className="advanced-dashboard-stat-card">
              <span>Low Stock</span>
              <strong>
                {analytics.inventory?.lowStock || 0}
              </strong>
            </div>

            <div className="advanced-dashboard-stat-card">
              <span>Out of Stock</span>
              <strong>
                {analytics.inventory?.outOfStock || 0}
              </strong>
            </div>

          </div>

        </div>
      )}


      {/* FINANCIAL ALERTS */}
      {insights && (
        <div className="advanced-dashboard-section">

          <div className="advanced-dashboard-section-header">
            <div>
              <h2>Business Alerts</h2>

              <p>
                Issues that may need your attention.
              </p>
            </div>
          </div>


          <div className="advanced-dashboard-alert-list">

            {insights.warnings?.length === 0 ? (
              <div className="advanced-dashboard-no-alerts">
                No major issues detected.
              </div>
            ) : (
              insights.warnings?.map(
                (warning, index) => (
                  <div
                    className="advanced-dashboard-alert"
                    key={index}
                  >
                    {warning}
                  </div>
                )
              )
            )}

          </div>

        </div>
      )}


      {/* RECOMMENDATIONS */}
      {insights && (
        <div className="advanced-dashboard-section">

          <div className="advanced-dashboard-section-header">
            <div>
              <h2>Recommendations</h2>

              <p>
                Suggested actions based on your business data.
              </p>
            </div>
          </div>


          <div className="advanced-dashboard-recommendation-list">

            {insights.recommendations?.map(
              (recommendation, index) => (
                <div
                  className="advanced-dashboard-recommendation"
                  key={index}
                >
                  <strong>
                    {index + 1}.
                  </strong>

                  <span>
                    {recommendation}
                  </span>
                </div>
              )
            )}

          </div>

        </div>
      )}


      {/* QUICK ACTIONS */}
      <div className="advanced-dashboard-section">

        <div className="advanced-dashboard-section-header">
          <div>
            <h2>Quick Actions</h2>

            <p>
              Manage your business.
            </p>
          </div>
        </div>


        <div className="advanced-dashboard-actions">

          <button
            onClick={() => navigate("/products")}
          >
            Products
          </button>

          <button
            onClick={() => navigate("/orders")}
          >
            Orders
          </button>

          <button
            onClick={() => navigate("/customers")}
          >
            Customers
          </button>

          <button
            onClick={() => navigate("/inventory")}
          >
            Inventory
          </button>

          <button
            onClick={() => navigate("/invoices")}
          >
            Invoices
          </button>

          <button
            onClick={() => navigate("/expenses")}
          >
            Expenses
          </button>

          <button
            onClick={() => navigate("/reports")}
          >
            Reports
          </button>

        </div>

      </div>

    </div>
  );
}

export default AdvancedDashboard;