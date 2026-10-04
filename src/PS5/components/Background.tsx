import {
  AbsoluteFill,
  random,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS } from "../theme";

const PARTICLES = new Array(70).fill(0).map((_, i) => ({
  x: random(`x-${i}`) * 100,
  y: random(`y-${i}`) * 100,
  size: 1 + random(`s-${i}`) * 3,
  speed: 0.02 + random(`v-${i}`) * 0.06,
  phase: random(`p-${i}`) * Math.PI * 2,
}));

// Continuous backdrop shared by every scene so transitions never flash.
export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const glowX = 50 + Math.sin(frame / 90) * 18;
  const glowY = 45 + Math.cos(frame / 120) * 12;

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at ${glowX}% ${glowY}%, ${COLORS.deep} 0%, ${COLORS.night} 65%)`,
      }}
    >
      {PARTICLES.map((p, i) => {
        const y = (((p.y - frame * p.speed) % 100) + 100) % 100;
        const opacity = 0.25 + 0.35 * Math.sin(frame / 25 + p.phase) ** 2;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: (p.x / 100) * width,
              top: (y / 100) * height,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              background: COLORS.cyan,
              opacity,
              boxShadow: `0 0 ${p.size * 4}px ${COLORS.cyan}`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
