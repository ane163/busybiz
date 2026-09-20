import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";
import "./BusinessHealth.css";

function BusinessHealth() {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadBusinessHealth();
  }, []);

  const loadBusinessHealth = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/business-insights"
      );

      setData(response.data);
    } catch (error) {
      console.error(
        "BUSINESS HEALTH ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load business health."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="business-health-page">
        <div className="business-health-loading">
          Loading business health...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="business-health-page">
        <div className="business-health-error">
          <h2>Unable to load Business Health</h2>

          <p>{error}</p>

          <button onClick={loadBusinessHealth}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const health = data?.health || {};
  const financial = data?.financial || {};
  const sales = data?.sales || {};
  const customers = data?.customers || {};
  const inventory = data?.inventory || {};
  const invoices = data?.invoices || {};

  return (
    <div className="business-health-page">

      {/* HEADER */}
      <div className="business-health-header">

        <div>
          <h1 className="business-health-title">
            Business Health
          </h1>

          <p className="business-health-subtitle">
            Understand how your business is performing
            and where improvements are needed.
          </p>
        </div>

        <button
          className="business-health-refresh-btn"
          onClick={loadBusinessHealth}
        >
          Refresh
        </button>

      </div>


      {/* SCORE */}
      <section className="business-health-score-section">

        <div className="business-health-score-card">

          <div className="business-health-score">
            <strong>
              {health.score || 0}
            </strong>

            <span>/100</span>
          </div>

          <div className="business-health-score-info">

            <span className="business-health-label">
              BUSINESS HEALTH
            </span>

            <h2>
              {String(
                health.status || "unknown"
              ).toUpperCase()}
            </h2>

            <p>
              Your current overall business
              performance score.
            </p>

          </div>

        </div>

      </section>


      {/* FINANCIAL */}
      <section className="business-health-section">

        <div className="business-health-section-header">
          <h2>Financial Performance</h2>
        </div>

        <div className="business-health-card-grid">

          <div className="business-health-card">
            <span>Revenue</span>

            <strong>
              $
              {Number(
                financial.revenue || 0
              ).toFixed(2)}
            </strong>
          </div>

          <div className="business-health-card">
            <span>Expenses</span>

            <strong>
              $
              {Number(
                financial.expenses || 0
              ).toFixed(2)}
            </strong>
          </div>

          <div className="business-health-card">
            <span>Profit</span>

            <strong>
              $
              {Number(
                financial.profit || 0
              ).toFixed(2)}
            </strong>
          </div>

          <div className="business-health-card">
            <span>Profit Margin</span>

            <strong>
              {Number(
                financial.profitMargin || 0
              ).toFixed(2)}
              %
            </strong>
          </div>

        </div>

      </section>


      {/* SALES */}
      <section className="business-health-section">

        <div className="business-health-section-header">
          <h2>Sales Performance</h2>
        </div>

        <div className="business-health-card-grid">

          <div className="business-health-card">
            <span>Total Orders</span>

            <strong>
              {sales.orders || 0}
            </strong>
          </div>

          <div className="business-health-card">
            <span>Average Order Value</span>

            <strong>
              $
              {Number(
                sales.averageOrderValue || 0
              ).toFixed(2)}
            </strong>
          </div>

        </div>

      </section>


      {/* CUSTOMERS */}
      <section className="business-health-section">

        <div className="business-health-section-header">
          <h2>Customers</h2>
        </div>

        <div className="business-health-card-grid">

          <div className="business-health-card">
            <span>Total Customers</span>

            <strong>
              {customers.total || 0}
            </strong>
          </div>

        </div>

      </section>


      {/* INVENTORY */}
      <section className="business-health-section">

        <div className="business-health-section-header">
          <h2>Inventory</h2>
        </div>

        <div className="business-health-card-grid">

          <div className="business-health-card">
            <span>Total Products</span>

            <strong>
              {inventory.products || 0}
            </strong>
          </div>

          <div className="business-health-card">
            <span>Low Stock</span>

            <strong>
              {inventory.lowStock || 0}
            </strong>
          </div>

          <div className="business-health-card">
            <span>Out of Stock</span>

            <strong>
              {inventory.outOfStock || 0}
            </strong>
          </div>

        </div>

      </section>


      {/* INVOICES */}
      <section className="business-health-section">

        <div className="business-health-section-header">
          <h2>Invoices</h2>
        </div>

        <div className="business-health-card-grid">

          <div className="business-health-card">
            <span>Outstanding</span>

            <strong>
              $
              {Number(
                invoices.outstandingAmount || 0
              ).toFixed(2)}
            </strong>
          </div>

          <div className="business-health-card">
            <span>Overdue</span>

            <strong>
              {invoices.overdue || 0}
            </strong>
          </div>

        </div>

      </section>


      {/* WARNINGS */}
      <section className="business-health-section">

        <div className="business-health-section-header">
          <h2>Warnings</h2>
        </div>

        {data?.warnings?.length ? (
          <div className="business-health-warning-list">

            {data.warnings.map(
              (warning, index) => (
                <div
                  className="business-health-warning"
                  key={index}
                >
                  {warning}
                </div>
              )
            )}

          </div>
        ) : (
          <div className="business-health-empty">
            No major warnings detected.
          </div>
        )}

      </section>


      {/* RECOMMENDATIONS */}
      <section className="business-health-section">

        <div className="business-health-section-header">
          <h2>Recommendations</h2>
        </div>

        <div className="business-health-recommendation-list">

          {data?.recommendations?.map(
            (recommendation, index) => (
              <div
                className="business-health-recommendation"
                key={index}
              >
                <strong>
                  {index + 1}
                </strong>

                <span>
                  {recommendation}
                </span>
              </div>
            )
          )}

        </div>

      </section>


      {/* ACTIONS */}
      <section className="business-health-actions">

        <button
          onClick={() =>
            navigate("/advanced-dashboard")
          }
        >
          Back to Advanced Dashboard
        </button>

        <button
          onClick={() =>
            navigate("/inventory")
          }
        >
          Manage Inventory
        </button>

        <button
          onClick={() =>
            navigate("/invoices")
          }
        >
          Manage Invoices
        </button>

        <button
          onClick={() =>
            navigate("/expenses")
          }
        >
          Manage Expenses
        </button>

      </section>

    </div>
  );
}

export default BusinessHealth;