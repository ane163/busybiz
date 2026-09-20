const mongoose = require("mongoose");

const Order = require("../models/Order");
const Customer = require("../models/Customer");
const Product = require("../models/Product");
const Inventory = require("../models/Inventory");

const {
  createOrderNotification,
  createLowStockNotification
} = require("./notificationService");


// =====================================================
// PLAN ORDER LIMITS
// =====================================================

const ORDER_LIMITS = {
  free: 100,
  starter: 2000,
  professional: Infinity
};


// =====================================================
// VALIDATE MONGODB ID
// =====================================================

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};


// =====================================================
// CHECK ORDER LIMIT
// =====================================================

const checkOrderLimit = async ({
  business,
  subscription
}) => {

  const plan =
    subscription?.plan || "free";

  const limit =
    ORDER_LIMITS[plan];

  const orderCount =
    await Order.countDocuments({
      business: business._id
    });

  if (
    limit !== Infinity &&
    orderCount >= limit
  ) {

    throw new Error(
      `${plan.charAt(0).toUpperCase() + plan.slice(1)} plan limit reached. ` +
      `You can have up to ${limit.toLocaleString()} orders.`
    );
  }

  return {
    plan,
    limit,
    currentCount: orderCount
  };
};


// =====================================================
// VALIDATE CUSTOMER
// =====================================================

const validateCustomer = async ({
  business,
  customer
}) => {

  if (!customer) {
    return null;
  }

  if (!isValidObjectId(customer)) {
    throw new Error(
      "Invalid customer ID"
    );
  }

  const customerExists =
    await Customer.findOne({
      _id: customer,
      business: business._id
    });

  if (!customerExists) {
    throw new Error(
      "Customer not found"
    );
  }


  // -----------------------------------------------
  // BLOCKED CUSTOMER CHECK
  // -----------------------------------------------

  if (
    customerExists.status === "blocked"
  ) {

    throw new Error(
      "This customer is blocked and cannot place an order."
    );
  }

  if (
    customerExists.isBlocked === true
  ) {

    throw new Error(
      "This customer is blocked and cannot place an order."
    );
  }

  return customerExists;
};


// =====================================================
// VALIDATE PAYMENT METHOD
// =====================================================

const validatePaymentMethod = (
  paymentMethod
) => {

  const allowedMethods = [
    "cash",
    "ecocash",
    "card",
    "bank",
    "other"
  ];


  const method =
    paymentMethod || "cash";


  if (
    !allowedMethods.includes(method)
  ) {

    throw new Error(
      `Invalid payment method: ${method}`
    );
  }


  return method;
};


// =====================================================
// VALIDATE AND PREPARE PRODUCTS
// =====================================================

