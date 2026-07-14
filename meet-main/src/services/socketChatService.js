function getUserRoom(userId) {
  return `user:${userId.toString()}`;
}

function buildMessageEvent(message, currentUserId) {
  const sender = message.sender.toString();
  const receiver = message.receiver.toString();
  const createdAt =
    message.createdAt instanceof Date
      ? message.createdAt.toISOString()
      : message.createdAt;

  return {
    _id: message._id.toString(),
    sender,
    receiver,
    message: message.message,
    createdAt,
    mine: sender === currentUserId.toString(),
  };
}

module.exports = {
  buildMessageEvent,
  getUserRoom,
};
