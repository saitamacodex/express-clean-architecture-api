import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      minLength: 2,
      maxLength: 50,
      required: [true, "Name is required"],
    },

    email: {
      type: String,
      trim: true,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      minLength: 8,
      required: [true, "Password is required"],
      select: false,
    },

    role: {
      type: String,
      enum: ["customer", "seller", "admin"],
      default: "customer",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: { type: String, select: false },
    refreshtoken: { type: String, select: false },
    resetPasswordtoken: { type: String, select: false },
    resetpasswordExpires: { type: Date, select: false },
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
