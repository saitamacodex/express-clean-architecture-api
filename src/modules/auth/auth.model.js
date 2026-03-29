import mongoose from "mongoose";
import bcrypt from "bcryptjs";

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
    refreshToken: {
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

// we have to save the password in hashed format - we use bcryptjs
userSchema.pre("save", async function (next) {
  // Only hash the password if it has been modified (e.g., on new user creation or password change)
  if (!this.isModified("password")) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(err);
    // Pass any errors to the next middleware or save callback
  }
});

export default mongoose.model("User", userSchema);

// select : false -> “Do NOT include this field when fetching data from DB (by default)”
