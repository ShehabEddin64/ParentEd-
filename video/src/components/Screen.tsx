import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, interpolate, Easing } from "remotion";
import { APP_H, APP_W, C, FPS, SCALE, SCREEN } from "../theme";
import type { Cam, Click, Cursor as CursorT, Shot } from "../scenes";
import { Cursor } from "./Cursor";

const ease = Easing.bezier(0.4, 0, 0.2, 1);

/** Largeur de la barre latérale de l'app, en px CSS. */
const NAV_W = 216;

/**
 * Empêche la caméra de montrer du vide autour de la capture, et évite de
 * couper la barre latérale en deux (soit on la voit entière, soit pas du tout).
 */
const clamp = (s: number, cx: number, cy: number) => {
  const hw = APP_W / 2 / s;
  const hh = APP_H / 2 / s;
  let x = Math.min(Math.max(cx, hw), APP_W - hw);
  const left = x - hw;
  if (left > 3 && left < NAV_W + 26) {
    // trop près : on pousse pour sortir complètement la barre latérale
    x = Math.min(NAV_W + 26 + hw, APP_W - hw);
    if (x - hw < NAV_W + 20) x = hw; // pas la place : on la montre en entier
  }
  return {
    s,
    cx: x,
    cy: Math.min(Math.max(cy, hh), APP_H - hh),
  };
};

const camAt = (keys: Cam[], t: number) => {
  if (!keys.length) return clamp(1, APP_W / 2, APP_H / 2);
  if (t <= keys[0].t) return clamp(keys[0].s, keys[0].cx, keys[0].cy);
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i];
    const b = keys[i + 1];
    if (t >= a.t && t <= b.t) {
      const p = ease((t - a.t) / Math.max(b.t - a.t, 0.001));
      return clamp(a.s + (b.s - a.s) * p, a.cx + (b.cx - a.cx) * p, a.cy + (b.cy - a.cy) * p);
    }
  }
  const l = keys[keys.length - 1];
  return clamp(l.s, l.cx, l.cy);
};

export const Screen: React.FC<{
  shots: Shot[];
  cam: Cam[];
  cursor?: CursorT[];
  clicks?: Click[];
  /** images de pré-roll consommées par le fondu enchaîné */
  shift: number;
}> = ({ shots, cam, cursor = [], clicks = [], shift }) => {
  const frame = useCurrentFrame() - shift;
  const t = frame / FPS;
  const { s, cx, cy } = camAt(cam, t);

  // point focal exprimé dans le repère de la boîte vidéo
  const dx = -(cx * SCALE - SCREEN.w / 2) * s;
  const dy = -(cy * SCALE - SCREEN.h / 2) * s;

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(125% 95% at 50% 6%, #FFFFFF 0%, #ECF0F8 45%, #DFE6F2 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: SCREEN.x,
          top: SCREEN.y,
          width: SCREEN.w,
          height: SCREEN.h,
          borderRadius: 20,
          overflow: "hidden",
          background: C.white,
          boxShadow:
            "0 46px 96px rgba(17,27,42,.20), 0 10px 26px rgba(17,27,42,.12), 0 0 0 1px rgba(17,27,42,.07)",
        }}
      >
        <div
          style={{
            width: SCREEN.w,
            height: SCREEN.h,
            transformOrigin: "center center",
            transform: `translate(${dx}px, ${dy}px) scale(${s})`,
          }}
        >
          <div
            style={{
              width: APP_W,
              height: APP_H,
              transformOrigin: "top left",
              transform: `scale(${SCALE})`,
              position: "relative",
            }}
          >
            {shots.map((sh, i) => {
              const next = shots[i + 1];
              const inAt = sh.at * FPS;
              const outAt = next ? next.at * FPS : Number.MAX_SAFE_INTEGER;
              const op = interpolate(
                frame,
                [inAt - 3, inAt, outAt - 3, outAt],
                [0, 1, 1, 0],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              );
              if (op <= 0.001) return null;
              return (
                <Img
                  key={sh.src}
                  src={staticFile(sh.src)}
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    width: APP_W,
                    height: APP_H,
                    opacity: op,
                  }}
                />
              );
            })}
            <Cursor moves={cursor} clicks={clicks} shift={shift} />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
