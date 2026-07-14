const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");
const Message = require("../models/message.model");
const User = require("../models/user.model");
const { isFriend, normalizeMessageText } = require("../services/chatService");
const {
  buildSendAcknowledgement,
  buildMessageEvent,
  getUserRoom,
} = require("../services/socketChatService");

function getHandshakeToken(socket) {
  const authToken = socket.handshake.auth?.token;
  if (authToken) return authToken;

  const header = socket.handshake.headers?.authorization || "";
  if (header.startsWith("Bearer ")) {
    return header.split(" ")[1];
  }

  return "";
}

function initializeChatSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = getHandshakeToken(socket);
      if (!token) {
        return next(new Error("Authentication required"));
      }

      const data = jwt.verify(token, process.env.JWT_SECRET);
      if (data.role !== "user" && data.role !== "admin") {
        return next(new Error("Unauthorized"));
      }

      const user = await User.findById(data.id).select("-password");
      if (!user) {
        return next(new Error("User not found"));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user._id.toString();
    socket.join(getUserRoom(userId));

    socket.on("chat:send", async (payload = {}, acknowledge) => {
      try {
        const receiverId = payload.receiverId || payload.friendId;
        if (!receiverId) {
          throw new Error("Receiver id missing");
        }

        if (receiverId.toString() === userId) {
          throw new Error("You cannot chat with yourself");
        }

        const [sender, receiver] = await Promise.all([
          User.findById(userId).select("friendList"),
          User.findById(receiverId).select("_id"),
        ]);

        if (!sender || !receiver) {
          throw new Error("User or friend not found");
        }

        if (!isFriend(sender, receiverId)) {
          throw new Error("You can only chat with friends");
        }

        const message = normalizeMessageText(payload.message);
        const createdMessage = await Message.create({
          sender: userId,
          receiver: receiverId,
          message,
        });

        io.to(getUserRoom(userId)).emit(
          "chat:message",
          buildMessageEvent(createdMessage, userId)
        );
        io.to(getUserRoom(receiverId)).emit(
          "chat:message",
          buildMessageEvent(createdMessage, receiverId)
        );

        if (typeof acknowledge === "function") {
          acknowledge(buildSendAcknowledgement(createdMessage, userId));
        }
      } catch (error) {
        const response = {
          success: false,
          message: error.message || "Could not send message",
        };

        if (typeof acknowledge === "function") {
          acknowledge(response);
        } else {
          socket.emit("chat:error", response);
        }
      }
    });
  });

  return io;
}

module.exports = initializeChatSocket;
