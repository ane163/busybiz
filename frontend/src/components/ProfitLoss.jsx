import { useEffect, useMemo, useState } from "react";
import {
  FaChartLine,
  FaArrowUp,
  FaArrowDown,
  FaSyncAlt,
  FaExclamationTriangle,
  FaMoneyBillWave
} from "react-icons/fa";

import api from "../services/api";
import "./ProfitLoss.css";

function ProfitLoss() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // LOAD PROFIT & LOSS
  // =====================================================

  const loadProfitLoss = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/finance/profit-loss");

      setData(response?.data || {});

    } catch (err) {
      console.error("PROFIT LOSS ERROR:", err);

      setData({});

      setError(
        err?.response?.data?.message ||
        "Unable to load profit and loss data."
      );
    } finally {
      setLoading(false);
    }
  };


  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadProfitLoss();
  }, []);


  // =====================================================
  // REFRESH
  // =====================================================

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadProfitLoss();
    } finally {
      setRefreshing(false);
    }
  };


  // =====================================================
  // FORMAT MONEY
  // =====================================================

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


  // =====================================================
  // EXTRACT VALUES
  // =====================================================

  const values = useMemo(() => {
    const revenue =
      Number(
        data?.revenue ??
        data?.totalRevenue ??
        data?.income ??
        data?.sales ??
        data?.summary?.revenue ??
        data?.summary?.totalRevenue ??
        0
      ) || 0;

    const expenses =
      Number(
        data?.expenses ??
        data?.totalExpenses ??
        data?.expense ??
        data?.summary?.expenses ??
        data?.summary?.totalExpenses ??
        0
      ) || 0;

    const netProfit =
      Number(
        data?.netProfit ??
        data?.profit ??
        data?.netIncome ??
        data?.summary?.netProfit ??
        0
      ) || revenue - expenses;

    const margin =
      revenue > 0
        ? (netProfit / revenue) * 100
        : 0;

    return {
      revenue,
      expenses,
      netProfit,
      margin
    };
  }, [data]);


  // =====================================================
  // PROFIT STATUS
  // =====================================================

  const isProfit = values.netProfit >= 0;


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <section className="profit-loss">

        <div className="profit-loss-header">

          <div>
            <span className="profit-loss-label">
              FINANCE
            </span>

            <h2>
              Profit & Loss
            </h2>
          </div>

        </div>

        <div className="profit-loss-loading">

          <FaSyncAlt className="profit-loss-spin" />

          <span>
            Loading financial data...
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
      <section className="profit-loss">

        <div className="profit-loss-header">

          <div>

            <span className="profit-loss-label">
              FINANCE
            </span>

            <h2>
              Profit & Loss
            </h2>

          </div>

          <button
            type="button"
            className="profit-loss-refresh"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <FaSyncAlt
              className={
                refreshing
                  ? "profit-loss-spin"
                  : ""
              }
            />
          </button>

        </div>

        <div className="profit-loss-error">

          <FaExclamationTriangle />

          <div>

            <strong>
              Unable to load profit & loss
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
    <section className="profit-loss">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="profit-loss-header">

        <div>

          <span className="profit-loss-label">
            FINANCE
          </span>

          <h2>
            Profit & Loss
          </h2>

          <p>
            Monitor revenue, expenses and business profitability.
          </p>

        </div>

        <button
          type="button"
          className="profit-loss-refresh"
          onClick={handleRefresh}
          disabled={refreshing}
          title="Refresh financial data"
          aria-label="Refresh financial data"
        >

          <FaSyncAlt
            className={
              refreshing
                ? "profit-loss-spin"
                : ""
            }
          />

        </button>

      </div>


      {/* =================================================
          NET PROFIT HERO
      ================================================= */}

      <div
        className={`profit-loss-hero ${
          isProfit
            ? "profit-positive"
            : "profit-negative"
        }`}
      >

        <div className="profit-loss-hero-icon">

          {isProfit ? (
            <FaArrowUp />
          ) : (
            <FaArrowDown />
          )}

        </div>

        <div className="profit-loss-hero-content">

          <span>
            NET {isProfit ? "PROFIT" : "LOSS"}
          </span>

          <strong>
            ${money(Math.abs(values.netProfit))}
          </strong>

          <small>
            {values.margin.toFixed(2)}% profit margin
          </small>

        </div>

      </div>


      {/* =================================================
          FINANCIAL CARDS
      ================================================= */}

      <div className="profit-loss-grid">

        {/* REVENUE */}

        <div className="profit-loss-card">

          <div className="profit-loss-card-icon revenue">
            <FaMoneyBillWave />
          </div>

          <div>

            <span>
              TOTAL REVENUE
            </span>

            <strong>
              ${money(values.revenue)}
            </strong>

          </div>

        </div>


        {/* EXPENSES */}

        <div className="profit-loss-card">

          <div className="profit-loss-card-icon expense">
            <FaArrowDown />
          </div>

          <div>

            <span>
              TOTAL EXPENSES
            </span>

            <strong>
              ${money(values.expenses)}
            </strong>

          </div>

        </div>


        {/* NET */}

        <div className="profit-loss-card">

          <div className="profit-loss-card-icon profit">
            <FaChartLine />
          </div>

          <div>

            <span>
              NET RESULT
            </span>

            <strong>
              {isProfit ? "+" : "-"}$
              {money(Math.abs(values.netProfit))}
            </strong>

          </div>

        </div>

      </div>


      {/* =================================================
          CALCULATION
      ================================================= */}

      <div className="profit-loss-calculation">

        <div className="profit-loss-calculation-header">

          <div>

            <span>
              PROFIT & LOSS CALCULATION
            </span>

            <h3>
              Financial Position
            </h3>

          </div>

          <FaChartLine />

        </div>


        <div className="profit-loss-calculation-row">

          <div>

            <span className="profit-loss-row-icon revenue">
              <FaArrowUp />
            </span>

            <span>
              Revenue
            </span>

          </div>

          <strong>
            + ${money(values.revenue)}
          </strong>

        </div>


        <div className="profit-loss-calculation-row">

          <div>

            <span className="profit-loss-row-icon expense">
              <FaArrowDown />
            </span>

            <span>
              Expenses
            </span>

          </div>

          <strong>
            - ${money(values.expenses)}
          </strong>

        </div>


        <div className="profit-loss-divider" />


        <div
          className={`profit-loss-calculation-result ${
            isProfit
              ? "positive"
              : "negative"
          }`}
        >

          <div>

            <span>
              NET {isProfit ? "PROFIT" : "LOSS"}
            </span>

            <small>
              Revenue − Expenses
            </small>

          </div>

          <strong>
            {isProfit ? "+" : "-"}$
            {money(Math.abs(values.netProfit))}
          </strong>

        </div>

      </div>


      {/* =================================================
          PROFIT MARGIN
      ================================================= */}

      <div className="profit-loss-margin">

        <div className="profit-loss-margin-header">

          <div>

            <span>
              PROFIT MARGIN
            </span>

            <h3>
              Business Profitability
            </h3>

          </div>

          <strong>
            {values.margin.toFixed(2)}%
          </strong>

        </div>


        <div className="profit-loss-progress">

          <div
            className={`profit-loss-progress-fill ${
              isProfit
                ? "positive"
                : "negative"
            }`}
            style={{
              width: `${Math.min(
                Math.max(
                  values.margin,
                  0
                ),
                100
              )}%`
            }}
          />

        </div>


        <p>
          {isProfit
            ? "Your business is currently generating more revenue than expenses."
            : "Your business expenses are currently higher than revenue."
          }
        </p>

      </div>

    </section>
  );
}

export default ProfitLoss;