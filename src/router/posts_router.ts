import { Router } from "express";
import { PostsServices } from "../services/posts_services.js";
import { authMiddleware } from "../middleware/auth_middleware.js";

const router = Router();
const postsServices = new PostsServices();

router.post("/create", authMiddleware, postsServices.createPost);

export default router;