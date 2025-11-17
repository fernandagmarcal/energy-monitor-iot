import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Activity, AlertTriangle } from "lucide-react";
import { formatNumber } from "@/lib/formatters";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";

const Harmonics = () => {
  const [selectedDevice, setSelectedDevice] = useState("med-TRF-01");
  const [harmonicData, setHarmonicData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHarmonics = async () => {
    setLoading(true);
    try {
      // Agora busca JSON, não XLSX
      const res = await api.get("/data/Planilha2.xlsx");

      const sheet = res.data.data[0].data; // acessa o array com os dados

      const parsed = sheet.map((r: any) => ({
        harmonic: Number(r.Ordem || r.harmonic || r.H || 0),
        V_magnitude: Number(r.V_magnitude || r.V || 0),
        I_magnitude: Number(r.I_magnitude || r.I || 0),
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

  // --- Valores temporários só para UI ---
  const thdV = 3.8;
  const thdI = 5.2;

  const getTHDStatus = (thd: number, type: "V" | "I") => {
    if (type === "V") {
      if (thd > 8) return { status: "critical", label: "Crítico" };
      if (thd > 5) return { status: "warning", label: "Alto" };
      return { status: "normal", label: "Normal" };
    } else {
      if (thd > 20) return { status: "critical", label: "Crítico" };
      if (thd > 10) return { status: "warning", label: "Alto" };
      return { status: "normal", label: "Normal" };
    }
  };

  const thdVStatus = getTHDStatus(thdV, "V");
  const thdIStatus = getTHDStatus(thdI, "I");

  if (loading) return <p>Carregando dados...</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Análise de Harmônicos</h1>
        <p className="text-muted-foreground">Distorção Harmônica Total (THD)</p>
      </div>

      <Select value={selectedDevice} onValueChange={setSelectedDevice}>
        <SelectTrigger className="w-[250px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="med-TRF-01">Medidor TRF 01</SelectItem>
          <SelectItem value="med-TRF-02">Medidor TRF 02</SelectItem>
          <SelectItem value="med-TRF-03">Medidor TRF 03</SelectItem>
        </SelectContent>
      </Select>

      {/* Cards de THD */}
      <div className="grid gap-4 md:grid-cols-2">
        
        {/* THD Tensao */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">THD - Tensão</CardTitle>
            <Activity className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(thdV)}%</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge>{thdVStatus.label}</Badge>
              <p className="text-xs text-muted-foreground">{`< 5%`}</p>
            </div>
          </CardContent>
        </Card>

        {/* THD Corrente */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">THD - Corrente</CardTitle>
            <Activity className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(thdI)}%</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge>{thdIStatus.label}</Badge>
              <p className="text-xs text-muted-foreground">{`< 10%`}</p>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Gráfico de tensão */}
      <Card>
        <CardHeader>
          <CardTitle>Espectro de Harmônicos - Tensão</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={harmonicData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="harmonic" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="V_magnitude" fill="hsl(var(--chart-1))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de corrente */}
      <Card>
        <CardHeader>
          <CardTitle>Espectro de Harmônicos - Corrente</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={harmonicData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="harmonic" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="I_magnitude" fill="hsl(var(--chart-2))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

    </div>
  );
};

export default Harmonics;
