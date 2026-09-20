const express = require("express");

const Business = require("../models/Business");
const Product = require("../models/Product");
const Customer = require("../models/Customer");
const Order = require("../models/Order");
const Expense = require("../models/Expense");

const protect = require("../middleware/authMiddleware");

const router = express.Router();


// BUSYBIZ AI ASSISTANT
const requirePlan = require(
  "../middleware/subscriptionMiddleware"
);

router.post(
  "/ask",
  protect,
  requirePlan([
    "professional"
  ]),
  async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        message: "Please enter a question."
      });
    }

    const business = await Business.findOne({
      owner: req.user.id
    });

    if (!business) {
      return res.status(404).json({
        message: "Business not found."
      });
    }

    const [
      products,
      customers,
      orders,
      expenses
    ] = await Promise.all([
      Product.find({
        business: business._id
      }),

      Customer.find({
        business: business._id
      }),

      Order.find({
        business: business._id
      }),

      Expense.find({
        business: business._id
      })
    ]);


    // -------------------------
    // BUSINESS CALCULATIONS
    // -------------------------

    const revenue = orders.reduce(
      (total, order) =>
        total + Number(order.total || 0),
      0
    );

    const totalExpenses = expenses.reduce(
      (total, expense) =>
        total + Number(expense.amount || 0),
      0
    );

    const profit =
      revenue - totalExpenses;

    const lowStockProducts =
      products.filter(
        (product) =>
          Number(product.stock || 0) <= 5
      );


    // -------------------------
    // QUESTION
    // -------------------------

    const question =
      message.toLowerCase();


    // -------------------------
    // BUSINESS PERFORMANCE
    // -------------------------

    if (
      question.includes("how is my business") ||
      question.includes("business doing") ||
      question.includes("business performance")
    ) {
      let performance;

      if (profit > 0 && revenue > totalExpenses) {
        performance =
          "Your business is currently profitable.";
      } else if (profit === 0) {
        performance =
          "Your business is currently breaking even.";
      } else {
        performance =
          "Your expenses are currently higher than your revenue.";
      }

      return res.json({
        reply:
          `${performance} ` +
          `Your revenue is $${revenue.toFixed(2)}, ` +
          `your expenses are $${totalExpenses.toFixed(2)}, ` +
          `and your current profit is $${profit.toFixed(2)}.`
      });
    }


    // -------------------------
    // SALES
    // -------------------------

    if (
      question.includes("sales") ||
      question.includes("revenue")
    ) {
      return res.json({
        reply:
          `Your total recorded sales revenue is ` +
          `$${revenue.toFixed(2)} ` +
          `from ${orders.length} orders.`
      });
    }


    // -------------------------
    // PROFIT
    // -------------------------

    if (
      question.includes("profit") ||
      question.includes("made")
    ) {
      return res.json({
        reply:
          `Your current profit is ` +
          `$${profit.toFixed(2)}. ` +
          `This is calculated from ` +
          `$${revenue.toFixed(2)} revenue ` +
          `minus $${totalExpenses.toFixed(2)} expenses.`
      });
    }


    // -------------------------
    // EXPENSES
    // -------------------------

    if (
      question.includes("expense") ||
      question.includes("spending") ||
      question.includes("cost")
    ) {
      return res.json({
        reply:
          `Your recorded business expenses total ` +
          `$${totalExpenses.toFixed(2)}.`
      });
    }


    // -------------------------
    // PRODUCTS
    // -------------------------

    if (
      question.includes("product") ||
      question.includes("inventory")
    ) {
      return res.json({
        reply:
          `You currently have ` +
          `${products.length} products ` +
          `in your inventory. ` +
          `${lowStockProducts.length} ` +
          `are currently low in stock.`
      });
    }


    // -------------------------
    // LOW STOCK
    // -------------------------

    if (
      question.includes("low stock") ||
      question.includes("running out") ||
      question.includes("stock alert")
    ) {
      if (lowStockProducts.length === 0) {
        return res.json({
          reply:
            "You currently have no products at or below the low-stock threshold."
        });
      }

      const names =
        lowStockProducts
          .map(
            (product) =>
              `${product.name} (${product.stock})`
          )
          .join(", ");

      return res.json({
        reply:
          `You have ${lowStockProducts.length} ` +
          `low-stock product(s): ${names}.`
      });
    }


    // -------------------------
    // CUSTOMERS
    // -------------------------

    if (
      question.includes("customer") ||
      question.includes("customers")
    ) {
      return res.json({
        reply:
          `You currently have ` +
          `${customers.length} customers ` +
          `recorded in BusyBiz.`
      });
    }


    // -------------------------
    // ORDERS
    // -------------------------

    if (
      question.includes("order") ||
      question.includes("orders")
    ) {
      return res.json({
        reply:
          `You currently have ` +
          `${orders.length} recorded orders.`
      });
    }


    // -------------------------
    // ADVICE
    // -------------------------

    if (
      question.includes("advice") ||
      question.includes("recommend") ||
      question.includes("focus") ||
      question.includes("what should")
    ) {
      let advice =
        "Keep monitoring your sales, expenses and inventory.";

      if (lowStockProducts.length > 0) {
        advice =
          "Your first priority should be reviewing your low-stock products so you don't run out of items customers want.";
      } else if (profit <= 0 && revenue > 0) {
        advice =
          "Your main priority should be reducing unnecessary expenses and improving your profit margin.";
      } else if (orders.length < 5) {
        advice =
          "Your business needs more sales activity. Focus on attracting customers and increasing the number of orders.";
      } else {
        advice =
          "Your business is generating activity. Continue monitoring profit margins, controlling expenses and keeping popular products in stock.";
      }

      return res.json({
        reply: advice
      });
    }


    // -------------------------
    // DEFAULT RESPONSE
    // -------------------------

    return res.json({
      reply:
        "I can help you understand your business. Try asking me about your sales, revenue, profit, expenses, inventory, customers, orders, low-stock products, or what you should focus on."
    });

  } catch (error) {
    console.error(
      "AI ASSISTANT ERROR:",
      error
    );

    res.status(500).json({
      message: error.message
    });
  }
});


module.exports = router;