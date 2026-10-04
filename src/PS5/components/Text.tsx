import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, fontFamily, SMOOTH } from "../theme";

type LettersProps = {
  text: string;
  delay?: number;
  stagger?: number;
  fontSize: number;
  fontWeight?: number;
  color?: string;
  letterSpacing?: number;
  gradient?: boolean;
};

// Letter-by-letter reveal: each glyph slides up and un-blurs on a spring.
export const Letters: React.FC<LettersProps> = ({
  text,
  delay = 0,
  stagger = 2,
  fontSize,
  fontWeight = 800,
  color = COLORS.white,
  letterSpacing = 0,
  gradient = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        fontFamily,
        fontSize,
        fontWeight,
        letterSpacing,
        lineHeight: 1.05,
      }}
    >
      {text.split("").map((char, i) => {
        const p = spring({
          frame: frame - delay - i * stagger,
          fps,
          config: SMOOTH,
        });
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: p,
              transform: `translateY(${(1 - p) * fontSize * 0.6}px)`,
              filter: `blur(${(1 - p) * 10}px)`,
              whiteSpace: "pre",
              ...(gradient
                ? {
                    backgroundImage: `linear-gradient(180deg, ${COLORS.white} 10%, ${COLORS.cyan} 55%, ${COLORS.blue} 100%)`,
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                  }
                : { color }),
            }}
          >
            {char}
          </span>
        );
      })}
    </div>
  );
};

type RevealProps = {
  delay?: number;
  distance?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
};

// Generic fade + rise for any block of content.
export const Reveal: React.FC<RevealProps> = ({
  delay = 0,
  distance = 40,
  children,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: SMOOTH });

  return (
    <div
      style={{
        opacity: p,
        transform: `translateY(${(1 - p) * distance}px)`,
        filter: `blur(${(1 - p) * 6}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const formatNumber = (value: number, decimals: number) =>
  value.toFixed(decimals).replace(".", ",");
