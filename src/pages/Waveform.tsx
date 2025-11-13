import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockDevices, mockWaveformData } from "@/lib/mockData";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Activity, Zap } from "lucide-react";
import { formatDateTime } from "@/lib/formatters";

const Waveform = () => {
  const [selectedDevice, setSelectedDevice] = useState("med-TRF-01");
  const [waveformData, setWaveformData] = useState(mockWaveformData(selectedDevice));
  const [lastUpdate, setLastUpdate] = useState(new Date().toISOString());

  useEffect(() => {
    const interval = setInterval(() => {
      setWaveformData(mockWaveformData(selectedDevice));
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

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Select value={selectedDevice} onValueChange={setSelectedDevice}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Selecionar dispositivo" />
          </SelectTrigger>
          <SelectContent>
            {mockDevices.map((device) => (
              <SelectItem key={device.deviceId} value={device.deviceId}>
                {device.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Activity className="h-4 w-4 animate-pulse text-success" />
          <span>Última atualização: {formatDateTime(lastUpdate)}</span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Forma de Onda - Tensão e Corrente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Este gráfico mostra o alinhamento de fase entre tensão e corrente. 
            O deslocamento entre as ondas indica o fator de potência da instalação.
          </p>
          <ResponsiveContainer width="100%" height={500}>
            <LineChart data={waveformData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis 
                dataKey="point" 
                label={{ value: 'Pontos de Amostragem', position: 'insideBottom', offset: -5 }}
                tick={{ fontSize: 12 }} 
              />
              <YAxis 
                yAxisId="left"
                label={{ value: 'Tensão (V)', angle: -90, position: 'insideLeft' }}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                label={{ value: 'Corrente (A)', angle: 90, position: 'insideRight' }}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
                formatter={(value: number, name: string) => [
                  `${value.toFixed(2)} ${name === 'V' ? 'V' : 'A'}`,
                  name === 'V' ? 'Tensão' : 'Corrente'
                ]}
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
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Interpretação</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Ondas alinhadas = FP próximo de 1,0 (ideal)</li>
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
              <li>• Formato senoidal = Boa qualidade</li>
              <li>• Distorções = Presença de harmônicos</li>
              <li>• Picos/vales = Possíveis transitórios</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Ações Recomendadas</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Monitorar THD regularmente</li>
              <li>• Instalar correção de FP se necessário</li>
              <li>• Investigar distorções anormais</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Waveform;
