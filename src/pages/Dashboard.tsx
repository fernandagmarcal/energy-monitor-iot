import { useState, useEffect } from "react";
import { Activity, Zap, Gauge, AlertTriangle, Radio as RadioIcon } from "lucide-react";
import { MetricCard } from "@/components/MetricCard";
import { RealTimeChart } from "@/components/RealTimeChart";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateTime } from "@/lib/formatters";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";

type ApiRow = Record<string, any>;
const toSafeLower = (v: any) => String(v || "").toLowerCase();

const Dashboard = () => {
  const navigate = useNavigate();

  const [metricData, setMetricData] = useState<ApiRow | null>(null);
  const [deviceList, setDeviceList] = useState<ApiRow[]>([]);
  const [eventList, setEventList] = useState<ApiRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função genérica para extrair planilhas do Go
  const safeExtract = (resp: any): ApiRow[] => {
    if (!resp || !resp.data || !resp.data.data) return [];
    const arr = resp.data.data;
    if (!Array.isArray(arr) || !arr[0] || !Array.isArray(arr[0].data)) return [];
    return arr[0].data;
  };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        setError(null);

        const [m, d, e] = await Promise.all([
          api.get("/data/Planilha1.xlsx"),
          api.get("/data/Planilha2.xlsx"),
          api.get("/data/Planilha3.xlsx"),
        ]);

        console.log("RAW_1:", m.data);
        console.log("RAW_2:", d.data);
        console.log("RAW_3:", e.data);

        // PLANILHA 1 → MÉTRICAS
        const metrics = safeExtract(m);
        if (metrics.length > 0) setMetricData(metrics[0]);

        // PLANILHA 2 → DISPOSITIVOS
        const rawDevices = safeExtract(d);
        const devices = rawDevices.map((item: any, index: number) => ({
          deviceId: `dev-${index + 1}`,
          name: `Dispositivo ${item["Pontos"] || index + 1}`,
          location: "Sem localização",

          // Status: se tensão for positiva → online
          status:
            Number(item["Tensão em V"]) > 0
              ? "online"
              : Number(item["Tensão em V"]) === 0
              ? "offline"
              : "offline",

          corrente: item["Corrente em A"] || null,
          tensao: item["Tensão em V"] || null,
          adcCorrente: item["ADC Corrente"] || null,
          adcTensao: item["ADC Tensão"] || null,
        }));

        setDeviceList(devices);

        // PLANILHA 3 → ALARMES
        const rawEvents = safeExtract(e);
        const events = rawEvents.map((item: any, index: number) => {
          const vTensao = Number(item["Tensão em V"]);
          const vCorrente = Number(item["Corrente em A"]);

          // Regras simples para gerar alarmes reais
          let severity = "normal";
          let status = "inativo";

          if (vTensao < -170 || vCorrente < -2.8) {
            severity = "critico";
            status = "ativo";
          } else if (vTensao < -168) {
            severity = "alerta";
            status = "ativo";
          }

          return {
            id: index + 1,
            deviceId: `dev-${item["Pontos"] || index + 1}`,
            tsStart: new Date().toISOString(),
            severity,
            status,
            type: "Anomalia de Energia",
            tensao: vTensao,
            corrente: vCorrente,
          };
        });

        setEventList(events);
      } catch (err) {
        console.error("ERRO FATAL:", err);
        setError("Erro ao buscar dados. Verifique se o servidor Go está rodando.");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  // ESTADOS DE CARREGAMENTO / ERRO
  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold">Visão Geral</h1>
        <p className="text-muted-foreground">Carregando dados...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold">Erro</h1>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  // DASHBOARD
  const onlineDevices = deviceList.filter((d) => toSafeLower(d.status) === "online").length;
  const activeAlarms = eventList.filter((e) => toSafeLower(e.status) === "ativo").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Visão Geral</h1>
        <p className="text-muted-foreground">Monitoramento em tempo real</p>
      </div>

      {/* MÉTRICAS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Corrente em A"
          value={metricData ? Number(metricData["CORRENTE EM A"] || 0).toFixed(2) : "0.00"}
          icon={Zap}
        />
        <MetricCard
          title="Tensão em V"
          value={metricData ? Number(metricData["TENSÃO EM V"] || 0).toFixed(2) : "0.00"}
          icon={Gauge}
        />
        <MetricCard title="Pontos" value={metricData?.["PONTOS"] || 0} icon={Activity} />
        <MetricCard
          title="Alarmes Ativos"
          value={activeAlarms}
          icon={AlertTriangle}
          status={activeAlarms > 0 ? "warning" : "normal"}
        />
      </div>

      {/* GRÁFICO + DISPOSITIVOS */}
      <div className="grid gap-4 lg:grid-cols-2">
        <RealTimeChart deviceId="med-TRF-01" />

        <Card>
          <CardHeader>
            <CardTitle>Status dos Dispositivos (Planilha 2)</CardTitle>
          </CardHeader>
          <CardContent>
            {deviceList.slice(0, 5).map((d, i) => {
              const isOnline = toSafeLower(d.status) === "online";
              return (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-accent"
                  onClick={() => navigate("/dispositivos")}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-10 w-10 flex items-center justify-center rounded-lg ${
                        isOnline ? "bg-success/10" : "bg-offline/10"
                      }`}
                    >
                      <RadioIcon
                        className={`h-5 w-5 ${isOnline ? "text-success" : "text-offline"}`}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{d.name}</p>
                      <p className="text-xs text-muted-foreground">{d.location}</p>
                    </div>
                  </div>
                  <StatusBadge severity={isOnline ? "online" : "offline"}>{d.status}</StatusBadge>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* ALARMES */}
      <Card>
        <CardHeader>
          <CardTitle>Últimos Alarmes (Planilha 3)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Horário</TableHead>
                <TableHead>Dispositivo</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Severidade</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {eventList.map((ev, i) => {
                const dev = deviceList.find((x) => x.deviceId === ev.deviceId);
                return (
                  <TableRow
                    key={i}
                    className="cursor-pointer hover:bg-accent"
                    onClick={() => navigate("/alarmes")}
                  >
                    <TableCell>{formatDateTime(ev.tsStart)}</TableCell>
                    <TableCell>{dev?.name || "N/A"}</TableCell>
                    <TableCell>{ev.type}</TableCell>
                    <TableCell>
                      <StatusBadge severity={ev.severity}>{ev.severity}</StatusBadge>
                    </TableCell>
                    <TableCell>{ev.status}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
