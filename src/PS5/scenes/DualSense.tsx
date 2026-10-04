import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Controller } from "../components/Controller";
import { Reveal } from "../components/Text";
import { COLORS, fontFamily } from "../theme";

const FEATURES = ["Retour haptique", "Gâchettes adaptatives", "Micro intégré"];

export const DualSense: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 20, mass: 1.1 } });
  const tilt = Math.sin(frame / 25) * 4;
  // Small periodic "rumble" to evoke haptic feedback.
  const rumble = frame > 40 && frame % 30 < 6 ? Math.sin(frame * 3) * 3 : 0;

  return (
    <AbsoluteFill
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
        padding: "0 140px",
      }}
    >
      <div
        style={{
          position: "relative",
          width: 820,
          height: 700,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {[0, 1, 2].map((i) => {
          const t = ((frame + i * 20) % 60) / 60;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                width: 500,
                height: 500,
                borderRadius: "50%",
                border: `3px solid ${COLORS.cyan}`,
                transform: `scale(${0.6 + t * 0.9})`,
                opacity: interpolate(t, [0, 1], [0.6, 0]) * enter,
              }}
            />
          );
        })}
        <div
          style={{
            opacity: enter,
            transform: `translateX(${(1 - enter) * -300 + rumble}px) rotate(${tilt + (1 - enter) * -20}deg)`,
            filter: "drop-shadow(0 40px 60px rgba(0,0,0,0.6))",
          }}
        >
          <Controller width={720} />
        </div>
      </div>

      <div style={{ width: 720 }}>
        <Reveal delay={15}>
          <div
            style={{
              fontFamily,
              fontSize: 30,
              fontWeight: 600,
              color: COLORS.cyan,
              letterSpacing: 8,
            }}
          >
            MANETTE
          </div>
        </Reveal>
        <Reveal delay={22}>
          <div
            style={{
              fontFamily,
              fontSize: 104,
              fontWeight: 900,
              color: COLORS.white,
              marginTop: 10,
            }}
          >
            DualSense
          </div>
        </Reveal>
        {FEATURES.map((f, i) => (
          <Reveal key={f} delay={38 + i * 9}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 22,
                fontFamily,
                fontSize: 42,
                color: COLORS.white,
                marginTop: 28,
              }}
            >
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  background: COLORS.cyan,
                  boxShadow: `0 0 16px ${COLORS.cyan}`,
                }}
              />
              {f}
            </div>
          </Reveal>
        ))}
      </div>
    </AbsoluteFill>
  );
};
