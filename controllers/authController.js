// src/controllers/authController.js
const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middlewares/asyncHandler");
const path = require("path");
const generateToken = require("../utils/generateToken");
const successResponse = require("../utils/successResponse");
const { sendOtpToUser } = require("../services/EmailServices");
const { generateOtp } = require("../utils/otpGenerator");

// Register User
exports.registerUser = asyncHandler(async (req, res, next) => {
  const { name, email, password, confirmPassword, mobileNumber, address } =
    req.body;

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
    });

    res.status(201).json(
      successResponse("User registered successfully", 201, {
        _id: user._id,
        name: user.name,
        email: user.email,
        mobileNumber: user.mobileNumber,
        address: user.address,
        token: generateToken(user._id),
      })
    );
  } catch (error) {
    next(error);
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
    const user = await User.findById(req.user.id)
    .populate("posts") // This will populate the posts field with post data
    .select("-password"); 
    if (!user) {
      return next(new ErrorResponse("User not found", 404));
    }
    res.status(200).json(
      successResponse("Profile retrieved successfully", 200, {
        _id: user._id,
        name: user.name,
        email: user.email,
        mobileNumber: user.mobileNumber,
        address: user.address,
        profilePicture: user.profilePicture,
        posts: user.posts,
      })
    );
  } catch (error) {
    console.error("Error retrieving profile:", error); //
    next(new ErrorResponse("Error retrieving profile", 500));
  }
});
