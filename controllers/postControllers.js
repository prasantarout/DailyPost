const asyncHandler = require("express-async-handler");
const Post = require("../models/Post");
const User = require("../models/User");
const Comment = require("../models/Comment");
const Category = require("../models/Category");
const ErrorResponse = require("../utils/errorResponse");
const successResponse = require("../utils/successResponse");

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
    res
      .status(201)
      .json(successResponse("Post created successfully", 201, post));
  } catch (error) {
    next(error);
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
    next(error);
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
    next(error);
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
    next(error);
  }
});

// Delete a post by ID
exports.deletePost = asyncHandler(async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return next(new ErrorResponse("Post not found", 404));
    }
    if (post.author.toString() !== req.user.id && !req.user.isAdmin) {
      return next(new ErrorResponse("Not authorized to delete this post", 403));
    }
    await post.remove();
    res.status(200).json(successResponse("Post deleted successfully", 200));
  } catch (error) {
    next(error);
  }
});
