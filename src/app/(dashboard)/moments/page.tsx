import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getMoments } from "@/lib/actions/moments";
import { MomentsClient } from "@/components/today/MomentsClient";

export default async function MomentsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const moments = await getMoments();

  return (
    <div style={{ padding: "20px" }}>
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
          Manage
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
          Collection Moments
        </h1>
      </div>

      <MomentsClient moments={moments} />
    </div>
  );
}
