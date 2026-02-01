import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });
import https from "https";
import fs from "fs";
import http from "http";
import app from "./app.js";
import { connectDB } from "./config/db.js";

import { Server } from "socket.io";
import jwt from "jsonwebtoken";

const PORT = process.env.PORT || 4000;

/*const options = {
  key: fs.readFileSync("./src/https/key.pem"),
  cert: fs.readFileSync("./src/https/cert.pem"),
}; PRODUCCION   */

// Conexion db
await connectDB();

//const server = https.createServer(options, app);   PRODUCCION
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Socket.io authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Authentication error"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    socket.username = decoded.username;
    next();
  } catch (error) {
    next(new Error("Authentication error"));
  }
});

// Socket.io connection handler
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.username} (${socket.userId})`);

  // Join a club room
  socket.on("join_club", (clubId) => {
    socket.join(`club_${clubId}`);
    console.log(`${socket.username} joined club ${clubId}`);
  });

  // Leave a club room
  socket.on("leave_club", (clubId) => {
    socket.leave(`club_${clubId}`);
    console.log(`${socket.username} left club ${clubId}`);
  });

  // New message - broadcast to club room
  socket.on("new_message", (data) => {
    const { clubId, message } = data;
    io.to(`club_${clubId}`).emit("message_received", message);
  });

  // Message deleted - notify room
  socket.on("message_deleted", (data) => {
    const { clubId, messageId } = data;
    io.to(`club_${clubId}`).emit("message_deleted", { messageId });
  });

  // Message pinned/unpinned - notify room
  socket.on("message_pinned", (data) => {
    const { clubId, messageId, isPinned } = data;
    io.to(`club_${clubId}`).emit("message_pinned", { messageId, isPinned });
  });

  // Member joined - broadcast system message
  socket.on("member_joined", (data) => {
    const { clubId, systemMessage } = data;
    io.to(`club_${clubId}`).emit("system_message", systemMessage);
  });

  // Member left - broadcast system message
  socket.on("member_left", (data) => {
    const { clubId, systemMessage } = data;
    io.to(`club_${clubId}`).emit("system_message", systemMessage);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.username}`);
  });
});

server.listen(PORT, () => {
  console.log(`Servidor HTTPS corriendo en https://localhost:${PORT}`);
});
