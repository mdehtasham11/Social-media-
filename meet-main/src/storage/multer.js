const multer = require("multer");
const path = require("path");
const fs = require("fs");
const ApiError = require("../utils/ApiError");

const supportedImageTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
]);

const isSupportedImageFile = (file) => {
  return supportedImageTypes.has(file?.mimetype);
};

const fileFilter = (req, file, cb) => {
  if (isSupportedImageFile(file)) {
    cb(null, true);
    return;
  }

  cb(
    new ApiError(
      400,
      "Unsupported image format. Please upload a JPG, PNG, GIF, or WEBP image. RAW camera files like ARW cannot be previewed in the browser."
    )
  );
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "../../uploads");
    
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    return cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    return cb(null, `${Date.now()}-${file.originalname}`);
  },
});

module.exports = {
  fileFilter,
  isSupportedImageFile,
  storage,
};
