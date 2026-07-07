import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { formatNumber, formatAccountAge } from "../utils/format";

interface MergedWiki {
  wikiName: string;
  url: string;
  editCount: number;
  registrationDate: string;
}

interface GlobalSummary {
  username: string;
  totalGlobalEdits: number;
  totalWikis: number;
  mergedWikis: MergedWiki[];
}

export default function GlobalDashboardPage() {
  const { username } = useParams<{ username: string }>();
  const [summary, setSummary] = useState<GlobalSummary | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!username) return;

    const fetchGlobalData = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/user/global/${encodeURIComponent(username)}`);
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch global stats");
        }
        
        setSummary(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchGlobalData();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-wiki-bg p-8 flex justify-center">
        <div className="text-wiki-muted font-sans animate-pulse">
          Loading global contributions for {username}...
        </div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="min-h-screen bg-wiki-bg p-8 flex justify-center">
        <div className="max-w-md w-full bg-wiki-red/10 border border-wiki-red text-wiki-red p-4 rounded-wiki">
          <p className="font-bold mb-2">Error</p>
          <p>{error}</p>
          <Link
            to="/"
            className="inline-block mt-4 text-wiki-blue hover:underline"
          >
            &larr; Try another search
          </Link>
        </div>
      </div>
    );
  }

  // Derive milestone badge logic for total global edits
  let milestone = "";
  if (summary.totalGlobalEdits >= 5000) milestone = "5k+ Edits";
  else if (summary.totalGlobalEdits >= 1000) milestone = "1k+ Edits";
  else if (summary.totalGlobalEdits >= 500) milestone = "500+ Edits";
  else if (summary.totalGlobalEdits >= 100) milestone = "100+ Edits";

  return (
    <div className="min-h-screen bg-wiki-bg">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="bg-wiki-header border-b border-wiki-border sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-2xl text-wiki-text">
              User:{summary.username}
            </h1>
            <p className="text-wiki-sm text-wiki-secondary mt-0.5">
              Global Contributions
            </p>
          </div>
          <Link
            to="/"
            className="text-wiki-sm text-wiki-blue hover:underline"
          >
            Search another user
          </Link>
        </div>
      </header>

      {/* ── Main Content ────────────────────────────────────────────────── */}
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-wiki-surface border border-wiki-border rounded-wiki p-4">
            <h3 className="text-wiki-sm font-bold text-wiki-secondary mb-1 uppercase tracking-wider">
              Total Global Edits
            </h3>
            <div className="flex items-baseline gap-3">
              <p className="font-serif text-3xl text-wiki-text">
                {formatNumber(summary.totalGlobalEdits)}
              </p>
              {milestone && (
                <span className="bg-wiki-blue text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                  {milestone}
                </span>
              )}
            </div>
          </div>
          <div className="bg-wiki-surface border border-wiki-border rounded-wiki p-4">
            <h3 className="text-wiki-sm font-bold text-wiki-secondary mb-1 uppercase tracking-wider">
              Projects Contributed To
            </h3>
            <p className="font-serif text-3xl text-wiki-text">
              {formatNumber(summary.totalWikis)}
            </p>
          </div>
        </div>

        {/* Projects List */}
        <section>
          <div className="border-b border-wiki-border pb-2 mb-4">
            <h2 className="font-serif text-2xl text-wiki-text">
              Projects
            </h2>
          </div>
          
          <div className="bg-wiki-surface border border-wiki-border rounded-wiki overflow-hidden">
            <table className="w-full text-left text-wiki-base">
              <thead className="bg-[#eaecf0] border-b border-wiki-border">
                <tr>
                  <th className="px-4 py-2 font-bold text-wiki-text">Wiki Project</th>
                  <th className="px-4 py-2 font-bold text-wiki-text text-right">Edit Count</th>
                  <th className="px-4 py-2 font-bold text-wiki-text hidden sm:table-cell">Registration Date</th>
                  <th className="px-4 py-2 font-bold text-wiki-text text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-wiki-border">
                {summary.mergedWikis.map((wiki) => {
                  // Extract domain from URL (e.g., https://en.wikipedia.org -> en.wikipedia.org)
                  const projectDomain = wiki.url.replace(/^https?:\/\//, '');
                  
                  return (
                    <tr key={wiki.wikiName} className="hover:bg-[#f8f9fa] transition-colors">
                      <td className="px-4 py-2">
                        <a 
                          href={wiki.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-bold text-wiki-blue hover:underline"
                        >
                          {projectDomain}
                        </a>
                      </td>
                      <td className="px-4 py-2 text-right">
                        {formatNumber(wiki.editCount)}
                      </td>
                      <td className="px-4 py-2 text-wiki-secondary hidden sm:table-cell">
                        {formatAccountAge(wiki.registrationDate)}
                      </td>
                      <td className="px-4 py-2 text-right">
                        {wiki.editCount > 0 ? (
                          <Link 
                            to={`/dashboard/${projectDomain}/${encodeURIComponent(summary.username)}`}
                            className="text-sm border border-wiki-blue text-wiki-blue hover:bg-wiki-blue hover:text-white px-3 py-1 rounded-wiki transition-colors"
                          >
                            View Details
                          </Link>
                        ) : (
                          <span className="text-sm text-wiki-muted italic">No edits</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

      </main>
    </div>
  );
}
