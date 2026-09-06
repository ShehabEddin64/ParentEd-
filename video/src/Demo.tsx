import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  staticFile,
  useCurrentFrame,
  interpolate,
} from "remotion";
import { AUDIO_LEAD, timeline, TOTAL } from "./scenes";
import { C, XFADE } from "./theme";
import { Screen } from "./components/Screen";
import { TitleCard, EndCard } from "./components/Cards";
import { LowerThird, Progress } from "./components/Chrome";
import narration from "./narration.json";

const audioOf = (id: string) => narration.find((n) => n.id === id)?.audio;

/** Fondu enchaîné : chaque plan entre par-dessus le précédent. */
const Fade: React.FC<{ first: boolean; children: React.ReactNode }> = ({ first, children }) => {
  const frame = useCurrentFrame();
  const o = first
    ? 1
    : interpolate(frame, [0, XFADE], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};

export const Demo: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      {timeline.map(({ scene, from, dur }, i) => {
        const src = audioOf(scene.id);
        const first = i === 0;
        // pré-roll : le plan démarre plus tôt pour recouvrir le précédent
        const shift = first ? 0 : XFADE;
        const start = from - shift;
        const length = dur + shift;
        return (
          <Sequence key={scene.id} from={start} durationInFrames={length} name={scene.id}>
            <Fade first={first}>
              {scene.kind === "title" ? (
                <TitleCard dur={length} shift={shift} />
              ) : scene.kind === "end" ? (
                <EndCard dur={length} shift={shift} />
              ) : (
                <>
                  <Screen
                    shots={scene.shots ?? []}
                    cam={scene.cam ?? []}
                    cursor={scene.cursor}
                    clicks={scene.clicks}
                    shift={shift}
                  />
                  {scene.chip ? (
                    <LowerThird
                      label={scene.chip}
                      keyline={scene.key}
                      dur={length}
                      shift={shift}
                    />
                  ) : null}
                </>
              )}
              {src ? (
                <Sequence from={shift + AUDIO_LEAD}>
                  <Audio src={staticFile(src)} />
                </Sequence>
              ) : null}
            </Fade>
          </Sequence>
        );
      })}
      <Progress frame={frame} total={TOTAL} />
    </AbsoluteFill>
  );
};
