const mongoose = require("mongoose");

const messageSchema = mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

messageSchema.index({ sender: 1, receiver: 1, createdAt: 1 });
messageSchema.index({ receiver: 1, readAt: 1 });

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
