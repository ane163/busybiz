import { useMemo } from "react";
import {
  FaMoneyBillWave,
  FaArrowUp,
  FaArrowDown,
  FaMinus,
  FaChartLine
} from "react-icons/fa";

import "./RevenueOverview.css";

function RevenueOverview({
  data = [],
  loading = false,
  title = "Revenue Overview",
  subtitle = "Track your business revenue performance"
}) {
  const normalizedData = useMemo(() => {
    if (!Array.isArray(data)) {
      return [];
    }

    return data.map((item, index) => {
      const revenue =
        Number(
          item?.revenue ??
          item?.totalRevenue ??
          item?.amount ??
          item?.sales ??
          0
        ) || 0;

      const expenses =
        Number(
          item?.expenses ??
          item?.totalExpenses ??
          item?.expense ??
          0
        ) || 0;

      const profit =
        Number(
          item?.profit ??
          item?.netProfit ??
          revenue - expenses
        ) || 0;

      const growth =
        Number(
          item?.growth ??
          item?.growthPercentage ??
          item?.change ??
          0
        ) || 0;

      return {
        id:
          item?._id ??
          item?.id ??
          `${item?.month || item?.label || "period"}-${index}`,

        label:
          item?.month ??
          item?.label ??
          item?.period ??
          item?.date ??
          `Period ${index + 1}`,

        revenue,
        expenses,
        profit,
        growth
      };
    });
  }, [data]);

  const totals = useMemo(() => {
    return normalizedData.reduce(
      (result, item) => {
        result.revenue += item.revenue;
        result.expenses += item.expenses;
        result.profit += item.profit;

        return result;
      },
      {
        revenue: 0,
        expenses: 0,
        profit: 0
      }
    );
  }, [normalizedData]);

  const averageRevenue = useMemo(() => {
    if (!normalizedData.length) {
      return 0;
    }

    return totals.revenue / normalizedData.length;
  }, [normalizedData, totals.revenue]);

  const latestGrowth = useMemo(() => {
    if (!normalizedData.length) {
      return 0;
    }

    return normalizedData[normalizedData.length - 1]?.growth || 0;
  }, [normalizedData]);

  const formatMoney = (value) => {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return "0.00";
    }

    return number.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const formatNumber = (value) => {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return "0";
    }

    return number.toLocaleString();
  };

  const getGrowthClass = (value) => {
    if (value > 0) {
      return "positive";
    }

    if (value < 0) {
      return "negative";
    }

    return "neutral";
  };

  const getGrowthIcon = (value) => {
    if (value > 0) {
      return <FaArrowUp />;
    }

    if (value < 0) {
      return <FaArrowDown />;
    }

    return <FaMinus />;
  };

  if (loading) {
    return (
      <section className="revenue-overview">

        <div className="revenue-overview-header">

          <div>
            <span className="revenue-overview-label">
              FINANCIAL PERFORMANCE
            </span>

            <h2>
              {title}
            </h2>

            <p>
              {subtitle}
            </p>
          </div>

        </div>

        <div className="revenue-overview-loading">

          <div className="revenue-overview-loading-summary">
            <div />
            <div />
            <div />
          </div>

          <div className="revenue-overview-loading-chart" />

        </div>

      </section>
    );
  }

  return (
    <section className="revenue-overview">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="revenue-overview-header">

        <div>

          <span className="revenue-overview-label">
            FINANCIAL PERFORMANCE
          </span>

          <h2>
            {title}
          </h2>

          <p>
            {subtitle}
          </p>

        </div>

        <div className="revenue-overview-header-icon">
          <FaChartLine />
        </div>

      </div>


      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

      <div className="revenue-overview-summary">

        <div className="revenue-overview-summary-card">

          <div className="revenue-overview-summary-icon">
            <FaMoneyBillWave />
          </div>

          <div>

            <span>
              Total Revenue
            </span>

            <strong>
              ${formatMoney(totals.revenue)}
            </strong>

          </div>

        </div>


        <div className="revenue-overview-summary-card">

          <div className="revenue-overview-summary-icon">
            <FaMoneyBillWave />
          </div>

          <div>

            <span>
              Total Expenses
            </span>

            <strong>
              ${formatMoney(totals.expenses)}
            </strong>

          </div>

        </div>


        <div className="revenue-overview-summary-card revenue-overview-profit">

          <div className="revenue-overview-summary-icon">
            <FaChartLine />
          </div>

          <div>

            <span>
              Net Profit
            </span>

            <strong>
              ${formatMoney(totals.profit)}
            </strong>

          </div>

        </div>

      </div>


      {/* =====================================================
          PERIOD DATA
      ===================================================== */}

      {normalizedData.length === 0 ? (

        <div className="revenue-overview-empty">

          <div className="revenue-overview-empty-icon">
            <FaMoneyBillWave />
          </div>

          <h3>
            No revenue data yet
          </h3>

          <p>
            Revenue performance will appear here
            once your business starts recording transactions.
          </p>

        </div>

      ) : (

        <div className="revenue-overview-table-wrapper">

          <div className="revenue-overview-table">

            {/* TABLE HEADER */}

            <div className="revenue-overview-row revenue-overview-row-header">

              <span>
                Period
              </span>

              <span>
                Revenue
              </span>

              <span>
                Expenses
              </span>

              <span>
                Profit
              </span>

              <span>
                Growth
              </span>

            </div>


            {/* TABLE ROWS */}

            {normalizedData.map((item) => (

              <div
                className="revenue-overview-row"
                key={item.id}
              >

                <strong>
                  {item.label}
                </strong>

                <span className="revenue-value">
                  ${formatMoney(item.revenue)}
                </span>

                <span className="expense-value">
                  ${formatMoney(item.expenses)}
                </span>

                <span
                  className={
                    item.profit >= 0
                      ? "profit-value positive"
                      : "profit-value negative"
                  }
                >
                  ${formatMoney(item.profit)}
                </span>

                <span
                  className={`revenue-growth ${getGrowthClass(
                    item.growth
                  )}`}
                >

                  {getGrowthIcon(item.growth)}

                  {Math.abs(item.growth).toFixed(1)}%

                </span>

              </div>

            ))}

          </div>

        </div>

      )}


      {/* =====================================================
          FOOTER
      ===================================================== */}

      {normalizedData.length > 0 && (

        <div className="revenue-overview-footer">

          <div>

            <span>
              Average Revenue
            </span>

            <strong>
              ${formatMoney(averageRevenue)}
            </strong>

          </div>

          <div>

            <span>
              Latest Growth
            </span>

            <strong
              className={getGrowthClass(latestGrowth)}
            >

              {getGrowthIcon(latestGrowth)}

              {Math.abs(latestGrowth).toFixed(1)}%

            </strong>

          </div>

          <div>

            <span>
              Periods
            </span>

            <strong>
              {formatNumber(normalizedData.length)}
            </strong>

          </div>

        </div>

      )}

    </section>
  );
}

export default RevenueOverview;