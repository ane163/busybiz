const express = require("express");

const protect =
  require("../middleware/authMiddleware");

const requirePlan =
  require("../middleware/subscriptionMiddleware");

const {
  businessAccess
} = require(
  "../middleware/businessAccessMiddleware"
);

const {
  createCommerceOrder,
  getBusinessOrders,
  getBusinessOrder,
  deleteBusinessOrder
} = require(
  "../services/commerceService"
);

const router =
  express.Router();


// =====================================================
// GET ALL ORDERS
// =====================================================

router.get(
  "/",
  protect,
  businessAccess,
  async (req, res) => {

    try {

      const orders =
        await getBusinessOrders({

          business:
            req.business

        });


      res.status(200).json(
        orders
      );

    } catch (error) {

      console.error(
        "GET ORDERS ERROR:",
        error
      );

      res.status(500).json({

        message:
          error.message ||
          "Unable to load orders"

      });

    }

  }
);


// =====================================================
// GET ONE ORDER
// =====================================================

router.get(
  "/:id",
  protect,
  businessAccess,
  async (req, res) => {

    try {

      const order =
        await getBusinessOrder({

          business:
            req.business,

          orderId:
            req.params.id

        });


      res.status(200).json(
        order
      );

    } catch (error) {

      console.error(
        "GET ORDER ERROR:",
        error
      );


      const status =
        error.message ===
        "Order not found"
          ? 404
          : error.message ===
            "Invalid order ID"
            ? 400
            : 500;


      res.status(status).json({

        message:
          error.message ||
          "Unable to load order"

      });

    }

  }
);


// =====================================================
// CREATE ORDER
// =====================================================

router.post(
  "/",
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
        await createCommerceOrder({

          business:
            req.business,

          subscription:
            req.subscription,

          user:
            req.user,

          customer:
            req.body.customer ||
            null,

          items:
            req.body.items,

          paymentMethod:
            req.body.paymentMethod ||
            "cash"

        });


      res.status(201).json({

        message:
          "Order created successfully",

        order:
          result.order,

        lowStockProducts:
          result.lowStockProducts

      });

    } catch (error) {

      console.error(
        "CREATE ORDER ERROR:",
        error
      );


      let status = 500;


      if (
        error.message.includes(
          "plan limit reached"
        )
      ) {

        status = 403;

      } else if (

        error.message.includes(
          "required"
        ) ||

        error.message.includes(
          "Invalid"
        ) ||

        error.message.includes(
          "Not enough stock"
        ) ||

        error.message.includes(
          "blocked"
        )

      ) {

        status = 400;

      } else if (

        error.message.includes(
          "not found"
        )

      ) {

        status = 404;

      }


      res.status(status).json({

        message:
          error.message ||
          "Unable to create order"

      });

    }

  }
);


// =====================================================
// DELETE ORDER
// =====================================================

router.delete(
  "/:id",
  protect,
  businessAccess,
  async (req, res) => {

    try {

      await deleteBusinessOrder({

        business:
          req.business,

        orderId:
          req.params.id

      });


      res.status(200).json({

        message:
          "Order deleted successfully"

      });

    } catch (error) {

      console.error(
        "DELETE ORDER ERROR:",
        error
      );


      const status =
        error.message ===
        "Order not found"
          ? 404
          : error.message ===
            "Invalid order ID"
            ? 400
            : 500;


      res.status(status).json({

        message:
          error.message ||
          "Unable to delete order"

      });

    }

  }
);


module.exports = router;