import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Letters, Reveal } from "../components/Text";
import { BOUNCY, COLORS, fontFamily } from "../theme";

export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const lineWidth = interpolate(frame, [0, 35], [0, 1100], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateRight: "clamp",
  });
  const five = spring({ frame: frame - 38, fps, config: BOUNCY });

  return (
    <AbsoluteFill
      style={{ justifyContent: "center", alignItems: "center", gap: 30 }}
    >
      <Letters
        text="PLAYSTATION"
        delay={12}
        fontSize={120}
        letterSpacing={18}
      />
      <div
        style={{
          fontFamily,
          fontWeight: 900,
          fontSize: 260,
          lineHeight: 1,
          transform: `scale(${five})`,
          backgroundImage: `linear-gradient(180deg, ${COLORS.white}, ${COLORS.cyan} 60%, ${COLORS.blue})`,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
          filter: `drop-shadow(0 0 40px ${COLORS.blue})`,
        }}
      >
        5
      </div>
      <div
        style={{
          width: lineWidth,
          height: 3,
          background: `linear-gradient(90deg, transparent, ${COLORS.cyan}, transparent)`,
          boxShadow: `0 0 24px ${COLORS.cyan}`,
        }}
      />
      <Reveal delay={60}>
        <div
          style={{
            fontFamily,
            fontWeight: 400,
            fontSize: 44,
            color: COLORS.muted,
            letterSpacing: 6,
          }}
        >
          La nouvelle génération du jeu
        </div>
      </Reveal>
    </AbsoluteFill>
  );
};
