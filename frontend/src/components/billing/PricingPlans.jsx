import React, { useState } from "react";

const PricingPlans = ({
  currentPlan,
  onUpdated,
}) => {
  const [billingCycle, setBillingCycle] =
    useState("monthly");

  const [loadingPlan, setLoadingPlan] =
    useState(null);

  const token = localStorage.getItem("token");

  const plans = [
    {
      id: "free",
      name: "Free",
      monthly: 0,
      description:
        "Perfect for getting started.",
      features: [
        "Up to 100 orders",
        "Basic products",
        "Customer management",
        "Basic dashboard",
      ],
    },

    {
      id: "starter",
      name: "Starter",
      monthly: 10,
      description:
        "For growing small businesses.",
      features: [
        "Up to 2,000 orders",
        "Inventory management",
        "Invoices",
        "Receipts",
        "Expenses",
        "Reports",
      ],
    },

    {
      id: "professional",
      name: "Professional",
      monthly: 25,
      description:
        "Everything your business needs.",
      popular: true,
      features: [
        "Unlimited orders",
        "Everything in Starter",
        "AI Business Assistant",
        "Business Health Score",
        "Sales Forecast",
        "Advanced reports",
        "Priority features",
      ],
    },
  ];

  const changePlan = async (plan) => {
    if (plan === currentPlan) {
      return;
    }

    try {
      setLoadingPlan(plan);

      const response = await fetch(
        "http://localhost:5000/api/subscriptions/plan",
        {
          method: "PUT",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            plan,
            billingCycle,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Unable to change subscription."
        );

        return;
      }

      /*
        Paid plans require payment.

        The backend creates the subscription
        as pending payment.

        The payment provider integration will
        handle the actual charge.
      */

      if (
        plan !== "free" &&
        data.subscription?.lastPaymentStatus ===
          "pending"
      ) {
        alert(
          "Plan selected. Please continue with payment to activate your billing."
        );
      } else {
        alert(data.message);
      }

      onUpdated();

    } catch (error) {
      console.error(
        "CHANGE PLAN ERROR:",
        error
      );

      alert(
        "Something went wrong while changing your plan."
      );
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <section className="pricing-section">

      <div className="pricing-header">

        <div>
          <h2>Choose Your Plan</h2>

          <p>
            Upgrade as your business grows.
          </p>
        </div>

        <div className="billing-toggle">

          <button
            className={
              billingCycle === "monthly"
                ? "active"
                : ""
            }
            onClick={() =>
              setBillingCycle("monthly")
            }
          >
            Monthly
          </button>

          <button
            className={
              billingCycle === "yearly"
                ? "active"
                : ""
            }
            onClick={() =>
              setBillingCycle("yearly")
            }
          >
            Yearly
            <span>Save 2 months</span>
          </button>

        </div>

      </div>

      <div className="pricing-grid">

        {plans.map((plan) => {

          const price =
            billingCycle === "yearly" &&
            plan.id !== "free"
              ? plan.monthly * 10
              : plan.monthly;

          const isCurrent =
            currentPlan === plan.id;

          return (
            <div
              className={`pricing-card ${
                plan.popular
                  ? "popular"
                  : ""
              } ${
                isCurrent
                  ? "current"
                  : ""
              }`}
              key={plan.id}
            >

              {plan.popular && (
                <div className="popular-label">
                  MOST POPULAR
                </div>
              )}

              <h3>{plan.name}</h3>

              <p className="pricing-description">
                {plan.description}
              </p>

              <div className="pricing-price">

                <span>$</span>
                {price}

                <small>
                  /{" "}
                  {billingCycle === "yearly"
                    ? "year"
                    : "month"}
                </small>

              </div>

              {billingCycle === "yearly" &&
                plan.id !== "free" && (
                  <p className="yearly-note">
                    2 months free
                  </p>
                )}

              <ul>
                {plan.features.map(
                  (feature) => (
                    <li key={feature}>
                      <span>✓</span>
                      {feature}
                    </li>
                  )
                )}
              </ul>

              <button
                className={
                  isCurrent
                    ? "current-plan-button"
                    : "select-plan-button"
                }
                disabled={
                  isCurrent ||
                  loadingPlan === plan.id
                }
                onClick={() =>
                  changePlan(plan.id)
                }
              >
                {loadingPlan === plan.id
                  ? "Processing..."
                  : isCurrent
                  ? "Current Plan"
                  : plan.id === "free"
                  ? "Downgrade"
                  : "Choose Plan"}
              </button>

            </div>
          );
        })}

      </div>

    </section>
  );
};

export default PricingPlans;