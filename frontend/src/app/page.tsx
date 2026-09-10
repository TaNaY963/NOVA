import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      
      <nav className="flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 font-bold">
            N
          </div>

          <span className="text-2xl font-bold">NOVA</span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="px-4 py-2 text-slate-300 transition hover:text-white"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="rounded-lg bg-white px-5 py-2 font-semibold text-slate-950 transition hover:bg-slate-200"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex min-h-[75vh] items-center justify-center px-6">
        <div className="max-w-3xl text-center">
          <p className="mb-6 text-sm font-medium tracking-widest text-indigo-400">
            TEAM PRODUCTIVITY PLATFORM
          </p>

          <h1 className="text-5xl font-bold tracking-tight sm:text-7xl">
            Plan.
            <span className="text-indigo-400"> Collaborate.</span>
            <br />
            Deliver.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400">
            NOVA brings projects, tasks, team members and progress tracking
            together in one simple workspace.
          </p>

          <div className="mt-10 flex justify-center gap-4">
            <Link
              href="/register"
              className="rounded-xl bg-indigo-500 px-7 py-3 font-semibold transition hover:bg-indigo-400"
            >
              Start for free
            </Link>

            <Link
              href="/login"
              className="rounded-xl border border-slate-700 px-7 py-3 font-semibold transition hover:bg-slate-900"
            >
              Sign in
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-sm text-slate-400">Projects</p>
              <p className="mt-2 text-3xl font-bold">12</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-sm text-slate-400">Active Tasks</p>
              <p className="mt-2 text-3xl font-bold">38</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-sm text-slate-400">Completion</p>
              <p className="mt-2 text-3xl font-bold">76%</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-slate-900">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 py-16 md:grid-cols-3">
          <Feature
            title="Projects"
            description="Organize work into projects with clear goals, deadlines and progress."
          />

          <Feature
            title="Tasks"
            description="Create, assign and track tasks so everyone knows what needs to be done."
          />

          <Feature
            title="Teamwork"
            description="Collaborate with your team and keep project activity in one place."
          />
        </div>
      </section>
    </main>
  );
}

function Feature({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
      <h2 className="text-lg font-semibold">{title}</h2>

      <p className="mt-3 text-sm leading-6 text-slate-400">
        {description}
      </p>
    </div>
  );
}