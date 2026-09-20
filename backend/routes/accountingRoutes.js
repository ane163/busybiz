const express = require("express");

const Order = require("../models/Order");
const Invoice = require("../models/Invoice");
const Expense = require("../models/Expense");

const protect = require("../middleware/authMiddleware");

const {
  businessAccess
} = require("../middleware/businessAccessMiddleware");

const requirePlan = require(
  "../middleware/subscriptionMiddleware"
);

const router = express.Router();


// =====================================================
// ACCOUNTING SUMMARY
// =====================================================

router.get(
  "/summary",
  protect,
  businessAccess,
  requirePlan([
    "free",
    "starter",
    "professional"
  ]),
  async (req, res) => {

    try {

      const businessId =
        req.business._id;


      // =================================================
      // ORDERS
      // =================================================

      const orders =
        await Order.find({
          business:
            businessId,

          paymentStatus:
            "paid"
        });


      let orderRevenue = 0;


      for (const order of orders) {

        const amount =
          Number(order.total || 0);

        if (
          Number.isFinite(amount)
        ) {

          orderRevenue += amount;

        }

      }


      // =================================================
      // PAID INVOICES
      // =================================================

      const paidInvoices =
        await Invoice.find({
          business:
            businessId,

          paymentStatus:
            "paid"
        });


      let invoiceRevenue = 0;


      for (
        const invoice
        of paidInvoices
      ) {

        const amount =
          Number(invoice.total || 0);

        if (
          Number.isFinite(amount)
        ) {

          invoiceRevenue += amount;

        }

      }


      // =================================================
      // OUTSTANDING INVOICES
      // =================================================

      const outstandingInvoices =
        await Invoice.find({
          business:
            businessId,

          paymentStatus: {
            $in: [
              "unpaid",
              "partially_paid",
              "overdue"
            ]
          }
        });


      let outstandingAmount = 0;


      for (
        const invoice
        of outstandingInvoices
      ) {

        const amount =
          Number(invoice.total || 0);

        if (
          Number.isFinite(amount)
        ) {

          outstandingAmount += amount;

        }

      }


      // =================================================
      // EXPENSES
      // =================================================

      const expenses =
        await Expense.find({
          business:
            businessId
        });


      let totalExpenses = 0;


      for (
        const expense
        of expenses
      ) {

        const amount =
          Number(expense.amount || 0);

        if (
          Number.isFinite(amount)
        ) {

          totalExpenses += amount;

        }

      }


      // =================================================
      // TOTAL REVENUE
      // =================================================

      const totalRevenue =
        orderRevenue +
        invoiceRevenue;


      // =================================================
      // NET PROFIT
      // =================================================

      const netProfit =
        totalRevenue -
        totalExpenses;


      // =================================================
      // PROFIT MARGIN
      // =================================================

      const profitMargin =
        totalRevenue > 0
          ? (
              netProfit /
              totalRevenue
            ) * 100
          : 0;


      // =================================================
      // RESPONSE
      // =================================================

      res.status(200).json({

        revenue: {

          orders:
            Number(
              orderRevenue.toFixed(2)
            ),

          invoices:
            Number(
              invoiceRevenue.toFixed(2)
            ),

          total:
            Number(
              totalRevenue.toFixed(2)
            )

        },

        expenses: {

          total:
            Number(
              totalExpenses.toFixed(2)
            )

        },

        outstanding: {

          invoices:
            outstandingInvoices.length,

          amount:
            Number(
              outstandingAmount.toFixed(2)
            )

        },

        profit: {

          net:
            Number(
              netProfit.toFixed(2)
            ),

          margin:
            Number(
              profitMargin.toFixed(2)
            )

        }

      });

    } catch (error) {

      console.error(
        "ACCOUNTING SUMMARY ERROR:",
        error
      );

      res.status(500).json({

        message:
          error.message ||
          "Unable to calculate accounting summary"

      });

    }

  }
);


// =====================================================
// PROFIT & LOSS
// =====================================================

router.get(
  "/profit-loss",
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


      const orders =
        await Order.find({
          business:
            businessId,

          paymentStatus:
            "paid"
        });


      const invoices =
        await Invoice.find({
          business:
            businessId,

          paymentStatus:
            "paid"
        });


      const expenses =
        await Expense.find({
          business:
            businessId
        });


      let revenue = 0;

      let expenseTotal = 0;


      // =================================================
      // ORDER REVENUE
      // =================================================

      for (
        const order
        of orders
      ) {

        const amount =
          Number(order.total || 0);

        if (
          Number.isFinite(amount)
        ) {

          revenue += amount;

        }

      }


      // =================================================
      // INVOICE REVENUE
      // =================================================

      for (
        const invoice
        of invoices
      ) {

        const amount =
          Number(invoice.total || 0);

        if (
          Number.isFinite(amount)
        ) {

          revenue += amount;

        }

      }


      // =================================================
      // EXPENSES
      // =================================================

      for (
        const expense
        of expenses
      ) {

        const amount =
          Number(expense.amount || 0);

        if (
          Number.isFinite(amount)
        ) {

          expenseTotal += amount;

        }

      }


      const profit =
        revenue -
        expenseTotal;


      const margin =
        revenue > 0
          ? (
              profit /
              revenue
            ) * 100
          : 0;


      res.status(200).json({

        period:
          "all-time",

        revenue:
          Number(
            revenue.toFixed(2)
          ),

        expenses:
          Number(
            expenseTotal.toFixed(2)
          ),

        profit:
          Number(
            profit.toFixed(2)
          ),

        profitMargin:
          Number(
            margin.toFixed(2)
          )

      });

    } catch (error) {

      console.error(
        "PROFIT LOSS ERROR:",
        error
      );

      res.status(500).json({

        message:
          error.message ||
          "Unable to calculate profit and loss"

      });

    }

  }
);


