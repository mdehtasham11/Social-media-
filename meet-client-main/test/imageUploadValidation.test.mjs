import assert from "node:assert/strict";
import test from "node:test";
import { validateImageFile } from "../src/utils/imageUploadValidation.js";

test("validateImageFile accepts browser-renderable image files", () => {
  assert.equal(validateImageFile({ type: "image/jpeg", size: 1024 }), "");
});

test("validateImageFile rejects camera RAW files", () => {
  assert.match(
    validateImageFile({ type: "image/x-sony-arw", size: 1024 }),
    /RAW camera files/
  );
});

test("validateImageFile rejects files larger than 10MB", () => {
  assert.match(
    validateImageFile({ type: "image/jpeg", size: 11 * 1024 * 1024 }),
    /smaller than 10MB/
  );
});
