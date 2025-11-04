import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Layout } from "@/components/Layout";
import Dashboard from "./pages/Dashboard";
import Devices from "./pages/Devices";
import DeviceDetail from "./pages/DeviceDetail";
import Analytics from "./pages/Analytics";
import Alarms from "./pages/Alarms";
import Reports from "./pages/Reports";
import Map from "./pages/Map";
import Admin from "./pages/Admin";
import Help from "./pages/Help";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dispositivos" element={<Devices />} />
              <Route path="/dispositivos/:deviceId" element={<DeviceDetail />} />
              <Route path="/analises" element={<Analytics />} />
              <Route path="/alarmes" element={<Alarms />} />
              <Route path="/relatorios" element={<Reports />} />
              <Route path="/mapa" element={<Map />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/ajuda" element={<Help />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
