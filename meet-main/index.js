const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
require("dotenv").config();
const dns = require("dns");
const path = require("path");

dns.setServers(["1.1.1.1","8.8.8.8"]);

const port = process.env.PORT || 8002;

const handleDatabaseConnection = require("./src/config");
const authRoute = require("./src/routes/auth.routes");
const userRoute = require("./src/routes/user.routes");
const analyzeRoutes = require("./routes/analyze.routes");
const adminRoutes = require("./src/routes/admin.routes");
const commentsRoutes = require("./routes/comments.routes");
const chatRoutes = require("./src/routes/chat.routes");
const initializeChatSocket = require("./src/socket/chatSocket");

app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

handleDatabaseConnection(process.env.MONGO_URI)
  .then(() => {
    console.log(`meet connected to database`);
  })
  .catch((err) => {
    console.log("failed to connect to database", err);
  });

app.use("/api/auth", authRoute);
app.use("/api/user", userRoute);
app.use("/api/chat", chatRoutes);
app.use("/api", analyzeRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/comments", commentsRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global error handler:", err);
  const statusCode = err.statusCode || err.code || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    statusCode,
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Something went wrong",
  });
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

const server = http.createServer(app);
initializeChatSocket(server);

server.listen(port, () => {
  console.log(`meet started on port ${port}`);
});
