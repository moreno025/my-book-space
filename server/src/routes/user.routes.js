import { Router } from "express";
import { register, login, refreshToken, logout, forgotPassword, updatePassword } from "../controllers/auth.controller.js";
import { validateBody } from "../middleware/validate.js";
import { registerSchema, loginSchema, forgotPasswordSchema, updatePasswordSchema } from "../validators/user.validator.js";

const router = Router();

router.post("/register", validateBody(registerSchema), register);
router.post("/login", validateBody(loginSchema), login);
router.post("/refresh-token", refreshToken);
router.post("/logout", logout);
router.post("/forgot-password", validateBody(forgotPasswordSchema), forgotPassword);
router.post("/update-password", validateBody(updatePasswordSchema), updatePassword);

export default router;
