import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 3,
      maxlength: 50,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },

    avatar: {
      type: String,
      default:
        "https://ui-avatars.com/api/?background=dc2626&color=fff&name=User",
    },

    avatarPublicId: {
      type: String,
      default: "",
    },

    username: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
      minlength: 3,
      maxlength: 30,
    },

    bio: {
      type: String,
      trim: true,
      maxlength: 250,
      default: "",
    },

    historyPaused: {
      type: Boolean,
      default: false,
    },

    hasChannel: {
      type: Boolean,
      default: false,
    },

    // Membership
    membership: {
      plan: {
        type: String,
        enum: ["free", "bronze", "silver", "gold"],
        default: "free",
      },

      status: {
        type: String,
        enum: ["active", "expired", "cancelled"],
        default: "active",
      },

      startDate: {
        type: Date,
        default: null,
      },

      endDate: {
        type: Date,
        default: null,
      },

      lastPaymentId: {
        type: String,
        default: "",
      },

      razorpayCustomerId: {
        type: String,
        default: "",
      },
    },

    preferences: {
      theme: {
        type: String,
        enum: ["system", "light", "dark"],
        default: "system",
      },

      autoplay: {
        type: Boolean,
        default: true,
      },

      inlinePlayback: {
        type: Boolean,
        default: true,
      },

      rememberProgress: {
        type: Boolean,
        default: true,
      },

      language: {
        type: String,
        enum: ["en", "hi"],
        default: "en",
      },

      showLocationOnComments: {
        type: Boolean,
        default: false,
      },

      notifications: {
        newVideos: {
          type: Boolean,
          default: true,
        },

        newSubscribers: {
          type: Boolean,
          default: true,
        },

        likes: {
          type: Boolean,
          default: true,
        },

        comments: {
          type: Boolean,
          default: true,
        },

        replies: {
          type: Boolean,
          default: true,
        },

        accountUpdates: {
          type: Boolean,
          default: true,
        },

        systemUpdates: {
          type: Boolean,
          default: true,
        },
      },
    },

    lastLogin: {
      city: {
        type: String,
        default: "",
      },

      state: {
        type: String,
        default: "",
      },

      country: {
        type: String,
        default: "",
      },

      ip: {
        type: String,
        default: "",
      },

      browser: {
        type: String,
        default: "",
      },

      os: {
        type: String,
        default: "",
      },

      device: {
        type: String,
        default: "",
      },

      loginAt: {
        type: Date,
        default: null,
      },
    },

    loginAt: {
      type: Date,
      default: null,
    },

    // Login security OTP
    loginOtp: {
      type: String,
      default: "",
    },

    loginOtpExpires: {
      type: Date,
      default: null,
    },

    // Signup email verification OTP
    signupOtp: {
      type: String,
      default: "",
    },

    signupOtpExpires: {
      type: Date,
      default: null,
    },

    signupOtpResendAt: {
      type: Date,
      default: null,
    },

    signupOtpResendCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model("User", userSchema);

export default User;