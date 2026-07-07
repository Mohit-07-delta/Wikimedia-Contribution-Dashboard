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
}

// ── Our API output shapes ─────────────────────────────────────────────────────

export interface UserSummary {
  username: string;
  project: string;
  totalEdits: number;
  liveEdits: number;
  deletedEdits: number;
  registrationDate: string;
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

export interface ApiErrorResponse {
  error: string;
  details?: string;
}
