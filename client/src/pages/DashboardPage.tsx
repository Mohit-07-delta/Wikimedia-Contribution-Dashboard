import { useEffect, useState } from "react";
import Footer from "../components/Footer";
import { useParams, Link } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { formatAccountAge, timeAgo, formatNumber } from "../utils/format";
import ContributionHeatmap from "../components/ContributionHeatmap";

// ── Types ─────────────────────────────────────────────────────────────────────

interface UserSummary {
  username: string;
  project: string;
  totalEdits: number;
  liveEdits: number;
  deletedEdits: number;
  registrationDate: string;
  globalEditCount: number;
}

interface NamespaceEdit {
  namespace: string;
  count: number;
}

interface RecentEdit {
  title: string;
  timestamp: string;
  comment: string;
  sizeChange: number;
  diffUrl: string;
}

interface HeatmapDay {
  date: string;
  count: number;
}

interface HeatmapResponse {
  heatmap: HeatmapDay[];
  availableYears: number[];
}

type LoadState = "loading" | "success" | "error" | "empty";

// ── Muted Wikimedia-style chart palette ───────────────────────────────────────

const CHART_COLORS = [
  "#3366cc", // wiki blue
  "#5b8dd9", // lighter blue
  "#36c",    // accent
  "#6699cc", // steel
  "#447ff5", // hover blue
  "#7ca2d4", // sky
  "#a2a9b1", // border gray
  "#72777d", // muted
  "#54595d", // secondary
  "#8e9bae", // slate
  "#b0bec5", // cool gray
  "#9e9e9e", // neutral
];

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-wiki bg-[#eaecf0] ${className}`} />
  );
}

