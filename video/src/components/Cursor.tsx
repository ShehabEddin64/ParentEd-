import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { FPS, C } from "../theme";
import type { Click, Cursor as CursorT } from "../scenes";

const ease = Easing.bezier(0.32, 0, 0.16, 1);

export const Cursor: React.FC<{ moves: CursorT[]; clicks: Click[]; shift: number }> = ({
  moves,
  clicks,
  shift,
}) => {
  const frame = useCurrentFrame() - shift;
  const t = frame / FPS;
  if (!moves.length) return null;

  const first = moves[0];
  const last = moves[moves.length - 1];
  if (t < first.start - 0.35) return null;

  // position courante : dernier mouvement commencé
  let x = first.from[0];
  let y = first.from[1];
  for (const m of moves) {
    if (t >= m.end) {
      x = m.to[0];
      y = m.to[1];
    } else if (t >= m.start) {
      const p = ease((t - m.start) / Math.max(m.end - m.start, 0.001));
      x = m.from[0] + (m.to[0] - m.from[0]) * p;
      y = m.from[1] + (m.to[1] - m.from[1]) * p;
      break;
    }
  }

  const appear = interpolate(t, [first.start - 0.35, first.start], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const leave = interpolate(t, [last.end + 1.5, last.end + 2.0], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // enfoncement au clic
  let press = 1;
  for (const c of clicks) {
    press *= interpolate(
      t,
      [c.at - 0.09, c.at, c.at + 0.12, c.at + 0.24],
      [1, 0.82, 0.82, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );
  }

  return (
    <>
      {clicks.map((c, i) => {
        const p = (t - c.at) / 0.55;
        if (p < 0 || p > 1) return null;
        const r = 12 + 58 * Easing.out(Easing.quad)(p);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: c.x - r,
              top: c.y - r,
              width: r * 2,
              height: r * 2,
              borderRadius: "50%",
              border: `3px solid ${C.blue}`,
              opacity: (1 - p) * 0.85,
              pointerEvents: "none",
            }}
          />
        );
      })}
      <svg
        width={44}
        height={54}
        viewBox="0 0 44 54"
        style={{
          position: "absolute",
          left: x - 3,
          top: y - 2,
          opacity: appear * leave,
          transform: `scale(${press})`,
          transformOrigin: "6px 4px",
          filter: "drop-shadow(0 4px 10px rgba(17,27,42,.42))",
          pointerEvents: "none",
        }}
      >
        <path
          d="M6 3 L6 40 L15.5 31.5 L21.5 45 L27.5 42.2 L21.7 29.4 L33.5 28.6 Z"
          fill="#FFFFFF"
          stroke={C.ink}
          strokeWidth={2.6}
          strokeLinejoin="round"
        />
      </svg>
    </>
  );
};
