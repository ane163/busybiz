import { useEffect, useState } from "react";
import api from "../../services/api";

function Quotes() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [quotes, setQuotes] = useState([]);

  const [customer, setCustomer] = useState("");
  const [product, setProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [expiryDate, setExpiryDate] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =====================================================
  // LOAD PRODUCTS
  // =====================================================

  const loadProducts = async () => {
    try {
      const response = await api.get(
        "/products/my-products"
      );

      console.log("PRODUCTS:", response.data);

      if (Array.isArray(response.data)) {
        setProducts(response.data);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error("PRODUCTS ERROR:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load products."
      );
    }
  };


  // =====================================================
  // LOAD CUSTOMERS
  // =====================================================

  const loadCustomers = async () => {
    try {
      const response = await api.get(
        "/customers"
      );

      console.log("CUSTOMERS:", response.data);

      if (Array.isArray(response.data)) {
        setCustomers(response.data);
      } else {
        setCustomers([]);
      }
    } catch (err) {
      console.error("CUSTOMERS ERROR:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load customers."
      );
    }
  };


  // =====================================================
  // LOAD QUOTES
  // =====================================================

  const loadQuotes = async () => {
    try {
      const response = await api.get(
        "/quotes"
      );

      console.log("QUOTES:", response.data);

      if (Array.isArray(response.data)) {
        setQuotes(response.data);
      } else {
        setQuotes([]);
      }
    } catch (err) {
      console.error("QUOTES ERROR:", err);
    }
  };


  // =====================================================
  // LOAD EVERYTHING
  // =====================================================

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      await Promise.all([
        loadProducts(),
        loadCustomers(),
        loadQuotes()
      ]);
    } catch (err) {
      console.error(
        "LOAD QUOTES DATA ERROR:",
        err
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadData();
  }, []);


  // =====================================================
  // CREATE QUOTE
  // =====================================================

  const handleCreateQuote = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!product) {
      setError(
        "Please select a product."
      );
      return;
    }

    if (
      !quantity ||
      Number(quantity) < 1
    ) {
      setError(
        "Quantity must be at least 1."
      );
      return;
    }

    try {
      setSaving(true);

      const quoteData = {
        customer:
          customer || null,

        items: [
          {
            product: product,
            quantity: Number(quantity)
          }
        ],

        expiryDate:
          expiryDate || null,

        notes:
          notes || ""
      };

      console.log(
        "CREATING QUOTE:",
        quoteData
      );

      const response =
        await api.post(
          "/quotes",
          quoteData
        );

      console.log(
        "CREATE QUOTE RESPONSE:",
        response.data
      );

      setSuccess(
        response.data?.message ||
          "Quote created successfully."
      );

      // Reset form
      setCustomer("");
      setProduct("");
      setQuantity(1);
      setExpiryDate("");
      setNotes("");

      // Reload quotes
      await loadQuotes();

    } catch (err) {
      console.error(
        "CREATE QUOTE ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to create quote."
      );

    } finally {
      setSaving(false);
    }
  };


  // =====================================================
  // PRINT QUOTE
  // =====================================================

  const handlePrintQuote = (quote) => {
    const printWindow =
      window.open(
        "",
        "_blank"
      );

    if (!printWindow) {
      alert(
        "Please allow pop-ups in your browser to print the quote."
      );

      return;
    }


    const customerName =
      quote.customer?.name ||
      "Walk-in Customer";


    const customerEmail =
      quote.customer?.email ||
      "";


    const customerPhone =
      quote.customer?.phone ||
      "";


    const items =
      quote.items || [];


    const itemsHTML =
      items
        .map(
          (item) => `
            <tr>
              <td>
                ${item.name || ""}
              </td>

              <td>
                ${item.quantity || 0}
              </td>

              <td>
                $${Number(
                  item.price || 0
                ).toFixed(2)}
              </td>

              <td>
                $${Number(
                  item.subtotal || 0
                ).toFixed(2)}
              </td>
            </tr>
          `
        )
        .join("");


    const quoteDate =
      quote.createdAt
        ? new Date(
            quote.createdAt
          ).toLocaleDateString()
        : "";


    const expiry =
      quote.expiryDate
        ? new Date(
            quote.expiryDate
          ).toLocaleDateString()
        : "";


    printWindow.document.write(`
      <!DOCTYPE html>

      <html>

      <head>

        <title>
          ${quote.quoteNumber || "Quote"}
        </title>

        <style>

          * {
            box-sizing: border-box;
          }

          body {
            font-family:
              Arial,
              Helvetica,
              sans-serif;

            margin: 0;

            padding: 40px;

            color: #222;

            background: white;
          }

          .quote {
            max-width: 800px;

            margin: 0 auto;
          }

          .header {
            display: flex;

            justify-content: space-between;

            align-items: flex-start;

            border-bottom:
              2px solid #222;

            padding-bottom: 20px;

            margin-bottom: 30px;
          }

          .business-name {
            font-size: 28px;

            font-weight: bold;

            margin-bottom: 5px;
          }

          .business-subtitle {
            color: #666;

            font-size: 14px;
          }

          .quote-title {
            text-align: right;
          }

          .quote-title h1 {
            margin: 0;

            font-size: 32px;

            letter-spacing: 2px;
          }

          .quote-number {
            margin-top: 8px;

            font-weight: bold;
          }

          .quote-date {
            margin-top: 5px;

            color: #666;
          }

          .customer {
            margin-bottom: 30px;
          }

          .customer h3 {
            margin-bottom: 8px;
          }

          .customer-name {
            font-weight: bold;

            font-size: 16px;
          }

          .customer-detail {
            margin-top: 4px;

            color: #555;
          }

          table {
            width: 100%;

            border-collapse:
              collapse;

            margin-top: 20px;
          }

          th {
            background: #f2f2f2;

            text-align: left;

            font-weight: bold;
          }

          th,
          td {
            padding: 12px;

            border-bottom:
              1px solid #ddd;
          }

          .totals {
            width: 300px;

            margin-left: auto;

            margin-top: 30px;
          }

          .total-row {
            display: flex;

            justify-content:
              space-between;

            padding: 8px 0;
          }

          .grand-total {
            border-top:
              2px solid #222;

            margin-top: 8px;

            padding-top: 12px;

            font-size: 20px;

            font-weight: bold;
          }

          .quote-extra {
            margin-top: 35px;
          }

          .quote-extra h3 {
            margin-bottom: 8px;
          }

          .footer {
            margin-top: 60px;

            padding-top: 20px;

            border-top:
              1px solid #ddd;

            text-align: center;

            color: #777;

            font-size: 13px;
          }

          @media print {

            body {
              padding: 20px;
            }

            .quote {
              max-width: none;
            }

          }

        </style>

      </head>


      <body>

        <div class="quote">


          <!-- HEADER -->

          <div class="header">

            <div>

              <div class="business-name">
                BusyBiz
              </div>

              <div class="business-subtitle">
                Business Management System
              </div>

            </div>


            <div class="quote-title">

              <h1>
                QUOTE
              </h1>

              <div class="quote-number">
                ${
                  quote.quoteNumber ||
                  ""
                }
              </div>

              <div class="quote-date">
                ${quoteDate}
              </div>

            </div>

          </div>


          <!-- CUSTOMER -->

          <div class="customer">

            <h3>
              Customer
            </h3>

            <div class="customer-name">
              ${customerName}
            </div>

            ${
              customerEmail
                ? `
                  <div class="customer-detail">
                    ${customerEmail}
                  </div>
                `
                : ""
            }

            ${
              customerPhone
                ? `
                  <div class="customer-detail">
                    ${customerPhone}
                  </div>
                `
                : ""
            }

          </div>


          <!-- ITEMS -->

          <table>

            <thead>

              <tr>

                <th>
                  Product
                </th>

                <th>
                  Quantity
                </th>

                <th>
                  Price
                </th>

                <th>
                  Subtotal
                </th>

              </tr>

            </thead>


            <tbody>

              ${itemsHTML}

            </tbody>

          </table>


          <!-- TOTALS -->

          <div class="totals">

            <div class="total-row">

              <span>
                Subtotal
              </span>

              <span>
                $${Number(
                  quote.subtotal ||
                    0
                ).toFixed(2)}
              </span>

            </div>


            <div class="total-row grand-total">

              <span>
                Total
              </span>

              <span>
                $${Number(
                  quote.total ||
                    0
                ).toFixed(2)}
              </span>

            </div>

          </div>


          <!-- EXPIRY -->

          ${
            expiry
              ? `
                <div class="quote-extra">

                  <h3>
                    Quote Valid Until
                  </h3>

                  <p>
                    ${expiry}
                  </p>

                </div>
              `
              : ""
          }


          <!-- NOTES -->

          ${
            quote.notes
              ? `
                <div class="quote-extra">

                  <h3>
                    Notes
                  </h3>

                  <p>
                    ${quote.notes}
                  </p>

                </div>
              `
              : ""
          }


          <!-- FOOTER -->

          <div class="footer">

            Thank you for your business.

            <br />

            Generated by BusyBiz

          </div>


        </div>


        <script>

          window.onload = function () {

            window.print();

          };

        </script>


      </body>

      </html>
    `);


    printWindow.document.close();
  };


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="quotes-page">

        <div className="quotes-container">

          <h1 className="quotes-title">
            Quotes
          </h1>

          <p className="quotes-loading">
            Loading quotes...
          </p>

        </div>

      </div>
    );
  }


  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="quotes-page">

      <div className="quotes-container">


        {/* HEADER */}

        <div className="quotes-header">

          <div>

            <h1 className="quotes-title">
              Quotes
            </h1>

            <p className="quotes-subtitle">
              Create and manage
              customer quotations.
            </p>

          </div>


          <button
            type="button"
            className="quotes-refresh-button"
            onClick={loadData}
          >
            Refresh
          </button>

        </div>


        {/* ERROR */}

        {error && (
          <div className="quotes-alert quotes-error">
            {error}
          </div>
        )}


        {/* SUCCESS */}

        {success && (
          <div className="quotes-alert quotes-success">
            {success}
          </div>
        )}


        {/* CREATE QUOTE */}

        <div className="quotes-card">

          <h2 className="quotes-card-title">
            Create Quote
          </h2>


          <form
            className="quotes-form"
            onSubmit={
              handleCreateQuote
            }
          >


            {/* CUSTOMER */}

            <div className="quotes-field">

              <label
                className="quotes-label"
                htmlFor="customer"
              >
                Customer
              </label>


              <select
                id="customer"
                className="quotes-input"
                value={customer}
                onChange={(e) =>
                  setCustomer(
                    e.target.value
                  )
                }
              >

                <option value="">
                  Walk-in Customer
                </option>


                {customers.map(
                  (item) => (
                    <option
                      key={item._id}
                      value={item._id}
                    >
                      {item.name}
                    </option>
                  )
                )}

              </select>

            </div>


            {/* PRODUCT */}

            <div className="quotes-field">

              <label
                className="quotes-label"
                htmlFor="product"
              >
                Product
              </label>


              <select
                id="product"
                className="quotes-input"
                value={product}
                onChange={(e) =>
                  setProduct(
                    e.target.value
                  )
                }
              >

                <option value="">
                  Select Product
                </option>


                {products.map(
                  (item) => (
                    <option
                      key={item._id}
                      value={item._id}
                    >
                      {item.name} - $
                      {Number(
                        item.price || 0
                      ).toFixed(2)}
                    </option>
                  )
                )}

              </select>

            </div>


            {/* QUANTITY */}

            <div className="quotes-field">

              <label
                className="quotes-label"
                htmlFor="quantity"
              >
                Quantity
              </label>


              <input
                id="quantity"
                className="quotes-input"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) =>
                  setQuantity(
                    e.target.value
                  )
                }
              />

            </div>


            {/* EXPIRY DATE */}

            <div className="quotes-field">

              <label
                className="quotes-label"
                htmlFor="expiryDate"
              >
                Expiry Date
              </label>


              <input
                id="expiryDate"
                className="quotes-input"
                type="date"
                value={expiryDate}
                onChange={(e) =>
                  setExpiryDate(
                    e.target.value
                  )
                }
              />

            </div>


            {/* NOTES */}

            <div className="quotes-field quotes-field-full">

              <label
                className="quotes-label"
                htmlFor="notes"
              >
                Notes
              </label>


              <textarea
                id="notes"
                className="quotes-textarea"
                rows="4"
                value={notes}
                onChange={(e) =>
                  setNotes(
                    e.target.value
                  )
                }
                placeholder="Additional notes..."
              />

            </div>


            {/* BUTTON */}

            <div className="quotes-actions">

              <button
                type="submit"
                className="quotes-create-button"
                disabled={saving}
              >

                {saving
                  ? "Creating Quote..."
                  : "Create Quote"}

              </button>

            </div>

          </form>

        </div>


        {/* EXISTING QUOTES */}

        <div className="quotes-card">

          <h2 className="quotes-card-title">
            Existing Quotes
          </h2>


          {quotes.length === 0 ? (

            <div className="quotes-empty">

              <h3>
                No quotes yet
              </h3>

              <p>
                Create your first
                quote above.
              </p>

            </div>

          ) : (

            <div className="quotes-table-wrapper">

              <table className="quotes-table">

                <thead>

                  <tr>

                    <th>
                      Quote
                    </th>

                    <th>
                      Customer
                    </th>

                    <th>
                      Total
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Date
                    </th>

                    <th>
                      Actions
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {quotes.map(
                    (quote) => (

                      <tr
                        key={
                          quote._id
                        }
                      >

                        <td>
                          {
                            quote.quoteNumber ||
                            quote._id
                          }
                        </td>


                        <td>
                          {
                            quote.customer
                              ?.name ||
                            "Walk-in Customer"
                          }
                        </td>


                        <td>
                          $
                          {Number(
                            quote.total ||
                              0
                          ).toFixed(2)}
                        </td>


                        <td>
                          {
                            quote.status ||
                            "draft"
                          }
                        </td>


                        <td>
                          {quote.createdAt
                            ? new Date(
                                quote.createdAt
                              ).toLocaleDateString()
                            : "-"}
                        </td>


                        <td>

                          <button
                            type="button"
                            className="quotes-print-button"
                            onClick={() =>
                              handlePrintQuote(
                                quote
                              )
                            }
                          >
                            Print
                          </button>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>

    </div>
  );
}


export default Quotes;