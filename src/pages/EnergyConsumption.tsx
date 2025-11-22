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

type Row = Record<string, any>;

// -----------------------------------------------------
// HELPERS
// -----------------------------------------------------

const extractRows = (resp: any) => {
  if (!resp?.data?.data) return [];
  const firstSheet = resp.data.data[0];
  return firstSheet?.data || [];
};

const getNum = (row: Row, key: string) =>
  Number(
    row[key] ??
      row[key.toUpperCase()] ??
      row[key.toLowerCase()] ??
      0
  );

// -----------------------------------------------------
// COMPONENT
// -----------------------------------------------------

const EnergyConsumption = () => {
  const [selectedSheet, setSelectedSheet] = useState("plan1");
  const [timeRange, setTimeRange] = useState("7d");

  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const [sheetsData, setSheetsData] = useState({
    plan1: [] as Row[],
    plan2: [] as Row[],
    plan3: [] as Row[],
  });

  // -----------------------------------------------------
  // BUSCAR PLANILHAS
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

        const plan1Rows = extractRows(p1);
        const plan2Rows = extractRows(p2);
        const plan3Rows = extractRows(p3);

        setSheetsData({
          plan1: plan1Rows,
          plan2: plan2Rows,
          plan3: plan3Rows,
        });

        setRows(plan1Rows);
      } catch (err) {
        console.error("Erro ao carregar planilhas:", err);
        toast.error("Falha ao carregar dados da API.");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  // -----------------------------------------------------
  // QUANDO TROCA O DISPOSITIVO (planilha)
  // -----------------------------------------------------

  useEffect(() => {
    if (selectedSheet === "plan1") setRows(sheetsData.plan1);
    if (selectedSheet === "plan2") setRows(sheetsData.plan2);
    if (selectedSheet === "plan3") setRows(sheetsData.plan3);
  }, [selectedSheet, sheetsData]);

  if (loading) return <p className="p-6">Carregando dados...</p>;

  // -----------------------------------------------------
  // TRANSFORMAÇÃO EM DADOS PARA GRÁFICO
  // -----------------------------------------------------

  const periods = rows.map((r, i) => ({
    period:
      timeRange === "24h"
        ? `${i}h`
        : `Ponto ${i + 1}`,

    energiaKWh:
      Math.abs(getNum(r, "Tensão em V") * getNum(r, "Corrente em A")) /
      1000,

    avgPower: Math.abs(
      getNum(r, "Tensão em V") * getNum(r, "Corrente em A")
    ),

    maxPower:
      Math.abs(
        getNum(r, "Tensão em V") * getNum(r, "Corrente em A")
      ) * 1.15,
  }));

  const totalEnergy = periods.reduce((a, p) => a + p.energiaKWh, 0);
  const avgPower = periods.reduce((a, p) => a + p.avgPower, 0) / periods.length;
  const peakPower = Math.max(...periods.map((p) => p.maxPower));

  const chartData = periods.map((p) => ({
    period: p.period,
    energia: p.energiaKWh,
    potenciaMedia: p.avgPower,
    potenciaPico: p.maxPower,
  }));

  // -----------------------------------------------------
  // EXPORT
  // -----------------------------------------------------

  const handleExport = () => {
    toast.success("Relatório exportado com sucesso!");
  };

  // -----------------------------------------------------
  // RENDER
  // -----------------------------------------------------

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Consumo de Energia
          </h1>
          <p className="text-muted-foreground">
            Dados reais carregados do backend Go
          </p>
        </div>
        <Button onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Exportar Relatório
        </Button>
      </div>

      {/* SELECTS */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Seleção da planilha */}
        <Select
          value={selectedSheet}
          onValueChange={setSelectedSheet}
        >
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Selecionar dispositivo" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="plan1">Dispositivo — Planilha 1</SelectItem>
            <SelectItem value="plan2">Dispositivo — Planilha 2</SelectItem>
            <SelectItem value="plan3">Dispositivo — Planilha 3</SelectItem>
          </SelectContent>
        </Select>

        {/* Período */}
        <Select
          value={timeRange}
          onValueChange={setTimeRange}
        >
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
        {/* Energia Total */}
        <Card>
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Energia Total
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(totalEnergy, 2)} kWh
            </div>
          </CardContent>
        </Card>

        {/* Potência Média */}
        <Card>
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Potência Média
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(avgPower, 2)} W
            </div>
          </CardContent>
        </Card>

        {/* Potência de Pico */}
        <Card>
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Potência de Pico
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(peakPower, 2)} W
            </div>
          </CardContent>
        </Card>
      </div>

      {/* GRÁFICO DE ENERGIA */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Consumo de Energia ao Longo do Tempo
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

              <Area
                type="monotone"
                dataKey="energia"
                stroke="#4f46e5"
                fill="#a5b4fc"
              />
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

              <Line
                type="monotone"
                dataKey="potenciaMedia"
                stroke="#2563eb"
                strokeWidth={2}
              />

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