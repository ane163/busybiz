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

const money = (value) => {
  return Number(value || 0);
};


const getStartOfDay = (date = new Date()) => {
  const result = new Date(date);

  result.setHours(0, 0, 0, 0);

  return result;
};


const getStartOfMonth = (date = new Date()) => {
  const result = new Date(date);

  result.setDate(1);
  result.setHours(0, 0, 0, 0);

  return result;
};


// =====================================================
// DASHBOARD SUMMARY
// =====================================================

router.get(
  "/summary",
  protect,
  businessAccess,
  async (req, res) => {

    try {

      const business = req.business;

      const [
        products,
        customers,
        orders,
        expenses,
        inventory
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
        }),

        Inventory.find({
          business: business._id
        }).populate("product")

      ]);


      // -----------------------------------------------
      // REVENUE
      // -----------------------------------------------

      const validOrders =
        orders.filter(
          (order) =>
            order.status !== "cancelled" &&
            order.paymentStatus !== "cancelled"
        );


      const totalRevenue =
        validOrders.reduce(
          (total, order) =>
            total + money(order.total),
          0
        );


      // -----------------------------------------------
      // EXPENSES
      // -----------------------------------------------

      const totalExpenses =
        expenses.reduce(
          (total, expense) =>
            total + money(expense.amount),
          0
        );


      // -----------------------------------------------
      // PROFIT
      // -----------------------------------------------

      const profit =
        totalRevenue -
        totalExpenses;


      // -----------------------------------------------
      // TODAY
      // -----------------------------------------------

      const startOfToday =
        getStartOfDay();


      const todayOrders =
        validOrders.filter(
          (order) =>
            new Date(order.createdAt) >=
            startOfToday
        );


      const todaySales =
        todayOrders.reduce(
          (total, order) =>
            total + money(order.total),
          0
        );


      // -----------------------------------------------
      // LOW STOCK
      // -----------------------------------------------

      const lowStockInventory =
        inventory.filter(
          (item) => {

            const quantity =
              money(item.quantity);

            const limit =
              money(item.lowStockLimit);

            return quantity <= limit;

          }
        );


      // -----------------------------------------------
      // ORDER AVERAGE
      // -----------------------------------------------

      const averageOrderValue =
        validOrders.length > 0
          ? totalRevenue / validOrders.length
          : 0;


      // -----------------------------------------------
      // RESPONSE
      // -----------------------------------------------

      res.json({

        success: true,

        todaySales,

        totalRevenue,

        totalExpenses,

        profit,

        productCount:
          products.length,

        customerCount:
          customers.length,

        orderCount:
          validOrders.length,

        lowStockCount:
          lowStockInventory.length,

        averageOrderValue,

        lowStockProducts:
          lowStockInventory.map(
            (item) => ({

              id:
                item.product
                  ? item.product._id
                  : item._id,

              name:
                item.product
                  ? item.product.name
                  : "Unknown Product",

              stock:
                money(item.quantity),

              lowStockLimit:
                money(item.lowStockLimit)

            })
          )

      });

    } catch (error) {

      console.error(
        "DASHBOARD SUMMARY ERROR:",
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


// =====================================================
// SALES ANALYTICS
// =====================================================

router.get(
  "/sales-analytics",
  protect,
  businessAccess,
  async (req, res) => {

    try {

      const business = req.business;

      const period =
        Number(req.query.period) || 7;

      const allowedPeriods =
        [7, 30, 90];

      const selectedPeriod =
        allowedPeriods.includes(period)
          ? period
          : 7;


      const startDate =
        getStartOfDay();

      startDate.setDate(
        startDate.getDate() -
        (selectedPeriod - 1)
      );


      const orders =
        await Order.find({
          business: business._id,

          createdAt: {
            $gte: startDate
          },

          status: {
            $ne: "cancelled"
          },

          paymentStatus: {
            $ne: "cancelled"
          }

        }).sort({
          createdAt: 1
        });


      // -----------------------------------------------
      // DAILY DATA
      // -----------------------------------------------

      if (
        selectedPeriod === 7 ||
        selectedPeriod === 30
      ) {

        const analytics = [];

        for (
          let i = 0;
          i < selectedPeriod;
          i++
        ) {

          const date =
            new Date(startDate);

          date.setDate(
            startDate.getDate() + i
          );


          const dateString =
            date.toISOString()
              .split("T")[0];


          const sales =
            orders
              .filter(
                (order) => {

                  const orderDate =
                    new Date(
                      order.createdAt
                    );

                  return (
                    orderDate
                      .toISOString()
                      .split("T")[0] ===
                    dateString
                  );

                }
              )
              .reduce(
                (total, order) =>
                  total +
                  money(order.total),
                0
              );


          analytics.push({

            label:
              selectedPeriod === 7
                ? date.toLocaleDateString(
                    "en-US",
                    {
                      weekday: "short"
                    }
                  )
                : date.toLocaleDateString(
                    "en-US",
                    {
                      day: "numeric",
                      month: "short"
                    }
                  ),

            date:
              dateString,

            sales

          });

        }


        return res.json({

          success: true,

          period:
            selectedPeriod,

          analytics

        });

      }


      // -----------------------------------------------
      // THREE MONTHS
      // -----------------------------------------------

      const analytics = [];

      const monthlyData = {};


      orders.forEach(
        (order) => {

          const date =
            new Date(
              order.createdAt
            );

          const year =
            date.getFullYear();

          const month =
            date.getMonth();

          const key =
            `${year}-${String(
              month + 1
            ).padStart(2, "0")}`;


          if (!monthlyData[key]) {
            monthlyData[key] = 0;
          }


          monthlyData[key] +=
            money(order.total);

        }
      );


      const currentDate =
        new Date();


      for (
        let i = 2;
        i >= 0;
        i--
      ) {

        const date =
          new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() - i,
            1
          );


        const year =
          date.getFullYear();

        const month =
          date.getMonth();


        const key =
          `${year}-${String(
            month + 1
          ).padStart(2, "0")}`;


        analytics.push({

          label:
            date.toLocaleDateString(
              "en-US",
              {
                month: "short"
              }
            ),

          date: key,

          sales:
            money(monthlyData[key])

        });

      }


      res.json({

        success: true,

        period: 90,

        analytics

      });

    } catch (error) {

      console.error(
        "SALES ANALYTICS ERROR:",
        error
      );

      res.status(500).json({

        success: false,

        message:
          "Failed to load sales analytics"

      });

    }

  }
);


// =====================================================
// BEST-SELLING PRODUCTS
// =====================================================

router.get(
  "/best-selling-products",
  protect,
  businessAccess,
  async (req, res) => {

    try {

      const business =
        req.business;

      const limit =
        Number(req.query.limit) || 5;

      const safeLimit =
        Math.min(
          Math.max(limit, 1),
          20
        );


      const orders =
        await Order.find({

          business:
            business._id,

          status: {
            $ne: "cancelled"
          },

          paymentStatus: {
            $ne: "cancelled"
          }

        }).lean();


      const productMap =
        new Map();


      orders.forEach(
        (order) => {

          if (
            !Array.isArray(
              order.items
            )
          ) {
            return;
          }


          order.items.forEach(
            (item) => {

              if (!item) {
                return;
              }


              const productId =
                item.product
                  ? item.product.toString()
                  : `name-${item.name}`;


              const quantity =
                money(item.quantity);


              const revenue =
                money(item.subtotal);


              if (
                !productMap.has(
                  productId
                )
              ) {

                productMap.set(
                  productId,
                  {

                    productId:
                      item.product ||
                      null,

                    name:
                      item.name ||
                      "Unknown Product",

                    quantitySold:
                      0,

                    revenue:
                      0

                  }
                );

              }


              const product =
                productMap.get(
                  productId
                );


              product.quantitySold +=
                quantity;

              product.revenue +=
                revenue;

            }
          );

        }
      );


      const products =
        Array.from(
          productMap.values()
        )
        .sort(
          (a, b) =>
            b.revenue -
            a.revenue
        )
        .slice(
          0,
          safeLimit
        );


      const rankedProducts =
        products.map(
          (product, index) => ({

            rank:
              index + 1,

            productId:
              product.productId,

            name:
              product.name,

            quantitySold:
              product.quantitySold,

            revenue:
              product.revenue

          })
        );


      res.json({

        success: true,

        products:
          rankedProducts

      });

    } catch (error) {

      console.error(
        "BEST SELLING PRODUCTS ERROR:",
        error
      );

      res.status(500).json({

        success: false,

        message:
          "Failed to load best-selling products"

      });

    }

  }
);


// =====================================================
// BUSINESS HEALTH SCORE
// =====================================================

router.get(
  "/health",
  protect,
  businessAccess,
  async (req, res) => {

    try {

      const business =
        req.business;


      const [
        orders,
        expenses,
        customers,
        inventory
      ] = await Promise.all([

        Order.find({
          business:
            business._id
        }),

        Expense.find({
          business:
            business._id
        }),

        Customer.find({
          business:
            business._id
        }),

        Inventory.find({
          business:
            business._id
        })

      ]);


      const validOrders =
        orders.filter(
          (order) =>
            order.status !==
              "cancelled" &&
            order.paymentStatus !==
              "cancelled"
        );


      const revenue =
        validOrders.reduce(
          (total, order) =>
            total +
            money(order.total),
          0
        );


      const expensesTotal =
        expenses.reduce(
          (total, expense) =>
            total +
            money(expense.amount),
          0
        );


      const profit =
        revenue -
        expensesTotal;


      let score = 50;


      // Profit
      if (profit > 0) {
        score += 20;
      } else {
        score -= 15;
      }


      // Revenue
      if (revenue > 0) {
        score += 10;
      }


      // Orders
      if (validOrders.length >= 10) {
        score += 10;
      } else if (
        validOrders.length > 0
      ) {
        score += 5;
      }


      // Customers
      if (customers.length >= 10) {
        score += 5;
      } else if (
        customers.length > 0
      ) {
        score += 2;
      }


      // Inventory
      const lowStock =
        inventory.filter(
          (item) =>
            money(item.quantity) <=
            money(item.lowStockLimit)
        ).length;


      if (
        inventory.length > 0 &&
        lowStock === 0
      ) {
        score += 5;
      } else if (
        lowStock >
        inventory.length * 0.5
      ) {
        score -= 10;
      }


      score =
        Math.max(
          0,
          Math.min(
            100,
            Math.round(score)
          )
        );


      let status =
        "Needs Attention";


      if (score >= 80) {
        status =
          "Excellent";
      } else if (score >= 65) {
        status =
          "Healthy";
      } else if (score >= 50) {
        status =
          "Fair";
      }


      res.json({

        success: true,

        score,

        status,

        revenue,

        expenses:
          expensesTotal,

        profit,

        lowStock,

        orders:
          validOrders.length,

        customers:
          customers.length

      });

    } catch (error) {

      console.error(
        "BUSINESS HEALTH ERROR:",
        error
      );

      res.status(500).json({

        success: false,

        message:
          "Failed to calculate business health"

      });

    }

  }
);


// =====================================================
// SALES FORECAST
// =====================================================

router.get(
  "/forecast",
  protect,
  businessAccess,
  async (req, res) => {

    try {

      const business =
        req.business;


      const days =
        Math.min(
          Math.max(
            Number(req.query.days) || 30,
            7
          ),
          90
        );


      const startDate =
        getStartOfDay();


      startDate.setDate(
        startDate.getDate() - 29
      );


      const orders =
        await Order.find({

          business:
            business._id,

          createdAt: {
            $gte:
              startDate
          },

          status: {
            $ne: "cancelled"
          },

          paymentStatus: {
            $ne: "cancelled"
          }

        });


      const dailySales = [];


      for (
        let i = 0;
        i < 30;
        i++
      ) {

        const date =
          new Date(startDate);

        date.setDate(
          startDate.getDate() + i
        );


        const dateString =
          date.toISOString()
            .split("T")[0];


        const sales =
          orders
            .filter(
              (order) => {

                const orderDate =
                  new Date(
                    order.createdAt
                  );

                return (
                  orderDate
                    .toISOString()
                    .split("T")[0] ===
                  dateString
                );

              }
            )
            .reduce(
              (total, order) =>
                total +
                money(order.total),
              0
            );


        dailySales.push({

          date:
            dateString,

          sales

        });

      }


      // -----------------------------------------------
      // LINEAR TREND
      // -----------------------------------------------

      const n =
        dailySales.length;


      const sumX =
        dailySales.reduce(
          (sum, _, index) =>
            sum + index,
          0
        );


      const sumY =
        dailySales.reduce(
          (sum, item) =>
            sum + item.sales,
          0
        );


      const sumXY =
        dailySales.reduce(
          (sum, item, index) =>
            sum +
            index *
            item.sales,
          0
        );


      const sumXX =
        dailySales.reduce(
          (sum, _, index) =>
            sum +
            index * index,
          0
        );


      const denominator =
        n * sumXX -
        sumX * sumX;


      const slope =
        denominator === 0
          ? 0
          :
            (
              n * sumXY -
              sumX * sumY
            ) /
            denominator;


      const intercept =
        (
          sumY -
          slope * sumX
        ) / n;


      const averageDailySales =
        n > 0
          ? sumY / n
          : 0;


      const forecast = [];


      for (
        let i = 1;
        i <= days;
        i++
      ) {

        const futureIndex =
          n - 1 + i;


        const predicted =
          Math.max(
            0,
            intercept +
            slope *
            futureIndex
          );


        const date =
          new Date();


        date.setDate(
          date.getDate() + i
        );


        forecast.push({

          date:
            date.toISOString()
              .split("T")[0],

          sales:
            Math.round(
              predicted * 100
            ) / 100

        });

      }


      const projectedRevenue =
        forecast.reduce(
          (total, item) =>
            total + item.sales,
          0
        );


      let trend =
        "stable";


      if (slope > 1) {
        trend =
          "increasing";
      } else if (slope < -1) {
        trend =
          "decreasing";
      }


      res.json({

        success: true,

        days,

        averageDailySales,

        projectedRevenue,

        trend,

        forecast

      });

    } catch (error) {

      console.error(
        "SALES FORECAST ERROR:",
        error
      );

      res.status(500).json({

        success: false,

        message:
          "Failed to generate sales forecast"

      });

    }

  }
);


// =====================================================
// ADVANCED REPORTS
// =====================================================

router.get(
  "/reports",
  protect,
  businessAccess,
  async (req, res) => {

    try {

      const business =
        req.business;


      const [
        orders,
        expenses
      ] = await Promise.all([

        Order.find({
          business:
            business._id
        }).lean(),

        Expense.find({
          business:
            business._id
        }).lean()

      ]);


      const validOrders =
        orders.filter(
          (order) =>
            order.status !==
              "cancelled" &&
            order.paymentStatus !==
              "cancelled"
        );


      // -----------------------------------------------
      // TOTALS
      // -----------------------------------------------

      const revenue =
        validOrders.reduce(
          (total, order) =>
            total +
            money(order.total),
          0
        );


      const expensesTotal =
        expenses.reduce(
          (total, expense) =>
            total +
            money(expense.amount),
          0
        );


      const profit =
        revenue -
        expensesTotal;


      const averageOrderValue =
        validOrders.length > 0
          ? revenue /
            validOrders.length
          : 0;


      // -----------------------------------------------
      // PAYMENT METHODS
      // -----------------------------------------------

      const paymentMethods = {};


      validOrders.forEach(
        (order) => {

          const method =
            order.paymentMethod ||
            "other";


          if (!paymentMethods[method]) {
            paymentMethods[method] = {
              orders: 0,
              revenue: 0
            };
          }


          paymentMethods[method].orders +=
            1;


          paymentMethods[method].revenue +=
            money(order.total);

        }
      );


      // -----------------------------------------------
      // MONTHLY REPORT
      // -----------------------------------------------

      const monthly = {};


      validOrders.forEach(
        (order) => {

          const date =
            new Date(
              order.createdAt
            );


          const key =
            `${date.getFullYear()}-${String(
              date.getMonth() + 1
            ).padStart(2, "0")}`;


          if (!monthly[key]) {

            monthly[key] = {

              revenue: 0,

              orders: 0

            };

          }


          monthly[key].revenue +=
            money(order.total);


          monthly[key].orders +=
            1;

        }
      );


      // -----------------------------------------------
      // EXPENSE CATEGORIES
      // -----------------------------------------------

      const expenseCategories = {};


      expenses.forEach(
        (expense) => {

          const category =
            expense.category ||
            "Other";


          if (
            !expenseCategories[
              category
            ]
          ) {

            expenseCategories[
              category
            ] = 0;

          }


          expenseCategories[
            category
          ] +=
            money(expense.amount);

        }
      );


      res.json({

        success: true,

        overview: {

          revenue,

          expenses:
            expensesTotal,

          profit,

          orders:
            validOrders.length,

          averageOrderValue

        },

        paymentMethods,

        monthly,

        expenseCategories

      });

    } catch (error) {

      console.error(
        "ADVANCED REPORT ERROR:",
        error
      );

      res.status(500).json({

        success: false,

        message:
          "Failed to generate reports"

      });

    }

  }
);


// =====================================================
// AI BUSINESS INSIGHTS
// =====================================================

router.get(
  "/ai-insights",
  protect,
  businessAccess,
  async (req, res) => {

    try {

      const business =
        req.business;


      const [
        orders,
        expenses,
        customers,
        inventory
      ] = await Promise.all([

        Order.find({
          business:
            business._id
        }).lean(),

        Expense.find({
          business:
            business._id
        }).lean(),

        Customer.find({
          business:
            business._id
        }).lean(),

        Inventory.find({
          business:
            business._id
        }).populate(
          "product"
        ).lean()

      ]);


      const validOrders =
        orders.filter(
          (order) =>
            order.status !==
              "cancelled" &&
            order.paymentStatus !==
              "cancelled"
        );


      const revenue =
        validOrders.reduce(
          (total, order) =>
            total +
            money(order.total),
          0
        );


      const expensesTotal =
        expenses.reduce(
          (total, expense) =>
            total +
            money(expense.amount),
          0
        );


      const profit =
        revenue -
        expensesTotal;


      const lowStock =
        inventory.filter(
          (item) =>
            money(item.quantity) <=
            money(item.lowStockLimit)
        );


      const insights = [];


      // -----------------------------------------------
      // PROFIT INSIGHT
      // -----------------------------------------------

      if (profit > 0) {

        insights.push({

          type:
            "positive",

          title:
            "Your business is profitable",

          message:
            `You have generated ${revenue.toFixed(
              2
            )} in revenue against ${expensesTotal.toFixed(
              2
            )} in expenses.`

        });

      } else {

        insights.push({

          type:
            "warning",

          title:
            "Profit needs attention",

          message:
            `Expenses are currently ${expensesTotal.toFixed(
              2
            )} compared with revenue of ${revenue.toFixed(
              2
            )}.`

        });

      }


      // -----------------------------------------------
      // INVENTORY
      // -----------------------------------------------

      if (lowStock.length > 0) {

        insights.push({

          type:
            "warning",

          title:
            "Inventory requires attention",

          message:
            `${lowStock.length} product${
              lowStock.length === 1
                ? ""
                : "s"
            } ${
              lowStock.length === 1
                ? "is"
                : "are"
            } at or below the low-stock threshold.`

        });

      } else {

        insights.push({

          type:
            "positive",

          title:
            "Inventory is healthy",

          message:
            "No products are currently below their configured low-stock threshold."

        });

      }


      // -----------------------------------------------
      // CUSTOMER INSIGHT
      // -----------------------------------------------

      if (
        customers.length === 0
      ) {

        insights.push({

          type:
            "action",

          title:
            "Start building your customer base",

          message:
            "Add customers to BusyBiz so you can track customer activity and sales relationships."

        });

      } else {

        insights.push({

          type:
            "positive",

          title:
            "Customer base is growing",

          message:
            `BusyBiz currently has ${customers.length} registered customer${
              customers.length === 1
                ? ""
                : "s"
            }.`

        });

      }


      // -----------------------------------------------
      // SALES INSIGHT
      // -----------------------------------------------

      if (
        validOrders.length === 0
      ) {

        insights.push({

          type:
            "action",

          title:
            "No sales recorded yet",

          message:
            "Once you start recording orders, BusyBiz will identify sales trends and opportunities."

        });

      } else {

        const average =
          revenue /
          validOrders.length;


        insights.push({

          type:
            "info",

          title:
            "Average order value",

          message:
            `Your average order value is ${average.toFixed(
              2
            )}. Consider increasing it through bundles, upselling and complementary products.`

        });

      }


      res.json({

        success: true,

        summary: {

          revenue,

          expenses:
            expensesTotal,

          profit,

          orders:
            validOrders.length,

          customers:
            customers.length,

          lowStock:
            lowStock.length

        },

        insights

      });

    } catch (error) {

      console.error(
        "AI INSIGHTS ERROR:",
        error
      );

      res.status(500).json({

        success: false,

        message:
          "Failed to generate AI insights"

      });

    }

  }
);


module.exports = router;