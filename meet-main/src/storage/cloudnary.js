const fs = require("fs/promises");
const path = require("path");
const cloudinary = require("cloudinary").v2;
const ApiError = require("../utils/ApiError");
require("dotenv").config();

const getEnvValue = (env, keys) => {
  const value = keys.map((key) => env[key]).find(Boolean);
  return typeof value === "string" ? value.trim() : value;
};

const buildCloudinaryConfig = (env = process.env) => ({
  cloud_name: getEnvValue(env, ["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_NAME"]),
  api_key: getEnvValue(env, ["CLOUDINARY_API_KEY"]),
  api_secret: getEnvValue(env, ["CLOUDINARY_API_SECRET"]),
});

const getMissingCloudinaryKeys = (config) => {
  const missing = [];

  if (!config.cloud_name) missing.push("CLOUDINARY_NAME");
  if (!config.api_key) missing.push("CLOUDINARY_API_KEY");
  if (!config.api_secret) missing.push("CLOUDINARY_API_SECRET");

  return missing;
};

const cloudinaryConfig = buildCloudinaryConfig();

cloudinary.config(cloudinaryConfig);

const getCloudinaryUploadErrorMessage = (error) => {
  if (
    error?.http_code === 401 &&
    /invalid cloud_name/i.test(error.message || "")
  ) {
    return "Invalid Cloudinary cloud name. Set CLOUDINARY_NAME in meet-main/.env to the exact cloud name from your Cloudinary dashboard.";
  }

  if (error?.http_code === 401) {
    return "Cloudinary credentials are invalid. Check CLOUDINARY_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in meet-main/.env.";
  }

  return "Image upload service failed. Please try again later.";
};

const assertCloudinaryConfigured = () => {
  const missing = getMissingCloudinaryKeys(cloudinaryConfig);

  if (missing.length > 0) {
    throw new ApiError(
      500,
      `Cloudinary is not configured. Missing: ${missing.join(", ")}`
    );
  }
};

const removeLocalFile = async (filePath) => {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.warn(`Could not remove temporary upload: ${error.message}`);
    }
  }
};

const normalizeUploadFile = (file) => {
  if (typeof file === "string") {
    return {
      path: file,
      filename: path.basename(file),
    };
  }

  return file;
};

const buildLocalUploadResponse = (file, baseUrl = "") => {
  const uploadFile = normalizeUploadFile(file);
  const filename = uploadFile.filename || path.basename(uploadFile.path);
  // Encode each path segment properly for URLs
  const encodedFilename = encodeURIComponent(filename);
  const urlPath = `/uploads/${encodedFilename}`;
  const normalizedBaseUrl = baseUrl.replace(/\/$/, "");
  // Always include the base URL so the frontend gets an absolute URL
  // that works regardless of where the client is hosted
  const secureUrl = normalizedBaseUrl ? `${normalizedBaseUrl}${urlPath}` : urlPath;

  return {
    secure_url: secureUrl,
    url: secureUrl,
    local: true,
  };
};

const shouldUseLocalFallback = (env = process.env) => {
  return env.LOCAL_UPLOAD_FALLBACK !== "false";
};

const uploadLocalFile = async (file, baseUrl = "") => {
  const uploadFile = normalizeUploadFile(file);
  assertCloudinaryConfigured();

  try {
    const response = await cloudinary.uploader.upload(uploadFile.path);
    await removeLocalFile(uploadFile.path);
    return response;
  } catch (error) {
    if (shouldUseLocalFallback()) {
      console.warn(
        `${getCloudinaryUploadErrorMessage(error)} Falling back to local uploads.`
      );
      return buildLocalUploadResponse(uploadFile, baseUrl);
    }

    throw new ApiError(500, getCloudinaryUploadErrorMessage(error));
  }
};

module.exports = cloudinary;
module.exports.buildLocalUploadResponse = buildLocalUploadResponse;
module.exports.buildCloudinaryConfig = buildCloudinaryConfig;
module.exports.getCloudinaryUploadErrorMessage = getCloudinaryUploadErrorMessage;
module.exports.getMissingCloudinaryKeys = getMissingCloudinaryKeys;
module.exports.uploadLocalFile = uploadLocalFile;
