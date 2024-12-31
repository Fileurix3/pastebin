import { Router } from "express";
import { PostsServices } from "../services/posts_services.js";
import { authMiddleware } from "../middleware/auth_middleware.js";

const router = Router();
const postsServices = new PostsServices();

router.post("/create", authMiddleware, postsServices.createPost);
router.get("/:postId", postsServices.getPostById);
router.get("/search/:params", postsServices.searchPost);
router.put("/update/:postId", authMiddleware, postsServices.updatePost);
router.delete("/delete/:postId", authMiddleware, postsServices.deletePost);

export default router;
