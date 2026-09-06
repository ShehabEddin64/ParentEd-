/** Open-Meteo forecast (free, no key). Cached for 30 minutes per location in sessionStorage. */
export type Forecast = {
  current: { temperature: number; code: number };
  days: { date: string; code: number; min: number; max: number }[];
  fetched: number;
};
export async function forecast(lat: number, lng: number): Promise<Forecast> {
  const key = `parented-weather:${lat.toFixed(2)},${lng.toFixed(2)}`;
  try {
    const cached = sessionStorage.getItem(key);
    if (cached) {
      const f = JSON.parse(cached) as Forecast;
      if (Date.now() - f.fetched < 30 * 60 * 1000) return f;
    }
  } catch {
    /* ignore storage errors */
  }
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=America%2FToronto&forecast_days=4`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Météo indisponible.");
  const j = (await res.json()) as {
    current: { temperature_2m: number; weather_code: number };
    daily: {
      time: string[];
      weather_code: number[];
      temperature_2m_max: number[];
      temperature_2m_min: number[];
    };
  };
  const f: Forecast = {
    current: {
      temperature: Math.round(j.current.temperature_2m),
      code: j.current.weather_code,
    },
    days: j.daily.time.map((date, i) => ({
      date,
      code: j.daily.weather_code[i],
      min: Math.round(j.daily.temperature_2m_min[i]),
      max: Math.round(j.daily.temperature_2m_max[i]),
    })),
    fetched: Date.now(),
  };
  try {
    sessionStorage.setItem(key, JSON.stringify(f));
  } catch {
    /* ignore */
  }
  return f;
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
