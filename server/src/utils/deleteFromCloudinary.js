import cloudinary from "../config/cloudinary.js";

const deleteFromCloudinary = async (
  publicId,
  resourceType = "image"
) => {
  if (!publicId) return null;

  try {
    return await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
  } catch (error) {
    console.error(`Cloudinary Delete Error: ${error.message}`);
    return null;
  }
};

export default deleteFromCloudinary;