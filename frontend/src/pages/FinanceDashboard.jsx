import { useCallback, useEffect, useState } from "react";
import {
  FaSyncAlt,
  FaMoneyBillWave,
  FaChartLine,
  FaArrowLeft,
  FaExclamationTriangle
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import api from "../services/api";

import SalesTrend from "../components/SalesTrend";
import ExpenseBreakdown from "../components/ExpenseBreakdown";

import "./FinanceDashboard.css";

function FinanceDashboard() {
  const navigate = useNavigate();

  const [finance, setFinance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadFinance = useCallback(async () => {
    try {
      setError("");

      const response = await api.get("/finance");

      setFinance(response?.data || {});
    } catch (err) {
      console.error("FINANCE DASHBOARD ERROR:", err);

      setError(
        err?.response?.data?.message ||
        "Unable to load financial information."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadFinance();
  }, [loadFinance]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadFinance();
  };

  const money = (value) => {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return "0.00";
    }

    return number.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const number = (value) => {
    const parsed = Number(value);

    if (!Number.isFinite(parsed)) {
      return "0";
    }

    return parsed.toLocaleString();
  };

  const revenue =
    finance?.revenue?.total ??
    finance?.revenue ??
    finance?.summary?.revenue ??
    0;

  const expenses =
    finance?.expenses?.total ??
    finance?.expenses ??
    finance?.summary?.expenses ??
    0;

  const profit =
    finance?.profit?.net ??
    finance?.profit ??
    finance?.summary?.profit ??
    Number(revenue) - Number(expenses);

  const margin =
    finance?.profit?.margin ??
    finance?.margin ??
    (
      Number(revenue) > 0
        ? (Number(profit) / Number(revenue)) * 100
        : 0
    );

  const salesTrend =
    finance?.salesTrend ??
    finance?.sales ??
    finance?.trends ??
    [];

  const expenseBreakdown =
    finance?.expenseBreakdown ??
    finance?.expensesByCategory ??
    finance?.expenseCategories ??
    [];

  const totalInvoices =
    finance?.invoices?.total ??
    finance?.invoiceCount ??
    0;

  const outstandingInvoices =
    finance?.invoices?.outstanding ??
    finance?.outstandingInvoices ??
    0;

  const outstandingAmount =
    finance?.invoices?.outstandingAmount ??
    finance?.outstandingAmount ??
    0;

  if (loading) {
    return (
      <div className="finance-dashboard-page">

        <div className="finance-dashboard-loading">

          <div className="finance-dashboard-spinner">
            <FaSyncAlt />
          </div>

          <h2>
            Loading Finance...
          </h2>

          <p>
            Preparing your financial dashboard.
          </p>

        </div>

      </div>
    );
  }

  return (
    <div className="finance-dashboard-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="finance-dashboard-header">

        <div className="finance-dashboard-header-left">

          <button
            type="button"
            className="finance-back-button"
            onClick={() => navigate("/dashboard")}
          >
            <FaArrowLeft />
          </button>

          <div>

            <span className="finance-dashboard-label">
              FINANCE
            </span>

            <h1>
              Financial Dashboard
            </h1>

            <p>
              Monitor your revenue, expenses, profit and financial performance.
            </p>

          </div>

        </div>

        <button
          type="button"
          className="finance-refresh-button"
          onClick={handleRefresh}
          disabled={refreshing}
        >

          <FaSyncAlt
            className={
              refreshing
                ? "finance-spin"
                : ""
            }
          />

          {refreshing
            ? "Refreshing..."
            : "Refresh"}

        </button>

      </header>


      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (

        <div className="finance-dashboard-error">

          <div>
            <FaExclamationTriangle />

            <span>
              {error}
            </span>
          </div>

          <button
            type="button"
            onClick={loadFinance}
          >
            Try Again
          </button>

        </div>

      )}


      {/* =====================================================
          FINANCIAL KPIs
      ===================================================== */}

      <section className="finance-dashboard-kpis">

        <div className="finance-dashboard-kpi">

          <div className="finance-kpi-icon revenue">
            <FaMoneyBillWave />
          </div>

          <div>

            <span>
              Total Revenue
            </span>

            <strong>
              ${money(revenue)}
            </strong>

          </div>

        </div>


        <div className="finance-dashboard-kpi">

          <div className="finance-kpi-icon expense">
            <FaMoneyBillWave />
          </div>

          <div>

            <span>
              Total Expenses
            </span>

            <strong>
              ${money(expenses)}
            </strong>

          </div>

        </div>


        <div className="finance-dashboard-kpi finance-profit-kpi">

          <div className="finance-kpi-icon profit">
            <FaChartLine />
          </div>

          <div>

            <span>
              Net Profit
            </span>

            <strong>
              ${money(profit)}
            </strong>

          </div>

        </div>


        <div className="finance-dashboard-kpi">

          <div className="finance-kpi-icon margin">
            <FaChartLine />
          </div>

          <div>

            <span>
              Profit Margin
            </span>

            <strong>
              {money(margin)}%
            </strong>

          </div>

        </div>

      </section>


      {/* =====================================================
          SALES TREND + EXPENSE BREAKDOWN
      ===================================================== */}

      <section className="finance-dashboard-main-grid">

        <div className="finance-dashboard-panel">

          <SalesTrend
            data={salesTrend}
            loading={loading}
          />

        </div>

        <div className="finance-dashboard-panel">

          <ExpenseBreakdown
            data={expenseBreakdown}
            loading={loading}
          />

        </div>

      </section>


      {/* =====================================================
          INVOICE SUMMARY
      ===================================================== */}

      <section className="finance-dashboard-invoices">

        <div className="finance-dashboard-section-header">

          <div>

            <span className="finance-dashboard-label">
              BILLING
            </span>

            <h2>
              Invoice Summary
            </h2>

          </div>

          <button
            type="button"
            onClick={() => navigate("/invoices")}
          >
            View Invoices
          </button>

        </div>


        <div className="finance-invoice-grid">

          <div className="finance-invoice-card">

            <span>
              Total Invoices
            </span>

            <strong>
              {number(totalInvoices)}
            </strong>

          </div>


          <div className="finance-invoice-card">

            <span>
              Outstanding Invoices
            </span>

            <strong>
              {number(outstandingInvoices)}
            </strong>

          </div>


          <div className="finance-invoice-card">

            <span>
              Outstanding Amount
            </span>

            <strong>
              ${money(outstandingAmount)}
            </strong>

          </div>

        </div>

      </section>


      {/* =====================================================
          FINANCE ACTIONS
      ===================================================== */}

      <section className="finance-dashboard-actions">

        <button
          type="button"
          onClick={() => navigate("/finance")}
        >
          <FaMoneyBillWave />
          Finance
        </button>

        <button
          type="button"
          onClick={() => navigate("/expenses")}
        >
          <FaMoneyBillWave />
          Expenses
        </button>

        <button
          type="button"
          onClick={() => navigate("/reports")}
        >
          <FaChartLine />
          Reports
        </button>

      </section>

    </div>
  );
}

export default FinanceDashboard;