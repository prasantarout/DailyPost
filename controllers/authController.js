// src/controllers/authController.js
const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middlewares/asyncHandler");
const path = require("path");
const generateToken = require("../utils/generateToken");
const successResponse = require("../utils/successResponse");
const { sendOtpToUser } = require("../services/EmailServices");
const { generateOtp } = require("../utils/otpGenerator");
const Category = require("../models/Category");
const { default: mongoose } = require("mongoose");
// Register User
exports.registerUser = asyncHandler(async (req, res, next) => {
  const {
    name,
    email,
    password,
    confirmPassword,
    mobileNumber,
    address,
  } = req.body;
  console.log("Request Body:", req.body); // Log request body
  console.log("Uploaded File:", req.file);
  const profilePicture = req.file ? req.file.path : null;
  if (
    !name ||
    !email ||
    !password ||
    !confirmPassword ||
    !mobileNumber ||
    !address
  ) {
    return next(new ErrorResponse("Please provide all required fields", 400));
  }

  if (password !== confirmPassword) {
    return next(new ErrorResponse("Passwords do not match", 400));
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return next(new ErrorResponse("User already exists", 400));
    }

    const user = await User.create({
      name,
      email,
      password,
      mobileNumber,
      address,
      profilePicture, // Add profilePicture here
    });

    res.status(200).json(
      successResponse("User registered successfully", 200, {
        _id: user._id,
        name: user.name,
        email: user.email,
        mobileNumber: user.mobileNumber,
        address: user.address,
        profilePicture: user.profilePicture, 
        token: generateToken(user._id),
      })
    );
  } catch (error) {
    next(new ErrorResponse(error.message, 500));
  }
});

// Login User
exports.loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).select("+password");
    if (user && (await user.matchPassword(password))) {
      res.status(200).json(
        successResponse("User logged in successfully", 200, {
          _id: user._id,
          name: user.name,
          email: user.email,
          token: generateToken(user._id),
        })
      );
    } else {
      return next(new ErrorResponse("Invalid email or password", 401));
    }
  } catch (error) {
    next(error);
  }
};

exports.requestOtp = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return next(new ErrorResponse("Please provide an email", 400));
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return next(new ErrorResponse("User not found", 404));
    }
    const otp = generateOtp();
    user.otp = otp;
    user.otpExpiry = Date.now() + 10 * 60 * 1000;
    await user.save();
    await sendOtpToUser(user.email, otp);
    res.status(200).json(
      successResponse("OTP sent successfully", 200, {
        email: user.email,
      })
    );
  } catch (error) {
    next(error);
  }
});

exports.uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Get the user from the request (assumes user is authenticated and req.user is set)
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user profile with the file URL
    user.profilePicture = `uploads/${req.file.filename}`;
    await user.save();

    res.status(200).json({
      message: "Profile picture uploaded successfully",
      profilePicture: user.profilePicture,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUserProfile = asyncHandler(async (req, res, next) => {
  const { name, email, mobileNumber, address } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new ErrorResponse("User not found", 404));
    }
    user.name = name || user.name;
    user.email = email || user.email;
    user.mobileNumber = mobileNumber || user.mobileNumber;
    user.address = address || user.address;
    if (req.file) {
      user.profilePicture = req.file.path;
    }
    const updatedUser = await user.save();
    res.status(200).json(
      successResponse("Profile updated successfully", 200, {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        mobileNumber: updatedUser.mobileNumber,
        address: updatedUser.address,
        profilePicture: updatedUser.profilePicture,
      })
    );
  } catch (error) {
    next(error);
  }
});

exports.getUserProfile = asyncHandler(async (req, res, next) => {
  try {
    // Find the user and populate the related fields
    const user = await User.findById(req.user.id)
      .populate("posts")
      .populate("comment") // Populate comments
      .populate("category") // Populate user's interested categories
      .populate("followedPosts")
      .select("-password")
      .populate("followers", "name email")
      .populate("following", "name email")
    // console.log("User object:", user);
    if (!user) {
      return next(new ErrorResponse("User not found", 404));
    }
    const allCategories = await Category.find({});
    const totalFollowCount = user.followers.length;
    const followingUsers = user.following;
    const likesCount = user.likedPosts.length;

    
    res.status(200).json(
      successResponse("Profile retrieved successfully", 200, {
        _id: user._id,
        name: user.name,
        email: user.email,
        mobileNumber: user.mobileNumber,
        address: user.address,
        profilePicture: user.profilePicture,
        posts: user.posts,
        comments: user.comment,
        interestedCategories: user.category,
        followedPosts: user.followedPosts,
        allCategories: allCategories,
        totalFollowCount: totalFollowCount,
        followingUsers: followingUsers,
        likesCount: likesCount,
      })
    );
  } catch (error) {
    console.error("Error retrieving profile:", error);
    next(new ErrorResponse("Error retrieving profile", 500));
  }
});

// server/controllers/userController.js
exports.updateInterestedCategories = asyncHandler(async (req, res, next) => {
  const { categoryIds } = req.body;

  if (!categoryIds || !Array.isArray(categoryIds)) {
    return next(new ErrorResponse("Invalid category IDs", 400));
  }
  try {
    // Validate each category ID
    for (const id of categoryIds) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new ErrorResponse(`Invalid category ID: ${id}`, 400));
      }
    }
    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new ErrorResponse("User not found", 404));
    }
    user.category = categoryIds;
    await user.save();
    res
      .status(200)
      .json(
        successResponse(
          "Interested categories updated successfully",
          200,
          user.category
        )
      );
  } catch (error) {
    console.error("Error updating interested categories:", error);
    next(new ErrorResponse("Error updating interested categories", 500));
  }
});
