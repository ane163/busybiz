const Order = require("../models/Order");
const Customer = require("../models/Customer");
const Product = require("../models/Product");

const {
  checkStock,
  reduceStock
} = require("./inventoryService");

const {
  createOrderNotification
} = require("./notificationService");


// =====================================================
// CREATE ORDER
// =====================================================

const createOrder = async ({
  business,
  user = null,
  customer = null,
  items,
  paymentMethod = "cash"
}) => {

  // ===================================================
  // VALIDATE BUSINESS
  // ===================================================

  if (!business) {
    const error = new Error(
      "Business information is required"
    );

    error.statusCode = 400;

    throw error;
  }


  // ===================================================
  // VALIDATE ITEMS
  // ===================================================

  if (
    !Array.isArray(items) ||
    items.length === 0
  ) {
    const error = new Error(
      "Order must contain at least one product"
    );

    error.statusCode = 400;

    throw error;
  }


  const businessId =
    business._id || business;


  // ===================================================
  // VALIDATE CUSTOMER
  // ===================================================

  let customerData = null;

  if (customer) {

    const customerId =
      customer._id || customer;

    customerData =
      await Customer.findOne({
        _id: customerId,
        business: businessId
      });

    if (!customerData) {

      const error = new Error(
        "Customer not found"
      );

      error.statusCode = 404;

      throw error;
    }


    // =================================================
    // BLOCKED CUSTOMER
    // =================================================

    if (
      customerData.status === "blocked" ||
      customerData.blocked === true ||
      customerData.isBlocked === true
    ) {

      const error = new Error(
        "This customer is blocked and cannot make new orders."
      );

      error.statusCode = 403;

      throw error;
    }
  }


  // ===================================================
  // PROCESS PRODUCTS
  // ===================================================

  const orderItems = [];

  const inventoryItems = [];

  let total = 0;


  for (
    const item of items
  ) {

    // ================================================
    // PRODUCT ID
    // ================================================

    if (!item || !item.product) {

      const error = new Error(
        "Product ID is required"
      );

      error.statusCode = 400;

      throw error;
    }


    // ================================================
    // GET PRODUCT
    // ================================================

    const product =
      await Product.findOne({
        _id: item.product,
        business: businessId
      });


    if (!product) {

      const error = new Error(
        `Product not found: ${item.product}`
      );

      error.statusCode = 404;

      throw error;
    }


    // ================================================
    // QUANTITY
    // ================================================

    const quantity =
      Number(item.quantity);


    if (
      !Number.isFinite(quantity) ||
      quantity < 1 ||
      !Number.isInteger(quantity)
    ) {

      const error = new Error(
        `Invalid quantity for ${product.name}`
      );

      error.statusCode = 400;

      throw error;
    }


    // ================================================
    // PRODUCT PRICE
    // ================================================

    const price =
      Number(product.price);


    if (
      !Number.isFinite(price) ||
      price < 0
    ) {

      const error = new Error(
        `Invalid price for ${product.name}`
      );

      error.statusCode = 400;

      throw error;
    }


    // ================================================
    // CHECK INVENTORY
    // ================================================

    const stock =
      await checkStock({
        business,
        product,
        quantity
      });


    // ================================================
    // SUBTOTAL
    // ================================================

    const subtotal =
      price * quantity;


    total += subtotal;


    // ================================================
    // ORDER ITEM
    // ================================================

    orderItems.push({

      product:
        product._id,

      name:
        product.name,

      price,

      quantity,

      subtotal

    });


    // ================================================
    // INVENTORY ITEM
    // ================================================

    inventoryItems.push({

      product,

      quantity,

      availableStock:
        stock.availableStock

    });
  }


  // ===================================================
  // PAYMENT METHOD VALIDATION
  // ===================================================

  const allowedPaymentMethods = [
    "cash",
    "ecocash",
    "card",
    "bank",
    "other"
  ];


  const selectedPaymentMethod =
    paymentMethod || "cash";


  if (
    !allowedPaymentMethods.includes(
      selectedPaymentMethod
    )
  ) {

    const error = new Error(
      `Invalid payment method: ${selectedPaymentMethod}`
    );

    error.statusCode = 400;

    throw error;
  }


  // ===================================================
  // CREATE ORDER
  // ===================================================

  const order =
    await Order.create({

      business:
        businessId,

      customer:
        customerData
          ? customerData._id
          : null,

      items:
        orderItems,

      total,

      paymentMethod:
        selectedPaymentMethod,

      paymentStatus:
        "paid",

      status:
        "completed"

    });


  // ===================================================
  // REDUCE INVENTORY
  // ===================================================

  const lowStockProducts = [];


  for (
    const item of inventoryItems
  ) {

    try {

      const result =
        await reduceStock({

          business,

          product:
            item.product,

          quantity:
            item.quantity,

          createNotification:
            true

        });


      if (
        result.isLowStock
      ) {

        lowStockProducts.push({

          product:
            item.product._id,

          name:
            item.product.name,

          quantity:
            result.quantity,

          lowStockLimit:
            result.lowStockLimit

        });

      }

    } catch (inventoryError) {

      // ==============================================
      // IMPORTANT:
      // The order has already been created.
      // Return the inventory error so it is visible.
      // ==============================================

      console.error(
        "ORDER INVENTORY ERROR:",
        inventoryError
      );

      throw inventoryError;
    }
  }


  // ===================================================
  // UPDATE CUSTOMER STATISTICS
  // ===================================================

  if (customerData) {

    try {

      const currentOrders =
        Number(
          customerData.totalOrders || 0
        );

      const currentSpent =
        Number(
          customerData.totalSpent || 0
        );


      if (
        Object.prototype.hasOwnProperty.call(
          customerData.toObject(),
          "totalOrders"
        )
      ) {

        customerData.totalOrders =
          currentOrders + 1;
      }


      if (
        Object.prototype.hasOwnProperty.call(
          customerData.toObject(),
          "totalSpent"
        )
      ) {

        customerData.totalSpent =
          currentSpent + total;
      }


      if (
        customerData.totalOrders !== undefined ||
        customerData.totalSpent !== undefined
      ) {

        await customerData.save();
      }

    } catch (customerError) {

      console.error(
        "CUSTOMER STATISTICS ERROR:",
        customerError
      );

      // Do not fail the order because of
      // optional customer statistics.
    }
  }


  // ===================================================
  // POPULATE ORDER
  // ===================================================

  const populatedOrder =
    await Order.findById(
      order._id
    )
      .populate("customer")
      .populate("items.product");


  // ===================================================
  // ORDER NOTIFICATION
  // ===================================================

  try {

    await createOrderNotification({

      business,

      order:
        populatedOrder,

      user:
        user
          ? user._id || user
          : null

    });

  } catch (notificationError) {

    console.error(
      "ORDER NOTIFICATION ERROR:",
      notificationError
    );

    // Notification failure should not
    // cancel a successful order.
  }


  // ===================================================
  // RETURN RESULT
  // ===================================================

  return {

    order:
      populatedOrder,

    lowStockProducts

  };
};


