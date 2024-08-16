const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/AuthMiddleware");
const { likePost, toggleLikePost } = require("../controllers/likesController");


router.post("/likePost", protect, toggleLikePost);

module.exports = router;