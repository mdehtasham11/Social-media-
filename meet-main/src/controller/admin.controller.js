const User = require("../models/user.model");
const Post = require("../models/post.model");
const Comment = require("../models/comment.model");
const { analyzeText } = require("../services/perspectiveService");
const { asyncHandler } = require("../common/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Controller function to fetch admin analysis data
exports.getAdminAnalysis = async (req, res) => {
  try {
    // Get total users count
    const totalUsers = await User.countDocuments();
    
    // Get active users (users who have logged in within the last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeUsers = await User.countDocuments({ lastLogin: { $gte: thirtyDaysAgo } });
    
    // Get total posts count
    const totalPosts = await Post.countDocuments();
    
    // Get total comments count
    const totalComments = await Comment.countDocuments();
    
    // Get analysis statistics
    const analysisStats = {
      totalAnalyses: totalPosts + totalComments,
      textAnalyses: totalPosts,
      commentAnalyses: totalComments,
      captionAnalyses: await Post.countDocuments({ hasCaption: true })
    };

    res.status(200).json({ 
      success: true,
      data: {
        userStats: {
          totalUsers,
          activeUsers
        },
        contentStats: {
          totalPosts,
          totalComments
        },
        analysisStats
      }
    });
  } catch (error) {
    console.error("Error fetching admin analysis:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch admin analysis data" 
    });
  }
};

// Controller function to fetch analysis details
exports.getAnalysisDetails = async (req, res) => {
  try {
    const { type } = req.params;
    let data = [];

    switch (type) {
      case 'total':
        // Get all analyzed content
        const posts = await Post.find({ analysis: { $exists: true } })
          .select('caption analysis createdAt')
          .sort({ createdAt: -1 });
        const comments = await Comment.find({ analysis: { $exists: true } })
          .select('comment analysis createdAt')
          .sort({ createdAt: -1 });
        data = [...posts, ...comments];
        break;

      case 'text':
        // Get analyzed posts
        data = await Post.find({ analysis: { $exists: true } })
          .select('caption analysis createdAt')
          .sort({ createdAt: -1 });
        break;

      case 'comment':
        // Get analyzed comments
        data = await Comment.find({ analysis: { $exists: true } })
          .select('comment analysis createdAt')
          .sort({ createdAt: -1 });
        break;

      case 'caption':
        // Get analyzed captions
        data = await Post.find({ hasCaption: true, analysis: { $exists: true } })
          .select('caption analysis createdAt')
          .sort({ createdAt: -1 });
        break;

      default:
        return res.status(400).json({
          success: false,
          error: "Invalid analysis type"
        });
    }

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error("Error fetching analysis details:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch analysis details"
    });
  }
};

// Get all users with search, filter, and sort
exports.getAllUsers = asyncHandler(async (req, res) => {
  const { search, sort, status } = req.query;
  
  let query = {};
  
  // Search functionality
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { userName: { $regex: search, $options: 'i' } }
    ];
  }
  
  // Filter by status
  if (status) {
    query.status = status;
  }
  
  // Sort functionality
  let sortOption = {};
  if (sort) {
    switch (sort) {
      case 'name_asc':
        sortOption = { name: 1 };
        break;
      case 'name_desc':
        sortOption = { name: -1 };
        break;
      case 'date_asc':
        sortOption = { createdAt: 1 };
        break;
      case 'date_desc':
        sortOption = { createdAt: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }
  } else {
    sortOption = { createdAt: -1 };
  }

  const users = await User.find(query)
    .select('-password')
    .sort(sortOption);

  // Get post count for each user
  const usersWithPostCount = await Promise.all(
    users.map(async (user) => {
      const postCount = await Post.countDocuments({ createdBy: user._id });
      return {
        ...user.toObject(),
        postCount
      };
    })
  );

  return res.status(200).json(
    new ApiResponse(200, usersWithPostCount, "Users fetched successfully")
  );
});

// Get user profile details
exports.getUserProfile = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId).select('-password');
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const postCount = await Post.countDocuments({ createdBy: userId });
  const commentCount = await Comment.countDocuments({ user: userId });

  const userProfile = {
    ...user.toObject(),
    postCount,
    commentCount,
    joinDate: user.createdAt
  };

  return res.status(200).json(
    new ApiResponse(200, userProfile, "User profile fetched successfully")
  );
});

// Ban/Suspend/Unban user
exports.updateUserStatus = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { status, reason } = req.body;

  if (!['active', 'suspended', 'banned'].includes(status)) {
    throw new ApiError(400, "Invalid status value");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // If unbanning (changing from banned to active)
  if (user.status === 'banned' && status === 'active') {
    user.status = 'active';
    user.statusReason = '';
    user.statusUpdatedAt = new Date();
    user.banHistory = user.banHistory || [];
    user.banHistory.push({
      action: 'unbanned',
      reason: reason || 'No reason provided',
      date: new Date()
    });
  } else {
    // For ban or suspend actions
    user.status = status;
    user.statusReason = reason || '';
    user.statusUpdatedAt = new Date();
    
    // Add to ban history if banning
    if (status === 'banned') {
      user.banHistory = user.banHistory || [];
      user.banHistory.push({
        action: 'banned',
        reason: reason || 'No reason provided',
        date: new Date()
      });
    }
  }

  await user.save();

  return res.status(200).json(
    new ApiResponse(200, user, `User ${status === 'active' ? 'unbanned' : status} successfully`)
  );
});

