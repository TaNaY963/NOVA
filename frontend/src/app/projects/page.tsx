"use client";

import { FormEvent, useEffect, useState } from "react";
import api from "@/src/lib/api";
import { useRouter } from "next/navigation";

type Project = {
    _id: string;
    name: string;
    description: string;
    status: "planning" | "active" | "completed" | "on-hold";
    startDate?: string;
    dueDate?: string;
};

export default function ProjectsPage() {

    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState("planning");
    const [startDate, setStartDate] = useState("");
    const [dueDate, setDueDate] = useState("");

    const [error, setError] = useState("");
    const [creating, setCreating] = useState(false);

    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [updating, setUpdating] = useState(false);


    const fetchProjects = async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await api.get("/projects", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setProjects(response.data.projects);
        } catch (error: any) {
            setError(
                error.response?.data?.message ||
                "Unable to load projects."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleCreateProject = async (
        e: FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        setError("");

        if (!name.trim()) {
            setError("Project name is required.");
            return;
        }

        try {
            setCreating(true);

            const token = localStorage.getItem("token");

            await api.post(
                "/projects",
                {
                    name,
                    description,
                    status,
                    startDate: startDate || undefined,
                    dueDate: dueDate || undefined,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setName("");
            setDescription("");
            setStatus("planning");
            setStartDate("");
            setDueDate("");

            setShowForm(false);

            await fetchProjects();
        } catch (error: any) {
            setError(
                error.response?.data?.message ||
                "Unable to create project."
            );
        } finally {
            setCreating(false);
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case "active":
                return "bg-emerald-500/10 text-emerald-400";

            case "completed":
                return "bg-blue-500/10 text-blue-400";

            case "on-hold":
                return "bg-amber-500/10 text-amber-400";

            default:
                return "bg-slate-700 text-slate-300";
        }
    };

    const handleDeleteProject = async (projectId: string) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this project?"
        );

        if (!confirmed) return;

        try {
            setDeleting(true);

            const token = localStorage.getItem("token");

            await api.delete(`/projects/${projectId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            await fetchProjects();
        } catch (error: any) {
            setError(
                error.response?.data?.message ||
                "Unable to delete project."
            );
        } finally {
            setDeleting(false);
        }
    };

    const handleUpdateProject = async (
        e: FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        if (!editingProject) return;

        setError("");

        if (!name.trim()) {
            setError("Project name is required.");
            return;
        }

        try {
            setUpdating(true);

            const token = localStorage.getItem("token");

            await api.put(
                `/projects/${editingProject._id}`,
                {
                    name,
                    description,
                    status,
                    startDate: startDate || undefined,
                    dueDate: dueDate || undefined,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setEditingProject(null);

            setName("");
            setDescription("");
            setStatus("planning");
            setStartDate("");
            setDueDate("");

            await fetchProjects();
        } catch (error: any) {
            setError(
                error.response?.data?.message ||
                "Unable to update project."
            );
        } finally {
            setUpdating(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-950 text-white">
            <div className="mx-auto max-w-7xl px-6 py-10">

                {/* Back to Dashboard */}
                <div className="mb-6">
                    <button
                        onClick={() => router.push("/dashboard")}
                        className="mb-2 text-sm text-slate-400 transition hover:text-white"
                    >
                        ← Back to Dashboard
                    </button>
                </div>

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-indigo-400">
                            WORKSPACE
                        </p>

                        <h1 className="mt-2 text-4xl font-bold">
                            Projects
                        </h1>

                        <p className="mt-2 text-slate-400">
                            Manage your team's projects and track progress.
                        </p>
                    </div>

                    <button
                        onClick={() => setShowForm(true)}
                        className="rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold transition hover:bg-indigo-400"
                    >
                        + New Project
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div className="mt-6 rounded-xl border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-400">
                        {error}
                    </div>
                )}

                {/* Create Form */}
                {showForm && (
                    <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">

                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-semibold">
                                    {editingProject ? "Edit Project" : "Create Project"}
                                </h2>

                                <p className="mt-1 text-sm text-slate-400">
                                    {editingProject
                                        ? "Update your project details."
                                        : "Add a new project to your workspace."}
                                </p>
                            </div>

                            <button
                                onClick={() => {
                                    setShowForm(false);
                                    setEditingProject(null);

                                    setName("");
                                    setDescription("");
                                    setStatus("planning");
                                    setStartDate("");
                                    setDueDate("");
                                }}
                                className="text-slate-400 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>

                        <form
                            onSubmit={
                                editingProject
                                    ? handleUpdateProject
                                    : handleCreateProject
                            }
                            className="grid gap-5 md:grid-cols-2"
                        >

                            {/* Name */}
                            <div className="md:col-span-2">
                                <label className="mb-2 block text-sm font-medium">
                                    Project name
                                </label>

                                <input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. NOVA Development"
                                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                                />
                            </div>

                            {/* Description */}
                            <div className="md:col-span-2">
                                <label className="mb-2 block text-sm font-medium">
                                    Description
                                </label>

                                <textarea
                                    value={description}
                                    onChange={(e) =>
                                        setDescription(e.target.value)
                                    }
                                    placeholder="What is this project about?"
                                    rows={4}
                                    className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                                />
                            </div>

                            {/* Status */}
                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Status
                                </label>

                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                                >
                                    <option value="planning">Planning</option>
                                    <option value="active">Active</option>
                                    <option value="completed">Completed</option>
                                    <option value="on-hold">On Hold</option>
                                </select>
                            </div>

                            {/* Start date */}
                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Start date
                                </label>

                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                                />
                            </div>

                            {/* Due date */}
                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Due date
                                </label>

                                <input
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                                />
                            </div>

                            {/* Submit */}
                            <div className="flex items-end justify-end">
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="w-full rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold transition hover:bg-indigo-400 disabled:opacity-60"
                                >
                                    {editingProject
                                        ? updating
                                            ? "Updating..."
                                            : "Update Project"
                                        : creating
                                            ? "Creating..."
                                            : "Create Project"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Projects */}
                <div className="mt-8">

                    {loading ? (
                        <div className="py-20 text-center text-slate-400">
                            Loading projects...
                        </div>
                    ) : projects.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 px-6 py-20 text-center">
                            <div className="text-4xl">📁</div>

                            <h2 className="mt-4 text-xl font-semibold">
                                No projects yet
                            </h2>

                            <p className="mt-2 text-sm text-slate-400">
                                Create your first project to get started.
                            </p>

                            <button
                                onClick={() => setShowForm(true)}
                                className="mt-6 rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold hover:bg-indigo-400"
                            >
                                Create Project
                            </button>
                        </div>
                    ) : (
                        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

                            {projects.map((project) => (
                                <div
                                    key={project._id}
                                    onClick={() => router.push(`/projects/${project._id}`)}
                                    className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:border-slate-700"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="min-w-0">
                                            <h2 className="truncate text-lg font-semibold">
                                                {project.name}
                                            </h2>
                                        </div>

                                        <span
                                            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(
                                                project.status
                                            )}`}
                                        >
                                            {project.status}
                                        </span>
                                    </div>

                                    <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-400">
                                        {project.description || "No description provided."}
                                    </p>

                                    <div className="mt-6 flex items-center justify-between border-t border-slate-800 pt-4">
                                        <div className="text-xs text-slate-500">
                                            {project.dueDate
                                                ? `Due: ${new Date(project.dueDate).toLocaleDateString()}`
                                                : "No due date"}
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();

                                                    setEditingProject(project);

                                                    setName(project.name);
                                                    setDescription(project.description || "");
                                                    setStatus(project.status);

                                                    setStartDate(
                                                        project.startDate
                                                            ? new Date(project.startDate)
                                                                .toISOString()
                                                                .split("T")[0]
                                                            : ""
                                                    );

                                                    setDueDate(
                                                        project.dueDate
                                                            ? new Date(project.dueDate)
                                                                .toISOString()
                                                                .split("T")[0]
                                                            : ""
                                                    );

                                                    setShowForm(true);
                                                    setError("");
                                                }}
                                                className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-slate-800"
                                            >
                                                Edit
                                            </button>

                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteProject(project._id);
                                                }}
                                                className="relative z-10 cursor-pointer rounded-lg border border-red-900 px-3 py-2 text-xs font-medium text-red-400 transition hover:bg-red-950/40"
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