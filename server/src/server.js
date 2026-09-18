import "dotenv/config";

import mongoose from "mongoose";
import { createServer } from "http";
import { Server } from "socket.io";

import app from "./app.js";
import watchPartySocket from "./socket/watchParty.socket.js";

const PORT = process.env.PORT || 8000;
const DB_URL = process.env.DB_URL;
const FRONTEND_URL =
  process.env.FRONTEND_URL || "http://localhost:3000";

const startServer = async () => {
  try {
    await mongoose.connect(DB_URL);

    console.log("✅ MongoDB Connected");

    const httpServer = createServer(app);

    const io = new Server(httpServer, {
      cors: {
        origin: FRONTEND_URL,
        credentials: true,
      },
    });

    watchPartySocket(io);

    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log("🔴 Watch Party Socket.IO enabled");
    });
  } catch (error) {
    console.error("❌ Database Connection Failed");
    console.error(error.message);
    process.exit(1);
  }
};

startServer();