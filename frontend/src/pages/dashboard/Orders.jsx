import { useEffect, useState } from "react";
import api from "../../services/api";

function Orders() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);

  const [selectedCustomer, setSelectedCustomer] =
    useState("");

  const [cart, setCart] = useState([]);

  const [selectedProduct, setSelectedProduct] =
    useState("");

  const [quantity, setQuantity] = useState(1);

  const [paymentMethod, setPaymentMethod] =
    useState("cash");

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
        ordersResponse
      ] = await Promise.all([
        api.get("/products"),
        api.get("/customers"),
        api.get("/orders")
      ]);

      setProducts(productsResponse.data);
      setCustomers(customersResponse.data);
      setOrders(ordersResponse.data);

    } catch (error) {
      console.error("LOAD ORDERS ERROR:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load order data."
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
      setError("Quantity must be at least 1.");
      return;
    }

    const existingItem = cart.find(
      (item) => item.product === product._id
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
                  product.price *
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
          price: product.price,
          quantity: amount,
          subtotal:
            product.price * amount
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
        (item) => item.product !== productId
      )
    );
  };

  const updateCartQuantity = (
    productId,
    newQuantity
  ) => {
    const amount = Number(newQuantity);

    if (amount < 1) {
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

  const createOrder = async () => {
    if (cart.length === 0) {
      setError(
        "Add at least one product to the order."
      );
      return;
    }

    try {
      setCreating(true);
      setError("");
      setMessage("");

      const response = await api.post(
        "/orders",
        {
          customer:
            selectedCustomer || null,

          items: cart.map((item) => ({
            product: item.product,
            quantity: item.quantity
          })),

          paymentMethod
        }
      );

      setMessage(
        response.data.message ||
          "Order created successfully."
      );

      const orderId = response.data.order._id;

try {
  await api.post(
    `/receipts/from-order/${orderId}`
  );

  setMessage(
    "Sale completed and receipt created successfully."
  );
} catch (receiptError) {
  console.error(
    "RECEIPT ERROR:",
    receiptError
  );

  setMessage(
    "Sale completed, but receipt could not be created."
  );
}

      setCart([]);
      setSelectedCustomer("");
      setPaymentMethod("cash");

      await loadData();

    } catch (error) {
      console.error(
        "CREATE ORDER ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to create order."
      );
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div>
        <h1>Orders</h1>
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Orders / Sales</h1>

      {error && (
        <p>{error}</p>
      )}

      {message && (
        <p>{message}</p>
      )}

      <hr />

      <h2>Create Sale</h2>

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

          {customers.map((customer) => (
            <option
              key={customer._id}
              value={customer._id}
            >
              {customer.name}
            </option>
          ))}
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

          {products.map((product) => (
            <option
              key={product._id}
              value={product._id}
            >
              {product.name} - $
              {product.price}
            </option>
          ))}
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
            setQuantity(e.target.value)
          }
        />
      </div>

      <br />

      <button onClick={addToCart}>
        Add Product
      </button>

      <hr />

      <h2>Current Sale</h2>

      {cart.length === 0 ? (
        <p>
          No products added yet.
        </p>
      ) : (
        <div>

          {cart.map((item) => (
            <div key={item.product}>

              <h3>
                {item.name}
              </h3>

              <p>
                Price: ${item.price}
              </p>

              <label>
                Quantity:
              </label>

              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) =>
                  updateCartQuantity(
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

          <div>
            <label>
              Payment Method
            </label>

            <br />

            <select
              value={paymentMethod}
              onChange={(e) =>
                setPaymentMethod(
                  e.target.value
                )
              }
            >
              <option value="cash">
                Cash
              </option>

              <option value="ecocash">
                EcoCash
              </option>

              <option value="card">
                Card
              </option>

              <option value="bank">
                Bank
              </option>

              <option value="other">
                Other
              </option>
            </select>
          </div>

          <br />

          <button
            onClick={createOrder}
            disabled={creating}
          >
            {creating
              ? "Creating Sale..."
              : "Complete Sale"}
          </button>

        </div>
      )}

      <hr />

      <h2>
        Recent Orders
      </h2>

      {orders.length === 0 ? (
        <p>
          No orders yet.
        </p>
      ) : (
        <div>

          {orders.map((order) => (
            <div key={order._id}>

              <h3>
                Order #{order._id.slice(-6)}
              </h3>

              <p>
                Customer:{" "}
                {order.customer
                  ? order.customer.name
                  : "Walk-in Customer"}
              </p>

              <p>
                Total: $
                {order.total.toFixed(2)}
              </p>

              <p>
                Payment:{" "}
                {order.paymentMethod}
              </p>

              <p>
                Status:{" "}
                {order.status}
              </p>

              <hr />

            </div>
          ))}

        </div>
      )}

    </div>
  );
}

export default Orders;