import type { MomentType } from "@/lib/schema";

type MomentIconProps = {
  type: MomentType;
  size?: number;
  showCircle?: boolean;
};

const iconConfig: Record<
  MomentType,
  { circleBg: string; strokeColor: string; fillColor: string }
> = {
  morning: {
    circleBg: "#F8E8DA",
    strokeColor: "#A85C3A",
    fillColor: "#E4B494",
  },
  transition: {
    circleBg: "#E8F0E2",
    strokeColor: "#5E8052",
    fillColor: "#B8CFA9",
  },
  afterschool: {
    circleBg: "#F2EBDF",
    strokeColor: "#8B7355",
    fillColor: "#D4C4A8",
  },
  play: {
    circleBg: "#F8E0E8",
    strokeColor: "#A85C72",
    fillColor: "#E4B4C0",
  },
  bedtime: {
    circleBg: "#E8E4F0",
    strokeColor: "#7B6B8A",
    fillColor: "#C4BAD4",
  },
  holdonto: {
    circleBg: "#F8E8DA",
    strokeColor: "#A85C3A",
    fillColor: "#E4B494",
  },
  custom: {
    circleBg: "#E8F0E2",
    strokeColor: "#5E8052",
    fillColor: "#B8CFA9",
  },
};

function MorningSVG({
  stroke,
  fill,
  size,
}: {
  stroke: string;
  fill: string;
  size: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Sun circle */}
      <circle cx="12" cy="12" r="4" stroke={stroke} strokeWidth="1.8" fill={fill} fillOpacity="0.6" />
      {/* Rays */}
      <line x1="12" y1="2" x2="12" y2="5" stroke={stroke} strokeWidth="1.8" />
      <line x1="12" y1="19" x2="12" y2="22" stroke={stroke} strokeWidth="1.8" />
      <line x1="2" y1="12" x2="5" y2="12" stroke={stroke} strokeWidth="1.8" />
      <line x1="19" y1="12" x2="22" y2="12" stroke={stroke} strokeWidth="1.8" />
      <line x1="4.22" y1="4.22" x2="6.34" y2="6.34" stroke={stroke} strokeWidth="1.8" />
      <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" stroke={stroke} strokeWidth="1.8" />
      <line x1="19.78" y1="4.22" x2="17.66" y2="6.34" stroke={stroke} strokeWidth="1.8" />
      <line x1="6.34" y1="17.66" x2="4.22" y2="19.78" stroke={stroke} strokeWidth="1.8" />
    </svg>
  );
}

function TransitionSVG({
  stroke,
  fill,
  size,
}: {
  stroke: string;
  fill: string;
  size: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Backpack */}
      <rect x="6" y="8" width="12" height="13" rx="2" stroke={stroke} strokeWidth="1.8" fill={fill} fillOpacity="0.6" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" stroke={stroke} strokeWidth="1.8" />
      <line x1="6" y1="14" x2="18" y2="14" stroke={stroke} strokeWidth="1.8" />
      <path d="M10 14v2a2 2 0 0 0 4 0v-2" stroke={stroke} strokeWidth="1.8" />
    </svg>
  );
}

function AfterschoolSVG({
  stroke,
  fill,
  size,
}: {
  stroke: string;
  fill: string;
  size: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* House */}
      <path d="M3 12L12 4l9 8" stroke={stroke} strokeWidth="1.8" />
      <path d="M5 10v9a1 1 0 0 0 1 1h4v-5h4v5h4a1 1 0 0 0 1-1v-9" stroke={stroke} strokeWidth="1.8" fill={fill} fillOpacity="0.6" />
      <rect x="9" y="14" width="6" height="6" stroke={stroke} strokeWidth="1.8" fill={fill} fillOpacity="0.4" />
    </svg>
  );
}

function PlaySVG({
  stroke,
  fill,
  size,
}: {
  stroke: string;
  fill: string;
  size: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Building blocks */}
      <rect x="3" y="13" width="7" height="7" rx="1" stroke={stroke} strokeWidth="1.8" fill={fill} fillOpacity="0.6" />
      <rect x="14" y="13" width="7" height="7" rx="1" stroke={stroke} strokeWidth="1.8" fill={fill} fillOpacity="0.4" />
      <rect x="8" y="4" width="8" height="8" rx="1" stroke={stroke} strokeWidth="1.8" fill={fill} fillOpacity="0.6" />
    </svg>
  );
}

function BedtimeSVG({
  stroke,
  fill,
  size,
}: {
  stroke: string;
  fill: string;
  size: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Crescent moon */}
      <path
        d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
        stroke={stroke}
        strokeWidth="1.8"
        fill={fill}
        fillOpacity="0.6"
      />
      {/* Stars */}
      <circle cx="19" cy="5" r="1" fill={stroke} />
      <circle cx="16" cy="2" r="0.75" fill={stroke} />
    </svg>
  );
}

function HoldOntoSVG({
  stroke,
  fill,
  size,
}: {
  stroke: string;
  fill: string;
  size: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Two connected figures (hearts linked) */}
      <path
        d="M12 21C12 21 4 16 4 10a4 4 0 0 1 8 0 4 4 0 0 1 8 0c0 6-8 11-8 11z"
        stroke={stroke}
        strokeWidth="1.8"
        fill={fill}
        fillOpacity="0.6"
      />
    </svg>
  );
}

function CustomSVG({
  stroke,
  fill,
  size,
}: {
  stroke: string;
  fill: string;
  size: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Star burst */}
      <polygon
        points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
        stroke={stroke}
        strokeWidth="1.8"
        fill={fill}
        fillOpacity="0.6"
      />
    </svg>
  );
}

export function MomentIcon({ type, size = 20, showCircle = false }: MomentIconProps) {
  const config = iconConfig[type];
  const circleSize = size * 2.4;

  const icon = (() => {
    switch (type) {
      case "morning":
        return (
          <MorningSVG stroke={config.strokeColor} fill={config.fillColor} size={size} />
        );
      case "transition":
        return (
          <TransitionSVG stroke={config.strokeColor} fill={config.fillColor} size={size} />
        );
      case "afterschool":
        return (
          <AfterschoolSVG stroke={config.strokeColor} fill={config.fillColor} size={size} />
        );
      case "play":
        return (
          <PlaySVG stroke={config.strokeColor} fill={config.fillColor} size={size} />
        );
      case "bedtime":
        return (
          <BedtimeSVG stroke={config.strokeColor} fill={config.fillColor} size={size} />
        );
      case "holdonto":
        return (
          <HoldOntoSVG stroke={config.strokeColor} fill={config.fillColor} size={size} />
        );
      case "custom":
        return (
          <CustomSVG stroke={config.strokeColor} fill={config.fillColor} size={size} />
        );
    }
  })();

  if (!showCircle) return icon;

  return (
    <div
      style={{
        width: circleSize,
        height: circleSize,
        borderRadius: "50%",
        backgroundColor: config.circleBg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {icon}
    </div>
  );
}

export function getMomentTypeLabel(type: MomentType): string {
  const labels: Record<MomentType, string> = {
    morning: "Morning",
    transition: "Transition",
    afterschool: "After School",
    play: "Play",
    bedtime: "Bedtime",
    holdonto: "Hold Onto",
    custom: "Custom",
  };
  return labels[type];
}
