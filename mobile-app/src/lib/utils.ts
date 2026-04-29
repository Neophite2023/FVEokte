import { CITY_ALIASES } from "../data/cityAliases";

export const slugify = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

export const toTitleCase = (value: string): string =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

export const normalizeCity = (city: string): string => {
  const key = slugify(city);
  return CITY_ALIASES[key] ?? toTitleCase(city.trim());
};

export const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("sk-SK", { style: "currency", currency: "EUR" }).format(value);

export const formatPriceEurMwh = (value: number): string =>
  new Intl.NumberFormat("sk-SK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);

export const formatQuarterHourPeriod = (period: string): string => {
  const index = Number.parseInt(period, 10);
  if (!Number.isFinite(index) || index < 1 || index > 96) return period;
  const startMinutes = (index - 1) * 15;
  const endMinutes = index * 15;
  const toClock = (minutes: number) => {
    const h = Math.floor((minutes % (24 * 60)) / 60)
      .toString()
      .padStart(2, "0");
    const m = (minutes % 60).toString().padStart(2, "0");
    return `${h}:${m}`;
  };
  return `${period} (${toClock(startMinutes)}-${toClock(endMinutes)})`;
};

export const uid = (): string => crypto.randomUUID();
