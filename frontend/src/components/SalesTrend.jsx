import { useEffect, useMemo, useState } from "react";
import {
  FaChartLine,
  FaArrowUp,
  FaArrowDown,
  FaSyncAlt,
  FaExclamationTriangle
} from "react-icons/fa";

import api from "../services/api";

import "./SalesTrend.css";

function SalesTrend() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [period, setPeriod] = useState("6months");

  // =====================================================
  // LOAD SALES TREND
  // =====================================================

  const loadSalesTrend = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/finance/sales-trend?period=${period}`
      );

      const result =
        response?.data?.data ??
        response?.data ??
        [];

      if (Array.isArray(result)) {
        setData(result);
      } else if (Array.isArray(result?.monthly)) {
        setData(result.monthly);
      } else if (Array.isArray(result?.sales)) {
        setData(result.sales);
      } else {
        setData([]);
      }
    } catch (err) {
      console.error("SALES TREND ERROR:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to load sales trend."
      );

      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD WHEN PERIOD CHANGES
  // =====================================================

  useEffect(() => {
    loadSalesTrend();

    // loadSalesTrend depends on period and is intentionally
    // called whenever the selected period changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  // =====================================================
  // REFRESH
  // =====================================================

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadSalesTrend();
    } finally {
      setRefreshing(false);
    }
  };

  // =====================================================
  // NORMALIZE DATA
  // =====================================================

  const chartData = useMemo(() => {
    return data.map((item, index) => {
      const sales = Number(
        item?.sales ??
          item?.revenue ??
          item?.totalSales ??
          item?.amount ??
          0
      );

      const orders = Number(
        item?.orders ??
          item?.orderCount ??
          item?.salesCount ??
          0
      );

      return {
        label:
          item?.label ??
          item?.month ??
          item?.name ??
          item?.date ??
          `Period ${index + 1}`,

        sales: Number.isFinite(sales) ? sales : 0,

        orders: Number.isFinite(orders) ? orders : 0
      };
    });
  }, [data]);

  // =====================================================
  // TOTALS
  // =====================================================

  const totalSales = useMemo(() => {
    return chartData.reduce(
      (total, item) => total + item.sales,
      0
    );
  }, [chartData]);

  const totalOrders = useMemo(() => {
    return chartData.reduce(
      (total, item) => total + item.orders,
      0
    );
  }, [chartData]);

  const averageSales = useMemo(() => {
    if (!chartData.length) {
      return 0;
    }

    return totalSales / chartData.length;
  }, [chartData, totalSales]);

  // =====================================================
  // TREND
  // =====================================================

  const trend = useMemo(() => {
    if (chartData.length < 2) {
      return {
        percentage: 0,
        direction: "neutral"
      };
    }

    const previous =
      chartData[chartData.length - 2]?.sales || 0;

    const current =
      chartData[chartData.length - 1]?.sales || 0;

    if (previous === 0) {
      if (current > 0) {
        return {
          percentage: 100,
          direction: "up"
        };
      }

      return {
        percentage: 0,
        direction: "neutral"
      };
    }

    const percentage =
      ((current - previous) / previous) * 100;

    return {
      percentage: Math.abs(percentage),
      direction:
        percentage > 0
          ? "up"
          : percentage < 0
            ? "down"
            : "neutral"
    };
  }, [chartData]);

  // =====================================================
  // MAX SALES
  // =====================================================

  const maxSales = useMemo(() => {
    if (!chartData.length) {
      return 0;
    }

    return Math.max(
      ...chartData.map((item) => item.sales)
    );
  }, [chartData]);

  // =====================================================
  // FORMAT MONEY
  // =====================================================

  const money = (value) => {
    const parsed = Number(value);

    if (!Number.isFinite(parsed)) {
      return "$0.00";
    }

    return `$${parsed.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
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
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="sales-trend-card">

        <div className="sales-trend-header">

          <div>
            <span className="sales-trend-label">
              SALES ANALYTICS
            </span>

            <h2>
              Sales Trend
            </h2>
          </div>

          <FaChartLine />

        </div>

        <div className="sales-trend-loading">

          <div className="sales-trend-spinner">
            <FaSyncAlt />
          </div>

          <p>
            Loading sales data...
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
      <div className="sales-trend-card">

        <div className="sales-trend-header">

          <div>
            <span className="sales-trend-label">
              SALES ANALYTICS
            </span>

            <h2>
              Sales Trend
            </h2>
          </div>

          <FaChartLine />

        </div>

        <div className="sales-trend-error">

          <FaExclamationTriangle />

          <div>

            <strong>
              Unable to load sales data
            </strong>

            <p>
              {error}
            </p>

            <button
              type="button"
              onClick={loadSalesTrend}
            >
              Try Again
            </button>

          </div>

        </div>

      </div>
    );
  }

  // =====================================================
  // MAIN
  // =====================================================

  return (
    <div className="sales-trend-card">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="sales-trend-header">

        <div>

          <span className="sales-trend-label">
            SALES ANALYTICS
          </span>

          <h2>
            Sales Trend
          </h2>

          <p>
            Track your business sales performance over time.
          </p>

        </div>

        <div className="sales-trend-header-actions">

          <select
            value={period}
            onChange={(event) =>
              setPeriod(event.target.value)
            }
          >

            <option value="3months">
              Last 3 Months
            </option>

            <option value="6months">
              Last 6 Months
            </option>

            <option value="12months">
              Last 12 Months
            </option>

            <option value="year">
              This Year
            </option>

          </select>

          <button
            type="button"
            className="sales-trend-refresh"
            onClick={handleRefresh}
            disabled={refreshing}
            title="Refresh sales trend"
          >

            <FaSyncAlt
              className={
                refreshing
                  ? "sales-trend-spin"
                  : ""
              }
            />

          </button>

        </div>

      </div>

      {/* =================================================
          SUMMARY
      ================================================= */}

      <div className="sales-trend-summary">

        <div className="sales-trend-summary-card">

          <span>
            Total Sales
          </span>

          <strong>
            {money(totalSales)}
          </strong>

        </div>

        <div className="sales-trend-summary-card">

          <span>
            Total Orders
          </span>

          <strong>
            {number(totalOrders)}
          </strong>

        </div>

        <div className="sales-trend-summary-card">

          <span>
            Average Period Sales
          </span>

          <strong>
            {money(averageSales)}
          </strong>

        </div>

        <div className="sales-trend-summary-card">

          <span>
            Trend
          </span>

          <strong
            className={`sales-trend-percentage ${trend.direction}`}
          >

            {trend.direction === "up" && (
              <FaArrowUp />
            )}

            {trend.direction === "down" && (
              <FaArrowDown />
            )}

            {trend.direction === "neutral" && (
              "—"
            )}

            {trend.direction !== "neutral" &&
              `${trend.percentage.toFixed(1)}%`
            }

          </strong>

        </div>

      </div>

      {/* =================================================
          CHART
      ================================================= */}

      {chartData.length === 0 ? (

        <div className="sales-trend-empty">

          <FaChartLine />

          <h3>
            No sales data yet
          </h3>

          <p>
            Sales performance will appear here once
            your business starts recording sales.
          </p>

        </div>

      ) : (

        <div className="sales-trend-chart">

          {/* Y AXIS */}

          <div className="sales-trend-y-axis">

            <span>
              {money(maxSales)}
            </span>

            <span>
              {money(maxSales * 0.75)}
            </span>

            <span>
              {money(maxSales * 0.5)}
            </span>

            <span>
              {money(maxSales * 0.25)}
            </span>

            <span>
              $0
            </span>

          </div>

          {/* CHART AREA */}

          <div className="sales-trend-chart-area">

            <div className="sales-trend-grid-lines">

              <span />
              <span />
              <span />
              <span />
              <span />

            </div>

            <div className="sales-trend-bars">

              {chartData.map((item, index) => {

                const height =
                  maxSales > 0
                    ? (item.sales / maxSales) * 100
                    : 0;

                return (
                  <div
                    className="sales-trend-bar-wrapper"
                    key={`${item.label}-${index}`}
                  >

                    <div className="sales-trend-tooltip">

                      <strong>
                        {money(item.sales)}
                      </strong>

                      <span>
                        {number(item.orders)} orders
                      </span>

                    </div>

                    <div
                      className="sales-trend-bar"
                      style={{
                        height: `${Math.max(
                          height,
                          item.sales > 0 ? 3 : 0
                        )}%`
                      }}
                    />

                    <span className="sales-trend-bar-label">
                      {item.label}
                    </span>

                  </div>
                );
              })}

            </div>

          </div>

        </div>

      )}

      {/* =================================================
          FOOTER
      ================================================= */}

      {chartData.length > 0 && (

        <div className="sales-trend-footer">

          <span>
            Sales performance
          </span>

          <strong>
            {trend.direction === "up"
              ? "Sales are increasing"
              : trend.direction === "down"
                ? "Sales are decreasing"
                : "Sales are stable"}
          </strong>

        </div>

      )}

    </div>
  );
}

export default SalesTrend;