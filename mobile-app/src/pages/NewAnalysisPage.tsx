import { FormEvent, useEffect, useState } from "react";
import { parseOkteCsvFile } from "../api/okte";
import { runAnalysis } from "../analysis/engine";
import { formatPriceEurMwh, formatQuarterHourPeriod } from "../lib/utils";
import { listClients, saveDailyResult } from "../storage/db";
import type { Client, DailyResult, OkteRow } from "../types";

export function NewAnalysisPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<DailyResult | null>(null);
  const [importRows, setImportRows] = useState<OkteRow[] | undefined>(undefined);
  const [fallbackNotice, setFallbackNotice] = useState("");

  useEffect(() => {
    listClients().then((data) => {
      setClients(data);
      if (data[0]) setClientId(data[0].id);
    });
  }, []);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setResult(null);
    const client = clients.find((item) => item.id === clientId);
    if (!client) {
      setError("Vyber klienta.");
      return;
    }

    try {
      setLoading(true);
      setFallbackNotice("");
      const output = await runAnalysis({ client, date, okteRows: importRows });
      await saveDailyResult(output);
      setResult(output);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Analýza zlyhala.";
      if (
        !importRows &&
        (message.includes("NetworkError") ||
          message.includes("Failed to fetch") ||
          message.includes("Load failed") ||
          message.includes("CORS"))
      ) {
        setError(
          "Prehliadač zablokoval priame načítanie OKTE dát (CORS). Online fetch z mobilnej web appky preto nemusí fungovať."
        );
        setFallbackNotice(
          "Riešenie: stiahni denný export z OKTE a nahraj ho cez pole 'Fallback OKTE CSV'. Potom analýzu spusti znova."
        );
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const onFileSelected = async (file?: File) => {
    if (!file) return;
    const rows = await parseOkteCsvFile(file);
    setImportRows(rows);
  };

  return (
    <section className="stack">
      <h2>Nová analýza</h2>
      <form className="card stack" onSubmit={onSubmit}>
        <label>
          Klient
          <select value={clientId} onChange={(e) => setClientId(e.target.value)}>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.firstName} {client.lastName} ({client.city})
              </option>
            ))}
          </select>
        </label>
        <label>
          Dátum
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <label>
          Fallback OKTE CSV (voliteľné)
          <input type="file" accept=".csv,text/csv" onChange={(e) => void onFileSelected(e.target.files?.[0])} />
        </label>
        <button disabled={loading || !clients.length} type="submit">
          {loading ? "Počítam..." : "Spustiť analýzu"}
        </button>
      </form>
      {error ? <p className="error">{error}</p> : null}
      {fallbackNotice ? <p>{fallbackNotice}</p> : null}
      {result ? (
        <article className="card stack">
          <h3>Výsledok</h3>
          <h4>Ceny po 15-min intervaloch</h4>
          <div className="intervalList">
            {result.hourlyData.map((item, index) => (
              <p key={`${item.period}-${index}`}>
                {formatQuarterHourPeriod(item.period)}: {formatPriceEurMwh(item.priceEurMwh)} EUR/MWh
              </p>
            ))}
          </div>
        </article>
      ) : null}
    </section>
  );
}
