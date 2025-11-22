import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import api from "@/lib/api";

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
import { formatDateTime } from "@/lib/formatters";

type WavePoint = {
  point: number;
  V: number;
  I: number;
};

const Waveform = () => {
  const [selectedDevice, setSelectedDevice] = useState("med-TRF-01");
  const [waveformData, setWaveformData] = useState<WavePoint[]>([]);
  const [lastUpdate, setLastUpdate] = useState(new Date().toISOString());
  const [error, setError] = useState<string | null>(null);
  const [devices, setDevices] = useState<{ deviceId: string; name: string }[]>(
    []
  );

  // Carrega lista de dispositivos
  useEffect(() => {
    const loadDevices = async () => {
      try {
        const res = await api.get("/devices");
        if (Array.isArray(res.data)) {
          setDevices(res.data);
        }
      } catch {
        console.warn("Falha ao carregar lista de dispositivos");
      }
    };

    loadDevices();
  }, []);

  // Busca waveform de um dispositivo
  const fetchWaveform = async (deviceId: string) => {
    try {
      const response = await api.get(`/waveform?device=${deviceId}`);

      if (!response.data || !Array.isArray(response.data)) {
        throw new Error("Formato inesperado da API");
      }

      const formatted: WavePoint[] = response.data.map((row: any, index: number) => ({
        point: Number(row.point ?? row.ponto ?? index),
        V: Number(row.V ?? row.voltage ?? 0),
        I: Number(row.I ?? row.current ?? 0),
      }));

      setWaveformData(formatted);
      setError(null);
    } catch (err) {
      console.error("Erro ao carregar waveform:", err);
      setError("Não foi possível carregar a forma de onda.");
    }
  };

  // Atualiza ao trocar o dispositivo + loop de atualização
  useEffect(() => {
    fetchWaveform(selectedDevice);

    const interval = setInterval(() => {
      fetchWaveform(selectedDevice);
      setLastUpdate(new Date().toISOString());
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedDevice]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Análise de Forma de Onda</h1>
        <p className="text-muted-foreground">
          Visualização em tempo real da qualidade instantânea da energia
        </p>
      </div>

      {/* SELECT + STATUS */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Select value={selectedDevice} onValueChange={setSelectedDevice}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Selecionar dispositivo" />
          </SelectTrigger>
          <SelectContent>
            {devices.map((device) => (
              <SelectItem key={device.deviceId} value={device.deviceId}>
                {device.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Activity className="h-4 w-4 animate-pulse text-green-500" />
          <span>Última atualização: {formatDateTime(lastUpdate)}</span>
        </div>
      </div>

      {/* GRÁFICO */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Forma de Onda - Tensão e Corrente
          </CardTitle>
        </CardHeader>

        <CardContent>
          {error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                Este gráfico mostra o alinhamento de fase entre tensão e corrente.
              </p>

              <ResponsiveContainer width="100%" height={500}>
                <LineChart data={waveformData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />

                  <XAxis
                    dataKey="point"
                    tick={{ fontSize: 12 }}
                    label={{
                      value: "Pontos de Amostragem",
                      position: "insideBottom",
                      offset: -5,
                    }}
                  />

                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 12 }}
                    label={{
                      value: "Tensão (V)",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />

                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 12 }}
                    label={{
                      value: "Corrente (A)",
                      angle: 90,
                      position: "insideRight",
                    }}
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                    formatter={(v, name) => [`${Number(v).toFixed(2)}`, name]}
                  />

                  <Legend />

                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="V"
                    stroke="hsl(var(--chart-1))"
                    name="Tensão (V)"
                    strokeWidth={2}
                    dot={false}
                  />

                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="I"
                    stroke="hsl(var(--chart-2))"
                    name="Corrente (A)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </>
          )}
        </CardContent>
      </Card>

      {/* CARDS INFORMATIVOS */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Interpretação</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Ondas alinhadas = FP próximo de 1,0</li>
              <li>• Corrente adiantada = Carga capacitiva</li>
              <li>• Corrente atrasada = Carga indutiva</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Qualidade da Onda</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Forma senoidal = Boa qualidade</li>
              <li>• Distorções = Harmônicos</li>
              <li>• Picos/vales = Transitórios</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Ações Recomendadas</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Monitorar THD</li>
              <li>• Correção de FP se necessário</li>
              <li>• Investigar distorções anormais</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Waveform;