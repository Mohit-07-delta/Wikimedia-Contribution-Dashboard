import { Router, Request, Response } from "express";
import { cache, MemoryCache } from "../cache";
import type {
  XToolsSimpleEditCountResponse,
  XToolsNamespaceTotalsResponse,
  MediaWikiUserContribsResponse,
  MediaWikiUsersResponse,
  MediaWikiGlobalUserInfoResponse,
  UserSummary,
  NamespaceEdit,
  RecentEdit,
  HeatmapDay,
} from "../types";

const router = Router();

// ── Helpers ───────────────────────────────────────────────────────────────────

const XTOOLS_BASE = "https://xtools.wmcloud.org/api/user";
const FETCH_TIMEOUT_MS = 10_000; // 10 seconds

/** Human-readable names for MediaWiki namespace IDs */
const NAMESPACE_NAMES: Record<string, string> = {
  "0": "Article",
  "1": "Talk",
  "2": "User",
  "3": "User talk",
  "4": "Project",
  "5": "Project talk",
  "6": "File",
  "7": "File talk",
  "8": "MediaWiki",
  "9": "MediaWiki talk",
  "10": "Template",
  "11": "Template talk",
  "12": "Help",
  "13": "Help talk",
  "14": "Category",
  "15": "Category talk",
  "100": "Portal",
  "101": "Portal talk",
  "118": "Draft",
  "119": "Draft talk",
  "710": "TimedText",
  "711": "TimedText talk",
  "828": "Module",
  "829": "Module talk",
};

/**
 * Fetch JSON from an external API with a timeout.
 * Throws a descriptive error on failure.
 */
async function fetchJson<T>(url: string): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "WikiDashboard/1.0 (contact: https://github.com/Mohit-07-delta)" },
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new ApiProxyError(
        res.status === 404
          ? "not_found"
          : res.status === 429
          ? "rate_limited"
          : "upstream_error",
        `Upstream API returned ${res.status}`,
        body
      );
    }

    return (await res.json()) as T;
  } catch (err: unknown) {
    if (err instanceof ApiProxyError) throw err;

    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiProxyError(
        "timeout",
        `Upstream API did not respond within ${FETCH_TIMEOUT_MS / 1000}s`
      );
    }

    throw new ApiProxyError(
      "network_error",
      err instanceof Error ? err.message : "Unknown fetch error"
    );
  } finally {
    clearTimeout(timer);
  }
}

/** Structured error that maps cleanly to our JSON error responses. */
class ApiProxyError extends Error {
  constructor(
    public code:
      | "not_found"
      | "rate_limited"
      | "upstream_error"
      | "timeout"
      | "network_error",
    message: string,
    public details?: string
  ) {
    super(message);
  }

  get statusCode(): number {
    switch (this.code) {
      case "not_found":
        return 404;
      case "rate_limited":
        return 429;
      case "timeout":
        return 504;
      default:
        return 502;
    }
  }
}