const prepareOrderItems = async ({
  business,
  items
}) => {

  if (
    !Array.isArray(items) ||
    items.length === 0
  ) {

    throw new Error(
      "Order must contain at least one product"
    );
  }


  const orderItems = [];

  const inventoryChanges = [];

  let total = 0;


  for (
    const item of items
  ) {

    // -----------------------------------------------
    // PRODUCT ID
    // -----------------------------------------------

    if (!item?.product) {

      throw new Error(
        "Product ID is required"
      );
    }


    if (
      !isValidObjectId(
        item.product
      )
    ) {

      throw new Error(
        `Invalid product ID: ${item.product}`
      );
    }


    // -----------------------------------------------
    // FIND PRODUCT
    // -----------------------------------------------

    const product =
      await Product.findOne({

        _id:
          item.product,

        business:
          business._id

      });


    if (!product) {

      throw new Error(
        `Product not found: ${item.product}`
      );
    }


    // -----------------------------------------------
    // QUANTITY
    // -----------------------------------------------

    const quantity =
      Number(
        item.quantity
      );


    if (
      !Number.isInteger(quantity) ||
      quantity < 1
    ) {

      throw new Error(
        `Invalid quantity for ${product.name}`
      );
    }


    // -----------------------------------------------
    // SELLING PRICE
    // -----------------------------------------------

    const price =
      Number(
        product.price
      );


    if (
      !Number.isFinite(price) ||
      price < 0
    ) {

      throw new Error(
        `Invalid price for ${product.name}`
      );
    }


    // -----------------------------------------------
    // COST PRICE
    // -----------------------------------------------

    /*
     * This is the amount the business paid
     * to acquire or produce the product.
     *
     * We store this value inside the order as
     * a snapshot.
     *
     * This is extremely important for historical
     * profit calculations.
     *
     * Example:
     *
     * Product cost today = $10
     *
     * Customer buys 3
     *
     * Order stores:
     *
     * costPrice = $10
     * quantity  = 3
     *
     * COGS = $30
     *
     * If the product cost later changes to $12,
     * the old order still uses $10.
     */

    const costPrice =
      Number(
        product.costPrice || 0
      );


    if (
      !Number.isFinite(costPrice) ||
      costPrice < 0
    ) {

      throw new Error(
        `Invalid cost price for ${product.name}`
      );
    }


    // -----------------------------------------------
    // INVENTORY
    // -----------------------------------------------

    const inventory =
      await Inventory.findOne({

        business:
          business._id,

        product:
          product._id

      });


    const availableStock =
      inventory
        ? Number(
            inventory.quantity
          )
        : 0;


    if (
      availableStock < quantity
    ) {

      throw new Error(
        `Not enough stock for ${product.name}. ` +
        `Available: ${availableStock}`
      );
    }


    // -----------------------------------------------
    // SUBTOTAL
    // -----------------------------------------------

    const subtotal =
      price * quantity;


    total += subtotal;


    // -----------------------------------------------
    // ORDER ITEM
    // -----------------------------------------------

    orderItems.push({

      product:
        product._id,

      name:
        product.name,

      price,

      costPrice,

      quantity,

      subtotal

    });


    // -----------------------------------------------
    // INVENTORY CHANGE
    // -----------------------------------------------

    inventoryChanges.push({

      product:
        product._id,

      name:
        product.name,

      quantity,

      availableStock,

      lowStockLimit:
        inventory
          ? Number(
              inventory.lowStockLimit
            )
          : 5

    });

  }


  return {

    orderItems,

    inventoryChanges,

    total

  };
};


// =====================================================
// DEDUCT INVENTORY SAFELY
// =====================================================

const deductInventory = async ({
  business,
  inventoryChanges
}) => {

  const lowStockProducts = [];


  for (
    const item of inventoryChanges
  ) {

    /*
     * We check the quantity again inside
     * findOneAndUpdate().
     *
     * This prevents stock from becoming
     * negative if two orders happen at
     * almost the same time.
     */

    const updatedInventory =
      await Inventory.findOneAndUpdate(

        {
          business:
            business._id,

          product:
            item.product,

          quantity: {
            $gte:
              item.quantity
          }

        },

        {
          $inc: {
            quantity:
              -item.quantity
          }
        },

        {
          new: true
        }

      );


    if (!updatedInventory) {

      throw new Error(
        `Unable to deduct stock for ${item.name}. ` +
        `Stock may have changed. Please try again.`
      );
    }


    const quantity =
      Number(
        updatedInventory.quantity
      );


    const lowStockLimit =
      Number(
        updatedInventory.lowStockLimit
      );


    if (
      quantity <= lowStockLimit
    ) {

      lowStockProducts.push({

        product:
          item.product,

        name:
          item.name,

        quantity,

        lowStockLimit

      });

    }

  }


  return lowStockProducts;
};


// =====================================================
// CREATE ORDER
// =====================================================

