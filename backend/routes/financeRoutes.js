const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
  businessAccess
} = require("../middleware/businessAccessMiddleware");

const requirePlan =
  require("../middleware/subscriptionMiddleware");

const {
  getFinanceSummary,
  getProfitLoss,
  getExpenseBreakdown,
  getMonthly,
  getRevenue,
  getInvoicePayments,
  getExpenses,
  getOutstandingInvoices,
  getOverdueInvoices
} = require("../services/financeService");

const router =
  express.Router();


// =====================================================
// SUMMARY
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

      const {
        startDate,
        endDate
      } = req.query;

      const summary =
        await getFinanceSummary({

          businessId:
            req.business._id,

          startDate,
          endDate

        });

      res.json(summary);

    } catch (error) {

      console.error(
        "FINANCE SUMMARY ERROR:",
        error
      );

      res.status(500).json({

        message:
          error.message

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
    "free",
    "starter",
    "professional"
  ]),
  async (req, res) => {

    try {

      const {
        startDate,
        endDate
      } = req.query;

      const result =
        await getProfitLoss({

          businessId:
            req.business._id,

          startDate,
          endDate

        });

      res.json(result);

    } catch (error) {

      console.error(
        "PROFIT LOSS ERROR:",
        error
      );

      res.status(500).json({

        message:
          error.message

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
    "free",
    "starter",
    "professional"
  ]),
  async (req, res) => {

    try {

      const {
        startDate,
        endDate
      } = req.query;

      const result =
        await getExpenseBreakdown({

          businessId:
            req.business._id,

          startDate,
          endDate

        });

      res.json(result);

    } catch (error) {

      console.error(
        "EXPENSE BREAKDOWN ERROR:",
        error
      );

      res.status(500).json({

        message:
          error.message

      });

    }

  }
);


// =====================================================
// MONTHLY
// =====================================================

router.get(
  "/monthly",
  protect,
  businessAccess,
  requirePlan([
    "free",
    "starter",
    "professional"
  ]),
  async (req, res) => {

    try {

      const year =
        req.query.year ||
        new Date().getFullYear();

      const result =
        await getMonthly({

          businessId:
            req.business._id,

          year

        });

      res.json(result);

    } catch (error) {

      console.error(
        "MONTHLY FINANCE ERROR:",
        error
      );

      res.status(500).json({

        message:
          error.message

      });

    }

  }
);


// =====================================================
// REVENUE
// =====================================================

router.get(
  "/revenue",
  protect,
  businessAccess,
  requirePlan([
    "free",
    "starter",
    "professional"
  ]),
  async (req, res) => {

    try {

      const {
        startDate,
        endDate
      } = req.query;

      const result =
        await getRevenue({

          businessId:
            req.business._id,

          startDate,
          endDate

        });

      res.json(result);

    } catch (error) {

      console.error(
        "REVENUE ERROR:",
        error
      );

      res.status(500).json({

        message:
          error.message

      });

    }

  }
);


// =====================================================
// INVOICE PAYMENTS
// =====================================================

router.get(
  "/payments",
  protect,
  businessAccess,
  requirePlan([
    "free",
    "starter",
    "professional"
  ]),
  async (req, res) => {

    try {

      const {
        startDate,
        endDate
      } = req.query;

      const result =
        await getInvoicePayments({

          businessId:
            req.business._id,

          startDate,
          endDate

        });

      res.json(result);

    } catch (error) {

      console.error(
        "PAYMENTS ERROR:",
        error
      );

      res.status(500).json({

        message:
          error.message

      });

    }

  }
);


// =====================================================
// EXPENSES
// =====================================================

router.get(
  "/expenses",
  protect,
  businessAccess,
  requirePlan([
    "free",
    "starter",
    "professional"
  ]),
  async (req, res) => {

    try {

      const {
        startDate,
        endDate
      } = req.query;

      const result =
        await getExpenses({

          businessId:
            req.business._id,

          startDate,
          endDate

        });

      res.json(result);

    } catch (error) {

      console.error(
        "EXPENSES ERROR:",
        error
      );

      res.status(500).json({

        message:
          error.message

      });

    }

  }
);


// =====================================================
// OUTSTANDING
// =====================================================

router.get(
  "/outstanding",
  protect,
  businessAccess,
  requirePlan([
    "free",
    "starter",
    "professional"
  ]),
  async (req, res) => {

    try {

      const result =
        await getOutstandingInvoices({

          businessId:
            req.business._id

        });

      res.json(result);

    } catch (error) {

      console.error(
        "OUTSTANDING ERROR:",
        error
      );

      res.status(500).json({

        message:
          error.message

      });

    }

  }
);


// =====================================================
// OVERDUE
// =====================================================

router.get(
  "/overdue",
  protect,
  businessAccess,
  requirePlan([
    "free",
    "starter",
    "professional"
  ]),
  async (req, res) => {

    try {

      const result =
        await getOverdueInvoices({

          businessId:
            req.business._id

        });

      res.json(result);

    } catch (error) {

      console.error(
        "OVERDUE ERROR:",
        error
      );

      res.status(500).json({

        message:
          error.message

      });

    }

  }
);


module.exports =
  router;