const { asyncHandler } = require("../common/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const Message = require("../models/message.model");
const User = require("../models/user.model");
const {
  buildConversationQuery,
  isFriend,
  normalizeMessageText,
} = require("../services/chatService");

async function getAuthorizedFriend(userId, friendId) {
  if (!friendId) {
    throw new ApiError(400, "Friend id missing");
  }

  if (userId.toString() === friendId.toString()) {
    throw new ApiError(400, "You cannot chat with yourself");
  }

  const [user, friend] = await Promise.all([
    User.findById(userId).select("friendList"),
    User.findById(friendId).select("-password"),
  ]);

  if (!user || !friend) {
    throw new ApiError(404, "User or friend not found");
  }

  if (!isFriend(user, friendId)) {
    throw new ApiError(403, "You can only chat with friends");
  }

  return friend;
}

exports.handleGetChatFriends = asyncHandler(async (req, res) => {
  const { id } = req.user;

  const user = await User.findById(id).select("friendList");
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const friends = await User.find({ _id: { $in: user.friendList } })
    .select("-password")
    .sort({ userName: 1 });

  return res
    .status(200)
    .json(new ApiResponse(200, friends, "Chat friends fetched"));
});

exports.handleGetMessages = asyncHandler(async (req, res) => {
  const { id } = req.user;
  const { friendId } = req.params;

  await getAuthorizedFriend(id, friendId);

  const messages = await Message.find(buildConversationQuery(id, friendId))
    .sort({ createdAt: 1 })
    .limit(200);

  await Message.updateMany(
    { sender: friendId, receiver: id, readAt: null },
    { $set: { readAt: new Date() } }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, messages, "Messages fetched"));
});

exports.handleSendMessage = asyncHandler(async (req, res) => {
  const { id } = req.user;
  const { friendId } = req.params;

  await getAuthorizedFriend(id, friendId);

  let message;
  try {
    message = normalizeMessageText(req.body.message);
  } catch (error) {
    throw new ApiError(400, error.message);
  }

  const createdMessage = await Message.create({
    sender: id,
    receiver: friendId,
    message,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, createdMessage, "Message sent"));
});
