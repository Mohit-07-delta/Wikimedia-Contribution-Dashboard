/**
 * Format an ISO date string into a human-readable account age.
 * Example: "2001-03-27T20:47:31Z" → "25 years, 3 months"
 */
export function formatAccountAge(isoDate: string): string {
  const reg = new Date(isoDate);
  if (isNaN(reg.getTime())) return "Unknown";

  const now = new Date();
  let years = now.getFullYear() - reg.getFullYear();
  let months = now.getMonth() - reg.getMonth();

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const parts: string[] = [];
  if (years > 0) parts.push(`${years} year${years !== 1 ? "s" : ""}`);
  if (months > 0) parts.push(`${months} month${months !== 1 ? "s" : ""}`);

  return parts.length > 0 ? parts.join(", ") : "< 1 month";
}

/**
 * Format an ISO timestamp as relative time, e.g. "2 hours ago".
 */
export function timeAgo(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) return "just now";

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? "s" : ""} ago`;

  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hour${diffHr !== 1 ? "s" : ""} ago`;

  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 30) return `${diffDay} day${diffDay !== 1 ? "s" : ""} ago`;

  const diffMonth = Math.floor(diffDay / 30);
  if (diffMonth < 12)
    return `${diffMonth} month${diffMonth !== 1 ? "s" : ""} ago`;

  const diffYear = Math.floor(diffMonth / 12);
  return `${diffYear} year${diffYear !== 1 ? "s" : ""} ago`;
}

/**
 * Format a number with commas, e.g. 14886 → "14,886"
 */
export function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}
