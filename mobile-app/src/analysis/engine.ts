import { fetchOkteData } from "../api/okte";
import { fetchFveScores, geocodeCity } from "../api/weather";
import { normalizeCity, uid } from "../lib/utils";
import type { AnalysisInput, DailyResult, HourlyPoint, OkteRow } from "../types";

const FVE_PEAK_KW = 5;
const FVE_EFFICIENCY = 0.8;

const scoreToText = (score: number): string => {
  if (score <= 20) return "veľmi slabé";
  if (score <= 40) return "slabé";
  if (score <= 60) return "priemerné";
  if (score <= 80) return "dobré";
  return "výborné";
};

const toHourlyPoints = (rows: OkteRow[], fveScores: number[]): HourlyPoint[] =>
  rows.slice(0, 96).map((row, index) => {
    const block = Math.ceil((index + 1) / 24);
    const hourIndex = Math.floor(index / 4);
    const score = fveScores[hourIndex] ?? 0;
    const fveKwh = (score / 100) * FVE_PEAK_KW * 0.25 * FVE_EFFICIENCY;
    return { period: row.period, priceEurMwh: row.priceEurMwh, fveKwh, block };
  });

const summarizeBlock = (
  points: HourlyPoint[],
  block: number,
  action: "buy" | "sell" | "charge",
  range: string,
  label: string
): { period: string; price: number; label: string; range: string } => {
  const selected = points.filter((point) => point.block === block);
  if (!selected.length) return { period: "N/A", price: 0, label, range };
  const target =
    action === "buy" || action === "charge"
      ? selected.reduce((acc, cur) => (cur.priceEurMwh < acc.priceEurMwh ? cur : acc))
      : selected.reduce((acc, cur) => (cur.priceEurMwh > acc.priceEurMwh ? cur : acc));
  return { period: target.period, price: target.priceEurMwh, label, range };
};

export async function runAnalysis(input: AnalysisInput): Promise<DailyResult> {
  const city = normalizeCity(input.client.city);
  const okteRows = input.okteRows ?? (await fetchOkteData(input.date));
  const { latitude, longitude } = await geocodeCity(city);
  const fveScores = await fetchFveScores(latitude, longitude, input.date);
  const hourly = toHourlyPoints(okteRows, fveScores);

  const b1 = summarizeBlock(hourly, 1, "buy", "00-06", "blok 1");
  const b2 = summarizeBlock(hourly, 2, "sell", "06-12", "blok 2");
  const b3 = summarizeBlock(hourly, 3, "charge", "12-18", "blok 3");
  const b4 = summarizeBlock(hourly, 4, "sell", "18-24", "blok 4");

  const avgFveScore = fveScores.reduce((sum, value) => sum + value, 0) / fveScores.length;
  const zeroPriceIntervals = hourly
    .filter((point) => point.priceEurMwh <= 0)
    .map((point) => point.period)
    .join(", ");
  const totalProfit = (b2.price + b4.price - b1.price - b3.price) * (input.client.batteryCapacityKwh / 1000);

  return {
    id: uid(),
    clientId: input.client.id,
    date: input.date,
    block1Buy: b1.period,
    priceBuy1: b1.price,
    block2Sell: b2.period,
    priceSell1: b2.price,
    block3Buy: b3.period,
    priceBuy2: b3.price,
    block4Sell: b4.period,
    priceSell2: b4.price,
    totalProfit,
    fvePredictionText: scoreToText(avgFveScore),
    zeroPriceIntervals: zeroPriceIntervals || "žiadne",
    hourlyData: hourly,
    createdAt: new Date().toISOString()
  };
}
