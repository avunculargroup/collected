import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const session = await auth();
  if (session?.user) redirect("/today");

  return (
    <div
      style={{
        minHeight: "100dvh",
        backgroundColor: "#F5EDE0",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Paper grain */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          opacity: 0.04,
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: "256px",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div
        style={{
          maxWidth: 480,
          margin: "0 auto",
          padding: "0 20px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Hero */}
        <div style={{ paddingTop: 80, paddingBottom: 60, textAlign: "center" }}>
          <p
            style={{
              fontFamily: "var(--font-alegreya), Georgia, serif",
              fontStyle: "italic",
              fontSize: 15,
              color: "#A6895D",
              margin: "0 0 16px",
              letterSpacing: "0.02em",
            }}
          >
            connection before direction
          </p>
          <h1
            style={{
              fontFamily: "var(--font-alegreya), Georgia, serif",
              fontSize: 48,
              fontWeight: 700,
              color: "#3D2B1F",
              margin: "0 0 20px",
              letterSpacing: "-0.02em",
              lineHeight: 1,
            }}
          >
            Collected
          </h1>
          <p
            style={{
              fontFamily: "var(--font-source-sans), sans-serif",
              fontSize: 17,
              color: "#6E5240",
              margin: "0 0 36px",
              lineHeight: 1.6,
            }}
          >
            Build the daily habit of intentional connection with your children.
            Rooted in Gordon Neufeld&apos;s attachment science.
          </p>

          <Link
            href="/login"
            style={{
              display: "inline-block",
              background: "linear-gradient(135deg, #3D2B1F, #5C4033, #8B7355)",
              color: "#FFF5E6",
              textDecoration: "none",
              borderRadius: 14,
              padding: "16px 36px",
              fontFamily: "var(--font-source-sans), sans-serif",
              fontSize: 16,
              fontWeight: 600,
              boxShadow: "0 4px 20px rgba(42, 24, 16, 0.25)",
            }}
          >
            Start your practice
          </Link>
        </div>

        {/* Feature cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingBottom: 60 }}>
          {[
            {
              iconBg: "#F8E8DA",
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="4" stroke="#A85C3A" strokeWidth="1.8" fill="#E4B494" fillOpacity="0.6" />
                  <line x1="12" y1="2" x2="12" y2="5" stroke="#A85C3A" strokeWidth="1.8" />
                  <line x1="12" y1="19" x2="12" y2="22" stroke="#A85C3A" strokeWidth="1.8" />
                  <line x1="2" y1="12" x2="5" y2="12" stroke="#A85C3A" strokeWidth="1.8" />
                  <line x1="19" y1="12" x2="22" y2="12" stroke="#A85C3A" strokeWidth="1.8" />
                </svg>
              ),
              title: "Daily Collection Moments",
              description:
                "A short list of personalized micro-rituals — mornings, pickups, bedtimes, play time — that you check off throughout the day.",
            },
            {
              iconBg: "#F8E8DA",
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="#A85C3A" strokeWidth="1.8" fill="#E4B494" fillOpacity="0.4" />
                </svg>
              ),
              title: "AI Collection Coach",
              description:
                "A warm coach powered by Claude — designs moments tailored to your child's age, interests, and challenges. Grounded in attachment science.",
            },
            {
              iconBg: "#E8F0E2",
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" stroke="#5E8052" strokeWidth="1.8" fill="#B8CFA9" fillOpacity="0.4" />
                  <line x1="16" y1="2" x2="16" y2="6" stroke="#5E8052" strokeWidth="1.8" />
                  <line x1="8" y1="2" x2="8" y2="6" stroke="#5E8052" strokeWidth="1.8" />
                  <line x1="3" y1="10" x2="21" y2="10" stroke="#5E8052" strokeWidth="1.8" />
                </svg>
              ),
              title: "Streaks & Practice Tracking",
              description:
                "A 4-week heatmap makes the invisible work of attachment visible. Streaks build momentum. Progress becomes motivating.",
            },
          ].map(({ icon, iconBg, title, description }) => (
            <div
              key={title}
              style={{
                backgroundColor: "#FFFCF7",
                border: "1px solid #E8DCC8",
                borderRadius: 16,
                padding: "20px",
                display: "flex",
                gap: 16,
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  backgroundColor: iconBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {icon}
              </div>
              <div>
                <p
                  style={{
                    fontFamily: "var(--font-alegreya), Georgia, serif",
                    fontSize: 17,
                    fontWeight: 600,
                    color: "#3D2B1F",
                    margin: "0 0 6px",
                  }}
                >
                  {title}
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-source-sans), sans-serif",
                    fontSize: 14,
                    color: "#6E5240",
                    margin: 0,
                    lineHeight: 1.5,
                  }}
                >
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer quote */}
        <div style={{ textAlign: "center", paddingBottom: 40 }}>
          <p
            style={{
              fontFamily: "var(--font-alegreya), Georgia, serif",
              fontStyle: "italic",
              fontSize: 16,
              color: "#8B7355",
              margin: "0 0 8px",
            }}
          >
            &ldquo;The most important thing in the world is to feel seen.&rdquo;
          </p>
          <p
            style={{
              fontFamily: "var(--font-source-sans), sans-serif",
              fontSize: 12,
              color: "#C4A882",
              margin: 0,
            }}
          >
            — Gordon Neufeld
          </p>
        </div>
      </div>
    </div>
  );
}
