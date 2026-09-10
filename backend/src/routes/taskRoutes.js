const express = require("express");

const {
  createTask,
  getProjectTasks,
  getTask,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

// Create task
router.post("/", createTask);

// Get all tasks for a project
router.get("/project/:projectId", getProjectTasks);

// Get single task
router.get("/:id", getTask);

// Update task
router.put("/:id", updateTask);

// Delete task
router.delete("/:id", deleteTask);

module.exports = router;