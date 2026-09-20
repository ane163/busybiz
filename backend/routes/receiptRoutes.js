const express = require("express");

const Receipt = require("../models/Receipt");
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
// GET ALL RECEIPTS
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

      const receipts =
        await Receipt.find({
          business:
            req.business._id
        })
          .populate("customer")
          .populate("order")
          .sort({
            createdAt: -1
          });


      res.json(receipts);


    } catch (error) {

      console.error(
        "GET RECEIPTS ERROR:",
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
// CREATE RECEIPT FROM ORDER
// =====================================================

router.post(
  "/from-order/:orderId",
  protect,
  businessAccess,
  requirePlan([
    "starter",
    "professional"
  ]),
  async (req, res) => {

    try {

      const business =
        req.business;


      // ============================================
      // FIND ORDER
      // ============================================

      const order =
        await Order.findOne({

          _id:
            req.params.orderId,

          business:
            business._id

        })
          .populate(
            "customer"
          );


      if (!order) {

        return res.status(404).json({
          message:
            "Order not found"
        });

      }


      // ============================================
      // CHECK EXISTING RECEIPT
      // ============================================

      const existingReceipt =
        await Receipt.findOne({
          order:
            order._id
        });


      if (existingReceipt) {

        return res.status(400).json({

          message:
            "Receipt already exists for this order",

          receipt:
            existingReceipt

        });

      }


      // ============================================
      // CREATE RECEIPT
      // ============================================

      const receipt =
        await Receipt.create({

          business:
            business._id,

          order:
            order._id,

          customer:
            order.customer
              ? order.customer._id
              : null,

          items:
            order.items,

          total:
            order.total,

          paymentMethod:
            order.paymentMethod

        });


      res.status(201).json({

        message:
          "Receipt created successfully",

        receipt

      });


    } catch (error) {

      console.error(
        "CREATE RECEIPT ERROR:",
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
// GET ONE RECEIPT
// =====================================================

router.get(
  "/:id",
  protect,
  businessAccess,
  requirePlan([
    "starter",
    "professional"
  ]),
  async (req, res) => {

    try {

      const receipt =
        await Receipt.findOne({

          _id:
            req.params.id,

          business:
            req.business._id

        })
          .populate("customer")
          .populate("order");


      if (!receipt) {

        return res.status(404).json({
          message:
            "Receipt not found"
        });

      }


      res.json(receipt);


    } catch (error) {

      console.error(
        "GET RECEIPT ERROR:",
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