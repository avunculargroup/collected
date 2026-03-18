import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getChildProfiles } from "@/lib/actions/profiles";
import { SettingsClient } from "@/components/settings/SettingsClient";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const childProfiles = await getChildProfiles();

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
          Your Account
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
          Profile
        </h1>
      </div>

      {/* User info */}
      <div
        style={{
          backgroundColor: "#FFFCF7",
          border: "1px solid #E8DCC8",
          borderRadius: 16,
          padding: "20px",
          marginBottom: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              backgroundColor: "#F2EBDF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-alegreya), Georgia, serif",
              fontSize: 20,
              fontWeight: 600,
              color: "#8B7355",
            }}
          >
            {session.user.name
              ? session.user.name[0].toUpperCase()
              : session.user.email?.[0].toUpperCase() ?? "U"}
          </div>
          <div>
            <p
              style={{
                fontFamily: "var(--font-alegreya), Georgia, serif",
                fontSize: 16,
                fontWeight: 600,
                color: "#3D2B1F",
                margin: "0 0 2px",
              }}
            >
              {session.user.name ?? "Parent"}
            </p>
            <p
              style={{
                fontFamily: "var(--font-source-sans), sans-serif",
                fontSize: 13,
                color: "#A6895D",
                margin: 0,
              }}
            >
              {session.user.email}
            </p>
          </div>
        </div>
      </div>

      {/* Child profiles + other settings */}
      <SettingsClient childProfiles={childProfiles} />

      {/* Sign out */}
      <div style={{ marginTop: 28 }}>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            style={{
              width: "100%",
              backgroundColor: "transparent",
              border: "1.5px solid #E8DCC8",
              borderRadius: 14,
              padding: "14px",
              fontFamily: "var(--font-source-sans), sans-serif",
              fontSize: 14,
              color: "#8B7355",
              cursor: "pointer",
            }}
          >
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
