import { io } from "socket.io-client";

export function createChatSocket(baseUrl, token) {
  return io(baseUrl, {
    auth: { token },
    transports: ["websocket", "polling"],
  });
}
