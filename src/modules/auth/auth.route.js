import { Router } from "express";
import * as controller from "./auth.controller.js";
import validate from "../../common/middleware/validate.middleware.js";
import LoginDto from "./dto/login.dto.js";
import RegisterDto from "./dto/register.dto.js";
import ForgotPasswordDto from "./dto/forgotPasswordDto.js";
import ResetPasswordDto from "./dto/reset-password.dto.js";
import { authenticate } from "./auth.middleware.js";

const router = Router();

router.post("/register", validate(RegisterDto), controller.register);
router.post("/login", validate(LoginDto), controller.login);
router.post("/logout", authenticate, controller.logout);
router.get("/me", authenticate, controller.getProfile);
router.get("/verify-email/:token", controller.verifyEmail);
router.post("/refresh-token", controller.refreshTokens);
router.post(
  "/forgot-password",
  validate(ForgotPasswordDto),
  controller.forgotPassword,
);

router.put(
  "/reset-password/:token",
  validate(ResetPasswordDto),
  controller.resetPassword,
);

export default router;
