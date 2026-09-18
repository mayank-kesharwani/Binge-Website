import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

import authRoutes from "./routes/auth.routes.js";
import channelRoutes from "./routes/channel.routes.js";
import videoRoutes from "./routes/video.routes.js";
import commentRoutes from "./routes/comment.routes.js";
import likeRoutes from "./routes/like.routes.js";
import subscriptionRoutes from "./routes/subscription.routes.js";
import membershipRoutes from "./routes/membership.routes.js";
import userRoutes from "./routes/user.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import historyRoutes from "./routes/history.routes.js";
import downloadRoutes from "./routes/download.routes.js";
import watchPartyRoutes from "./routes/watchParty.routes.js";
import watchLaterRoutes from "./routes/watchLater.routes.js";

import notFound from "./middleware/notFound.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();

const FRONTEND_URL =
  process.env.FRONTEND_URL || "http://localhost:3000";

// Middlewares
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  }),
);

app.use(
  express.json({
    limit: "30mb",
  }),
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "30mb",
  }),
);

app.use(bodyParser.json());

// Health Check Route
app.get("/", (req, res) => {
  console.log("GET / route hit");
  res.send("Binge Server is Working 🚀");
});

// Authentication Routes
app.use("/api/auth", authRoutes);

// Channel Routes
app.use("/api/channels", channelRoutes);

// Video Routes
app.use("/api/videos", videoRoutes);

// Comment Routes
app.use("/api/comments", commentRoutes);

// Like Routes
app.use("/api/likes", likeRoutes);

// Channel Subscription Routes
app.use("/api/subscriptions", subscriptionRoutes);

// Membership Routes
app.use("/api/membership", membershipRoutes);

// User Routes
app.use("/api/users", userRoutes);

// Notification Routes
app.use("/api/notifications", notificationRoutes);

// History Routes
app.use("/api/history", historyRoutes);

// Download Routes
app.use("/api/downloads", downloadRoutes);

// Watch Party Routes
app.use("/api/watch-party", watchPartyRoutes);

// Watch Later Routes
app.use("/api/watch-later", watchLaterRoutes);

// 404 Middleware
app.use(notFound);

// Global Error Handler
app.use(errorHandler);

export default app;