import express from "express";

import {
  addToHistory,
  getHistory,
  removeFromHistory,
  clearHistory,
  getHistorySettings,
  setHistoryPaused,
} from "../controllers/history.controller.js";

import verifyJWT from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(verifyJWT);

// History settings
router.get(
  "/settings",
  getHistorySettings,
);

router.patch(
  "/settings",
  setHistoryPaused,
);

// History
router.get("/", getHistory);

router.post("/:videoId", addToHistory);

router.delete("/:videoId", removeFromHistory);

router.delete("/", clearHistory);

export default router;