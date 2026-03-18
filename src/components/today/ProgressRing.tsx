"use client";

import { useEffect, useState } from "react";

type ProgressRingProps = {
  completed: number;
  total: number;
  size?: number;
  strokeWidth?: number;
};

export function ProgressRing({
  completed,
  total,
  size = 120,
  strokeWidth = 8,
}: ProgressRingProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = total > 0 ? completed / total : 0;

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progress);
    }, 100);
    return () => clearTimeout(timer);
  }, [progress]);

  const strokeDashoffset = circumference - animatedProgress * circumference;

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        flexShrink: 0,
      }}
    >
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(139, 115, 85, 0.15)"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#8B7355"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{
            transition: "stroke-dashoffset 0.6s ease-out",
          }}
        />
      </svg>
      {/* Center text */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-alegreya), Georgia, serif",
            fontSize: 28,
            fontWeight: 700,
            color: "#3D2B1F",
            lineHeight: 1,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {completed}
        </span>
        <span
          style={{
            fontFamily: "var(--font-source-sans), sans-serif",
            fontSize: 11,
            fontWeight: 600,
            color: "#A6895D",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginTop: 2,
          }}
        >
          of {total}
        </span>
      </div>
    </div>
  );
}
