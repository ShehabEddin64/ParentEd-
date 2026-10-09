/** Fictional weather fixture. No network request or credentials. */
export type Forecast = {
  current: { temperature: number; code: number };
  days: { date: string; code: number; min: number; max: number }[];
  fetched: number;
};
export async function forecast(_lat: number, _lng: number): Promise<Forecast> {
  return {
    current: { temperature: 19, code: 2 },
    days: [
      { date: "2026-09-07", code: 2, min: 12, max: 20 },
      { date: "2026-09-08", code: 0, min: 13, max: 22 },
      { date: "2026-09-09", code: 3, min: 11, max: 18 },
      { date: "2026-09-10", code: 2, min: 12, max: 21 },
    ],
    fetched: 0,
  };
}
export function weatherLabel(code: number) {
  if (code === 0) return "Ciel dégagé";
  if (code <= 2) return "Éclaircies";
  if (code === 3) return "Nuageux";
  if (code <= 48) return "Brouillard";
  if (code <= 57) return "Bruine";
  if (code <= 67) return "Pluie";
  if (code <= 77) return "Neige";
  if (code <= 82) return "Averses";
  if (code <= 86) return "Averses de neige";
  return "Orage";
}
export type WeatherKind =
  "sun" | "cloudsun" | "cloud" | "fog" | "rain" | "snow" | "storm";
export function weatherKind(code: number): WeatherKind {
  if (code === 0) return "sun";
  if (code <= 2) return "cloudsun";
  if (code === 3) return "cloud";
  if (code <= 48) return "fog";
  if (code <= 67 || (code >= 80 && code <= 82)) return "rain";
  if (code <= 86) return "snow";
  return "storm";
}
