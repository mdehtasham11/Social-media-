const mongoose = require("mongoose");

const handleDatabaseConnection = async (url) => {
  return mongoose.connect(url);
};

module.exports = handleDatabaseConnection;
