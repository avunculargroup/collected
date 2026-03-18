import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { BottomNav } from "@/components/ui/BottomNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        backgroundColor: "#F5EDE0",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        maxWidth: 480,
        margin: "0 auto",
      }}
    >
      {/* Paper grain overlay */}
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

      <main
        style={{
          flex: 1,
          overflowY: "auto",
          paddingBottom: 80,
          position: "relative",
          zIndex: 1,
        }}
      >
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
