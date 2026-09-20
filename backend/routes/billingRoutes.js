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
// BILLING SUMMARY
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


      const [
        orders,
        invoices,
        expenses
      ] = await Promise.all([

        Order.find({
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
        })

      ]);


      // =================================================
      // SALES
      // =================================================

      let paidSales = 0;
      let unpaidSales = 0;


      for (
        const order
        of orders
      ) {

        const amount =
          Number(
            order.total || 0
          );


        if (
          !Number.isFinite(amount)
        ) {
          continue;
        }


        if (
          order.paymentStatus ===
          "paid"
        ) {

          paidSales +=
            amount;

        } else {

          unpaidSales +=
            amount;

        }

      }


      // =================================================
      // INVOICES
      // =================================================

      let paidInvoices = 0;
      let unpaidInvoices = 0;
      let overdueInvoices = 0;


      for (
        const invoice
        of invoices
      ) {

        const amount =
          Number(
            invoice.total || 0
          );


        if (
          !Number.isFinite(amount)
        ) {
          continue;
        }


        switch (
          invoice.paymentStatus
        ) {

          case "paid":

            paidInvoices +=
              amount;

            break;


          case "overdue":

            overdueInvoices +=
              amount;

            unpaidInvoices +=
              amount;

            break;


          case "unpaid":

          case "partially_paid":

            unpaidInvoices +=
              amount;

            break;

        }

      }


      // =================================================
      // EXPENSES
      // =================================================

      let totalExpenses = 0;


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

          totalExpenses +=
            amount;

        }

      }


      // =================================================
      // TOTALS
      // =================================================

      const totalCollected =
        paidSales +
        paidInvoices;


      const totalOutstanding =
        unpaidSales +
        unpaidInvoices;


      const netCashFlow =
        totalCollected -
        totalExpenses;


      res.status(200).json({

        sales: {

          paid:
            Number(
              paidSales.toFixed(2)
            ),

          outstanding:
            Number(
              unpaidSales.toFixed(2)
            )

        },

        invoices: {

          paid:
            Number(
              paidInvoices.toFixed(2)
            ),

          outstanding:
            Number(
              unpaidInvoices.toFixed(2)
            ),

          overdue:
            Number(
              overdueInvoices.toFixed(2)
            )

        },

        expenses: {

          total:
            Number(
              totalExpenses.toFixed(2)
            )

        },

        totals: {

          collected:
            Number(
              totalCollected.toFixed(2)
            ),

          outstanding:
            Number(
              totalOutstanding.toFixed(2)
            ),

          cashFlow:
            Number(
              netCashFlow.toFixed(2)
            )

        }

      });

    } catch (error) {

      console.error(
        "BILLING SUMMARY ERROR:",
        error
      );

      res.status(500).json({

        message:
          error.message ||
          "Unable to load billing summary"

      });

    }

  }
);


// =====================================================
// PAYMENT STATUS
// =====================================================

router.get(
  "/payment-status",
  protect,
  businessAccess,
  requirePlan([
    "free",
    "starter",
    "professional"
  ]),
  async (req, res) => {

    try {

      const [
        orders,
        invoices
      ] = await Promise.all([

        Order.find({
          business:
            req.business._id
        }),

        Invoice.find({
          business:
            req.business._id
        })

      ]);


      const result = {

        orders: {

          total:
            orders.length,

          paid:
            0,

          unpaid:
            0

        },

        invoices: {

          total:
            invoices.length,

          paid:
            0,

          unpaid:
            0,

          overdue:
            0

        }

      };


      for (
        const order
        of orders
      ) {

        if (
          order.paymentStatus ===
          "paid"
        ) {

          result.orders.paid++;

        } else {

          result.orders.unpaid++;

        }

      }


      for (
        const invoice
        of invoices
      ) {

        if (
          invoice.paymentStatus ===
          "paid"
        ) {

          result.invoices.paid++;

        } else {

          result.invoices.unpaid++;

        }


        if (
          invoice.paymentStatus ===
          "overdue"
        ) {

          result.invoices.overdue++;

        }

      }


      res.status(200).json(
        result
      );

    } catch (error) {

      console.error(
        "PAYMENT STATUS ERROR:",
        error
      );

      res.status(500).json({

        message:
          error.message ||
          "Unable to load payment status"

      });

    }

  }
);


// =====================================================
// OUTSTANDING PAYMENTS
// =====================================================

router.get(
  "/outstanding",
  protect,
  businessAccess,
  requirePlan([
    "starter",
    "professional"
  ]),
  async (req, res) => {

    try {

      const invoices =
        await Invoice.find({

          business:
            req.business._id,

          paymentStatus: {

            $in: [
              "unpaid",
              "partially_paid",
              "overdue"
            ]

          }

        })
          .populate(
            "customer"
          )
          .sort({
            dueDate:
              1
          });


      const result =
        invoices.map(
          invoice => ({

            id:
              invoice._id,

            invoiceNumber:
              invoice.invoiceNumber,

            customer:
              invoice.customer,

            total:
              Number(
                invoice.total || 0
              ),

            dueDate:
              invoice.dueDate,

            paymentStatus:
              invoice.paymentStatus,

            createdAt:
              invoice.createdAt

          })
        );


      res.status(200).json(
        result
      );

    } catch (error) {

      console.error(
        "OUTSTANDING PAYMENTS ERROR:",
        error
      );

      res.status(500).json({

        message:
          error.message ||
          "Unable to load outstanding payments"

      });

    }

  }
);


// =====================================================
// BILLING HEALTH
// =====================================================

router.get(
  "/health",
  protect,
  businessAccess,
  requirePlan([
    "starter",
    "professional"
  ]),
  async (req, res) => {

    try {

      const invoices =
        await Invoice.find({

          business:
            req.business._id

        });


      let overdue = 0;
      let outstanding = 0;
      let paid = 0;


      for (
        const invoice
        of invoices
      ) {

        const amount =
          Number(
            invoice.total || 0
          );


        if (
          !Number.isFinite(amount)
        ) {
          continue;
        }


        if (
          invoice.paymentStatus ===
          "paid"
        ) {

          paid +=
            amount;

        } else if (
          invoice.paymentStatus ===
          "overdue"
        ) {

          overdue +=
            amount;

          outstanding +=
            amount;

        } else if (
          [
            "unpaid",
            "partially_paid"
          ].includes(
            invoice.paymentStatus
          )
        ) {

          outstanding +=
            amount;

        }

      }


      const totalBilled =
        paid +
        outstanding;


      const collectionRate =
        totalBilled > 0
          ? (
              paid /
              totalBilled
            ) * 100
          : 100;


      let status =
        "healthy";


      if (
        collectionRate < 50
      ) {

        status =
          "critical";

      } else if (
        collectionRate < 75
      ) {

        status =
          "warning";

      }


      res.status(200).json({

        status,

        collectionRate:
          Number(
            collectionRate.toFixed(2)
          ),

        paid:
          Number(
            paid.toFixed(2)
          ),

        outstanding:
          Number(
            outstanding.toFixed(2)
          ),

        overdue:
          Number(
            overdue.toFixed(2)
          )

      });

    } catch (error) {

      console.error(
        "BILLING HEALTH ERROR:",
        error
      );

      res.status(500).json({

        message:
          error.message ||
          "Unable to calculate billing health"

      });

    }

  }
);


// =====================================================
// EXPORT
// =====================================================

module.exports = router;