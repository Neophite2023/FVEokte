import { fetchWithTimeout, withRetry } from "../lib/http";
import type { OkteRow } from "../types";

const DEFAULT_OKTE_PROXY_URL = "https://okte-proxy.neophite.workers.dev/okte";
const OKTE_PROXY_URL =
  (import.meta.env.VITE_OKTE_PROXY_URL as string | undefined)?.trim() || DEFAULT_OKTE_PROXY_URL;

const parseCsv = (raw: string): OkteRow[] => {
  const lines = raw.split(/\r?\n/).filter(Boolean);
  const header = lines[0]?.split(";") ?? [];
  const periodIndex = header.findIndex((h) => h.toLowerCase().includes("peri"));
  const priceIndex = header.findIndex((h) => h.toLowerCase().includes("cena"));
  if (periodIndex < 0 || priceIndex < 0) {
    throw new Error("OKTE CSV nemá očakávané stĺpce.");
  }

  return lines.slice(1).map((line) => {
    const cols = line.split(";");
    const rawPrice = (cols[priceIndex] ?? "0").replace(",", ".");
    return {
      period: cols[periodIndex] ?? "",
      priceEurMwh: Number.parseFloat(rawPrice)
    };
  });
};

export async function fetchOkteData(date: string): Promise<OkteRow[]> {
  const query = new URLSearchParams({
    deliverydayfrom: date,
    deliverydayto: date,
    simple: "false",
    lang: "sk-SK",
    format: "csv"
  });

  const url = `${OKTE_PROXY_URL}${OKTE_PROXY_URL.includes("?") ? "&" : "?"}${query.toString()}`;
  const response = await withRetry(() => fetchWithTimeout(url), 3, 1000);

  if (response.status === 404) {
    throw new Error("OKTE dáta pre zvolený dátum nie sú dostupné.");
  }
  if (!response.ok) {
    throw new Error(`OKTE API chyba: ${response.status}`);
  }
  const body = await response.text();
  const lower = body.toLowerCase();
  if (
    lower.includes("informačný systém okte je dočasne nedostupný") ||
    lower.includes("okte infomation system is temporary not available") ||
    lower.includes("temporarily not available")
  ) {
    throw new Error("OKTE je dočasne nedostupné. Skús to neskôr alebo použi fallback CSV.");
  }

  return parseCsv(body);
}

export async function parseOkteCsvFile(file: File): Promise<OkteRow[]> {
  const text = await file.text();
  return parseCsv(text);
}
