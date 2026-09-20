const express = require("express");

const Subscription = require("../models/Subscription");
const User = require("../models/User");

const protect = require("../middleware/authMiddleware");

const router = express.Router();


// =====================================================
// PLAN PRICES
// =====================================================

const PLAN_PRICES = {
  free: 0,
  starter: 10,
  professional: 25
};


// =====================================================
// HELPER — CREATE TRIAL
// =====================================================

const createTrialSubscription = async (userId) => {

  const trialStart = new Date();

  const trialEnd = new Date(
    trialStart
  );

  trialEnd.setDate(
    trialEnd.getDate() + 14
  );

  return await Subscription.create({

    user: userId,

    plan: "free",

    status: "trial",

    trialStart,

    trialEnd,

    price: 0,

    currency: "USD",

    billingCycle: "monthly",

    autoRenew: false,

    paymentProvider: "none",

    lastPaymentStatus: "none"

  });
};


// =====================================================
// GET CURRENT SUBSCRIPTION
// =====================================================

router.get(
  "/",
  protect,
  async (req, res) => {

    try {

      let subscription =
        await Subscription.findOne({
          user: req.user.id
        });


      // -------------------------------------------------
      // CREATE TRIAL IF NONE EXISTS
      // -------------------------------------------------

      if (!subscription) {

        subscription =
          await createTrialSubscription(
            req.user.id
          );

      }


      // -------------------------------------------------
      // CHECK TRIAL EXPIRATION
      // -------------------------------------------------

      if (
        subscription.status === "trial" &&
        subscription.trialEnd
      ) {

        const now = new Date();

        if (
          now > subscription.trialEnd
        ) {

          subscription.status =
            "expired";

          subscription.plan =
            "free";

          subscription.autoRenew =
            false;

          await subscription.save();

        }

      }


      res.json({
        subscription
      });

    } catch (error) {

      console.error(
        "GET SUBSCRIPTION ERROR:",
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
// GET SUBSCRIPTION SUMMARY
// =====================================================

router.get(
  "/summary",
  protect,
  async (req, res) => {

    try {

      let subscription =
        await Subscription.findOne({
          user: req.user.id
        });


      if (!subscription) {

        subscription =
          await createTrialSubscription(
            req.user.id
          );

      }


      // -------------------------------------------------
      // CHECK TRIAL
      // -------------------------------------------------

      if (
        subscription.status === "trial" &&
        subscription.trialEnd &&
        new Date() >
        subscription.trialEnd
      ) {

        subscription.status =
          "expired";

        await subscription.save();

      }


      const daysRemaining =
        subscription.trialEnd
          ? Math.max(
              0,
              Math.ceil(
                (
                  new Date(
                    subscription.trialEnd
                  ) -
                  new Date()
                ) /
                (
                  1000 *
                  60 *
                  60 *
                  24
                )
              )
            )
          : 0;


      res.json({

        plan:
          subscription.plan,

        status:
          subscription.status,

        price:
          subscription.price,

        currency:
          subscription.currency,

        billingCycle:
          subscription.billingCycle,

        trialEnd:
          subscription.trialEnd,

        daysRemaining,

        nextBillingDate:
          subscription.nextBillingDate,

        autoRenew:
          subscription.autoRenew,

        cancelAtPeriodEnd:
          subscription.cancelAtPeriodEnd

      });

    } catch (error) {

      console.error(
        "SUBSCRIPTION SUMMARY ERROR:",
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
// CHANGE PLAN
// =====================================================

router.put(
  "/plan",
  protect,
  async (req, res) => {

    try {

      const {
        plan,
        billingCycle = "monthly"
      } = req.body;


      // -------------------------------------------------
      // VALIDATE PLAN
      // -------------------------------------------------

      const allowedPlans = [
        "free",
        "starter",
        "professional"
      ];


      if (
        !allowedPlans.includes(
          plan
        )
      ) {

        return res.status(400).json({

          message:
            "Invalid subscription plan."

        });

      }


      // -------------------------------------------------
      // VALIDATE BILLING CYCLE
      // -------------------------------------------------

      if (
        ![
          "monthly",
          "yearly"
        ].includes(
          billingCycle
        )
      ) {

        return res.status(400).json({

          message:
            "Invalid billing cycle."

        });

      }


      // -------------------------------------------------
      // FIND SUBSCRIPTION
      // -------------------------------------------------

      let subscription =
        await Subscription.findOne({
          user: req.user.id
        });


      if (!subscription) {

        subscription =
          await createTrialSubscription(
            req.user.id
          );

      }


      // -------------------------------------------------
      // CALCULATE PRICE
      // -------------------------------------------------

      let price =
        PLAN_PRICES[plan];


      if (
        billingCycle === "yearly" &&
        plan !== "free"
      ) {

        // 2 months free
        price =
          price * 10;

      }


      // -------------------------------------------------
      // FREE PLAN
      // -------------------------------------------------

      if (
        plan === "free"
      ) {

        subscription.plan =
          "free";

        subscription.price =
          0;

        subscription.status =
          "active";

        subscription.billingCycle =
          "monthly";

        subscription.startDate =
          new Date();

        subscription.endDate =
          null;

        subscription.nextBillingDate =
          null;

        subscription.autoRenew =
          false;

        subscription.cancelAtPeriodEnd =
          false;

        subscription.cancelledAt =
          null;

        subscription.cancellationReason =
          "";

        subscription.paymentProvider =
          "none";

        subscription.providerCustomerId =
          null;

        subscription.providerSubscriptionId =
          null;

        subscription.providerPriceId =
          null;

        subscription.lastPaymentStatus =
          "none";


        await subscription.save();


        return res.json({

          message:
            "Free plan activated successfully.",

          subscription

        });

      }


      // -------------------------------------------------
      // PAID PLAN
      // -------------------------------------------------

      subscription.plan =
        plan;

      subscription.price =
        price;

      subscription.currency =
        "USD";

      subscription.billingCycle =
        billingCycle;

      subscription.status =
        "active";

      subscription.startDate =
        new Date();

      subscription.autoRenew =
        true;

      subscription.cancelAtPeriodEnd =
        false;

      subscription.cancelledAt =
        null;

      subscription.cancellationReason =
        "";

      subscription.lastPaymentStatus =
        "pending";


      // -------------------------------------------------
      // BILLING PERIOD
      // -------------------------------------------------

      const nextBilling =
        new Date();

      if (
        billingCycle === "yearly"
      ) {

        nextBilling.setFullYear(
          nextBilling.getFullYear() + 1
        );

      } else {

        nextBilling.setMonth(
          nextBilling.getMonth() + 1
        );

      }


      subscription.nextBillingDate =
        nextBilling;

      subscription.endDate =
        nextBilling;


      await subscription.save();


      res.json({

        message:
          "Subscription plan updated. Payment is required to activate billing.",

        subscription

      });

    } catch (error) {

      console.error(
        "CHANGE PLAN ERROR:",
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
// CANCEL SUBSCRIPTION
// =====================================================

router.put(
  "/cancel",
  protect,
  async (req, res) => {

    try {

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


      if (
        subscription.plan === "free"
      ) {

        return res.status(400).json({

          message:
            "The free plan cannot be cancelled."

        });

      }


      subscription.cancelAtPeriodEnd =
        true;

      subscription.autoRenew =
        false;

      subscription.cancelledAt =
        new Date();


      subscription.cancellationReason =
        req.body.reason || "";


      await subscription.save();


      res.json({

        message:
          "Subscription will be cancelled at the end of the current billing period.",

        subscription

      });

    } catch (error) {

      console.error(
        "CANCEL SUBSCRIPTION ERROR:",
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
// REACTIVATE SUBSCRIPTION
// =====================================================

router.put(
  "/reactivate",
  protect,
  async (req, res) => {

    try {

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


      if (
        subscription.plan === "free"
      ) {

        return res.status(400).json({

          message:
            "You are already using the free plan."

        });

      }


      subscription.cancelAtPeriodEnd =
        false;

      subscription.autoRenew =
        true;

      subscription.cancelledAt =
        null;

      subscription.cancellationReason =
        "";


      await subscription.save();


      res.json({

        message:
          "Subscription reactivated successfully.",

        subscription

      });

    } catch (error) {

      console.error(
        "REACTIVATE SUBSCRIPTION ERROR:",
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
// UPDATE BILLING INFORMATION
// =====================================================

router.put(
  "/billing-info",
  protect,
  async (req, res) => {

    try {

      const {
        billingName,
        billingEmail
      } = req.body;


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


      if (
        billingName !== undefined
      ) {

        subscription.billingName =
          billingName;

      }


      if (
        billingEmail !== undefined
      ) {

        subscription.billingEmail =
          billingEmail;

      }


      await subscription.save();


      res.json({

        message:
          "Billing information updated successfully.",

        subscription

      });

    } catch (error) {

      console.error(
        "BILLING INFO ERROR:",
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
// PAYMENT SUCCESS CALLBACK
// =====================================================
//
// This endpoint is intended to be called by the
// payment provider webhook after we integrate
// the actual payment system.
// =====================================================

router.post(
  "/payment-success",
  protect,
  async (req, res) => {

    try {

      const {
        paymentId,
        provider,
        providerCustomerId,
        providerSubscriptionId,
        providerPriceId
      } = req.body;


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


      subscription.status =
        "active";

      subscription.lastPaymentId =
        paymentId || null;

      subscription.lastPaymentDate =
        new Date();

      subscription.lastPaymentStatus =
        "paid";

      subscription.paymentFailureReason =
        "";

      subscription.paymentProvider =
        provider ||
        subscription.paymentProvider;

      subscription.providerCustomerId =
        providerCustomerId ||
        subscription.providerCustomerId;

      subscription.providerSubscriptionId =
        providerSubscriptionId ||
        subscription.providerSubscriptionId;

      subscription.providerPriceId =
        providerPriceId ||
        subscription.providerPriceId;


      await subscription.save();


      res.json({

        message:
          "Payment recorded successfully.",

        subscription

      });

    } catch (error) {

      console.error(
        "PAYMENT SUCCESS ERROR:",
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
// PAYMENT FAILED
// =====================================================

router.post(
  "/payment-failed",
  protect,
  async (req, res) => {

    try {

      const {
        paymentId,
        reason
      } = req.body;


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


      subscription.status =
        "past_due";

      subscription.lastPaymentId =
        paymentId || null;

      subscription.lastPaymentDate =
        new Date();

      subscription.lastPaymentStatus =
        "failed";

      subscription.paymentFailureReason =
        reason ||
        "Payment failed";


      await subscription.save();


      res.json({

        message:
          "Payment failure recorded.",

        subscription

      });

    } catch (error) {

      console.error(
        "PAYMENT FAILED ERROR:",
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

module.exports = router;