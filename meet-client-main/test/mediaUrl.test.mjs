import assert from "node:assert/strict";
import test from "node:test";

globalThis.import = globalThis.import || {};

const { getMediaUrl } = await import("../src/utils/mediaUrl.js");

test("getMediaUrl keeps Cloudinary URLs unchanged", () => {
  const url = "https://res.cloudinary.com/demo/image/upload/sample.jpg";

  assert.equal(getMediaUrl(url), url);
});

test("getMediaUrl resolves local upload paths against the backend", () => {
  assert.equal(
    getMediaUrl("/uploads/my%20photo.jpg"),
    "http://localhost:8002/uploads/my%20photo.jpg"
  );
});

test("getMediaUrl returns fallback for empty URLs", () => {
  assert.equal(getMediaUrl("", "fallback.png"), "fallback.png");
});
