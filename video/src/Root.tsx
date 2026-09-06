import React from "react";
import { Composition } from "remotion";
import { Demo } from "./Demo";
import { FPS, HEIGHT, WIDTH } from "./theme";
import { TOTAL } from "./scenes";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="DemoParent"
      component={Demo}
      durationInFrames={TOTAL}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  </>
);
