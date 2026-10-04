import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Console } from "../components/Console";
import { Letters, Reveal } from "../components/Text";
import { COLORS, fontFamily } from "../theme";

export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 200 } });
  const float = Math.sin(frame / 22) * 8;
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 25, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        opacity: fadeOut,
      }}
    >
      <div
        style={{
          position: "relative",
          opacity: enter,
          transform: `translateY(${(1 - enter) * 80 + float}px) scale(${0.9 + enter * 0.1})`,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: -100,
            background:
              "radial-gradient(circle, rgba(47,107,255,0.55), transparent 60%)",
            filter: "blur(30px)",
          }}
        />
        <Console height={460} />
      </div>
      <div style={{ marginTop: 50 }}>
        <Letters
          text="PlayStation 5"
          delay={20}
          fontSize={110}
          fontWeight={900}
          gradient
        />
      </div>
      <Reveal delay={45}>
        <div
          style={{
            fontFamily,
            fontSize: 42,
            color: COLORS.muted,
            marginTop: 20,
            letterSpacing: 2,
          }}
        >
          Le jeu entre dans une nouvelle dimension.
        </div>
      </Reveal>
    </AbsoluteFill>
  );
};
