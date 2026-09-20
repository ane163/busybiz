const express = require("express");

const requirePlan = require(
  "../middleware/subscriptionMiddleware"
);

const Product = require("../models/Product");
const Order = require("../models/Order");
const Expense = require("../models/Expense");
const Inventory = require("../models/Inventory");

const protect = require("../middleware/authMiddleware");

const {
  businessAccess
} = require(
  "../middleware/businessAccessMiddleware"
);

const router = express.Router();


// =====================================================
// BUSINESS HEALTH SCORE
// =====================================================

router.get(
  "/score",
  protect,
  businessAccess,
  requirePlan([
    "professional"
  ]),
  async (req, res) => {

    try {

      // ============================================
      // GET CURRENT BUSINESS
      // ============================================

      const business =
        req.business;


      // ============================================
      // GET BUSINESS DATA
      // ============================================

      const [
        products,
        orders,
        expenses,
        inventory
      ] = await Promise.all([

        Product.find({
          business:
            business._id
        }),

        Order.find({
          business:
            business._id
        }),

        Expense.find({
          business:
            business._id
        }),

        Inventory.find({
          business:
            business._id
        })

      ]);


      // ============================================
      // REVENUE
      // ============================================

      const revenue =
        orders.reduce(
          (
            total,
            order
          ) => {

            return total +
              Number(
                order.total || 0
              );

          },
          0
        );


      // ============================================
      // EXPENSES
      // ============================================

      const totalExpenses =
        expenses.reduce(
          (
            total,
            expense
          ) => {

            return total +
              Number(
                expense.amount || 0
              );

          },
          0
        );


      // ============================================
      // PROFIT
      // ============================================

      const profit =
        revenue -
        totalExpenses;


      // ============================================
      // PROFIT SCORE — 30 POINTS
      // ============================================

      let profitScore = 0;


      if (revenue > 0) {

        const margin =
          profit /
          revenue;


        if (margin >= 0.30) {

          profitScore = 30;

        } else if (
          margin >= 0.20
        ) {

          profitScore = 25;

        } else if (
          margin >= 0.10
        ) {

          profitScore = 20;

        } else if (
          margin > 0
        ) {

          profitScore = 10;

        }

      }


      // ============================================
      // SALES SCORE — 25 POINTS
      // ============================================

      let salesScore = 0;


      if (
        orders.length >= 100
      ) {

        salesScore = 25;

      } else if (
        orders.length >= 50
      ) {

        salesScore = 20;

      } else if (
        orders.length >= 20
      ) {

        salesScore = 15;

      } else if (
        orders.length >= 5
      ) {

        salesScore = 10;

      } else if (
        orders.length > 0
      ) {

        salesScore = 5;

      }


      // ============================================
      // INVENTORY SCORE — 20 POINTS
      // ============================================

      let inventoryScore = 0;


      if (
        inventory.length > 0
      ) {

        const lowStock =
          inventory.filter(
            (item) => {

              const quantity =
                Number(
                  item.quantity || 0
                );

              const lowStockLimit =
                Number(
                  item.lowStockLimit || 0
                );


              return (
                quantity <=
                lowStockLimit
              );

            }
          ).length;


        const lowStockPercentage =
          lowStock /
          inventory.length;


        if (
          lowStockPercentage <= 0.10
        ) {

          inventoryScore = 20;

        } else if (
          lowStockPercentage <= 0.25
        ) {

          inventoryScore = 15;

        } else if (
          lowStockPercentage <= 0.50
        ) {

          inventoryScore = 10;

        } else {

          inventoryScore = 5;

        }

      }


      // ============================================
      // EXPENSE SCORE — 15 POINTS
      // ============================================

      let expenseScore = 0;


      if (revenue > 0) {

        const expenseRatio =
          totalExpenses /
          revenue;


        if (
          expenseRatio <= 0.20
        ) {

          expenseScore = 15;

        } else if (
          expenseRatio <= 0.40
        ) {

          expenseScore = 12;

        } else if (
          expenseRatio <= 0.60
        ) {

          expenseScore = 8;

        } else if (
          expenseRatio <= 0.80
        ) {

          expenseScore = 4;

        }

      }


      // ============================================
      // ACTIVITY SCORE — 10 POINTS
      // ============================================

      let activityScore = 0;


      if (
        orders.length >= 20
      ) {

        activityScore = 10;

      } else if (
        orders.length >= 10
      ) {

        activityScore = 8;

      } else if (
        orders.length >= 5
      ) {

        activityScore = 5;

      } else if (
        orders.length > 0
      ) {

        activityScore = 3;

      }


      // ============================================
      // FINAL SCORE
      // ============================================

      const score =
        Math.min(
          100,
          profitScore +
          salesScore +
          inventoryScore +
          expenseScore +
          activityScore
        );


      // ============================================
      // HEALTH STATUS
      // ============================================

      let status;


      if (
        score >= 80
      ) {

        status = "Excellent";

      } else if (
        score >= 60
      ) {

        status = "Healthy";

      } else if (
        score >= 40
      ) {

        status = "Needs Attention";

      } else {

        status = "At Risk";

      }


      // ============================================
      // RESPONSE
      // ============================================

      res.json({

        score,

        status,

        revenue,

        expenses:
          totalExpenses,

        profit,

        orders:
          orders.length,

        products:
          products.length,

        inventoryItems:
          inventory.length,

        scores: {

          profit:
            profitScore,

          sales:
            salesScore,

          inventory:
            inventoryScore,

          expenses:
            expenseScore,

          activity:
            activityScore

        }

      });


    } catch (error) {

      console.error(
        "HEALTH SCORE ERROR:",
        error
      );

      res.status(500).json({
        message:
          error.message
      });

    }

  }
);


module.exports = router;