const Inventory = require("../models/Inventory");
const Product = require("../models/Product");

const {
  createLowStockNotification
} = require("./notificationService");


// =====================================================
// GET INVENTORY
// =====================================================

const getInventory = async ({
  business,
  product
}) => {

  if (!business) {
    throw new Error(
      "Business information is required"
    );
  }

  if (!product) {
    throw new Error(
      "Product information is required"
    );
  }

  const inventory =
    await Inventory.findOne({
      business:
        business._id || business,

      product:
        product._id || product
    });

  return inventory;
};


// =====================================================
// GET STOCK QUANTITY
// =====================================================

const getStockQuantity = async ({
  business,
  product
}) => {

  const inventory =
    await getInventory({
      business,
      product
    });

  if (!inventory) {
    return 0;
  }

  return Number(
    inventory.quantity || 0
  );
};


// =====================================================
// CHECK STOCK
// =====================================================

const checkStock = async ({
  business,
  product,
  quantity
}) => {

  const requestedQuantity =
    Number(quantity);

  if (
    !Number.isFinite(
      requestedQuantity
    ) ||
    requestedQuantity < 1
  ) {
    throw new Error(
      "Invalid quantity"
    );
  }

  const inventory =
    await getInventory({
      business,
      product
    });

  const availableStock =
    inventory
      ? Number(inventory.quantity || 0)
      : 0;

  if (
    availableStock <
    requestedQuantity
  ) {

    const productName =
      product.name ||
      "Product";

    const error =
      new Error(
        `Not enough stock for ${productName}. ` +
        `Available: ${availableStock}`
      );

    error.statusCode = 400;

    throw error;
  }

  return {
    availableStock,
    requestedQuantity,
    inventory
  };
};


// =====================================================
// CREATE INVENTORY
// =====================================================

const createInventory = async ({
  business,
  product,
  quantity = 0,
  lowStockLimit = 5
}) => {

  if (!business) {
    throw new Error(
      "Business information is required"
    );
  }

  if (!product) {
    throw new Error(
      "Product information is required"
    );
  }

  const productId =
    product._id || product;

  const existingInventory =
    await Inventory.findOne({
      business:
        business._id || business,

      product:
        productId
    });

  if (existingInventory) {
    return existingInventory;
  }

  const stock =
    Number(quantity);

  const limit =
    Number(lowStockLimit);

  if (
    !Number.isFinite(stock) ||
    stock < 0
  ) {
    throw new Error(
      "Invalid inventory quantity"
    );
  }

  if (
    !Number.isFinite(limit) ||
    limit < 0
  ) {
    throw new Error(
      "Invalid low stock limit"
    );
  }

  const inventory =
    await Inventory.create({

      business:
        business._id || business,

      product:
        productId,

      quantity:
        stock,

      lowStockLimit:
        limit

    });

  return inventory;
};


// =====================================================
// ADD STOCK
// =====================================================

const addStock = async ({
  business,
  product,
  quantity,
  lowStockLimit
}) => {

  const amount =
    Number(quantity);

  if (
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    throw new Error(
      "Stock quantity must be greater than zero"
    );
  }

  const productId =
    product._id || product;

  let inventory =
    await Inventory.findOne({
      business:
        business._id || business,

      product:
        productId
    });

  if (!inventory) {

    inventory =
      await createInventory({
        business,
        product,
        quantity: amount,
        lowStockLimit:
          lowStockLimit !== undefined
            ? lowStockLimit
            : 5
      });

  } else {

    inventory.quantity =
      Number(inventory.quantity || 0) +
      amount;

    if (
      lowStockLimit !== undefined
    ) {

      const limit =
        Number(lowStockLimit);

      if (
        Number.isFinite(limit) &&
        limit >= 0
      ) {
        inventory.lowStockLimit =
          limit;
      }
    }

    await inventory.save();
  }

  return inventory;
};


// =====================================================
// REDUCE STOCK
// =====================================================

const reduceStock = async ({
  business,
  product,
  quantity,
  createNotification = true
}) => {

  const amount =
    Number(quantity);

  if (
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    throw new Error(
      "Stock quantity must be greater than zero"
    );
  }

  const productId =
    product._id || product;

  const inventory =
    await Inventory.findOne({
      business:
        business._id || business,

      product:
        productId
    });

  if (!inventory) {

    const error =
      new Error(
        "Inventory record not found"
      );

    error.statusCode = 404;

    throw error;
  }

  const currentStock =
    Number(
      inventory.quantity || 0
    );

  if (
    currentStock <
    amount
  ) {

    const error =
      new Error(
        `Not enough stock. ` +
        `Available: ${currentStock}`
      );

    error.statusCode = 400;

    throw error;
  }

  inventory.quantity =
    currentStock - amount;

  await inventory.save();


  // ===================================================
  // LOW STOCK
  // ===================================================

  const lowStockLimit =
    Number(
      inventory.lowStockLimit || 0
    );

  const isLowStock =
    inventory.quantity <=
    lowStockLimit;


  if (
    isLowStock &&
    createNotification
  ) {

    try {

      let productData =
        product;

      if (
        typeof product === "string" ||
        !product.name
      ) {

        productData =
          await Product.findById(
            productId
          );
      }

      if (productData) {

        await createLowStockNotification({

          business,

          product:
            productData,

          quantity:
            inventory.quantity,

          lowStockLimit

        });

      }

    } catch (notificationError) {

      console.error(
        "LOW STOCK NOTIFICATION ERROR:",
        notificationError
      );

    }
  }


  return {
    inventory,
    quantity:
      inventory.quantity,

    lowStockLimit,

    isLowStock
  };
};


