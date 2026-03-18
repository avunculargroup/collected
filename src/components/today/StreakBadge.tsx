type StreakBadgeProps = {
  streak: number;
};

export function StreakBadge({ streak }: StreakBadgeProps) {
  if (streak === 0) return null;

  return (
    <div
      className={streak > 0 ? "animate-streak-pulse" : ""}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        background: "linear-gradient(135deg, #8B7355, #A6895D)",
        color: "#FFF5E6",
        borderRadius: 9999,
        padding: "6px 14px",
        fontFamily: "var(--font-source-sans), sans-serif",
        fontSize: 13,
        fontWeight: 600,
      }}
    >
      <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path
          d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
          stroke="#FFF5E6"
          strokeWidth="1.8"
          fill="rgba(255,245,230,0.4)"
        />
      </svg>
      {streak} day{streak !== 1 ? "s" : ""} streak
    </div>
  );
}
