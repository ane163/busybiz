const express = require("express");

const Chat = require("../models/Chat");

const protect = require("../middleware/authMiddleware");

const router = express.Router();


// =====================================================
// HELPERS
// =====================================================

const getUserId = (req) => {
  return (
    req.user?._id ||
    req.user?.id ||
    req.user?.userId ||
    null
  );
};


// =====================================================
// CREATE OR GET CHAT
// =====================================================
// Used when a user clicks "Contact Seller"
//
// POST /api/chats
//
// body:
// {
//   "sellerId": "...",
//   "listingId": "..."
// }
// =====================================================

router.post(
  "/",
  protect,
  async (req, res) => {

    try {

      const userId = getUserId(req);

      const {
        sellerId,
        listingId
      } = req.body;


      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "User authentication required."
        });
      }


      if (!sellerId) {
        return res.status(400).json({
          success: false,
          message: "Seller ID is required."
        });
      }


      if (!listingId) {
        return res.status(400).json({
          success: false,
          message: "Marketplace listing ID is required."
        });
      }


      if (
        userId.toString() ===
        sellerId.toString()
      ) {
        return res.status(400).json({
          success: false,
          message: "You cannot start a chat with yourself."
        });
      }


      // -------------------------------------------------
      // CHECK IF CHAT ALREADY EXISTS
      // -------------------------------------------------

      let chat = await Chat.findOne({
        listing: listingId,
        participants: {
          $all: [
            userId,
            sellerId
          ]
        }
      });


      // -------------------------------------------------
      // CREATE CHAT
      // -------------------------------------------------

      if (!chat) {

        chat = await Chat.create({

          listing:
            listingId,

          participants: [
            userId,
            sellerId
          ],

          messages: []

        });

      }


      // -------------------------------------------------
      // RETURN CHAT
      // -------------------------------------------------

      const populatedChat =
        await Chat.findById(chat._id)
          .populate(
            "participants",
            "name fullName email profilePicture"
          )
          .populate(
            "listing",
            "name title price images"
          );


      res.status(200).json({

        success: true,

        message:
          "Chat opened successfully.",

        chat:
          populatedChat

      });

    } catch (error) {

      console.error(
        "CREATE CHAT ERROR:",
        error
      );

      res.status(500).json({

        success: false,

        message:
          error.message ||
          "Unable to create chat."

      });

    }

  }
);


// =====================================================
// GET MY CHATS
// =====================================================
//
// GET /api/chats
//
// Returns all conversations belonging to
// the logged-in user.
// =====================================================

router.get(
  "/",
  protect,
  async (req, res) => {

    try {

      const userId = getUserId(req);


      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "User authentication required."
        });
      }


      const chats =
        await Chat.find({
          participants: userId
        })
          .populate(
            "participants",
            "name fullName email profilePicture"
          )
          .populate(
            "listing",
            "name title price images"
          )
          .sort({
            updatedAt: -1
          });


      res.json({

        success: true,

        count:
          chats.length,

        chats

      });

    } catch (error) {

      console.error(
        "GET CHATS ERROR:",
        error
      );

      res.status(500).json({

        success: false,

        message:
          error.message ||
          "Unable to load chats."

      });

    }

  }
);


// =====================================================
// GET SINGLE CHAT
// =====================================================
//
// GET /api/chats/:chatId
//
// Returns the complete conversation.
// =====================================================

router.get(
  "/:chatId",
  protect,
  async (req, res) => {

    try {

      const userId = getUserId(req);

      const {
        chatId
      } = req.params;


      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "User authentication required."
        });
      }


      const chat =
        await Chat.findOne({

          _id:
            chatId,

          participants:
            userId

        })
          .populate(
            "participants",
            "name fullName email profilePicture"
          )
          .populate(
            "listing",
            "name title price images description"
          );


      if (!chat) {

        return res.status(404).json({

          success: false,

          message:
            "Chat not found or you do not have access to it."

        });

      }


      res.json({

        success: true,

        chat

      });

    } catch (error) {

      console.error(
        "GET CHAT ERROR:",
        error
      );

      res.status(500).json({

        success: false,

        message:
          error.message ||
          "Unable to load chat."

      });

    }

  }
);


// =====================================================
// SEND MESSAGE
// =====================================================
//
// POST /api/chats/:chatId/messages
//
// body:
// {
//   "message": "Is this product still available?"
// }
// =====================================================

router.post(
  "/:chatId/messages",
  protect,
  async (req, res) => {

    try {

      const userId = getUserId(req);

      const {
        chatId
      } = req.params;

      const {
        message
      } = req.body;


      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "User authentication required."
        });
      }


      if (
        !message ||
        !message.trim()
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Message cannot be empty."

        });

      }


      const chat =
        await Chat.findOne({

          _id:
            chatId,

          participants:
            userId

        });


      if (!chat) {

        return res.status(404).json({

          success: false,

          message:
            "Chat not found or you do not have access to it."

        });

      }


      // -------------------------------------------------
      // ADD MESSAGE
      // -------------------------------------------------

      chat.messages.push({

        sender:
          userId,

        text:
          message.trim(),

        createdAt:
          new Date()

      });


      await chat.save();


      // -------------------------------------------------
      // RETURN UPDATED CHAT
      // -------------------------------------------------

      const updatedChat =
        await Chat.findById(chat._id)
          .populate(
            "participants",
            "name fullName email profilePicture"
          )
          .populate(
            "listing",
            "name title price images"
          );


      res.status(201).json({

        success: true,

        message:
          "Message sent successfully.",

        chat:
          updatedChat

      });

    } catch (error) {

      console.error(
        "SEND MESSAGE ERROR:",
        error
      );

      res.status(500).json({

        success: false,

        message:
          error.message ||
          "Unable to send message."

      });

    }

  }
);


// =====================================================
// MARK CHAT AS READ
// =====================================================
//
// PATCH /api/chats/:chatId/read
// =====================================================

router.patch(
  "/:chatId/read",
  protect,
  async (req, res) => {

    try {

      const userId = getUserId(req);

      const {
        chatId
      } = req.params;


      const chat =
        await Chat.findOne({

          _id:
            chatId,

          participants:
            userId

        });


      if (!chat) {

        return res.status(404).json({

          success: false,

          message:
            "Chat not found."

        });

      }


      chat.messages.forEach(
        (message) => {

          if (
            message.sender.toString() !==
            userId.toString()
          ) {

            message.read = true;

          }

        }
      );


      await chat.save();


      res.json({

        success: true,

        message:
          "Chat marked as read."

      });

    } catch (error) {

      console.error(
        "MARK CHAT READ ERROR:",
        error
      );

      res.status(500).json({

        success: false,

        message:
          error.message ||
          "Unable to mark chat as read."

      });

    }

  }
);


// =====================================================
// DELETE CHAT
// =====================================================
//
// DELETE /api/chats/:chatId
// =====================================================

router.delete(
  "/:chatId",
  protect,
  async (req, res) => {

    try {

      const userId = getUserId(req);

      const {
        chatId
      } = req.params;


      const chat =
        await Chat.findOne({

          _id:
            chatId,

          participants:
            userId

        });


      if (!chat) {

        return res.status(404).json({

          success: false,

          message:
            "Chat not found."

        });

      }


      await Chat.findByIdAndDelete(
        chatId
      );


      res.json({

        success: true,

        message:
          "Chat deleted successfully."

      });

    } catch (error) {

      console.error(
        "DELETE CHAT ERROR:",
        error
      );

      res.status(500).json({

        success: false,

        message:
          error.message ||
          "Unable to delete chat."

      });

    }

  }
);


module.exports = router;