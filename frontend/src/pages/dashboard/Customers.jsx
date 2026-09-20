import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./Customers.css";

function Customers() {
  const navigate = useNavigate();

  // =====================================================
  // STATE
  // =====================================================

  const [customers, setCustomers] = useState([]);

  const [summary, setSummary] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    inactiveCustomers: 0,
    totalOrders: 0,
    totalRevenue: 0
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [editingCustomer, setEditingCustomer] = useState(null);

  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [customerOrders, setCustomerOrders] = useState([]);
  const [customerStats, setCustomerStats] = useState(null);

  const [showDetails, setShowDetails] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    status: "active"
  });

  // =====================================================
  // CLEAR MESSAGES
  // =====================================================

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  // =====================================================
  // FETCH CUSTOMERS
  // =====================================================

  const fetchCustomers = async () => {
    try {
      const response = await api.get("/customers");

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.customers || [];

      setCustomers(data);
    } catch (error) {
      console.error("GET CUSTOMERS ERROR:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load customers."
      );
    }
  };

  // =====================================================
  // FETCH SUMMARY
  // =====================================================

  const fetchSummary = async () => {
    try {
      const response = await api.get(
        "/customers/summary"
      );

      setSummary({
        totalCustomers:
          Number(response.data?.totalCustomers) || 0,

        activeCustomers:
          Number(response.data?.activeCustomers) || 0,

        inactiveCustomers:
          Number(response.data?.inactiveCustomers) || 0,

        totalOrders:
          Number(response.data?.totalOrders) || 0,

        totalRevenue:
          Number(response.data?.totalRevenue) || 0
      });
    } catch (error) {
      console.error(
        "GET CUSTOMER SUMMARY ERROR:",
        error
      );
    }
  };

  // =====================================================
  // LOAD DATA
  // =====================================================

  const loadCustomers = async () => {
    setLoading(true);
    clearMessages();

    try {
      await Promise.all([
        fetchCustomers(),
        fetchSummary()
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  // =====================================================
  // FORM CHANGE
  // =====================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  // =====================================================
  // RESET FORM
  // =====================================================

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      status: "active"
    });

    setEditingCustomer(null);
    setShowForm(false);
  };

  // =====================================================
  // OPEN ADD FORM
  // =====================================================

  const openAddForm = () => {
    clearMessages();

    setEditingCustomer(null);

    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      status: "active"
    });

    setShowForm(true);
  };

  // =====================================================
  // OPEN EDIT FORM
  // =====================================================

  const openEditForm = (customer) => {
    clearMessages();

    setEditingCustomer(customer);

    setFormData({
      name: customer.name || "",
      email: customer.email || "",
      phone: customer.phone || "",
      address: customer.address || "",
      status: customer.status || "active"
    });

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  // =====================================================
  // CREATE / UPDATE CUSTOMER
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    clearMessages();

    const name = formData.name.trim();

    if (!name) {
      setError("Customer name is required.");
      return;
    }

    if (
      formData.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        formData.email.trim()
      )
    ) {
      setError("Please enter a valid email address.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        name,
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim()
      };

      if (editingCustomer) {
        payload.status = formData.status;

        await api.put(
          `/customers/${editingCustomer._id}`,
          payload
        );

        setSuccess(
          "Customer updated successfully."
        );
      } else {
        await api.post(
          "/customers",
          payload
        );

        setSuccess(
          "Customer created successfully."
        );
      }

      resetForm();

      await loadCustomers();
    } catch (error) {
      console.error(
        "SAVE CUSTOMER ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to save customer."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // VIEW CUSTOMER
  // =====================================================

  const viewCustomer = async (customer) => {
    clearMessages();

    setActionLoading(true);

    try {
      const [ordersResponse, statsResponse] =
        await Promise.all([
          api.get(
            `/customers/${customer._id}/orders`
          ),

          api.get(
            `/customers/${customer._id}/stats`
          )
        ]);

      setSelectedCustomer(customer);

      setCustomerOrders(
        Array.isArray(ordersResponse.data)
          ? ordersResponse.data
          : ordersResponse.data?.orders || []
      );

      setCustomerStats(
        statsResponse.data || null
      );

      setShowDetails(true);
    } catch (error) {
      console.error(
        "VIEW CUSTOMER ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load customer details."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =====================================================
  // CLOSE DETAILS
  // =====================================================

  const closeDetails = () => {
    setShowDetails(false);
    setSelectedCustomer(null);
    setCustomerOrders([]);
    setCustomerStats(null);
  };

  // =====================================================
  // TOGGLE STATUS
  // =====================================================

  const toggleStatus = async (customer) => {
    clearMessages();

    const newStatus =
      customer.status === "inactive"
        ? "active"
        : "inactive";

    const confirmed = window.confirm(
      `Set ${customer.name} as ${newStatus}?`
    );

    if (!confirmed) {
      return;
    }

    setActionLoading(true);

    try {
      await api.put(
        `/customers/${customer._id}`,
        {
          status: newStatus
        }
      );

      setSuccess(
        `Customer marked as ${newStatus}.`
      );

      await loadCustomers();
    } catch (error) {
      console.error(
        "UPDATE CUSTOMER STATUS ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to update customer status."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =====================================================
  // DELETE CUSTOMER
  // =====================================================

  const deleteCustomer = async (customer) => {
    clearMessages();

    const confirmed = window.confirm(
      `Delete customer "${customer.name}"?`
    );

    if (!confirmed) {
      return;
    }

    setActionLoading(true);

    try {
      await api.delete(
        `/customers/${customer._id}`
      );

      setSuccess(
        "Customer deleted successfully."
      );

      await loadCustomers();
    } catch (error) {
      console.error(
        "DELETE CUSTOMER ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to delete customer."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredCustomers = customers.filter(
    (customer) => {
      const searchValue =
        search.trim().toLowerCase();

      if (!searchValue) {
        return true;
      }

      return (
        String(customer.name || "")
          .toLowerCase()
          .includes(searchValue) ||

        String(customer.email || "")
          .toLowerCase()
          .includes(searchValue) ||

        String(customer.phone || "")
          .toLowerCase()
          .includes(searchValue)
      );
    }
  );

  // =====================================================
  // FORMAT MONEY
  // =====================================================

  const formatMoney = (value) => {
    const amount = Number(value) || 0;

    return `$${amount.toLocaleString(
      "en-US",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }
    )}`;
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (value) => {
    if (!value) {
      return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric"
      }
    );
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="customers-page">
        <div className="customers-loading">
          <div className="loading-spinner"></div>
          <h2>Loading customers...</h2>
          <p>Please wait.</p>
        </div>
      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="customers-page">

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="customers-header">

        <div className="customers-title">

          <span className="customers-eyebrow">
            CUSTOMER MANAGEMENT
          </span>

          <h1>Customers</h1>

          <p>
            Manage your customers, relationships
            and sales history.
          </p>

        </div>

        <div className="customers-header-actions">

          <button
            type="button"
            className="customers-secondary-button"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            Dashboard
          </button>

          <button
            type="button"
            className="customers-primary-button"
            onClick={openAddForm}
          >
            + Add Customer
          </button>

        </div>

      </div>


      {/* ================================================= */}
      {/* MESSAGES */}
      {/* ================================================= */}

      {error && (
        <div className="customers-message customers-error">
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
          >
            ×
          </button>
        </div>
      )}

      {success && (
        <div className="customers-message customers-success">
          <span>{success}</span>

          <button
            type="button"
            onClick={() => setSuccess("")}
          >
            ×
          </button>
        </div>
      )}


      {/* ================================================= */}
      {/* SUMMARY */}
      {/* ================================================= */}

      <div className="customers-summary">

        <div className="customer-summary-card">

          <div className="summary-card-top">
            <span>Total Customers</span>
            <div className="summary-icon">C</div>
          </div>

          <strong>
            {summary.totalCustomers}
          </strong>

          <small>
            All customers
          </small>

        </div>


        <div className="customer-summary-card">

          <div className="summary-card-top">
            <span>Active Customers</span>
            <div className="summary-icon">✓</div>
          </div>

          <strong>
            {summary.activeCustomers}
          </strong>

          <small>
            Currently active
          </small>

        </div>


        <div className="customer-summary-card">

          <div className="summary-card-top">
            <span>Orders</span>
            <div className="summary-icon">O</div>
          </div>

          <strong>
            {summary.totalOrders}
          </strong>

          <small>
            Customer orders
          </small>

        </div>


        <div className="customer-summary-card">

          <div className="summary-card-top">
            <span>Customer Revenue</span>
            <div className="summary-icon">$</div>
          </div>

          <strong>
            {formatMoney(summary.totalRevenue)}
          </strong>

          <small>
            Completed & paid orders
          </small>

        </div>

      </div>


      {/* ================================================= */}
      {/* ADD / EDIT FORM */}
      {/* ================================================= */}

      {showForm && (
        <div className="customer-form-card">

          <div className="customer-form-header">

            <div>
              <span className="customers-eyebrow">
                {editingCustomer
                  ? "UPDATE CUSTOMER"
                  : "NEW CUSTOMER"}
              </span>

              <h2>
                {editingCustomer
                  ? "Edit Customer"
                  : "Add Customer"}
              </h2>
            </div>

            <button
              type="button"
              className="close-form-button"
              onClick={resetForm}
              disabled={saving}
            >
              ×
            </button>

          </div>


          <form onSubmit={handleSubmit}>

            <div className="customer-form-grid">

              <div className="customer-form-group">

                <label>
                  Customer Name *
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter customer name"
                  required
                />

              </div>


              <div className="customer-form-group">

                <label>
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="customer@example.com"
                />

              </div>


              <div className="customer-form-group">

                <label>
                  Phone
                </label>

                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+263..."
                />

              </div>


              <div className="customer-form-group">

                <label>
                  Status
                </label>

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="active">
                    Active
                  </option>

                  <option value="inactive">
                    Inactive
                  </option>
                </select>

              </div>


              <div className="customer-form-group full-width">

                <label>
                  Address
                </label>

                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Customer address"
                  rows="3"
                />

              </div>

            </div>


            <div className="customer-form-actions">

              <button
                type="button"
                className="customer-cancel-button"
                onClick={resetForm}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="customer-save-button"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingCustomer
                  ? "Save Changes"
                  : "Create Customer"}
              </button>

            </div>

          </form>

        </div>
      )}


      {/* ================================================= */}
      {/* CUSTOMER LIST */}
      {/* ================================================= */}

      <div className="customers-content-card">

        <div className="customers-list-header">

          <div>
            <h2>Customer Directory</h2>

            <p>
              {filteredCustomers.length} customer
              {filteredCustomers.length !== 1
                ? "s"
                : ""}{" "}
              found
            </p>
          </div>


          <div className="customer-search">

            <span>⌕</span>

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search customers..."
            />

          </div>

        </div>


        {filteredCustomers.length === 0 ? (

          <div className="customers-empty">

            <div className="empty-icon">
              C
            </div>

            <h3>
              {search
                ? "No customers found"
                : "No customers yet"}
            </h3>

            <p>
              {search
                ? "Try a different search."
                : "Add your first customer to start building your customer database."}
            </p>

            {!search && (
              <button
                type="button"
                onClick={openAddForm}
              >
                + Add First Customer
              </button>
            )}

          </div>

        ) : (

          <div className="customers-table-wrapper">

            <table className="customers-table">

              <thead>

                <tr>

                  <th>Customer</th>

                  <th>Contact</th>

                  <th>Orders</th>

                  <th>Total Spent</th>

                  <th>Status</th>

                  <th>Joined</th>

                  <th>Actions</th>

                </tr>

              </thead>


              <tbody>

                {filteredCustomers.map(
                  (customer) => {

                    const status =
                      customer.status ===
                      "inactive"
                        ? "inactive"
                        : customer.status ===
                          "blocked"
                        ? "blocked"
                        : "active";

                    return (
                      <tr
                        key={customer._id}
                      >

                        <td>

                          <div className="customer-name-cell">

                            <div className="customer-avatar">
                              {String(
                                customer.name ||
                                  "C"
                              )
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>

                              <strong>
                                {customer.name ||
                                  "Unnamed Customer"}
                              </strong>

                              <small>
                                {customer.email ||
                                  "No email"}
                              </small>

                            </div>

                          </div>

                        </td>


                        <td>

                          <div className="customer-contact">

                            <span>
                              {customer.phone ||
                                "No phone"}
                            </span>

                            {customer.address && (
                              <small>
                                {customer.address}
                              </small>
                            )}

                          </div>

                        </td>


                        <td>

                          <strong>
                            {Number(
                              customer.totalOrders ||
                                0
                            )}
                          </strong>

                        </td>


                        <td>

                          <strong>
                            {formatMoney(
                              customer.totalSpent
                            )}
                          </strong>

                        </td>


                        <td>

                          <span
                            className={`customer-status ${status}`}
                          >
                            {status === "active"
                              ? "Active"
                              : status ===
                                "inactive"
                              ? "Inactive"
                              : "Blocked"}
                          </span>

                        </td>


                        <td>
                          {formatDate(
                            customer.createdAt
                          )}
                        </td>


                        <td>

                          <div className="customer-actions">

                            <button
                              type="button"
                              onClick={() =>
                                viewCustomer(
                                  customer
                                )
                              }
                              disabled={
                                actionLoading
                              }
                              title="View customer"
                            >
                              View
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                openEditForm(
                                  customer
                                )
                              }
                              title="Edit customer"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                toggleStatus(
                                  customer
                                )
                              }
                              disabled={
                                actionLoading
                              }
                              title={
                                status ===
                                "inactive"
                                  ? "Activate"
                                  : "Deactivate"
                              }
                            >
                              {status ===
                              "inactive"
                                ? "Activate"
                                : "Pause"}
                            </button>

                            <button
                              type="button"
                              className="delete-action"
                              onClick={() =>
                                deleteCustomer(
                                  customer
                                )
                              }
                              disabled={
                                actionLoading
                              }
                              title="Delete customer"
                            >
                              Delete
                            </button>

                          </div>

                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>


      {/* ================================================= */}
      {/* CUSTOMER DETAILS MODAL */}
      {/* ================================================= */}

      {showDetails &&
        selectedCustomer && (

          <div
            className="customer-modal-overlay"
            onClick={closeDetails}
          >

            <div
              className="customer-modal"
              onClick={(event) =>
                event.stopPropagation()
              }
            >

              <div className="customer-modal-header">

                <div>

                  <span className="customers-eyebrow">
                    CUSTOMER PROFILE
                  </span>

                  <h2>
                    {selectedCustomer.name}
                  </h2>

                </div>

                <button
                  type="button"
                  onClick={closeDetails}
                  className="modal-close-button"
                >
                  ×
                </button>

              </div>


              <div className="customer-profile">

                <div className="large-customer-avatar">
                  {String(
                    selectedCustomer.name ||
                      "C"
                  )
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>

                  <h3>
                    {selectedCustomer.name}
                  </h3>

                  <p>
                    {selectedCustomer.email ||
                      "No email provided"}
                  </p>

                  <p>
                    {selectedCustomer.phone ||
                      "No phone provided"}
                  </p>

                </div>

              </div>


              <div className="customer-detail-grid">

                <div>
                  <span>Status</span>
                  <strong>
                    {selectedCustomer.status}
                  </strong>
                </div>

                <div>
                  <span>Joined</span>
                  <strong>
                    {formatDate(
                      selectedCustomer.createdAt
                    )}
                  </strong>
                </div>

                <div>
                  <span>Total Orders</span>
                  <strong>
                    {customerStats?.totalOrders ??
                      selectedCustomer.totalOrders ??
                      0}
                  </strong>
                </div>

                <div>
                  <span>Total Spent</span>
                  <strong>
                    {formatMoney(
                      customerStats?.totalSpent ??
                        selectedCustomer.totalSpent ??
                        0
                    )}
                  </strong>
                </div>

                <div>
                  <span>Average Order</span>
                  <strong>
                    {formatMoney(
                      customerStats?.averageOrderValue ||
                        0
                    )}
                  </strong>
                </div>

              </div>


              <div className="customer-orders-section">

                <div className="customer-orders-heading">

                  <div>
                    <h3>
                      Order History
                    </h3>

                    <p>
                      Recent orders from this
                      customer.
                    </p>
                  </div>

                  <span>
                    {customerOrders.length} orders
                  </span>

                </div>


                {customerOrders.length === 0 ? (

                  <div className="no-customer-orders">
                    No orders found for this
                    customer.
                  </div>

                ) : (

                  <div className="customer-orders-list">

                    {customerOrders.map(
                      (order) => (

                        <div
                          className="customer-order-row"
                          key={
                            order._id
                          }
                        >

                          <div>

                            <strong>
                              {order.orderNumber ||
                                order._id}
                            </strong>

                            <small>
                              {formatDate(
                                order.createdAt
                              )}
                            </small>

                          </div>


                          <div>

                            <strong>
                              {formatMoney(
                                order.total
                              )}
                            </strong>

                            <small>
                              {order.status ||
                                "Unknown"}
                            </small>

                          </div>

                        </div>

                      )
                    )}

                  </div>

                )}

              </div>


              <div className="customer-modal-actions">

                <button
                  type="button"
                  className="customer-cancel-button"
                  onClick={closeDetails}
                >
                  Close
                </button>

                <button
                  type="button"
                  className="customer-save-button"
                  onClick={() => {
                    closeDetails();
                    openEditForm(
                      selectedCustomer
                    );
                  }}
                >
                  Edit Customer
                </button>

              </div>

            </div>

          </div>
        )}

    </div>
  );
}

export default Customers;