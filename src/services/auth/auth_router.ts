import { AuthController } from "./auth_controller.js";
import { Router } from "express";

const router = Router();
const authController = new AuthController();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/logout", authController.logout);

export default router;
