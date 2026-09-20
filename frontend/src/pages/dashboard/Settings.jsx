import { useEffect, useState } from "react";
import api from "../../services/api";
import "./Settings.css";

function Settings() {
  const [settings, setSettings] = useState({
    currency: "USD",

    taxEnabled: false,
    taxRate: 0,

    invoicePrefix: "INV-",
    receiptPrefix: "REC-",
    quotePrefix: "QUO-",

    lowStockNotifications: true,
    orderNotifications: true,
    invoiceNotifications: true,
    paymentNotifications: true,
    teamNotifications: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");


  // =====================================================
  // LOAD SETTINGS
  // =====================================================

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get("/settings");

      setSettings(response.data);

    } catch (error) {
      console.error(
        "LOAD SETTINGS ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
        "Unable to load settings."
      );

    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchSettings();
  }, []);


  // =====================================================
  // HANDLE INPUT
  // =====================================================

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setSettings((previous) => ({
      ...previous,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };


  // =====================================================
  // SAVE SETTINGS
  // =====================================================

  const saveSettings = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response =
        await api.put(
          "/settings",
          settings
        );

      setSettings(
        response.data.settings
      );

      setSuccess(
        response.data.message ||
        "Settings saved successfully."
      );

    } catch (error) {
      console.error(
        "SAVE SETTINGS ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
        "Unable to save settings."
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
      <div className="settings-page">
        <h1>Settings</h1>
        <p>Loading settings...</p>
      </div>
    );
  }


  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="settings-page">

      <div className="settings-header">

        <div>
          <h1>Settings</h1>

          <p>
            Manage your BusyBiz business
            preferences.
          </p>
        </div>

        <button
          type="button"
          onClick={saveSettings}
          disabled={saving}
        >
          {saving
            ? "Saving..."
            : "Save Changes"}
        </button>

      </div>


      {error && (
        <div className="settings-message error">
          {error}
        </div>
      )}


      {success && (
        <div className="settings-message success">
          {success}
        </div>
      )}


      {/* ================================================= */}
      {/* BUSINESS SETTINGS */}
      {/* ================================================= */}

      <section className="settings-card">

        <div className="settings-card-header">

          <h2>Business Settings</h2>

          <p>
            Configure the financial settings
            used throughout BusyBiz.
          </p>

        </div>


        <div className="settings-grid">

          <div className="settings-field">

            <label>
              Currency
            </label>

            <select
              name="currency"
              value={settings.currency}
              onChange={handleChange}
            >
              <option value="USD">
                USD — US Dollar
              </option>

              <option value="ZWL">
                ZWL — Zimbabwe Dollar
              </option>

              <option value="ZAR">
                ZAR — South African Rand
              </option>

              <option value="GBP">
                GBP — British Pound
              </option>

              <option value="EUR">
                EUR — Euro
              </option>
            </select>

          </div>


          <div className="settings-field">

            <label>
              Tax Rate (%)
            </label>

            <input
              type="number"
              name="taxRate"
              value={settings.taxRate}
              onChange={handleChange}
              min="0"
              step="0.01"
              disabled={!settings.taxEnabled}
            />

          </div>

        </div>


        <div className="settings-toggle">

          <div>
            <strong>
              Enable Tax / VAT
            </strong>

            <p>
              Apply tax calculations to
              applicable business transactions.
            </p>
          </div>

          <input
            type="checkbox"
            name="taxEnabled"
            checked={settings.taxEnabled}
            onChange={handleChange}
          />

        </div>

      </section>


      {/* ================================================= */}
      {/* DOCUMENT SETTINGS */}
      {/* ================================================= */}

      <section className="settings-card">

        <div className="settings-card-header">

          <h2>Document Settings</h2>

          <p>
            Customize the numbering prefixes
            used for your business documents.
          </p>

        </div>


        <div className="settings-grid">

          <div className="settings-field">

            <label>
              Invoice Prefix
            </label>

            <input
              type="text"
              name="invoicePrefix"
              value={
                settings.invoicePrefix
              }
              onChange={handleChange}
            />

          </div>


          <div className="settings-field">

            <label>
              Receipt Prefix
            </label>

            <input
              type="text"
              name="receiptPrefix"
              value={
                settings.receiptPrefix
              }
              onChange={handleChange}
            />

          </div>


          <div className="settings-field">

            <label>
              Quote Prefix
            </label>

            <input
              type="text"
              name="quotePrefix"
              value={
                settings.quotePrefix
              }
              onChange={handleChange}
            />

          </div>

        </div>

      </section>


      {/* ================================================= */}
      {/* NOTIFICATION SETTINGS */}
      {/* ================================================= */}

      <section className="settings-card">

        <div className="settings-card-header">

          <h2>Notifications</h2>

          <p>
            Choose which business events
            should generate notifications.
          </p>

        </div>


        <NotificationToggle
          title="Low Stock Alerts"
          description="Notify you when inventory reaches low stock levels."
          name="lowStockNotifications"
          checked={
            settings.lowStockNotifications
          }
          onChange={handleChange}
        />


        <NotificationToggle
          title="Order Notifications"
          description="Notify you when new orders are created."
          name="orderNotifications"
          checked={
            settings.orderNotifications
          }
          onChange={handleChange}
        />


        <NotificationToggle
          title="Invoice Notifications"
          description="Notify you about invoice activity."
          name="invoiceNotifications"
          checked={
            settings.invoiceNotifications
          }
          onChange={handleChange}
        />


        <NotificationToggle
          title="Payment Notifications"
          description="Notify you when payments are received."
          name="paymentNotifications"
          checked={
            settings.paymentNotifications
          }
          onChange={handleChange}
        />


        <NotificationToggle
          title="Team Notifications"
          description="Notify you about important team activity."
          name="teamNotifications"
          checked={
            settings.teamNotifications
          }
          onChange={handleChange}
        />

      </section>


      {/* ================================================= */}
      {/* SECURITY */}
      {/* ================================================= */}

      <section className="settings-card">

        <div className="settings-card-header">

          <h2>Security</h2>

          <p>
            Manage your account security.
          </p>

        </div>


        <button
          type="button"
          className="secondary-button"
        >
          Change Password
        </button>

      </section>


      {/* ================================================= */}
      {/* BOTTOM SAVE */}
      {/* ================================================= */}

      <div className="settings-footer">

        <button
          type="button"
          onClick={saveSettings}
          disabled={saving}
        >
          {saving
            ? "Saving..."
            : "Save Changes"}
        </button>

      </div>

    </div>
  );
}


// =====================================================
// NOTIFICATION TOGGLE
// =====================================================

function NotificationToggle({
  title,
  description,
  name,
  checked,
  onChange,
}) {
  return (
    <div className="settings-toggle">

      <div>

        <strong>
          {title}
        </strong>

        <p>
          {description}
        </p>

      </div>

      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
      />

    </div>
  );
}


export default Settings;