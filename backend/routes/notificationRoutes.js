const express = require("express");

const Notification =
  require("../models/Notification");

const protect =
  require("../middleware/authMiddleware");

const {
  businessAccess,
} = require("../middleware/businessAccessMiddleware");

const router = express.Router();


// =====================================================
// GET NOTIFICATIONS
// =====================================================

router.get(
  "/",
  protect,
  businessAccess,
  async (req, res) => {
    try {
      const notifications =
        await Notification.find({
          business: req.business._id,

          $or: [
            {
              user: null,
            },
            {
              user: req.user._id,
            },
          ],
        })
          .sort({
            createdAt: -1,
          })
          .limit(50);

      res.status(200).json(
        notifications
      );

    } catch (error) {
      console.error(
        "GET NOTIFICATIONS ERROR:",
        error
      );

      res.status(500).json({
        message:
          error.message ||
          "Unable to load notifications",
      });
    }
  }
);


// =====================================================
// UNREAD COUNT
// =====================================================

router.get(
  "/unread-count",
  protect,
  businessAccess,
  async (req, res) => {
    try {
      const count =
        await Notification.countDocuments({
          business:
            req.business._id,

          read: false,

          $or: [
            {
              user: null,
            },
            {
              user: req.user._id,
            },
          ],
        });

      res.status(200).json({
        count,
      });

    } catch (error) {
      console.error(
        "UNREAD COUNT ERROR:",
        error
      );

      res.status(500).json({
        message:
          error.message ||
          "Unable to get notification count",
      });
    }
  }
);


// =====================================================
// MARK ONE AS READ
// =====================================================

router.put(
  "/:id/read",
  protect,
  businessAccess,
  async (req, res) => {
    try {
      const notification =
        await Notification.findOneAndUpdate(
          {
            _id: req.params.id,

            business:
              req.business._id,

            $or: [
              {
                user: null,
              },
              {
                user: req.user._id,
              },
            ],
          },

          {
            read: true,
          },

          {
            new: true,
          }
        );

      if (!notification) {
        return res.status(404).json({
          message:
            "Notification not found",
        });
      }

      res.status(200).json({
        message:
          "Notification marked as read",

        notification,
      });

    } catch (error) {
      console.error(
        "MARK NOTIFICATION ERROR:",
        error
      );

      res.status(500).json({
        message:
          error.message ||
          "Unable to update notification",
      });
    }
  }
);


// =====================================================
// MARK ALL AS READ
// =====================================================

router.put(
  "/read-all",
  protect,
  businessAccess,
  async (req, res) => {
    try {
      await Notification.updateMany(
        {
          business:
            req.business._id,

          read: false,

          $or: [
            {
              user: null,
            },
            {
              user: req.user._id,
            },
          ],
        },

        {
          read: true,
        }
      );

      res.status(200).json({
        message:
          "All notifications marked as read",
      });

    } catch (error) {
      console.error(
        "MARK ALL NOTIFICATIONS ERROR:",
        error
      );

      res.status(500).json({
        message:
          error.message ||
          "Unable to update notifications",
      });
    }
  }
);


// =====================================================
// DELETE NOTIFICATION
// =====================================================

router.delete(
  "/:id",
  protect,
  businessAccess,
  async (req, res) => {
    try {
      const notification =
        await Notification.findOneAndDelete({
          _id: req.params.id,

          business:
            req.business._id,

          $or: [
            {
              user: null,
            },
            {
              user: req.user._id,
            },
          ],
        });

      if (!notification) {
        return res.status(404).json({
          message:
            "Notification not found",
        });
      }

      res.status(200).json({
        message:
          "Notification deleted successfully",
      });

    } catch (error) {
      console.error(
        "DELETE NOTIFICATION ERROR:",
        error
      );

      res.status(500).json({
        message:
          error.message ||
          "Unable to delete notification",
      });
    }
  }
);


module.exports = router;