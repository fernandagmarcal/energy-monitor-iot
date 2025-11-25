import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { Activity, Zap } from "lucide-react";
import api from "@/lib/api";
import { formatDateTime } from "@/lib/formatters";

// ------------------------------------------------------------
// HELPERS
// ------------------------------------------------------------

const extractRows = (resp: any) => {
  if (!resp?.data?.data) return [];
  const sheet = resp.data.data[0];
  return sheet?.data || [];
};

const num = (v: any) => Number(v ?? 0);

// Gera onda senoidal realista usando tensão e corrente reais
const generateWaveform = (voltage: number, current: number) => {
  const points = [];

  for (let i = 0; i < 180; i++) {
    const angle = (i * Math.PI) / 180;

    points.push({
      point: i,
      V: voltage * Math.sin(angle),
      I: current * Math.sin(angle - Math.PI / 6), // atraso de fase clássico (FP < 1)
    });
  }

  return points;
};

// ------------------------------------------------------------
// COMPONENTE PRINCIPAL
// ------------------------------------------------------------

const Waveform = () => {
  const [selectedDevice, setSelectedDevice] = useState("med-TRF-01");

  const [waveformData, setWaveformData] = useState<any[]>([]);
  const [lastUpdate, setLastUpdate] = useState(new Date().toISOString());
  const [loading, setLoading] = useState(true);

  // ------------------------------------------------------------
  // BUSCA DA PLANILHA DO DISPOSITIVO
  // ------------------------------------------------------------

  const fetchWave = async () => {
    try {
      setLoading(true);

      let file = "/data/Planilha1.xlsx";

      if (selectedDevice === "med-TRF-02") file = "/data/Planilha2.xlsx";
      if (selectedDevice === "med-TRF-03") file = "/data/Planilha3.xlsx";

      const response = await api.get(file);

      const rows = extractRows(response);

      if (rows.length === 0) {
        setWaveformData([]);
        return;
      }

      // Pega os valores reais da primeira linha (aproximação)
      const V = num(rows[0]["Tensão em V"]);
      const I = num(rows[0]["Corrente em A"]);

      const generated = generateWaveform(V, I);

      setWaveformData(generated);
      setLastUpdate(new Date().toISOString());
    } catch (err) {
      console.error("Erro ao carregar waveform:", err);
      setWaveformData([]);
    } finally {
      setLoading(false);
    }
  };

  // Atualiza sempre que trocar o dispositivo
  useEffect(() => {
    fetchWave();
  }, [selectedDevice]);

  // Atualiza a cada 5s
  useEffect(() => {
    const interval = setInterval(fetchWave, 5000);
    return () => clearInterval(interval);
  }, [selectedDevice]);

  // ------------------------------------------------------------
  // UI
  // ------------------------------------------------------------

  if (loading)
    return <p className="p-6 text-muted-foreground">Carregando forma de onda...</p>;

  if (!waveformData.length)
    return <p className="p-6 text-red-500">Não foi possível carregar os dados.</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Análise de Forma de Onda</h1>
        <p className="text-muted-foreground">
          Visualização baseada nos valores reais das planilhas
        </p>
      </div>

      {/* SELECT + STATUS */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Select value={selectedDevice} onValueChange={setSelectedDevice}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Selecionar dispositivo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="med-TRF-01">Medidor TRF 01 — Planilha 1</SelectItem>
            <SelectItem value="med-TRF-02">Medidor TRF 02 — Planilha 2</SelectItem>
            <SelectItem value="med-TRF-03">Medidor TRF 03 — Planilha 3</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Activity className="h-4 w-4 animate-pulse text-success" />
          <span>Última atualização: {formatDateTime(lastUpdate)}</span>
        </div>
      </div>

      {/* GRÁFICO */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Forma de Onda — Tensão e Corrente
          </CardTitle>
        </CardHeader>

        <CardContent>
          <ResponsiveContainer width="100%" height={420}>
            <LineChart data={waveformData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />

              <XAxis dataKey="point" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />

              <Tooltip />
              <Legend />

              {/* Tensão */}
              <Line
                type="monotone"
                dataKey="V"
                stroke="hsl(var(--chart-1))"
                name="Tensão (V)"
                strokeWidth={2}
                dot={false}
              />

              {/* Corrente */}
              <Line
                type="monotone"
                dataKey="I"
                stroke="hsl(var(--chart-2))"
                name="Corrente (A)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default Waveform;
