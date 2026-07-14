const ApiError = require("../utils/ApiError");

function assertProfileImageFile(file) {
  if (!file) {
    throw new ApiError(400, "Profile image is required");
  }

  return true;
}

module.exports = {
  assertProfileImageFile,
};
