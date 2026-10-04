import {
  AbsoluteFill,
  Easing,
  interpolate,
  random,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { formatNumber, Reveal } from "../components/Text";
import { COLORS, fontFamily } from "../theme";

const LINES = new Array(45).fill(0).map((_, i) => ({
  y: random(`ly-${i}`) * 100,
  length: 150 + random(`ll-${i}`) * 450,
  speed: 30 + random(`lv-${i}`) * 50,
  offset: random(`lo-${i}`) * 3000,
  thickness: 1 + random(`lt-${i}`) * 2.5,
}));

export const Speed: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const progress = interpolate(frame, [10, 70], [0, 1], {
    easing: Easing.bezier(0.33, 1, 0.68, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      {LINES.map((l, i) => {
        const x = width + 600 - ((frame * l.speed + l.offset) % (width + 1200));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: (l.y / 100) * height,
              width: l.length,
              height: l.thickness,
              background: `linear-gradient(90deg, ${COLORS.cyan}, transparent)`,
              opacity: 0.45,
            }}
          />
        );
      })}

      <Reveal delay={0}>
        <div
          style={{
            fontFamily,
            fontSize: 34,
            fontWeight: 600,
            color: COLORS.cyan,
            letterSpacing: 10,
            textAlign: "center",
          }}
        >
          SSD ULTRA-RAPIDE
        </div>
      </Reveal>
      <div
        style={{
          fontFamily,
          fontWeight: 900,
          fontSize: 260,
          color: COLORS.white,
          lineHeight: 1,
          display: "flex",
          alignItems: "baseline",
          gap: 24,
          textShadow: `0 0 50px ${COLORS.blue}`,
        }}
      >
        {formatNumber(progress * 5.5, 1)}
        <span style={{ fontSize: 90, color: COLORS.cyan }}>Go/s</span>
      </div>
      <div
        style={{
          width: 900,
          height: 10,
          borderRadius: 5,
          background: "rgba(255,255,255,0.1)",
          overflow: "hidden",
          marginTop: 20,
        }}
      >
        <div
          style={{
            width: `${progress * 100}%`,
            height: "100%",
            background: `linear-gradient(90deg, ${COLORS.blue}, ${COLORS.cyan})`,
            boxShadow: `0 0 20px ${COLORS.cyan}`,
          }}
        />
      </div>
      <Reveal delay={35}>
        <div
          style={{
            fontFamily,
            fontSize: 40,
            color: COLORS.muted,
            marginTop: 40,
            textAlign: "center",
          }}
        >
          825 Go de stockage · Chargements quasi instantanés
        </div>
      </Reveal>
    </AbsoluteFill>
  );
};
