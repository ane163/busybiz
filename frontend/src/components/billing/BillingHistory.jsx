import React, { useEffect, useState } from "react";

const BillingHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please log in again.");
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/payments",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load payment history."
        );
      }

      setPayments(data.payments || []);
    } catch (err) {
      console.error("BILLING HISTORY ERROR:", err);

      setError(
        err.message || "Unable to load billing history."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );
  };

  const formatAmount = (amount, currency = "USD") => {
    const numericAmount = Number(amount || 0);

    return `${currency} ${numericAmount.toFixed(2)}`;
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "paid":
        return "payment-status paid";

      case "pending":
        return "payment-status pending";

      case "failed":
        return "payment-status failed";

      case "cancelled":
        return "payment-status cancelled";

      default:
        return "payment-status";
    }
  };

  const getStatusText = (status) => {
    if (!status) return "Unknown";

    return (
      status.charAt(0).toUpperCase() +
      status.slice(1)
    );
  };

  if (loading) {
    return (
      <section className="billing-history">
        <div className="billing-section-header">
          <div>
            <h2>Billing History</h2>
            <p>
              View your previous subscription payments.
            </p>
          </div>
        </div>

        <div className="billing-loading">
          Loading payment history...
        </div>
      </section>
    );
  }

  return (
    <section className="billing-history">
      <div className="billing-section-header">
        <div>
          <h2>Billing History</h2>

          <p>
            View your previous subscription payments.
          </p>
        </div>

        <button
          type="button"
          className="billing-refresh-btn"
          onClick={fetchPayments}
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="billing-error">
          {error}
        </div>
      )}

      {!error && payments.length === 0 && (
        <div className="billing-empty">
          <div className="billing-empty-icon">
            $
          </div>

          <h3>No payments yet</h3>

          <p>
            Your subscription payment history
            will appear here after you make a
            payment.
          </p>
        </div>
      )}

      {payments.length > 0 && (
        <div className="billing-table-wrapper">
          <table className="billing-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Plan</th>
                <th>Billing Cycle</th>
                <th>Amount</th>
                <th>Provider</th>
                <th>Transaction</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {payments.map((payment) => (
                <tr key={payment._id}>
                  <td>
                    {formatDate(
                      payment.createdAt
                    )}
                  </td>

                  <td>
                    <span className="billing-plan">
                      {payment.plan
                        ? payment.plan
                            .charAt(0)
                            .toUpperCase() +
                          payment.plan.slice(1)
                        : "—"}
                    </span>
                  </td>

                  <td>
                    {payment.billingCycle
                      ? payment.billingCycle
                          .charAt(0)
                          .toUpperCase() +
                        payment.billingCycle.slice(1)
                      : "—"}
                  </td>

                  <td className="billing-amount">
                    {formatAmount(
                      payment.amount,
                      payment.currency
                    )}
                  </td>

                  <td>
                    {payment.provider
                      ? payment.provider
                          .charAt(0)
                          .toUpperCase() +
                        payment.provider.slice(1)
                      : "—"}
                  </td>

                  <td>
                    <span className="transaction-id">
                      {payment.transactionId ||
                        "—"}
                    </span>
                  </td>

                  <td>
                    <span
                      className={getStatusClass(
                        payment.status
                      )}
                    >
                      {getStatusText(
                        payment.status
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default BillingHistory;