const assert = require("node:assert/strict");
const test = require("node:test");
const { assertProfileImageFile } = require("../src/services/profileService");

test("assertProfileImageFile accepts an uploaded profile image", () => {
  assert.doesNotThrow(() =>
    assertProfileImageFile({
      mimetype: "image/png",
      path: "uploads/avatar.png",
    })
  );
});

test("assertProfileImageFile rejects a missing profile image", () => {
  assert.throws(() => assertProfileImageFile(null), /Profile image is required/);
});
