"use client";

import { useState, useTransition } from "react";
import { toggleLog } from "@/lib/actions/logs";
import { MomentIcon } from "@/components/ui/MomentIcon";
import type { MomentWithLog } from "@/lib/actions/logs";

type MomentCardProps = {
  momentWithLog: MomentWithLog;
  date: string;
  index: number;
};

export function MomentCard({ momentWithLog, date, index }: MomentCardProps) {
  const { log, ...moment } = momentWithLog;
  const [checked, setChecked] = useState(log?.completed ?? false);
  const [isPending, startTransition] = useTransition();
  const [justChecked, setJustChecked] = useState(false);

  function handleToggle() {
    const newValue = !checked;
    setChecked(newValue);
    if (newValue) setJustChecked(true);

    startTransition(async () => {
      try {
        await toggleLog(moment.id, date);
      } catch {
        // Revert on error
        setChecked(!newValue);
      }
      setTimeout(() => setJustChecked(false), 500);
    });
  }

  return (
    <div
      className="animate-fade-up"
      style={{
        animationDelay: `${index * 50}ms`,
        backgroundColor: checked ? "#F2EBDF" : "#FFFCF7",
        border: "1px solid #E8DCC8",
        borderRadius: "16px",
        padding: "16px 18px",
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
        transition: "background-color 0.2s ease",
        opacity: checked ? 0.85 : 1,
      }}
    >
      {/* Checkbox */}
      <button
        onClick={handleToggle}
        disabled={isPending}
        aria-label={checked ? "Mark incomplete" : "Mark complete"}
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          border: checked ? "none" : "2px solid #D4C4A8",
          backgroundColor: checked ? "#8B7355" : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          cursor: "pointer",
          transition: "background-color 0.15s ease, border-color 0.15s ease",
        }}
        className={justChecked ? "animate-spring-check" : ""}
      >
        {checked && (
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            style={{
              strokeDasharray: 20,
              strokeDashoffset: justChecked ? 20 : 0,
              transition: justChecked ? "stroke-dashoffset 0.15s ease" : "none",
            }}
          >
            <polyline
              points="2,7 6,11 12,3"
              stroke="#FFFCF7"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      {/* Icon + Content */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", flex: 1 }}>
        <div style={{ marginTop: 2, flexShrink: 0 }}>
          <MomentIcon type={moment.type} size={18} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontFamily: "var(--font-alegreya), Georgia, serif",
              fontSize: 16,
              fontWeight: 600,
              color: checked ? "#A6895D" : "#3D2B1F",
              textDecoration: checked ? "line-through" : "none",
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            {moment.title}
          </p>
          <p
            style={{
              fontFamily: "var(--font-source-sans), sans-serif",
              fontSize: 13,
              color: "#A6895D",
              margin: "4px 0 0",
              lineHeight: 1.5,
            }}
          >
            {moment.description}
          </p>
        </div>
      </div>
    </div>
  );
}
