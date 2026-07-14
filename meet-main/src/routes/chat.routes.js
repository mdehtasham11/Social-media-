const express = require("express");
const {
  handleGetChatFriends,
  handleGetMessages,
  handleSendMessage,
} = require("../controller/chat.controller");
const { user } = require("../middlewares/protectedRoutes");

const router = express.Router();

router.route("/friends").get(user, handleGetChatFriends);
router.route("/:friendId/messages").get(user, handleGetMessages);
router.route("/:friendId/messages").post(user, handleSendMessage);

router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    statusCode: err.statusCode || 500,
  });
});

module.exports = router;
