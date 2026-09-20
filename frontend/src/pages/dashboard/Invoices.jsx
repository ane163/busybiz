import { useEffect, useState } from "react";
import api from "../../services/api";

function Invoices() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]);

  const [selectedCustomer, setSelectedCustomer] =
    useState("");

  const [selectedProduct, setSelectedProduct] =
    useState("");

  const [quantity, setQuantity] = useState(1);

  const [dueDate, setDueDate] = useState("");

  const [notes, setNotes] = useState("");

  const [cart, setCart] = useState([]);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        productsResponse,
        customersResponse,
        invoicesResponse
      ] = await Promise.all([
        api.get("/products/my-products"),
        api.get("/customers"),
        api.get("/invoices")
      ]);

      setProducts(productsResponse.data);
      setCustomers(customersResponse.data);
      setInvoices(invoicesResponse.data);

    } catch (error) {
      console.error(
        "LOAD INVOICES ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load invoice data."
      );

    } finally {
      setLoading(false);
    }
  };

  const addToCart = () => {
    if (!selectedProduct) {
      setError("Please select a product.");
      return;
    }

    const product = products.find(
      (item) => item._id === selectedProduct
    );

    if (!product) {
      return;
    }

    const amount = Number(quantity);

    if (!amount || amount < 1) {
      setError(
        "Quantity must be at least 1."
      );
      return;
    }

    const existingItem = cart.find(
      (item) =>
        item.product === product._id
    );

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.product === product._id
            ? {
                ...item,
                quantity:
                  item.quantity + amount,
                subtotal:
                  Number(product.price) *
                  (item.quantity + amount)
              }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          product: product._id,
          name: product.name,
          price: Number(product.price),
          quantity: amount,
          subtotal:
            Number(product.price) * amount
        }
      ]);
    }

    setSelectedProduct("");
    setQuantity(1);
    setError("");
  };

  const removeFromCart = (productId) => {
    setCart(
      cart.filter(
        (item) =>
          item.product !== productId
      )
    );
  };

  const updateQuantity = (
    productId,
    value
  ) => {
    const amount = Number(value);

    if (!amount || amount < 1) {
      return;
    }

    setCart(
      cart.map((item) =>
        item.product === productId
          ? {
              ...item,
              quantity: amount,
              subtotal:
                item.price * amount
            }
          : item
      )
    );
  };

  const getTotal = () => {
    return cart.reduce(
      (total, item) =>
        total + item.subtotal,
      0
    );
  };

  const createInvoice = async () => {
    if (cart.length === 0) {
      setError(
        "Add at least one product."
      );
      return;
    }

    try {
      setCreating(true);
      setError("");
      setMessage("");

      const response =
        await api.post(
          "/invoices",
          {
            customer:
              selectedCustomer || null,

            items: cart.map((item) => ({
              product: item.product,
              quantity: item.quantity
            })),

            dueDate:
              dueDate || null,

            notes
          }
        );

      setMessage(
        "Invoice created successfully."
      );

      setCart([]);
      setSelectedCustomer("");
      setDueDate("");
      setNotes("");

      await loadData();

      console.log(
        "Created invoice:",
        response.data.invoice
      );

    } catch (error) {
      console.error(
        "CREATE INVOICE ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to create invoice."
      );

    } finally {
      setCreating(false);
    }
  };

  const updatePaymentStatus = async (
    invoiceId,
    paymentStatus
  ) => {
    try {
      setError("");

      await api.put(
        `/invoices/${invoiceId}/payment`,
        {
          paymentStatus
        }
      );

      await loadData();

    } catch (error) {
      console.error(
        "UPDATE PAYMENT ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to update payment status."
      );
    }
  };

  const printInvoice = (invoice) => {
    const printWindow =
      window.open(
        "",
        "_blank",
        "width=900,height=800"
      );

    if (!printWindow) {
      alert(
        "Please allow pop-ups to print the invoice."
      );
      return;
    }

    const customer =
      invoice.customer;

    const customerName =
      customer?.name ||
      "Walk-in Customer";

    const customerEmail =
      customer?.email ||
      "";

    const customerPhone =
      customer?.phone ||
      "";

    const itemsHTML =
      invoice.items
        .map(
          (item) => `
            <tr>
              <td>${item.name}</td>
              <td>${item.quantity}</td>
              <td>
                $${Number(
                  item.price
                ).toFixed(2)}
              </td>
              <td>
                $${Number(
                  item.subtotal
                ).toFixed(2)}
              </td>
            </tr>
          `
        )
        .join("");

    printWindow.document.write(`
      <html>

        <head>

          <title>
            ${invoice.invoiceNumber}
          </title>

          <style>

            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              color: #222;
            }

            .invoice {
              max-width: 850px;
              margin: auto;
            }

            .header {
              display: flex;
              justify-content: space-between;
              margin-bottom: 30px;
            }

            h1 {
              margin: 0;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 30px;
            }

            th,
            td {
              padding: 12px;
              border-bottom: 1px solid #ddd;
              text-align: left;
            }

            .total {
              text-align: right;
              font-size: 22px;
              font-weight: bold;
              margin-top: 25px;
            }

            .status {
              margin-top: 20px;
              font-weight: bold;
            }

            .notes {
              margin-top: 30px;
            }

          </style>

        </head>

        <body>

          <div class="invoice">

            <div class="header">

              <div>
                <h1>BUSYBIZ</h1>
                <p>
                  Business Invoice
                </p>
              </div>

              <div>
                <strong>
                  ${invoice.invoiceNumber}
                </strong>

                <p>
                  Date:
                  ${new Date(
                    invoice.issueDate
                  ).toLocaleDateString()}
                </p>

                ${
                  invoice.dueDate
                    ? `
                      <p>
                        Due:
                        ${new Date(
                          invoice.dueDate
                        ).toLocaleDateString()}
                      </p>
                    `
                    : ""
                }

              </div>

            </div>

            <hr />

            <h3>
              Bill To
            </h3>

            <p>
              ${customerName}
            </p>

            ${
              customerEmail
                ? <p>${customerEmail}</p>
                : ""
            }

            ${
              customerPhone
                ? <p>${customerPhone}</p>
                : ""
            }

            <table>

              <thead>

                <tr>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Subtotal</th>
                </tr>

              </thead>

              <tbody>
                ${itemsHTML}
              </tbody>

            </table>

            <p class="total">
              Total:
              $${Number(
                invoice.total
              ).toFixed(2)}
            </p>

            <p class="status">
              Payment Status:
              ${invoice.paymentStatus}
            </p>

            ${
              invoice.notes
                ? `
                  <div class="notes">
                    <strong>Notes:</strong>
                    <p>
                      ${invoice.notes}
                    </p>
                  </div>
                `
                : ""
            }

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

  if (loading) {
    return (
      <div>
        <h1>Invoices</h1>
        <p>Loading invoices...</p>
      </div>
    );
  }

  return (
    <div>

      <h1>Invoices</h1>

      {error && (
        <p>{error}</p>
      )}

      {message && (
        <p>{message}</p>
      )}

      <hr />

      <h2>
        Create Invoice
      </h2>

      <div>

        <label>
          Customer
        </label>

        <br />

        <select
          value={selectedCustomer}
          onChange={(e) =>
            setSelectedCustomer(
              e.target.value
            )
          }
        >

          <option value="">
            Walk-in Customer
          </option>

          {customers.map(
            (customer) => (
              <option
                key={customer._id}
                value={customer._id}
              >
                {customer.name}
              </option>
            )
          )}

        </select>

      </div>

      <br />

      <div>

        <label>
          Product
        </label>

        <br />

        <select
          value={selectedProduct}
          onChange={(e) =>
            setSelectedProduct(
              e.target.value
            )
          }
        >

          <option value="">
            Select Product
          </option>

          {products.map(
            (product) => (
              <option
                key={product._id}
                value={product._id}
              >
                {product.name} - $
                {product.price}
              </option>
            )
          )}

        </select>

      </div>

      <br />

      <div>

        <label>
          Quantity
        </label>

        <br />

        <input
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

      <br />

      <button onClick={addToCart}>
        Add Product
      </button>

      <hr />

      <h2>
        Invoice Items
      </h2>

      {cart.length === 0 ? (
        <p>
          No products added.
        </p>
      ) : (
        <div>

          {cart.map((item) => (
            <div
              key={item.product}
            >

              <h3>
                {item.name}
              </h3>

              <p>
                Price: $
                {item.price.toFixed(2)}
              </p>

              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) =>
                  updateQuantity(
                    item.product,
                    e.target.value
                  )
                }
              />

              <p>
                Subtotal: $
                {item.subtotal.toFixed(2)}
              </p>

              <button
                onClick={() =>
                  removeFromCart(
                    item.product
                  )
                }
              >
                Remove
              </button>

              <hr />

            </div>
          ))}

          <h2>
            Total: $
            {getTotal().toFixed(2)}
          </h2>

        </div>
      )}

      <div>

        <label>
          Due Date
        </label>

        <br />

        <input
          type="date"
          value={dueDate}
          onChange={(e) =>
            setDueDate(
              e.target.value
            )
          }
        />

      </div>

      <br />

      <div>

        <label>
          Notes
        </label>

        <br />

        <textarea
          value={notes}
          onChange={(e) =>
            setNotes(
              e.target.value
            )
          }
          placeholder="Optional invoice notes"
          rows="4"
        />

      </div>

      <br />

      <button
        onClick={createInvoice}
        disabled={creating}
      >
        {creating
          ? "Creating Invoice..."
          : "Create Invoice"}
      </button>

      <hr />

      <h2>
        My Invoices
      </h2>

      {invoices.length === 0 ? (
        <p>
          No invoices yet.
        </p>
      ) : (
        <div>

          {invoices.map(
            (invoice) => (
              <div
                key={invoice._id}
                style={{
                  border:
                    "1px solid #ccc",
                  padding: "20px",
                  marginBottom:
                    "15px"
                }}
              >

                <h3>
                  {invoice.invoiceNumber}
                </h3>

                <p>
                  Customer:{" "}
                  {invoice.customer
                    ?.name ||
                    "Walk-in Customer"}
                </p>

                <p>
                  Total: $
                  {Number(
                    invoice.total
                  ).toFixed(2)}
                </p>

                <p>
                  Due Date:{" "}
                  {invoice.dueDate
                    ? new Date(
                        invoice.dueDate
                      ).toLocaleDateString()
                    : "Not set"}
                </p>

                <p>
                  Payment Status:{" "}
                  {invoice.paymentStatus}
                </p>

                <select
                  value={
                    invoice.paymentStatus
                  }
                  onChange={(e) =>
                    updatePaymentStatus(
                      invoice._id,
                      e.target.value
                    )
                  }
                >

                  <option value="unpaid">
                    Unpaid
                  </option>

                  <option value="partially_paid">
                    Partially Paid
                  </option>

                  <option value="paid">
                    Paid
                  </option>

                  <option value="overdue">
                    Overdue
                  </option>

                  <option value="cancelled">
                    Cancelled
                  </option>

                </select>

                <br />
                <br />

                <button
                  onClick={() =>
                    printInvoice(
                      invoice
                    )
                  }
                >
                  Print Invoice
                </button>

              </div>
            )
          )}

        </div>
      )}

    </div>
  );
}

export default Invoices;