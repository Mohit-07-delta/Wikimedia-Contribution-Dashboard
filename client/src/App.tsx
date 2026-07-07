import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import GlobalDashboardPage from "./pages/GlobalDashboardPage";
import ErrorBoundary from "./components/ErrorBoundary";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/user/:username" element={
          <ErrorBoundary>
            <GlobalDashboardPage />
          </ErrorBoundary>
        } />
        <Route path="/dashboard/:project/:username" element={
          <ErrorBoundary>
            <DashboardPage />
          </ErrorBoundary>
        } />
      </Routes>
    </BrowserRouter>
  );
}
