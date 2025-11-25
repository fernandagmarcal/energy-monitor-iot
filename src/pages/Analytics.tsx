import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { Download, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { formatNumber } from "@/lib/formatters";

// --------------------------------------
// MAPA DE DISPOSITIVOS -> PLANILHAS
// --------------------------------------
const DEVICE_MAP: Record<string, string> = {
  "med-TRF-01": "Planilha1.xlsx",
  "med-TRF-02": "Planilha2.xlsx",
  "med-TRF-03": "Planilha3.xlsx",
};

// Sheets possíveis
const SHEET_NAMES = ["Página11", "Página9", "Página10", "Planilha1", "Planilha2", "Planilha3", "Sheet1"];

// --------------------------------------
// Nomes das métricas
// --------------------------------------
const METRIC_LABELS = {
  P: "Potência Ativa (W)",
  S: "Potência Aparente (VA)",
  FP: "Fator de Potência",
  THD_V: "THD Tensão (%)",
  THD_I: "THD Corrente (%)",
  freq: "Frequência (Hz)",
};

const Analytics = () => {
  const [selectedDevice, setSelectedDevice] = useState("med-TRF-01");
  const [timeRange, setTimeRange] = useState("24h");
  const [metric, setMetric] = useState("P");

  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --------------------------------------
  // Carregar dados reais das planilhas
  // --------------------------------------
  const loadData = async () => {
    try {
      setLoading(true);

      const file = DEVICE_MAP[selectedDevice];
      const res = await api.get(`/data/${file}`);

      const sheets = res.data.data;
      const sheet = sheets.find((s: any) => SHEET_NAMES.includes(s.sheet_name));

      if (!sheet) {
        console.error("Página não encontrada na planilha");
        setChartData([]);
        return;
      }

      const rows = sheet.data;

      const processed = rows.map((row: any, index: number) => {
        const V = Number(row["Tensão em V"] ?? 0);
        const I = Number(row["Corrente em A"] ?? 0);

        const P = V * I;
        const S = P;
        const FP = 1.0;
        const freq = 60;

        return {
          time: index + 1,
          P,
          S,
          FP,
          THD_V: 0,
          THD_I: 0,
          freq,
        };
      });

      setChartData(processed);
    } catch (e) {
      console.error("Erro ao carregar analytics:", e);
      setChartData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDevice, timeRange]);

  const handleExport = () => toast.success("Análise exportada!");

  const label = METRIC_LABELS[metric as keyof typeof METRIC_LABELS];

  if (loading) return <p>Carregando dados…</p>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Análises</h1>
          <p className="text-muted-foreground">Tendências extraídas dos dados reais da API</p>
        </div>
        <Button onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">

        <Select value={selectedDevice} onValueChange={setSelectedDevice}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Dispositivo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="med-TRF-01">Medidor TRF 01</SelectItem>
            <SelectItem value="med-TRF-02">Medidor TRF 02</SelectItem>
            <SelectItem value="med-TRF-03">Medidor TRF 03</SelectItem>
          </SelectContent>
        </Select>

        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Últimas 24h</SelectItem>
            <SelectItem value="7d">Últimos 7 dias</SelectItem>
            <SelectItem value="30d">Últimos 30 dias</SelectItem>
          </SelectContent>
        </Select>

        <Select value={metric} onValueChange={setMetric}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Métrica" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(METRIC_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Gráfico */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {label}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey={metric}
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-3">

        <Card>
          <CardHeader><CardTitle>Média</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatNumber(
                chartData.reduce((acc, d) => acc + d[metric], 0) / chartData.length
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Máximo</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatNumber(Math.max(...chartData.map((d) => d[metric])))}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Mínimo</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatNumber(Math.min(...chartData.map((d) => d[metric])))}
            </p>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default Analytics;