// =====================================================
// EXPENSE BREAKDOWN
// =====================================================

router.get(
  "/expense-breakdown",
  protect,
  businessAccess,
  requirePlan([
    "starter",
    "professional"
  ]),
  async (req, res) => {

    try {

      const expenses =
        await Expense.find({
          business:
            req.business._id
        });


      const breakdown = {};


      for (
        const expense
        of expenses
      ) {

        const category =
          expense.category ||
          "Other";


        const amount =
          Number(
            expense.amount || 0
          );


        if (
          !Number.isFinite(amount)
        ) {
          continue;
        }


        if (
          !breakdown[category]
        ) {

          breakdown[category] =
            0;

        }


        breakdown[category] +=
          amount;

      }


      const result =
        Object.entries(
          breakdown
        )
          .map(
            ([
              category,
              amount
            ]) => ({

              category,

              amount:
                Number(
                  amount.toFixed(2)
                )

            })
          )
          .sort(
            (a, b) =>
              b.amount -
              a.amount
          );


      res.status(200).json(
        result
      );

    } catch (error) {

      console.error(
        "EXPENSE BREAKDOWN ERROR:",
        error
      );

      res.status(500).json({

        message:
          error.message ||
          "Unable to calculate expense breakdown"

      });

    }

  }
);


// =====================================================
// MONTHLY ACCOUNTING
// =====================================================

router.get(
  "/monthly",
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


      const orders =
        await Order.find({
          business:
            businessId,

          paymentStatus:
            "paid"
        });


      const invoices =
        await Invoice.find({
          business:
            businessId,

          paymentStatus:
            "paid"
        });


      const expenses =
        await Expense.find({
          business:
            businessId
        });


      const months = {};


      const getMonthKey =
        (date) => {

          const d =
            new Date(date);

          const year =
            d.getFullYear();

          const month =
            String(
              d.getMonth() + 1
            ).padStart(
              2,
              "0"
            );

          return `${year}-${month}`;

        };


      const ensureMonth =
        (key) => {

          if (!months[key]) {

            months[key] = {

              month:
                key,

              revenue:
                0,

              expenses:
                0,

              profit:
                0

            };

          }

        };


      // =================================================
      // ORDERS
      // =================================================

      for (
        const order
        of orders
      ) {

        const key =
          getMonthKey(
            order.createdAt
          );


        ensureMonth(key);


        const amount =
          Number(
            order.total || 0
          );


        if (
          Number.isFinite(amount)
        ) {

          months[key].revenue +=
            amount;

        }

      }


      // =================================================
      // INVOICES
      // =================================================

      for (
        const invoice
        of invoices
      ) {

        const key =
          getMonthKey(
            invoice.createdAt
          );


        ensureMonth(key);


        const amount =
          Number(
            invoice.total || 0
          );


        if (
          Number.isFinite(amount)
        ) {

          months[key].revenue +=
            amount;

        }

      }


      // =================================================
      // EXPENSES
      // =================================================

      for (
        const expense
        of expenses
      ) {

        const key =
          getMonthKey(
            expense.date ||
            expense.createdAt
          );


        ensureMonth(key);


        const amount =
          Number(
            expense.amount || 0
          );


        if (
          Number.isFinite(amount)
        ) {

          months[key].expenses +=
            amount;

        }

      }


      // =================================================
      // CALCULATE PROFIT
      // =================================================

      const result =
        Object.values(
          months
        )
          .map(
            (month) => {

              month.revenue =
                Number(
                  month.revenue.toFixed(2)
                );

              month.expenses =
                Number(
                  month.expenses.toFixed(2)
                );

              month.profit =
                Number(
                  (
                    month.revenue -
                    month.expenses
                  ).toFixed(2)
                );

              return month;

            }
          )
          .sort(
            (a, b) =>
              a.month.localeCompare(
                b.month
              )
          );


      res.status(200).json(
        result
      );

    } catch (error) {

      console.error(
        "MONTHLY ACCOUNTING ERROR:",
        error
      );

      res.status(500).json({

        message:
          error.message ||
          "Unable to calculate monthly accounting"

      });

    }

  }
);


// =====================================================
// EXPORT
// =====================================================

module.exports = router;