import * as authService from "./auth.service.js";
import ApiResponse from "../../common/utils/api-response.js";

const register = async (req, res) => {
  const user = await authService.register(req.body);
  ApiResponse.created(res, "Registration success", user);
};

const login = async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body);
  res
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      secure: true, // only sent over HTTPS
    })
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      maxAge: 15 * 60 * 1000, // 15 minutes
      seccure: true,
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

const getProfile = async (req, res) => {
  const user = await authService.getProfile(req.user.id);
  ApiResponse.ok(res, "User Profile", user);
};

export { register, login, logout, getProfile };
