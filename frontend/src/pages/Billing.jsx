import { useEffect, useState } from "react";
import api from "../services/api";
import "./Billing.css";

function Billing() {
  const [subscription, setSubscription] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [changingPlan, setChangingPlan] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/subscriptions"
      );

      setSubscription(response.data);

    } catch (error) {
      console.error(
        "BILLING ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load subscription."
      );

    } finally {
      setLoading(false);
    }
  };

  const changePlan = async (plan) => {
    try {
      setChangingPlan(true);
      setError("");

      const response = await api.put(
        "/subscriptions/plan",
        {
          plan
        }
      );

      setSubscription(
        response.data.subscription
      );

    } catch (error) {
      console.error(
        "PLAN CHANGE ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to change plan."
      );

    } finally {
      setChangingPlan(false);
    }
  };

  if (loading) {
    return (
      <div>
        <h1>Plans & Billing</h1>
        <p>Loading subscription...</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Plans & Billing</h1>

      <p>
        Manage your BusyBiz subscription.
      </p>

      {error && (
        <p>{error}</p>
      )}

      <hr />

      {subscription && (
        <div>
          <h2>
            Current Subscription
          </h2>

          <p>
            Plan:{" "}
            <strong>
              {subscription.plan}
            </strong>
          </p>

          <p>
            Status:{" "}
            <strong>
              {subscription.status}
            </strong>
          </p>

          {subscription.trialEnd && (
            <p>
              Trial ends:{" "}
              {new Date(
                subscription.trialEnd
              ).toLocaleDateString()}
            </p>
          )}
        </div>
      )}

      <hr />

      <h2>Choose a Plan</h2>

      <div>

        {/* FREE */}
        <div>
          <h3>Free</h3>

          <h2>$0 / month</h2>

          <ul>
            <li>Basic dashboard</li>
            <li>Products</li>
            <li>Inventory</li>
            <li>Customers</li>
            <li>Orders</li>
            <li>Basic reports</li>
          </ul>

          <button
            onClick={() =>
              changePlan("free")
            }
            disabled={changingPlan}
          >
            Choose Free
          </button>
        </div>

        <hr />

        {/* STARTER */}
        <div>
          <h3>Starter</h3>

          <h2>$9 / month</h2>

          <ul>
            <li>Everything in Free</li>
            <li>Invoices</li>
            <li>Receipts</li>
            <li>Expenses</li>
            <li>Advanced reports</li>
            <li>Sales forecast</li>
          </ul>

          <button
            onClick={() =>
              changePlan("starter")
            }
            disabled={changingPlan}
          >
            Choose Starter
          </button>
        </div>

        <hr />

        {/* PROFESSIONAL */}
        <div>
          <h3>Professional</h3>

          <h2>$19 / month</h2>

          <ul>
            <li>Everything in Starter</li>
            <li>Business Health Score</li>
            <li>AI Assistant</li>
            <li>Advanced analytics</li>
            <li>Priority support</li>
          </ul>

          <button
            onClick={() =>
              changePlan(
                "professional"
              )
            }
            disabled={changingPlan}
          >
            Choose Professional
          </button>
        </div>

      </div>

      <hr />

      <button
        onClick={loadSubscription}
      >
        Refresh Subscription
      </button>
    </div>
  );
}

export default Billing;