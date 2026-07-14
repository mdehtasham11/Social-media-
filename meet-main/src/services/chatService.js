const MAX_MESSAGE_LENGTH = 1000;

function normalizeMessageText(value) {
  if (typeof value !== "string") {
    throw new Error("Message must be text");
  }

  const message = value.trim();

  if (!message) {
    throw new Error("Message cannot be empty");
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    throw new Error(`Message cannot exceed ${MAX_MESSAGE_LENGTH} characters`);
  }

  return message;
}

function isFriend(user, friendId) {
  if (!user || !Array.isArray(user.friendList)) {
    return false;
  }

  return user.friendList.some((id) => id.toString() === friendId.toString());
}

function buildConversationQuery(userId, friendId) {
  return {
    $or: [
      { sender: userId, receiver: friendId },
      { sender: friendId, receiver: userId },
    ],
  };
}

module.exports = {
  buildConversationQuery,
  isFriend,
  normalizeMessageText,
};
