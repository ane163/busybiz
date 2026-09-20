import { useEffect, useState } from "react";
import api from "../../services/api";

function Receipts() {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadReceipts();
  }, []);

  const loadReceipts = async () => {
    try {
      setLoading(true);

      const response =
        await api.get("/receipts");

      setReceipts(response.data);

    } catch (error) {
      console.error(
        "GET RECEIPTS ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load receipts."
      );

    } finally {
      setLoading(false);
    }
  };

  const printReceipt = (receipt) => {
    const printWindow =
      window.open(
        "",
        "_blank",
        "width=800,height=800"
      );

    if (!printWindow) {
      alert(
        "Please allow pop-ups to print the receipt."
      );
      return;
    }

    const customerName =
      receipt.customer?.name ||
      "Walk-in Customer";

    const itemsHTML =
      receipt.items
        .map(
          (item) => `
            <tr>
              <td>${item.name}</td>
              <td>${item.quantity}</td>
              <td>$${Number(
                item.price
              ).toFixed(2)}</td>
              <td>$${Number(
                item.subtotal
              ).toFixed(2)}</td>
            </tr>
          `
        )
        .join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>BusyBiz Receipt</title>

          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 30px;
            }

            .receipt {
              max-width: 700px;
              margin: auto;
            }

            h1 {
              text-align: center;
            }

            .center {
              text-align: center;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }

            th,
            td {
              border-bottom: 1px solid #ddd;
              padding: 10px;
              text-align: left;
            }

            .total {
              text-align: right;
              font-size: 20px;
              font-weight: bold;
              margin-top: 20px;
            }

            .footer {
              text-align: center;
              margin-top: 40px;
            }
          </style>
        </head>

        <body>

          <div class="receipt">

            <h1>BUSYBIZ</h1>

            <p class="center">
              Business Receipt
            </p>

            <hr />

            <p>
              <strong>Customer:</strong>
              ${customerName}
            </p>

            <p>
              <strong>Receipt:</strong>
              ${receipt._id}
            </p>

            <p>
              <strong>Date:</strong>
              ${new Date(
                receipt.createdAt
              ).toLocaleString()}
            </p>

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

            <p>
              <strong>
                Payment:
              </strong>
              ${receipt.paymentMethod}
            </p>

            <p class="total">
              Total:
              $${Number(
                receipt.total
              ).toFixed(2)}
            </p>

            <div class="footer">
              Thank you for your business!
              <br />
              Powered by BusyBiz
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

  if (loading) {
    return (
      <div>
        <h1>Receipts</h1>
        <p>Loading receipts...</p>
      </div>
    );
  }

  return (
    <div>

      <h1>Receipts</h1>

      {error && (
        <p>{error}</p>
      )}

      {receipts.length === 0 ? (
        <p>
          No receipts yet.
        </p>
      ) : (
        receipts.map((receipt) => (
          <div
            key={receipt._id}
            style={{
              border: "1px solid #ccc",
              padding: "20px",
              marginBottom: "15px"
            }}
          >

            <h3>
              Receipt #
              {receipt._id.slice(-6)}
            </h3>

            <p>
              Customer:{" "}
              {receipt.customer?.name ||
                "Walk-in Customer"}
            </p>

            <p>
              Total: $
              {Number(
                receipt.total
              ).toFixed(2)}
            </p>

            <p>
              Payment:{" "}
              {receipt.paymentMethod}
            </p>

            <p>
              Date:{" "}
              {new Date(
                receipt.createdAt
              ).toLocaleString()}
            </p>

            <button
              onClick={() =>
                printReceipt(receipt)
              }
            >
              Print Receipt
            </button>

          </div>
        ))
      )}

    </div>
  );
}

export default Receipts;