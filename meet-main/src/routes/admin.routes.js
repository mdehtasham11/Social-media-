const express = require("express");
const router = express.Router();
const {
    getAdminAnalysis,
    getAnalysisDetails,
    getAllUsers,
    getAllComments,
    getAllPosts,
    deletePost,
    updatePostStatus,
    getPostComments,
    getUserProfile,
    updateUserStatus,
    deleteUser,
    deleteComment
} = require("../controller/admin.controller");

// Route to fetch admin analysis data
router.get("/analysis", getAdminAnalysis);
router.get("/analysis/:type", getAnalysisDetails);

// User management routes
router.get("/users", getAllUsers);
router.get("/users/:userId", getUserProfile);
router.patch("/users/:userId/status", updateUserStatus);
router.delete("/users/:userId", deleteUser);

// Post management routes
router.get("/posts", getAllPosts);
router.get("/posts/:postId/comments", getPostComments);
router.delete("/posts/:postId", deletePost);
router.patch("/posts/:postId/status", updatePostStatus);

// Comment management routes
router.get("/comments", getAllComments);
router.delete("/comments/:commentId", deleteComment);

module.exports = router;
