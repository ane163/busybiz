import { useEffect, useState } from "react";
import api from "../../services/api";

function Forecast() {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadForecast();
  }, []);

  const loadForecast = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/forecast/sales"
      );

      setForecast(response.data);
    } catch (error) {
      console.error(
        "FORECAST ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load sales forecast."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <h1>Sales Forecast</h1>
        <p>Loading forecast...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1>Sales Forecast</h1>
        <p>{error}</p>

        <button onClick={loadForecast}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1>Sales Forecast</h1>

      <p>
        BusyBiz sales projection based on
        your recorded orders.
      </p>

      <hr />

      {forecast?.message && (
        <p>{forecast.message}</p>
      )}

      <div>
        <h2>Total Sales</h2>

        <h1>
          $
          {Number(
            forecast.totalSales || 0
          ).toFixed(2)}
        </h1>
      </div>

      <hr />

      <div>
        <h2>Total Orders</h2>

        <h1>
          {forecast.totalOrders || 0}
        </h1>
      </div>

      <hr />

      <div>
        <h2>Average Daily Sales</h2>

        <h1>
          $
          {Number(
            forecast.averageDailySales || 0
          ).toFixed(2)}
        </h1>
      </div>

      <hr />

      <div>
        <h2>Projected 30-Day Sales</h2>

        <h1>
          $
          {Number(
            forecast.projectedMonthlySales || 0
          ).toFixed(2)}
        </h1>
      </div>

      <hr />

      <button onClick={loadForecast}>
        Refresh Forecast
      </button>
    </div>
  );
}

export default Forecast;