import express from "express";

import authMiddleware from "../middleware/auth.middleware.js";

import {
  createWatchParty,
  joinWatchParty,
  getWatchParty,
  endWatchParty,
} from "../controllers/watchParty.controller.js";

const router = express.Router();

router.post("/", authMiddleware, createWatchParty);

router.post(
  "/join/:partyCode",
  authMiddleware,
  joinWatchParty,
);

router.get(
  "/:partyCode",
  authMiddleware,
  getWatchParty,
);

router.delete(
  "/:partyCode",
  authMiddleware,
  endWatchParty,
);

export default router;