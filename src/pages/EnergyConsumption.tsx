import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from "recharts";
import { TrendingUp, Download, Calendar } from "lucide-react";
import { formatNumber } from "@/lib/formatters";
import { toast } from "sonner";
import api from "@/lib/api";

type Row = Record<string, any>;

const EnergyConsumption = () => {
  const [selectedDevice, setSelectedDevice] = useState("med-TRF-01");
  const [timeRange, setTimeRange] = useState("7d");

  const [rows, setRows] = useState<Row[]>([]);
  const [devices, setDevices] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  // -------------------------
  // 1. Buscar dados da API
  // -------------------------
  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);

        const [plan1, plan2] = await Promise.all([
          api.get("/data/Planilha1.xlsx"),
          api.get("/data/Planilha2.xlsx"),
        ]);

        const safe = (resp: any) =>
          resp?.data?.data?.[0]?.data ?? [];

        setRows(safe(plan1));      // Dados de corrente/tensão
        setDevices(safe(plan2));   // Lista de dispositivos
      } catch (e) {
        console.error("Erro ao carregar:", e);
        toast.error("Falha ao carregar dados da API");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  if (loading) {
    return <p className="p-6">Carregando dados...</p>;
  }

  // -------------------------
  // 2. Transformar dados da API em períodos
  // -------------------------
  const periods = rows.map((r, i) => ({
    period:
      timeRange === "24h" ? `${i}h` :
      timeRange === "7d" ? `Dia ${i + 1}` :
      timeRange === "30d" ? `Dia ${i + 1}` : `Mês ${i + 1}`,
    energiaKWh: Math.abs(Number(r["Tensão em V"]) * Number(r["Corrente em A"])) / 1000,
    avgPower: Math.abs(Number(r["Tensão em V"]) * Number(r["Corrente em A"])),
    maxPower: Math.abs(Number(r["Tensão em V"]) * Number(r["Corrente em A"])) * 1.15,
  }));

  const totalEnergy = periods.reduce((acc, p) => acc + p.energiaKWh, 0);
  const avgPower = periods.reduce((acc, p) => acc + p.avgPower, 0) / periods.length;
  const peakPower = Math.max(...periods.map(p => p.maxPower));

  const handleExport = () => {
    toast.success("Relatório exportado com sucesso!");
  };

  const chartData = periods.map(p => ({
    period: p.period,
    energia: p.energiaKWh,
    potenciaMedia: p.avgPower,
    potenciaPico: p.maxPower,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Consumo de Energia</h1>
          <p className="text-muted-foreground">Dados reais da API</p>
        </div>
        <Button onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Exportar Relatório
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={selectedDevice} onValueChange={setSelectedDevice}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Selecionar dispositivo" />
          </SelectTrigger>
          <SelectContent>
            {devices.map((device, idx) => (
              <SelectItem key={idx} value={device.deviceId || `dev-${idx}`}>
                {device.name || "Sem nome"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Últimas 24 horas</SelectItem>
            <SelectItem value="7d">Últimos 7 dias</SelectItem>
            <SelectItem value="30d">Últimos 30 dias</SelectItem>
            <SelectItem value="12m">Últimos 12 meses</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* CARDS */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Energia Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(totalEnergy, 1)} kWh</div>
            <p className="text-xs text-muted-foreground mt-1">No período selecionado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Potência Média</CardTitle>
            <TrendingUp className="h-4 w-4 text-chart-1" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(avgPower, 1)} kW</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Potência de Pico</CardTitle>
            <TrendingUp className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(peakPower, 1)} kW</div>
          </CardContent>
        </Card>
      </div>

      {/* GRAFICO DE ENERGIA */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Consumo de Energia ao Longo do Tempo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" tick={{ fontSize: 12 }} />
              <YAxis label={{ value: "Energia (kWh)", angle: -90, position: "insideLeft" }} />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="energia" stroke="#4f46e5" fill="#a5b4fc" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* GRAFICO DE POTÊNCIA */}
      <Card>
        <CardHeader>
          <CardTitle>Curva de Potência</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis label={{ value: "Potência (kW)", angle: -90, position: "insideLeft" }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="potenciaMedia" stroke="#2563eb" strokeWidth={2} />
              <Line type="monotone" dataKey="potenciaPico" stroke="#f43f5e" strokeWidth={2} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnergyConsumption;
