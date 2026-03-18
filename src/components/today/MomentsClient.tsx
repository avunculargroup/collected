"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toggleMomentActive, deleteMoment, createMoment } from "@/lib/actions/moments";
import { MomentIcon, getMomentTypeLabel } from "@/components/ui/MomentIcon";
import type { CollectionMoment, MomentType } from "@/lib/schema";

type MomentsClientProps = {
  moments: CollectionMoment[];
};

const MOMENT_TYPES: MomentType[] = [
  "morning",
  "transition",
  "afterschool",
  "play",
  "bedtime",
  "holdonto",
  "custom",
];

export function MomentsClient({ moments: initialMoments }: MomentsClientProps) {
  const [moments, setMoments] = useState(initialMoments);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newType, setNewType] = useState<MomentType>("custom");
  const [isPending, startTransition] = useTransition();

  function handleToggle(id: string) {
    startTransition(async () => {
      const updated = await toggleMomentActive(id);
      setMoments((prev) =>
        prev.map((m) => (m.id === id ? updated : m))
      );
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Remove this moment from your practice?")) return;
    startTransition(async () => {
      await deleteMoment(id);
      setMoments((prev) => prev.filter((m) => m.id !== id));
    });
  }

  function handleAdd() {
    if (!newTitle.trim()) return;
    startTransition(async () => {
      const created = await createMoment({
        type: newType,
        title: newTitle.trim(),
        description: newDescription.trim(),
        source: "manual",
      });
      setMoments((prev) => [...prev, created]);
      setNewTitle("");
      setNewDescription("");
      setNewType("custom");
      setShowAddForm(false);
    });
  }

  const active = moments.filter((m) => m.active);
  const inactive = moments.filter((m) => !m.active);

  return (
    <div>
      {/* Active moments */}
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
        Active ({active.length})
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {active.map((moment) => (
          <MomentListItem
            key={moment.id}
            moment={moment}
            onToggle={handleToggle}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* Add button */}
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
          marginTop: 10,
          fontFamily: "var(--font-source-sans), sans-serif",
          fontSize: 14,
          color: "#8B7355",
          fontWeight: 600,
        }}
      >
        <Plus size={16} strokeWidth={1.5} />
        Add a moment manually
      </button>

      {/* Add form */}
      {showAddForm && (
        <div
          style={{
            backgroundColor: "#FFFCF7",
            border: "1px solid #E8DCC8",
            borderRadius: 14,
            padding: "16px",
            marginTop: 10,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div>
            <label
              style={{
                fontFamily: "var(--font-source-sans), sans-serif",
                fontSize: 11,
                fontWeight: 600,
                color: "#A6895D",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                display: "block",
                marginBottom: 6,
              }}
            >
              Type
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {MOMENT_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setNewType(type)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "6px 10px",
                    borderRadius: 8,
                    border:
                      newType === type
                        ? "2px solid #8B7355"
                        : "1.5px solid #E8DCC8",
                    backgroundColor:
                      newType === type ? "#F2EBDF" : "transparent",
                    cursor: "pointer",
                    fontFamily: "var(--font-source-sans), sans-serif",
                    fontSize: 12,
                    color: newType === type ? "#3D2B1F" : "#8B7355",
                    fontWeight: newType === type ? 600 : 400,
                  }}
                >
                  <MomentIcon type={type} size={13} />
                  {getMomentTypeLabel(type)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              style={{
                fontFamily: "var(--font-source-sans), sans-serif",
                fontSize: 11,
                fontWeight: 600,
                color: "#A6895D",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                display: "block",
                marginBottom: 6,
              }}
            >
              Title
            </label>
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Name this moment..."
              style={{
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
              }}
            />
          </div>

          <div>
            <label
              style={{
                fontFamily: "var(--font-source-sans), sans-serif",
                fontSize: 11,
                fontWeight: 600,
                color: "#A6895D",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                display: "block",
                marginBottom: 6,
              }}
            >
              Description (optional)
            </label>
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Brief description of how to do this moment..."
              rows={3}
              style={{
                width: "100%",
                border: "1.5px solid #E8DCC8",
                borderRadius: 8,
                padding: "10px 12px",
                fontFamily: "var(--font-source-sans), sans-serif",
                fontSize: 14,
                color: "#3D2B1F",
                backgroundColor: "#FFFCF7",
                outline: "none",
                resize: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={handleAdd}
              disabled={!newTitle.trim() || isPending}
              style={{
                flex: 1,
                background: "linear-gradient(135deg, #3D2B1F, #5C4033, #8B7355)",
                color: "#FFF5E6",
                border: "none",
                borderRadius: 12,
                padding: "12px",
                fontFamily: "var(--font-source-sans), sans-serif",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                opacity: !newTitle.trim() || isPending ? 0.6 : 1,
              }}
            >
              Add moment
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

      {/* Inactive moments */}
      {inactive.length > 0 && (
        <div style={{ marginTop: 28 }}>
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
            Paused ({inactive.length})
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {inactive.map((moment) => (
              <MomentListItem
                key={moment.id}
                moment={moment}
                onToggle={handleToggle}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MomentListItem({
  moment,
  onToggle,
  onDelete,
}: {
  moment: CollectionMoment;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div
      style={{
        backgroundColor: "#FFFCF7",
        border: "1px solid #E8DCC8",
        borderRadius: 14,
        padding: "14px 16px",
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        opacity: moment.active ? 1 : 0.6,
      }}
    >
      {/* Icon */}
      <div style={{ marginTop: 2, flexShrink: 0 }}>
        <MomentIcon type={moment.type} size={18} showCircle />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontFamily: "var(--font-alegreya), Georgia, serif",
            fontSize: 15,
            fontWeight: 600,
            color: "#3D2B1F",
            margin: "0 0 2px",
          }}
        >
          {moment.title}
        </p>
        {moment.description && (
          <p
            style={{
              fontFamily: "var(--font-source-sans), sans-serif",
              fontSize: 12,
              color: "#A6895D",
              margin: 0,
              lineHeight: 1.4,
            }}
          >
            {moment.description}
          </p>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
        {/* Toggle active */}
        <button
          onClick={() => onToggle(moment.id)}
          title={moment.active ? "Pause" : "Activate"}
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            border: "1.5px solid #D4C4A8",
            backgroundColor: moment.active ? "#F2EBDF" : "transparent",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              backgroundColor: moment.active ? "#8B7355" : "#D4C4A8",
            }}
          />
        </button>

        {/* Delete */}
        <button
          onClick={() => onDelete(moment.id)}
          title="Remove"
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            border: "1.5px solid #D4C4A8",
            backgroundColor: "transparent",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Trash2 size={14} strokeWidth={1.5} color="#C4A882" />
        </button>
      </div>
    </div>
  );
}
