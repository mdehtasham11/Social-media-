export const SUPPORTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

export const validateImageFile = (file) => {
  if (!file) {
    return "Please select an image.";
  }

  if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
    return "Please upload a JPG, PNG, GIF, or WEBP image. RAW camera files like ARW cannot be previewed in the browser.";
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return "Please upload an image smaller than 10MB.";
  }

  return "";
};
