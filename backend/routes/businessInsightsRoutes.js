const express = require("express");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Customer = require("../models/Customer");
const Invoice = require("../models/Invoice");
const Expense = require("../models/Expense");
const Inventory = require("../models/Inventory");

const protect = require("../middleware/authMiddleware");

const {
  businessAccess
} = require("../middleware/businessAccessMiddleware");

const requirePlan = require(
  "../middleware/subscriptionMiddleware"
);

const router = express.Router();


// =====================================================
// BUSINESS INSIGHTS
// =====================================================

router.get(
  "/",
  protect,
  businessAccess,
  requirePlan([
    "starter",
    "professional"
  ]),
  async (req, res) => {

    try {

      const businessId =
        req.business._id;


      const [
        orders,
        products,
        customers,
        invoices,
        expenses,
        inventory
      ] = await Promise.all([

        Order.find({
          business:
            businessId
        }),

        Product.find({
          business:
            businessId
        }),

        Customer.find({
          business:
            businessId
        }),

        Invoice.find({
          business:
            businessId
        }),

        Expense.find({
          business:
            businessId
        }),

        Inventory.find({
          business:
            businessId
        })

      ]);


      // =================================================
      // REVENUE
      // =================================================

      let revenue = 0;

      for (
        const order
        of orders
      ) {

        if (
          order.paymentStatus !==
          "paid"
        ) {
          continue;
        }

        const amount =
          Number(
            order.total || 0
          );

        if (
          Number.isFinite(amount)
        ) {

          revenue += amount;

        }

      }


      // =================================================
      // PAID INVOICES
      // =================================================

      for (
        const invoice
        of invoices
      ) {

        if (
          invoice.paymentStatus !==
          "paid"
        ) {
          continue;
        }

        const amount =
          Number(
            invoice.total || 0
          );

        if (
          Number.isFinite(amount)
        ) {

          revenue += amount;

        }

      }


      // =================================================
      // EXPENSES
      // =================================================

      let expensesTotal = 0;

      for (
        const expense
        of expenses
      ) {

        const amount =
          Number(
            expense.amount || 0
          );

        if (
          Number.isFinite(amount)
        ) {

          expensesTotal += amount;

        }

      }


      // =================================================
      // PROFIT
      // =================================================

      const profit =
        revenue -
        expensesTotal;


      const profitMargin =
        revenue > 0
          ? (
              profit /
              revenue
            ) * 100
          : 0;


      // =================================================
      // LOW STOCK
      // =================================================

      let lowStock = 0;

      let outOfStock = 0;


      for (
        const item
        of inventory
      ) {

        const quantity =
          Number(
            item.quantity || 0
          );

        const limit =
          Number(
            item.lowStockLimit || 0
          );


        if (
          quantity <= 0
        ) {

          outOfStock++;

        } else if (
          quantity <= limit
        ) {

          lowStock++;

        }

      }


      // =================================================
      // OUTSTANDING INVOICES
      // =================================================

      let outstandingAmount = 0;

      let overdueInvoices = 0;


      for (
        const invoice
        of invoices
      ) {

        if (
          [
            "unpaid",
            "partially_paid",
            "overdue"
          ].includes(
            invoice.paymentStatus
          )
        ) {

          const amount =
            Number(
              invoice.total || 0
            );

          if (
            Number.isFinite(amount)
          ) {

            outstandingAmount +=
              amount;

          }

        }


        if (
          invoice.paymentStatus ===
          "overdue"
        ) {

          overdueInvoices++;

        }

      }


      // =================================================
      // SALES ACTIVITY
      // =================================================

      const orderCount =
        orders.length;


      const averageOrderValue =
        orderCount > 0
          ? revenue /
            orderCount
          : 0;


      // =================================================
      // BUSINESS HEALTH SCORE
      // =================================================

      let score = 100;


      // Profit penalty

      if (
        revenue === 0
      ) {

        score -= 30;

      } else if (
        profit < 0
      ) {

        score -= 30;

      } else if (
        profitMargin < 10
      ) {

        score -= 15;

      }


      // Inventory penalty

      if (
        outOfStock > 0
      ) {

        score -= Math.min(
          20,
          outOfStock * 3
        );

      }


      if (
        lowStock > 0
      ) {

        score -= Math.min(
          10,
          lowStock * 2
        );

      }


      // Invoice penalty

      if (
        overdueInvoices > 0
      ) {

        score -= Math.min(
          15,
          overdueInvoices * 3
        );

      }


      // Customer penalty

      if (
        customers.length === 0
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


      // =================================================
      // HEALTH STATUS
      // =================================================

      let healthStatus =
        "excellent";


      if (
        score < 40
      ) {

        healthStatus =
          "critical";

      } else if (
        score < 60
      ) {

        healthStatus =
          "poor";

      } else if (
        score < 80
      ) {

        healthStatus =
          "fair";

      } else if (
        score < 90
      ) {

        healthStatus =
          "good";

      }


      // =================================================
      // WARNINGS
      // =================================================

      const warnings = [];


      if (
        revenue === 0
      ) {

        warnings.push(
          "Your business has no recorded paid revenue yet."
        );

      }


      if (
        profit < 0
      ) {

        warnings.push(
          "Your expenses are currently higher than your revenue."
        );

      }


      if (
        outOfStock > 0
      ) {

        warnings.push(
          `${outOfStock} product(s) are out of stock.`
        );

      }


      if (
        lowStock > 0
      ) {

        warnings.push(
          `${lowStock} product(s) are running low on stock.`
        );

      }


      if (
        overdueInvoices > 0
      ) {

        warnings.push(
          `${overdueInvoices} invoice(s) are overdue.`
        );

      }


      // =================================================
      // RECOMMENDATIONS
      // =================================================

      const recommendations = [];


      if (
        outOfStock > 0 ||
        lowStock > 0
      ) {

        recommendations.push(
          "Review inventory and restock products with low availability."
        );

      }


      if (
        overdueInvoices > 0
      ) {

        recommendations.push(
          "Follow up with customers who have overdue invoices."
        );

      }


      if (
        profitMargin < 10 &&
        revenue > 0
      ) {

        recommendations.push(
          "Review expenses and pricing to improve your profit margin."
        );

      }


      if (
        customers.length === 0
      ) {

        recommendations.push(
          "Start adding customers to build your customer database."
        );

      }


      if (
        recommendations.length === 0
      ) {

        recommendations.push(
          "Keep monitoring sales, expenses and inventory to maintain business performance."
        );

      }


      // =================================================
      // RESPONSE
      // =================================================

      res.status(200).json({

        health: {

          score,

          status:
            healthStatus

        },

        financial: {

          revenue:
            Number(
              revenue.toFixed(2)
            ),

          expenses:
            Number(
              expensesTotal.toFixed(2)
            ),

          profit:
            Number(
              profit.toFixed(2)
            ),

          profitMargin:
            Number(
              profitMargin.toFixed(2)
            )

        },

        sales: {

          orders:
            orderCount,

          averageOrderValue:
            Number(
              averageOrderValue.toFixed(2)
            )

        },

        customers: {

          total:
            customers.length

        },

        inventory: {

          products:
            products.length,

          lowStock,

          outOfStock

        },

        invoices: {

          outstandingAmount:
            Number(
              outstandingAmount.toFixed(2)
            ),

          overdue:
            overdueInvoices

        },

        warnings,

        recommendations

      });

    } catch (error) {

      console.error(
        "BUSINESS INSIGHTS ERROR:",
        error
      );

      res.status(500).json({

        message:
          error.message ||
          "Unable to calculate business insights"

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
  requirePlan([
    "starter",
    "professional"
  ]),
  async (req, res) => {

    try {

      const orders =
        await Order.find({
          business:
            req.business._id,

          paymentStatus:
            "paid"
        });


      const monthlyRevenue = {};


      for (
        const order
        of orders
      ) {

        const date =
          new Date(
            order.createdAt
          );


        const year =
          date.getFullYear();


        const month =
          String(
            date.getMonth() + 1
          ).padStart(
            2,
            "0"
          );


        const key =
          `${year}-${month}`;


        if (
          !monthlyRevenue[key]
        ) {

          monthlyRevenue[key] =
            0;

        }


        const amount =
          Number(
            order.total || 0
          );


        if (
          Number.isFinite(amount)
        ) {

          monthlyRevenue[key] +=
            amount;

        }

      }


      const values =
        Object.values(
          monthlyRevenue
        );


      const months =
        Object.keys(
          monthlyRevenue
        ).length;


      const averageRevenue =
        months > 0
          ? values.reduce(
              (
                total,
                value
              ) =>
                total + value,
              0
            ) / months
          : 0;


      res.status(200).json({

        historicalMonths:
          months,

        averageMonthlyRevenue:
          Number(
            averageRevenue.toFixed(2)
          ),

        forecastNextMonth:
          Number(
            averageRevenue.toFixed(2)
          ),

        method:
          "Historical monthly average"

      });

    } catch (error) {

      console.error(
        "BUSINESS FORECAST ERROR:",
        error
      );

      res.status(500).json({

        message:
          error.message ||
          "Unable to generate forecast"

      });

    }

  }
);


// =====================================================
// EXPORT
// =====================================================

module.exports = router;