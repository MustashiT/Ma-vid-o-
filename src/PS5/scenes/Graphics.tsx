import {
  AbsoluteFill,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Reveal } from "../components/Text";
import { COLORS, fontFamily } from "../theme";

const FEATURES = ["Jusqu'à 120 fps", "Ray tracing", "HDR", "Sortie 8K"];

export const Graphics: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const zoom = spring({ frame, fps, config: { damping: 18, mass: 1.4 } });
  const rotation = frame * 0.4;

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div
        style={{
          position: "absolute",
          width: 1800,
          height: 1800,
          borderRadius: "50%",
          background: `repeating-conic-gradient(from ${rotation}deg, rgba(90,209,255,0.13) 0deg 6deg, transparent 6deg 20deg)`,
          maskImage: "radial-gradient(circle, black 10%, transparent 60%)",
          WebkitMaskImage:
            "radial-gradient(circle, black 10%, transparent 60%)",
          opacity: zoom,
        }}
      />
      <div
        style={{
          fontFamily,
          fontWeight: 900,
          fontSize: 380,
          lineHeight: 1,
          transform: `scale(${0.4 + zoom * 0.6})`,
          opacity: zoom,
          backgroundImage: `linear-gradient(180deg, ${COLORS.white} 20%, ${COLORS.cyan} 70%, ${COLORS.blue})`,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
          filter: `drop-shadow(0 0 60px rgba(47,107,255,0.8))`,
        }}
      >
        4K
      </div>
      <div style={{ display: "flex", gap: 28, marginTop: 40 }}>
        {FEATURES.map((f, i) => (
          <Reveal key={f} delay={25 + i * 7} distance={30}>
            <div
              style={{
                fontFamily,
                fontSize: 36,
                fontWeight: 600,
                color: COLORS.white,
                padding: "18px 36px",
                borderRadius: 999,
                border: `2px solid ${COLORS.cyan}`,
                background: "rgba(47,107,255,0.18)",
              }}
            >
              {f}
            </div>
          </Reveal>
        ))}
      </div>
    </AbsoluteFill>
  );
};
