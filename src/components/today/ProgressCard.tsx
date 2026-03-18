import { ProgressRing } from "@/components/today/ProgressRing";
import { StreakBadge } from "@/components/today/StreakBadge";
import { WeekStrip } from "@/components/today/WeekStrip";
import type { StreakInfo } from "@/lib/actions/logs";
import type { WeekLogData } from "@/lib/actions/logs";

type ProgressCardProps = {
  completed: number;
  total: number;
  streak: StreakInfo;
  weekData: WeekLogData;
  todayDate: string;
};

export function ProgressCard({
  completed,
  total,
  streak,
  weekData,
  todayDate,
}: ProgressCardProps) {
  return (
    <div
      style={{
        backgroundColor: "#FFFCF7",
        border: "1px solid rgba(139, 115, 85, 0.1)",
        borderRadius: 20,
        boxShadow: "0 4px 24px rgba(139, 115, 85, 0.06)",
        padding: "24px",
      }}
    >
      {/* Top section: ring + stats */}
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <ProgressRing completed={completed} total={total} />

        <div style={{ flex: 1 }}>
          <p
            style={{
              fontFamily: "var(--font-alegreya), Georgia, serif",
              fontSize: 20,
              fontWeight: 600,
              color: "#3D2B1F",
              margin: "0 0 4px",
            }}
          >
            {completed === total && total > 0
              ? "All collected!"
              : total === 0
              ? "No moments yet"
              : `${total - completed} remaining`}
          </p>
          <p
            style={{
              fontFamily: "var(--font-source-sans), sans-serif",
              fontSize: 13,
              color: "#A6895D",
              margin: "0 0 12px",
            }}
          >
            {completed === total && total > 0
              ? "Connection before direction, every day."
              : "Connection before direction."}
          </p>

          <StreakBadge streak={streak.currentStreak} />
        </div>
      </div>

      {/* Week strip */}
      <div style={{ marginTop: 20 }}>
        <WeekStrip weekData={weekData} todayDate={todayDate} />
      </div>
    </div>
  );
}
