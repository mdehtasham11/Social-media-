const assert = require("node:assert/strict");
const test = require("node:test");

const {
  buildConversationQuery,
  isFriend,
  normalizeMessageText,
} = require("../src/services/chatService");
const {
  buildSendAcknowledgement,
  buildMessageEvent,
  getUserRoom,
} = require("../src/services/socketChatService");

test("normalizeMessageText trims valid chat messages", () => {
  assert.equal(normalizeMessageText("  hello friend  "), "hello friend");
});

test("normalizeMessageText rejects empty chat messages", () => {
  assert.throws(() => normalizeMessageText("   "), /Message cannot be empty/);
});

test("normalizeMessageText rejects messages longer than 1000 characters", () => {
  assert.throws(() => normalizeMessageText("a".repeat(1001)), /1000 characters/);
});

test("isFriend matches object ids by string value", () => {
  const user = {
    friendList: [{ toString: () => "friend-1" }, "friend-2"],
  };

  assert.equal(isFriend(user, "friend-1"), true);
  assert.equal(isFriend(user, "friend-2"), true);
  assert.equal(isFriend(user, "stranger"), false);
});

test("buildConversationQuery only returns messages between two users", () => {
  assert.deepEqual(buildConversationQuery("user-1", "user-2"), {
    $or: [
      { sender: "user-1", receiver: "user-2" },
      { sender: "user-2", receiver: "user-1" },
    ],
  });
});

test("getUserRoom builds a private socket room for a user", () => {
  assert.equal(getUserRoom("user-1"), "user:user-1");
});

test("buildMessageEvent marks whether a delivered message belongs to the receiver", () => {
  const message = {
    _id: "message-1",
    sender: { toString: () => "user-1" },
    receiver: { toString: () => "user-2" },
    message: "hello",
    createdAt: new Date("2026-07-14T10:00:00.000Z"),
  };

  assert.deepEqual(buildMessageEvent(message, "user-2"), {
    _id: "message-1",
    sender: "user-1",
    receiver: "user-2",
    message: "hello",
    createdAt: "2026-07-14T10:00:00.000Z",
    mine: false,
  });
});

test("buildSendAcknowledgement returns the saved message to the sender", () => {
  const message = {
    _id: "message-2",
    sender: { toString: () => "user-1" },
    receiver: { toString: () => "user-2" },
    message: "instant hello",
    createdAt: new Date("2026-07-14T10:05:00.000Z"),
  };

  assert.deepEqual(buildSendAcknowledgement(message, "user-1"), {
    success: true,
    message: {
      _id: "message-2",
      sender: "user-1",
      receiver: "user-2",
      message: "instant hello",
      createdAt: "2026-07-14T10:05:00.000Z",
      mine: true,
    },
  });
});
