const fs = require("fs");
const cloudinary = require("../storage/cloudnary");
const { asyncHandler } = require("../common/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const Post = require("../models/post.model");
const User = require("../models/user.model");
const createNotification = require("../common/Notification");
const Comment = require("../models/comment.model");
const Notification = require("../models/notification.model");
const { analyzeText } = require("../services/perspectiveService");

exports.handlePostUpload = asyncHandler(async (req, res) => {
  const { caption, visibility } = req.body;
  const { id } = req.user;

  const missingField = [];
  if (!caption) missingField.push("caption");
  if (!req.file) missingField.push("image");

  if (missingField.length > 1) {
    throw new ApiError(
      400,
      `Missing required fields: ${missingField.join(",")}`
    );
  }

  let imageUrl = "";
  if (req.file) {
    const imageUrlResponse = await cloudinary.uploader.upload(req.file.path);
    imageUrl = imageUrlResponse.secure_url;
    fs.unlinkSync(req.file.path);
  }

  const data = await Post.create({
    caption,
    image: imageUrl,
    createdBy: id,
    visibility,
  });

  if (!data) {
    throw new ApiError(400, `Error in post upload, try again later`);
  }

  return res.status(201).json(new ApiResponse(201, data, "Post uploaded"));
});

exports.handleGetProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById({ _id: id });

  if (!user) {
    throw new ApiError(404, `User not found`);
  }

  const posts = await Post.find({ createdBy: id }).select("-password");

  const updatedPost = { user, posts };

  return res
    .status(200)
    .json(new ApiResponse(200, updatedPost, "Profile fetched successfully"));
});

exports.handleGetExplorePage = asyncHandler(async (req, res) => {
  const posts = await Post.find({ visibility: "public" });

  if (posts.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, post, "All public post fetched"));
  }

  const userId = posts.map((item) => item.createdBy);
  const postUser = await User.find({ _id: { $in: userId } }).select(
    "-password"
  );

  const postWithUser = posts.map((post) => {
    const user = postUser.map((u) => {
      if (u._id.toString() === post.createdBy.toString()) {
        return u;
      }
    });
    return {
      ...post.toObject(),
      user,
    };
  });

  return res
    .status(200)
    .json(new ApiResponse(200, postWithUser, "All public post fetched"));
});

exports.handleGetSinglePost = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const post = await Post.findById({ _id: id });
  const userId = post.createdBy;
  const user = await User.findById({ _id: userId }).select("-password");

  const comment = await Comment.find({ post: id }).sort({ createdAt: -1 });
  const commentUserId = comment.map((item) => item.user);
  const commentUser = await User.find({ _id: { $in: commentUserId } }).select(
    "-password"
  );

  const commentWithUser = comment.map((item) => {
    const user = commentUser.find(
      (u) => u._id.toString() === item.user.toString()
    );
    return {
      ...item.toObject(),
      user,
    };
  });

  const postWithUser = {
    ...post.toObject(),
    ...user.toObject(),
    commentWithUser,
  };

  if (!post) {
    throw new ApiError(404, "No post found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, postWithUser, "Post fetched"));
});

exports.handleAddFriends = asyncHandler(async (req, res) => {
  const { friendId } = req.body;
  const { id } = req.user;

  if (!friendId) throw new ApiError(400, "Friend id missing");
  if (friendId === id) throw new ApiError(400, "User cannot add themselves");

  const friend = await User.findById(friendId);
  const user = await User.findById(id);

  if (!user || !friend) throw new ApiError(404, "User or friend doesnot exist");

  if (user.friendList.includes(friendId))
    throw new ApiError(400, "Already a friend");

  user.friendList.push(friendId);
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "Friend added successfully"));
});

exports.handleGetFeed = asyncHandler(async (req, res) => {
  const { id } = req.user;

  const user = await User.findById(id);
  if (!user) throw new ApiError(404, "User not found");

  const friendList = user.friendList;

  const posts = await Post.find({
    createdBy: { $in: [...friendList, id] },
  }).sort({ createdAt: -1 });
  if (posts.length === 0)
    return res
      .status(200)
      .json(new ApiResponse(200, posts, "All post fetched successfully"));

  const userId = posts.map((item) => item.createdBy.toString());

  const postUser = await User.find({ _id: { $in: userId } }).select(
    "-password"
  );

  const postWithUser = posts.map((post) => {
    const user = postUser.find(
      (u) => u._id.toString() === post.createdBy.toString()
    );
    return {
      ...post.toObject(),
      user: user,
    };
  });

  return res
    .status(200)
    .json(new ApiResponse(200, postWithUser, "All post fetched successfully"));
});

