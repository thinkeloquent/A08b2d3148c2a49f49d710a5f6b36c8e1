import { Routes, Route } from "react-router-dom";
import { AdminLayout } from "@/components/layout";
import { DashboardPage } from "@/pages/DashboardPage";
import { HealthPage } from "@/pages/HealthPage";
import { SettingsPage } from "@/pages/SettingsPage";

export default function App() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="health" element={<HealthPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