// Delete user
exports.deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // Delete user's posts
  await Post.deleteMany({ createdBy: userId });
  
  // Delete user's comments
  await Comment.deleteMany({ user: userId });
  
  // Delete the user
  const user = await User.findByIdAndDelete(userId);
  
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json(
    new ApiResponse(200, null, "User deleted successfully")
  );
});

// Controller function to fetch all comments with user details
exports.getAllComments = async (req, res) => {
    try {
        // Fetch all comments with user details and analysis
        const comments = await Comment.find()
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .lean();

        // Process each comment to ensure it has analysis
        const processedComments = await Promise.all(comments.map(async (comment) => {
            // If comment doesn't have analysis, analyze it
            if (!comment.analysis) {
                try {
                    // Skip analysis for empty comments
                    if (!comment.comment || !comment.comment.trim()) {
                        console.warn(`Skipping analysis for empty comment ${comment._id}`);
                        return { ...comment, analysis: null };
                    }
                    
                    const analysis = await analyzeText(comment.comment.trim());
                    // Update the comment in the database
                    await Comment.findByIdAndUpdate(comment._id, { analysis });
                    return { ...comment, analysis };
                } catch (error) {
                    console.error(`Error analyzing comment ${comment._id}:`, error);
                    return { ...comment, analysis: null };
                }
            }

            // If analysis is stored as a string, parse it
            if (typeof comment.analysis === 'string') {
                try {
                    comment.analysis = JSON.parse(comment.analysis);
                } catch (e) {
                    console.error('Error parsing analysis:', e);
                    comment.analysis = null;
                }
            }

            return comment;
        }));

        res.status(200).json({
            success: true,
            data: processedComments
        });
    } catch (error) {
        console.error("Error fetching comments:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch comments"
        });
    }
};

// Controller function to fetch all posts with user details and moderation data
exports.getAllPosts = async (req, res) => {
    try {
        // Fetch all posts with user details, likes, comments, and reports
        const posts = await Post.find()
            .populate('createdBy', 'name email')
            .populate({
                path: 'comments',
                populate: {
                    path: 'user',
                    select: 'name email'
                }
            })
            .populate({
                path: 'likes',
                select: '_id'
            })
            .populate({
                path: 'reports.user',
                select: 'name'
            })
            .sort({ createdAt: -1 })
            .lean();

        // Process each post to include moderation data
        const processedPosts = posts.map(post => ({
            ...post,
            user: post.createdBy,
            text: post.caption,
            likeCount: post.likes?.length || 0,
            commentCount: post.comments?.length || 0,
            reportCount: post.reports?.length || 0,
            isSpam: post.isSpam || false,
            isSafe: post.isSafe || false,
            comments: post.comments || []
        }));

        res.status(200).json({
            success: true,
            data: processedPosts
        });
    } catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch posts"
        });
    }
};

// Controller function to delete a post
exports.deletePost = async (req, res) => {
    try {
        const { postId } = req.params;
        
        // Delete the post and all its associated comments
        await Post.findByIdAndDelete(postId);
        await Comment.deleteMany({ post: postId });

        res.status(200).json({
            success: true,
            message: "Post deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting post:", error);
        res.status(500).json({
            success: false,
            error: "Failed to delete post"
        });
    }
};

// Controller function to mark a post as spam or safe
exports.updatePostStatus = async (req, res) => {
    try {
        const { postId } = req.params;
        const { status } = req.body; // 'spam' or 'safe'

        const update = {
            isSpam: status === 'spam',
            isSafe: status === 'safe'
        };

        await Post.findByIdAndUpdate(postId, update);

        res.status(200).json({
            success: true,
            message: `Post marked as ${status} successfully`
        });
    } catch (error) {
        console.error("Error updating post status:", error);
        res.status(500).json({
            success: false,
            error: "Failed to update post status"
        });
    }
};

// Controller function to get all comments for a specific post
exports.getPostComments = async (req, res) => {
    try {
        const { postId } = req.params;

        const comments = await Comment.find({ post: postId })
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json({
            success: true,
            data: comments
        });
    } catch (error) {
        console.error("Error fetching post comments:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch post comments"
        });
    }
};

// Controller function to delete a comment
exports.deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;

        // Find the comment first to get the post ID
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({
                success: false,
                error: "Comment not found"
            });
        }

        // Remove the comment from the post's comments array
        await Post.findByIdAndUpdate(
            comment.post,
            { $pull: { comments: commentId } }
        );

        // Delete the comment
        await Comment.findByIdAndDelete(commentId);

        res.status(200).json({
            success: true,
            message: "Comment deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting comment:", error);
        res.status(500).json({
            success: false,
            error: "Failed to delete comment"
        });
    }
};
