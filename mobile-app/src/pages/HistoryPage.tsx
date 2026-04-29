import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { formatCurrency } from "../lib/utils";
import { listAllResults } from "../storage/db";
import type { DailyResult } from "../types";

export function HistoryPage() {
  const [rows, setRows] = useState<DailyResult[]>([]);
  useEffect(() => {
    listAllResults().then(setRows);
  }, []);

  return (
    <section className="stack">
      <h2>História výsledkov</h2>
      {!rows.length ? <p>Zatiaľ bez výsledkov.</p> : null}
      {rows.map((row) => (
        <article className="card" key={row.id}>
          <p>Dátum: {row.date}</p>
          <p>Zisk: {formatCurrency(row.totalProfit)}</p>
          <p>FVE: {row.fvePredictionText}</p>
          <Link to={`/result/${row.clientId}/${row.date}`}>Detail</Link>
        </article>
      ))}
    </section>
  );
}
