const Category = require("../models/Category");
const asyncHandler = require("../middlewares/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const successResponse = require("../utils/successResponse");

// Create a new category
exports.createCategory = asyncHandler(async (req, res, next) => {
  const { name } = req.body;

  if (!name) {
    return next(new ErrorResponse("Please provide a category name", 400));
  }
  const category = await Category.create({ name });
  res
  .status(201)
  .json(successResponse("category created successfully", 201, category));
//   res.status(201).json({
//     success: true,
//     data: category,
//   });
});

// Get all categories
exports.getCategories = asyncHandler(async (req, res, next) => {
  const categories = await Category.find();
  res
  .status(201)
  .json(successResponse("category fetched successfully", 201, categories));
});

// Get a single category by ID
exports.getCategoryById = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return next(
      new ErrorResponse(`Category not found with id ${req.params.id}`, 404)
    );
  }
  res
  .status(201)
  .json(successResponse("category fetched successfully", 201, category));
});

// Update a category by ID
exports.updateCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!category) {
    return next(
      new ErrorResponse(`Category not found with id ${req.params.id}`, 404)
    );
  }
  res
  .status(201)
  .json(successResponse("category fetched successfully", 201, category));
});

// Delete a category by ID
exports.deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) {
    return next(
      new ErrorResponse(`Category not found with id ${req.params.id}`, 404)
    );
  }
  res.status(200).json({
    success: true,
    message: "Category deleted successfully",
  });
});
