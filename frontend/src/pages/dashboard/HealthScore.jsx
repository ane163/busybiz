import { useEffect, useState } from "react";
import api from "../../services/api";

function HealthScore() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadHealthScore();
  }, []);

  const loadHealthScore = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/health/score"
      );

      setHealth(response.data);
    } catch (error) {
      console.error(
        "HEALTH SCORE ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load business health score."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <h1>Business Health</h1>
        <p>Analyzing your business...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1>Business Health</h1>

        <p>{error}</p>

        <button onClick={loadHealthScore}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1>Business Health Score</h1>

      <p>
        BusyBiz analyzes your business
        performance and gives you a health
        score out of 100.
      </p>

      <hr />

      <h2>Your Score</h2>

      <h1>
        {health.score} / 100
      </h1>

      <h2>
        {health.status}
      </h2>

      <hr />

      <h2>Financial Performance</h2>

      <p>
        Revenue: $
        {Number(
          health.revenue || 0
        ).toFixed(2)}
      </p>

      <p>
        Expenses: $
        {Number(
          health.expenses || 0
        ).toFixed(2)}
      </p>

      <p>
        Profit: $
        {Number(
          health.profit || 0
        ).toFixed(2)}
      </p>

      <hr />

      <h2>Business Activity</h2>

      <p>
        Orders: {health.orders}
      </p>

      <p>
        Products: {health.products}
      </p>

      <hr />

      <h2>Score Breakdown</h2>

      <p>
        Profit:{" "}
        {health.scores.profit} / 30
      </p>

      <p>
        Sales:{" "}
        {health.scores.sales} / 25
      </p>

      <p>
        Inventory:{" "}
        {health.scores.inventory} / 20
      </p>

      <p>
        Expenses:{" "}
        {health.scores.expenses} / 15
      </p>

      <p>
        Activity:{" "}
        {health.scores.activity} / 10
      </p>

      <hr />

      <button onClick={loadHealthScore}>
        Refresh Health Score
      </button>
    </div>
  );
}

export default HealthScore;