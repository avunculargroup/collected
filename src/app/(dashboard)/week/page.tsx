import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getMonthLogs, getStreakData } from "@/lib/actions/logs";
import { MonthHeatmap } from "@/components/week/MonthHeatmap";
import { todayDate } from "@/lib/utils";

export default async function WeekPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const today = todayDate();

  const [monthData, streak] = await Promise.all([
    getMonthLogs(),
    getStreakData(session.user.id),
  ]);

  const totalCompletions = monthData.reduce(
    (sum, d) => sum + d.completedCount,
    0
  );
  const activeDays = monthData.filter(
    (d) => d.completionRate > 0 && d.date <= today
  ).length;

  return (
    <div style={{ padding: "20px" }}>
      {/* Header */}
      <div style={{ marginBottom: 20, paddingTop: 8 }}>
        <p
          style={{
            fontFamily: "var(--font-source-sans), sans-serif",
            fontSize: 11,
            fontWeight: 600,
            color: "#A6895D",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            margin: "0 0 4px",
          }}
        >
          Last 4 Weeks
        </p>
        <h1
          style={{
            fontFamily: "var(--font-alegreya), Georgia, serif",
            fontSize: 24,
            fontWeight: 600,
            color: "#3D2B1F",
            margin: 0,
            letterSpacing: "-0.01em",
          }}
        >
          Your Practice
        </h1>
      </div>

      {/* Stats row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 12,
          marginBottom: 24,
        }}
      >
        {[
          {
            label: "Current Streak",
            value: `${streak.currentStreak}d`,
            sub: "days in a row",
          },
          {
            label: "Best Streak",
            value: `${streak.bestStreak}d`,
            sub: "personal best",
          },
          {
            label: "Active Days",
            value: activeDays,
            sub: "last 28 days",
          },
        ].map(({ label, value, sub }) => (
          <div
            key={label}
            style={{
              backgroundColor: "#FFFCF7",
              border: "1px solid #E8DCC8",
              borderRadius: 14,
              padding: "14px 12px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-alegreya), Georgia, serif",
                fontSize: 24,
                fontWeight: 700,
                color: "#3D2B1F",
                margin: "0 0 2px",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {value}
            </p>
            <p
              style={{
                fontFamily: "var(--font-source-sans), sans-serif",
                fontSize: 10,
                fontWeight: 600,
                color: "#A6895D",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                margin: 0,
              }}
            >
              {sub}
            </p>
          </div>
        ))}
      </div>

      {/* Heatmap */}
      <div
        style={{
          backgroundColor: "#FFFCF7",
          border: "1px solid #E8DCC8",
          borderRadius: 16,
          padding: "20px",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-source-sans), sans-serif",
            fontSize: 11,
            fontWeight: 600,
            color: "#A6895D",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            margin: "0 0 16px",
          }}
        >
          Collection Heatmap
        </p>
        <MonthHeatmap monthData={monthData} todayDate={today} />
      </div>

      {/* Total completions callout */}
      {totalCompletions > 0 && (
        <div
          style={{
            marginTop: 20,
            backgroundColor: "#E8F0E2",
            border: "1px solid rgba(94, 128, 82, 0.2)",
            borderRadius: 14,
            padding: "16px 20px",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-alegreya), Georgia, serif",
              fontStyle: "italic",
              fontSize: 16,
              color: "#4A6741",
              margin: 0,
            }}
          >
            {totalCompletions} collection moment
            {totalCompletions !== 1 ? "s" : ""} in the last 28 days — each one
            a deposit into the attachment account.
          </p>
        </div>
      )}
    </div>
  );
}
