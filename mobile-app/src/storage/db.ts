import { openDB } from "idb";
import type { DBSchema, IDBPDatabase } from "idb";
import type { Client, DailyResult } from "../types";

const DB_NAME = "fve-mobile-db";
const DB_VERSION = 1;

interface FveDbSchema extends DBSchema {
  clients: {
    key: string;
    value: Client;
  };
  dailyResults: {
    key: string;
    value: DailyResult;
    indexes: { "by-client": string; "by-client-date": [string, string] };
  };
}

let dbPromise: Promise<IDBPDatabase<FveDbSchema>> | null = null;

const getDb = (): Promise<IDBPDatabase<FveDbSchema>> => {
  if (!dbPromise) {
    dbPromise = openDB<FveDbSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("clients")) {
          db.createObjectStore("clients", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("dailyResults")) {
          const store = db.createObjectStore("dailyResults", { keyPath: "id" });
          store.createIndex("by-client", "clientId", { unique: false });
          store.createIndex("by-client-date", ["clientId", "date"], { unique: true });
        }
      }
    });
  }
  return dbPromise;
};

export const saveClient = async (client: Client): Promise<void> => {
  const db = await getDb();
  await db.put("clients", client);
};

export const listClients = async (): Promise<Client[]> => {
  const db = await getDb();
  return db.getAll("clients");
};

export const deleteClient = async (id: string): Promise<void> => {
  const db = await getDb();
  const tx = db.transaction(["clients", "dailyResults"], "readwrite");
  await tx.objectStore("clients").delete(id);
  const index = tx.objectStore("dailyResults").index("by-client");
  let cursor = await index.openCursor(id);
  while (cursor) {
    await cursor.delete();
    cursor = await cursor.continue();
  }
  await tx.done;
};

export const saveDailyResult = async (result: DailyResult): Promise<void> => {
  const db = await getDb();
  const index = db.transaction("dailyResults").store.index("by-client-date");
  const existing = await index.get([result.clientId, result.date]);
  if (existing) {
    await db.put("dailyResults", { ...result, id: existing.id });
    return;
  }
  await db.put("dailyResults", result);
};

export const getResultsByClient = async (clientId: string): Promise<DailyResult[]> => {
  const db = await getDb();
  const rows = await db.getAllFromIndex("dailyResults", "by-client", clientId);
  return rows.sort((a, b) => b.date.localeCompare(a.date));
};

export const getDailyResult = async (clientId: string, date: string): Promise<DailyResult | null> => {
  const db = await getDb();
  const index = db.transaction("dailyResults").store.index("by-client-date");
  const row = await index.get([clientId, date]);
  return row ?? null;
};

export const listAllResults = async (): Promise<DailyResult[]> => {
  const db = await getDb();
  const rows = await db.getAll("dailyResults");
  return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
};
