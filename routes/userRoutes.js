// src/routes/authRoutes.js
const express = require("express");
const upload = require("../middlewares/upload");
const {
  registerUser,
  loginUser,
  uploadProfilePicture,
  requestOtp,
  updateUserProfile,
  getUserProfile,
} = require("../controllers/authController");
const {
  registerUserSchema,
  loginUserSchema,
  validate,
} = require("../validations/userValidation");
const { protect } = require("../middlewares/AuthMiddleware");

const router = express.Router();

router.post("/register", validate(registerUserSchema), registerUser);
router.post("/login", validate(loginUserSchema), loginUser);
router.post("/otpSend", requestOtp);
router.put("/profile", protect,  upload.single("profilePicture"), updateUserProfile);
router.get("/getProfile", protect, getUserProfile);
router.post(
  "/upload-profile-picture",
  upload.single("profilePicture"),
  uploadProfilePicture
);

module.exports = router;
