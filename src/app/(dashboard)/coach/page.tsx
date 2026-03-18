import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ChatInterface } from "@/components/coach/ChatInterface";

export default async function CoachPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <div style={{ paddingTop: 8 }}>
      {/* Header */}
      <div
        style={{
          padding: "12px 20px 12px",
          borderBottom: "1px solid #E8DCC8",
          backgroundColor: "#FFFCF7",
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
            margin: "0 0 2px",
          }}
        >
          AI-Powered
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
          Collection Coach
        </h1>
      </div>

      <ChatInterface />
    </div>
  );
}
