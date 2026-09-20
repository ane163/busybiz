import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function Products() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProducts = async () => {
    try {
      const response = await api.get("/products");

      setProducts(response.data);
      setError("");

    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to load products."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);


  const deleteProduct = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/products/${id}`);

      setProducts(
        products.filter((product) => product._id !== id)
      );

    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to delete product."
      );
    }
  };


  if (loading) {
    return <h2>Loading products...</h2>;
  }


  return (
    <div>
      <h1>My Products</h1>

      <button onClick={() => navigate("/add-product")}>
        Add Product
      </button>

      {error && <p>{error}</p>}


      {products.length === 0 ? (
        <p>You don't have any products yet.</p>
      ) : (

        <div>

          {products.map((product) => (

            <div key={product._id}>

              {product.image && (
                <img
                  src={`http://localhost:5000${product.image}`}
                  alt={product.name}
                  width="150"
                />
              )}

              <h2>{product.name}</h2>

              <p>{product.description}</p>

              <p>
                Price: ${product.price}
              </p>

              <p>
                Category: {product.category}
              </p>


              <button
                onClick={() =>
                  navigate(`/edit-product/${product._id}`)
                }
              >
                Edit
              </button>


              <button
                onClick={() =>
                  deleteProduct(product._id)
                }
              >
                Delete
              </button>

              <hr />

            </div>

          ))}

        </div>

      )}

    </div>
  );
}

export default Products;