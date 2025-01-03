import { Router } from "express";
import { UserServices } from "../services/user_services.js";
import { authMiddleware } from "../middleware/auth_middleware.js";

const router = Router();
const userServices = new UserServices();

router.get("/profile/:userId", userServices.getProfileById);
router.get("/profile", authMiddleware, userServices.getYourProfile);
router.put("/update/profile", authMiddleware, userServices.updateUserProfile);
router.put("/change/password", authMiddleware, userServices.changePassword);

export default router;
