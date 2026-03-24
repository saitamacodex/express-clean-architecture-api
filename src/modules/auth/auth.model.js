import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      minlength: 2,
      maxlength: 50,
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
      minlength: 8,
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
    verificationToken: {
      type: String,
      select: false,
    },
    refreshtoken: {
      type: String,
      select: false,
    },
    resetPasswordtoken: {
      type: String,
      select: false,
    },
    resetpasswordExpires: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);

// select : false -> “Do NOT include this field when fetching data from DB (by default)”