/** Standard error handler for route callbacks. */
function sendError(res: Response, err: unknown): void {
  if (err instanceof ApiProxyError) {
    res.status(err.statusCode).json({
      error: err.message,
      ...(err.details && { details: err.details }),
    });
  } else {
    console.error("Unexpected error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// ── Route 1: User summary ────────────────────────────────────────────────────

router.get(
  "/:project/:username/summary",
  async (req: Request, res: Response) => {
    const { project, username } = req.params;
    const cacheKey = MemoryCache.key("summary", project, username);

    const cached = cache.get<UserSummary>(cacheKey);
    if (cached) {
      res.json(cached);
      return;
    }

    try {
      // Fetch edit counts from XTools and registration date from MediaWiki in parallel
      const xToolsUrl = `${XTOOLS_BASE}/simple_editcount/${encodeURIComponent(project)}/${encodeURIComponent(username)}`;

      const userInfoParams = new URLSearchParams({
        action: "query",
        list: "users",
        ususers: username,
        usprop: "registration|editcount",
        format: "json",
        origin: "*",
      });
      const userInfoUrl = `https://${project}/w/api.php?${userInfoParams.toString()}`;

      // Global user info from Meta-Wiki
      const globalParams = new URLSearchParams({
        action: "query",
        meta: "globaluserinfo",
        guiuser: username,
        guiprop: "editcount",
        format: "json",
        origin: "*",
      });
      const globalUrl = `https://meta.wikimedia.org/w/api.php?${globalParams.toString()}`;

      const [editData, userInfo, globalInfo] = await Promise.all([
        fetchJson<XToolsSimpleEditCountResponse>(xToolsUrl),
        fetchJson<MediaWikiUsersResponse>(userInfoUrl),
        fetchJson<MediaWikiGlobalUserInfoResponse>(globalUrl),
      ]);

      const registration = userInfo.query.users[0]?.registration ?? "unknown";
      const globalEditCount = globalInfo.query.globaluserinfo?.editcount ?? 0;

      const summary: UserSummary = {
        username: editData.username,
        project: editData.project,
        totalEdits: editData.live_edit_count + editData.deleted_edit_count,
        liveEdits: editData.live_edit_count,
        deletedEdits: editData.deleted_edit_count,
        registrationDate: registration,
        globalEditCount,
      };

      cache.set(cacheKey, summary);
      res.json(summary);
    } catch (err) {
      sendError(res, err);
    }
  }
);

// ── Route 2: Namespace breakdown ──────────────────────────────────────────────

router.get(
  "/:project/:username/namespaces",
  async (req: Request, res: Response) => {
    const { project, username } = req.params;
    const cacheKey = MemoryCache.key("namespaces", project, username);

    const cached = cache.get<NamespaceEdit[]>(cacheKey);
    if (cached) {
      res.json(cached);
      return;
    }

    try {
      const url = `${XTOOLS_BASE}/namespace_totals/${encodeURIComponent(project)}/${encodeURIComponent(username)}`;
      const data = await fetchJson<XToolsNamespaceTotalsResponse>(url);

      const namespaces: NamespaceEdit[] = Object.entries(
        data.namespace_totals
      ).map(([nsId, count]) => ({
        namespace: NAMESPACE_NAMES[nsId] ?? `Namespace ${nsId}`,
        count,
      }));

      // Sort by count descending so the most-edited namespaces come first
      namespaces.sort((a, b) => b.count - a.count);

      cache.set(cacheKey, namespaces);
      res.json(namespaces);
    } catch (err) {
      sendError(res, err);
    }
  }
);

// ── Route 3: Recent edits ────────────────────────────────────────────────────

router.get(
  "/:project/:username/recent-edits",
  async (req: Request, res: Response) => {
    const { project, username } = req.params;
    const cacheKey = MemoryCache.key("recent-edits", project, username);

    const cached = cache.get<RecentEdit[]>(cacheKey);
    if (cached) {
      res.json(cached);
      return;
    }

    try {
      const params = new URLSearchParams({
        action: "query",
        list: "usercontribs",
        ucuser: username,
        uclimit: "10",
        ucprop: "title|timestamp|comment|sizediff|ids",
        format: "json",
        origin: "*",
      });

      const url = `https://${project}/w/api.php?${params.toString()}`;
      const data = await fetchJson<MediaWikiUserContribsResponse>(url);

      const edits: RecentEdit[] = data.query.usercontribs.map((contrib) => ({
        title: contrib.title,
        timestamp: contrib.timestamp,
        comment: contrib.comment,
        sizeChange: contrib.sizediff,
        diffUrl: `https://${project}/w/index.php?diff=${contrib.revid}&oldid=${contrib.parentid}`,
      }));

      cache.set(cacheKey, edits);
      res.json(edits);
    } catch (err) {
      sendError(res, err);
    }
  }
);

// ── Route 4: Contribution heatmap ─────────────────────────────────────────────

router.get(
  "/:project/:username/heatmap",
  async (req: Request, res: Response) => {
    const { project, username } = req.params;
    const cacheKey = MemoryCache.key("heatmap", project, username);

    const cached = cache.get<HeatmapDay[]>(cacheKey);
    if (cached) {
      res.json(cached);
      return;
    }

    try {
      // Date boundary: 12 months ago from today
      const now = new Date();
      const cutoff = new Date(now);
      cutoff.setFullYear(cutoff.getFullYear() - 1);
      const cutoffIso = cutoff.toISOString();

      // Paginate through usercontribs, up to 500 edits total
      const MAX_EDITS = 500;
      const allTimestamps: string[] = [];
      let uccontinue: string | undefined;

      while (allTimestamps.length < MAX_EDITS) {
        const params = new URLSearchParams({
          action: "query",
          list: "usercontribs",
          ucuser: username,
          uclimit: String(Math.min(50, MAX_EDITS - allTimestamps.length)),
          ucprop: "timestamp",
          ucend: cutoffIso,       // stop at 12 months ago
          format: "json",
          origin: "*",
        });
        if (uccontinue) params.set("uccontinue", uccontinue);

        const url = `https://${project}/w/api.php?${params.toString()}`;
        const data = await fetchJson<MediaWikiUserContribsResponse>(url);

        for (const c of data.query.usercontribs) {
          allTimestamps.push(c.timestamp);
        }

        if (!data.continue?.uccontinue || data.query.usercontribs.length === 0) {
          break;
        }
        uccontinue = data.continue.uccontinue;
      }

      // Aggregate by YYYY-MM-DD
      const counts = new Map<string, number>();
      for (const ts of allTimestamps) {
        const day = ts.slice(0, 10); // "2024-07-01T..." → "2024-07-01"
        counts.set(day, (counts.get(day) ?? 0) + 1);
      }

      const heatmap: HeatmapDay[] = Array.from(counts.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));

      cache.set(cacheKey, heatmap);
      res.json(heatmap);
    } catch (err) {
      sendError(res, err);
    }
  }
);

export default router;
