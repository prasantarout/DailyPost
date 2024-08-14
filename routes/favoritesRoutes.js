// src/routes/favoriteRoutes.js
const express = require("express");
const router = express.Router();
const {
  addFavoritePost,
  removeFavoritePost,
  getFavoritePosts,
} = require("../controllers/favoriteController");
const { protect } = require("../middlewares/AuthMiddleware");

router.post("/add", protect, addFavoritePost);
router.post("/remove", protect, removeFavoritePost);
router.get("/getAll", protect, getFavoritePosts);

module.exports = router;
