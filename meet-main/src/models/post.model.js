const mongoose = require("mongoose");

const postSchema = mongoose.Schema(
  {
    caption: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    visibility: {
      type: String,
      enum: ["friend", "public"],
      required: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    likeCount: {
      type: Number,
      default: 0,
    },
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    reports: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        reason: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isSpam: {
      type: Boolean,
      default: false,
    },
    isSafe: {
      type: Boolean,
      default: false,
    },
    analysis: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    }
  },
  { timestamps: true }
);

// Indexes for frequently queried fields
postSchema.index({ createdBy: 1, createdAt: -1 }); // feed & profile queries
postSchema.index({ visibility: 1, createdAt: -1 }); // explore page

const Post = mongoose.model("Post", postSchema);
module.exports = Post;
