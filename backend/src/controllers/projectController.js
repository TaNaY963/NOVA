const Project = require("../models/Project");
const User = require("../models/User");

// Create project
const createProject = async (req, res) => {
  try {
    const { name, description, status, startDate, dueDate } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Project name is required",
      });
    }

    const project = await Project.create({
      name,
      description,
      status,
      startDate,
      dueDate,
      owner: req.user._id,
      members: [req.user._id],
    });

    res.status(201).json({
      message: "Project created successfully",
      project,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Get user's projects
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { owner: req.user._id },
        { members: req.user._id },
      ],
    })
      .populate("owner", "name email")
      .populate("members", "name email")
      .sort({ createdAt: -1 });

    res.json({
      projects,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Get single project
const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("owner", "name email")
      .populate("members", "name email");

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const isMember =
      project.owner._id.toString() === req.user._id.toString() ||
      project.members.some(
        (member) => member._id.toString() === req.user._id.toString()
      );

    if (!isMember) {
      return res.status(403).json({
        message: "You do not have access to this project",
      });
    }

    res.json({
      project,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Update project
const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Only the project owner can update this project",
      });
    }

    const { name, description, status, startDate, dueDate } = req.body;

    project.name = name ?? project.name;
    project.description = description ?? project.description;
    project.status = status ?? project.status;
    project.startDate = startDate ?? project.startDate;
    project.dueDate = dueDate ?? project.dueDate;

    await project.save();

    res.json({
      message: "Project updated successfully",
      project,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Delete project
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Only the project owner can delete this project",
      });
    }

    await project.deleteOne();

    res.json({
      message: "Project deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
// Add member to project
const addProjectMember = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Member email is required",
      });
    }

    const project = await Project.findById(req.params.id);
    console.log("Project found:", project);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // Only owner can add members
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Only the project owner can add members",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user) {
      return res.status(404).json({
        message: "User with this email does not exist",
      });
    }

    // Don't add owner as member again
    if (user._id.toString() === project.owner.toString()) {
      return res.status(400).json({
        message: "Project owner is already a member",
      });
    }

    // Check if already a member
    const alreadyMember = project.members.some(
      (memberId) => memberId.toString() === user._id.toString()
    );

    if (alreadyMember) {
      return res.status(409).json({
        message: "User is already a project member",
      });
    }

    project.members.push(user._id);

    await project.save();

    const updatedProject = await Project.findById(project._id)
      .populate("owner", "name email")
      .populate("members", "name email");

    res.json({
      message: "Member added successfully",
      project: updatedProject,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};


// Remove member from project
const removeProjectMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // Only owner can remove members
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Only the project owner can remove members",
      });
    }

    const memberId = req.params.userId;

    // Don't allow removing the owner
    if (memberId === project.owner.toString()) {
      return res.status(400).json({
        message: "Project owner cannot be removed",
      });
    }

    const isMember = project.members.some(
      (member) => member.toString() === memberId
    );

    if (!isMember) {
      return res.status(404).json({
        message: "Member not found in this project",
      });
    }

    project.members = project.members.filter(
      (member) => member.toString() !== memberId
    );

    await project.save();

    const updatedProject = await Project.findById(project._id)
      .populate("owner", "name email")
      .populate("members", "name email");

    res.json({
      message: "Member removed successfully",
      project: updatedProject,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  addProjectMember,
  removeProjectMember,
};