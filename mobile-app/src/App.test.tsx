import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";

vi.mock("./storage/db", () => ({
  listClients: async () => [],
  saveClient: async () => undefined,
  deleteClient: async () => undefined,
  listAllResults: async () => [],
  getDailyResult: async () => null
}));

describe("App", () => {
  it("renders navigation", () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    expect(screen.getAllByText("Klienti").length).toBeGreaterThan(0);
    expect(screen.getByText("Nová analýza")).toBeTruthy();
    expect(screen.getByText("História")).toBeTruthy();
  });
});
