import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function MyBusiness() {
  const navigate = useNavigate();

  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const response = await api.get("/businesses/my-business");

        setBusiness(response.data);

      } catch (error) {
        if (error.response?.status === 404) {
          setError("You have not created a business yet.");
        } else {
          setError(
            error.response?.data?.message ||
              "Unable to load your business."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBusiness();
  }, []);

  if (loading) {
    return <h2>Loading your business...</h2>;
  }

  if (error) {
    return (
      <div>
        <h2>No Business Found</h2>

        <p>{error}</p>

        <button onClick={() => navigate("/create-business")}>
          Create Business
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1>{business.businessName}</h1>

      {business.image && (
        <img
          src={`https://busybiz-5.onrender.com${business.image}`}
          alt={business.businessName}
          width="200"
        />
      )}

      <h3>Category</h3>
      <p>{business.category}</p>

      <h3>Description</h3>
      <p>{business.description}</p>

      <h3>Phone</h3>
      <p>{business.phone}</p>

      <h3>Location</h3>
      <p>{business.location}</p>

      <button onClick={() => navigate("/products")}>
        Manage Products
      </button>

      <button onClick={() => navigate("/dashboard")}>
        Back to Dashboard
      </button>
    </div>
  );
}

export default MyBusiness;
