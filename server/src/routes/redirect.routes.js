import express from "express";
import { redirectToResetPassword, redirectToVerifyEmail } from "../controllers/redirect.controller.js";

const router = express.Router();

router.get("/reset-password", redirectToResetPassword);
router.get("/verify-email", redirectToVerifyEmail);

export default router;
