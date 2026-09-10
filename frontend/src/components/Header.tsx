"use client";

import Link from "next/link";
import { useAuth } from "@/src/context/AuthContext";

export default function Header() {
  const { user, loading, logout } = useAuth();

  return (
    <header className="border-b border-slate-900 bg-slate-950/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 font-bold">
              N
            </div>
            <span className="text-lg font-bold">NOVA</span>
          </Link>
        </div>

        <nav>
          <ul className="flex items-center gap-4">
            {loading ? null : user ? (
              <>
                <li>
                  <Link href="/dashboard" className="text-sm text-slate-300 hover:text-white">
                    Dashboard
                  </Link>
                </li>

                <li>
                  <Link href="/projects" className="text-sm text-slate-300 hover:text-white">
                    Projects
                  </Link>
                </li>

                <li>
                  <Link href="/tasks" className="text-sm text-slate-300 hover:text-white">
                    Tasks
                  </Link>
                </li>

                <li>
                  <Link href="/profile" className="text-sm text-slate-300 hover:text-white">
                    Profile
                  </Link>
                </li>

                <li>
                  <button
                    onClick={() => logout()}
                    className="text-sm rounded-md border border-slate-700 px-3 py-1 text-red-400 hover:bg-red-950/40"
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link href="/login" className="text-sm text-slate-300 hover:text-white">
                    Login
                  </Link>
                </li>

                <li>
                  <Link href="/register" className="rounded-md bg-white px-3 py-1 text-sm font-semibold text-slate-950 hover:bg-slate-200">
                    Get Started
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}
