const asyncHandler = require("../middlewares/asyncHandler");
const Post = require("../models/Post");
const ErrorResponse = require("../utils/errorResponse");
const successResponse = require("../utils/successResponse");

exports.toggleLikePost = asyncHandler(async (req, res, next) => {
  const { postId } = req.body; 
  const userId = req.user.id; 
  try {
    const post = await Post.findById(postId);
    if (!post) {
      return next(new ErrorResponse("Post not found", 404));
    }
    const hasLiked = post.likes.includes(userId);
    if (hasLiked) {
      post.likes = post.likes.filter(
        (like) => like.toString() !== userId.toString()
      );
      await post.save();
      res.status(200).json(
        successResponse("Post disliked successfully", 200, {
          isLiked: false,
          likeCount: post.likes.length,
        })
      );
    } else {
      post.likes.push(userId);
      await post.save();
      res.status(200).json(
        successResponse("Post liked successfully", 200, {
          isLiked: true,
          likeCount: post.likes.length,
        })
      );
    }
  } catch (error) {
    next(new ErrorResponse("Error toggling post like", 500));
  }
});
