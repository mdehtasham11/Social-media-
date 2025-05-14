const express = require("express");
const router = express.Router();
const PerspectiveAPI = require("../utils/PerspectiveAPI");

const API_KEY = process.env.PERSPECTIVE_API_KEY;
const perspective = new PerspectiveAPI(API_KEY);

router.post("/analyze-text", async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: "Text is required for analysis." });
  }

  try {
    const results = await perspective.analyze_text(text);
    res.json({ success: true, results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/analyze-comment", async (req, res) => {
  try {
    const { comment } = req.body;
    const analysis = await perspective.analyzeComment(comment);
    res.json({ success: true, analysis });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/analyze-caption", async (req, res) => {
  try {
    const { caption } = req.body;
    const analysis = await perspective.analyzeCaption(caption);
    res.json({ success: true, analysis });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