const createCommerceOrder = async ({
  business,
  subscription,
  user,
  customer = null,
  items,
  paymentMethod = "cash"
}) => {

  if (!business) {

    throw new Error(
      "Business information is required"
    );
  }


  // -----------------------------------------------
  // PLAN LIMIT
  // -----------------------------------------------

  const planInfo =
    await checkOrderLimit({

      business,

      subscription

    });


  // -----------------------------------------------
  // CUSTOMER
  // -----------------------------------------------

  const customerRecord =
    await validateCustomer({

      business,

      customer

    });


  // -----------------------------------------------
  // PAYMENT METHOD
  // -----------------------------------------------

  const validatedPaymentMethod =
    validatePaymentMethod(
      paymentMethod
    );


  // -----------------------------------------------
  // PRODUCTS + STOCK
  // -----------------------------------------------

  const prepared =
    await prepareOrderItems({

      business,

      items

    });


  // -----------------------------------------------
  // CREATE ORDER
  // -----------------------------------------------

  const order =
    await Order.create({

      business:
        business._id,

      customer:
        customerRecord
          ? customerRecord._id
          : null,

      items:
        prepared.orderItems,

      total:
        prepared.total,

      paymentMethod:
        validatedPaymentMethod,

      paymentStatus:
        "paid",

      status:
        "completed"

    });


  // -----------------------------------------------
  // DEDUCT STOCK
  // -----------------------------------------------

  let lowStockProducts = [];


  try {

    lowStockProducts =
      await deductInventory({

        business,

        inventoryChanges:
          prepared.inventoryChanges

      });

  } catch (inventoryError) {

    /*
     * If stock deduction fails after the order
     * was created, remove the order so we don't
     * leave a fake sale in the database.
     */

    await Order.findByIdAndDelete(
      order._id
    );

    throw inventoryError;
  }


  // -----------------------------------------------
  // POPULATE ORDER
  // -----------------------------------------------

  const populatedOrder =
    await Order.findById(
      order._id
    )
      .populate("customer")
      .populate("items.product");


  // -----------------------------------------------
  // ORDER NOTIFICATION
  // -----------------------------------------------

  try {

    await createOrderNotification({

      business,

      order:
        populatedOrder,

      user:
        user?._id || null

    });

  } catch (notificationError) {

    console.error(
      "ORDER NOTIFICATION ERROR:",
      notificationError
    );

  }


  // -----------------------------------------------
  // LOW STOCK NOTIFICATIONS
  // -----------------------------------------------

  for (
    const item of lowStockProducts
  ) {

    try {

      await createLowStockNotification({

        business,

        product: {

          _id:
            item.product,

          name:
            item.name

        },

        quantity:
          item.quantity,

        lowStockLimit:
          item.lowStockLimit

      });

    } catch (notificationError) {

      console.error(
        "LOW STOCK NOTIFICATION ERROR:",
        notificationError
      );

    }

  }


  // -----------------------------------------------
  // RETURN
  // -----------------------------------------------

  return {

    order:
      populatedOrder,

    lowStockProducts,

    planInfo

  };
};


// =====================================================
// GET BUSINESS ORDERS
// =====================================================

const getBusinessOrders = async ({
  business
}) => {

  return Order.find({

    business:
      business._id

  })
    .populate("customer")
    .populate("items.product")
    .sort({
      createdAt: -1
    });
};


// =====================================================
// GET ONE BUSINESS ORDER
// =====================================================

const getBusinessOrder = async ({
  business,
  orderId
}) => {

  if (
    !isValidObjectId(orderId)
  ) {

    throw new Error(
      "Invalid order ID"
    );
  }


  const order =
    await Order.findOne({

      _id:
        orderId,

      business:
        business._id

    })
      .populate("customer")
      .populate("items.product");


  if (!order) {

    throw new Error(
      "Order not found"
    );
  }


  return order;
};


// =====================================================
// DELETE BUSINESS ORDER
// =====================================================

const deleteBusinessOrder = async ({
  business,
  orderId
}) => {

  if (
    !isValidObjectId(orderId)
  ) {

    throw new Error(
      "Invalid order ID"
    );
  }


  const order =
    await Order.findOne({

      _id:
        orderId,

      business:
        business._id

    });


  if (!order) {

    throw new Error(
      "Order not found"
    );
  }


  await Order.findByIdAndDelete(
    order._id
  );


  return order;
};


// =====================================================
// EXPORT
// =====================================================

module.exports = {

  createCommerceOrder,

  getBusinessOrders,

  getBusinessOrder,

  deleteBusinessOrder

};