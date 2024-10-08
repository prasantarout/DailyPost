const express = require("express");
const router = express.Router();
const {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  getPostsByCategory,
  recommendPosts,
} = require("../controllers/postControllers");
const { protect } = require("../middlewares/AuthMiddleware");

// Protect routes with authentication middleware
router.post("/createPost", protect, createPost);
router.get("/getAllPost", getAllPosts);

router
  .route("/:id")
  .get(getPostById)
  .put(protect, updatePost)
  .delete(protect, deletePost);

router.get("/getAllPost/:categoryId", getPostsByCategory);
router.get("/getAll/recommended", recommendPosts);
module.exports = router;
