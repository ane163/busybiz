import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function Inventory() {
  const navigate = useNavigate();

  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);

  const [summary, setSummary] = useState({
    totalProducts: 0,
    totalUnits: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);

  const [formData, setFormData] = useState({
    product: "",
    quantity: "",
    lowStockLimit: 5,
  });

  const [actionLoading, setActionLoading] = useState(false);

  // =====================================================
  // FETCH INVENTORY
  // =====================================================

  const fetchInventory = async () => {
    try {
      const response = await api.get("/inventory");

      setInventory(response.data || []);
    } catch (error) {
      console.error("GET INVENTORY ERROR:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load inventory."
      );
    }
  };

  // =====================================================
  // FETCH PRODUCTS
  // =====================================================

  const fetchProducts = async () => {
    try {
      const response = await api.get("/products");

      setProducts(response.data || []);
    } catch (error) {
      console.error("GET PRODUCTS ERROR:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load products."
      );
    }
  };

  // =====================================================
  // FETCH SUMMARY
  // =====================================================

  const fetchSummary = async () => {
    try {
      const response = await api.get("/inventory/summary");

      setSummary(
        response.data || {
          totalProducts: 0,
          totalUnits: 0,
          lowStockCount: 0,
          outOfStockCount: 0,
        }
      );
    } catch (error) {
      console.error(
        "GET INVENTORY SUMMARY ERROR:",
        error
      );
    }
  };

  // =====================================================
  // LOAD EVERYTHING
  // =====================================================

  const loadInventory = async () => {
    setLoading(true);
    setError("");

    await Promise.all([
      fetchInventory(),
      fetchProducts(),
      fetchSummary(),
    ]);

    setLoading(false);
  };

  useEffect(() => {
    loadInventory();
  }, []);

  // =====================================================
  // FORM CHANGE
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =====================================================
  // CREATE INVENTORY
  // =====================================================

  const handleCreateInventory = async (e) => {
    e.preventDefault();

    setError("");

    if (!formData.product) {
      setError("Please select a product.");
      return;
    }

    setActionLoading(true);

    try {
      await api.post("/inventory", {
        product: formData.product,
        quantity: Number(formData.quantity || 0),
        lowStockLimit: Number(
          formData.lowStockLimit || 5
        ),
      });

      setFormData({
        product: "",
        quantity: "",
        lowStockLimit: 5,
      });

      setShowAddForm(false);

      await loadInventory();
    } catch (error) {
      console.error(
        "CREATE INVENTORY ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to create inventory."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =====================================================
  // ADD STOCK
  // =====================================================

  const addStock = async (item) => {
    setError("");

    const quantity = window.prompt(
      `How many units do you want to add to ${
        item.product?.name || "this product"
      }?`
    );

    if (quantity === null) {
      return;
    }

    const amount = Number(quantity);

    if (
      !Number.isInteger(amount) ||
      amount <= 0
    ) {
      setError(
        "Please enter a positive whole number."
      );
      return;
    }

    try {
      await api.post(
        `/inventory/${item._id}/add-stock`,
        {
          quantity: amount,
        }
      );

      await loadInventory();
    } catch (error) {
      console.error("ADD STOCK ERROR:", error);

      setError(
        error.response?.data?.message ||
          "Unable to add stock."
      );
    }
  };

  // =====================================================
  // REMOVE STOCK
  // =====================================================

  const removeStock = async (item) => {
    setError("");

    const quantity = window.prompt(
      `How many units do you want to remove from ${
        item.product?.name || "this product"
      }?`
    );

    if (quantity === null) {
      return;
    }

    const amount = Number(quantity);

    if (
      !Number.isInteger(amount) ||
      amount <= 0
    ) {
      setError(
        "Please enter a positive whole number."
      );
      return;
    }

    if (amount > Number(item.quantity || 0)) {
      setError(
        "You cannot remove more stock than is currently available."
      );
      return;
    }

    try {
      await api.post(
        `/inventory/${item._id}/remove-stock`,
        {
          quantity: amount,
        }
      );

      await loadInventory();
    } catch (error) {
      console.error(
        "REMOVE STOCK ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to remove stock."
      );
    }
  };

  // =====================================================
  // SET STOCK
  // =====================================================

  const setStock = async (item) => {
    setError("");

    const quantity = window.prompt(
      `Set stock quantity for ${
        item.product?.name || "this product"
      }:`,
      item.quantity
    );

    if (quantity === null) {
      return;
    }

    const amount = Number(quantity);

    if (
      !Number.isInteger(amount) ||
      amount < 0
    ) {
      setError(
        "Stock must be a non-negative whole number."
      );
      return;
    }

    try {
      await api.put(
        `/inventory/${item._id}/set-stock`,
        {
          quantity: amount,
        }
      );

      await loadInventory();
    } catch (error) {
      console.error(
        "SET STOCK ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to update stock."
      );
    }
  };

  // =====================================================
  // UPDATE LOW STOCK LIMIT
  // =====================================================

  const updateLowStockLimit = async (item) => {
    setError("");

    const limit = window.prompt(
      `Set low-stock alert limit for ${
        item.product?.name || "this product"
      }:`,
      item.lowStockLimit
    );

    if (limit === null) {
      return;
    }

    const amount = Number(limit);

    if (
      !Number.isInteger(amount) ||
      amount < 0
    ) {
      setError(
        "Low-stock limit must be a non-negative whole number."
      );
      return;
    }

    try {
      await api.put(
        `/inventory/${item._id}/low-stock-limit`,
        {
          lowStockLimit: amount,
        }
      );

      await loadInventory();
    } catch (error) {
      console.error(
        "UPDATE LOW STOCK LIMIT ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to update low-stock limit."
      );
    }
  };

  // =====================================================
  // DELETE INVENTORY
  // =====================================================

  const deleteInventory = async (item) => {
    setError("");

    const confirmed = window.confirm(
      `Delete inventory record for "${
        item.product?.name || "this product"
      }"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(
        `/inventory/${item._id}`
      );

      await loadInventory();
    } catch (error) {
      console.error(
        "DELETE INVENTORY ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to delete inventory."
      );
    }
  };

  // =====================================================
  // STOCK STATUS
  // =====================================================

  const getStockStatus = (item) => {
    const quantity = Number(item.quantity || 0);
    const limit = Number(item.lowStockLimit || 0);

    if (quantity === 0) {
      return {
        text: "Out of Stock",
        className: "out",
      };
    }

    if (quantity <= limit) {
      return {
        text: "Low Stock",
        className: "low",
      };
    }

    return {
      text: "In Stock",
      className: "good",
    };
  };

  // =====================================================
  // PRODUCTS WITHOUT INVENTORY
  // =====================================================

  const availableProducts = products.filter(
    (product) =>
      !inventory.some(
        (item) =>
          item.product?._id === product._id ||
          item.product === product._id
      )
  );

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="inventory-page">
        <h2>Loading inventory...</h2>
      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="inventory-page">

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="inventory-header">

        <div>
          <h1>Inventory</h1>

          <p>
            Manage your products, stock levels
            and inventory alerts.
          </p>
        </div>

        <div className="inventory-header-actions">

          <button
            type="button"
            onClick={() =>
              setShowAddForm(!showAddForm)
            }
          >
            {showAddForm
              ? "Close"
              : "+ Add Inventory"}
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/products")
            }
          >
            Products
          </button>

        </div>

      </div>

      {/* ================================================= */}
      {/* ERROR */}
      {/* ================================================= */}

      {error && (
        <div className="inventory-error">
          {error}
        </div>
      )}

      {/* ================================================= */}
      {/* SUMMARY CARDS */}
      {/* ================================================= */}

      <div className="inventory-summary">

        <div className="inventory-card">
          <span>Total Products</span>

          <strong>
            {summary.totalProducts}
          </strong>
        </div>

        <div className="inventory-card">
          <span>Total Units</span>

          <strong>
            {summary.totalUnits}
          </strong>
        </div>

        <div className="inventory-card">
          <span>Low Stock</span>

          <strong>
            {summary.lowStockCount}
          </strong>
        </div>

        <div className="inventory-card">
          <span>Out of Stock</span>

          <strong>
            {summary.outOfStockCount}
          </strong>
        </div>

      </div>

      {/* ================================================= */}
      {/* ADD INVENTORY FORM */}
      {/* ================================================= */}

      {showAddForm && (
        <div className="inventory-form-card">

          <h2>
            Add Product to Inventory
          </h2>

          <form
            onSubmit={handleCreateInventory}
          >

            <div className="form-group">

              <label>
                Product
              </label>

              <select
                name="product"
                value={formData.product}
                onChange={handleChange}
                required
              >

                <option value="">
                  Select product
                </option>

                {availableProducts.map(
                  (product) => (
                    <option
                      key={product._id}
                      value={product._id}
                    >
                      {product.name}
                    </option>
                  )
                )}

              </select>

              {availableProducts.length === 0 && (
                <small>
                  All available products already
                  have inventory records.
                </small>
              )}

            </div>

            <div className="form-group">

              <label>
                Initial Quantity
              </label>

              <input
                type="number"
                name="quantity"
                min="0"
                step="1"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="0"
              />

            </div>

            <div className="form-group">

              <label>
                Low Stock Limit
              </label>

              <input
                type="number"
                name="lowStockLimit"
                min="0"
                step="1"
                value={formData.lowStockLimit}
                onChange={handleChange}
              />

            </div>

            <button
              type="submit"
              disabled={
                actionLoading ||
                availableProducts.length === 0
              }
            >
              {actionLoading
                ? "Creating..."
                : "Create Inventory"}
            </button>

          </form>

        </div>
      )}

      {/* ================================================= */}
      {/* NO INVENTORY */}
      {/* ================================================= */}

      {inventory.length === 0 ? (

        <div className="empty-inventory">

          <h2>
            No inventory records yet
          </h2>

          <p>
            Add your products to inventory
            to start tracking stock.
          </p>

          {availableProducts.length > 0 && (
            <button
              type="button"
              onClick={() =>
                setShowAddForm(true)
              }
            >
              Add First Inventory
            </button>
          )}

        </div>

      ) : (

        /* ================================================= */
        /* INVENTORY TABLE */
        /* ================================================= */

        <div className="inventory-table-wrapper">

          <table className="inventory-table">

            <thead>

              <tr>

                <th>
                  Product
                </th>

                <th>
                  Category
                </th>

                <th>
                  Price
                </th>

                <th>
                  Quantity
                </th>

                <th>
                  Low Limit
                </th>

                <th>
                  Status
                </th>

                <th>
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {inventory.map((item) => {

                const status =
                  getStockStatus(item);

                return (
                  <tr key={item._id}>

                    <td>
                      <strong>
                        {item.product?.name ||
                          "Unknown Product"}
                      </strong>
                    </td>

                    <td>
                      {item.product?.category ||
                        "—"}
                    </td>

                    <td>
                      $
                      {Number(
                        item.product?.price || 0
                      ).toFixed(2)}
                    </td>

                    <td>
                      <strong>
                        {item.quantity}
                      </strong>
                    </td>

                    <td>
                      {item.lowStockLimit}
                    </td>

                    <td>
                      <span
                        className={`stock-status ${status.className}`}
                      >
                        {status.text}
                      </span>
                    </td>

                    <td>

                      <div className="inventory-actions">

                        <button
                          type="button"
                          onClick={() =>
                            addStock(item)
                          }
                        >
                          + Stock
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            removeStock(item)
                          }
                        >
                          − Stock
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setStock(item)
                          }
                        >
                          Set
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            updateLowStockLimit(
                              item
                            )
                          }
                        >
                          Limit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            deleteInventory(item)
                          }
                        >
                          Delete
                        </button>

                      </div>

                    </td>

                  </tr>
                );
              })}

            </tbody>

          </table>

        </div>

      )}

    </div>
  );
}

export default Inventory;