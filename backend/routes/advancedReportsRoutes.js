const express = require("express");

const Product = require("../models/Product");
const Customer = require("../models/Customer");
const Order = require("../models/Order");
const Expense = require("../models/Expense");
const Inventory = require("../models/Inventory");

const protect = require("../middleware/authMiddleware");
const {
  businessAccess
} = require("../middleware/businessAccessMiddleware");

const router = express.Router();


// =====================================================
// HELPERS
// =====================================================

const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};


const getDateRange = (from, to) => {

  const now = new Date();

  let start;
  let end;

  if (from) {
    start = new Date(from);
  } else {
    start = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );
  }

  if (to) {
    end = new Date(to);
    end.setHours(23, 59, 59, 999);
  } else {
    end = new Date();
    end.setHours(23, 59, 59, 999);
  }

  if (Number.isNaN(start.getTime())) {
    start = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );
  }

  if (Number.isNaN(end.getTime())) {
    end = new Date();
    end.setHours(23, 59, 59, 999);
  }

  return {
    start,
    end
  };
};


// =====================================================
// ADVANCED REPORTS
// =====================================================

router.get(
  "/",
  protect,
  businessAccess,
  async (req, res) => {

    try {

      const business = req.business;

      const {
        from,
        to
      } = req.query;


      // =================================================
      // DATE RANGE
      // =================================================

      const {
        start,
        end
      } = getDateRange(from, to);


      // =================================================
      // GET DATA
      // =================================================

      const [
        products,
        customers,
        orders,
        expenses,
        inventory
      ] = await Promise.all([

        Product.find({
          business: business._id
        }).lean(),

        Customer.find({
          business: business._id
        }).lean(),

        Order.find({
          business: business._id,
          createdAt: {
            $gte: start,
            $lte: end
          }
        })
          .populate("customer")
          .lean(),

        Expense.find({
          business: business._id,
          createdAt: {
            $gte: start,
            $lte: end
          }
        }).lean(),

        Inventory.find({
          business: business._id
        })
          .populate("product")
          .lean()

      ]);


      // =================================================
      // BASIC TOTALS
      // =================================================

      const totalRevenue =
        orders.reduce(
          (sum, order) =>
            sum + toNumber(order.total),
          0
        );


      const totalExpenses =
        expenses.reduce(
          (sum, expense) =>
            sum + toNumber(expense.amount),
          0
        );


      const profit =
        totalRevenue -
        totalExpenses;


      const totalOrders =
        orders.length;


      const averageOrderValue =
        totalOrders > 0
          ? totalRevenue / totalOrders
          : 0;


      // =================================================
      // 1. SALES REPORT
      // =================================================

      const salesByDate = {};

      orders.forEach((order) => {

        const date =
          new Date(order.createdAt)
            .toISOString()
            .split("T")[0];

        if (!salesByDate[date]) {

          salesByDate[date] = {
            date,
            orders: 0,
            sales: 0
          };

        }

        salesByDate[date].orders += 1;

        salesByDate[date].sales +=
          toNumber(order.total);

      });


      const salesReport =
        Object.values(salesByDate)
          .sort(
            (a, b) =>
              new Date(a.date) -
              new Date(b.date)
          );


      // =================================================
      // 2. REVENUE REPORT
      // =================================================

      const revenueByPayment = {};

      orders.forEach((order) => {

        const method =
          order.paymentMethod ||
          "other";

        if (!revenueByPayment[method]) {

          revenueByPayment[method] = {
            paymentMethod: method,
            orders: 0,
            revenue: 0
          };

        }

        revenueByPayment[method].orders += 1;

        revenueByPayment[method].revenue +=
          toNumber(order.total);

      });


      const revenueReport =
        Object.values(revenueByPayment);


      // =================================================
      // 3. EXPENSE REPORT
      // =================================================

      const expensesByCategory = {};

      expenses.forEach((expense) => {

        const category =
          expense.category ||
          "Other";

        if (!expensesByCategory[category]) {

          expensesByCategory[category] = {
            category,
            amount: 0
          };

        }

        expensesByCategory[category].amount +=
          toNumber(expense.amount);

      });


      const expenseReport =
        Object.values(expensesByCategory)
          .sort(
            (a, b) =>
              b.amount - a.amount
          );


      // =================================================
      // 4. PROFIT & LOSS
      // =================================================

      const profitAndLoss = {

        revenue:
          totalRevenue,

        expenses:
          totalExpenses,

        profit,

        profitMargin:
          totalRevenue > 0
            ? (profit / totalRevenue) * 100
            : 0

      };


      // =================================================
      // 5. INVENTORY REPORT
      // =================================================

      let totalStockUnits = 0;
      let inventoryValue = 0;

      const inventoryReport = [];

      inventory.forEach((item) => {

        const quantity =
          toNumber(item.quantity);

        const lowStockLimit =
          toNumber(item.lowStockLimit);

        totalStockUnits += quantity;


        const product =
          item.product;


        const price =
          product
            ? toNumber(product.price)
            : 0;


        inventoryValue +=
          quantity * price;


        let status = "healthy";

        if (quantity <= 0) {
          status = "out_of_stock";
        } else if (
          quantity <= lowStockLimit
        ) {
          status = "low_stock";
        }


        inventoryReport.push({

          id: item._id,

          productId:
            product?._id || null,

          productName:
            product?.name ||
            "Unknown Product",

          quantity,

          lowStockLimit,

          price,

          value:
            quantity * price,

          status

        });

      });


      // =================================================
      // 6. CUSTOMER REPORT
      // =================================================

      const customerMap = {};


      orders.forEach((order) => {

        if (!order.customer) {
          return;
        }


        const customerId =
          order.customer._id
            ? order.customer._id.toString()
            : order.customer.toString();


        const customerName =
          order.customer.fullName ||
          order.customer.name ||
          order.customer.email ||
          "Customer";


        if (!customerMap[customerId]) {

          customerMap[customerId] = {

            customerId,

            name:
              customerName,

            orders: 0,

            revenue: 0

          };

        }


        customerMap[customerId].orders += 1;

        customerMap[customerId].revenue +=
          toNumber(order.total);

      });


      const customerReport =
        Object.values(customerMap)
          .sort(
            (a, b) =>
              b.revenue - a.revenue
          );


      // =================================================
      // 7. PRODUCT PERFORMANCE
      // =================================================

      const productMap = {};


      orders.forEach((order) => {

        if (!Array.isArray(order.items)) {
          return;
        }


        order.items.forEach((item) => {

          const productId =
            item.product
              ? item.product.toString()
              : item.name;


          if (!productMap[productId]) {

            productMap[productId] = {

              productId:
                item.product || null,

              name:
                item.name ||
                "Unknown Product",

              quantitySold: 0,

              revenue: 0,

              orders: 0

            };

          }


          productMap[productId]
            .quantitySold +=
              toNumber(
                item.quantity
              );


          productMap[productId]
            .revenue +=
              toNumber(
                item.subtotal
              );


          productMap[productId]
            .orders += 1;

        });

      });


      const productPerformance =
        Object.values(productMap)
          .sort(
            (a, b) =>
              b.revenue - a.revenue
          );


      // =================================================
      // 8. PAYMENT METHOD REPORT
      // =================================================

      const paymentMap = {

        cash: {
          paymentMethod: "cash",
          orders: 0,
          revenue: 0
        },

        ecocash: {
          paymentMethod: "ecocash",
          orders: 0,
          revenue: 0
        },

        card: {
          paymentMethod: "card",
          orders: 0,
          revenue: 0
        },

        bank: {
          paymentMethod: "bank",
          orders: 0,
          revenue: 0
        },

        other: {
          paymentMethod: "other",
          orders: 0,
          revenue: 0
        }

      };


      orders.forEach((order) => {

        const method =
          order.paymentMethod ||
          "other";


        if (!paymentMap[method]) {

          paymentMap[method] = {

            paymentMethod:
              method,

            orders: 0,

            revenue: 0

          };

        }


        paymentMap[method].orders += 1;

        paymentMap[method].revenue +=
          toNumber(order.total);

      });


      const paymentMethodReport =
        Object.values(paymentMap);


      // =================================================
      // FINAL SUMMARY
      // =================================================

      res.json({

        success: true,

        dateRange: {

          from:
            start.toISOString(),

          to:
            end.toISOString()

        },


        summary: {

          revenue:
            totalRevenue,

          expenses:
            totalExpenses,

          profit,

          orders:
            totalOrders,

          averageOrderValue,

          products:
            products.length,

          customers:
            customers.length,

          totalStockUnits,

          inventoryValue

        },


        salesReport,

        revenueReport,

        expenseReport,

        profitAndLoss,

        inventoryReport,

        customerReport,

        productPerformance,

        paymentMethodReport

      });

    } catch (error) {

      console.error(
        "ADVANCED REPORTS ERROR:",
        error
      );

      res.status(500).json({

        success: false,

        message:
          error.message

      });

    }

  }
);


module.exports = router;