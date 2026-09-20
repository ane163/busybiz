const Subscription = require("../models/Subscription");


// =====================================================
// REQUIRE SUBSCRIPTION PLAN
// =====================================================

const requirePlan = (allowedPlans) => {

  return async (req, res, next) => {

    try {

      // ============================================
      // FIND USER SUBSCRIPTION
      // ============================================

      const subscription =
        await Subscription.findOne({
          user: req.user.id
        });


      if (!subscription) {

        return res.status(403).json({

          message:
            "No active subscription found.",

          code:
            "NO_SUBSCRIPTION"

        });

      }


      // ============================================
      // CHECK TRIAL EXPIRATION
      // ============================================

      if (
        subscription.status === "trial" &&
        subscription.trialEnd
      ) {

        const now =
          new Date();

        const trialEnd =
          new Date(
            subscription.trialEnd
          );


        if (
          now >= trialEnd
        ) {

          subscription.status =
            "expired";

          subscription.autoRenew =
            false;

          await subscription.save();


          return res.status(403).json({

            message:
              "Your free trial has expired. Please choose a plan.",

            expired:
              true,

            status:
              "expired"

          });

        }

      }


      // ============================================
      // CHECK BILLING PERIOD EXPIRATION
      // ============================================

      if (
        subscription.status === "active" &&
        subscription.endDate &&
        new Date() >=
          new Date(subscription.endDate)
      ) {

        subscription.status =
          "expired";

        await subscription.save();


        return res.status(403).json({

          message:
            "Your subscription has expired. Please renew your plan.",

          expired:
            true,

          status:
            "expired"

        });

      }


      // ============================================
      // CHECK INACTIVE STATUSES
      // ============================================

      const inactiveStatuses = [

        "expired",

        "cancelled",

        "past_due"

      ];


      if (
        inactiveStatuses.includes(
          subscription.status
        )
      ) {

        let message =
          "Your subscription is not active.";


        if (
          subscription.status ===
          "past_due"
        ) {

          message =
            "Your latest payment failed. Please update your payment method to continue using this feature.";

        }


        if (
          subscription.status ===
          "cancelled"
        ) {

          message =
            "Your subscription has been cancelled. Please choose a plan to continue.";

        }


        return res.status(403).json({

          message,

          status:
            subscription.status

        });

      }


      // ============================================
      // CHECK PLAN ACCESS
      // ============================================

      if (
        !allowedPlans.includes(
          subscription.plan
        )
      ) {

        return res.status(403).json({

          message:
            "This feature is not available on your current plan.",

          currentPlan:
            subscription.plan,

          requiredPlans:
            allowedPlans

        });

      }


      // ============================================
      // STORE SUBSCRIPTION
      // ============================================

      req.subscription =
        subscription;


      // ============================================
      // CONTINUE
      // ============================================

      next();


    } catch (error) {

      console.error(
        "SUBSCRIPTION MIDDLEWARE ERROR:",
        error
      );


      return res.status(500).json({

        message:
          error.message

      });

    }

  };

};


module.exports =
  requirePlan;