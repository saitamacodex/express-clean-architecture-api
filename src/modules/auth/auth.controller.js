import * as authService from "./auth.service.js";
import ApiResponse from "../../common/utils/api-response.js";

const register = async (req, res) => {
  const user = await authService.register(req.body);
  ApiResponse.created(res, "Registration success", user);
};

const login = async (req, res) => {
  const { user, newAccessToken, newRefreshToken } = await authService.login(
    req.body,
  );
  console.log(newAccessToken);
  res
    .cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      secure: true, // only sent over HTTPS
    })
    .cookie("accessToken", newAccessToken, {
      httpOnly: true,
      maxAge: 15 * 60 * 1000, // 15 minutes
      secure: true,
    });
  ApiResponse.ok(res, "Login Success", { user });
};

const logout = async (req, res) => {
  await authService.logout(req.user.id);
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
  });
  ApiResponse.ok(res, "Logout Success");
};

const verifyEmail = async (req, res) => {
  await authService.verifyEmails(req.params.token);
  ApiResponse.ok(res, "Email Verified Successfully");
};

const refreshTokens = async (req, res) => {
  // fetch the token which was saved during login session in the cookies
  const token = req.cookies?.refreshToken;
  const { accessToken } = await authService.refresh(token);
  ApiResponse.ok(res, "Token refreshed", { accessToken });
};

const forgotPassword = async (req, res) => {
  await authService.forgotPassword(req.body);
  ApiResponse.ok(res, "Password Reset Success.");
};

const resetPassword = async (req, res) => {
  await authService.resetPassword(req.params.token, req.body.password);
  ApiResponse.ok(res, "Password reset successful");
};

const getProfile = async (req, res) => {
  const user = await authService.getProfile(req.user.id);
  ApiResponse.ok(res, "User Profile", user);
};

export {
  register,
  login,
  logout,
  getProfile,
  verifyEmail,
  refreshTokens,
  forgotPassword,
  resetPassword,
};
