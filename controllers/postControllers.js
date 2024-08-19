const asyncHandler = require("../middlewares/asyncHandler");
const Post = require("../models/Post");
const User = require("../models/User");
const Comment = require("../models/Comment");
const Category = require("../models/Category");
const ErrorResponse = require("../utils/errorResponse");
const successResponse = require("../utils/successResponse");
const PushNotificationService = require("../services/PushNotificationService");
const Notification = require("../models/Notification");

exports.createPost = asyncHandler(async (req, res, next) => {
  const { title, content, images, videos, tags, category } = req.body;
  try {
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return next(new ErrorResponse("Category not found", 404));
    }
    const post = await Post.create({
      title,
      content,
      author: req.user.id,
      images,
      videos,
      tags,
      category,
    });
    await User.findByIdAndUpdate(req.user.id, {
      $push: { posts: post._id },
    });

    const user = await User.findById(req.user.id).populate("followers");
    const notifications = user.followers.map((follower) => ({
      recipient: follower._id,
      sender: req.user.id,
      post: post._id,
      type: "new_post",
      message: `${req.user.name} has posted something new.`,
    }));
    try {
      await Notification.insertMany(notifications);
    } catch (error) {
      console.error("Error saving notifications:", error);
      return next(new ErrorResponse("Failed to save notifications", 500));
    }
    user.followers.forEach((follower) => {
      PushNotificationService.send({
        to: follower.deviceToken,
        title: "New Post!",
        body: `${req.user.name} has posted something new.`,
      });
    });
    res
      .status(200)
      .json(successResponse("Post created successfully", 200, post));
  } catch (error) {
    next(new ErrorResponse(error.message, 500));
  }
});

// Get all posts
exports.getAllPosts = asyncHandler(async (req, res, next) => {
  try {
    const posts = await Post.find()
      .populate("author", "name email")
      .populate("comments", "content")
      .populate("category", "name");

    res
      .status(200)
      .json(successResponse("Posts retrieved successfully", 200, posts));
  } catch (error) {
    next(new ErrorResponse("Error retrieving posts", 500));
  }
});

// Get a single post by ID
exports.getPostById = asyncHandler(async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "name email")
      .populate("comments", "content")
      .populate("category", "name");
    if (!post) {
      return next(new ErrorResponse("Post not found", 404));
    }
    res
      .status(200)
      .json(successResponse("Post retrieved successfully", 200, post));
  } catch (error) {
    next(new ErrorResponse("Error retrieving post", 500));
  }
});

// Update a post by ID
exports.updatePost = asyncHandler(async (req, res, next) => {
  const { title, content, images, videos, tags, category } = req.body;

  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return next(new ErrorResponse("Post not found", 404));
    }
    if (post.author.toString() !== req.user.id && !req.user.isAdmin) {
      return next(new ErrorResponse("Not authorized to update this post", 403));
    }
    post.title = title || post.title;
    post.content = content || post.content;
    post.images = images || post.images;
    post.videos = videos || post.videos;
    post.tags = tags || post.tags;
    post.category = category || post.category;
    await post.save();
    res
      .status(200)
      .json(successResponse("Post updated successfully", 200, post));
  } catch (error) {
    next(new ErrorResponse("Error updating post", 500));
  }
});

exports.deletePost = asyncHandler(async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return next(new ErrorResponse("Post not found", 404));
    }
    if (post.author.toString() !== req.user.id && !req.user.isAdmin) {
      return next(new ErrorResponse("Not authorized to delete this post", 403));
    }
    await post.deleteOne();
    res.status(200).json(successResponse("Post deleted successfully", 200));
  } catch (error) {
    next(new ErrorResponse("Error deleting post", 500));
  }
});

// exports.createPostByCategory = asyncHandler(async (req, res, next) => {
//   const { title, content, images, videos, tags, category } = req.body;
//   try {
//     const categoryExists = await Category.findById(category);
//     if (!categoryExists) {
//       return next(new ErrorResponse("Category not found", 404));
//     }
//     const post = await Post.create({
//       title,
//       content,
//       author: req.user.id,
//       images,
//       videos,
//       tags,
//       category: categoryExists._id,
//     });
//     await User.findByIdAndUpdate(req.user.id, {
//       $push: { posts: post._id },
//     });
//     res
//       .status(200)
//       .json(successResponse("Post created successfully", 200, post));
//   } catch (error) {
//     next(new ErrorResponse("Error creating post", 500));
//   }
// });

exports.getPostsByCategory = asyncHandler(async (req, res, next) => {
  const { categoryId } = req.params;
  try {
    // Check if the category exists
    const categoryExists = await Category.findById(categoryId);
    if (!categoryExists) {
      return next(new ErrorResponse("Category not found", 404));
    }
    // Find posts that belong to the category
    const posts = await Post.find({ category: categoryId })
      .populate("author", "name email")
      .populate("comments", "content")
      .populate("category", "name");
    res
      .status(200)
      .json(successResponse("Posts retrieved successfully", 200, posts));
  } catch (error) {
    next(new ErrorResponse("Error retrieving posts", 500));
  }
});

exports.recommendPosts = asyncHandler(async (req, res, next) => {
  try {
    let recommendedPosts;
    // Option 1: Recommend posts based on user interaction (assume user is authenticated)
    if (req.user) {
      const userCategories = req.user.interestedCategories || [];
      recommendedPosts = await Post.find({ category: { $in: userCategories } })
        .populate("author", "name email")
        .populate("category", "name")
        .limit(10)
        .sort({ createdAt: -1 }); // Sort by most recent
    }
    // Option 2: If no user interaction data, recommend trending posts
    if (!recommendedPosts || recommendedPosts.length === 0) {
      recommendedPosts = await Post.find()
        .populate("author", "name email")
        .populate("category", "name")
        .limit(10)
        .sort({ views: -1 }); // Sort by most viewed
    }

    // Option 3: If no trending posts, recommend recent posts
    if (!recommendedPosts || recommendedPosts.length === 0) {
      recommendedPosts = await Post.find()
        .populate("author", "name email")
        .populate("category", "name")
        .limit(10)
        .sort({ createdAt: -1 }); // Sort by most recent
    }
    if (recommendedPosts.length === 0) {
      return next(
        new ErrorResponse("No posts available for recommendation", 404)
      );
    }
    // console.log(recommendedPosts,">>>>>>>>>>>")
    res
      .status(200)
      .json(
        successResponse(
          "Recommended posts retrieved successfully",
          200,
          recommendedPosts
        )
      );
  } catch (error) {
    next(new ErrorResponse("Error retrieving recommended posts", 500));
  }
});
