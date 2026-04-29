import { NavLink, Route, Routes } from "react-router-dom";
import { ClientsPage } from "./pages/ClientsPage";
import { NewAnalysisPage } from "./pages/NewAnalysisPage";
import { HistoryPage } from "./pages/HistoryPage";
import { ResultDetailPage } from "./pages/ResultDetailPage";

export function App() {
  return (
    <div className="shell">
      <header className="header">
        <h1>FVE Analýza</h1>
        <p>Mobilná verzia V1</p>
      </header>
      <main className="content">
        <Routes>
          <Route path="/" element={<NewAnalysisPage />} />
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/result/:clientId/:date" element={<ResultDetailPage />} />
        </Routes>
      </main>
      <nav className="nav">
        <NavLink to="/">Nová analýza</NavLink>
        <NavLink to="/clients">Klienti</NavLink>
        <NavLink to="/history">História</NavLink>
      </nav>
    </div>
  );
}
