import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";
import optionalAuth from "../middleware/optionalAuth.middleware.js";

import {
  uploadVideo,
  getAllVideos,
  getVideoById,
  getVideoForEdit,
  updateVideo,
  deleteVideo,
  searchVideos,
  getVideosByChannel,
  getMyVideos,
} from "../controllers/video.controller.js";

const router = express.Router();

// ---------- Public Routes ----------
router.get("/", getAllVideos);

router.get("/search", searchVideos);

router.get(
  "/channel/:handle",
  getVideosByChannel
);


// ---------- Protected Routes ----------
router.get(
  "/me",
  authMiddleware,
  getMyVideos
);

router.get(
  "/edit/:id",
  authMiddleware,
  getVideoForEdit
);

router.post(
  "/",
  authMiddleware,
  upload.fields([
    {
      name: "video",
      maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  uploadVideo
);

router.put(
  "/:id",
  authMiddleware,
  upload.fields([
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  updateVideo
);

router.delete(
  "/:id",
  authMiddleware,
  deleteVideo
);

router.get("/:id", optionalAuth, getVideoById);

export default router;