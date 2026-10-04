import { AbsoluteFill, Easing } from "remotion";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { Background } from "./components/Background";
import { Audio } from "./scenes/Audio";
import { Design } from "./scenes/Design";
import { DualSense } from "./scenes/DualSense";
import { Graphics } from "./scenes/Graphics";
import { Intro } from "./scenes/Intro";
import { Outro } from "./scenes/Outro";
import { Power } from "./scenes/Power";
import { Speed } from "./scenes/Speed";

const TRANSITION = 20;

const SCENES = [
  { id: "intro", component: Intro, duration: 120 },
  { id: "design", component: Design, duration: 130 },
  { id: "speed", component: Speed, duration: 110 },
  { id: "power", component: Power, duration: 140 },
  { id: "graphics", component: Graphics, duration: 110 },
  { id: "dualsense", component: DualSense, duration: 130 },
  { id: "audio", component: Audio, duration: 110 },
  { id: "outro", component: Outro, duration: 140 },
] as const;

export const PS5_DURATION =
  SCENES.reduce((sum, s) => sum + s.duration, 0) -
  (SCENES.length - 1) * TRANSITION;

const timing = linearTiming({
  durationInFrames: TRANSITION,
  easing: Easing.bezier(0.65, 0, 0.35, 1),
});

const transitionFor = (index: number) => {
  switch (index % 3) {
    case 0:
      return fade();
    case 1:
      return slide({ direction: "from-right" });
    default:
      return slide({ direction: "from-bottom" });
  }
};

export const PS5Showcase: React.FC = () => {
  return (
    <AbsoluteFill>
      <Background />
      <TransitionSeries>
        {SCENES.flatMap(({ id, component: Scene, duration }, i) => {
          const items = [
            <TransitionSeries.Sequence key={id} durationInFrames={duration}>
              <Scene />
            </TransitionSeries.Sequence>,
          ];
          if (i < SCENES.length - 1) {
            items.push(
              <TransitionSeries.Transition
                key={`${id}-transition`}
                presentation={transitionFor(i)}
                timing={timing}
              />,
            );
          }
          return items;
        })}
      </TransitionSeries>
    </AbsoluteFill>
  );
};
