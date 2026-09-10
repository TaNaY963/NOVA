"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/context/AuthContext";
import api from "@/src/lib/api";

type DashboardStats = {
  totalProjects: number;
  activeProjects: number;
  totalTasks: number;
  completedTasks: number;
  overallCompletion: number;
};

type DashboardProject = {
  _id: string;
  name: string;
  status: string;
  totalTasks: number;
  completedTasks: number;
  progress: number;
};

type RecentActivity = {
  type: string;
  message: string;
  createdAt: string;
  project?: {
    _id: string;
    name: string;
  };
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  const [projects, setProjects] = useState<DashboardProject[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================
  // AUTH
  // =========================

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // =========================
  // FETCH DASHBOARD DATA
  // =========================

  useEffect(() => {
    if (!user) return;

    const fetchDashboard = async () => {
      try {
        setDataLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        const response = await api.get("/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = response.data || {};

        setStats(data.stats || null);
        setProjects(data.projects || []);
        setRecentActivity(data.recentActivity || []);
      } catch (error: any) {
        setError(
          error.response?.data?.message ||
            "Unable to load dashboard data."
        );
      } finally {
        setDataLoading(false);
      }
    };

    fetchDashboard();
  }, [user]);

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <p className="text-slate-400">Loading workspace...</p>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  // =========================
  // STATS (from API)
  // =========================

  const completedTasks = stats?.completedTasks ?? 0;
  const completionPercentage = stats?.overallCompletion ?? 0;
  const activeProjects = stats?.activeProjects ?? 0;

  const recentProjects = projects.slice(0, 5);
  const recentTasks = recentActivity
    .filter((a) => a.type === "task")
    .slice(0, 5);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-10">

        {/* =========================
            HEADER
        ========================= */}

        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium text-indigo-400">
              WELCOME TO NOVA
            </p>

            <h1 className="mt-2 text-4xl font-bold">
              Hey, {user.name} 👋
            </h1>

            <p className="mt-2 text-slate-400">
              Here&apos;s what&apos;s happening with your workspace.
            </p>
          </div>

          <button
            onClick={logout}
            className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium transition hover:bg-slate-800"
          >
            Logout
          </button>
        </div>

        {/* =========================
            ERROR
        ========================= */}

        {error && (
          <div className="mt-6 rounded-xl border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* =========================
            STATS
        ========================= */}

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          {/* Total Projects */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Total Projects</p>

            <p className="mt-3 text-3xl font-bold">
              {dataLoading ? "—" : stats?.totalProjects ?? 0}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              {dataLoading ? "—" : `${activeProjects} active`}
            </p>
          </div>

          {/* Active Projects */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Active Projects</p>
            <p className="mt-3 text-3xl font-bold">
              {dataLoading ? "—" : stats?.activeProjects ?? 0}
            </p>
          </div>

          {/* Total Tasks */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Total Tasks</p>
            <p className="mt-3 text-3xl font-bold">
              {dataLoading ? "—" : stats?.totalTasks ?? 0}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              {dataLoading ? "—" : `${stats?.completedTasks ?? 0} completed`}
            </p>
          </div>

          {/* Completed Tasks */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Completed Tasks</p>
            <p className="mt-3 text-3xl font-bold">
              {dataLoading ? "—" : stats?.completedTasks ?? 0}
            </p>
          </div>

        </div>

        {/* =========================
          CONTENT
        ========================= */}

        <div className="mt-8 grid gap-6 lg:grid-cols-2">

            {/* =========================
              PROJECT OVERVIEW
            ========================= */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">
                  Recent Projects
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Your Projects
                </p>
              </div>

              <button
                onClick={() => router.push("/projects")}
                className="text-sm font-medium text-indigo-400 hover:text-indigo-300"
              >
                View all
              </button>
            </div>

            <div className="mt-6 space-y-3">

              {dataLoading ? (
                <p className="py-6 text-center text-sm text-slate-500">
                  Loading projects...
                </p>
              ) : projects.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-700 p-8 text-center">
                  <p className="text-sm text-slate-400">No projects yet.</p>

                  <button
                    onClick={() => router.push("/projects")}
                    className="mt-4 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold hover:bg-indigo-400"
                  >
                    Create Project
                  </button>
                </div>
              ) : (
                projects.map((project) => (
                  <div
                    key={project._id}
                    onClick={() => router.push(`/projects/${project._id}`)}
                    className="cursor-pointer rounded-xl border border-slate-800 bg-slate-950 p-4 transition hover:border-slate-700"
                  >
                    <div className="flex items-center justify-between gap-4">

                      <div className="min-w-0">
                        <h3 className="truncate font-medium">{project.name}</h3>

                        <p className="mt-1 truncate text-xs text-slate-500">
                          {project.totalTasks === 0
                            ? "No tasks yet"
                            : `${project.completedTasks} / ${project.totalTasks} tasks completed`}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <span className="block rounded-full bg-indigo-500/10 px-3 py-1 text-xs capitalize text-indigo-400">
                          {project.status}
                        </span>

                        <p className="mt-2 text-sm font-semibold text-white">{project.progress}%</p>
                      </div>

                    </div>

                    {project.totalTasks > 0 && (
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
                        <div
                          className="h-full rounded-full bg-indigo-500 transition-all"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                ))
              )}

            </div>
          </div>

            {/* =========================
              RECENT ACTIVITY
            ========================= */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">
                  Recent Tasks
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Latest tasks across your projects.
                </p>
              </div>

              <button
                onClick={() => router.push("/projects")}
                className="text-sm font-medium text-indigo-400 hover:text-indigo-300"
              >
                View projects
              </button>
            </div>

            <div className="mt-6 space-y-3">

              {dataLoading ? (
                <p className="py-6 text-center text-sm text-slate-500">
                  Loading activity...
                </p>
              ) : recentActivity.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-700 p-8 text-center">
                  <p className="text-sm text-slate-400">No recent activity yet.</p>
                </div>
              ) : (
                recentActivity.slice(0, 10).map((act, idx) => (
                  <div
                    key={`${act.type}-${idx}`}
                    onClick={() => act.project?._id && router.push(`/projects/${act.project._id}`)}
                    className={`rounded-xl border border-slate-800 bg-slate-950 p-4 ${act.project?._id ? 'cursor-pointer hover:border-slate-700' : ''}`}
                    role={act.project?._id ? 'button' : undefined}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="truncate font-medium">{act.message}</h3>
                        <p className="mt-1 text-xs text-slate-500">
                          {act.project?.name || "Project"}
                        </p>
                      </div>

                      <p className="text-xs text-slate-500">
                        {new Date(act.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}

            </div>
          </div>

        </div>

      </div>
    </main>
  );
}