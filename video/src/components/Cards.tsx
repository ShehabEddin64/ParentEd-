import React from "react";
import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";
import { C, FONT } from "../theme";

const Rise: React.FC<{ delay: number; children: React.ReactNode }> = ({ delay, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 200, mass: 0.8 } });
  return (
    <div style={{ opacity: s, transform: `translateY(${(1 - s) * 26}px)` }}>{children}</div>
  );
};

export const TitleCard: React.FC<{ dur: number; shift: number }> = ({ dur, shift }) => {
  const frame = useCurrentFrame() - shift;
  const out = interpolate(frame, [dur - 14, dur - 2], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const drift = interpolate(frame, [0, dur], [0, -26], {
    easing: Easing.bezier(0.4, 0, 0.4, 1),
  });
  return (
    <AbsoluteFill style={{ background: C.paper, opacity: out, fontFamily: FONT }}>
      <Img
        src={staticFile("paper.jpg")}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.9 }}
      />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          padding: "0 160px",
          transform: `translateY(${drift}px)`,
        }}
      >
        <Rise delay={4}>
          <Img src={staticFile("logo.png")} style={{ width: 262, marginBottom: 56 }} />
        </Rise>
        <Rise delay={12}>
          <div
            style={{
              fontSize: 118,
              fontWeight: 700,
              color: C.ink,
              lineHeight: 1.02,
              letterSpacing: "-0.03em",
            }}
          >
            Enseigner
            <br />à la maison.
          </div>
        </Rise>
        <Rise delay={26}>
          <div
            style={{
              fontSize: 118,
              fontWeight: 700,
              color: C.blue,
              lineHeight: 1.02,
              letterSpacing: "-0.03em",
              marginTop: 6,
            }}
          >
            Ensemble.
          </div>
        </Rise>
        <Rise delay={42}>
          <div style={{ marginTop: 46, fontSize: 36, color: C.muted, fontWeight: 500 }}>
            Une démonstration, du point de vue du parent.
          </div>
        </Rise>
      </AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: 160,
          bottom: 66,
          fontSize: 21,
          color: C.muted,
          fontFamily: FONT,
        }}
      >
        Données fictives · Démonstration locale · ParentEd, Québec
      </div>
    </AbsoluteFill>
  );
};

export const EndCard: React.FC<{ dur: number; shift: number }> = ({ dur, shift }) => {
  const frame = useCurrentFrame() - shift;
  const inO = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const pillars = ["Se former", "S’organiser", "Se rencontrer", "Se faire aider"];
  return (
    <AbsoluteFill style={{ background: C.navy, opacity: inO, fontFamily: FONT }}>
      <AbsoluteFill style={{ justifyContent: "center", padding: "0 160px" }}>
        <Rise delay={6}>
          <Img src={staticFile("logo-blanc.png")} style={{ width: 286, marginBottom: 74 }} />
        </Rise>
        <div style={{ display: "flex", gap: 24, marginBottom: 80 }}>
          {pillars.map((p, i) => (
            <Rise key={p} delay={16 + i * 9}>
              <div
                style={{
                  border: `2px solid rgba(190,208,242,.4)`,
                  borderRadius: 16,
                  padding: "30px 34px",
                  fontSize: 38,
                  fontWeight: 700,
                  color: "#fff",
                  letterSpacing: "-0.01em",
                  minWidth: 334,
                }}
              >
                {p}
              </div>
            </Rise>
          ))}
        </div>
        <Rise delay={58}>
          <div
            style={{
              fontSize: 74,
              fontWeight: 700,
              color: "#fff",
              letterSpacing: "-0.02em",
            }}
          >
            Enseigner à la maison,{" "}
            <span style={{ color: C.blueSoft }}>ensemble.</span>
          </div>
        </Rise>
      </AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: 160,
          bottom: 66,
          fontSize: 21,
          color: "#BED0F2",
        }}
      >
        Produit de démonstration · données fictives · aucune donnée réelle n’est utilisée
      </div>
    </AbsoluteFill>
  );
};
