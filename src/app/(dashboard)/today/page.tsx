import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTodayMoments, getWeekLogs, getStreakData } from "@/lib/actions/logs";
import { seedDefaultMoments } from "@/lib/actions/moments";
import { ProgressCard } from "@/components/today/ProgressCard";
import { MomentCard } from "@/components/today/MomentCard";
import { todayDate } from "@/lib/utils";

export default async function TodayPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const today = todayDate();

  // Seed default moments if this is the first time
  await seedDefaultMoments(session.user.id);

  // Fetch data in parallel
  const [momentsWithLogs, weekData, streak] = await Promise.all([
    getTodayMoments(today),
    getWeekLogs(
      (() => {
        const d = new Date(today);
        d.setDate(d.getDate() - d.getDay()); // start of week (Sunday)
        return d.toISOString().split("T")[0];
      })()
    ),
    getStreakData(session.user.id),
  ]);

  const completed = momentsWithLogs.filter((m) => m.log?.completed).length;
  const total = momentsWithLogs.length;

  return (
    <div
      style={{
        padding: "20px 20px 0",
      }}
    >
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
          {new Date(today + "T12:00:00").toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
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
          Today&apos;s Collection
        </h1>
      </div>

      {/* Progress card */}
      <ProgressCard
        completed={completed}
        total={total}
        streak={streak}
        weekData={weekData}
        todayDate={today}
      />

      {/* Moments list */}
      <div style={{ marginTop: 24 }}>
        <p
          style={{
            fontFamily: "var(--font-source-sans), sans-serif",
            fontSize: 11,
            fontWeight: 600,
            color: "#A6895D",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            margin: "0 0 12px",
          }}
        >
          Collection Moments
        </p>

        {momentsWithLogs.length === 0 ? (
          <div
            style={{
              backgroundColor: "#FFFCF7",
              border: "1px solid #E8DCC8",
              borderRadius: 16,
              padding: "32px 24px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-alegreya), Georgia, serif",
                fontSize: 18,
                color: "#8B7355",
                margin: "0 0 8px",
              }}
            >
              No moments yet
            </p>
            <p
              style={{
                fontFamily: "var(--font-source-sans), sans-serif",
                fontSize: 14,
                color: "#A6895D",
                margin: 0,
              }}
            >
              Visit the Coach tab to generate personalized collection moments,
              or add some manually in Moments.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {momentsWithLogs.map((momentWithLog, i) => (
              <MomentCard
                key={momentWithLog.id}
                momentWithLog={momentWithLog}
                date={today}
                index={i}
              />
            ))}
          </div>
        )}
      </div>

      {/* Reflection prompt */}
      {completed > 0 && (
        <div
          style={{
            marginTop: 24,
            backgroundColor: "#F8E8DA",
            border: "1px solid rgba(168, 92, 58, 0.15)",
            borderRadius: 16,
            padding: "16px 18px",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-alegreya), Georgia, serif",
              fontStyle: "italic",
              fontSize: 15,
              color: "#8C4A2F",
              margin: 0,
            }}
          >
            &ldquo;The most important thing in the world is to feel seen.&rdquo;
          </p>
          <p
            style={{
              fontFamily: "var(--font-source-sans), sans-serif",
              fontSize: 12,
              color: "#A85C3A",
              margin: "6px 0 0",
            }}
          >
            — Gordon Neufeld
          </p>
        </div>
      )}
    </div>
  );
}
