import { useEffect, useState } from "react";
import { FileText, Download, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import api from "@/lib/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { formatNumber } from "@/lib/formatters";

// -----------------------------
// Helpers
// -----------------------------

const extractRows = (resp: any) => {
  if (!resp?.data?.data) return [];
  const sheet = resp.data.data[0];
  return sheet?.data || [];
};

const num = (v: any) => Number(v ?? 0);

const calculateEnergy = (V: number, I: number) => Math.abs((V * I) / 1000);

// -----------------------------
// Component
// -----------------------------

const Reports = () => {
  const [reportType, setReportType] = useState("consumo");
  const [period, setPeriod] = useState("30d");
  const [selectedDevice, setSelectedDevice] = useState("all");

  const [plan1, setPlan1] = useState<any[]>([]);
  const [plan2, setPlan2] = useState<any[]>([]);
  const [plan3, setPlan3] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // -----------------------------
  // Fetch Data
  // -----------------------------

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const [p1, p2, p3] = await Promise.all([
          api.get("/data/Planilha1.xlsx"),
          api.get("/data/Planilha2.xlsx"),
          api.get("/data/Planilha3.xlsx"),
        ]);

        setPlan1(extractRows(p1));
        setPlan2(extractRows(p2));
        setPlan3(extractRows(p3));
      } catch (err) {
        console.error(err);
        toast.error("Erro ao carregar dados da API");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) return <p>Carregando dados…</p>;

  // -----------------------------
  // Processamento
  // -----------------------------

  const devices = [
    { id: "plan1", name: "Dispositivo — Planilha 1", rows: plan1 },
    { id: "plan2", name: "Dispositivo — Planilha 2", rows: plan2 },
    { id: "plan3", name: "Dispositivo — Planilha 3", rows: plan3 },
  ];

  const selectedDevices =
    selectedDevice === "all"
      ? devices
      : devices.filter((d) => d.id === selectedDevice);

  const reportRows = selectedDevices.flatMap((d) => d.rows);

  const chartData = reportRows.map((r, i) => {
    const V = num(r["Tensão em V"]);
    const I = num(r["Corrente em A"]);

    return {
      index: i + 1,
      energia: calculateEnergy(V, I),
      potenciaMedia: Math.abs(V * I),
      potenciaPico: Math.abs(V * I) * 1.15,
    };
  });

  const totalEnergy = chartData.reduce((a, b) => a + b.energia, 0);
  const avgPower = chartData.reduce((a, b) => a + b.potenciaMedia, 0) / chartData.length;
  const peakPower = Math.max(...chartData.map((p) => p.potenciaPico));

  // Ranking por consumo
  const ranking = devices.map((d) => {
    const energy = d.rows.reduce((a, r) => {
      const V = num(r["Tensão em V"]);
      const I = num(r["Corrente em A"]);
      return a + calculateEnergy(V, I);
    }, 0);

    return {
      name: d.name,
      value: energy,
      fp: 0.92, // pode calcular baseado em fórmula futuramente
    };
  });

  // -----------------------------
  // Actions
  // -----------------------------

  const handleExportPDF = () => toast.success("Exportando PDF…");
  const handleExportCSV = () => toast.success("Exportando CSV…");
  const handleGenerateReport = () => toast.success("Relatório gerado!");

  // -----------------------------
  // Render
  // -----------------------------

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-muted-foreground">Com base em dados reais da API</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" /> CSV
          </Button>
          <Button onClick={handleExportPDF}>
            <FileText className="mr-2 h-4 w-4" /> PDF
          </Button>
        </div>
      </div>

      {/* Configuração */}
      <Card>
        <CardHeader>
          <CardTitle>Configuração do Relatório</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">

            {/* Tipo */}
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="consumo">Consumo</SelectItem>
                  <SelectItem value="qualidade">Qualidade</SelectItem>
                  <SelectItem value="eventos">Eventos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Período */}
            <div className="space-y-2">
              <Label>Período</Label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7 dias</SelectItem>
                  <SelectItem value="30d">30 dias</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Dispositivo */}
            <div className="space-y-2">
              <Label>Dispositivo</Label>
              <Select value={selectedDevice} onValueChange={setSelectedDevice}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="plan1">Planilha 1</SelectItem>
                  <SelectItem value="plan2">Planilha 2</SelectItem>
                  <SelectItem value="plan3">Planilha 3</SelectItem>
                </SelectContent>
              </Select>
            </div>

          </div>

          <Button className="w-full" onClick={handleGenerateReport}>
            <Filter className="mr-2 h-4 w-4" /> Gerar Relatório
          </Button>
        </CardContent>
      </Card>

      {/* Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Consumo Total</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatNumber(totalEnergy, 2)} kWh</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Potência Média</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatNumber(avgPower, 2)} W</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Potência de Pico</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatNumber(peakPower, 2)} W</p>
          </CardContent>
        </Card>
      </div>

      {/* Ranking */}
      <Card>
        <CardHeader><CardTitle>Ranking de Consumo</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ranking}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="hsl(var(--chart-1))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

    </div>
  );
};

export default Reports;
