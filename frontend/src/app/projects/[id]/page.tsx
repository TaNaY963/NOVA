"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/src/lib/api";
import { useAuth } from "@/src/context/AuthContext";

type Member = {
    _id: string;
    name: string;
    email: string;
};

type Project = {
    _id: string;
    name: string;
    description: string;
    status: string;
    startDate?: string;
    dueDate?: string;
    owner: Member;
    members: Member[];
};

type Task = {
    _id: string;
    title: string;
    description: string;
    priority: "low" | "medium" | "high";
    status: "todo" | "in-progress" | "review" | "completed";
    dueDate?: string;
    assignedTo?: {
        _id: string;
        name: string;
        email: string;
    } | null;
};
type Comment = {
    _id: string;
    text: string;
    user: {
        _id: string;
        name: string;
        email: string;
    };
    createdAt: string;
};

export default function ProjectDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();

    const [project, setProject] = useState<Project | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);

    const [loading, setLoading] = useState(true);
    const [tasksLoading, setTasksLoading] = useState(true);

    const [error, setError] = useState("");
    const [taskError, setTaskError] = useState("");

    const [showTaskForm, setShowTaskForm] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    const [taskTitle, setTaskTitle] = useState("");
    const [taskDescription, setTaskDescription] = useState("");

    const [taskPriority, setTaskPriority] = useState<
        "low" | "medium" | "high"
    >("medium");

    const [taskStatus, setTaskStatus] = useState<
        "todo" | "in-progress" | "review" | "completed"
    >("todo");

    const [taskDueDate, setTaskDueDate] = useState("");

    const [taskSubmitting, setTaskSubmitting] = useState(false);


    const [memberEmail, setMemberEmail] = useState("");
    const [memberError, setMemberError] = useState("");
    const [memberLoading, setMemberLoading] = useState(false);
    const [removingMember, setRemovingMember] = useState("");

    const [comments, setComments] = useState<Comment[]>([]);
    const [commentText, setCommentText] = useState("");
    const [commentLoading, setCommentLoading] = useState(false);
    const [commentError, setCommentError] = useState("");
    const [commentsLoading, setCommentsLoading] = useState(true);
    const [deletingComment, setDeletingComment] = useState("");

    // =========================
    // FETCH PROJECT
    // =========================

    const fetchProject = async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await api.get(`/projects/${params.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setProject(response.data.project);
        } catch (error: any) {
            console.error("Project loading error:", error);

            setError(
                error.response?.data?.message ||
                "Unable to load project."
            );
        } finally {
            setLoading(false);
        }
    };


 useEffect(() => {
        if (params.id) {
            fetchProject();
            fetchTasks();
        }
    }, [params.id]);

    // =========================
    // FETCH TASKS
    // =========================

    const fetchTasks = async () => {
        try {
            setTasksLoading(true);

            const token = localStorage.getItem("token");

            const response = await api.get(
                `/tasks/project/${params.id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setTasks(response.data.tasks);
        } catch (error: any) {
            setTaskError(
                error.response?.data?.message ||
                "Unable to load tasks."
            );
        } finally {
            setTasksLoading(false);
        }
    };

    const fetchComments = async (projectId: string) => {
        try {
            setCommentsLoading(true);
            setCommentError("");

            const token = localStorage.getItem("token");

            const response = await api.get(
                `/comments/project/${projectId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setComments(response.data.comments || []);
        } catch (error: any) {
            console.error("Failed to fetch comments:", error);
            setComments([]);
            setCommentError(
                error.response?.data?.message || "Unable to load comments."
            );
        } finally {
            setCommentsLoading(false);
        }
    };

    useEffect(() => {
        if (project?._id) {
            fetchComments(project._id);
        }
    }, [project?._id]);


    // =========================
    // RESET TASK FORM
    // =========================

    const resetTaskForm = () => {
        setTaskTitle("");
        setTaskDescription("");
        setTaskPriority("medium");
        setTaskStatus("todo");
        setTaskDueDate("");
        setEditingTask(null);
        setShowTaskForm(false);
        setTaskError("");
    };

    // =========================
    // CREATE TASK
    // =========================

    const handleCreateTask = async (
        e: FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        setTaskError("");

        if (!taskTitle.trim()) {
            setTaskError("Task title is required.");
            return;
        }

        try {
            setTaskSubmitting(true);

            const token = localStorage.getItem("token");

            const response = await api.post(
                "/tasks",
                {
                    title: taskTitle,
                    description: taskDescription,
                    project: params.id,
                    priority: taskPriority,
                    status: taskStatus,
                    dueDate: taskDueDate || undefined,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setTasks((currentTasks) => [
                response.data.task,
                ...currentTasks,
            ]);

            resetTaskForm();
        } catch (error: any) {
            setTaskError(
                error.response?.data?.message ||
                "Unable to create task."
            );
        } finally {
            setTaskSubmitting(false);
        }
    };

    // =========================
    // EDIT TASK
    // =========================

    const handleEditTask = (task: Task) => {
        setEditingTask(task);

        setTaskTitle(task.title);
        setTaskDescription(task.description || "");
        setTaskPriority(task.priority);
        setTaskStatus(task.status);

        setTaskDueDate(
            task.dueDate
                ? new Date(task.dueDate)
                    .toISOString()
                    .split("T")[0]
                : ""
        );

        setShowTaskForm(true);
        setTaskError("");
    };

    // =========================
    // UPDATE TASK
    // =========================

    const handleUpdateTask = async (
        e: FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        if (!editingTask) return;

        setTaskError("");

        if (!taskTitle.trim()) {
            setTaskError("Task title is required.");
            return;
        }

        try {
            setTaskSubmitting(true);

            const token = localStorage.getItem("token");

            const response = await api.put(
                `/tasks/${editingTask._id}`,
                {
                    title: taskTitle,
                    description: taskDescription,
                    priority: taskPriority,
                    status: taskStatus,
                    dueDate: taskDueDate || undefined,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setTasks((currentTasks) =>
                currentTasks.map((task) =>
                    task._id === editingTask._id
                        ? response.data.task
                        : task
                )
            );

            resetTaskForm();
        } catch (error: any) {
            setTaskError(
                error.response?.data?.message ||
                "Unable to update task."
            );
        } finally {
            setTaskSubmitting(false);
        }
    };

    // =========================
    // DELETE TASK
    // =========================

    const handleDeleteTask = async (taskId: string) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this task?"
        );

        if (!confirmed) return;

        try {
            setTaskError("");

            const token = localStorage.getItem("token");

            await api.delete(`/tasks/${taskId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setTasks((currentTasks) =>
                currentTasks.filter(
                    (task) => task._id !== taskId
                )
            );
        } catch (error: any) {
            setTaskError(
                error.response?.data?.message ||
                "Unable to delete task."
            );
        }
    };

    // =========================
    // LOADING
    // =========================

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
                <p className="text-slate-400">
                    Loading project...
                </p>
            </main>
        );
    }

    // =========================
    // PROJECT ERROR
    // =========================

    if (error || !project) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
                <div className="text-center">

                    <h1 className="text-2xl font-bold">
                        Project not found
                    </h1>

                    <p className="mt-2 text-slate-400">
                        {error || "This project doesn't exist."}
                    </p>

                    <button
                        onClick={() => router.push("/projects")}
                        className="mt-6 rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold hover:bg-indigo-400"
                    >
                        Back to Projects
                    </button>

                </div>
            </main>
        );
    }

    // =========================
    // PROJECT PROGRESS
    // =========================

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(
        (task) => task.status === "completed"
    ).length;
    const todoTasks = tasks.filter(
        (task) => task.status === "todo"
    ).length;
    const inProgressTasks = tasks.filter(
        (task) => task.status === "in-progress"
    ).length;
    const reviewTasks = tasks.filter(
        (task) => task.status === "review"
    ).length;
    const progressPercentage =
        totalTasks === 0
            ? 0
            : Math.round((completedTasks / totalTasks) * 100);

    // =========================
    // ADD/REMOVE MEMBER
    // =========================  

    const handleAddMember = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!memberEmail.trim()) {
            setMemberError("Enter a member email.");
            return;
        }

        try {
            setMemberLoading(true);
            setMemberError("");

            const token = localStorage.getItem("token");

            const response = await api.post(
                `/projects/${params.id}/members`,
                {
                    email: memberEmail.trim(),
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setProject(response.data.project);
            setMemberEmail("");
        } catch (error: any) {
            setMemberError(
                error.response?.data?.message || "Unable to add member."
            );
        } finally {
            setMemberLoading(false);
        }
    };

    const handleRemoveMember = async (memberId: string) => {
        const confirmed = window.confirm(
            "Are you sure you want to remove this member?"
        );

        if (!confirmed) return;

        try {
            setRemovingMember(memberId);
            setMemberError("");

            const token = localStorage.getItem("token");

            const response = await api.delete(
                `/projects/${params.id}/members/${memberId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setProject(response.data.project);
        } catch (error: any) {
            setMemberError(
                error.response?.data?.message || "Unable to remove member."
            );
        } finally {
            setRemovingMember("");
        }
    };

    const handleAddComment = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const trimmedComment = commentText.trim();

        if (!trimmedComment) {
            setCommentError("Comment cannot be empty.");
            return;
        }

        if (!project?._id) {
            setCommentError("Project is not available yet.");
            return;
        }

        try {
            setCommentLoading(true);
            setCommentError("");

            const token = localStorage.getItem("token");

            const response = await api.post(
                `/comments/project/${project._id}`,
                { text: trimmedComment },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setComments((currentComments) => [
                response.data.comment,
                ...currentComments,
            ]);
            setCommentText("");
        } catch (error: any) {
            setCommentError(
                error.response?.data?.message || "Unable to add comment."
            );
        } finally {
            setCommentLoading(false);
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this comment?"
        );

        if (!confirmed) return;

        try {
            setDeletingComment(commentId);
            setCommentError("");

            const token = localStorage.getItem("token");

            await api.delete(`/comments/${commentId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setComments((currentComments) =>
                currentComments.filter((comment) => comment._id !== commentId)
            );
        } catch (error: any) {
            setCommentError(
                error.response?.data?.message || "Unable to delete comment."
            );
        } finally {
            setDeletingComment("");
        }
    };

    return (
        <main className="min-h-screen bg-slate-950 text-white">

            <div className="mx-auto max-w-7xl px-6 py-10">

                {/* BACK BUTTON */}

                <div className="mb-8 flex items-center gap-4">
                    <button
                        onClick={() => router.push("/dashboard")}
                        className="text-sm text-slate-400 transition hover:text-white"
                    >
                        ← Back to Dashboard
                    </button>

                    <button
                        onClick={() => router.push("/projects")}
                        className="text-sm text-slate-400 transition hover:text-white"
                    >
                        Back to Projects
                    </button>
                </div>

                {/* =========================
                    PROJECT HEADER
                ========================= */}

                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">

                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">

                        <div>

                            <div className="flex flex-wrap items-center gap-3">

                                <h1 className="text-3xl font-bold">
                                    {project.name}
                                </h1>

                                <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-medium capitalize text-indigo-400">
                                    {project.status}
                                </span>

                            </div>

                            <p className="mt-4 max-w-2xl text-slate-400">
                                {project.description ||
                                    "No description provided."}
                            </p>

                        </div>

                    </div>

                    {/* PROJECT INFO */}

                    <div className="mt-8 grid gap-4 border-t border-slate-800 pt-8 md:grid-cols-3">

                        <div>

                            <p className="text-xs uppercase tracking-wide text-slate-500">
                                Start Date
                            </p>

                            <p className="mt-2 text-sm">
                                {project.startDate
                                    ? new Date(
                                        project.startDate
                                    ).toLocaleDateString()
                                    : "Not set"}
                            </p>

                        </div>

                        <div>

                            <p className="text-xs uppercase tracking-wide text-slate-500">
                                Due Date
                            </p>

                            <p className="mt-2 text-sm">
                                {project.dueDate
                                    ? new Date(
                                        project.dueDate
                                    ).toLocaleDateString()
                                    : "Not set"}
                            </p>

                        </div>

                        <div>

                            <p className="text-xs uppercase tracking-wide text-slate-500">
                                Progress
                            </p>

                            <p className="mt-2 text-sm">
                                {progressPercentage}%
                            </p>

                            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">

                                <div
                                    className="h-full rounded-full bg-indigo-500 transition-all"
                                    style={{
                                        width: `${progressPercentage}%`,
                                    }}
                                />

                            </div>

                        </div>

                    </div>

                </div>

                <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-semibold text-white">Project Progress</h2>
                            <p className="mt-1 text-sm text-slate-400">
                                Track how the team is progressing on this project.
                            </p>
                        </div>
                    </div>

                    {tasksLoading ? (
                        <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-400">
                            Loading project progress...
                        </div>
                    ) : totalTasks === 0 ? (
                        <div className="mt-6 rounded-xl border border-dashed border-slate-700 bg-slate-950/60 p-6 text-center">
                            <p className="text-2xl font-bold text-white">0% Complete</p>
                            <p className="mt-3 text-sm text-slate-400">
                                No tasks yet. Create your first task to start tracking project progress.
                            </p>
                        </div>
                    ) : (
                        <div className="mt-6">
                            <div className="flex items-center justify-between gap-3">
                                <p className="text-2xl font-bold text-white">
                                    {progressPercentage}% Complete
                                </p>
                                <p className="text-sm text-slate-400">
                                    {completedTasks} of {totalTasks} tasks completed
                                </p>
                            </div>

                            <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-800">
                                <div
                                    className="h-full rounded-full bg-indigo-500 transition-all duration-300"
                                    style={{ width: `${progressPercentage}%` }}
                                />
                            </div>

                            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                                    <p className="text-xs uppercase tracking-wide text-slate-500">Todo</p>
                                    <p className="mt-2 text-xl font-semibold text-white">{todoTasks}</p>
                                </div>
                                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                                    <p className="text-xs uppercase tracking-wide text-slate-500">In Progress</p>
                                    <p className="mt-2 text-xl font-semibold text-white">{inProgressTasks}</p>
                                </div>
                                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                                    <p className="text-xs uppercase tracking-wide text-slate-500">Review</p>
                                    <p className="mt-2 text-xl font-semibold text-white">{reviewTasks}</p>
                                </div>
                                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                                    <p className="text-xs uppercase tracking-wide text-slate-500">Completed</p>
                                    <p className="mt-2 text-xl font-semibold text-white">{completedTasks}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold">Team Members</h2>
                            <p className="mt-1 text-sm text-slate-400">
                                Manage the people working on this project.
                            </p>
                        </div>

                        <div className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-400">
                            {project.members?.length || 0} members
                        </div>
                    </div>

                    {memberError && (
                        <div className="mt-4 rounded-xl border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-400">
                            {memberError}
                        </div>
                    )}

                    <div className="mt-6 space-y-3">
                        {/* Owner */}
                        {project.owner && (
                            <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/20 font-semibold text-indigo-400">
                                        {project.owner.name.charAt(0).toUpperCase()}
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-white">
                                            {project.owner.name}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {project.owner.email}
                                        </p>
                                    </div>
                                </div>

                                <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-400">
                                    Owner
                                </span>
                            </div>
                        )}

                        {/* Members */}
                        {project.members
                            ?.filter((member) => member._id !== project.owner?._id)
                            .map((member) => (
                                <div
                                    key={member._id}
                                    className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-4"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 font-semibold text-slate-300">
                                            {member.name.charAt(0).toUpperCase()}
                                        </div>

                                        <div>
                                            <p className="text-sm font-medium text-white">
                                                {member.name}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {member.email}
                                            </p>
                                        </div>
                                    </div>

                                    {String(user?.id) === String(project.owner?._id) && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveMember(member._id)}
                                            disabled={removingMember === member._id}
                                            className="rounded-lg border border-red-900 px-3 py-2 text-xs font-medium text-red-400 transition hover:bg-red-950/40 disabled:opacity-50"
                                        >
                                            {removingMember === member._id ? "Removing..." : "Remove"}
                                        </button>
                                    )}
                                </div>
                            ))}

                        {project.members?.filter(
                            (member) => member._id !== project.owner?._id
                        ).length === 0 && (
                                <div className="rounded-xl border border-dashed border-slate-800 py-8 text-center">
                                    <p className="text-sm text-slate-500">
                                        No additional team members yet.
                                    </p>
                                </div>
                            )}
                    </div>

                    {/* Add Member */}
                    {user?.id === project.owner?._id && (
                        <form
                            onSubmit={handleAddMember}
                            className="mt-6 flex flex-col gap-3 sm:flex-row"
                        >
                            <input
                                type="email"
                                value={memberEmail}
                                onChange={(e) => setMemberEmail(e.target.value)}
                                placeholder="Enter member email"
                                className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-indigo-500"
                            />

                            <button
                                type="submit"
                                disabled={memberLoading}
                                className="rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold transition hover:bg-indigo-400 disabled:opacity-60"
                            >
                                {memberLoading ? "Adding..." : "+ Add Member"}
                            </button>
                        </form>
                    )}
                </div>

                <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
                    <div className="mb-5">
                        <h2 className="text-xl font-semibold text-white">
                            Team Discussion
                        </h2>
                        <p className="mt-1 text-sm text-slate-400">
                            Share updates, questions, and feedback with your team.
                        </p>
                    </div>

                    <form onSubmit={handleAddComment} className="mb-6">
                        <textarea
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Write a comment..."
                            rows={3}
                            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500"
                        />

                        {commentError && (
                            <p className="mt-2 text-sm text-red-400">
                                {commentError}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={commentLoading}
                            className="mt-3 rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {commentLoading ? "Posting..." : "Post Comment"}
                        </button>
                    </form>

                    {commentsLoading ? (
                        <p className="text-sm text-slate-400">
                            Loading comments...
                        </p>
                    ) : comments.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-700 p-6 text-center">
                            <p className="text-sm text-slate-400">
                                No comments yet. Start the discussion.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {comments.map((comment) => {
                                const isCommentAuthor =
                                    String(comment.user._id) === String(user?.id);

                                const isProjectOwner =
                                    String(project?.owner?._id) === String(user?.id);

                                return (
                                    <div
                                        key={comment._id}
                                        className="rounded-xl border border-slate-800 bg-slate-950 p-4"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <p className="font-medium text-white">
                                                    {comment.user.name}
                                                </p>

                                                <p className="text-xs text-slate-500">
                                                    {new Date(comment.createdAt).toLocaleString()}
                                                </p>
                                            </div>

                                            {(isCommentAuthor || isProjectOwner) && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDeleteComment(comment._id)
                                                    }
                                                    disabled={deletingComment === comment._id}
                                                    className="text-xs font-medium text-red-400 hover:text-red-300 disabled:opacity-50"
                                                >
                                                    {deletingComment === comment._id
                                                        ? "Deleting..."
                                                        : "Delete"}
                                                </button>
                                            )}
                                        </div>

                                        <p className="mt-3 whitespace-pre-wrap text-sm text-slate-300">
                                            {comment.text}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* =========================
                    TASK SECTION
                ========================= */}

                <div className="mt-8">

                    <div className="mb-5 flex items-center justify-between">

                        <div>

                            <h2 className="text-2xl font-bold">
                                Project Tasks
                            </h2>

                            <p className="mt-1 text-sm text-slate-400">
                                Manage tasks and track project progress.
                            </p>

                        </div>

                        <button
                            onClick={() => {
                                if (showTaskForm) {
                                    resetTaskForm();
                                } else {
                                    setShowTaskForm(true);
                                    setTaskError("");
                                }
                            }}
                            className="rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold transition hover:bg-indigo-400"
                        >
                            {showTaskForm
                                ? "Cancel"
                                : "+ Create Task"}
                        </button>

                    </div>

                    {/* =========================
                        TASK FORM
                    ========================= */}

                    {showTaskForm && (

                        <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">

                            <h3 className="text-lg font-semibold">
                                {editingTask
                                    ? "Edit Task"
                                    : "Create New Task"}
                            </h3>

                            <form
                                onSubmit={
                                    editingTask
                                        ? handleUpdateTask
                                        : handleCreateTask
                                }
                                className="mt-5 space-y-5"
                            >

                                {/* TITLE */}

                                <div>

                                    <label className="mb-2 block text-sm font-medium">
                                        Task title
                                    </label>

                                    <input
                                        type="text"
                                        value={taskTitle}
                                        onChange={(e) =>
                                            setTaskTitle(
                                                e.target.value
                                            )
                                        }
                                        placeholder="e.g. Build dashboard UI"
                                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                                    />

                                </div>

                                {/* DESCRIPTION */}

                                <div>

                                    <label className="mb-2 block text-sm font-medium">
                                        Description
                                    </label>

                                    <textarea
                                        value={taskDescription}
                                        onChange={(e) =>
                                            setTaskDescription(
                                                e.target.value
                                            )
                                        }
                                        placeholder="Describe the task..."
                                        rows={4}
                                        className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                                    />

                                </div>

                                {/* OPTIONS */}

                                <div className="grid gap-5 md:grid-cols-3">

                                    {/* PRIORITY */}

                                    <div>

                                        <label className="mb-2 block text-sm font-medium">
                                            Priority
                                        </label>

                                        <select
                                            value={taskPriority}
                                            onChange={(e) =>
                                                setTaskPriority(
                                                    e.target.value as
                                                    | "low"
                                                    | "medium"
                                                    | "high"
                                                )
                                            }
                                            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                                        >

                                            <option value="low">
                                                Low
                                            </option>

                                            <option value="medium">
                                                Medium
                                            </option>

                                            <option value="high">
                                                High
                                            </option>

                                        </select>

                                    </div>

                                    {/* STATUS */}

                                    <div>

                                        <label className="mb-2 block text-sm font-medium">
                                            Status
                                        </label>

                                        <select
                                            value={taskStatus}
                                            onChange={(e) =>
                                                setTaskStatus(
                                                    e.target.value as
                                                    | "todo"
                                                    | "in-progress"
                                                    | "review"
                                                    | "completed"
                                                )
                                            }
                                            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                                        >

                                            <option value="todo">
                                                Todo
                                            </option>

                                            <option value="in-progress">
                                                In Progress
                                            </option>

                                            <option value="review">
                                                Review
                                            </option>

                                            <option value="completed">
                                                Completed
                                            </option>

                                        </select>

                                    </div>

                                    {/* DUE DATE */}

                                    <div>

                                        <label className="mb-2 block text-sm font-medium">
                                            Due date
                                        </label>

                                        <input
                                            type="date"
                                            value={taskDueDate}
                                            onChange={(e) =>
                                                setTaskDueDate(
                                                    e.target.value
                                                )
                                            }
                                            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                                        />

                                    </div>

                                </div>

                                {/* ERROR */}

                                {taskError && (

                                    <div className="rounded-xl border border-red-900 bg-red-950/30 px-4 py-3 text-sm text-red-400">
                                        {taskError}
                                    </div>

                                )}

                                {/* FORM BUTTONS */}

                                <div className="flex justify-end gap-3">

                                    <button
                                        type="button"
                                        onClick={resetTaskForm}
                                        className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-medium hover:bg-slate-800"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={taskSubmitting}
                                        className="rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {taskSubmitting
                                            ? "Saving..."
                                            : editingTask
                                                ? "Update Task"
                                                : "Create Task"}
                                    </button>

                                </div>

                            </form>

                        </div>

                    )}

                    {/* =========================
                        TASK LIST
                    ========================= */}

                    {tasksLoading ? (

                        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">

                            <p className="text-slate-400">
                                Loading tasks...
                            </p>

                        </div>

                    ) : tasks.length === 0 ? (

                        <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 p-12 text-center">

                            <h3 className="text-lg font-semibold">
                                No tasks yet
                            </h3>

                            <p className="mt-2 text-sm text-slate-400">
                                Create your first task to start
                                tracking this project.
                            </p>


                        </div>

                    ) : (

                        <div className="space-y-4">

                            {tasks.map((task) => (

                                <div
                                    key={task._id}
                                    className="rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:border-slate-700"
                                >

                                    <div className="flex flex-col justify-between gap-4 md:flex-row">

                                        <div className="min-w-0">

                                            {/* TASK TITLE + BADGES */}

                                            <div className="flex flex-wrap items-center gap-3">

                                                <h3 className="text-lg font-semibold">
                                                    {task.title}
                                                </h3>

                                                <span className="rounded-full bg-slate-800 px-3 py-1 text-xs capitalize text-slate-300">
                                                    {task.status.replace(
                                                        "-",
                                                        " "
                                                    )}
                                                </span>

                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs capitalize ${task.priority ===
                                                        "high"
                                                        ? "bg-red-500/10 text-red-400"
                                                        : task.priority ===
                                                            "medium"
                                                            ? "bg-yellow-500/10 text-yellow-400"
                                                            : "bg-green-500/10 text-green-400"
                                                        }`}
                                                >
                                                    {task.priority}
                                                </span>

                                            </div>

                                            {/* DESCRIPTION */}

                                            {task.description && (

                                                <p className="mt-3 text-sm text-slate-400">
                                                    {task.description}
                                                </p>

                                            )}

                                            {/* TASK INFO */}

                                            <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">

                                                {task.dueDate && (

                                                    <span>
                                                        Due:{" "}
                                                        {new Date(
                                                            task.dueDate
                                                        ).toLocaleDateString()}
                                                    </span>

                                                )}

                                                {task.assignedTo && (

                                                    <span>
                                                        Assigned to:{" "}
                                                        {task.assignedTo.name}
                                                    </span>

                                                )}

                                            </div>

                                        </div>

                                        {/* TASK ACTIONS */}

                                        <div className="flex shrink-0 gap-2">

                                            <button
                                                onClick={() =>
                                                    handleEditTask(task)
                                                }
                                                className="rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium transition hover:bg-slate-800"
                                            >
                                                Edit
                                            </button>

                                            <button
                                                onClick={() =>
                                                    handleDeleteTask(
                                                        task._id
                                                    )
                                                }
                                                className="rounded-lg border border-red-900 px-3 py-2 text-sm font-medium text-red-400 transition hover:bg-red-950/40"
                                            >
                                                Delete
                                            </button>

                                        </div>

                                    </div>

                                </div>

                            ))}

                        </div>

                    )}

                </div>

            </div>

        </main>
    );
}