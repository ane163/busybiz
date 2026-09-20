const express = require("express");

const BusinessSettings =
  require("../models/BusinessSettings");

const protect =
  require("../middleware/authMiddleware");

const {
  businessAccess,
  requireRole,
} = require("../middleware/businessAccessMiddleware");

const router = express.Router();


// =====================================================
// GET SETTINGS
// =====================================================

router.get(
  "/",
  protect,
  businessAccess,
  async (req, res) => {
    try {
      let settings =
        await BusinessSettings.findOne({
          business: req.business._id,
        });

      // Create default settings automatically
      if (!settings) {
        settings =
          await BusinessSettings.create({
            business:
              req.business._id,
          });
      }

      res.status(200).json(settings);

    } catch (error) {
      console.error(
        "GET SETTINGS ERROR:",
        error
      );

      res.status(500).json({
        message:
          error.message ||
          "Unable to load settings",
      });
    }
  }
);


// =====================================================
// UPDATE SETTINGS
// =====================================================

router.put(
  "/",
  protect,
  businessAccess,
  requireRole(
    "owner",
    "admin"
  ),

  async (req, res) => {
    try {
      const {
        currency,
        taxEnabled,
        taxRate,
        invoicePrefix,
        receiptPrefix,
        quotePrefix,

        lowStockNotifications,
        orderNotifications,
        invoiceNotifications,
        paymentNotifications,
        teamNotifications,
      } = req.body || {};


      let settings =
        await BusinessSettings.findOne({
          business:
            req.business._id,
        });


      if (!settings) {
        settings =
          new BusinessSettings({
            business:
              req.business._id,
          });
      }


      // ---------------------------------------------
      // CURRENCY
      // ---------------------------------------------

      if (
        currency !== undefined
      ) {
        settings.currency =
          currency
            .toString()
            .trim()
            .toUpperCase();
      }


      // ---------------------------------------------
      // TAX
      // ---------------------------------------------

      if (
        taxEnabled !== undefined
      ) {
        settings.taxEnabled =
          Boolean(taxEnabled);
      }


      if (
        taxRate !== undefined
      ) {
        const rate =
          Number(taxRate);

        if (
          !Number.isFinite(rate) ||
          rate < 0
        ) {
          return res.status(400).json({
            message:
              "Invalid tax rate",
          });
        }

        settings.taxRate =
          rate;
      }


      // ---------------------------------------------
      // DOCUMENT PREFIXES
      // ---------------------------------------------

      if (
        invoicePrefix !== undefined
      ) {
        settings.invoicePrefix =
          invoicePrefix
            .toString()
            .trim();
      }


      if (
        receiptPrefix !== undefined
      ) {
        settings.receiptPrefix =
          receiptPrefix
            .toString()
            .trim();
      }


      if (
        quotePrefix !== undefined
      ) {
        settings.quotePrefix =
          quotePrefix
            .toString()
            .trim();
      }


      // ---------------------------------------------
      // NOTIFICATIONS
      // ---------------------------------------------

      if (
        lowStockNotifications !== undefined
      ) {
        settings.lowStockNotifications =
          Boolean(
            lowStockNotifications
          );
      }


      if (
        orderNotifications !== undefined
      ) {
        settings.orderNotifications =
          Boolean(
            orderNotifications
          );
      }


      if (
        invoiceNotifications !== undefined
      ) {
        settings.invoiceNotifications =
          Boolean(
            invoiceNotifications
          );
      }


      if (
        paymentNotifications !== undefined
      ) {
        settings.paymentNotifications =
          Boolean(
            paymentNotifications
          );
      }


      if (
        teamNotifications !== undefined
      ) {
        settings.teamNotifications =
          Boolean(
            teamNotifications
          );
      }


      await settings.save();


      res.status(200).json({
        message:
          "Settings updated successfully",

        settings,
      });

    } catch (error) {
      console.error(
        "UPDATE SETTINGS ERROR:",
        error
      );

      res.status(500).json({
        message:
          error.message ||
          "Unable to update settings",
      });
    }
  }
);


module.exports = router;