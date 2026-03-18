import type { WeekLogData } from "@/lib/actions/logs";

type WeekStripProps = {
  weekData: WeekLogData;
  todayDate: string;
};

function getDayLabel(dateStr: string): string {
  const days = ["S", "M", "T", "W", "T", "F", "S"];
  const d = new Date(dateStr + "T12:00:00");
  return days[d.getDay()];
}

function getCellColor(rate: number): string {
  if (rate === 0) return "transparent";
  if (rate >= 1) return "#8B7355";
  if (rate >= 0.5) return "rgba(139, 115, 85, 0.4)";
  return "rgba(139, 115, 85, 0.15)";
}

export function WeekStrip({ weekData, todayDate }: WeekStripProps) {
  return (
    <div>
      <p
        style={{
          fontFamily: "var(--font-source-sans), sans-serif",
          fontSize: 10,
          fontWeight: 600,
          color: "#A6895D",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          margin: "0 0 8px",
        }}
      >
        This week
      </p>
      <div style={{ display: "flex", gap: 4 }}>
        {weekData.map((day) => {
          const isToday = day.date === todayDate;
          return (
            <div
              key={day.date}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  backgroundColor: getCellColor(day.completionRate),
                  border: isToday ? "2px solid #3D2B1F" : "2px solid transparent",
                }}
              />
              <span
                style={{
                  fontFamily: "var(--font-source-sans), sans-serif",
                  fontSize: 10,
                  fontWeight: 600,
                  color: isToday ? "#3D2B1F" : "#A6895D",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {getDayLabel(day.date)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
