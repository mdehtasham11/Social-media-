const express = require("express");
const multer = require("multer");
const { storage } = require("../storage/multer");
const {
  handlePostUpload,
  handleGetProfile,
  handleGetExplorePage,
  handleGetSinglePost,
  handleAddFriends,
  handleGetFeed,
  handleGetPeople,
  handleGerAllFriends,
  handleUnfollowUser,
  handleLikePost,
  handlePostComment,
  handleGetNotification,
  getUserData,
  getUserCount,
} = require("../controller/user.controller");
const { user } = require("../middlewares/protectedRoutes");
const router = express.Router();

const upload = multer({ storage: storage });

router.route("/upload").post(user, upload.single("image"), handlePostUpload);
router.route("/profile/:id").get(user, handleGetProfile);
router.route("/explore").get(user, handleGetExplorePage);
router.route("/post/:id").get(user, handleGetSinglePost);
router.route("/addFriends").post(user, handleAddFriends);
router.route("/feed").get(user, handleGetFeed);
router.route("/people").get(user, handleGetPeople);
router.route("/friend/:id").get(user, handleGerAllFriends);
router.route("/unfollow/:friendId").post(user, handleUnfollowUser);
router.route("/like/:postId").get(user, handleLikePost);
router.route("/comment/:postId").post(user, handlePostComment);
router.route("/notification").get(user, handleGetNotification);
router.route("/data").get(user, getUserData);
router.route("/count").get(user, getUserCount);

router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    message: err.message || "Internal Server Error",
  });
});

module.exports = router;
