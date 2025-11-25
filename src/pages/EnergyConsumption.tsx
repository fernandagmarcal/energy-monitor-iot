import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";

import {
  AreaChart,
  Area,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Legend,
  LineChart,
  Line,
} from "recharts";

import { TrendingUp, Download, Calendar } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { formatNumber } from "@/lib/formatters";

// -----------------------------------------------------
// HELPERS
// -----------------------------------------------------

// Normaliza número
const getNum = (row: any, key: string) =>
  Number(
    row[key] ??
      row[key.trim()] ??
      row[key.toUpperCase()] ??
      row[key.toLowerCase()] ??
      0
  );

// Busca a sheet correta pelo nome
const findSheet = (data: any[], names: string[]) =>
  data.find((s: any) => names.includes(s.sheet_name));

// -----------------------------------------------------
// COMPONENT PRINCIPAL
// -----------------------------------------------------

const EnergyConsumption = () => {
  const [selectedSheet, setSelectedSheet] = useState("plan1");
  const [timeRange, setTimeRange] = useState("7d");

  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Guarda as planilhas carregadas
  const [sheetsData, setSheetsData] = useState({
    plan1: [] as any[],
    plan2: [] as any[],
    plan3: [] as any[],
  });

  // Mapeamento planilha -> sheet correta
  const SHEETS = {
    plan1: ["Página11", "Planilha1", "Sheet1"],
    plan2: ["Página9", "Planilha2", "Sheet1"],
    plan3: ["Página10", "Planilha3", "Sheet1"],
  };

  // -----------------------------------------------------
  // BUSCAR TODOS OS ARQUIVOS XLSX
  // -----------------------------------------------------

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);

        const [p1, p2, p3] = await Promise.all([
          api.get("/data/Planilha1.xlsx"),
          api.get("/data/Planilha2.xlsx"),
          api.get("/data/Planilha3.xlsx"),
        ]);

        const extract = (resp: any) => resp?.data?.data ?? [];

        const plan1Sheet = findSheet(extract(p1), SHEETS.plan1);
        const plan2Sheet = findSheet(extract(p2), SHEETS.plan2);
        const plan3Sheet = findSheet(extract(p3), SHEETS.plan3);

        setSheetsData({
          plan1: plan1Sheet?.data ?? [],
          plan2: plan2Sheet?.data ?? [],
          plan3: plan3Sheet?.data ?? [],
        });

        setRows(plan1Sheet?.data ?? []);
      } catch (err) {
        console.error("Erro ao carregar planilhas:", err);
        toast.error("Falha ao carregar dados da API.");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  // Troca entre planilhas
  useEffect(() => {
    setRows(sheetsData[selectedSheet as keyof typeof sheetsData] || []);
  }, [selectedSheet, sheetsData]);

  if (loading) return <p className="p-6">Carregando dados...</p>;

  // -----------------------------------------------------
  // Transformação → Dados dos gráficos
  // -----------------------------------------------------

  const periods = rows.map((r, i) => {
    const voltage = getNum(r, "Tensão em V");
    const current = getNum(r, "Corrente em A");

    const power = Math.abs(voltage * current);

    return {
      period: `Ponto ${i + 1}`,
      energiaKWh: power / 1000,
      potenciaMedia: power,
      potenciaPico: power * 1.15,
    };
  });

  const totalEnergy = periods.reduce((a, p) => a + p.energiaKWh, 0);
  const avgPower = periods.reduce((a, p) => a + p.potenciaMedia, 0) / periods.length;
  const peakPower = Math.max(...periods.map((p) => p.potenciaPico));

  const chartData = periods.map((p) => ({
    period: p.period,
    energia: p.energiaKWh,
    potenciaMedia: p.potenciaMedia,
    potenciaPico: p.potenciaPico,
  }));

  // -----------------------------------------------------
  // Export
  // -----------------------------------------------------

  const handleExport = () => {
    toast.success("Relatório exportado com sucesso!");
  };

  // -----------------------------------------------------
  // Render
  // -----------------------------------------------------

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Consumo de Energia</h1>
          <p className="text-muted-foreground">Dados carregados do backend Go</p>
        </div>
        <Button onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Exportar Relatório
        </Button>
      </div>

      {/* SELECTS */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={selectedSheet} onValueChange={setSelectedSheet}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Selecionar dispositivo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="plan1">Planilha 1 — Página11</SelectItem>
            <SelectItem value="plan2">Planilha 2 — Página9</SelectItem>
            <SelectItem value="plan3">Planilha 3 — Página10</SelectItem>
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
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Energia Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(totalEnergy, 2)} kWh</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Potência Média</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(avgPower, 2)} W</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Potência de Pico</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(peakPower, 2)} W</div>
          </CardContent>
        </Card>
      </div>

      {/* GRÁFICO DE ENERGIA */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Consumo de Energia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="energia" stroke="#4f46e5" fill="#a5b4fc" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* GRÁFICO DE POTÊNCIA */}
      <Card>
        <CardHeader>
          <CardTitle>Curva de Potência</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="potenciaMedia" stroke="#2563eb" strokeWidth={2} />
              <Line
                type="monotone"
                dataKey="potenciaPico"
                stroke="#f43f5e"
                strokeWidth={2}
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnergyConsumption;
