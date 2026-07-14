const assert = require("node:assert/strict");
const test = require("node:test");
const { isSupportedImageFile } = require("../src/storage/multer");

test("isSupportedImageFile accepts browser-renderable image formats", () => {
  assert.equal(isSupportedImageFile({ mimetype: "image/jpeg" }), true);
  assert.equal(isSupportedImageFile({ mimetype: "image/png" }), true);
  assert.equal(isSupportedImageFile({ mimetype: "image/gif" }), true);
  assert.equal(isSupportedImageFile({ mimetype: "image/webp" }), true);
});

test("isSupportedImageFile rejects camera RAW files", () => {
  assert.equal(
    isSupportedImageFile({
      mimetype: "image/x-sony-arw",
      originalname: "DSC08700.ARW",
    }),
    false
  );
});
