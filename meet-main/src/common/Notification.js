const Notification = require("../models/notification.model");

const createNotification = async (type, toUser, post) => {
  try {
    Notification.create({
      type,
      toUser,
      post,
    });
  } catch (error) {
    console.error("Error creating notification:", error);
  }
};

module.exports = createNotification;
