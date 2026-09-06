import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig, Img, staticFile } from "remotion";
import { C, FONT } from "../theme";

/**
 * Bandeau bas : dégradé sombre + intitulé de section + phrase clé + logo.
 * Le dégradé garantit la lisibilité par-dessus n'importe quelle capture.
 */
export const LowerThird: React.FC<{
  label: string;
  keyline?: string;
  dur: number;
  shift: number;
}> = ({ label, keyline, dur, shift }) => {
  const frame = useCurrentFrame() - shift;
  const { fps } = useVideoConfig();
  const rise = spring({ frame: frame - 5, fps, config: { damping: 200, mass: 0.7 } });
  const out = interpolate(frame, [dur - shift - 16, dur - shift - 4], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const o = Math.max(0, Math.min(rise, out));

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 312,
          background:
            "linear-gradient(to top, rgba(6,12,26,.97) 0%, rgba(6,12,26,.95) 30%, rgba(6,12,26,.78) 56%, rgba(6,12,26,.34) 80%, rgba(6,12,26,0) 100%)",
          opacity: o,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 118,
          bottom: 74,
          opacity: o,
          transform: `translateY(${(1 - rise) * 16}px)`,
          fontFamily: FONT,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 13,
            fontSize: 23,
            fontWeight: 700,
            letterSpacing: "0.13em",
            textTransform: "uppercase",
            color: C.blueSoft,
            marginBottom: 15,
          }}
        >
          <span
            style={{ width: 10, height: 10, borderRadius: 10, background: C.blueSoft }}
          />
          {label}
        </div>
        {keyline ? (
          <div
            style={{
              fontSize: 47,
              fontWeight: 700,
              color: "#fff",
              letterSpacing: "-0.022em",
              lineHeight: 1.1,
              maxWidth: 1180,
              textShadow: "0 2px 18px rgba(0,0,0,.35)",
            }}
          >
            {keyline}
          </div>
        ) : null}
      </div>
      <Img
        src={staticFile("logo-blanc.png")}
        style={{
          position: "absolute",
          right: 118,
          bottom: 82,
          width: 176,
          opacity: o * 0.95,
        }}
      />
    </>
  );
};

/** Filet de progression global. */
export const Progress: React.FC<{ frame: number; total: number }> = ({ frame, total }) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      bottom: 0,
      height: 5,
      width: `${Math.min(100, (frame / total) * 100)}%`,
      background: C.blue,
    }}
  />
);
