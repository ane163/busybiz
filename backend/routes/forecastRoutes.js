const express = require("express");

const Order = require("../models/Order");

const protect = require("../middleware/authMiddleware");

const requirePlan = require(
  "../middleware/subscriptionMiddleware"
);

const {
  businessAccess
} = require(
  "../middleware/businessAccessMiddleware"
);

const router = express.Router();


// =====================================================
// SALES FORECAST
// =====================================================

router.get(
  "/sales",
  protect,
  businessAccess,
  requirePlan([
    "starter",
    "professional"
  ]),
  async (req, res) => {

    try {

      // ============================================
      // GET BUSINESS
      // ============================================

      const business =
        req.business;


      // ============================================
      // GET ORDERS
      // ============================================

      const orders =
        await Order.find({
          business:
            business._id
        }).sort({
          createdAt: 1
        });


      // ============================================
      // CHECK SALES DATA
      // ============================================

      if (
        orders.length === 0
      ) {

        return res.json({

          message:
            "Not enough sales data",

          totalOrders:
            0,

          daysWithSales:
            0,

          totalSales:
            0,

          averageDailySales:
            0,

          projectedMonthlySales:
            0

        });

      }


      // ============================================
      // GROUP SALES BY DAY
      // ============================================

      const salesByDay = {};


      orders.forEach(
        (order) => {

          const date =
            new Date(
              order.createdAt
            );


          const day =
            date
              .toISOString()
              .split("T")[0];


          if (
            !salesByDay[day]
          ) {

            salesByDay[day] =
              0;

          }


          salesByDay[day] +=
            Number(
              order.total || 0
            );

        }
      );


      // ============================================
      // CALCULATE SALES
      // ============================================

      const days =
        Object.keys(
          salesByDay
        );


      const totalSales =
        Object.values(
          salesByDay
        ).reduce(
          (
            total,
            value
          ) => {

            return total +
              Number(value || 0);

          },
          0
        );


      // ============================================
      // AVERAGE DAILY SALES
      // ============================================

      const averageDailySales =
        days.length > 0
          ? totalSales /
            days.length
          : 0;


      // ============================================
      // PROJECT MONTHLY SALES
      // ============================================

      const projectedMonthlySales =
        averageDailySales *
        30;


      // ============================================
      // RESPONSE
      // ============================================

      res.json({

        totalOrders:
          orders.length,

        daysWithSales:
          days.length,

        totalSales,

        averageDailySales,

        projectedMonthlySales

      });


    } catch (error) {

      console.error(
        "FORECAST ERROR:",
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