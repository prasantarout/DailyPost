// src/controllers/favoriteController.js
const asyncHandler = require("express-async-handler");
const Post = require("../models/Post");
const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");
const successResponse = require("../utils/successResponse");

// Add a post to user's favorites
exports.addFavoritePost = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { postId } = req.body;
  // Validate postId
  if (!postId) {
    return next(new ErrorResponse("Post ID is required", 400));
  }
  // Check if the post exists
  const post = await Post.findById(postId);
  if (!post) {
    return next(new ErrorResponse("Post not found", 404));
  }
  // Add the post to the user's favorites if not already added
  const user = await User.findById(userId);
  if (user.favorites.includes(postId)) {
    return next(new ErrorResponse("Post already in favorites", 400));
  }
  user.favorites.push(postId);
  await user.save();
  res
    .status(200)
    .json(
      successResponse(
        "Post added to favorites successfully",
        200,
        user.favorites
      )
    );
});

// Remove a post from user's favorites
exports.removeFavoritePost = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { postId } = req.body;

  // Validate postId
  if (!postId) {
    return next(new ErrorResponse("Post ID is required", 400));
  }

  // Check if the post exists
  const post = await Post.findById(postId);
  if (!post) {
    return next(new ErrorResponse("Post not found", 404));
  }
  // Remove the post from the user's favorites
  const user = await User.findById(userId);
  user.favorites = user.favorites.filter(
    (favoriteId) => favoriteId.toString() !== postId
  );
  await user.save();
  res
    .status(200)
    .json(
      successResponse(
        "Post removed from favorites successfully",
        200,
        user.favorites
      )
    );
});

// Get all favorite posts of the user
exports.getFavoritePosts = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const user = await User.findById(userId).populate("favorites");
  res
    .status(200)
    .json(
      successResponse(
        "Favorite posts retrieved successfully",
        200,
        user.favorites
      )
    );
});
