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
  const data = jwt.verify(token, process.env.JWT_SECRET);

  if (!data) {
    throw new ApiError(
      400,
      "Unauthorized access, please provide correct credentials"
    );
  }

  if (data.role !== "user") {
    throw new ApiError(400, "Only users have the access");
  }

  let user = await User.findById({ _id: data.id }).select("-password");

  if (!user) {
    throw new ApiError(404, "No user found.");
  }

  req.user = user;
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
  const data = jwt.verify(token, process.env.JWT_SECRET);

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
