import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

const PROJECTS = [
  { label: "English Wikipedia", value: "en.wikipedia.org" },
  { label: "Hindi Wikipedia", value: "hi.wikipedia.org" },
  { label: "Wikidata", value: "www.wikidata.org" },
  { label: "Wikimedia Commons", value: "commons.wikimedia.org" },
] as const;

export default function HomePage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [project, setProject] = useState(PROJECTS[0].value);
  const [error, setError] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = username.trim();

    if (!trimmed) {
      setError("Please enter a Wikimedia username.");
      return;
    }

    setError("");
    navigate(`/dashboard/${project}/${encodeURIComponent(trimmed)}`);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center px-4">
      {/* Subtle background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 mb-6">
            <svg
              className="w-8 h-8 text-indigo-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
              />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Wikimedia Contribution
            <span className="block text-indigo-400">Dashboard</span>
          </h1>
          <p className="mt-3 text-slate-400 text-sm sm:text-base max-w-xs mx-auto">
            Explore edit statistics, namespace breakdowns, and recent activity
            for any Wikimedia contributor.
          </p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/20 space-y-5"
        >
          {/* Username */}
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-slate-300 mb-1.5"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (error) setError("");
              }}
              placeholder="e.g. Jimbo_Wales"
              className={`w-full rounded-lg bg-white/[0.06] border px-4 py-2.5 text-white placeholder-slate-500 outline-none transition-colors focus:ring-2 focus:ring-indigo-500/40 ${
                error
                  ? "border-red-500/60 focus:border-red-500"
                  : "border-white/10 focus:border-indigo-500"
              }`}
            />
            {error && (
              <p className="mt-1.5 text-sm text-red-400 flex items-center gap-1">
                <svg
                  className="w-4 h-4 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                  />
                </svg>
                {error}
              </p>
            )}
          </div>

          {/* Project */}
          <div>
            <label
              htmlFor="project"
              className="block text-sm font-medium text-slate-300 mb-1.5"
            >
              Project
            </label>
            <div className="relative">
              <select
                id="project"
                value={project}
                onChange={(e) => setProject(e.target.value)}
                className="w-full appearance-none rounded-lg bg-white/[0.06] border border-white/10 px-4 py-2.5 pr-10 text-white outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
              >
                {PROJECTS.map((p) => (
                  <option
                    key={p.value}
                    value={p.value}
                    className="bg-slate-900"
                  >
                    {p.label}
                  </option>
                ))}
              </select>
              <svg
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m19.5 8.25-7.5 7.5-7.5-7.5"
                />
              </svg>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium py-2.5 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:ring-offset-2 focus:ring-offset-slate-900 cursor-pointer"
          >
            View Dashboard
          </button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-slate-600">
          Data sourced from{" "}
          <a
            href="https://xtools.wmcloud.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-500 hover:text-indigo-400 transition-colors underline underline-offset-2"
          >
            XTools
          </a>{" "}
          &amp;{" "}
          <a
            href="https://www.mediawiki.org/wiki/API:Main_page"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-500 hover:text-indigo-400 transition-colors underline underline-offset-2"
          >
            MediaWiki API
          </a>
        </p>
      </div>
    </div>
  );
}
