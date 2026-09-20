const Notification = require("../models/Notification");


// =====================================================
// CREATE NOTIFICATION
// =====================================================

const createNotification = async ({
  business,
  user = null,
  title,
  message,
  type = "info",
  link = ""
}) => {

  if (!business) {
    throw new Error(
      "Business information is required"
    );
  }

  if (!title) {
    throw new Error(
      "Notification title is required"
    );
  }

  if (!message) {
    throw new Error(
      "Notification message is required"
    );
  }

  const notification =
    await Notification.create({
      business:
        business._id || business,

      user:
        user || null,

      title:
        String(title).trim(),

      message:
        String(message).trim(),

      type,

      read:
        false,

      link:
        link || ""
    });

  return notification;
};


// =====================================================
// LOW STOCK NOTIFICATION
// =====================================================

const createLowStockNotification = async ({
  business,
  product,
  quantity,
  lowStockLimit
}) => {

  if (!product) {
    throw new Error(
      "Product information is required"
    );
  }

  const notification =
    await createNotification({

      business,

      title:
        "Low Stock Alert",

      message:
        `${product.name} is running low on stock. ` +
        `Only ${quantity} unit(s) remaining.`,

      type:
        "inventory",

      link:
        "/inventory"

    });

  return notification;
};


// =====================================================
// ORDER NOTIFICATION
// =====================================================

const createOrderNotification = async ({
  business,
  order,
  user = null
}) => {

  if (!order) {
    throw new Error(
      "Order information is required"
    );
  }

  const total =
    Number(order.total || 0);

  const notification =
    await createNotification({

      business,

      user,

      title:
        "New Order",

      message:
        `A new order has been created for $${total.toFixed(2)}.`,

      type:
        "order",

      link:
        `/orders/${order._id}`

    });

  return notification;
};


// =====================================================
// PAYMENT NOTIFICATION
// =====================================================

const createPaymentNotification = async ({
  business,
  amount,
  paymentMethod = "cash",
  user = null
}) => {

  const paymentAmount =
    Number(amount || 0);

  const notification =
    await createNotification({

      business,

      user,

      title:
        "Payment Received",

      message:
        `Payment of $${paymentAmount.toFixed(2)} received via ${paymentMethod}.`,

      type:
        "payment",

      link:
        "/payments"

    });

  return notification;
};


// =====================================================
// EXPENSE NOTIFICATION
// =====================================================

const createExpenseNotification = async ({
  business,
  expense,
  user = null
}) => {

  if (!expense) {
    throw new Error(
      "Expense information is required"
    );
  }

  const amount =
    Number(expense.amount || 0);

  const notification =
    await createNotification({

      business,

      user,

      title:
        "Expense Recorded",

      message:
        `Expense "${expense.title}" of $${amount.toFixed(2)} has been recorded.`,

      type:
        "info",

      link:
        "/expenses"

    });

  return notification;
};


// =====================================================
// INVOICE NOTIFICATION
// =====================================================

const createInvoiceNotification = async ({
  business,
  invoice,
  user = null
}) => {

  if (!invoice) {
    throw new Error(
      "Invoice information is required"
    );
  }

  const amount =
    Number(
      invoice.total ||
      invoice.amount ||
      0
    );

  const invoiceNumber =
    invoice.invoiceNumber ||
    invoice.number ||
    invoice._id;

  const notification =
    await createNotification({

      business,

      user,

      title:
        "Invoice Created",

      message:
        `Invoice ${invoiceNumber} has been created for $${amount.toFixed(2)}.`,

      type:
        "invoice",

      link:
        `/invoices/${invoice._id}`

    });

  return notification;
};


// =====================================================
// TEAM NOTIFICATION
// =====================================================

const createTeamNotification = async ({
  business,
  user = null,
  title = "Team Update",
  message,
  link = "/team"
}) => {

  const notification =
    await createNotification({

      business,

      user,

      title,

      message,

      type:
        "team",

      link

    });

  return notification;
};


// =====================================================
// SYSTEM NOTIFICATION
// =====================================================

const createSystemNotification = async ({
  business,
  title,
  message,
  user = null,
  type = "system",
  link = ""
}) => {

  const notification =
    await createNotification({

      business,

      user,

      title,

      message,

      type,

      link

    });

  return notification;
};


// =====================================================
// SUCCESS NOTIFICATION
// =====================================================

const createSuccessNotification = async ({
  business,
  title,
  message,
  user = null,
  link = ""
}) => {

  return createNotification({

    business,

    user,

    title,

    message,

    type:
      "success",

    link

  });
};


// =====================================================
// WARNING NOTIFICATION
// =====================================================

const createWarningNotification = async ({
  business,
  title,
  message,
  user = null,
  link = ""
}) => {

  return createNotification({

    business,

    user,

    title,

    message,

    type:
      "warning",

    link

  });
};


// =====================================================
// ERROR NOTIFICATION
// =====================================================

const createErrorNotification = async ({
  business,
  title,
  message,
  user = null,
  link = ""
}) => {

  return createNotification({

    business,

    user,

    title,

    message,

    type:
      "error",

    link

  });
};


// =====================================================
// EXPORT
// =====================================================

module.exports = {

  createNotification,

  createLowStockNotification,

  createOrderNotification,

  createPaymentNotification,

  createExpenseNotification,

  createInvoiceNotification,

  createTeamNotification,

  createSystemNotification,

  createSuccessNotification,

  createWarningNotification,

  createErrorNotification

};