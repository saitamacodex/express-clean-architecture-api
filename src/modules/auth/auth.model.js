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
userSchema.pre("save", async function () {
  // Only hash the password if it has been modified (e.g., on new user creation or password change)
  if (!this.isModified("password")) {
    return;
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    console.log(error);
    // Pass any errors to the next middleware or save callback
  }
});

// during login we will get a clear text password so we have to verify with hashed
// in mongoose we get something "methods" where can we store functions and later use it
userSchema.methods.comparePassword = async function (clearTextLoginPass) {
  await bcrypt.compare(clearTextLoginPass, this.password);
};

export default mongoose.model("User", userSchema);

// select : false -> means “Do NOT include this field when fetching data from DB (by default)”
