import type { WeekLogData } from "@/lib/actions/logs";

type MonthHeatmapProps = {
  monthData: WeekLogData;
  todayDate: string;
};

function getDayLabel(dateStr: string): string {
  const days = ["S", "M", "T", "W", "T", "F", "S"];
  const d = new Date(dateStr + "T12:00:00");
  return days[d.getDay()];
}

function getMonthDayLabel(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return String(d.getDate());
}

function getCellColor(rate: number): string {
  if (rate === 0) return "transparent";
  if (rate >= 1) return "#8B7355";
  if (rate >= 0.5) return "rgba(139, 115, 85, 0.4)";
  return "rgba(139, 115, 85, 0.15)";
}

// Group dates by week (7 days each)
function groupByWeeks(dates: WeekLogData): WeekLogData[] {
  const weeks: WeekLogData[] = [];
  for (let i = 0; i < dates.length; i += 7) {
    weeks.push(dates.slice(i, i + 7));
  }
  return weeks;
}

export function MonthHeatmap({ monthData, todayDate }: MonthHeatmapProps) {
  const weeks = groupByWeeks(monthData);
  const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <div>
      {/* Day labels */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 4,
          marginBottom: 6,
        }}
      >
        {dayLabels.map((label, i) => (
          <div
            key={i}
            style={{
              textAlign: "center",
              fontFamily: "var(--font-source-sans), sans-serif",
              fontSize: 10,
              fontWeight: 600,
              color: "#A6895D",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {label}
          </div>
        ))}
      </div>

      {/* Weeks grid */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {weeks.map((week, wi) => (
          <div
            key={wi}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: 4,
            }}
          >
            {week.map((day) => {
              const isToday = day.date === todayDate;
              const isFuture = day.date > todayDate;
              return (
                <div
                  key={day.date}
                  title={`${day.date}: ${Math.round(day.completionRate * 100)}% (${day.completedCount}/${day.totalActive})`}
                  style={{
                    aspectRatio: "1",
                    borderRadius: "50%",
                    backgroundColor: isFuture
                      ? "transparent"
                      : getCellColor(day.completionRate),
                    border: isToday
                      ? "2px solid #3D2B1F"
                      : "2px solid transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: isFuture ? 0.2 : 1,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-source-sans), sans-serif",
                      fontSize: 9,
                      fontWeight: 600,
                      color:
                        day.completionRate >= 1
                          ? "#FFF5E6"
                          : isToday
                          ? "#3D2B1F"
                          : "#A6895D",
                    }}
                  >
                    {getMonthDayLabel(day.date)}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div
        style={{
          display: "flex",
          gap: 16,
          marginTop: 16,
          justifyContent: "center",
        }}
      >
        {[
          { color: "rgba(139, 115, 85, 0.15)", label: "Started" },
          { color: "rgba(139, 115, 85, 0.4)", label: "50%+" },
          { color: "#8B7355", label: "Complete" },
        ].map(({ color, label }) => (
          <div
            key={label}
            style={{ display: "flex", alignItems: "center", gap: 5 }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                backgroundColor: color,
                border: "1px solid rgba(139, 115, 85, 0.2)",
              }}
            />
            <span
              style={{
                fontFamily: "var(--font-source-sans), sans-serif",
                fontSize: 11,
                color: "#A6895D",
              }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
