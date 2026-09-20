import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../services/api";

function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: ""
  });

  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =====================================================
  // LOAD PRODUCT
  // =====================================================

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setError("");

        if (!id) {
          setError("Product ID is missing.");
          setLoading(false);
          return;
        }

        const response = await api.get(
          `/products/${id}`
        );

        const product =
          response.data?.product ||
          response.data;

        if (!product || !product._id) {
          setError("Product not found.");
          return;
        }

        setFormData({
          name: product.name || "",
          description: product.description || "",
          price:
            product.price !== undefined &&
            product.price !== null
              ? String(product.price)
              : "",
          category: product.category || ""
        });

      } catch (error) {
        console.error(
          "LOAD PRODUCT ERROR:",
          error
        );

        setError(
          error.response?.data?.message ||
            "Unable to load product."
        );

      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  // =====================================================
  // HANDLE INPUT
  // =====================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  // =====================================================
  // HANDLE IMAGE
  // =====================================================

  const handleImageChange = (event) => {
    const selectedFile =
      event.target.files?.[0];

    if (!selectedFile) {
      setImage(null);
      return;
    }

    if (
      !selectedFile.type.startsWith("image/")
    ) {
      setError(
        "Please select a valid image file."
      );

      event.target.value = "";
      setImage(null);
      return;
    }

    if (
      selectedFile.size >
      5 * 1024 * 1024
    ) {
      setError(
        "Image must be smaller than 5MB."
      );

      event.target.value = "";
      setImage(null);
      return;
    }

    setError("");
    setImage(selectedFile);
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!id) {
      setError("Product ID is missing.");
      return;
    }

    if (!formData.name.trim()) {
      setError(
        "Product name is required."
      );
      return;
    }

    if (
      formData.price === "" ||
      Number(formData.price) < 0 ||
      !Number.isFinite(
        Number(formData.price)
      )
    ) {
      setError(
        "Please enter a valid price."
      );
      return;
    }

    try {
      setSaving(true);

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
        formData.price
      );

      data.append(
        "category",
        formData.category.trim()
      );

      if (image) {
        data.append("image", image);
      }

      console.log(
        "UPDATING PRODUCT:",
        id
      );

      await api.put(
        `/products/${id}`,
        data
      );

      setSuccess(
        "Product updated successfully."
      );

      setTimeout(() => {
        navigate("/products");
      }, 700);

    } catch (error) {
      console.error(
        "UPDATE PRODUCT ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Unable to update product."
      );

    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f6f6f6"
        }}
      >
        <h2>Loading product...</h2>
      </div>
    );
  }

  // =====================================================
  // PRODUCT NOT FOUND / LOAD ERROR
  // =====================================================

  if (
    error &&
    !formData.name
  ) {
    return (
      <div
        style={{
          minHeight: "100vh",
          padding: "40px",
          background: "#f6f6f6"
        }}
      >
        <h2>
          Unable to load product
        </h2>

        <p>{error}</p>

        <button
          type="button"
          onClick={() =>
            navigate("/products")
          }
          style={{
            border: "none",
            background: "#111",
            color: "#d4af37",
            padding: "12px 20px",
            borderRadius: "10px",
            fontWeight: "700",
            cursor: "pointer"
          }}
        >
          Back to Products
        </button>
      </div>
    );
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f6f6f6",
        padding: "40px 20px"
      }}
    >
      <div
        style={{
          maxWidth: "760px",
          margin: "0 auto",
          background: "#fff",
          borderRadius: "18px",
          padding: "35px",
          boxShadow:
            "0 10px 35px rgba(0,0,0,0.08)"
        }}
      >

        {/* BACK */}

        <button
          type="button"
          onClick={() =>
            navigate("/products")
          }
          style={{
            border: "none",
            background: "transparent",
            color: "#111",
            cursor: "pointer",
            fontSize: "14px",
            marginBottom: "25px"
          }}
        >
          ← Back to Products
        </button>

        {/* TITLE */}

        <div
          style={{
            marginBottom: "30px"
          }}
        >
          <span
            style={{
              color: "#a78314",
              fontSize: "11px",
              fontWeight: "800",
              letterSpacing: "1.5px"
            }}
          >
            PRODUCT MANAGEMENT
          </span>

          <h1
            style={{
              margin: "8px 0 0",
              color: "#111",
              fontSize: "30px"
            }}
          >
            Edit Product
          </h1>

          <p
            style={{
              color: "#777",
              marginTop: "7px"
            }}
          >
            Update your product information.
          </p>
        </div>

        {/* ERROR */}

        {error && (
          <div
            style={{
              background: "#fff0f0",
              color: "#b42318",
              border:
                "1px solid #efc5c5",
              borderLeft:
                "4px solid #c62828",
              borderRadius: "10px",
              padding: "13px",
              marginBottom: "20px"
            }}
          >
            {error}
          </div>
        )}

        {/* SUCCESS */}

        {success && (
          <div
            style={{
              background: "#f8f5e8",
              color: "#7a6212",
              border:
                "1px solid #e5d58c",
              borderLeft:
                "4px solid #d4af37",
              borderRadius: "10px",
              padding: "13px",
              marginBottom: "20px"
            }}
          >
            {success}
          </div>
        )}

        {/* FORM */}

        <form onSubmit={handleSubmit}>

          {/* NAME */}

          <div
            style={{
              marginBottom: "20px"
            }}
          >
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
                color: "#222"
              }}
            >
              Product Name
            </label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Product name"
              required
              style={{
                width: "100%",
                boxSizing: "border-box",
                border:
                  "1px solid #ddd",
                borderRadius: "10px",
                padding:
                  "13px 14px",
                fontSize: "14px",
                outline: "none"
              }}
            />
          </div>

          {/* DESCRIPTION */}

          <div
            style={{
              marginBottom: "20px"
            }}
          >
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
                color: "#222"
              }}
            >
              Description
            </label>

            <textarea
              name="description"
              value={
                formData.description
              }
              onChange={handleChange}
              placeholder="Product description"
              rows="5"
              style={{
                width: "100%",
                boxSizing: "border-box",
                border:
                  "1px solid #ddd",
                borderRadius: "10px",
                padding:
                  "13px 14px",
                fontSize: "14px",
                outline: "none",
                resize: "vertical"
              }}
            />
          </div>

          {/* PRICE */}

          <div
            style={{
              marginBottom: "20px"
            }}
          >
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
                color: "#222"
              }}
            >
              Price
            </label>

            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
              placeholder="0.00"
              style={{
                width: "100%",
                boxSizing: "border-box",
                border:
                  "1px solid #ddd",
                borderRadius: "10px",
                padding:
                  "13px 14px",
                fontSize: "14px",
                outline: "none"
              }}
            />
          </div>

          {/* CATEGORY */}

          <div
            style={{
              marginBottom: "20px"
            }}
          >
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
                color: "#222"
              }}
            >
              Category
            </label>

            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="e.g. Electronics"
              style={{
                width: "100%",
                boxSizing: "border-box",
                border:
                  "1px solid #ddd",
                borderRadius: "10px",
                padding:
                  "13px 14px",
                fontSize: "14px",
                outline: "none"
              }}
            />
          </div>

          {/* IMAGE */}

          <div
            style={{
              marginBottom: "28px"
            }}
          >
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
                color: "#222"
              }}
            >
              New Product Image
            </label>

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/jpg"
              onChange={handleImageChange}
              style={{
                width: "100%",
                boxSizing: "border-box",
                border:
                  "1px solid #ddd",
                borderRadius: "10px",
                padding: "12px",
                background: "#fff"
              }}
            />

            {image && (
              <p
                style={{
                  marginTop: "8px",
                  color: "#777",
                  fontSize: "13px"
                }}
              >
                Selected: {image.name}
              </p>
            )}
          </div>

          {/* BUTTONS */}

          <div
            style={{
              display: "flex",
              gap: "12px"
            }}
          >

            <button
              type="button"
              onClick={() =>
                navigate("/products")
              }
              disabled={saving}
              style={{
                flex: 1,
                border:
                  "1px solid #ddd",
                background: "#fff",
                color: "#333",
                padding: "14px",
                borderRadius: "10px",
                fontWeight: "700",
                cursor: saving
                  ? "not-allowed"
                  : "pointer"
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              style={{
                flex: 1,
                border: "none",
                background: "#111",
                color: "#d4af37",
                padding: "14px",
                borderRadius: "10px",
                fontWeight: "700",
                cursor: saving
                  ? "not-allowed"
                  : "pointer",
                opacity: saving
                  ? 0.65
                  : 1
              }}
            >
              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>

          </div>

        </form>

      </div>
    </div>
  );
}

export default EditProduct;