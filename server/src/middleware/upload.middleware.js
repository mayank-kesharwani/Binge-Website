import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,

  params: async (req, file) => {
    let folder = "binge";

    switch (file.fieldname) {
      case "video":
        folder = "binge/videos";
        break;

      case "thumbnail":
        folder = "binge/thumbnails";
        break;

      case "avatar":
        folder = "binge/avatars";
        break;

      case "banner":
        folder = "binge/banners";
        break;

      default:
        folder = "binge/others";
    }

    const isVideo = file.mimetype.startsWith("video");

    return {
      folder,
      resource_type: isVideo ? "video" : "image",
      allowed_formats: isVideo
        ? ["mp4", "mov", "avi", "mkv", "webm"]
        : ["jpg", "jpeg", "png", "webp"],
    };
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500 MB
  },
});

export default upload;