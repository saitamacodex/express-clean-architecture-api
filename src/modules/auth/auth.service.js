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

  // TODO: send an email to user with token: rawToken

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

  // we want to check if user is verified or not (or we want only verified user to login)
  if (!user.isVerified) {
    throw ApiError.forbidden("Please Verify your email before login.");
  }

  // now we need to send token to user
  const accessToken = generateAccessToken({ id: user._id, role: user.role });
  const refreshToken = generateRefreshToken({ id: user._id });

  user.refreshtoken = hashToken(refreshToken);
  // now we need to save the user
  await user.save({ validateBeforeSave: false });

  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.refreshtoken;

  // do cookies later, for now we will send token in response body

  return { userObj, accessToken, refreshToken };
};

const refreshToken = async (token) => {
  if (!token) throw ApiError.unauthorized("Refresh token missing");
  const decode = verifyRefreshToken(token);

  const user = await User.findById(decode._id).select("+refreshToken");
  if (!user) throw ApiError.unauthorized("User not found");

  if (user.refreshtoken !== hashToken(token)) {
    throw ApiError.unauthorized("Invalid refresh token");
  }

  const accessToken = generateAccessToken({ id: user._id, role: user.role });
  const refreshToken = generateRefreshToken({ id: user._id });
  user.refreshtoken = hashToken(refreshToken);
  // now we need to save the user
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

const logOut = async (userID) => {
  const user = await User.findById(userID);
  if (!user) throw ApiError.unauthorized("User not found.");

  user.refreshtoken = undefined;
  await user.save({ validateBeforeSave: false });

  // another way to do
  // await User.findByIdAndUpdate(userId, { refreshToken: null });
};

export { register, login };