// =====================================================
// SET STOCK
// =====================================================

const setStock = async ({
  business,
  product,
  quantity,
  lowStockLimit
}) => {

  const stock =
    Number(quantity);

  if (
    !Number.isFinite(stock) ||
    stock < 0
  ) {
    throw new Error(
      "Invalid stock quantity"
    );
  }

  const productId =
    product._id || product;

  let inventory =
    await Inventory.findOne({
      business:
        business._id || business,

      product:
        productId
    });

  if (!inventory) {

    inventory =
      await createInventory({
        business,
        product,
        quantity: stock,
        lowStockLimit:
          lowStockLimit !== undefined
            ? lowStockLimit
            : 5
      });

  } else {

    inventory.quantity =
      stock;

    if (
      lowStockLimit !== undefined
    ) {

      const limit =
        Number(lowStockLimit);

      if (
        !Number.isFinite(limit) ||
        limit < 0
      ) {
        throw new Error(
          "Invalid low stock limit"
        );
      }

      inventory.lowStockLimit =
        limit;
    }

    await inventory.save();
  }

  return inventory;
};


// =====================================================
// UPDATE LOW STOCK LIMIT
// =====================================================

const updateLowStockLimit = async ({
  business,
  product,
  lowStockLimit
}) => {

  const limit =
    Number(lowStockLimit);

  if (
    !Number.isFinite(limit) ||
    limit < 0
  ) {
    throw new Error(
      "Invalid low stock limit"
    );
  }

  const productId =
    product._id || product;

  const inventory =
    await Inventory.findOne({
      business:
        business._id || business,

      product:
        productId
    });

  if (!inventory) {

    const error =
      new Error(
        "Inventory record not found"
      );

    error.statusCode = 404;

    throw error;
  }

  inventory.lowStockLimit =
    limit;

  await inventory.save();

  return inventory;
};


// =====================================================
// GET LOW STOCK PRODUCTS
// =====================================================

const getLowStockProducts = async ({
  business
}) => {

  if (!business) {
    throw new Error(
      "Business information is required"
    );
  }

  const inventory =
    await Inventory.find({

      business:
        business._id || business,

      $expr: {
        $lte: [
          "$quantity",
          "$lowStockLimit"
        ]
      }

    })
      .populate("product")
      .sort({
        quantity: 1
      });

  return inventory;
};


// =====================================================
// GET OUT OF STOCK PRODUCTS
// =====================================================

const getOutOfStockProducts = async ({
  business
}) => {

  if (!business) {
    throw new Error(
      "Business information is required"
    );
  }

  const inventory =
    await Inventory.find({

      business:
        business._id || business,

      quantity: {
        $lte: 0
      }

    })
      .populate("product")
      .sort({
        createdAt: -1
      });

  return inventory;
};


// =====================================================
// GET INVENTORY SUMMARY
// =====================================================

const getInventorySummary = async ({
  business
}) => {

  if (!business) {
    throw new Error(
      "Business information is required"
    );
  }

  const businessId =
    business._id || business;

  const inventory =
    await Inventory.find({
      business:
        businessId
    });

  let totalProducts = 0;
  let totalUnits = 0;
  let lowStockProducts = 0;
  let outOfStockProducts = 0;

  for (
    const item of inventory
  ) {

    const quantity =
      Number(
        item.quantity || 0
      );

    const limit =
      Number(
        item.lowStockLimit || 0
      );

    totalProducts++;

    totalUnits +=
      quantity;

    if (
      quantity <= 0
    ) {

      outOfStockProducts++;

    } else if (
      quantity <= limit
    ) {

      lowStockProducts++;

    }
  }

  return {

    totalProducts,

    totalUnits,

    lowStockProducts,

    outOfStockProducts

  };
};


// =====================================================
// EXPORT
// =====================================================

module.exports = {

  getInventory,

  getStockQuantity,

  checkStock,

  createInventory,

  addStock,

  reduceStock,

  setStock,

  updateLowStockLimit,

  getLowStockProducts,

  getOutOfStockProducts,

  getInventorySummary

};