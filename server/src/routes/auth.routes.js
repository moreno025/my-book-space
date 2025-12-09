import { Router } from "express";
import { register, login, refreshToken, logout, forgotPassword, updatePassword, requestEmailChange, verifyNewEmail, updateProfile } from "../controllers/auth.controller.js";
import { validateBody } from "../middleware/validate.js";
import { registerSchema, loginSchema, forgotPasswordSchema, updatePasswordSchema } from "../validators/user.validator.js";
import { protect } from "../middleware/protect.js";
import { uploadAvatar, removeOldAvatar } from "../middleware/multer.js";

const router = Router();

const uploadAvatarMiddleware = (req, res, next) =>
  uploadAvatar(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message });
    next();
});

router.post("/register", validateBody(registerSchema), register); 
router.post("/login", validateBody(loginSchema), login);
router.post("/refresh-token", refreshToken); 
router.post("/logout", logout);
router.post("/forgot-password", validateBody(forgotPasswordSchema), forgotPassword); 
router.post("/update-password", validateBody(updatePasswordSchema), updatePassword); 
router.post("/change-email", protect, requestEmailChange); 
router.get("/verify-new-email", verifyNewEmail);
router.put("/update-profile", protect, uploadAvatarMiddleware, removeOldAvatar, updateProfile);


export default router;
