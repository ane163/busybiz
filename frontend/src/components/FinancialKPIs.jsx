import { useEffect, useMemo, useState } from "react";
import {
  FaMoneyBillWave,
  FaChartLine,
  FaReceipt,
  FaPercentage,
  FaArrowUp,
  FaArrowDown,
  FaSyncAlt,
  FaExclamationTriangle
} from "react-icons/fa";

import api from "../services/api";
import "./FinancialKPIs.css";

function FinancialKPIs() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // LOAD FINANCIAL DATA
  // =====================================================

  const loadFinancialData = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/finance/summary");

      setData(response?.data || {});

    } catch (err) {
      console.error("FINANCIAL KPI ERROR:", err);

      setData({});

      setError(
        err?.response?.data?.message ||
        "Unable to load financial KPIs."
      );
    } finally {
      setLoading(false);
    }
  };


  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadFinancialData();
  }, []);


  // =====================================================
  // REFRESH
  // =====================================================

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadFinancialData();
    } finally {
      setRefreshing(false);
    }
  };


  // =====================================================
  // FORMAT MONEY
  // =====================================================

  const money = (value) => {
    const amount = Number(value);

    if (!Number.isFinite(amount)) {
      return "0.00";
    }

    return amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };


  // =====================================================
  // FORMAT NUMBER
  // =====================================================

  const number = (value) => {
    const amount = Number(value);

    if (!Number.isFinite(amount)) {
      return "0";
    }

    return amount.toLocaleString();
  };


  // =====================================================
  // EXTRACT KPI VALUES
  // =====================================================

  const kpis = useMemo(() => {
    const revenue =
      Number(
        data?.revenue?.total ??
        data?.revenue ??
        data?.totalRevenue ??
        0
      ) || 0;

    const expenses =
      Number(
        data?.expenses?.total ??
        data?.expenses ??
        data?.totalExpenses ??
        0
      ) || 0;

    const netProfit =
      Number(
        data?.profit?.net ??
        data?.netProfit ??
        data?.profit ??
        0
      ) || revenue - expenses;

    const margin =
      Number(
        data?.profit?.margin ??
        data?.profitMargin ??
        0
      ) || (
        revenue > 0
          ? (netProfit / revenue) * 100
          : 0
      );

    const invoices =
      Number(
        data?.invoices?.total ??
        data?.invoiceCount ??
        0
      ) || 0;

    const paidInvoices =
      Number(
        data?.invoices?.paid ??
        data?.paidInvoices ??
        0
      ) || 0;

    const outstanding =
      Number(
        data?.invoices?.outstanding ??
        data?.outstandingInvoices ??
        0
      ) || 0;

    const outstandingAmount =
      Number(
        data?.invoices?.outstandingAmount ??
        data?.outstandingAmount ??
        0
      ) || 0;

    return {
      revenue,
      expenses,
      netProfit,
      margin,
      invoices,
      paidInvoices,
      outstanding,
      outstandingAmount
    };
  }, [data]);


  // =====================================================
  // PROFIT STATUS
  // =====================================================

  const profitable = kpis.netProfit >= 0;


  // =====================================================
  // INVOICE PAYMENT RATE
  // =====================================================

  const paymentRate = useMemo(() => {
    if (!kpis.invoices) {
      return 0;
    }

    return Math.min(
      100,
      Math.max(
        0,
        (kpis.paidInvoices / kpis.invoices) * 100
      )
    );
  }, [kpis.invoices, kpis.paidInvoices]);


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <section className="financial-kpis">

        <div className="financial-kpis-header">

          <div>
            <span className="financial-kpis-label">
              FINANCIAL PERFORMANCE
            </span>

            <h2>
              Financial KPIs
            </h2>
          </div>

        </div>

        <div className="financial-kpis-loading">

          <FaSyncAlt className="financial-kpis-spin" />

          <span>
            Loading financial KPIs...
          </span>

        </div>

      </section>
    );
  }


  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <section className="financial-kpis">

        <div className="financial-kpis-header">

          <div>

            <span className="financial-kpis-label">
              FINANCIAL PERFORMANCE
            </span>

            <h2>
              Financial KPIs
            </h2>

          </div>

          <button
            type="button"
            className="financial-kpis-refresh"
            onClick={handleRefresh}
            disabled={refreshing}
          >

            <FaSyncAlt
              className={
                refreshing
                  ? "financial-kpis-spin"
                  : ""
              }
            />

          </button>

        </div>

        <div className="financial-kpis-error">

          <FaExclamationTriangle />

          <div>

            <strong>
              Unable to load financial KPIs
            </strong>

            <p>
              {error}
            </p>

          </div>

        </div>

      </section>
    );
  }


  // =====================================================
  // MAIN
  // =====================================================

  return (
    <section className="financial-kpis">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="financial-kpis-header">

        <div>

          <span className="financial-kpis-label">
            FINANCIAL PERFORMANCE
          </span>

          <h2>
            Financial KPIs
          </h2>

          <p>
            Key numbers showing the current financial position
            of your business.
          </p>

        </div>

        <button
          type="button"
          className="financial-kpis-refresh"
          onClick={handleRefresh}
          disabled={refreshing}
          title="Refresh financial KPIs"
          aria-label="Refresh financial KPIs"
        >

          <FaSyncAlt
            className={
              refreshing
                ? "financial-kpis-spin"
                : ""
            }
          />

        </button>

      </div>


      {/* =================================================
          KPI GRID
      ================================================= */}

      <div className="financial-kpis-grid">

        {/* REVENUE */}

        <div className="financial-kpi-card">

          <div className="financial-kpi-top">

            <div className="financial-kpi-icon revenue">
              <FaMoneyBillWave />
            </div>

            <span className="financial-kpi-badge positive">
              Revenue
            </span>

          </div>

          <span className="financial-kpi-title">
            Total Revenue
          </span>

          <strong className="financial-kpi-value">
            ${money(kpis.revenue)}
          </strong>

          <div className="financial-kpi-footer">

            <FaArrowUp />

            <span>
              Total business income
            </span>

          </div>

        </div>


        {/* EXPENSES */}

        <div className="financial-kpi-card">

          <div className="financial-kpi-top">

            <div className="financial-kpi-icon expense">
              <FaMoneyBillWave />
            </div>

            <span className="financial-kpi-badge warning">
              Expenses
            </span>

          </div>

          <span className="financial-kpi-title">
            Total Expenses
          </span>

          <strong className="financial-kpi-value">
            ${money(kpis.expenses)}
          </strong>

          <div className="financial-kpi-footer">

            <FaArrowDown />

            <span>
              Total business spending
            </span>

          </div>

        </div>


        {/* PROFIT */}

        <div
          className={`financial-kpi-card ${
            profitable
              ? "financial-kpi-profit"
              : "financial-kpi-loss"
          }`}
        >

          <div className="financial-kpi-top">

            <div className="financial-kpi-icon profit">
              <FaChartLine />
            </div>

            <span
              className={`financial-kpi-badge ${
                profitable
                  ? "positive"
                  : "danger"
              }`}
            >
              {profitable ? "Profit" : "Loss"}
            </span>

          </div>

          <span className="financial-kpi-title">
            Net Profit
          </span>

          <strong className="financial-kpi-value">

            {profitable ? "+" : "-"}$
            {money(Math.abs(kpis.netProfit))}

          </strong>

          <div className="financial-kpi-footer">

            {profitable ? (
              <FaArrowUp />
            ) : (
              <FaArrowDown />
            )}

            <span>
              Revenue minus expenses
            </span>

          </div>

        </div>


        {/* MARGIN */}

        <div className="financial-kpi-card">

          <div className="financial-kpi-top">

            <div className="financial-kpi-icon margin">
              <FaPercentage />
            </div>

            <span className="financial-kpi-badge">
              Margin
            </span>

          </div>

          <span className="financial-kpi-title">
            Profit Margin
          </span>

          <strong className="financial-kpi-value">
            {kpis.margin.toFixed(2)}%
          </strong>

          <div className="financial-kpi-footer">

            <FaPercentage />

            <span>
              Profitability ratio
            </span>

          </div>

        </div>

      </div>


      {/* =================================================
          SECONDARY METRICS
      ================================================= */}

      <div className="financial-kpis-secondary">

        {/* INVOICES */}

        <div className="financial-secondary-card">

          <div className="financial-secondary-icon">
            <FaReceipt />
          </div>

          <div className="financial-secondary-content">

            <span>
              TOTAL INVOICES
            </span>

            <strong>
              {number(kpis.invoices)}
            </strong>

          </div>

        </div>


        {/* PAID */}

        <div className="financial-secondary-card">

          <div className="financial-secondary-icon">
            <FaArrowUp />
          </div>

          <div className="financial-secondary-content">

            <span>
              PAID INVOICES
            </span>

            <strong>
              {number(kpis.paidInvoices)}
            </strong>

          </div>

        </div>


        {/* OUTSTANDING */}

        <div className="financial-secondary-card">

          <div className="financial-secondary-icon warning">
            <FaArrowDown />
          </div>

          <div className="financial-secondary-content">

            <span>
              OUTSTANDING INVOICES
            </span>

            <strong>
              {number(kpis.outstanding)}
            </strong>

          </div>

        </div>


        {/* OUTSTANDING AMOUNT */}

        <div className="financial-secondary-card">

          <div className="financial-secondary-icon">
            <FaMoneyBillWave />
          </div>

          <div className="financial-secondary-content">

            <span>
              OUTSTANDING AMOUNT
            </span>

            <strong>
              ${money(kpis.outstandingAmount)}
            </strong>

          </div>

        </div>

      </div>


      {/* =================================================
          PAYMENT COLLECTION
      ================================================= */}

      <div className="financial-kpis-collection">

        <div className="financial-collection-header">

          <div>

            <span>
              INVOICE COLLECTION
            </span>

            <h3>
              Payment Collection Rate
            </h3>

          </div>

          <strong>
            {paymentRate.toFixed(1)}%
          </strong>

        </div>


        <div className="financial-collection-bar">

          <div
            className="financial-collection-fill"
            style={{
              width: `${paymentRate}%`
            }}
          />

        </div>


        <div className="financial-collection-footer">

          <span>
            {number(kpis.paidInvoices)} paid
          </span>

          <span>
            {number(kpis.outstanding)} outstanding
          </span>

        </div>

      </div>

    </section>
  );
}

export default FinancialKPIs;