import { fetchWithTimeout, withRetry } from "../lib/http";

type GeocodeResult = { lat: string; lon: string };

const OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast";
const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

export async function geocodeCity(city: string): Promise<{ latitude: number; longitude: number }> {
  const params = new URLSearchParams({
    city,
    country: "Slovakia",
    format: "json",
    limit: "1"
  });
  const response = await withRetry(
    () =>
      fetchWithTimeout(`${NOMINATIM_URL}?${params.toString()}`, {
        headers: { Accept: "application/json" }
      }),
    2
  );
  if (!response.ok) throw new Error(`Geokódovanie zlyhalo (${response.status}).`);
  const payload = (await response.json()) as GeocodeResult[];
  if (!payload[0]) throw new Error("Mesto sa nepodarilo nájsť.");
  return { latitude: Number(payload[0].lat), longitude: Number(payload[0].lon) };
}

export async function fetchFveScores(
  latitude: number,
  longitude: number,
  date: string
): Promise<number[]> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    hourly: "cloudcover,shortwave_radiation",
    start_date: date,
    end_date: date,
    timezone: "auto"
  });
  const response = await withRetry(() => fetchWithTimeout(`${OPEN_METEO_URL}?${params}`), 3);
  if (!response.ok) throw new Error(`Open-Meteo chyba (${response.status}).`);
  const data = (await response.json()) as {
    hourly?: { cloudcover?: number[]; shortwave_radiation?: number[] };
  };
  const cloud = data.hourly?.cloudcover ?? [];
  const radiation = data.hourly?.shortwave_radiation ?? [];
  if (!cloud.length || !radiation.length) throw new Error("Open-Meteo vrátil prázdne hodinové dáta.");

  return cloud.map((cloudCover, i) => {
    const score = 100 - cloudCover / 10 + (radiation[i] ?? 0) * (2 / 300);
    return Math.max(0, Math.min(100, score));
  });
}
