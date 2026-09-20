const express = require("express");

const Payment = require("../models/Payment");
const Subscription = require("../models/Subscription");

const protect = require("../middleware/authMiddleware");

const router = express.Router();


// =====================================================
// PLAN PRICES
// =====================================================

const PLAN_PRICES = {
  starter: 10,
  professional: 25
};


// =====================================================
// GET PAYMENT HISTORY
// =====================================================

router.get(
  "/",
  protect,
  async (req, res) => {

    try {

      const payments =
        await Payment.find({
          user: req.user.id
        })
          .populate(
            "subscription",
            "plan billingCycle"
          )
          .sort({
            createdAt: -1
          });

      res.json({
        payments
      });

    } catch (error) {

      console.error(
        "GET PAYMENT HISTORY ERROR:",
        error
      );

      res.status(500).json({
        message: error.message
      });

    }

  }
);


// =====================================================
// GET ONE PAYMENT
// =====================================================

router.get(
  "/:id",
  protect,
  async (req, res) => {

    try {

      const payment =
        await Payment.findOne({
          _id: req.params.id,
          user: req.user.id
        })
          .populate(
            "subscription"
          );

      if (!payment) {

        return res.status(404).json({
          message:
            "Payment not found."
        });

      }

      res.json({
        payment
      });

    } catch (error) {

      console.error(
        "GET PAYMENT ERROR:",
        error
      );

      res.status(500).json({
        message: error.message
      });

    }

  }
);


// =====================================================
// CREATE PAYMENT
// =====================================================

router.post(
  "/create",
  protect,
  async (req, res) => {

    try {

      const {
        plan,
        billingCycle = "monthly"
      } = req.body;


      // =================================================
      // VALIDATE PLAN
      // =================================================

      const allowedPlans = [
        "starter",
        "professional"
      ];

      if (
        !allowedPlans.includes(plan)
      ) {

        return res.status(400).json({
          message:
            "Invalid paid plan."
        });

      }


      // =================================================
      // VALIDATE BILLING CYCLE
      // =================================================

      if (
        ![
          "monthly",
          "yearly"
        ].includes(billingCycle)
      ) {

        return res.status(400).json({
          message:
            "Invalid billing cycle."
        });

      }


      // =================================================
      // FIND SUBSCRIPTION
      // =================================================

      const subscription =
        await Subscription.findOne({
          user: req.user.id
        });

      if (!subscription) {

        return res.status(404).json({
          message:
            "Subscription not found."
        });

      }


      // =================================================
      // CALCULATE PRICE
      // =================================================

      let amount =
        PLAN_PRICES[plan];


      if (
        billingCycle === "yearly"
      ) {

        // 10 months paid
        // 2 months free

        amount =
          amount * 10;

      }


      // =================================================
      // TRANSACTION ID
      // =================================================

      const transactionId =
        `BB-${Date.now()}-${Math.floor(
          Math.random() * 100000
        )}`;


      // =================================================
      // CREATE PAYMENT RECORD
      // =================================================

      const payment =
        await Payment.create({

          user:
            req.user.id,

          subscription:
            subscription._id,

          plan,

          amount,

          currency:
            "USD",

          billingCycle,

          status:
            "pending",

          provider:
            "paynow",

          transactionId,

          description:
            `${plan} plan - ${billingCycle} subscription`

        });


      // =================================================
      // RESPONSE
      // =================================================

      res.status(201).json({

        message:
          "Payment created successfully.",

        payment,

        paymentRequired:
          true,

        nextStep:
          "Connect this payment to Paynow checkout."

      });


    } catch (error) {

      console.error(
        "CREATE PAYMENT ERROR:",
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
// PAYNOW RESULT CALLBACK
// =====================================================
//
// This endpoint will receive Paynow's result.
//
// IMPORTANT:
// Never trust the callback alone.
// We will verify the transaction with Paynow
// before marking the payment as paid.
// =====================================================

router.post(
  "/paynow/result",
  async (req, res) => {

    try {

      console.log(
        "PAYNOW RESULT RECEIVED:",
        req.body
      );


      // Paynow verification will be
      // implemented here next.


      res.status(200).send("OK");

    } catch (error) {

      console.error(
        "PAYNOW RESULT ERROR:",
        error
      );

      res.status(500).send("ERROR");

    }

  }
);


// =====================================================
// CANCEL PAYMENT
// =====================================================

router.put(
  "/:id/cancel",
  protect,
  async (req, res) => {

    try {

      const payment =
        await Payment.findOne({
          _id: req.params.id,
          user: req.user.id
        });


      if (!payment) {

        return res.status(404).json({
          message:
            "Payment not found."
        });

      }


      if (
        payment.status === "paid"
      ) {

        return res.status(400).json({
          message:
            "A completed payment cannot be cancelled."
        });

      }


      payment.status =
        "cancelled";


      await payment.save();


      res.json({

        message:
          "Payment cancelled successfully.",

        payment

      });

    } catch (error) {

      console.error(
        "CANCEL PAYMENT ERROR:",
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
// EXPORT
// =====================================================

module.exports =
  router;