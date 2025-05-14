const express = require("express");
const router = express.Router();

// In-memory storage for comments (replace with database in production)
let comments = [];

// Get all comments
router.get("/", (req, res) => {
    res.json({ success: true, comments });
});

// Store a new comment
router.post("/", (req, res) => {
    try {
        const { text, analysis } = req.body;
        const newComment = {
            id: Date.now(),
            text,
            analysis,
            createdAt: new Date().toISOString()
        };
        comments.push(newComment);
        res.json({ success: true, comment: newComment });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete a comment
router.delete("/:id", (req, res) => {
    try {
        const commentId = parseInt(req.params.id);
        const initialLength = comments.length;
        comments = comments.filter(comment => comment.id !== commentId);
        
        if (comments.length === initialLength) {
            return res.status(404).json({ success: false, error: "Comment not found" });
        }
        
        res.json({ success: true, message: "Comment deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router; 