const express = require("express");

const Expense = require("../models/Expense");

const protect = require("../middleware/authMiddleware");

const requirePlan = require(
  "../middleware/subscriptionMiddleware"
);

const {
  businessAccess,
  requireRole
} = require(
  "../middleware/businessAccessMiddleware"
);

const router = express.Router();


// =====================================================
// GET ALL EXPENSES
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

      const expenses =
        await Expense.find({
          business:
            req.business._id
        }).sort({
          date: -1
        });


      res.json(expenses);


    } catch (error) {

      console.error(
        "GET EXPENSES ERROR:",
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
// CREATE EXPENSE
// OWNER + ADMIN ONLY
// =====================================================

router.post(
  "/",
  protect,
  businessAccess,
  requireRole(
    "owner",
    "admin"
  ),
  requirePlan([
    "starter",
    "professional"
  ]),
  async (req, res) => {

    try {

      const {
        title,
        category,
        amount,
        date,
        description
      } = req.body;


      // ============================================
      // VALIDATION
      // ============================================

      if (
        !title ||
        !category ||
        amount === undefined
      ) {

        return res.status(400).json({
          message:
            "Title, category and amount are required"
        });

      }


      const expenseAmount =
        Number(amount);


      if (
        !Number.isFinite(
          expenseAmount
        ) ||
        expenseAmount < 0
      ) {

        return res.status(400).json({
          message:
            "Invalid expense amount"
        });

      }


      // ============================================
      // CREATE EXPENSE
      // ============================================

      const expense =
        await Expense.create({

          business:
            req.business._id,

          title:
            title.trim(),

          category:
            category.trim(),

          amount:
            expenseAmount,

          date:
            date || Date.now(),

          description:
            typeof description === "string"
              ? description.trim()
              : ""

        });


      res.status(201).json({

        message:
          "Expense created successfully",

        expense

      });


    } catch (error) {

      console.error(
        "CREATE EXPENSE ERROR:",
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
// GET ONE EXPENSE
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

      const expense =
        await Expense.findOne({

          _id:
            req.params.id,

          business:
            req.business._id

        });


      if (!expense) {

        return res.status(404).json({
          message:
            "Expense not found"
        });

      }


      res.json(expense);


    } catch (error) {

      console.error(
        "GET EXPENSE ERROR:",
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
// DELETE EXPENSE
// OWNER + ADMIN ONLY
// =====================================================

router.delete(
  "/:id",
  protect,
  businessAccess,
  requireRole(
    "owner",
    "admin"
  ),
  requirePlan([
    "starter",
    "professional"
  ]),
  async (req, res) => {

    try {

      const expense =
        await Expense.findOneAndDelete({

          _id:
            req.params.id,

          business:
            req.business._id

        });


      if (!expense) {

        return res.status(404).json({
          message:
            "Expense not found"
        });

      }


      res.json({

        message:
          "Expense deleted successfully"

      });


    } catch (error) {

      console.error(
        "DELETE EXPENSE ERROR:",
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