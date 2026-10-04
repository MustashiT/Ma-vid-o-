import {
  AbsoluteFill,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Console } from "../components/Console";
import { Reveal } from "../components/Text";
import { COLORS, fontFamily } from "../theme";

export const Design: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 22, mass: 1.2 } });
  const float = Math.sin(frame / 22) * 12;
  const glow = 0.5 + 0.2 * Math.sin(frame / 15);

  return (
    <AbsoluteFill
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
        padding: "0 160px",
      }}
    >
      <div style={{ width: 760 }}>
        <Reveal delay={20}>
          <div
            style={{
              fontFamily,
              fontSize: 30,
              fontWeight: 600,
              color: COLORS.cyan,
              letterSpacing: 8,
            }}
          >
            DESIGN
          </div>
        </Reveal>
        <Reveal delay={28}>
          <div
            style={{
              fontFamily,
              fontSize: 96,
              fontWeight: 900,
              color: COLORS.white,
              lineHeight: 1.05,
              marginTop: 16,
            }}
          >
            Une silhouette
            <br />
            iconique
          </div>
        </Reveal>
        <Reveal delay={40}>
          <div
            style={{
              fontFamily,
              fontSize: 38,
              color: COLORS.muted,
              marginTop: 28,
              lineHeight: 1.4,
            }}
          >
            Des lignes épurées et un éclairage bleu
            <br />
            pensés pour la nouvelle génération.
          </div>
        </Reveal>
      </div>

      <div
        style={{
          position: "relative",
          opacity: enter,
          transform: `translateY(${(1 - enter) * 260 + float}px) scale(${0.85 + enter * 0.15}) rotate(${(1 - enter) * -8}deg)`,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: -120,
            background: `radial-gradient(circle, rgba(47,107,255,${glow}) 0%, transparent 60%)`,
            filter: "blur(30px)",
          }}
        />
        <Console height={760} />
      </div>
    </AbsoluteFill>
  );
};
