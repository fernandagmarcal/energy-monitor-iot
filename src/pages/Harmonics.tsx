import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Activity } from "lucide-react";
import { formatNumber } from "@/lib/formatters";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";

// ----------------------------------------------
// HELPERS
// ----------------------------------------------
const findSheet = (sheets: any[], names: string[]) =>
  sheets.find((s: any) => names.includes(s.sheet_name));

const num = (v: any) => Number(v ?? 0);

const calculateTHD = (rows: any[], key: string) => {
  if (rows.length === 0) return 0;

  const h1 = num(rows[0][key]);
  if (h1 === 0) return 0;

  const sumSq = rows
    .slice(1)
    .reduce((acc, r) => acc + Math.pow(num(r[key]), 2), 0);

  return Math.sqrt(sumSq) / h1 * 100;
};

// ----------------------------------------------
// COMPONENTE PRINCIPAL
// ----------------------------------------------
const Harmonics = () => {
  const [selectedDevice, setSelectedDevice] = useState("med-TRF-01");
  const [harmonicData, setHarmonicData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHarmonics = async () => {
    setLoading(true);
    try {
      let file = "";
      let sheetNames: string[] = [];

      // Seletor de planilha <-> dispositivo
      if (selectedDevice === "med-TRF-01") {
        file = "/data/Planilha1.xlsx";
        sheetNames = ["Página11", "Planilha1", "Sheet1"];
      } else if (selectedDevice === "med-TRF-02") {
        file = "/data/Planilha2.xlsx";
        sheetNames = ["Página9", "Planilha2", "Sheet1"];
      } else {
        file = "/data/Planilha3.xlsx";
        sheetNames = ["Página10", "Planilha3", "Sheet1"];
      }

      const res = await api.get(file);
      const sheets = res.data.data;

      const sheet = findSheet(sheets, sheetNames);

      if (!sheet) {
        console.error("Página da planilha não encontrada.");
        setHarmonicData([]);
        return;
      }

      // Transformação dos dados
      const parsed = sheet.data.map((row: any, idx: number) => ({
        harmonic: idx + 1,
        V_magnitude: num(row["Tensão em V"]),
        I_magnitude: num(row["Corrente em A"]),
      }));

      setHarmonicData(parsed);
    } catch (err) {
      console.error("Erro ao processar dados:", err);
      setHarmonicData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHarmonics();
  }, [selectedDevice]);

  if (loading) return <p>Carregando dados...</p>;

  // ----------------------------------------------
  // CALCULAR THD
  // ----------------------------------------------

  const thdV = calculateTHD(harmonicData, "V_magnitude");
  const thdI = calculateTHD(harmonicData, "I_magnitude");

  const getTHDStatus = (thd: number, type: "V" | "I") => {
    if (type === "V") {
      if (thd > 8) return { label: "Crítico" };
      if (thd > 5) return { label: "Alto" };
      return { label: "Normal" };
    }
    if (thd > 20) return { label: "Crítico" };
    if (thd > 10) return { label: "Alto" };
    return { label: "Normal" };
  };

  const thdVStatus = getTHDStatus(thdV, "V");
  const thdIStatus = getTHDStatus(thdI, "I");

  // ----------------------------------------------
  // UI
  // ----------------------------------------------

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Análise de Harmônicos</h1>
        <p className="text-muted-foreground">Distorção Harmônica Total (THD) baseada nos dados reais das planilhas</p>
      </div>

      {/* Seleção de dispositivo */}
      <Select value={selectedDevice} onValueChange={setSelectedDevice}>
        <SelectTrigger className="w-[240px]">
          <SelectValue placeholder="Selecione o medidor" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="med-TRF-01">Medidor TRF 01 — Planilha 1</SelectItem>
          <SelectItem value="med-TRF-02">Medidor TRF 02 — Planilha 2</SelectItem>
          <SelectItem value="med-TRF-03">Medidor TRF 03 — Planilha 3</SelectItem>
        </SelectContent>
      </Select>

      {/* Cards THD */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* THD V */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">THD — Tensão</CardTitle>
            <Activity className="h-4 w-4" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(thdV)}%</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge>{thdVStatus.label}</Badge>
              <p className="text-xs text-muted-foreground">Limite ideal: &lt; 5%</p>
            </div>
          </CardContent>
        </Card>

        {/* THD I */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">THD — Corrente</CardTitle>
            <Activity className="h-4 w-4" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(thdI)}%</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge>{thdIStatus.label}</Badge>
              <p className="text-xs text-muted-foreground">Limite ideal: &lt; 10%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Tensão */}
      <Card>
        <CardHeader>
          <CardTitle>Espectro Harmônico — Tensão</CardTitle>
        </CardHeader>

        <CardContent>
          <ResponsiveContainer width="100%" height={380}>
            <BarChart data={harmonicData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="harmonic" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="V_magnitude" fill="hsl(var(--chart-1))" name="Tensão (V)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Corrente */}
      <Card>
        <CardHeader>
          <CardTitle>Espectro Harmônico — Corrente</CardTitle>
        </CardHeader>

        <CardContent>
          <ResponsiveContainer width="100%" height={380}>
            <BarChart data={harmonicData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="harmonic" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="I_magnitude" fill="hsl(var(--chart-2))" name="Corrente (A)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default Harmonics;