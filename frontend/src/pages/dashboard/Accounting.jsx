import { useEffect, useState } from "react";
import api from "../../services/api";
import "./accounting.css";

function Accounting() {
  const [summary, setSummary] = useState(null);
  const [profitLoss, setProfitLoss] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [monthly, setMonthly] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAccounting();
  }, []);

  const loadAccounting = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        summaryResponse,
        profitLossResponse,
        expensesResponse,
        monthlyResponse
      ] = await Promise.all([
        api.get("/accounting/summary"),
        api.get("/accounting/profit-loss"),
        api.get("/accounting/expense-breakdown"),
        api.get("/accounting/monthly")
      ]);

      setSummary(summaryResponse.data);
      setProfitLoss(profitLossResponse.data);
      setExpenses(expensesResponse.data);
      setMonthly(monthlyResponse.data);

    } catch (error) {
      console.error("ACCOUNTING PAGE ERROR:", error);

      setError(
        error.response?.data?.message ||
        "Unable to load accounting information."
      );
    } finally {
      setLoading(false);
    }
  };

  const money = (value) =>
    Number(value || 0).toFixed(2);

  if (loading) {
    return (
      <div className="accounting-page">
        <div className="accounting-loading">
          <h2>Loading Accounting...</h2>
          <p>Calculating your business finances.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="accounting-page">

      {/* HEADER */}
      <header className="accounting-header">
        <div>
          <h1 className="accounting-title">
            Accounting
          </h1>

          <p className="accounting-subtitle">
            Monitor revenue, expenses and profit.
          </p>
        </div>

        <button
          className="accounting-refresh-button"
          onClick={loadAccounting}
        >
          Refresh
        </button>
      </header>


      {/* ERROR */}
      {error && (
        <div className="accounting-error">
          <p>{error}</p>

          <button
            className="accounting-button"
            onClick={loadAccounting}
          >
            Try Again
          </button>
        </div>
      )}


      {/* FINANCIAL CARDS */}
      {summary && (
        <section className="accounting-section">

          <div className="accounting-section-header">
            <h2>Financial Overview</h2>
          </div>

          <div className="accounting-card-grid">

            <div className="accounting-card">
              <span className="accounting-card-label">
                Order Revenue
              </span>

              <strong className="accounting-card-value">
                ${money(summary.revenue?.orders)}
              </strong>
            </div>


            <div className="accounting-card">
              <span className="accounting-card-label">
                Invoice Revenue
              </span>

              <strong className="accounting-card-value">
                ${money(summary.revenue?.invoices)}
              </strong>
            </div>


            <div className="accounting-card">
              <span className="accounting-card-label">
                Total Revenue
              </span>

              <strong className="accounting-card-value">
                ${money(summary.revenue?.total)}
              </strong>
            </div>


            <div className="accounting-card">
              <span className="accounting-card-label">
                Expenses
              </span>

              <strong className="accounting-card-value">
                ${money(summary.expenses?.total)}
              </strong>
            </div>


            <div className="accounting-card">
              <span className="accounting-card-label">
                Net Profit
              </span>

              <strong className="accounting-card-value">
                ${money(summary.profit?.net)}
              </strong>
            </div>


            <div className="accounting-card">
              <span className="accounting-card-label">
                Profit Margin
              </span>

              <strong className="accounting-card-value">
                {money(summary.profit?.margin)}%
              </strong>
            </div>

          </div>
        </section>
      )}


      {/* OUTSTANDING */}
      {summary && (
        <section className="accounting-section">

          <div className="accounting-section-header">
            <h2>Outstanding Invoices</h2>
          </div>

          <div className="accounting-outstanding-card">

            <div>
              <span className="accounting-card-label">
                Outstanding Invoices
              </span>

              <strong className="accounting-large-value">
                {summary.outstanding?.invoices || 0}
              </strong>
            </div>

            <div>
              <span className="accounting-card-label">
                Outstanding Amount
              </span>

              <strong className="accounting-large-value">
                ${money(summary.outstanding?.amount)}
              </strong>
            </div>

          </div>
        </section>
      )}


      {/* PROFIT & LOSS */}
      {profitLoss && (
        <section className="accounting-section">

          <div className="accounting-section-header">
            <h2>Profit & Loss</h2>

            <span className="accounting-period">
              {profitLoss.period}
            </span>
          </div>

          <div className="accounting-profit-card">

            <div className="accounting-profit-row">
              <span>Revenue</span>
              <strong>
                ${money(profitLoss.revenue)}
              </strong>
            </div>

            <div className="accounting-profit-row">
              <span>Expenses</span>
              <strong>
                ${money(profitLoss.expenses)}
              </strong>
            </div>

            <div className="accounting-profit-row accounting-profit-total">
              <span>Net Profit</span>
              <strong>
                ${money(profitLoss.profit)}
              </strong>
            </div>

            <div className="accounting-profit-row">
              <span>Profit Margin</span>
              <strong>
                {money(profitLoss.profitMargin)}%
              </strong>
            </div>

          </div>
        </section>
      )}


      {/* EXPENSE BREAKDOWN */}
      <section className="accounting-section">

        <div className="accounting-section-header">
          <h2>Expense Breakdown</h2>
        </div>

        {expenses.length === 0 ? (
          <div className="accounting-empty">
            <p>No expenses recorded yet.</p>
          </div>
        ) : (
          <div className="accounting-table-container">

            <table className="accounting-table">

              <thead>
                <tr>
                  <th>Category</th>
                  <th>Amount</th>
                </tr>
              </thead>

              <tbody>

                {expenses.map((expense) => (
                  <tr key={expense.category}>

                    <td>
                      {expense.category}
                    </td>

                    <td>
                      ${money(expense.amount)}
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>
        )}

      </section>


      {/* MONTHLY ACCOUNTING */}
      <section className="accounting-section">

        <div className="accounting-section-header">
          <h2>Monthly Performance</h2>
        </div>

        {monthly.length === 0 ? (
          <div className="accounting-empty">
            <p>No monthly accounting data available.</p>
          </div>
        ) : (
          <div className="accounting-table-container">

            <table className="accounting-table">

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
                      ${money(month.revenue)}
                    </td>

                    <td>
                      ${money(month.expenses)}
                    </td>

                    <td>
                      ${money(month.profit)}
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

export default Accounting;
