export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

/** Cadre de l'écran dans la vidéo (px vidéo). L'app est capturée en 1440x900. */
export const APP_W = 1440;
export const APP_H = 900;
export const SCREEN = { x: 160, y: 34, w: 1600, h: 1000 };
export const SCALE = SCREEN.w / APP_W; // 1.111…

export const C = {
  ink: "#111B2A",
  navy: "#11234C",
  blue: "#214CDE",
  blueSoft: "#7AA9FF",
  sky: "#DCEAFF",
  paper: "#F6F3EA",
  muted: "#505B6C",
  line: "#D7DFEB",
  bg: "#EEF1F7",
  white: "#FFFFFF",
};

export const FONT =
  '"Helvetica Neue", Helvetica, "Inter", -apple-system, BlinkMacSystemFont, Arial, sans-serif';

/** Transition en fondu enchaîné entre deux plans. */
export const XFADE = 11;
