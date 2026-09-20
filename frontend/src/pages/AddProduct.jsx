import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function AddProduct() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: ""
  });

  const [image, setImage] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =====================================================
  // HANDLE INPUT CHANGE
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  };


  // =====================================================
  // HANDLE IMAGE
  // =====================================================

  const handleImageChange = (e) => {
    const selectedFile = e.target.files?.[0] || null;

    setImage(selectedFile);
  };


  // =====================================================
  // CREATE PRODUCT
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {

      // -------------------------------------------------
      // BASIC FRONTEND VALIDATION
      // -------------------------------------------------

      if (!formData.name.trim()) {
        throw new Error("Product name is required.");
      }

      if (
        formData.price === "" ||
        Number(formData.price) < 0
      ) {
        throw new Error("Please enter a valid product price.");
      }


      // -------------------------------------------------
      // CREATE FORMDATA
      // -------------------------------------------------

      const data = new FormData();

      data.append(
        "name",
        formData.name.trim()
      );

      data.append(
        "description",
        formData.description.trim()
      );

      data.append(
        "price",
        String(Number(formData.price))
      );

      data.append(
        "category",
        formData.category.trim()
      );


      // -------------------------------------------------
      // IMAGE
      // -------------------------------------------------

      if (image) {
        data.append(
          "image",
          image
        );
      }


      // -------------------------------------------------
      // SEND REQUEST
      // -------------------------------------------------

      const response =
        await api.post(
          "/products",
          data
        );


      // -------------------------------------------------
      // SUCCESS
      // -------------------------------------------------

      setSuccess(
        response.data?.message ||
        "Product created successfully!"
      );


      // -------------------------------------------------
      // RESET FORM
      // -------------------------------------------------

      setFormData({
        name: "",
        description: "",
        price: "",
        category: ""
      });

      setImage(null);


      // Reset file input
      const fileInput =
        document.getElementById(
          "product-image"
        );

      if (fileInput) {
        fileInput.value = "";
      }


    } catch (error) {

      // -------------------------------------------------
      // DETAILED ERROR
      // -------------------------------------------------

      console.error(
        "CREATE PRODUCT ERROR:",
        error
      );


      console.error(
        "SERVER RESPONSE:",
        error.response?.data
      );


      console.error(
        "STATUS:",
        error.response?.status
      );


      // -------------------------------------------------
      // GET ACTUAL SERVER MESSAGE
      // -------------------------------------------------

      const serverMessage =
        error.response?.data?.message ||
        error.response?.data?.error;


      if (serverMessage) {

        setError(
          serverMessage
        );

      } else if (error.message) {

        setError(
          error.message
        );

      } else {

        setError(
          "Unable to create product."
        );

      }

    } finally {

      setLoading(false);

    }
  };


  // =====================================================
  // UI
  // =====================================================

  return (
    <div>

      <h1>
        Add Product
      </h1>


      <form
        onSubmit={handleSubmit}
      >

        {/* ============================================= */}
        {/* PRODUCT NAME */}
        {/* ============================================= */}

        <div>

          <label>
            Product Name
          </label>

          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Product name"
            required
          />

        </div>


        {/* ============================================= */}
        {/* DESCRIPTION */}
        {/* ============================================= */}

        <div>

          <label>
            Description
          </label>

          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Product description"
          />

        </div>


        {/* ============================================= */}
        {/* PRICE */}
        {/* ============================================= */}

        <div>

          <label>
            Price
          </label>

          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="0.00"
            min="0"
            step="0.01"
            required
          />

        </div>


        {/* ============================================= */}
        {/* CATEGORY */}
        {/* ============================================= */}

        <div>

          <label>
            Category
          </label>

          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            placeholder="Product category"
          />

        </div>


        {/* ============================================= */}
        {/* IMAGE */}
        {/* ============================================= */}

        <div>

          <label>
            Product Image
          </label>

          <input
            id="product-image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />

        </div>


        {/* ============================================= */}
        {/* ERROR */}
        {/* ============================================= */}

        {error && (

          <div
            style={{
              color: "red",
              marginTop: "15px",
              marginBottom: "15px"
            }}
          >

            <strong>
              Product Error:
            </strong>

            <p>
              {error}
            </p>

          </div>

        )}


        {/* ============================================= */}
        {/* SUCCESS */}
        {/* ============================================= */}

        {success && (

          <div
            style={{
              color: "green",
              marginTop: "15px",
              marginBottom: "15px"
            }}
          >

            <strong>
              {success}
            </strong>

          </div>

        )}


        {/* ============================================= */}
        {/* SUBMIT */}
        {/* ============================================= */}

        <button
          type="submit"
          disabled={loading}
        >

          {loading
            ? "Adding Product..."
            : "Add Product"}

        </button>

      </form>


      {/* ============================================= */}
      {/* VIEW PRODUCTS */}
      {/* ============================================= */}

      <button
        type="button"
        onClick={() =>
          navigate("/products")
        }
      >

        View Products

      </button>

    </div>
  );
}

export default AddProduct;