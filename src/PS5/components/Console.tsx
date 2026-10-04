import { useCurrentFrame } from "remotion";
import { COLORS } from "../theme";

// Stylised next-gen console silhouette: two curved white fins around a black core.
export const Console: React.FC<{ height: number }> = ({ height }) => {
  const frame = useCurrentFrame();
  const pulse = 0.65 + 0.35 * Math.sin(frame / 12);

  return (
    <svg
      viewBox="0 0 300 600"
      style={{ height, width: height / 2, overflow: "visible" }}
    >
      <defs>
        <linearGradient id="fin-left" x1="0" x2="1">
          <stop offset="0%" stopColor="#c9d0de" />
          <stop offset="55%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e8ecf4" />
        </linearGradient>
        <linearGradient id="fin-right" x1="0" x2="1">
          <stop offset="0%" stopColor="#e8ecf4" />
          <stop offset="45%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#b9c1d1" />
        </linearGradient>
        <linearGradient id="core" x1="0" x2="1">
          <stop offset="0%" stopColor="#05070c" />
          <stop offset="50%" stopColor="#1b1f2a" />
          <stop offset="100%" stopColor="#05070c" />
        </linearGradient>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect x="112" y="36" width="76" height="540" rx="12" fill="url(#core)" />
      <line
        x1="121"
        y1="56"
        x2="121"
        y2="556"
        stroke={COLORS.blue}
        strokeWidth="3"
        opacity={pulse}
        filter="url(#glow)"
      />
      <line
        x1="179"
        y1="56"
        x2="179"
        y2="556"
        stroke={COLORS.blue}
        strokeWidth="3"
        opacity={pulse}
        filter="url(#glow)"
      />
      <path
        d="M 116 4 C 86 4, 44 22, 42 72 C 50 220, 86 320, 92 440 C 96 520, 82 578, 116 596 Z"
        fill="url(#fin-left)"
      />
      <path
        d="M 184 4 C 214 4, 256 22, 258 72 C 250 220, 214 320, 208 440 C 204 520, 218 578, 184 596 Z"
        fill="url(#fin-right)"
      />
      <ellipse cx="150" cy="606" rx="120" ry="8" fill="#000" opacity="0.5" />
    </svg>
  );
};
