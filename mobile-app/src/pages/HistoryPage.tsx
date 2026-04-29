import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { formatCurrency } from "../lib/utils";
import { listAllResults, deleteDailyResult } from "../storage/db";
import type { DailyResult } from "../types";

export function HistoryPage() {
  const [rows, setRows] = useState<DailyResult[]>([]);
  const loadHistory = () => {
    listAllResults().then(setRows);
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm("Naozaj chcete vymazať tento záznam?")) {
      await deleteDailyResult(id);
      loadHistory();
    }
  };

  return (
    <section className="stack">
      <h2>História výsledkov</h2>
      {!rows.length ? <p>Zatiaľ bez výsledkov.</p> : null}
      {rows.map((row) => (
        <article className="card" key={row.id}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <p>Dátum: {row.date}</p>
              <p>Zisk: {formatCurrency(row.totalProfit)}</p>
              <p>FVE: {row.fvePredictionText}</p>
              <Link to={`/result/${row.clientId}/${row.date}`}>Detail</Link>
            </div>
            <div style={{ paddingLeft: '10px' }}>
              <button 
                type="button" 
                className="danger" 
                onClick={() => handleDelete(row.id)}
              >
                Vymazať
              </button>
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}
