import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { formatPriceEurMwh, formatQuarterHourPeriod } from "../lib/utils";
import { getDailyResult } from "../storage/db";
import type { DailyResult } from "../types";

export function ResultDetailPage() {
  const { clientId = "", date = "" } = useParams();
  const [row, setRow] = useState<DailyResult | null>(null);

  useEffect(() => {
    if (!clientId || !date) return;
    getDailyResult(clientId, date).then(setRow);
  }, [clientId, date]);

  if (!row) return <p>Výsledok sa nenašiel.</p>;

  return (
    <section className="stack">
      <h2>Detail výsledku</h2>
      <article className="card stack">
        <h3>Ceny po 15-min intervaloch</h3>
        <div className="intervalList">
          {row.hourlyData.map((item, index) => (
            <p key={`${item.period}-${index}`}>
              {formatQuarterHourPeriod(item.period)}: {formatPriceEurMwh(item.priceEurMwh)} EUR/MWh
            </p>
          ))}
        </div>
      </article>
    </section>
  );
}
