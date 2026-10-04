import { useCurrentFrame } from "remotion";
import { COLORS } from "../theme";

// Stylised two-tone game controller.
export const Controller: React.FC<{ width: number }> = ({ width }) => {
  const frame = useCurrentFrame();
  const pulse = 0.6 + 0.4 * Math.sin(frame / 10);

  return (
    <svg viewBox="0 0 400 290" style={{ width, overflow: "visible" }}>
      <defs>
        <linearGradient id="pad-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#cfd6e4" />
        </linearGradient>
        <filter id="pad-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>

      <path
        d="M 70 70 C 74 46, 110 38, 150 42 L 250 42 C 290 38, 326 46, 330 70 L 372 222 C 384 272, 330 292, 300 252 L 268 200 L 132 200 L 100 252 C 70 292, 16 272, 28 222 Z"
        fill="url(#pad-body)"
      />
      <path
        d="M 132 60 L 268 60 L 280 150 C 260 182, 140 182, 120 150 Z"
        fill="#11141c"
      />
      <path
        d="M 136 62 L 264 62 L 272 120 L 128 120 Z"
        fill="none"
        stroke={COLORS.blue}
        strokeWidth="5"
        opacity={pulse}
        filter="url(#pad-glow)"
      />
      <rect x="146" y="66" width="108" height="50" rx="8" fill="#1d2230" />

      <circle cx="160" cy="160" r="20" fill="#0b0d12" />
      <circle cx="240" cy="160" r="20" fill="#0b0d12" />
      <circle cx="160" cy="160" r="12" fill="#262b38" />
      <circle cx="240" cy="160" r="12" fill="#262b38" />

      <g fill="#9aa4b8">
        <rect x="88" y="92" width="14" height="40" rx="3" />
        <rect x="75" y="105" width="40" height="14" rx="3" />
      </g>
      <g fill="none" stroke="#9aa4b8" strokeWidth="3">
        <circle cx="312" cy="92" r="8" />
        <circle cx="332" cy="112" r="8" />
        <circle cx="312" cy="132" r="8" />
        <circle cx="292" cy="112" r="8" />
      </g>
    </svg>
  );
};
