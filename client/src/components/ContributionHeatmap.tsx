import { useState } from "react";

interface HeatmapDay {
  date: string;
  count: number;
}

interface Props {
  data: HeatmapDay[];
  availableYears: number[];
  selectedYear: number;
  onYearChange: (year: number) => void;
}

const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];
const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/**
 * Map a count to a Wikipedia-style blue intensity.
 * 0 = empty, then 4 tiers of increasing blue.
 */
function getCellColor(count: number): string {
  if (count === 0) return "#eaecf0"; // wiki gray
  if (count === 1) return "#c8d8f0"; // light blue
  if (count <= 3) return "#8ab4f8";  // medium blue
  if (count <= 6) return "#4285f4";  // strong blue
  return "#1a56db";                   // deep blue
}

function getCellBorder(count: number): string {
  if (count === 0) return "#c8ccd1";
  return "transparent";
}

export default function ContributionHeatmap({ data, availableYears, selectedYear, onYearChange }: Props) {
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    date: string;
    count: number;
  } | null>(null);

  // Build a lookup map: "YYYY-MM-DD" → count
  const countMap = new Map<string, number>();
  for (const d of data) {
    countMap.set(d.date, d.count);
  }

  // Build grid spanning from Jan 1st to Dec 31st of selectedYear
  const startOfYear = new Date(selectedYear, 0, 1);
  const startDayOfWeek = startOfYear.getDay(); // 0 = Sunday
  const startDate = new Date(startOfYear);
  startDate.setDate(startDate.getDate() - startDayOfWeek);

  const endOfYear = new Date(selectedYear, 11, 31);

  // Generate all cells
  const weeks: Array<Array<{ date: string; count: number; dateObj: Date; inYear: boolean }>> = [];
  let currentWeek: Array<{ date: string; count: number; dateObj: Date; inYear: boolean }> = [];

  const cursor = new Date(startDate);
  while (cursor <= endOfYear || currentWeek.length > 0) {
    if (currentWeek.length === 0 && cursor > endOfYear) {
      break;
    }
    const iso = cursor.toISOString().slice(0, 10);
    const inYear = cursor.getFullYear() === selectedYear;
    
    currentWeek.push({
      date: iso,
      count: countMap.get(iso) ?? 0,
      dateObj: new Date(cursor),
      inYear,
    });

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  // Month labels: find the first occurrence of each month in the grid
  const monthMarkers: Array<{ label: string; weekIndex: number }> = [];
  let lastMonth = -1;
  weeks.forEach((week, wi) => {
    for (const day of week) {
      const m = day.dateObj.getMonth();
      if (m !== lastMonth) {
        monthMarkers.push({ label: MONTH_LABELS[m], weekIndex: wi });
        lastMonth = m;
        break;
      }
    }
  });

  // Total edits in the heatmap range
  const totalInRange = data.reduce((sum, d) => sum + d.count, 0);

  const CELL_SIZE = 12;
  const CELL_GAP = 2;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {availableYears.length > 0 && (
            <select
              value={selectedYear}
              onChange={(e) => onYearChange(parseInt(e.target.value, 10))}
              className="px-2 py-1 bg-white border border-[#a2a9b1] rounded-wiki text-wiki-sm outline-none focus:border-wiki-blue"
            >
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          )}
          <p className="text-wiki-sm text-wiki-muted">
            <strong className="text-wiki-text">{totalInRange.toLocaleString()}</strong>{" "}
            contributions in {selectedYear}
          </p>
        </div>
        {/* Legend */}
        <div className="hidden sm:flex items-center gap-1 text-wiki-xs text-wiki-muted">
          <span>Less</span>
          {[0, 1, 2, 4, 7].map((n) => (
            <div
              key={n}
              className="border"
              style={{
                width: CELL_SIZE,
                height: CELL_SIZE,
                backgroundColor: getCellColor(n),
                borderColor: getCellBorder(n),
                borderRadius: 2,
              }}
            />
          ))}
          <span>More</span>
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto pb-1 relative max-w-full" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div style={{ minWidth: weeks.length * (CELL_SIZE + CELL_GAP) + 30 }}>
          {/* Month labels row */}
          <div
            className="flex text-wiki-xs text-wiki-muted mb-1"
            style={{ paddingLeft: 30 }}
          >
            {monthMarkers.map((m, i) => {
              const nextWi =
                i + 1 < monthMarkers.length
                  ? monthMarkers[i + 1].weekIndex
                  : weeks.length;
              const span = nextWi - m.weekIndex;
              return (
                <div
                  key={`${m.label}-${m.weekIndex}`}
                  style={{ width: span * (CELL_SIZE + CELL_GAP) }}
                >
                  {span >= 2 ? m.label : ""}
                </div>
              );
            })}
          </div>

          {/* Days grid */}
          <div className="flex">
            {/* Day of week labels */}
            <div
              className="flex flex-col shrink-0"
              style={{ width: 28, gap: CELL_GAP }}
            >
              {DAY_LABELS.map((label, i) => (
                <div
                  key={i}
                  className="text-wiki-xs text-wiki-muted text-right pr-1"
                  style={{ height: CELL_SIZE, lineHeight: `${CELL_SIZE}px` }}
                >
                  {label}
                </div>
              ))}
            </div>

            {/* Week columns */}
            <div className="flex" style={{ gap: CELL_GAP }}>
              {weeks.map((week, wi) => (
                <div
                  key={wi}
                  className="flex flex-col"
                  style={{ gap: CELL_GAP }}
                >
                  {week.map((day) => (
                      <div
                        key={day.date}
                        className={`cursor-default ${day.inYear ? "border" : ""}`}
                        style={{
                          width: CELL_SIZE,
                          height: CELL_SIZE,
                          backgroundColor: day.inYear ? getCellColor(day.count) : "transparent",
                          borderColor: day.inYear ? getCellBorder(day.count) : "transparent",
                          borderRadius: 2,
                        }}
                        onMouseEnter={(e) => {
                          if (!day.inYear) return;
                          const rect = (
                            e.target as HTMLElement
                          ).getBoundingClientRect();
                          setTooltip({
                            x: rect.left + rect.width / 2,
                            y: rect.top,
                            date: day.date,
                            count: day.count,
                          });
                        }}
                        onMouseLeave={() => setTooltip(null)}
                      />
                  ))}
                  {/* Pad short last week */}
                  {week.length < 7 &&
                    Array.from({ length: 7 - week.length }).map((_, i) => (
                      <div
                        key={`pad-${i}`}
                        style={{ width: CELL_SIZE, height: CELL_SIZE }}
                      />
                    ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="fixed z-50 pointer-events-none bg-wiki-surface border border-wiki-border text-wiki-blue text-wiki-xs px-2 py-1 rounded-wiki shadow-sm whitespace-nowrap"
            style={{
              left: tooltip.x,
              top: tooltip.y - 32,
              transform: "translateX(-50%)",
            }}
          >
            <strong>{tooltip.count} edit{tooltip.count !== 1 ? "s" : ""}</strong>{" "}
            on {new Date(tooltip.date + "T00:00:00").toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </div>
        )}
      </div>
    </div>
  );
}
