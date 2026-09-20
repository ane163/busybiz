import React, { useState } from "react";

const CurrentPlan = ({
  subscription,
  onUpdated,
}) => {
  const [cancelling, setCancelling] = useState(false);

  if (!subscription) {
    return null;
  }

  const token = localStorage.getItem("token");

  const cancelSubscription = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel your subscription? You will keep access until the end of your billing period."
    );

    if (!confirmed) return;

    try {
      setCancelling(true);

      const response = await fetch(
        "http://localhost:5000/api/subscriptions/cancel",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Unable to cancel subscription.");
        return;
      }

      alert(data.message);

      onUpdated();
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    } finally {
      setCancelling(false);
    }
  };

  const reactivateSubscription = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/subscriptions/reactivate",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Unable to reactivate subscription.");
        return;
      }

      alert(data.message);

      onUpdated();
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    }
  };

  const planName =
    subscription.plan === "professional"
      ? "Professional"
      : subscription.plan === "starter"
      ? "Starter"
      : "Free";

  return (
    <section className="current-plan-section">

      <div className="section-title">
        <h2>Current Plan</h2>
        <p>Your active BusyBiz subscription</p>
      </div>

      <div className="current-plan-card">

        <div className="current-plan-main">

          <div className="plan-badge">
            {planName}
          </div>

          <h3>{planName} Plan</h3>

          <p className="plan-status">
            Status:
            <span className={`status-${subscription.status}`}>
              {subscription.status}
            </span>
          </p>

          {subscription.status === "trial" &&
            subscription.daysRemaining !== undefined && (
              <p className="trial-message">
                {subscription.daysRemaining} days
                remaining in your free trial.
              </p>
            )}

          {subscription.price !== undefined &&
            subscription.plan !== "free" && (
              <div className="current-price">
                ${subscription.price}
                <span>
                  / {subscription.billingCycle}
                </span>
              </div>
            )}

          {subscription.plan === "free" && (
            <div className="current-price">
              $0
              <span>/ month</span>
            </div>
          )}

        </div>

        <div className="current-plan-details">

          <div className="billing-detail">
            <span>Billing cycle</span>
            <strong>
              {subscription.billingCycle || "Monthly"}
            </strong>
          </div>

          <div className="billing-detail">
            <span>Auto renewal</span>
            <strong>
              {subscription.autoRenew
                ? "Enabled"
                : "Disabled"}
            </strong>
          </div>

          <div className="billing-detail">
            <span>Next billing</span>
            <strong>
              {subscription.nextBillingDate
                ? new Date(
                    subscription.nextBillingDate
                  ).toLocaleDateString()
                : "—"}
            </strong>
          </div>

        </div>

        {subscription.plan !== "free" && (
          <div className="subscription-actions">

            {subscription.cancelAtPeriodEnd ? (
              <button
                className="reactivate-button"
                onClick={reactivateSubscription}
              >
                Reactivate Subscription
              </button>
            ) : (
              <button
                className="cancel-button"
                onClick={cancelSubscription}
                disabled={cancelling}
              >
                {cancelling
                  ? "Cancelling..."
                  : "Cancel Subscription"}
              </button>
            )}

          </div>
        )}

      </div>

    </section>
  );
};

export default CurrentPlan;