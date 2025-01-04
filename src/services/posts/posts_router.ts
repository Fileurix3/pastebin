import { Router } from "express";
import { PostsController } from "./posts_controller.js";
import { authMiddleware } from "../../middleware/auth_middleware.js";

const router = Router();
const postsController = new PostsController();

router.post("/create", authMiddleware, postsController.createPost);
router.get("/:postId", postsController.getPostById);
router.get("/search/:params", postsController.searchPost);
router.put("/update/:postId", authMiddleware, postsController.updatePost);
router.delete("/delete/:postId", authMiddleware, postsController.deletePost);

export default router;
