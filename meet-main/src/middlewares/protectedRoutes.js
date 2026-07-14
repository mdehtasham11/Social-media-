const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/user.model");
const { asyncHandler } = require("../common/asyncHandler");
const ApiError = require("../utils/ApiError");

exports.user = asyncHandler(async (req, res, next) => {
  let token = "";
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    throw new ApiError(
      400,
      "You are not logged in. Please login to get access"
    );
  }
  let data;
  try {
    data = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new ApiError(
      401,
      "Invalid or expired token"
    );
  }

  if (!data) {
    throw new ApiError(
      400,
      "Unauthorized access, please provide correct credentials"
    );
  }

  if (data.role !== "user" && data.role !== "admin") {
    throw new ApiError(400, "Only users and admins have the access");
  }

  // Use JWT payload directly instead of hitting DB on every request
  req.user = { _id: data.id, id: data.id, role: data.role };
  next();
});

exports.admin = asyncHandler(async (req, res, next) => {
  let token = "";
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    throw new ApiError(
      400,
      "You are not logged in. Please login to get access"
    );
  }
  let data;
  try {
    data = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    console.log("JWT verification failed:", error.message);
    throw new ApiError(
      401,
      "Invalid or expired token"
    );
  }

  if (!data) {
    throw new ApiError(
      400,
      "Unauthorized access, please provide correct credentials"
    );
  }

  if (data.role !== "admin") {
    throw new ApiError(400, "Only admins have the access");
  }

  let user = await User.findById({ _id: data.id }).select("-password");

  if (!user) {
    throw new ApiError(404, "No user found.");
  }

  req.user = user;
  next();
  // Removed duplicate block of code to avoid redeclaration of 'data'
});
