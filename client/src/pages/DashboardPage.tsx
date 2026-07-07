import { useParams, Link } from "react-router-dom";

/** Placeholder skeleton block */
function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-white/[0.06] ${className}`}
    />
  );
}

export default function DashboardPage() {
  const { project, username } = useParams<{
    project: string;
    username: string;
  }>();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">
      {/* Top bar */}
      <header className="border-b border-white/10 bg-white/[0.02] backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-slate-300 hover:text-indigo-400 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
              />
            </svg>
            <span className="text-sm font-medium">Back</span>
          </Link>

          <div className="text-right">
            <h1 className="text-lg font-semibold text-white leading-tight">
              {decodeURIComponent(username ?? "")}
            </h1>
            <p className="text-xs text-slate-500">{project}</p>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* ── Summary cards skeleton ───────────────────────────────── */}
        <section>
          <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">
            Overview
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {["Total Edits", "Live Edits", "Deleted Edits", "Registered"].map(
              (label) => (
                <div
                  key={label}
                  className="bg-white/[0.04] border border-white/10 rounded-xl p-5"
                >
                  <p className="text-xs text-slate-500 mb-2">{label}</p>
                  <Skeleton className="h-7 w-24" />
                </div>
              )
            )}
          </div>
        </section>

        {/* ── Namespace chart skeleton ─────────────────────────────── */}
        <section>
          <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">
            Edits by Namespace
          </h2>
          <div className="bg-white/[0.04] border border-white/10 rounded-xl p-6">
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton
                    className="h-4 flex-1"
                    style={
                      { maxWidth: `${90 - i * 15}%` } as React.CSSProperties
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Recent edits skeleton ────────────────────────────────── */}
        <section>
          <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">
            Recent Edits
          </h2>
          <div className="bg-white/[0.04] border border-white/10 rounded-xl divide-y divide-white/5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4 flex items-center gap-4">
                <Skeleton className="h-4 w-4 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-4 w-16 shrink-0" />
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
