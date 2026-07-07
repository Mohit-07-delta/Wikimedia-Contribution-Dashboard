import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import GlobalDashboardPage from "./pages/GlobalDashboardPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/user/:username" element={<GlobalDashboardPage />} />
        <Route path="/dashboard/:project/:username" element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}
