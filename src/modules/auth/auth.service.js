import ApiError from "../../common/utils/api-error.js";
import crypto from "crypto";
import {
  generateAccessToken,
  generateRefreshToken,
  generateResetToken,
  verifyRefreshToken,
} from "../../common/utils/jwt.token.js";
import User from "./auth.model.js";
import {
  sendRestPasswordEmail,
  sendVerificationEmail,
} from "../../common/config/email.js";

const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

const register = async ({ name, email, password, role }) => {
  const existing = await User.findOne({ email });
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

  // send an email to user with token: rawToken
  try {
    await sendVerificationEmail(email, rawToken);
  } catch (error) {
    console.log(error);
  }

  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.verificationToken;

  return userObj;
};

const login = async ({ email, password }) => {
  // take email and find user in DB
  // if passwords match or not
  // check if verified or not

  // by default password is not fetched because we have set select : false in model.
  // so we need to explicitly tell mongoose to include password when fetching user by email
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw ApiError.unauthorized("Invalid Email or Password");
  }

  // Password MATCHING
  const isPassMatched = await user.comparePassword(password);
  if (!isPassMatched) throw ApiError.unauthorized("Invalid Email or Password.");

  // we want to check if user is verified or not (or we want only verified user to login)
  if (!user.isVerified) {
    throw ApiError.forbidden("Please Verify your email before login.");
  }

  // now we need to send token to user
  const newAccessToken = generateAccessToken({ id: user._id, role: user.role });
  const newRefreshToken = generateRefreshToken({ id: user._id });

  user.refreshToken = hashToken(newRefreshToken);
  // now we need to save the user
  await user.save({ validateBeforeSave: false });

  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.refreshToken;

  // do cookies later, for now we will send token in response body

  return { userObj, newAccessToken, newRefreshToken };
};

const refresh = async (token) => {
  if (!token) throw ApiError.unauthorized("Refresh token missing");
  const decode = verifyRefreshToken(token);

  const user = await User.findById(decode.id).select("+refreshToken");
  if (!user) throw ApiError.unauthorized("User not found");

  if (user.refreshToken !== hashToken(token)) {
    throw ApiError.unauthorized("Invalid refresh token");
  }

  const accessToken = generateAccessToken({ id: user._id, role: user.role });
  const refreshToken = generateRefreshToken({ id: user._id });
  user.refreshToken = hashToken(refreshToken);
  // now we need to save the user
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

const logout = async (userID) => {
  const user = await User.findById(userID);
  if (!user) throw ApiError.unauthorized("User not found.");

  user.refreshToken = undefined;
  await user.save({ validateBeforeSave: false });

  // another way to do
  // await User.findByIdAndUpdate(userId, { refreshToken: null });
};

const forgotPassword = async ({ email }) => {
  const user = await User.findOne({ email });
  if (!user) throw ApiError.notfound("No Account with that email.");

  const { rawToken, hashedToken } = generateResetToken();
  user.resetPasswordtoken = hashedToken;
  user.resetpasswordExpires = Date.now() + 15 * 60 * 1000;

  await user.save();
  try {
    await sendRestPasswordEmail(email, rawToken);
  } catch (error) {
    console.log("Failed to send rest email:", error.message);
  }
};

const resetPassword = async (token, newPassword) => {
  const hashedtokenVal = hashToken(token);

  const user = await User.findOne({
    resetPasswordtoken: hashedtokenVal,
    resetpasswordExpires: { $gt: Date.now() },
  }).select("+resetPasswordtoken +resetpasswordExpires");

  if (!user) throw ApiError.badRequest("Invalid or expired reset token");

  user.password = newPassword;
  user.resetPasswordtoken = undefined;
  user.resetpasswordExpires = undefined;
  await user.save();
};

const getProfile = async (userID) => {
  const user = await User.findById(userID);
  if (!user) {
    throw ApiError.notfound("User not found");
  }
  return user;
};

const verifyEmail = async function (rawToken) {
  const hashedTokenValue = hashToken(rawToken);
  const user = await User.findOne({
    verificationToken: hashedTokenValue,
  }).select("+verificationToken");

  if (!user) throw ApiError.notfound("User does not exist");

  user.isVerified = true;
  user.verificationToken = undefined;

  await user.save();
  return user;
};

export {
  register,
  login,
  refresh,
  logout,
  forgotPassword,
  getProfile,
  verifyEmail,
  resetPassword,
};
