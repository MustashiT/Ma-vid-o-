import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { formatNumber, Letters } from "../components/Text";
import { COLORS, fontFamily, SMOOTH } from "../theme";

const CARDS = [
  {
    label: "PROCESSEUR",
    value: 8,
    decimals: 0,
    unit: "cœurs",
    sub: "AMD Zen 2 · 3,5 GHz",
  },
  {
    label: "GRAPHISMES",
    value: 10.28,
    decimals: 2,
    unit: "TFLOPS",
    sub: "AMD RDNA 2 · 2,23 GHz",
  },
  {
    label: "MÉMOIRE",
    value: 16,
    decimals: 0,
    unit: "Go",
    sub: "GDDR6 · 448 Go/s",
  },
];

const Card: React.FC<{ card: (typeof CARDS)[number]; index: number }> = ({
  card,
  index,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const delay = 25 + index * 10;

  const enter = spring({ frame: frame - delay, fps, config: SMOOTH });
  const count = interpolate(frame, [delay, delay + 50], [0, card.value], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        width: 500,
        padding: "48px 36px",
        borderRadius: 32,
        background:
          "linear-gradient(160deg, rgba(47,107,255,0.22), rgba(255,255,255,0.04))",
        border: "1px solid rgba(90,209,255,0.35)",
        boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
        opacity: enter,
        transform: `translateY(${(1 - enter) * 120}px) scale(${0.9 + enter * 0.1})`,
        fontFamily,
      }}
    >
      <div
        style={{
          fontSize: 26,
          fontWeight: 600,
          color: COLORS.cyan,
          letterSpacing: 6,
        }}
      >
        {card.label}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 10,
          marginTop: 18,
          color: COLORS.white,
        }}
      >
        <span style={{ fontSize: 100, fontWeight: 900, lineHeight: 1 }}>
          {formatNumber(count, card.decimals)}
        </span>
        <span style={{ fontSize: 32, fontWeight: 600 }}>{card.unit}</span>
      </div>
      <div style={{ fontSize: 30, color: COLORS.muted, marginTop: 16 }}>
        {card.sub}
      </div>
    </div>
  );
};

export const Power: React.FC = () => {
  return (
    <AbsoluteFill
      style={{ justifyContent: "center", alignItems: "center", gap: 80 }}
    >
      <Letters
        text="Une puissance inédite"
        fontSize={92}
        fontWeight={900}
        stagger={1.5}
      />
      <div style={{ display: "flex", gap: 48 }}>
        {CARDS.map((card, i) => (
          <Card key={card.label} card={card} index={i} />
        ))}
      </div>
    </AbsoluteFill>
  );
};
