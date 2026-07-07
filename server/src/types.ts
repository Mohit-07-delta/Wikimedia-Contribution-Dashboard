// ── XTools: simple_editcount response ─────────────────────────────────────────
export interface XToolsSimpleEditCountResponse {
  username: string;
  project: string;
  namespace: string;
  user_id: number;
  live_edit_count: number;
  deleted_edit_count: number;
  user_groups: string[];
  global_user_groups: string[];
  creation_count: number;
  elapsed_time: number;
}

// ── MediaWiki: users query response (for registration date) ───────────────────
export interface MediaWikiUsersResponse {
  query: {
    users: Array<{
      userid: number;
      name: string;
      registration: string; // ISO timestamp
      editcount: number;
    }>;
  };
}

// ── XTools: namespace_totals response ─────────────────────────────────────────
export interface XToolsNamespaceTotalsResponse {
  username: string;
  project: string;
  namespace_totals: Record<string, number>; // keyed by namespace ID string
  elapsed_time: number;
}

// ── MediaWiki: usercontribs response ──────────────────────────────────────────
export interface MediaWikiUserContrib {
  userid: number;
  user: string;
  pageid: number;
  revid: number;
  parentid: number;
  ns: number;
  title: string;
  timestamp: string;
  comment: string;
  sizediff: number;
}

export interface MediaWikiUserContribsResponse {
  query: {
    usercontribs: MediaWikiUserContrib[];
  };
  continue?: {
    uccontinue: string;
    continue: string;
  };
}

export interface MediaWikiGlobalUserInfoResponse {
  query: {
    globaluserinfo?: {
      home: string;
      id: number;
      registration: string;
      name: string;
      editcount: number;
      merged?: Array<{
        wiki: string;
        url: string;
        editcount: number;
        registration: string;
      }>;
    };
  };
}

// ── Our API output shapes ─────────────────────────────────────────────────────

export interface UserSummary {
  username: string;
  project: string;
  totalEdits: number;
  liveEdits: number;
  deletedEdits: number;
  registrationDate: string;
  globalEditCount: number;
}

export interface NamespaceEdit {
  namespace: string;
  count: number;
}

export interface RecentEdit {
  title: string;
  timestamp: string;
  comment: string;
  sizeChange: number;
  diffUrl: string;
}

export interface MergedWiki {
  wikiName: string;
  url: string;
  editCount: number;
  registrationDate: string;
}

export interface GlobalSummary {
  username: string;
  totalGlobalEdits: number;
  totalWikis: number;
  mergedWikis: MergedWiki[];
}

export interface HeatmapDay {
  date: string; // "YYYY-MM-DD"
  count: number;
}

export interface ApiErrorResponse {
  error: string;
  details?: string;
}

export interface HeatmapResponse {
  heatmap: HeatmapDay[];
  availableYears: number[];
}
