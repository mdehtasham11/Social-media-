const assert = require("node:assert/strict");
const test = require("node:test");
const {
  buildLocalUploadResponse,
  buildCloudinaryConfig,
  getCloudinaryUploadErrorMessage,
  getMissingCloudinaryKeys,
} = require("../src/storage/cloudnary");

test("buildCloudinaryConfig trims values and supports the legacy cloud name key", () => {
  const config = buildCloudinaryConfig({
    CLOUDINARY_NAME: " demo-cloud ",
    CLOUDINARY_API_KEY: " api-key ",
    CLOUDINARY_API_SECRET: " api-secret ",
  });

  assert.deepEqual(config, {
    cloud_name: "demo-cloud",
    api_key: "api-key",
    api_secret: "api-secret",
  });
});

test("buildCloudinaryConfig prefers CLOUDINARY_CLOUD_NAME when both keys exist", () => {
  const config = buildCloudinaryConfig({
    CLOUDINARY_CLOUD_NAME: "dashboard-name",
    CLOUDINARY_NAME: "old-name",
    CLOUDINARY_API_KEY: "api-key",
    CLOUDINARY_API_SECRET: "api-secret",
  });

  assert.equal(config.cloud_name, "dashboard-name");
});

test("getMissingCloudinaryKeys reports missing upload configuration", () => {
  assert.deepEqual(
    getMissingCloudinaryKeys({
      cloud_name: "",
      api_key: "api-key",
      api_secret: undefined,
    }),
    ["CLOUDINARY_NAME", "CLOUDINARY_API_SECRET"]
  );
});

test("getCloudinaryUploadErrorMessage explains invalid cloud_name errors", () => {
  const message = getCloudinaryUploadErrorMessage({
    http_code: 401,
    message: "Invalid cloud_name demo",
  });

  assert.match(message, /CLOUDINARY_NAME/);
  assert.match(message, /Cloudinary dashboard/);
});

test("buildLocalUploadResponse returns a URL for locally stored uploads", () => {
  const response = buildLocalUploadResponse({
    path: "C:\\project\\uploads\\my photo.jpg",
    filename: "my photo.jpg",
  });

  assert.equal(response.secure_url, "/uploads/my%20photo.jpg");
  assert.equal(response.local, true);
});

test("buildLocalUploadResponse can include the backend base URL", () => {
  const response = buildLocalUploadResponse(
    {
      path: "C:\\project\\uploads\\my photo.jpg",
      filename: "my photo.jpg",
    },
    "http://localhost:8002/"
  );

  assert.equal(response.secure_url, "http://localhost:8002/uploads/my%20photo.jpg");
});
