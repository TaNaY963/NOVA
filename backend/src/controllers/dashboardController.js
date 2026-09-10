const Project = require("../models/Project");
const Task = require("../models/Task");
const Comment = require("../models/Comment");

const getDashboard = async (req, res) => {
  try {
    const accessibleProjects = await Project.find({
      $or: [
        { owner: req.user._id },
        { members: req.user._id },
      ],
    })
      .select("_id name status createdAt")
      .sort({ createdAt: -1 });

    const projectIds = accessibleProjects.map((project) => project._id);

    const tasks = await Task.find({
      project: { $in: projectIds },
    })
      .select("_id title project status createdAt")
      .sort({ createdAt: -1 });

    const comments = await Comment.find({
      project: { $in: projectIds },
    })
      .select("_id project text createdAt")
      .populate("project", "name")
      .sort({ createdAt: -1 });

    const totalProjects = accessibleProjects.length;
    const activeProjects = accessibleProjects.filter(
      (project) => project.status === "active"
    ).length;
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(
      (task) => task.status === "completed"
    ).length;
    const overallCompletion =
      totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    const taskMap = tasks.reduce((acc, task) => {
      const projectId = task.project.toString();

      if (!acc[projectId]) {
        acc[projectId] = [];
      }

      acc[projectId].push(task);
      return acc;
    }, {});

    const projects = accessibleProjects.map((project) => {
      const projectTasks = taskMap[project._id.toString()] || [];
      const projectCompletedTasks = projectTasks.filter(
        (task) => task.status === "completed"
      ).length;
      const projectProgress =
        projectTasks.length === 0
          ? 0
          : Math.round(
              (projectCompletedTasks / projectTasks.length) * 100
            );

      return {
        _id: project._id,
        name: project.name,
        status: project.status,
        totalTasks: projectTasks.length,
        completedTasks: projectCompletedTasks,
        progress: projectProgress,
      };
    });

    const recentTasks = tasks.slice(0, 10).map((task) => ({
      type: "task",
      message: `Task created: ${task.title}`,
      createdAt: task.createdAt,
      project: {
        _id: task.project,
        name:
          accessibleProjects.find(
            (project) => project._id.toString() === task.project.toString()
          )?.name || "Project",
      },
    }));

    const recentComments = comments.slice(0, 10).map((comment) => ({
      type: "comment",
      message: "New comment added",
      createdAt: comment.createdAt,
      project: {
        _id: comment.project?._id || comment.project,
        name: comment.project?.name || "Project",
      },
    }));

    const recentActivity = [...recentTasks, ...recentComments]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);

    res.json({
      stats: {
        totalProjects,
        activeProjects,
        totalTasks,
        completedTasks,
        overallCompletion,
      },
      projects,
      recentActivity,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  getDashboard,
};
