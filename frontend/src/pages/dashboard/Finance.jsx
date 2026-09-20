import { useEffect, useState } from "react";
import api from "../../services/api";
import "./Finance.css";

function Finance() {
  const [summary, setSummary] = useState(null);
  const [profitLoss, setProfitLoss] = useState(null);
  const [expenseBreakdown, setExpenseBreakdown] = useState([]);
  const [monthly, setMonthly] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadFinance();
  }, []);

  const loadFinance = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        summaryResponse,
        profitLossResponse,
        expenseResponse,
        monthlyResponse
      ] = await Promise.all([
        api.get("/finance/summary"),
        api.get("/finance/profit-loss"),
        api.get("/finance/expense-breakdown"),
        api.get("/finance/monthly")
      ]);

      setSummary(summaryResponse.data);
      setProfitLoss(profitLossResponse.data);
      setExpenseBreakdown(expenseResponse.data);
      setMonthly(monthlyResponse.data);

    } catch (error) {
      console.error("FINANCE ERROR:", error);

      setError(
        error.response?.data?.message ||
        "Unable to load financial information."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="finance-page">
        <div className="finance-loading">
          Loading financial information...
        </div>
      </div>
    );
  }

  return (
    <div className="finance-page">

      {/* HEADER */}
      <div className="finance-header">
        <div>
          <h1 className="finance-title">
            Finance
          </h1>

          <p className="finance-subtitle">
            Monitor your business revenue, expenses and profitability.
          </p>
        </div>

        <button
          className="finance-refresh-button"
          onClick={loadFinance}
        >
          Refresh
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="finance-error">
          <strong>Finance Error</strong>
          <p>{error}</p>

          <button onClick={loadFinance}>
            Try Again
          </button>
        </div>
      )}

      {/* SUMMARY CARDS */}
      {summary && (
        <section className="finance-section">

          <h2 className="finance-section-title">
            Financial Overview
          </h2>

          <div className="finance-card-grid">

            <div className="finance-card">
              <span className="finance-card-label">
                Total Revenue
              </span>

              <strong className="finance-card-value">
                ${summary.revenue?.total?.toFixed(2)}
              </strong>

              <span className="finance-card-description">
                Orders + invoices
              </span>
            </div>

            <div className="finance-card">
              <span className="finance-card-label">
                Total Expenses
              </span>

              <strong className="finance-card-value">
                ${summary.expenses?.total?.toFixed(2)}
              </strong>

              <span className="finance-card-description">
                Business expenses
              </span>
            </div>

            <div className="finance-card finance-card-profit">
              <span className="finance-card-label">
                Net Profit
              </span>

              <strong className="finance-card-value">
                ${summary.profit?.net?.toFixed(2)}
              </strong>

              <span className="finance-card-description">
                After expenses
              </span>
            </div>

            <div className="finance-card">
              <span className="finance-card-label">
                Profit Margin
              </span>

              <strong className="finance-card-value">
                {summary.profit?.margin?.toFixed(2)}%
              </strong>

              <span className="finance-card-description">
                Business profitability
              </span>
            </div>

          </div>
        </section>
      )}

      {/* REVENUE BREAKDOWN */}
      {summary && (
        <section className="finance-section">

          <h2 className="finance-section-title">
            Revenue Breakdown
          </h2>

          <div className="finance-breakdown-grid">

            <div className="finance-breakdown-card">
              <span>Order Revenue</span>

              <strong>
                ${summary.revenue?.orders?.toFixed(2)}
              </strong>
            </div>

            <div className="finance-breakdown-card">
              <span>Invoice Revenue</span>

              <strong>
                ${summary.revenue?.invoices?.toFixed(2)}
              </strong>
            </div>

            <div className="finance-breakdown-card">
              <span>Outstanding Invoices</span>

              <strong>
                ${summary.outstanding?.amount?.toFixed(2)}
              </strong>

              <small>
                {summary.outstanding?.invoices || 0} invoice(s)
              </small>
            </div>

          </div>
        </section>
      )}

      {/* PROFIT AND LOSS */}
      {profitLoss && (
        <section className="finance-section">

          <h2 className="finance-section-title">
            Profit & Loss
          </h2>

          <div className="finance-profit-panel">

            <div>
              <span>Revenue</span>
              <strong>
                ${profitLoss.revenue?.toFixed(2)}
              </strong>
            </div>

            <div>
              <span>Expenses</span>
              <strong>
                ${profitLoss.expenses?.toFixed(2)}
              </strong>
            </div>

            <div>
              <span>Profit</span>
              <strong>
                ${profitLoss.profit?.toFixed(2)}
              </strong>
            </div>

            <div>
              <span>Profit Margin</span>
              <strong>
                {profitLoss.profitMargin?.toFixed(2)}%
              </strong>
            </div>

          </div>
        </section>
      )}

      {/* EXPENSE BREAKDOWN */}
      <section className="finance-section">

        <h2 className="finance-section-title">
          Expense Breakdown
        </h2>

        {expenseBreakdown.length === 0 ? (
          <div className="finance-empty">
            No expenses recorded yet.
          </div>
        ) : (
          <div className="finance-table-wrapper">

            <table className="finance-table">

              <thead>
                <tr>
                  <th>Category</th>
                  <th>Amount</th>
                </tr>
              </thead>

              <tbody>

                {expenseBreakdown.map(
                  (expense, index) => (
                    <tr key={index}>
                      <td>
                        {expense.category}
                      </td>

                      <td>
                        ${expense.amount?.toFixed(2)}
                      </td>
                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>
        )}
      </section>

      {/* MONTHLY FINANCIAL PERFORMANCE */}
      <section className="finance-section">

        <h2 className="finance-section-title">
          Monthly Performance
        </h2>

        {monthly.length === 0 ? (
          <div className="finance-empty">
            No monthly financial data available yet.
          </div>
        ) : (
          <div className="finance-table-wrapper">

            <table className="finance-table">

              <thead>
                <tr>
                  <th>Month</th>
                  <th>Revenue</th>
                  <th>Expenses</th>
                  <th>Profit</th>
                </tr>
              </thead>

              <tbody>

                {monthly.map((month) => (
                  <tr key={month.month}>

                    <td>
                      {month.month}
                    </td>

                    <td>
                      ${month.revenue?.toFixed(2)}
                    </td>

                    <td>
                      ${month.expenses?.toFixed(2)}
                    </td>

                    <td>
                      ${month.profit?.toFixed(2)}
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>
        )}

      </section>

    </div>
  );
}

export default Finance;