import * as authService from "./auth.service.js";
import ApiResponse from "../../common/utils/api-response.js";

const register = async (req, res) => {
  const user = await authService.register(req.body);
  ApiResponse.created(res, "Registration success", user);
};

const login = async (req, res) => {
  const { accessToken, refreshToken } = await authService.login(req.body);
  ApiResponse.ok(res, "Login success", { accessToken, refreshToken });
};

export { register, login };
