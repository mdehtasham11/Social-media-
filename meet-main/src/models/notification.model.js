const mongoose = require('mongoose');
const { Schema } = mongoose;

const notificationSchema = new Schema({
  type: {
    type: String,
    enum: ['like', 'comment', 'connect'],
    required: true
  },
  toUser: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  post: {
    type: Schema.Types.ObjectId,
    ref: 'Post'
  }
}, {timestamps: true});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
