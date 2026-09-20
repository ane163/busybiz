import { useEffect, useMemo, useState } from "react";
import {
  FaMoneyBillWave,
  FaChartPie,
  FaSyncAlt,
  FaExclamationTriangle
} from "react-icons/fa";

import api from "../services/api";
import "./ExpenseBreakdown.css";

function ExpenseBreakdown() {
  const [expenses, setExpenses] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // LOAD EXPENSE BREAKDOWN
  // =====================================================

  const loadExpenses = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/finance/expense-breakdown");

      const data = response?.data || {};

      /*
        Supported backend formats:

        {
          expenses: [],
          total: 5000
        }

        OR

        {
          data: [],
          totalExpenses: 5000
        }

        OR

        [
          {
            category: "Rent",
            amount: 1000
          }
        ]
      */

      let expenseData = [];
      let total = 0;

      if (Array.isArray(data)) {
        expenseData = data;
      } else if (Array.isArray(data.expenses)) {
        expenseData = data.expenses;
      } else if (Array.isArray(data.data)) {
        expenseData = data.data;
      } else if (Array.isArray(data.breakdown)) {
        expenseData = data.breakdown;
      }

      total =
        Number(
          data.totalExpenses ??
          data.total ??
          data.amount ??
          0
        ) || 0;

      /*
        If backend does not provide total,
        calculate it from categories.
      */

      if (!total && expenseData.length > 0) {
        total = expenseData.reduce((sum, item) => {
          return (
            sum +
            Number(
              item?.amount ??
              item?.total ??
              item?.value ??
              item?.expenses ??
              0
            )
          );
        }, 0);
      }

      setExpenses(expenseData);
      setTotalExpenses(total);

    } catch (err) {
      console.error(
        "EXPENSE BREAKDOWN ERROR:",
        err
      );

      setExpenses([]);
      setTotalExpenses(0);

      setError(
        err?.response?.data?.message ||
        "Unable to load expense breakdown."
      );

    } finally {
      setLoading(false);
    }
  };


  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadExpenses();
  }, []);


  // =====================================================
  // REFRESH
  // =====================================================

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadExpenses();
    } finally {
      setRefreshing(false);
    }
  };


  // =====================================================
  // NORMALIZE EXPENSE DATA
  // =====================================================

  const normalizedExpenses = useMemo(() => {
    return expenses
      .map((item, index) => {
        const amount =
          Number(
            item?.amount ??
            item?.total ??
            item?.value ??
            item?.expenses ??
            0
          ) || 0;

        const category =
          item?.category ||
          item?.name ||
          item?.type ||
          item?.expenseCategory ||
          "Other";

        return {
          id:
            item?._id ||
            item?.id ||
            `${category}-${index}`,

          category,

          amount
        };
      })
      .filter((item) => item.amount > 0)
      .sort((a, b) => b.amount - a.amount);
  }, [expenses]);


  // =====================================================
  // CALCULATE TOTAL
  // =====================================================

  const calculatedTotal = useMemo(() => {
    if (totalExpenses > 0) {
      return totalExpenses;
    }

    return normalizedExpenses.reduce(
      (sum, item) => sum + item.amount,
      0
    );
  }, [totalExpenses, normalizedExpenses]);


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
  // PERCENTAGE
  // =====================================================

  const percentage = (amount) => {
    if (!calculatedTotal) {
      return 0;
    }

    return Math.min(
      100,
      Math.max(
        0,
        (amount / calculatedTotal) * 100
      )
    );
  };


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <section className="expense-breakdown">

        <div className="expense-breakdown-header">

          <div>
            <span className="expense-breakdown-label">
              EXPENSES
            </span>

            <h2>
              Expense Breakdown
            </h2>
          </div>

        </div>

        <div className="expense-breakdown-loading">

          <FaSyncAlt className="expense-breakdown-spin" />

          <span>
            Loading expenses...
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
      <section className="expense-breakdown">

        <div className="expense-breakdown-header">

          <div>
            <span className="expense-breakdown-label">
              EXPENSES
            </span>

            <h2>
              Expense Breakdown
            </h2>
          </div>

          <button
            type="button"
            className="expense-breakdown-refresh"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <FaSyncAlt
              className={
                refreshing
                  ? "expense-breakdown-spin"
                  : ""
              }
            />
          </button>

        </div>

        <div className="expense-breakdown-error">

          <FaExclamationTriangle />

          <div>
            <strong>
              Unable to load expenses
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
  // MAIN COMPONENT
  // =====================================================

  return (
    <section className="expense-breakdown">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="expense-breakdown-header">

        <div>

          <span className="expense-breakdown-label">
            EXPENSES
          </span>

          <h2>
            Expense Breakdown
          </h2>

          <p>
            See where your business money is being spent.
          </p>

        </div>

        <button
          type="button"
          className="expense-breakdown-refresh"
          onClick={handleRefresh}
          disabled={refreshing}
          title="Refresh expenses"
          aria-label="Refresh expenses"
        >

          <FaSyncAlt
            className={
              refreshing
                ? "expense-breakdown-spin"
                : ""
            }
          />

        </button>

      </div>


      {/* =================================================
          TOTAL
      ================================================= */}

      <div className="expense-breakdown-total">

        <div className="expense-breakdown-total-icon">
          <FaMoneyBillWave />
        </div>

        <div>

          <span>
            TOTAL EXPENSES
          </span>

          <strong>
            ${money(calculatedTotal)}
          </strong>

        </div>

      </div>


      {/* =================================================
          EMPTY STATE
      ================================================= */}

      {normalizedExpenses.length === 0 ? (

        <div className="expense-breakdown-empty">

          <div className="expense-breakdown-empty-icon">
            <FaChartPie />
          </div>

          <h3>
            No expenses recorded
          </h3>

          <p>
            Your expense categories will appear here
            once expenses are recorded.
          </p>

        </div>

      ) : (

        <div className="expense-breakdown-content">

          {/* =================================================
              CATEGORY LIST
          ================================================= */}

          <div className="expense-breakdown-list">

            {normalizedExpenses.map((item) => {

              const percent =
                percentage(item.amount);

              return (
                <div
                  className="expense-breakdown-item"
                  key={item.id}
                >

                  <div className="expense-breakdown-item-top">

                    <div className="expense-breakdown-category">

                      <span className="expense-breakdown-dot" />

                      <strong>
                        {item.category}
                      </strong>

                    </div>

                    <div className="expense-breakdown-amount">

                      <strong>
                        ${money(item.amount)}
                      </strong>

                      <span>
                        {percent.toFixed(1)}%
                      </span>

                    </div>

                  </div>


                  <div className="expense-breakdown-bar">

                    <div
                      className="expense-breakdown-bar-fill"
                      style={{
                        width: `${percent}%`
                      }}
                    />

                  </div>

                </div>
              );
            })}

          </div>


          {/* =================================================
              SUMMARY
          ================================================= */}

          <div className="expense-breakdown-summary">

            <div className="expense-breakdown-summary-header">

              <div>

                <span>
                  EXPENSE SUMMARY
                </span>

                <h3>
                  Spending Distribution
                </h3>

              </div>

              <FaChartPie />

            </div>


            <div className="expense-breakdown-summary-total">

              <span>
                Total spending
              </span>

              <strong>
                ${money(calculatedTotal)}
              </strong>

            </div>


            <div className="expense-breakdown-summary-stats">

              <div>

                <span>
                  Categories
                </span>

                <strong>
                  {normalizedExpenses.length}
                </strong>

              </div>

              <div>

                <span>
                  Largest Expense
                </span>

                <strong>
                  {normalizedExpenses[0]?.category || "—"}
                </strong>

              </div>

            </div>

          </div>

        </div>

      )}

    </section>
  );
}

export default ExpenseBreakdown;