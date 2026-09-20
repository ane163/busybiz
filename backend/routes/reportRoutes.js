const express = require("express");

const Business = require("../models/Business");
const Order = require("../models/Order");
const Expense = require("../models/Expense");
const Customer = require("../models/Customer");
const Product = require("../models/Product");

const protect = require("../middleware/authMiddleware");

const requirePlan = require(
  "../middleware/subscriptionMiddleware"
);

const router = express.Router();


// =====================================================
// GET PROFIT & LOSS
// =====================================================

router.get(
  "/profit-loss",
  protect,
  requirePlan([
    "starter",
    "professional"
  ]),
  async (req, res) => {

    try {

      const business =
        await Business.findOne({
          owner: req.user.id
        });

      if (!business) {
        return res.status(404).json({
          message: "Business not found"
        });
      }

      const orders =
        await Order.find({
          business: business._id
        });

      const expenses =
        await Expense.find({
          business: business._id
        });

      let revenue = 0;

      orders.forEach((order) => {
        revenue += Number(order.total || 0);
      });

      let totalExpenses = 0;

      expenses.forEach((expense) => {
        totalExpenses += Number(
          expense.amount || 0
        );
      });

      const profit =
        revenue - totalExpenses;

      const profitMargin =
        revenue > 0
          ? (profit / revenue) * 100
          : 0;

      res.json({
        revenue,
        expenses: totalExpenses,
        profit,
        profitMargin
      });

    } catch (error) {

      console.error(
        "PROFIT LOSS ERROR:",
        error
      );

      res.status(500).json({
        message: error.message
      });

    }

  }
);


// =====================================================
// GET SALES SUMMARY
// =====================================================

router.get(
  "/sales-summary",
  protect,
  requirePlan([
    "starter",
    "professional"
  ]),
  async (req, res) => {

    try {

      const business =
        await Business.findOne({
          owner: req.user.id
        });

      if (!business) {
        return res.status(404).json({
          message: "Business not found"
        });
      }

      const orders =
        await Order.find({
          business: business._id
        });

      const totalOrders =
        orders.length;

      let totalSales = 0;

      orders.forEach((order) => {
        totalSales += Number(
          order.total || 0
        );
      });

      const averageOrderValue =
        totalOrders > 0
          ? totalSales / totalOrders
          : 0;

      const paidOrders =
        orders.filter(
          (order) =>
            order.paymentStatus === "paid"
        ).length;

      const unpaidOrders =
        orders.filter(
          (order) =>
            order.paymentStatus !== "paid"
        ).length;

      res.json({
        totalOrders,
        totalSales,
        averageOrderValue,
        paidOrders,
        unpaidOrders
      });

    } catch (error) {

      console.error(
        "SALES SUMMARY ERROR:",
        error
      );

      res.status(500).json({
        message: error.message
      });

    }

  }
);


// =====================================================
// GET TOP PRODUCTS
// =====================================================

router.get(
  "/top-products",
  protect,
  requirePlan([
    "starter",
    "professional"
  ]),
  async (req, res) => {

    try {

      const business =
        await Business.findOne({
          owner: req.user.id
        });

      if (!business) {
        return res.status(404).json({
          message: "Business not found"
        });
      }

      const orders =
        await Order.find({
          business: business._id
        });

      const productSales = {};

      orders.forEach((order) => {

        if (
          !order.items ||
          !Array.isArray(order.items)
        ) {
          return;
        }

        order.items.forEach((item) => {

          const productId =
            item.product
              ? item.product.toString()
              : item.name;

          if (!productSales[productId]) {

            productSales[productId] = {
              productId,
              name:
                item.name ||
                "Unknown Product",
              unitsSold: 0,
              revenue: 0
            };

          }

          productSales[productId].unitsSold +=
            Number(item.quantity || 0);

          productSales[productId].revenue +=
            Number(
              item.subtotal ||
              (
                Number(item.price || 0) *
                Number(item.quantity || 0)
              )
            );

        });

      });

      const products =
        Object.values(productSales);

      products.sort(
        (a, b) =>
          b.unitsSold -
          a.unitsSold
      );

      res.json({
        products: products.slice(0, 10)
      });

    } catch (error) {

      console.error(
        "TOP PRODUCTS ERROR:",
        error
      );

      res.status(500).json({
        message: error.message
      });

    }

  }
);


// =====================================================
// GET SALES BY PERIOD
// =====================================================

router.get(
  "/sales-by-period",
  protect,
  requirePlan([
    "starter",
    "professional"
  ]),
  async (req, res) => {

    try {

      const business =
        await Business.findOne({
          owner: req.user.id
        });

      if (!business) {
        return res.status(404).json({
          message: "Business not found"
        });
      }

      const period =
        req.query.period || "month";

      const allowedPeriods = [
        "day",
        "month",
        "year"
      ];

      if (
        !allowedPeriods.includes(period)
      ) {
        return res.status(400).json({
          message:
            "Invalid period. Use day, month or year."
        });
      }

      const orders =
        await Order.find({
          business: business._id
        });

      const sales = {};

      orders.forEach((order) => {

        const date =
          order.createdAt
            ? new Date(order.createdAt)
            : new Date();

        let key;

        if (period === "day") {

          key =
            date.toISOString()
              .split("T")[0];

        } else if (period === "month") {

          key =
            `${date.getUTCFullYear()}-${String(
              date.getUTCMonth() + 1
            ).padStart(2, "0")}`;

        } else {

          key =
            String(
              date.getUTCFullYear()
            );

        }

        if (!sales[key]) {

          sales[key] = {
            period: key,
            orders: 0,
            revenue: 0
          };

        }

        sales[key].orders += 1;

        sales[key].revenue +=
          Number(order.total || 0);

      });

      const results =
        Object.values(sales).sort(
          (a, b) =>
            a.period.localeCompare(
              b.period
            )
        );

      res.json({
        period,
        results
      });

    } catch (error) {

      console.error(
        "SALES BY PERIOD ERROR:",
        error
      );

      res.status(500).json({
        message: error.message
      });

    }

  }
);


// =====================================================
// GET BUSINESS OVERVIEW
// =====================================================

router.get(
  "/overview",
  protect,
  requirePlan([
    "starter",
    "professional"
  ]),
  async (req, res) => {

    try {

      const business =
        await Business.findOne({
          owner: req.user.id
        });

      if (!business) {
        return res.status(404).json({
          message: "Business not found"
        });
      }

      const [
        orders,
        expenses,
        customers,
        products
      ] = await Promise.all([

        Order.find({
          business: business._id
        }),

        Expense.find({
          business: business._id
        }),

        Customer.countDocuments({
          business: business._id
        }),

        Product.countDocuments({
          business: business._id
        })

      ]);

      let revenue = 0;

      orders.forEach((order) => {
        revenue += Number(
          order.total || 0
        );
      });

      let totalExpenses = 0;

      expenses.forEach((expense) => {
        totalExpenses += Number(
          expense.amount || 0
        );
      });

      const profit =
        revenue - totalExpenses;

      const profitMargin =
        revenue > 0
          ? (profit / revenue) * 100
          : 0;

      res.json({

        revenue,

        expenses:
          totalExpenses,

        profit,

        profitMargin,

        totalOrders:
          orders.length,

        totalCustomers:
          customers,

        totalProducts:
          products

      });

    } catch (error) {

      console.error(
        "BUSINESS OVERVIEW ERROR:",
        error
      );

      res.status(500).json({
        message: error.message
      });

    }

  }
);


// =====================================================
// EXPORT ROUTER
// =====================================================

module.exports = router;