// =====================================================
// GET ORDERS
// =====================================================

const getOrders = async ({
  business
}) => {

  if (!business) {
    throw new Error(
      "Business information is required"
    );
  }

  const orders =
    await Order.find({
      business:
        business._id || business
    })
      .populate("customer")
      .sort({
        createdAt: -1
      });

  return orders;
};


// =====================================================
// GET ONE ORDER
// =====================================================

const getOrder = async ({
  business,
  orderId
}) => {

  if (!business) {
    throw new Error(
      "Business information is required"
    );
  }

  if (!orderId) {
    const error = new Error(
      "Order ID is required"
    );

    error.statusCode = 400;

    throw error;
  }


  const order =
    await Order.findOne({

      _id:
        orderId,

      business:
        business._id || business

    })
      .populate("customer")
      .populate("items.product");


  if (!order) {

    const error = new Error(
      "Order not found"
    );

    error.statusCode = 404;

    throw error;
  }


  return order;
};


// =====================================================
// DELETE ORDER
// =====================================================

const deleteOrder = async ({
  business,
  orderId
}) => {

  if (!business) {
    throw new Error(
      "Business information is required"
    );
  }

  if (!orderId) {
    const error = new Error(
      "Order ID is required"
    );

    error.statusCode = 400;

    throw error;
  }


  const order =
    await Order.findOne({
      _id: orderId,
      business:
        business._id || business
    });


  if (!order) {

    const error = new Error(
      "Order not found"
    );

    error.statusCode = 404;

    throw error;
  }


  await Order.findByIdAndDelete(
    order._id
  );


  return order;
};


// =====================================================
// GET SALES SUMMARY
// =====================================================

const getSalesSummary = async ({
  business
}) => {

  if (!business) {
    throw new Error(
      "Business information is required"
    );
  }


  const orders =
    await Order.find({
      business:
        business._id || business,

      status:
        "completed"
    });


  let totalSales = 0;
  let totalOrders = 0;
  let totalItemsSold = 0;


  for (
    const order of orders
  ) {

    totalOrders++;

    totalSales +=
      Number(order.total || 0);


    for (
      const item of order.items
    ) {

      totalItemsSold +=
        Number(item.quantity || 0);
    }
  }


  const averageOrderValue =
    totalOrders > 0
      ? totalSales / totalOrders
      : 0;


  return {

    totalSales,

    totalOrders,

    totalItemsSold,

    averageOrderValue

  };
};


// =====================================================
// EXPORT
// =====================================================

module.exports = {

  createOrder,

  getOrders,

  getOrder,

  deleteOrder,

  getSalesSummary

};