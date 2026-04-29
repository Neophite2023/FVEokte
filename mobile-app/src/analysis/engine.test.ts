import { describe, expect, it } from "vitest";
import { runAnalysis } from "./engine";
import type { AnalysisInput, Client, OkteRow } from "../types";

const client: Client = {
  id: "C1",
  firstName: "A",
  lastName: "B",
  city: "Bratislava",
  batteryCapacityKwh: 10,
  status: "active",
  createdAt: new Date().toISOString()
};

const okteRows: OkteRow[] = Array.from({ length: 96 }, (_, i) => ({
  period: `P${i + 1}`,
  priceEurMwh: i < 24 ? 20 : i < 48 ? 100 : i < 72 ? 10 : 80
}));

describe("runAnalysis", () => {
  it("computes expected block prices", async () => {
    const input: AnalysisInput = { client, date: "2026-04-01", okteRows };
    global.fetch = (async (url: string) => {
      if (url.includes("nominatim")) {
        return new Response(JSON.stringify([{ lat: "48.1", lon: "17.1" }]), { status: 200 });
      }
      return new Response(
        JSON.stringify({
          hourly: {
            cloudcover: Array.from({ length: 24 }, () => 50),
            shortwave_radiation: Array.from({ length: 24 }, () => 300)
          }
        }),
        { status: 200 }
      );
    }) as typeof fetch;

    const result = await runAnalysis(input);
    expect(result.priceBuy1).toBe(20);
    expect(result.priceSell1).toBe(100);
    expect(result.priceBuy2).toBe(10);
    expect(result.priceSell2).toBe(80);
    expect(result.totalProfit).toBeGreaterThan(0);
  });
});
