const express = require("express");

const {
  addComment,
  getProjectComments,
  deleteComment,
} = require("../controllers/commentController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

// Add comment
router.post("/project/:projectId", addComment);

// Get project comments
router.get("/project/:projectId", getProjectComments);

// Delete comment
router.delete("/:id", deleteComment);

module.exports = router;