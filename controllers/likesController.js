const asyncHandler = require("../middlewares/asyncHandler");
const Post = require("../models/Post");
const ErrorResponse = require("../utils/errorResponse");
const successResponse = require("../utils/successResponse");

exports.toggleLikePost = asyncHandler(async (req, res, next) => {
  const { postId } = req.params;
  const userId = req.user.id;

  try {
    // Find the post by ID
    const post = await Post.findById(postId);
    if (!post) {
      return next(new ErrorResponse("Post not found", 404));
    }
    // Check if the user has already liked the post
    const hasLiked = post.likes.includes(userId);
    if (hasLiked) {
      // User has already liked the post, so remove the like (dislike)
      post.likes = post.likes.filter(
        (like) => like.toString() !== userId.toString()
      );
      await post.save();
      res
        .status(200)
        .json(successResponse("Post disliked successfully", 200, post));
    } else {
      // User has not liked the post, so add the like
      post.likes.push(userId);
      await post.save();

      res
        .status(200)
        .json(successResponse("Post liked successfully", 200, post));
    }
  } catch (error) {
    next(new ErrorResponse("Error toggling post like", 500));
  }
});