exports.handleGetPeople = asyncHandler(async (req, res) => {
  const { id } = req.user;

  const user = await User.findById(id);
  if (!user) throw new ApiError("404", "No user found");

  const friends = user.friendList;

  const people = await User.find({ _id: { $nin: [...friends, id] } }).select(
    "-password"
  );
  return res
    .status(200)
    .json(new ApiResponse(200, people, "All post fetched successfully"));
});

exports.handleGerAllFriends = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) throw new ApiError(404, "User not found");

  const friends = user.friendList;
  const userFriends = await User.find({ _id: { $in: friends } }).select(
    "-password"
  );
  if (userFriends.length < 0)
    return res
      .status(200)
      .json(new ApiResponse("200", [], "Friends Fetched Sucessfully!"));
  return res
    .status(200)
    .json(new ApiResponse("200", userFriends, "Friends Fetched Sucessfully!"));
});

exports.handleUnfollowUser = asyncHandler(async (req, res) => {
  const { id } = req.user;
  const { friendId } = req.params;

  const user = await User.findById(id);

  const userFriendExists = user.friendList.some(
    (friend) => friend.toString() === friendId
  );

  if (!userFriendExists) throw new ApiError(404, "No friend found");

  const userUpdate = await User.findByIdAndUpdate(
    id,
    { $pull: { friendList: friendId } },
    { new: true }
  );

  if (!userUpdate) throw new ApiError("500", "Error while removing friend");

  return res.status(201).json(new ApiResponse(201, userUpdate, "Unfollowed"));
});

exports.handleLikePost = asyncHandler(async (req, res) => {
  const { id } = req.user;
  const { postId } = req.params;

  const post = await Post.findById(postId);
  if (!post) throw new ApiError(404, "Post not found");

  if (post.likes.includes(id)) {
    return res
      .status(400)
      .json(new ApiResponse(400, "User has already liked this post"));
  }
  post.likes.push(id);
  post.likeCount = post.likeCount + 1;

  await post.save();

  const userId = post.createdBy;

  createNotification("like", userId, postId);
  return res.status(201).json(new ApiResponse(201, [], "Liked post"));
});

exports.handlePostComment = asyncHandler(async (req, res) => {
  const { id } = req.user;
  const { postId } = req.params;
  const { comment } = req.body;

  // Validate comment is not empty
  if (!comment || !comment.trim()) {
    throw new ApiError(400, "Comment cannot be empty");
  }

  const user = await User.findById(id);
  if (!user) throw new ApiError(404, "No user found");

  const post = await Post.findById(postId);
  if (!post) throw new ApiError(404, "No post found");

  const userId = post.createdBy;

  // Analyze the comment using Perspective API
  let analysis = null;
  try {
    analysis = await analyzeText(comment.trim());
  } catch (error) {
    console.error("Error analyzing comment:", error.message);
    // If it's an API key error, return a specific error message
    if (error.message.includes('API key')) {
      throw new ApiError(500, "Comment analysis service is not properly configured. Please contact the administrator.");
    }
    // For other errors, continue with comment creation without analysis
  }

  const comments = await Comment.create({
    user: id,
    post: postId,
    comment: comment.trim(),
    analysis
  });

  if (!comments) throw new ApiError(500, "Error while creating comment");

  post.comments.push(comments._id);
  await post.save();
  createNotification("comment", userId, postId);
  return res.status(201).json(new ApiResponse(201, [], "Commented on post"));
});

exports.handleGetNotification = asyncHandler(async (req, res) => {
  const { id } = req.user;

  const notification = await Notification.find({ toUser: id }).sort({
    createdAt: -1,
  });
  if (notification.length === 0)
    return res.status(200).json(new ApiResponse(200, [], "No Notification"));

  return res
    .status(200)
    .json(new ApiResponse(200, notification, "No Notification"));
});

// Controller function to fetch user data
exports.getUserData = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming the user ID is available in the request object

    // Fetch user data from the database
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Fetch user's posts, comments, and likes
    const posts = await Post.find({ createdBy: userId });
    const comments = await Comment.find({ user: userId });
    const likes = posts.reduce((total, post) => total + post.likes.length, 0);

    // Construct the user data object
    const userData = {
      comments: comments.map((comment) => comment.comment),
      captions: posts.map((post) => post.caption),
      likes: likes,
      posts: posts.map((post) => post._id),
    };

    res.status(200).json({ data: userData });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ error: "Failed to fetch user data" });
  }
};

// Controller function to fetch the total number of users
exports.getUserCount = asyncHandler(async (req, res) => {
  try {
    const userCount = await User.countDocuments(); // Count all users in the database
    res
      .status(200)
      .json(
        new ApiResponse(200, { userCount }, "User count fetched successfully")
      );
  } catch (error) {
    console.error("Error fetching user count:", error);
    res
      .status(500)
      .json(new ApiResponse(500, null, "Failed to fetch user count"));
  }
});
