import { FormEvent, useEffect, useState } from "react";
import { deleteClient, listClients, saveClient } from "../storage/db";
import { normalizeCity, uid } from "../lib/utils";
import type { Client } from "../types";

export function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [city, setCity] = useState("");
  const [batteryCapacity, setBatteryCapacity] = useState("10");

  const refresh = async () => setClients(await listClients());
  useEffect(() => {
    void refresh();
  }, []);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const client: Client = {
      id: uid(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      city: normalizeCity(city),
      batteryCapacityKwh: Number.parseFloat(batteryCapacity),
      status: "active",
      createdAt: new Date().toISOString()
    };
    await saveClient(client);
    setFirstName("");
    setLastName("");
    setCity("");
    setBatteryCapacity("10");
    await refresh();
  };

  return (
    <section className="stack">
      <h2>Klienti</h2>
      <form className="card stack" onSubmit={onSubmit}>
        <input required placeholder="Meno" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        <input required placeholder="Priezvisko" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        <input required placeholder="Mesto" value={city} onChange={(e) => setCity(e.target.value)} />
        <label>
          Kapacita batérie (kWh)
          <input
            required
            type="number"
            min="1"
            step="0.1"
            placeholder="Napr. 10"
            value={batteryCapacity}
            onChange={(e) => setBatteryCapacity(e.target.value)}
          />
        </label>
        <button type="submit">Uložiť klienta</button>
      </form>
      <div className="stack">
        {clients.map((client) => (
          <article className="card" key={client.id}>
            <strong>
              {client.firstName} {client.lastName}
            </strong>
            <p>{client.city}</p>
            <p>Batéria: {client.batteryCapacityKwh} kWh</p>
            <button className="danger" onClick={() => void deleteClient(client.id).then(refresh)}>
              Zmazať
            </button>
          </article>
        ))}
        {!clients.length ? <p>Zatiaľ nemáš žiadnych klientov.</p> : null}
      </div>
    </section>
  );
}
