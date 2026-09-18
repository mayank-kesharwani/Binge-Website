import jwt from "jsonwebtoken";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";

const authMiddleware = async (req, res, next) => {
  try {
    let token;

    // Get token from Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // Token not found
    if (!token) {
      return next(
        new ApiError(401, "Access denied. Please login first.")
      );
    }

    // Verify JWT
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Find authenticated user
    const user = await User.findById(decoded.id).select(
      "-password -__v"
    );

    if (!user) {
      return next(
        new ApiError(401, "User not found")
      );
    }

    // Attach authenticated user to request
    req.user = user;

    next();
  } catch (error) {
    return next(
      new ApiError(401, "Invalid or expired token")
    );
  }
};

export default authMiddleware;