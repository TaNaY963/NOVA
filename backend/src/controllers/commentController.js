const Comment = require("../models/Comment");
const Project = require("../models/Project");

// Add comment
const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const { projectId } = req.params;

    if (!text || !text.trim()) {
      return res.status(400).json({
        message: "Comment cannot be empty",
      });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // Check project access
    const isMember =
      project.owner.toString() === req.user._id.toString() ||
      project.members.some(
        (member) => member.toString() === req.user._id.toString()
      );

    if (!isMember) {
      return res.status(403).json({
        message: "You do not have access to this project",
      });
    }

    const comment = await Comment.create({
      project: projectId,
      user: req.user._id,
      text: text.trim(),
    });

    const populatedComment = await Comment.findById(comment._id).populate(
      "user",
      "name email"
    );

    res.status(201).json({
      message: "Comment added successfully",
      comment: populatedComment,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};


// Get project comments
const getProjectComments = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // Check project access
    const isMember =
      project.owner.toString() === req.user._id.toString() ||
      project.members.some(
        (member) => member.toString() === req.user._id.toString()
      );

    if (!isMember) {
      return res.status(403).json({
        message: "You do not have access to this project",
      });
    }

    const comments = await Comment.find({
      project: projectId,
    })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json({
      comments,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};


// Delete comment
const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    const project = await Project.findById(comment.project);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // Only comment author or project owner can delete
    const isAuthor =
      comment.user.toString() === req.user._id.toString();

    const isOwner =
      project.owner.toString() === req.user._id.toString();

    if (!isAuthor && !isOwner) {
      return res.status(403).json({
        message: "You cannot delete this comment",
      });
    }

    await comment.deleteOne();

    res.json({
      message: "Comment deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};


module.exports = {
  addComment,
  getProjectComments,
  deleteComment,
};