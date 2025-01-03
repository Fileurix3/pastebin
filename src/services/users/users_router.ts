import { Router } from "express";
import { UsersController } from "./users_controller.js";
import { authMiddleware } from "../../middleware/auth_middleware.js";

const router = Router();
const usersController = new UsersController();

router.get("/profile/:userId", usersController.getProfileById);
router.get("/profile", authMiddleware, usersController.getYourProfile);
router.put("/update/profile", authMiddleware, usersController.updateUserProfile);
router.put("/change/password", authMiddleware, usersController.changePassword);

export default router;
