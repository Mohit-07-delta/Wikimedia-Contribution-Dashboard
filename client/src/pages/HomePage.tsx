import { useState, type FormEvent } from "react";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = username.trim();

    if (!trimmed) {
      setError("Please enter a Wikimedia username.");
      return;
    }

    setError("");
    navigate(`/user/${encodeURIComponent(trimmed)}`);
  }

  return (
    <div className="min-h-screen bg-wiki-bg flex flex-col">
      {/* ── Wikipedia-style top bar ──────────────────────────────────────── */}
      <header className="bg-white border-b border-wiki-border">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          {/* Wikipedia "W" style mark */}
          <svg className="w-8 h-8 text-wiki-text" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.09 13.119c-.14 1.064-.496 2.2-1.056 3.405-.56 1.205-1.254 2.2-2.08 2.985-.826.786-1.625 1.178-2.397 1.178-.485 0-.862-.17-1.13-.511-.268-.34-.402-.777-.402-1.311 0-.762.258-1.877.773-3.346.516-1.47 1.16-2.994 1.934-4.573.773-1.578 1.55-2.89 2.33-3.933.78-1.044 1.435-1.566 1.963-1.566.34 0 .597.186.773.557.175.372.263.81.263 1.317 0 .754-.146 1.717-.437 2.89-.292 1.173-.602 1.96-.93 2.36zm2.7-1.766c0-.134.047-.398.14-.793.094-.395.14-.66.14-.793 0-.554-.168-.831-.504-.831-.222 0-.46.155-.712.465-.253.31-.547.81-.881 1.501a29.596 29.596 0 0 0-1.056 2.64c-.34.963-.62 1.846-.84 2.65-.222.806-.332 1.36-.332 1.664 0 .42.144.63.433.63.29 0 .645-.28 1.063-.843.418-.563.865-1.32 1.341-2.272.476-.953.87-1.955 1.18-3.008.31-1.053.465-1.91.465-2.573l-.437.563z"/>
          </svg>
          <span className="font-serif text-xl text-wiki-text">
            Contribution Dashboard
          </span>
        </div>
      </header>

      {/* ── Main content ────────────────────────────────────────────────── */}
      <main className="max-w-xl mx-auto px-4 pt-12 pb-20">
        {/* Title block */}
        <div className="border-b border-wiki-border pb-4 mb-6">
          <h1 className="font-serif text-3xl text-wiki-text leading-tight">
            Wikimedia Contribution Dashboard
          </h1>
          <p className="mt-2 text-wiki-secondary text-wiki-base">
            Look up edit statistics, namespace breakdowns, and recent
            contributions for any Wikimedia user across projects.
          </p>
        </div>

        {/* Search form — styled like a Wikipedia infobox */}
        <form
          onSubmit={handleSubmit}
          className="bg-wiki-surface border border-wiki-border rounded-wiki"
        >
          {/* Form header bar */}
          <div className="bg-[#eaecf0] border-b border-wiki-border px-4 py-2 rounded-t-wiki">
            <h2 className="text-wiki-base font-bold text-wiki-text">
              Look up a contributor
            </h2>
          </div>

          <div className="px-4 py-4 space-y-4">
            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="block text-wiki-sm font-bold text-wiki-text mb-1"
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
                placeholder="e.g. Jimbo Wales"
                className={`w-full border rounded-wiki px-3 py-1.5 text-wiki-base text-wiki-text bg-wiki-surface placeholder:text-wiki-muted outline-none transition-colors focus:border-wiki-blue focus:shadow-[inset_0_0_0_1px_#3366cc] ${
                  error ? "border-wiki-red" : "border-wiki-border"
                }`}
              />
              {error && (
                <p className="mt-1 text-wiki-sm text-wiki-red">{error}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-1.5 border border-wiki-border rounded-wiki bg-[#f8f9fa] hover:bg-[#eaecf0] active:bg-[#c8ccd1] text-wiki-base font-bold text-wiki-text transition-colors cursor-pointer"
            >
              View Dashboard
            </button>
          </div>
        </form>

        {/* Info note */}
        <div className="mt-6 border-l-[3px] border-wiki-blue bg-wiki-blue-light px-4 py-3 rounded-wiki">
          <p className="text-wiki-sm text-wiki-text">
            <strong>Tip:</strong> Enter the exact Wikimedia username
            (case-sensitive). Data is sourced from{" "}
            <a
              href="https://xtools.wmcloud.org"
              target="_blank"
              rel="noopener noreferrer"
            >
              XTools
            </a>{" "}
            and the{" "}
            <a
              href="https://www.mediawiki.org/wiki/API:Main_page"
              target="_blank"
              rel="noopener noreferrer"
            >
              MediaWiki API
            </a>
            .
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
