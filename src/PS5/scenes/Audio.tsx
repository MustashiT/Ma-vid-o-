import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Letters, Reveal } from "../components/Text";
import { COLORS, fontFamily } from "../theme";

const BARS = 32;

export const Audio: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      {new Array(6).fill(0).map((_, i) => {
        const t = ((frame + i * 15) % 90) / 90;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              width: 1400,
              height: 1400,
              borderRadius: "50%",
              border: `2px solid ${COLORS.blue}`,
              transform: `scale(${0.1 + t})`,
              opacity: interpolate(t, [0, 0.2, 1], [0, 0.7, 0]),
            }}
          />
        );
      })}

      <Reveal delay={0}>
        <div
          style={{
            fontFamily,
            fontSize: 32,
            fontWeight: 600,
            color: COLORS.cyan,
            letterSpacing: 10,
            textAlign: "center",
          }}
        >
          SON IMMERSIF
        </div>
      </Reveal>
      <div style={{ marginTop: 16 }}>
        <Letters
          text="Audio 3D Tempest"
          fontSize={120}
          fontWeight={900}
          delay={6}
          stagger={1.5}
        />
      </div>

      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          height: 140,
          marginTop: 40,
        }}
      >
        {new Array(BARS).fill(0).map((_, i) => {
          const h =
            20 +
            Math.abs(
              Math.sin(frame / 6 + i * 0.5) * Math.cos(frame / 11 + i * 0.3),
            ) *
              120;
          const grow = interpolate(frame, [10 + i, 30 + i], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <div
              key={i}
              style={{
                width: 12,
                height: h * grow,
                borderRadius: 6,
                background: `linear-gradient(180deg, ${COLORS.cyan}, ${COLORS.blue})`,
              }}
            />
          );
        })}
      </div>

      <Reveal delay={30}>
        <div
          style={{
            fontFamily,
            fontSize: 40,
            color: COLORS.muted,
            marginTop: 30,
          }}
        >
          Entendez chaque détail, dans toutes les directions.
        </div>
      </Reveal>
    </AbsoluteFill>
  );
};
