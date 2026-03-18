import { signIn } from "@/lib/auth";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ verify?: string; error?: string }>;
}) {
  const session = await auth();
  if (session?.user) redirect("/today");

  const params = await searchParams;
  const isVerify = params.verify === "1";
  const hasError = !!params.error;

  return (
    <div
      style={{
        minHeight: "100dvh",
        backgroundColor: "#F5EDE0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 400,
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <p
            style={{
              fontFamily: "var(--font-alegreya), Georgia, serif",
              fontStyle: "italic",
              fontSize: 14,
              color: "#A6895D",
              margin: "0 0 8px",
              letterSpacing: "0.02em",
            }}
          >
            connection before direction
          </p>
          <h1
            style={{
              fontFamily: "var(--font-alegreya), Georgia, serif",
              fontSize: 36,
              fontWeight: 600,
              color: "#3D2B1F",
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            Collected
          </h1>
        </div>

        {/* Card */}
        <div
          style={{
            backgroundColor: "#FFFCF7",
            border: "1px solid #E8DCC8",
            borderRadius: 20,
            padding: "28px 24px",
            boxShadow: "0 4px 24px rgba(139, 115, 85, 0.06)",
          }}
        >
          {isVerify ? (
            <div style={{ textAlign: "center" }}>
              <p
                style={{
                  fontFamily: "var(--font-alegreya), Georgia, serif",
                  fontSize: 20,
                  fontWeight: 600,
                  color: "#3D2B1F",
                  margin: "0 0 12px",
                }}
              >
                Check your email
              </p>
              <p
                style={{
                  fontFamily: "var(--font-source-sans), sans-serif",
                  fontSize: 14,
                  color: "#8B7355",
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                A magic sign-in link is on its way. Click it to access your
                practice.
              </p>
            </div>
          ) : (
            <>
              <h2
                style={{
                  fontFamily: "var(--font-alegreya), Georgia, serif",
                  fontSize: 22,
                  fontWeight: 600,
                  color: "#3D2B1F",
                  margin: "0 0 6px",
                }}
              >
                Welcome back
              </h2>
              <p
                style={{
                  fontFamily: "var(--font-source-sans), sans-serif",
                  fontSize: 14,
                  color: "#A6895D",
                  margin: "0 0 24px",
                }}
              >
                Sign in to your collection practice.
              </p>

              {hasError && (
                <div
                  style={{
                    backgroundColor: "#F8E0E8",
                    border: "1px solid rgba(140, 74, 94, 0.2)",
                    borderRadius: 10,
                    padding: "12px 14px",
                    marginBottom: 20,
                  }}
                >
                  <p
                    style={{
                      fontFamily: "var(--font-source-sans), sans-serif",
                      fontSize: 13,
                      color: "#8C4A5E",
                      margin: 0,
                    }}
                  >
                    Sign-in failed. Please try again.
                  </p>
                </div>
              )}

              {/* Email form */}
              <form
                action={async (formData) => {
                  "use server";
                  await signIn("resend", {
                    email: formData.get("email") as string,
                    redirectTo: "/today",
                  });
                }}
              >
                <div style={{ marginBottom: 16 }}>
                  <label
                    htmlFor="email"
                    style={{
                      fontFamily: "var(--font-source-sans), sans-serif",
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#A6895D",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      display: "block",
                      marginBottom: 8,
                    }}
                  >
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    style={{
                      width: "100%",
                      border: "1.5px solid #E8DCC8",
                      borderRadius: 8,
                      padding: "12px 14px",
                      fontFamily: "var(--font-source-sans), sans-serif",
                      fontSize: 15,
                      color: "#3D2B1F",
                      backgroundColor: "#FFFCF7",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
                <button
                  type="submit"
                  style={{
                    width: "100%",
                    background:
                      "linear-gradient(135deg, #3D2B1F, #5C4033, #8B7355)",
                    color: "#FFF5E6",
                    border: "none",
                    borderRadius: 14,
                    padding: "14px 24px",
                    fontFamily: "var(--font-source-sans), sans-serif",
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: "pointer",
                    boxShadow: "0 4px 20px rgba(42, 24, 16, 0.25)",
                  }}
                >
                  Send magic link
                </button>
              </form>
            </>
          )}
        </div>

        <p
          style={{
            textAlign: "center",
            fontFamily: "var(--font-source-sans), sans-serif",
            fontSize: 12,
            color: "#C4A882",
            marginTop: 20,
          }}
        >
          By continuing, you agree to our terms of use.
        </p>
      </div>
    </div>
  );
}
