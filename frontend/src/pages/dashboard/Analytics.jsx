import { useEffect, useState } from "react";
import api from "../../services/api";
import "./Analytics.css";

function Analytics() {
  const [summary, setSummary] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        summaryResponse,
        productsResponse,
        ordersResponse,
        customersResponse
      ] = await Promise.all([
        api.get("/analytics/summary"),
        api.get("/analytics/top-products"),
        api.get("/analytics/recent-orders"),
        api.get("/analytics/customers")
      ]);

      setSummary(summaryResponse.data);
      setTopProducts(productsResponse.data);
      setRecentOrders(ordersResponse.data);
      setCustomers(customersResponse.data);
    } catch (error) {
      console.error("ANALYTICS ERROR:", error);

      setError(
        error.response?.data?.message ||
        "Unable to load analytics."
      );
    } finally {
      setLoading(false);
    }
  };

  const money = (value) =>
    Number(value || 0).toFixed(2);

  if (loading) {
    return (
      <div className="analytics-page">
        <div className="analytics-loading">
          <h2>Loading Analytics...</h2>
          <p>Analyzing your business activity.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-page">

      {/* HEADER */}

      <header className="analytics-header">

        <div>
          <h1 className="analytics-title">
            Business Analytics
          </h1>

          <p className="analytics-subtitle">
            Understand your sales, customers and products.
          </p>
        </div>

        <button
          className="analytics-refresh-button"
          onClick={loadAnalytics}
        >
          Refresh
        </button>

      </header>


      {/* ERROR */}

      {error && (
        <div className="analytics-error">

          <p>{error}</p>

          <button
            className="analytics-button"
            onClick={loadAnalytics}
          >
            Try Again
          </button>

        </div>
      )}


      {/* SALES OVERVIEW */}

      {summary && (
        <section className="analytics-section">

          <div className="analytics-section-header">
            <h2>Sales Overview</h2>
          </div>

          <div className="analytics-card-grid">

            <div className="analytics-card">
              <span className="analytics-card-label">
                Total Sales
              </span>

              <strong className="analytics-card-value">
                ${money(summary.sales?.total)}
              </strong>
            </div>


            <div className="analytics-card">
              <span className="analytics-card-label">
                Paid Orders
              </span>

              <strong className="analytics-card-value">
                {summary.sales?.paidOrders || 0}
              </strong>
            </div>


            <div className="analytics-card">
              <span className="analytics-card-label">
                Invoice Revenue
              </span>

              <strong className="analytics-card-value">
                ${money(summary.invoices?.revenue)}
              </strong>
            </div>


            <div className="analytics-card">
              <span className="analytics-card-label">
                Net Profit
              </span>

              <strong className="analytics-card-value">
                ${money(summary.profit?.net)}
              </strong>
            </div>


            <div className="analytics-card">
              <span className="analytics-card-label">
                Profit Margin
              </span>

              <strong className="analytics-card-value">
                {money(summary.profit?.margin)}%
              </strong>
            </div>


            <div className="analytics-card">
              <span className="analytics-card-label">
                Total Expenses
              </span>

              <strong className="analytics-card-value">
                ${money(summary.expenses?.total)}
              </strong>
            </div>

          </div>

        </section>
      )}


      {/* BUSINESS ACTIVITY */}

      {summary && (
        <section className="analytics-section">

          <div className="analytics-section-header">
            <h2>Business Activity</h2>
          </div>

          <div className="analytics-stat-grid">

            <div className="analytics-stat-card">
              <span>Products</span>

              <strong>
                {summary.business?.products || 0}
              </strong>
            </div>


            <div className="analytics-stat-card">
              <span>Customers</span>

              <strong>
                {summary.business?.customers || 0}
              </strong>
            </div>


            <div className="analytics-stat-card">
              <span>Orders</span>

              <strong>
                {summary.business?.orders || 0}
              </strong>
            </div>


            <div className="analytics-stat-card">
              <span>Inventory Value</span>

              <strong>
                ${money(summary.inventory?.value)}
              </strong>
            </div>


            <div className="analytics-stat-card">
              <span>Low Stock</span>

              <strong>
                {summary.inventory?.lowStock || 0}
              </strong>
            </div>


            <div className="analytics-stat-card">
              <span>Out of Stock</span>

              <strong>
                {summary.inventory?.outOfStock || 0}
              </strong>
            </div>

          </div>

        </section>
      )}


      {/* TOP PRODUCTS */}

      <section className="analytics-section">

        <div className="analytics-section-header">
          <h2>Top Products</h2>
        </div>

        {topProducts.length === 0 ? (

          <div className="analytics-empty">
            <p>No product sales recorded yet.</p>
          </div>

        ) : (

          <div className="analytics-table-container">

            <table className="analytics-table">

              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity Sold</th>
                  <th>Revenue</th>
                </tr>
              </thead>

              <tbody>

                {topProducts.map(
                  (product, index) => (

                    <tr key={product.product || index}>

                      <td>
                        {product.name}
                      </td>

                      <td>
                        {product.quantity}
                      </td>

                      <td>
                        ${money(product.revenue)}
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </section>


      {/* RECENT ORDERS */}

      <section className="analytics-section">

        <div className="analytics-section-header">
          <h2>Recent Orders</h2>
        </div>

        {recentOrders.length === 0 ? (

          <div className="analytics-empty">
            <p>No orders found.</p>
          </div>

        ) : (

          <div className="analytics-table-container">

            <table className="analytics-table">

              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>

                {recentOrders.map((order) => (

                  <tr key={order._id}>

                    <td>
                      {order.customer?.name ||
                        order.customer?.fullName ||
                        "Walk-in Customer"}
                    </td>

                    <td>
                      ${money(order.total)}
                    </td>

                    <td>
                      {order.paymentStatus}
                    </td>

                    <td>
                      {order.status}
                    </td>

                    <td>
                      {order.createdAt
                        ? new Date(
                            order.createdAt
                          ).toLocaleDateString()
                        : "-"}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </section>


      {/* CUSTOMER ANALYTICS */}

      <section className="analytics-section">

        <div className="analytics-section-header">
          <h2>Customer Performance</h2>
        </div>

        {customers.length === 0 ? (

          <div className="analytics-empty">
            <p>No customers found.</p>
          </div>

        ) : (

          <div className="analytics-table-container">

            <table className="analytics-table">

              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Orders</th>
                  <th>Total Spent</th>
                </tr>
              </thead>

              <tbody>

                {customers.map(
                  (item, index) => (

                    <tr
                      key={
                        item.customer?._id ||
                        index
                      }
                    >

                      <td>
                        {item.customer?.name ||
                          item.customer?.fullName ||
                          item.customer?.email ||
                          "Customer"}
                      </td>

                      <td>
                        {item.orders}
                      </td>

                      <td>
                        ${money(item.spent)}
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </section>

    </div>
  );
}

export default Analytics;