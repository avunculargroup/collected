"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  createChildProfile,
  updateChildProfile,
  deleteChildProfile,
  type CreateChildInput,
} from "@/lib/actions/profiles";
import type { ChildProfile } from "@/lib/schema";

type SettingsClientProps = {
  childProfiles: ChildProfile[];
};

export function SettingsClient({ childProfiles: initial }: SettingsClientProps) {
  const [profiles, setProfiles] = useState(initial);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState<CreateChildInput>({
    name: "",
    age: 6,
    interests: [],
    challenges: "",
  });
  const [interestsInput, setInterestsInput] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleAddProfile() {
    if (!form.name.trim()) return;
    const interests = interestsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    startTransition(async () => {
      const created = await createChildProfile({ ...form, interests });
      setProfiles((prev) => [...prev, created]);
      setForm({ name: "", age: 6, interests: [], challenges: "" });
      setInterestsInput("");
      setShowAddForm(false);
    });
  }

  function handleDeleteProfile(id: string) {
    if (!confirm("Remove this child profile?")) return;
    startTransition(async () => {
      await deleteChildProfile(id);
      setProfiles((prev) => prev.filter((p) => p.id !== id));
    });
  }

  return (
    <div>
      {/* Child profiles section */}
      <div style={{ marginBottom: 24 }}>
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
          Children ({profiles.length})
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {profiles.map((profile) => {
            const interests = (() => {
              try {
                return JSON.parse(profile.interests ?? "[]") as string[];
              } catch {
                return [];
              }
            })();

            return (
              <div
                key={profile.id}
                style={{
                  backgroundColor: "#FFFCF7",
                  border: "1px solid #E8DCC8",
                  borderRadius: 14,
                  padding: "14px 16px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    backgroundColor: "#F2EBDF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "var(--font-alegreya), Georgia, serif",
                    fontSize: 18,
                    fontWeight: 600,
                    color: "#8B7355",
                    flexShrink: 0,
                  }}
                >
                  {profile.name[0].toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      fontFamily: "var(--font-alegreya), Georgia, serif",
                      fontSize: 16,
                      fontWeight: 600,
                      color: "#3D2B1F",
                      margin: "0 0 2px",
                    }}
                  >
                    {profile.name}
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-source-sans), sans-serif",
                      fontSize: 12,
                      color: "#A6895D",
                      margin: 0,
                    }}
                  >
                    Age {profile.age}
                    {interests.length > 0 && ` · ${interests.slice(0, 2).join(", ")}`}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteProfile(profile.id)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    border: "1.5px solid #E8DCC8",
                    backgroundColor: "transparent",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Trash2 size={14} strokeWidth={1.5} color="#C4A882" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Add child button */}
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            width: "100%",
            backgroundColor: "transparent",
            border: "1.5px dashed #D4C4A8",
            borderRadius: 14,
            padding: "14px 18px",
            cursor: "pointer",
            marginTop: 8,
            fontFamily: "var(--font-source-sans), sans-serif",
            fontSize: 14,
            color: "#8B7355",
            fontWeight: 600,
          }}
        >
          <Plus size={16} strokeWidth={1.5} />
          Add a child profile
        </button>

        {/* Add child form */}
        {showAddForm && (
          <div
            style={{
              backgroundColor: "#FFFCF7",
              border: "1px solid #E8DCC8",
              borderRadius: 14,
              padding: "16px",
              marginTop: 8,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {[
              {
                label: "Name",
                input: (
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Child's first name"
                    style={inputStyle}
                  />
                ),
              },
              {
                label: "Age",
                input: (
                  <input
                    type="number"
                    value={form.age}
                    min={1}
                    max={18}
                    onChange={(e) =>
                      setForm({ ...form, age: parseInt(e.target.value) || 1 })
                    }
                    style={inputStyle}
                  />
                ),
              },
              {
                label: "Interests (comma separated)",
                input: (
                  <input
                    value={interestsInput}
                    onChange={(e) => setInterestsInput(e.target.value)}
                    placeholder="e.g., Lego, dinosaurs, drawing"
                    style={inputStyle}
                  />
                ),
              },
              {
                label: "Current challenges (optional)",
                input: (
                  <textarea
                    value={form.challenges}
                    onChange={(e) =>
                      setForm({ ...form, challenges: e.target.value })
                    }
                    placeholder="e.g., mornings are rough, seems more peer-oriented lately"
                    rows={2}
                    style={{ ...inputStyle, resize: "none" as const }}
                  />
                ),
              },
            ].map(({ label, input }) => (
              <div key={label}>
                <label style={labelStyle}>{label}</label>
                {input}
              </div>
            ))}

            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={handleAddProfile}
                disabled={!form.name.trim() || isPending}
                style={{
                  flex: 1,
                  background:
                    "linear-gradient(135deg, #3D2B1F, #5C4033, #8B7355)",
                  color: "#FFF5E6",
                  border: "none",
                  borderRadius: 12,
                  padding: "12px",
                  fontFamily: "var(--font-source-sans), sans-serif",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  opacity: !form.name.trim() || isPending ? 0.6 : 1,
                }}
              >
                Add profile
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                style={{
                  padding: "12px 16px",
                  backgroundColor: "transparent",
                  border: "1.5px solid #D4C4A8",
                  borderRadius: 12,
                  cursor: "pointer",
                  fontFamily: "var(--font-source-sans), sans-serif",
                  fontSize: 14,
                  color: "#8B7355",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* App info */}
      <div
        style={{
          backgroundColor: "#FFFCF7",
          border: "1px solid #E8DCC8",
          borderRadius: 14,
          padding: "16px",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-alegreya), Georgia, serif",
            fontStyle: "italic",
            fontSize: 14,
            color: "#8B7355",
            margin: "0 0 8px",
          }}
        >
          Collected
        </p>
        <p
          style={{
            fontFamily: "var(--font-source-sans), sans-serif",
            fontSize: 12,
            color: "#A6895D",
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          Rooted in Gordon Neufeld&apos;s attachment framework from{" "}
          <em>Hold On to Your Kids</em>. Connection before direction, every day.
        </p>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  border: "1.5px solid #E8DCC8",
  borderRadius: 8,
  padding: "10px 12px",
  fontFamily: "var(--font-source-sans), sans-serif",
  fontSize: 14,
  color: "#3D2B1F",
  backgroundColor: "#FFFCF7",
  outline: "none",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-source-sans), sans-serif",
  fontSize: 11,
  fontWeight: 600,
  color: "#A6895D",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  display: "block",
  marginBottom: 6,
};
