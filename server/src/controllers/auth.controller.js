import bcrypt from "bcryptjs";
import User from "../models/User.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import generateToken from "../utils/generateToken.js";
import asyncHandler from "../utils/asyncHandler.js";
import { UAParser } from "ua-parser-js";
import geoip from "geoip-lite";
import generateOtp from "../utils/generateOtp.js";
import { sendEmail } from "../utils/brevo.js";

const OTP_EXPIRY_MS = 10 * 60 * 1000;
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_OTP_RESENDS = 5;

const createSignupOtp = () => String(generateOtp()).padStart(6, "0");

const sendSignupOtpEmail = async (user, otp) => {
  await sendEmail({
    to: user.email,
    name: user.name,
    subject: "Verify your Binge email",
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px; color: #111827;">
        <h1 style="margin: 0 0 8px; color: #EF4444;">Binge</h1>

        <p style="font-size: 16px; margin: 0 0 24px;">
          Hi ${user.name},
        </p>

        <p style="font-size: 15px; line-height: 1.6;">
          Use the verification code below to verify your email address and complete your Binge account setup.
        </p>

        <div style="margin: 28px 0; padding: 18px; background: #f3f4f6; border-radius: 12px; text-align: center;">
          <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #EF4444;">
            ${otp}
          </span>
        </div>

        <p style="font-size: 14px; color: #6b7280;">
          This OTP expires in <strong>10 minutes</strong>.
        </p>

        <p style="font-size: 14px; color: #6b7280;">
          If you did not try to create a Binge account, you can safely ignore this email.
        </p>

        <p style="margin-top: 28px; font-size: 14px; color: #9ca3af;">
          — Team Binge
        </p>
      </div>
    `,
  });
};

export const signup = asyncHandler(async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return next(new ApiError(400, "All fields are required"));
    }

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedName) {
      return next(new ApiError(400, "Name is required"));
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return next(new ApiError(400, "Please provide a valid email"));
    }

    if (password.length < 6) {
      return next(
        new ApiError(400, "Password must be at least 6 characters"),
      );
    }

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      if (!existingUser.emailVerified) {
        return next(
          new ApiError(
            409,
            "An account with this email is awaiting email verification",
          ),
        );
      }

      return next(new ApiError(409, "User already exists"));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = createSignupOtp();
    const now = new Date();

    const user = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      password: hashedPassword,
      emailVerified: false,
      signupOtp: otp,
      signupOtpExpires: new Date(now.getTime() + OTP_EXPIRY_MS),
      signupOtpResendAt: new Date(
        now.getTime() + OTP_RESEND_COOLDOWN_MS,
      ),
      signupOtpResendCount: 0,
    });

    try {
      await sendSignupOtpEmail(user, otp);
    } catch (error) {
      await User.findByIdAndDelete(user._id);
      throw error;
    }

    return res.status(201).json(
      new ApiResponse(
        201,
        {
          otpRequired: true,
          email: user.email,
          expiresIn: OTP_EXPIRY_MS,
          resendCooldown: OTP_RESEND_COOLDOWN_MS,
          maxResends: MAX_OTP_RESENDS,
          resendsUsed: 0,
        },
        "Verification OTP sent to your email",
      ),
    );
  } catch (error) {
    next(error);
  }
});

export const verifySignupOtp = asyncHandler(async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return next(new ApiError(400, "Email and OTP are required"));
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedOtp = String(otp).trim();

    if (!/^\d{6}$/.test(normalizedOtp)) {
      return next(new ApiError(400, "OTP must be 6 digits"));
    }

    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+password");

    if (!user) {
      return next(new ApiError(404, "Verification request not found"));
    }

    /*
     * If verification succeeds and the frontend sends the request
     * again, treat it as already completed instead of returning an
     * error. This prevents duplicate verification requests from
     * producing confusing OTP errors.
     */
    if (user.emailVerified) {
      const indiaTime = new Date(
        new Date().toLocaleString("en-US", {
          timeZone: "Asia/Kolkata",
        }),
      );

      const hour = indiaTime.getHours();

      const defaultTheme =
        hour >= 10 && hour < 12 ? "light" : "dark";

      let appliedTheme = user.preferences.theme;

      if (appliedTheme === "system") {
        appliedTheme = defaultTheme;
      }

      const token = generateToken(user._id);

      const {
        password: _,
        __v,
        createdAt,
        updatedAt,
        signupOtp: __signupOtp,
        signupOtpExpires: __signupOtpExpires,
        signupOtpResendAt: __signupOtpResendAt,
        signupOtpResendCount: __signupOtpResendCount,
        ...verifiedUser
      } = user.toObject();

      verifiedUser.preferences.theme = appliedTheme;

      return res.status(200).json(
        new ApiResponse(
          200,
          {
            user: verifiedUser,
            token,
          },
          "Email verified successfully",
        ),
      );
    }

    if (!user.signupOtp || !user.signupOtpExpires) {
      return next(
        new ApiError(
          400,
          "OTP not found. Please request a new OTP",
        ),
      );
    }

    const now = Date.now();
    const expiryTime = user.signupOtpExpires.getTime();

    if (now >= expiryTime) {
      user.signupOtp = "";
      user.signupOtpExpires = null;
      user.signupOtpResendAt = null;

      await user.save({
        validateBeforeSave: false,
      });

      return next(
        new ApiError(
          400,
          "OTP has expired. Please request a new OTP",
        ),
      );
    }

    if (user.signupOtp !== normalizedOtp) {
      return next(new ApiError(400, "Invalid OTP"));
    }

    user.emailVerified = true;
    user.signupOtp = "";
    user.signupOtpExpires = null;
    user.signupOtpResendAt = null;
    user.signupOtpResendCount = 0;

    await user.save();

    const indiaTime = new Date(
      new Date().toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
      }),
    );

    const hour = indiaTime.getHours();

    const defaultTheme =
      hour >= 10 && hour < 12 ? "light" : "dark";

    let appliedTheme = user.preferences.theme;

    if (appliedTheme === "system") {
      appliedTheme = defaultTheme;
    }

    const token = generateToken(user._id);

    const {
      password: _,
      __v,
      createdAt,
      updatedAt,
      signupOtp: __signupOtp,
      signupOtpExpires: __signupOtpExpires,
      signupOtpResendAt: __signupOtpResendAt,
      signupOtpResendCount: __signupOtpResendCount,
      ...verifiedUser
    } = user.toObject();

    verifiedUser.preferences.theme = appliedTheme;

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          user: verifiedUser,
          token,
        },
        "Email verified successfully",
      ),
    );
  } catch (error) {
    next(error);
  }
});

export const resendSignupOtp = asyncHandler(async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return next(new ApiError(400, "Email is required"));
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return next(new ApiError(404, "Verification request not found"));
    }

    if (user.emailVerified) {
      return next(new ApiError(400, "Email is already verified"));
    }

    const now = new Date();

    if (
      user.signupOtpResendAt &&
      now < user.signupOtpResendAt
    ) {
      const remainingSeconds = Math.ceil(
        (user.signupOtpResendAt.getTime() - now.getTime()) / 1000,
      );

      return next(
        new ApiError(
          429,
          `Please wait ${remainingSeconds} seconds before requesting another OTP`,
        ),
      );
    }

    if (user.signupOtpResendCount >= MAX_OTP_RESENDS) {
      return next(
        new ApiError(
          429,
          "Maximum OTP resend limit reached. Please sign up again",
        ),
      );
    }

    const otp = createSignupOtp();

    user.signupOtp = otp;
    user.signupOtpExpires = new Date(
      now.getTime() + OTP_EXPIRY_MS,
    );
    user.signupOtpResendAt = new Date(
      now.getTime() + OTP_RESEND_COOLDOWN_MS,
    );
    user.signupOtpResendCount += 1;

    await user.save();

    try {
      await sendSignupOtpEmail(user, otp);
    } catch (error) {
      user.signupOtp = "";
      user.signupOtpExpires = null;
      user.signupOtpResendAt = null;
      user.signupOtpResendCount -= 1;

      await user.save({
        validateBeforeSave: false,
      });

      throw error;
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          otpRequired: true,
          email: user.email,
          expiresIn: OTP_EXPIRY_MS,
          resendCooldown: OTP_RESEND_COOLDOWN_MS,
          maxResends: MAX_OTP_RESENDS,
          resendsUsed: user.signupOtpResendCount,
          remainingResends:
            MAX_OTP_RESENDS - user.signupOtpResendCount,
        },
        "A new verification OTP has been sent",
      ),
    );
  } catch (error) {
    next(error);
  }
});

export const login = asyncHandler(async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ApiError(400, "Email and password are required"));
    }

    const normalizedEmail = email.trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return next(new ApiError(400, "Please provide a valid email"));
    }

    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+password");

    if (!user) {
      return next(new ApiError(401, "Invalid email or password"));
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password,
    );

    if (!isPasswordCorrect) {
      return next(new ApiError(401, "Invalid email or password"));
    }

    if (!user.emailVerified) {
      return next(
        new ApiError(
          403,
          "Please verify your email before logging in",
        ),
      );
    }

    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket.remoteAddress ||
      "";

    const parser = new UAParser(req.headers["user-agent"]);
    const result = parser.getResult();

    const browser = result.browser.name || "Unknown";
    const os = result.os.name || "Unknown";
    let device = result.device.type || "Desktop";

    device = "Desktop";

    const geo = geoip.lookup(ip);

    const city = geo?.city || "Unknown";
    const state = geo?.region || "Unknown";
    const country = geo?.country || "Unknown";

    const previousLogin = user.lastLogin || {};
    const hasPreviousLogin = !!previousLogin.loginAt;

    const isNewLogin =
      hasPreviousLogin &&
      (previousLogin.city !== city ||
        previousLogin.state !== state ||
        previousLogin.device !== device);

    if (isNewLogin) {
      const otp = generateOtp();

      user.loginOtp = otp;
      user.loginOtpExpires = new Date(
        Date.now() + 10 * 60 * 1000,
      );

      await user.save();

      console.log("Login OTP:", otp);

      return res.status(200).json(
        new ApiResponse(
          200,
          {
            otpRequired: true,
            email: user.email,
          },
          "OTP verification required",
        ),
      );
    }

    const indiaTime = new Date(
      new Date().toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
      }),
    );

    const hour = indiaTime.getHours();

    const defaultTheme =
      hour >= 10 && hour < 12 ? "light" : "dark";

    let appliedTheme = user.preferences.theme;

    if (user.preferences.theme === "system") {
      appliedTheme = defaultTheme;
    }

    await User.findByIdAndUpdate(user._id, {
      lastLogin: {
        city,
        state,
        country,
        ip,
        browser,
        os,
        device,
        loginAt: new Date(),
      },
    });

    const token = generateToken(user._id);

    const {
      password: _,
      __v,
      createdAt,
      updatedAt,
      ...loggedInUser
    } = user.toObject();

    loggedInUser.preferences.theme = appliedTheme;

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          token,
        },
        "Login successful",
      ),
    );
  } catch (error) {
    next(error);
  }
});

export const verifyLoginOtp = asyncHandler(async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return next(new ApiError(400, "Email and OTP are required"));
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return next(new ApiError(404, "User not found"));
    }

    if (!user.loginOtp || !user.loginOtpExpires) {
      return next(new ApiError(400, "OTP not found"));
    }

    if (user.loginOtp !== otp) {
      return next(new ApiError(400, "Invalid OTP"));
    }

    if (new Date() > user.loginOtpExpires) {
      return next(new ApiError(400, "OTP has expired"));
    }

    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket.remoteAddress ||
      "";

    const parser = new UAParser(req.headers["user-agent"]);
    const result = parser.getResult();

    const browser = result.browser.name || "Unknown";
    const os = result.os.name || "Unknown";
    const device = result.device.type || "Desktop";

    const geo = geoip.lookup(ip);

    const city = geo?.city || "Unknown";
    const state = geo?.region || "Unknown";
    const country = geo?.country || "Unknown";

    user.lastLogin = {
      city,
      state,
      country,
      ip,
      browser,
      os,
      device,
      loginAt: new Date(),
    };

    user.loginOtp = undefined;
    user.loginOtpExpires = undefined;

    await user.save();

    const indiaTime = new Date(
      new Date().toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
      }),
    );

    const hour = indiaTime.getHours();

    const defaultTheme =
      hour >= 10 && hour < 12 ? "light" : "dark";

    let appliedTheme = user.preferences.theme;

    if (appliedTheme === "system") {
      appliedTheme = defaultTheme;
    }

    const token = generateToken(user._id);

    const {
      password,
      __v,
      createdAt,
      updatedAt,
      ...loggedInUser
    } = user.toObject();

    loggedInUser.preferences.theme = appliedTheme;

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          token,
        },
        "OTP verified successfully",
      ),
    );
  } catch (error) {
    next(error);
  }
});

export const logout = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Logout successful"));
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        req.user,
        "Current user fetched successfully",
      ),
    );
});