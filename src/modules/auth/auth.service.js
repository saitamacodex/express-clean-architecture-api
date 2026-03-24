import ApiError from "../../common/utils/api-error.js";
import crypto from "crypto";
import {
  generateAccessToken,
  generateRefreshToken,
  generateResetToken,
  verifyRefreshToken,
} from "../../common/utils/jwt.token.js";
import User from "./auth.model.js";

const hashToken = (token) => {
  crypto.createHash("sha256").update(token).digest("hex");
};

const register = async ({ name, email, password, role }) => {
  const existing = await User.findone({ email });
  if (existing) {
    throw ApiError.conflict("Email already exist");
  }

  const { rawToken, hashedToken } = generateResetToken();
  const user = await User.create({
    name,
    email,
    password,
    role,
    verificationToken: hashedToken,
  });
  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.verificationToken;

  return userObj;
};

const login = async ({ email, password }) => {
  // take email and find user in DB
  // if passwords match or not
  // check if verified or not

  // With password select: false → you must use .select("+password")
  //“Even though password it’s hidden, include it”
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw ApiError.unauthorized("Invalid Email or Password");
  }

  // todo : will check password here later
  if (!user.isVerified) {
    throw ApiError.forbidden("Please Verify your rmail before login.");
  }

  // now we need to send token to user
  const accessToken = generateAccessToken({ id: user._id, role: user.role });
  const refreshToken = generateRefreshToken({ id: user._id });

  user.refreshtoken = hashToken(refreshToken);
  await user.save({ validateBeforeSave: false });
  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.refreshtoken;

  return { userObj, accessToken, refreshToken };
};

export { register, login };
