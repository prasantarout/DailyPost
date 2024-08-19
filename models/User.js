const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  address: { type: String, required: true },
  otp: { type: String },
  otpExpiry: { type: Date },
  isAdmin: { type: Boolean, required: true, default: false },
  createdAt: { type: Date, default: Date.now },
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
  category: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
  comment: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  profilePicture: { type: String },
  followedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
  favorites: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],  
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],  
  likedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
  deviceToken: { type: String },
});

// Encrypt password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
