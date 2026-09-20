import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./AdvancedReports.css";

function AdvancedReports() {
  const navigate = useNavigate();

  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/advanced-reports");

      console.log("ADVANCED REPORTS RESPONSE:", response.data);

      setReports(response.data);
    } catch (error) {
      console.error(
        "ADVANCED REPORTS ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load advanced reports."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="advanced-reports-page">

        <div className="advanced-reports-loading">
          Loading advanced reports...
        </div>

      </div>
    );
  }

  // =====================================================
  // DATA
  // =====================================================

  const summary = reports?.summary || {};

  const revenue = Number(summary.revenue || 0);

  const expenses = Number(summary.expenses || 0);

  const profit = Number(summary.profit || 0);

  const orders = Number(summary.orders || 0);

  const products = Number(summary.products || 0);

  const customers = Number(summary.customers || 0);

  const averageOrderValue =
    Number(summary.averageOrderValue || 0);

  const totalStockUnits =
    Number(summary.totalStockUnits || 0);

  const inventoryValue =
    Number(summary.inventoryValue || 0);

  const profitMargin =
    revenue > 0
      ? (profit / revenue) * 100
      : 0;

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="advanced-reports-page">

        <header className="advanced-reports-header">

          <div>

            <p className="advanced-reports-eyebrow">
              BUSINESS INTELLIGENCE
            </p>

            <h1 className="advanced-reports-title">
              Advanced Reports
            </h1>

            <p className="advanced-reports-subtitle">
              Analyze your business performance,
              sales, customers and finances.
            </p>

          </div>

          <button
            className="advanced-reports-back-button"
            onClick={() => navigate("/dashboard")}
          >
            Back to Dashboard
          </button>

        </header>


        <div className="advanced-reports-error">

          <strong>
            Unable to load reports
          </strong>

          <p>
            {error}
          </p>

          <button onClick={loadReports}>
            Try Again
          </button>

        </div>

      </div>
    );
  }

  // =====================================================
  // MAIN
  // =====================================================

  return (
    <div className="advanced-reports-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="advanced-reports-header">

        <div>

          <p className="advanced-reports-eyebrow">
            BUSINESS INTELLIGENCE
          </p>

          <h1 className="advanced-reports-title">
            Advanced Reports
          </h1>

          <p className="advanced-reports-subtitle">
            Analyze your business performance,
            sales, customers and finances.
          </p>

        </div>


        <div
          style={{
            display: "flex",
            gap: "10px"
          }}
        >

          <button
            className="advanced-reports-back-button"
            onClick={loadReports}
          >
            Refresh Report
          </button>

          <button
            className="advanced-reports-back-button"
            onClick={() => navigate("/dashboard")}
          >
            Back to Dashboard
          </button>

        </div>

      </header>


      {/* =================================================
          DATE RANGE
      ================================================= */}

      {reports?.dateRange && (
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e5e5e5",
            borderRadius: "14px",
            padding: "14px 18px",
            marginBottom: "25px",
            color: "#777777",
            fontSize: "12px"
          }}
        >

          Report period:

          {" "}

          <strong style={{ color: "#171717" }}>
            {new Date(
              reports.dateRange.from
            ).toLocaleDateString()}
          </strong>

          {" — "}

          <strong style={{ color: "#171717" }}>
            {new Date(
              reports.dateRange.to
            ).toLocaleDateString()}
          </strong>

        </div>
      )}


      {/* =================================================
          KPI CARDS
      ================================================= */}

      <section className="advanced-reports-content">

        <div className="advanced-reports-card-grid">


          {/* REVENUE */}

          <div className="advanced-report-card">

            <span className="advanced-report-label">
              Total Revenue
            </span>

            <strong className="advanced-report-value">
              $
              {revenue.toFixed(2)}
            </strong>

          </div>


          {/* EXPENSES */}

          <div className="advanced-report-card">

            <span className="advanced-report-label">
              Total Expenses
            </span>

            <strong className="advanced-report-value">
              $
              {expenses.toFixed(2)}
            </strong>

          </div>


          {/* PROFIT */}

          <div className="advanced-report-card">

            <span className="advanced-report-label">
              Net Profit
            </span>

            <strong
              className={`advanced-report-value ${
                profit >= 0
                  ? "advanced-report-profit"
                  : ""
              }`}
            >
              $
              {profit.toFixed(2)}
            </strong>

          </div>


          {/* PROFIT MARGIN */}

          <div className="advanced-report-card">

            <span className="advanced-report-label">
              Profit Margin
            </span>

            <strong className="advanced-report-value">
              {profitMargin.toFixed(2)}
              %
            </strong>

          </div>

        </div>


        {/* =================================================
            BUSINESS STATISTICS
        ================================================= */}

        <div className="advanced-reports-section">

          <h2>
            Business Statistics
          </h2>


          <div className="advanced-reports-card-grid">


            {/* ORDERS */}

            <div className="advanced-report-card">

              <span className="advanced-report-label">
                Total Orders
              </span>

              <strong className="advanced-report-value">
                {orders.toLocaleString()}
              </strong>

            </div>


            {/* CUSTOMERS */}

            <div className="advanced-report-card">

              <span className="advanced-report-label">
                Total Customers
              </span>

              <strong className="advanced-report-value">
                {customers.toLocaleString()}
              </strong>

            </div>


            {/* PRODUCTS */}

            <div className="advanced-report-card">

              <span className="advanced-report-label">
                Total Products
              </span>

              <strong className="advanced-report-value">
                {products.toLocaleString()}
              </strong>

            </div>


            {/* STOCK */}

            <div className="advanced-report-card">

              <span className="advanced-report-label">
                Stock Units
              </span>

              <strong className="advanced-report-value">
                {totalStockUnits.toLocaleString()}
              </strong>

            </div>

          </div>

        </div>


        {/* =================================================
            FINANCIAL OVERVIEW
        ================================================= */}

        <div className="advanced-reports-section">

          <h2>
            Financial Overview
          </h2>


          <div className="advanced-reports-table-wrapper">

            <table className="advanced-reports-table">

              <thead>

                <tr>
                  <th>
                    Metric
                  </th>

                  <th>
                    Value
                  </th>
                </tr>

              </thead>


              <tbody>

                <tr>

                  <td>
                    Total Revenue
                  </td>

                  <td>
                    $
                    {revenue.toFixed(2)}
                  </td>

                </tr>


                <tr>

                  <td>
                    Total Expenses
                  </td>

                  <td>
                    $
                    {expenses.toFixed(2)}
                  </td>

                </tr>


                <tr>

                  <td>
                    Net Profit
                  </td>

                  <td>
                    $
                    {profit.toFixed(2)}
                  </td>

                </tr>


                <tr>

                  <td>
                    Profit Margin
                  </td>

                  <td>
                    {profitMargin.toFixed(2)}
                    %
                  </td>

                </tr>


                <tr>

                  <td>
                    Average Order Value
                  </td>

                  <td>
                    $
                    {averageOrderValue.toFixed(2)}
                  </td>

                </tr>


                <tr>

                  <td>
                    Inventory Value
                  </td>

                  <td>
                    $
                    {inventoryValue.toFixed(2)}
                  </td>

                </tr>

              </tbody>

            </table>

          </div>

        </div>


        {/* =================================================
            SALES REPORT
        ================================================= */}

        <div className="advanced-reports-section">

          <h2>
            Sales Report
          </h2>

          <div className="advanced-reports-table-wrapper">

            <table className="advanced-reports-table">

              <thead>

                <tr>
                  <th>
                    Date
                  </th>

                  <th>
                    Orders
                  </th>

                  <th>
                    Sales
                  </th>
                </tr>

              </thead>


              <tbody>

                {reports?.salesReport?.length > 0 ? (

                  reports.salesReport.map(
                    (item, index) => (

                      <tr key={index}>

                        <td>
                          {item.date}
                        </td>

                        <td>
                          {item.orders}
                        </td>

                        <td>
                          $
                          {Number(
                            item.sales || 0
                          ).toFixed(2)}
                        </td>

                      </tr>

                    )
                  )

                ) : (

                  <tr>

                    <td
                      colSpan="3"
                      style={{
                        textAlign: "center"
                      }}
                    >
                      No sales data available
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </div>


        {/* =================================================
            REVENUE BY PAYMENT METHOD
        ================================================= */}

        <div className="advanced-reports-section">

          <h2>
            Revenue by Payment Method
          </h2>

          <div className="advanced-reports-table-wrapper">

            <table className="advanced-reports-table">

              <thead>

                <tr>

                  <th>
                    Payment Method
                  </th>

                  <th>
                    Orders
                  </th>

                  <th>
                    Revenue
                  </th>

                </tr>

              </thead>


              <tbody>

                {reports?.paymentMethodReport?.length > 0 ? (

                  reports.paymentMethodReport.map(
                    (item, index) => (

                      <tr key={index}>

                        <td>
                          {String(
                            item.paymentMethod ||
                              "Other"
                          ).toUpperCase()}
                        </td>

                        <td>
                          {item.orders || 0}
                        </td>

                        <td>
                          $
                          {Number(
                            item.revenue || 0
                          ).toFixed(2)}
                        </td>

                      </tr>

                    )
                  )

                ) : (

                  <tr>

                    <td
                      colSpan="3"
                      style={{
                        textAlign: "center"
                      }}
                    >
                      No payment data available
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </div>


        {/* =================================================
            EXPENSE REPORT
        ================================================= */}

        <div className="advanced-reports-section">

          <h2>
            Expenses by Category
          </h2>

          <div className="advanced-reports-table-wrapper">

            <table className="advanced-reports-table">

              <thead>

                <tr>

                  <th>
                    Category
                  </th>

                  <th>
                    Amount
                  </th>

                </tr>

              </thead>


              <tbody>

                {reports?.expenseReport?.length > 0 ? (

                  reports.expenseReport.map(
                    (item, index) => (

                      <tr key={index}>

                        <td>
                          {item.category}
                        </td>

                        <td>
                          $
                          {Number(
                            item.amount || 0
                          ).toFixed(2)}
                        </td>

                      </tr>

                    )
                  )

                ) : (

                  <tr>

                    <td
                      colSpan="2"
                      style={{
                        textAlign: "center"
                      }}
                    >
                      No expense data available
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </div>


        {/* =================================================
            TOP CUSTOMERS
        ================================================= */}

        <div className="advanced-reports-section">

          <h2>
            Customer Performance
          </h2>

          <div className="advanced-reports-table-wrapper">

            <table className="advanced-reports-table">

              <thead>

                <tr>

                  <th>
                    Customer
                  </th>

                  <th>
                    Orders
                  </th>

                  <th>
                    Revenue
                  </th>

                </tr>

              </thead>


              <tbody>

                {reports?.customerReport?.length > 0 ? (

                  reports.customerReport
                    .slice(0, 10)
                    .map(
                      (customer, index) => (

                        <tr key={index}>

                          <td>
                            {customer.name}
                          </td>

                          <td>
                            {customer.orders}
                          </td>

                          <td>
                            $
                            {Number(
                              customer.revenue || 0
                            ).toFixed(2)}
                          </td>

                        </tr>

                      )
                    )

                ) : (

                  <tr>

                    <td
                      colSpan="3"
                      style={{
                        textAlign: "center"
                      }}
                    >
                      No customer sales data available
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </div>


        {/* =================================================
            PRODUCT PERFORMANCE
        ================================================= */}

        <div className="advanced-reports-section">

          <h2>
            Product Performance
          </h2>

          <div className="advanced-reports-table-wrapper">

            <table className="advanced-reports-table">

              <thead>

                <tr>

                  <th>
                    Product
                  </th>

                  <th>
                    Quantity Sold
                  </th>

                  <th>
                    Orders
                  </th>

                  <th>
                    Revenue
                  </th>

                </tr>

              </thead>


              <tbody>

                {reports?.productPerformance?.length > 0 ? (

                  reports.productPerformance
                    .slice(0, 15)
                    .map(
                      (product, index) => (

                        <tr key={index}>

                          <td>
                            {product.name}
                          </td>

                          <td>
                            {product.quantitySold || 0}
                          </td>

                          <td>
                            {product.orders || 0}
                          </td>

                          <td>
                            $
                            {Number(
                              product.revenue || 0
                            ).toFixed(2)}
                          </td>

                        </tr>

                      )
                    )

                ) : (

                  <tr>

                    <td
                      colSpan="4"
                      style={{
                        textAlign: "center"
                      }}
                    >
                      No product performance data available
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </div>


        {/* =================================================
            INVENTORY REPORT
        ================================================= */}

        <div className="advanced-reports-section">

          <h2>
            Inventory Report
          </h2>

          <div className="advanced-reports-table-wrapper">

            <table className="advanced-reports-table">

              <thead>

                <tr>

                  <th>
                    Product
                  </th>

                  <th>
                    Quantity
                  </th>

                  <th>
                    Price
                  </th>

                  <th>
                    Value
                  </th>

                  <th>
                    Status
                  </th>

                </tr>

              </thead>


              <tbody>

                {reports?.inventoryReport?.length > 0 ? (

                  reports.inventoryReport
                    .slice(0, 20)
                    .map(
                      (item, index) => (

                        <tr key={index}>

                          <td>
                            {item.productName}
                          </td>

                          <td>
                            {item.quantity}
                          </td>

                          <td>
                            $
                            {Number(
                              item.price || 0
                            ).toFixed(2)}
                          </td>

                          <td>
                            $
                            {Number(
                              item.value || 0
                            ).toFixed(2)}
                          </td>

                          <td>
                            {String(
                              item.status || ""
                            ).replace(
                              "_",
                              " "
                            )}
                          </td>

                        </tr>

                      )
                    )

                ) : (

                  <tr>

                    <td
                      colSpan="5"
                      style={{
                        textAlign: "center"
                      }}
                    >
                      No inventory data available
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </div>

      </section>

    </div>
  );
}

export default AdvancedReports;