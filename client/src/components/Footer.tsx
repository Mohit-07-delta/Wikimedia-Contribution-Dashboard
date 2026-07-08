export default function Footer() {
  return (
    <footer className="mt-auto border-t border-wiki-border bg-wiki-bg px-4 py-4">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 text-wiki-xs text-wiki-muted font-sans">
        <div>Built by Mohit</div>
        <div className="flex gap-4">
          <a
            href="https://github.com/Mohit-07-delta"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-wiki-blue hover:underline transition-colors"
          >
            GitHub Profile
          </a>
          <a
            href="https://github.com/Mohit-07-delta/Wikimedia-Contribution-Dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-wiki-blue hover:underline transition-colors"
          >
            View Source
          </a>
        </div>
      </div>
    </footer>
  );
}
