import { useEffect, useState } from "react";
import api from "../../services/api";

import SalesTrend from "../../components/SalesTrend";
import ExpenseBreakdown from "../../components/ExpenseBreakdown";
import ProfitLoss from "../../components/ProfitLoss";

import "./Reports.css";


function Reports() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadReport();
  }, []);


  // =====================================================
  // LOAD REPORT
  // =====================================================

  const loadReport = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/reports/overview"
      );

      setReport(response.data || {});

    } catch (error) {
      console.error(
        "LOAD REPORT ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load business report."
      );

    } finally {
      setLoading(false);
    }
  };


  // =====================================================
  // REFRESH
  // =====================================================

  const handleRefresh = async () => {
    try {
      setRefreshing(true);

      await loadReport();

    } finally {
      setRefreshing(false);
    }
  };


  // =====================================================
  // MONEY FORMAT
  // =====================================================

  const money = (value) => {
    const amount = Number(value);

    if (!Number.isFinite(amount)) {
      return "0.00";
    }

    return amount.toFixed(2);
  };


  // =====================================================
  // NUMBER FORMAT
  // =====================================================

  const number = (value) => {
    const amount = Number(value);

    if (!Number.isFinite(amount)) {
      return "0";
    }

    return amount.toLocaleString();
  };


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="reports-page">

        <div className="reports-header">

          <div>
            <h1 className="reports-title">
              Reports
            </h1>

            <p className="reports-subtitle">
              Your business financial overview
            </p>
          </div>

        </div>


        <div className="reports-loading">

          <div className="reports-loading-spinner"></div>

          <p className="reports-loading-text">
            Loading business reports...
          </p>

        </div>

      </div>
    );
  }


  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="reports-page">

        <div className="reports-header">

          <div>

            <h1 className="reports-title">
              Reports
            </h1>

            <p className="reports-subtitle">
              Your business financial overview
            </p>

          </div>

        </div>


        <div className="reports-error-card">

          <div className="reports-error-icon">
            !
          </div>

          <h2 className="reports-error-title">
            Unable to load reports
          </h2>

          <p className="reports-error-message">
            {error}
          </p>

          <button
            type="button"
            className="reports-retry-button"
            onClick={loadReport}
          >
            Try Again
          </button>

        </div>

      </div>
    );
  }


  // =====================================================
  // MAIN REPORT
  // =====================================================

  return (
    <div className="reports-page">


      {/* =================================================
          HEADER
      ================================================= */}

      <div className="reports-header">

        <div className="reports-header-content">

          <span className="reports-section-label">
            BUSINESS INTELLIGENCE
          </span>

          <h1 className="reports-title">
            Financial Reports
          </h1>

          <p className="reports-subtitle">
            Understand your sales, expenses and
            profitability from one place.
          </p>

        </div>


        <button
          type="button"
          className="reports-refresh-button"
          onClick={handleRefresh}
          disabled={refreshing}
        >

          {refreshing
            ? "Refreshing..."
            : "Refresh Report"}

        </button>

      </div>


      {/* =================================================
          FINANCIAL KPIs
      ================================================= */}

      <section className="reports-section">

        <div className="reports-section-header">

          <div>

            <span className="reports-section-label">
              PERFORMANCE
            </span>

            <h2 className="reports-section-title">
              Financial Overview
            </h2>

            <p className="reports-section-subtitle">
              Key financial indicators for your business.
            </p>

          </div>

        </div>


        <div className="reports-kpi-grid">


          {/* REVENUE */}

          <div className="reports-kpi-card reports-kpi-revenue">

            <div className="reports-kpi-top">

              <span className="reports-kpi-label">
                Revenue
              </span>

              <span className="reports-kpi-icon">
                $
              </span>

            </div>

            <h2 className="reports-kpi-value">
              ${money(report?.revenue)}
            </h2>

            <p className="reports-kpi-description">
              Total money received from sales.
            </p>

          </div>


          {/* EXPENSES */}

          <div className="reports-kpi-card reports-kpi-expenses">

            <div className="reports-kpi-top">

              <span className="reports-kpi-label">
                Expenses
              </span>

              <span className="reports-kpi-icon">
                -
              </span>

            </div>

            <h2 className="reports-kpi-value">
              ${money(report?.expenses)}
            </h2>

            <p className="reports-kpi-description">
              Total recorded business expenses.
            </p>

          </div>


          {/* PROFIT */}

          <div className="reports-kpi-card reports-kpi-profit">

            <div className="reports-kpi-top">

              <span className="reports-kpi-label">
                Net Profit
              </span>

              <span className="reports-kpi-icon">
                +
              </span>

            </div>

            <h2 className="reports-kpi-value">
              ${money(report?.profit)}
            </h2>

            <p className="reports-kpi-description">
              Revenue remaining after expenses.
            </p>

          </div>


          {/* MARGIN */}

          <div className="reports-kpi-card reports-kpi-margin">

            <div className="reports-kpi-top">

              <span className="reports-kpi-label">
                Profit Margin
              </span>

              <span className="reports-kpi-icon">
                %
              </span>

            </div>

            <h2 className="reports-kpi-value">
              {money(report?.profitMargin)}%
            </h2>

            <p className="reports-kpi-description">
              Percentage of revenue retained as profit.
            </p>

          </div>

        </div>

      </section>


      {/* =================================================
          SALES TREND
      ================================================= */}

      <section className="reports-section">

        <div className="reports-section-header">

          <div>

            <span className="reports-section-label">
              SALES ANALYTICS
            </span>

            <h2 className="reports-section-title">
              Sales Trend
            </h2>

            <p className="reports-section-subtitle">
              Track how your sales are performing over time.
            </p>

          </div>

        </div>


        <div className="reports-chart-card">

          <SalesTrend />

        </div>

      </section>


      {/* =================================================
          EXPENSE BREAKDOWN + PROFIT LOSS
      ================================================= */}

      <section className="reports-section">

        <div className="reports-section-header">

          <div>

            <span className="reports-section-label">
              FINANCIAL ANALYSIS
            </span>

            <h2 className="reports-section-title">
              Financial Breakdown
            </h2>

            <p className="reports-section-subtitle">
              See where your money is going and how your
              business is performing financially.
            </p>

          </div>

        </div>


        <div className="reports-analysis-grid">


          {/* EXPENSE BREAKDOWN */}

          <div className="reports-analysis-card">

            <ExpenseBreakdown />

          </div>


          {/* PROFIT LOSS */}

          <div className="reports-analysis-card">

            <ProfitLoss />

          </div>

        </div>

      </section>


      {/* =================================================
          BUSINESS STATISTICS
      ================================================= */}

      <section className="reports-section">

        <div className="reports-section-header">

          <div>

            <span className="reports-section-label">
              BUSINESS
            </span>

            <h2 className="reports-section-title">
              Business Statistics
            </h2>

            <p className="reports-section-subtitle">
              Overview of your current business activity.
            </p>

          </div>

        </div>


        <div className="reports-stat-grid">


          {/* ORDERS */}

          <div className="reports-stat-card">

            <div className="reports-stat-icon">
              O
            </div>

            <div className="reports-stat-content">

              <p className="reports-stat-label">
                Total Orders
              </p>

              <h3 className="reports-stat-value">
                {number(report?.totalOrders)}
              </h3>

            </div>

          </div>


          {/* CUSTOMERS */}

          <div className="reports-stat-card">

            <div className="reports-stat-icon">
              C
            </div>

            <div className="reports-stat-content">

              <p className="reports-stat-label">
                Total Customers
              </p>

              <h3 className="reports-stat-value">
                {number(report?.totalCustomers)}
              </h3>

            </div>

          </div>


          {/* PRODUCTS */}

          <div className="reports-stat-card">

            <div className="reports-stat-icon">
              P
            </div>

            <div className="reports-stat-content">

              <p className="reports-stat-label">
                Total Products
              </p>

              <h3 className="reports-stat-value">
                {number(report?.totalProducts)}
              </h3>

            </div>

          </div>


          {/* LOW STOCK */}

          <div className="reports-stat-card">

            <div className="reports-stat-icon">
              !
            </div>

            <div className="reports-stat-content">

              <p className="reports-stat-label">
                Low Stock Products
              </p>

              <h3 className="reports-stat-value">
                {number(report?.lowStockCount)}
              </h3>

            </div>

          </div>

        </div>

      </section>


      {/* =================================================
          PROFIT SUMMARY
      ================================================= */}

      <section className="reports-section">

        <div className="reports-section-header">

          <div>

            <span className="reports-section-label">
              PROFIT & LOSS
            </span>

            <h2 className="reports-section-title">
              Financial Summary
            </h2>

          </div>

        </div>


        <div className="reports-financial-card">


          <div className="reports-financial-row">

            <span className="reports-financial-label">
              Total Revenue
            </span>

            <span className="reports-financial-value">
              ${money(report?.revenue)}
            </span>

          </div>


          <div className="reports-financial-divider"></div>


          <div className="reports-financial-row">

            <span className="reports-financial-label">
              Total Expenses
            </span>

            <span className="reports-financial-value reports-expense-value">
              -${money(report?.expenses)}
            </span>

          </div>


          <div className="reports-financial-divider"></div>


          <div className="reports-financial-row reports-profit-row">

            <span className="reports-financial-label">
              Net Profit
            </span>

            <span className="reports-financial-value reports-profit-value">
              ${money(report?.profit)}
            </span>

          </div>


          <div className="reports-financial-divider"></div>


          <div className="reports-financial-row">

            <span className="reports-financial-label">
              Profit Margin
            </span>

            <span className="reports-financial-value">
              {money(report?.profitMargin)}%
            </span>

          </div>

        </div>

      </section>


      {/* =================================================
          FOOTER
      ================================================= */}

      <div className="reports-footer">

        <div>

          <strong>
            BusyBiz Reports
          </strong>

          <span>
            Manage • Analyze • Grow
          </span>

        </div>


        <button
          type="button"
          className="reports-refresh-button"
          onClick={handleRefresh}
          disabled={refreshing}
        >

          {refreshing
            ? "Refreshing..."
            : "Refresh Report"}

        </button>

      </div>

    </div>
  );
}


export default Reports;