// ── Chart tooltip ─────────────────────────────────────────────────────────────

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: { percent: number };
  }>;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-wiki-surface border border-wiki-border rounded-wiki px-3 py-2 text-wiki-sm shadow-sm">
      <p className="font-bold text-wiki-text">{d.name}</p>
      <p className="text-wiki-secondary">
        {formatNumber(d.value)} edits ({(d.payload.percent * 100).toFixed(1)}%)
      </p>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { project, username } = useParams<{
    project: string;
    username: string;
  }>();

  const [summary, setSummary] = useState<UserSummary | null>(null);
  const [namespaces, setNamespaces] = useState<NamespaceEdit[]>([]);
  const [recentEdits, setRecentEdits] = useState<RecentEdit[]>([]);
  const [heatmapData, setHeatmapData] = useState<HeatmapDay[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [state, setState] = useState<LoadState>("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [heatmapLoading, setHeatmapLoading] = useState(false);

  function fetchData() {
    setState("loading");
    setErrorMsg("");

    const API_BASE = import.meta.env.VITE_API_BASE_URL || "";
    const base = `${API_BASE}/api/user/${project}/${username}`;

    Promise.all([
      fetch(`${base}/summary`).then((r) => {
        if (!r.ok) throw new Error(`Summary: ${r.status}`);
        return r.json() as Promise<UserSummary>;
      }),
      fetch(`${base}/namespaces`).then((r) => {
        if (!r.ok) throw new Error(`Namespaces: ${r.status}`);
        return r.json() as Promise<NamespaceEdit[]>;
      }),
      fetch(`${base}/recent-edits`).then((r) => {
        if (!r.ok) throw new Error(`Recent edits: ${r.status}`);
        return r.json() as Promise<RecentEdit[]>;
      }),
    ])
      .then(([sum, ns, edits]) => {
        setSummary(sum);
        setNamespaces(ns);
        setRecentEdits(edits);
        setState(sum.totalEdits === 0 ? "empty" : "success");
      })
      .catch((err) => {
        console.error(err);
        setErrorMsg(
          err.message?.includes("404")
            ? "User not found on this project. Check the username and try again."
            : err.message?.includes("504") || err.message?.includes("Timeout")
            ? "The Wikimedia servers are taking too long to respond. Please try again later."
            : "Something went wrong while fetching data. Please try again."
        );
        setState("error");
      });
  }

  useEffect(() => {
    if (project && username) fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project, username]);

  useEffect(() => {
    if (!project || !username) return;
    const fetchHeatmap = async () => {
      setHeatmapLoading(true);
      try {
        const API_BASE = import.meta.env.VITE_API_BASE_URL || "";
        const url = `${API_BASE}/api/user/${project}/${username}/heatmap/${selectedYear}`;
        console.log(`[Frontend] Fetching heatmap for year ${selectedYear} -> ${url}`);
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Heatmap: ${res.status}`);
        const data = (await res.json()) as HeatmapResponse;
        setHeatmapData(data.heatmap);
        // Only set available years on the first fetch
        if (availableYears.length === 0 && data.availableYears.length > 0) {
          setAvailableYears(data.availableYears);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setHeatmapLoading(false);
      }
    };
    fetchHeatmap();
  }, [project, username, selectedYear]);

  const decodedUser = decodeURIComponent(username ?? "");

  // ── Milestones ──────────────────────────────────────────────────────────

  function getMilestone(edits: number) {
    if (edits >= 5000) return "5k+ Edits";
    if (edits >= 1000) return "1k+ Edits";
    if (edits >= 500) return "500+ Edits";
    if (edits >= 100) return "100+ Edits";
    return null;
  }

  // ── Stat cards config ───────────────────────────────────────────────────

  const milestone = summary ? getMilestone(summary.totalEdits) : null;

  const stats = summary
    ? [
        { label: "Total global edits", value: formatNumber(summary.globalEditCount), badge: milestone },
        { label: `Edits on ${project}`, value: formatNumber(summary.totalEdits) },
        {
          label: "Account age",
          value: formatAccountAge(summary.registrationDate),
        },
        { label: "Live / Deleted", value: `${formatNumber(summary.liveEdits)} / ${formatNumber(summary.deletedEdits)}` },
      ]
    : [];

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-wiki-bg flex flex-col max-w-full overflow-x-hidden">
      {/* ── Header bar ─────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-wiki-border sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg
              className="w-7 h-7 text-wiki-text"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12.09 13.119c-.14 1.064-.496 2.2-1.056 3.405-.56 1.205-1.254 2.2-2.08 2.985-.826.786-1.625 1.178-2.397 1.178-.485 0-.862-.17-1.13-.511-.268-.34-.402-.777-.402-1.311 0-.762.258-1.877.773-3.346.516-1.47 1.16-2.994 1.934-4.573.773-1.578 1.55-2.89 2.33-3.933.78-1.044 1.435-1.566 1.963-1.566.34 0 .597.186.773.557.175.372.263.81.263 1.317 0 .754-.146 1.717-.437 2.89-.292 1.173-.602 1.96-.93 2.36zm2.7-1.766c0-.134.047-.398.14-.793.094-.395.14-.66.14-.793 0-.554-.168-.831-.504-.831-.222 0-.46.155-.712.465-.253.31-.547.81-.881 1.501a29.596 29.596 0 0 0-1.056 2.64c-.34.963-.62 1.846-.84 2.65-.222.806-.332 1.36-.332 1.664 0 .42.144.63.433.63.29 0 .645-.28 1.063-.843.418-.563.865-1.32 1.341-2.272.476-.953.87-1.955 1.18-3.008.31-1.053.465-1.91.465-2.573l-.437.563z" />
            </svg>
            <Link
              to="/"
              className="font-serif text-lg text-wiki-text no-underline hover:no-underline"
            >
              Contribution Dashboard
            </Link>
          </div>

          <Link
            to="/"
            className="text-wiki-sm text-wiki-blue hover:text-wiki-blue-hover"
          >
            ← Search another user
          </Link>
        </div>
      </header>

      {/* ── Page title ─────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 pt-6 pb-2">
        <h1 className="font-serif text-2xl text-wiki-text border-b border-wiki-border pb-2">
          User:{decodedUser}
        </h1>
        <p className="text-wiki-sm text-wiki-muted mt-1">
          Contribution statistics on{" "}
          <span className="text-wiki-text font-bold">{project}</span>
        </p>
      </div>

      {/* ── Main ───────────────────────────────────────────────────────── */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* ── Loading ────────────────────────────────────────────────── */}
        {state === "loading" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-wiki-surface border border-wiki-border rounded-wiki p-4"
                >
                  <Skeleton className="h-3 w-20 mb-2" />
                  <Skeleton className="h-6 w-28" />
                </div>
              ))}
            </div>
            <div className="bg-wiki-surface border border-wiki-border rounded-wiki p-6">
              <Skeleton className="h-4 w-44 mb-4" />
              <Skeleton className="h-56 w-full" />
            </div>
            <div className="bg-wiki-surface border border-wiki-border rounded-wiki">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="p-3 border-b border-wiki-border-light last:border-b-0 flex gap-4"
                >
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-12" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Error ──────────────────────────────────────────────────── */}
        {state === "error" && (
          <div className="bg-wiki-surface border border-wiki-border rounded-wiki p-6 text-center max-w-lg mx-auto mt-8">
            <div className="border-l-[3px] border-wiki-red bg-wiki-red-bg px-4 py-3 rounded-wiki text-left mb-4">
              <p className="text-wiki-base text-wiki-text">
                <strong>Error:</strong> {errorMsg}
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={fetchData}
                className="px-4 py-1.5 border border-wiki-border rounded-wiki bg-[#f8f9fa] hover:bg-[#eaecf0] text-wiki-base font-bold text-wiki-text transition-colors cursor-pointer"
              >
                Try again
              </button>
              <Link
                to="/"
                className="px-4 py-1.5 border border-wiki-border rounded-wiki bg-[#f8f9fa] hover:bg-[#eaecf0] text-wiki-base font-bold text-wiki-blue no-underline transition-colors"
              >
                New search
              </Link>
            </div>
          </div>
        )}

        {/* ── Empty ──────────────────────────────────────────────────── */}
        {state === "empty" && (
          <div className="bg-wiki-surface border border-wiki-border rounded-wiki p-6 text-center max-w-lg mx-auto mt-8">
            <p className="text-wiki-base text-wiki-secondary mb-4">
              <strong>{decodedUser}</strong> has no edits on{" "}
              <strong>{project}</strong>.
            </p>
            <Link
              to="/"
              className="px-4 py-1.5 border border-wiki-border rounded-wiki bg-[#f8f9fa] hover:bg-[#eaecf0] text-wiki-base font-bold text-wiki-blue no-underline transition-colors"
            >
              Search another user
            </Link>
          </div>
        )}

        {/* ── Success ────────────────────────────────────────────────── */}
        {state === "success" && summary && (
          <div className="space-y-6">
            {/* ── Stat cards ──────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="bg-wiki-surface border border-wiki-border rounded-wiki p-4"
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-wiki-xs text-wiki-muted uppercase tracking-wide">
                      {s.label}
                    </p>
                    {s.badge && (
                      <span className="bg-[#eaf3ff] text-wiki-blue text-[10px] font-bold px-1.5 py-0.5 rounded-sm border border-[#a7d7f9]">
                        {s.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xl font-bold text-wiki-text">{s.value}</p>
                </div>
              ))}
            </div>

            {/* ── Namespace breakdown ──────────────────────────────────── */}
            <section className="bg-wiki-surface border border-wiki-border rounded-wiki">
              <div className="bg-[#eaecf0] border-b border-wiki-border px-4 py-2 rounded-t-wiki">
                <h2 className="text-wiki-base font-bold text-wiki-text">
                  Edits by namespace
                </h2>
              </div>

              {namespaces.length > 0 ? (
                <div className="p-4 flex flex-col lg:flex-row items-center gap-6">
                  {/* Donut */}
                  <div className="w-full lg:w-1/2 h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={namespaces}
                          dataKey="count"
                          nameKey="namespace"
                          cx="50%"
                          cy="50%"
                          innerRadius="50%"
                          outerRadius="80%"
                          paddingAngle={1}
                          strokeWidth={1}
                          stroke="#a2a9b1"
                        >
                          {namespaces.map((_, i) => (
                            <Cell
                              key={i}
                              fill={CHART_COLORS[i % CHART_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          content={<ChartTooltip />}
                          wrapperStyle={{ outline: "none" }}
                        />
                        <Legend
                          layout="vertical"
                          align="right"
                          verticalAlign="middle"
                          iconType="square"
                          iconSize={10}
                          formatter={(value: string) => (
                            <span className="text-wiki-sm text-wiki-text">
                              {value}
                            </span>
                          )}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Table breakdown */}
                  <div className="w-full lg:w-1/2 overflow-x-auto max-w-full" style={{ WebkitOverflowScrolling: 'touch' }}>
                    {/* Desktop Table */}
                    <table className="hidden md:table wikitable text-wiki-sm w-full min-w-[300px]">
                      <thead>
                        <tr>
                          <th>Namespace</th>
                          <th className="text-right">Edits</th>
                          <th className="text-right">%</th>
                        </tr>
                      </thead>
                      <tbody>
                        {namespaces.map((ns) => {
                          const pct =
                            summary.totalEdits > 0
                              ? (
                                  (ns.count / summary.totalEdits) *
                                  100
                                ).toFixed(1)
                              : "0";
                          return (
                            <tr key={ns.namespace}>
                              <td>{ns.namespace}</td>
                              <td className="text-right tabular-nums">
                                {formatNumber(ns.count)}
                              </td>
                              <td className="text-right tabular-nums text-wiki-muted">
                                {pct}%
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                    {/* Mobile Cards */}
                    <div className="md:hidden flex flex-col divide-y divide-wiki-border border border-wiki-border rounded-wiki overflow-hidden">
                      {namespaces.map((ns) => {
                        const pct =
                          summary.totalEdits > 0
                            ? (
                                (ns.count / summary.totalEdits) *
                                100
                              ).toFixed(1)
                            : "0";
                        return (
                          <div key={ns.namespace} className="p-3 bg-wiki-surface flex justify-between items-center">
                            <span className="font-bold text-wiki-text">{ns.namespace}</span>
                            <div className="text-right">
                              <div className="font-bold tabular-nums">{formatNumber(ns.count)}</div>
                              <div className="text-wiki-xs text-wiki-muted tabular-nums">{pct}%</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="p-4 text-wiki-sm text-wiki-muted text-center">
                  No namespace data available.
                </p>
              )}
            </section>

            {/* ── Heatmap ─────────────────────────────────────────────── */}
            <section className="bg-wiki-surface border border-wiki-border rounded-wiki overflow-hidden">
              <div className="bg-[#eaecf0] border-b border-wiki-border px-4 py-2 flex items-center justify-between">
                <h2 className="text-wiki-base font-bold text-wiki-text">
                  Activity ({selectedYear})
                </h2>
                {heatmapLoading && (
                  <span className="text-wiki-sm text-wiki-muted animate-pulse">
                    Loading...
                  </span>
                )}
              </div>
              <div className="p-4 overflow-x-auto relative">
                <ContributionHeatmap 
                  data={heatmapData} 
                  availableYears={availableYears}
                  selectedYear={selectedYear}
                  onYearChange={setSelectedYear}
                />
              </div>
            </section>

            {/* ── Recent edits ────────────────────────────────────────── */}
            <section className="bg-wiki-surface border border-wiki-border rounded-wiki">
              <div className="bg-[#eaecf0] border-b border-wiki-border px-4 py-2 rounded-t-wiki">
                <h2 className="text-wiki-base font-bold text-wiki-text">
                  Recent changes
                </h2>
              </div>

              {recentEdits.length > 0 ? (
                <div className="overflow-x-auto max-w-full" style={{ WebkitOverflowScrolling: 'touch' }}>
                  {/* Desktop Table */}
                  <table className="hidden md:table wikitable w-full min-w-[500px]">
                    <thead>
                      <tr>
                        <th>Page</th>
                        <th>Comment</th>
                        <th className="text-right">Size</th>
                        <th className="text-right">Time</th>
                        <th className="text-center">Diff</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentEdits.map((edit, i) => (
                        <tr key={i}>
                          {/* Page */}
                          <td className="font-bold max-w-[200px]">
                            <span className="line-clamp-1">{edit.title}</span>
                          </td>

                          {/* Comment — italic like Wikipedia edit summaries */}
                          <td className="italic text-wiki-secondary max-w-[260px]">
                            <span className="line-clamp-1">
                              {edit.comment || (
                                <span className="text-wiki-muted not-italic">
                                  (no edit summary)
                                </span>
                              )}
                            </span>
                          </td>

                          {/* Size change */}
                          <td className="text-right tabular-nums whitespace-nowrap">
                            <span
                              className={`font-bold ${
                                edit.sizeChange > 0
                                  ? "text-wiki-green"
                                  : edit.sizeChange < 0
                                  ? "text-wiki-red"
                                  : "text-wiki-muted"
                              }`}
                            >
                              {edit.sizeChange > 0 ? "+" : ""}
                              {formatNumber(edit.sizeChange)}
                            </span>
                          </td>

                          {/* Timestamp */}
                          <td
                            className="text-right text-wiki-muted whitespace-nowrap"
                            title={new Date(edit.timestamp).toLocaleString()}
                          >
                            {timeAgo(edit.timestamp)}
                          </td>

                          {/* Diff link */}
                          <td className="text-center">
                            <a
                              href={edit.diffUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-wiki-blue hover:text-wiki-blue-hover text-wiki-sm"
                            >
                              diff
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Mobile Cards */}
                  <div className="md:hidden flex flex-col divide-y divide-wiki-border">
                    {recentEdits.map((edit, i) => (
                      <div key={i} className="p-4 flex flex-col gap-2">
                        <div className="font-bold text-wiki-text text-base">
                          {edit.title}
                        </div>
                        <div className="text-wiki-sm italic text-wiki-secondary">
                          {edit.comment || (
                            <span className="text-wiki-muted not-italic">
                              (no edit summary)
                            </span>
                          )}
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <div className="text-wiki-sm text-wiki-text">
                            <span className="font-bold">Size:</span>{" "}
                            <span
                              className={`font-bold tabular-nums ${
                                edit.sizeChange > 0
                                  ? "text-wiki-green"
                                  : edit.sizeChange < 0
                                  ? "text-wiki-red"
                                  : "text-wiki-muted"
                              }`}
                            >
                              {edit.sizeChange > 0 ? "+" : ""}
                              {formatNumber(edit.sizeChange)}
                            </span>
                          </div>
                          <div
                            className="text-wiki-sm text-wiki-muted tabular-nums"
                            title={new Date(edit.timestamp).toLocaleString()}
                          >
                            {timeAgo(edit.timestamp)}
                          </div>
                        </div>
                        <div className="mt-2">
                          <a
                            href={edit.diffUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block text-sm border border-wiki-blue text-wiki-blue text-center font-bold px-4 py-2 rounded-wiki transition-colors active:bg-[#c8ccd1] hover:bg-[#eaecf0]"
                          >
                            View Diff
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="p-4 text-wiki-sm text-wiki-muted text-center">
                  No recent edits found.
                </p>
              )}
            </section>
          </div>
        )}
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="border-t border-wiki-border py-4 mt-8">
        <p className="text-center text-wiki-xs text-wiki-muted">
          Data from{" "}
          <a href="https://xtools.wmcloud.org" target="_blank" rel="noopener noreferrer">
            XTools
          </a>{" "}
          &amp;{" "}
          <a
            href="https://www.mediawiki.org/wiki/API:Main_page"
            target="_blank"
            rel="noopener noreferrer"
          >
            MediaWiki API
          </a>
          . Not affiliated with the Wikimedia Foundation.
        </p>
      </footer>
      <Footer />
    </div>
  );
}
