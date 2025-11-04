import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { mockDevices, mockHistoricalData } from "@/lib/mockData";
import { formatNumber } from "@/lib/formatters";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Download, TrendingUp } from "lucide-react";
import { toast } from "sonner";

const Analytics = () => {
  const [selectedDevice, setSelectedDevice] = useState("med-TRF-01");
  const [timeRange, setTimeRange] = useState("24h");
  const [metric, setMetric] = useState("P");

  const historicalData = mockHistoricalData(selectedDevice, 24);

  const chartData = historicalData.map((d, idx) => ({
    time: idx,
    P: d.P,
    Q: d.Q,
    S: d.S,
    FP: d.FP,
    THD_V: d.THD.V,
    THD_I: d.THD.I,
    freq: d.freq,
  }));

  const handleExport = () => {
    toast.success("Análise exportada com sucesso!");
  };

  const metricInfo = {
    P: { label: "Potência Ativa (kW)", color: "hsl(var(--chart-1))" },
    Q: { label: "Potência Reativa (kvar)", color: "hsl(var(--chart-2))" },
    FP: { label: "Fator de Potência", color: "hsl(var(--chart-3))" },
    THD_V: { label: "THD Tensão (%)", color: "hsl(var(--chart-4))" },
    freq: { label: "Frequência (Hz)", color: "hsl(var(--chart-5))" },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Análises</h1>
          <p className="text-muted-foreground">
            Tendências e correlações de qualidade de energia
          </p>
        </div>
        <Button onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
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

        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1h">Última hora</SelectItem>
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
            <SelectItem value="P">Potência Ativa</SelectItem>
            <SelectItem value="Q">Potência Reativa</SelectItem>
            <SelectItem value="FP">Fator de Potência</SelectItem>
            <SelectItem value="THD_V">THD Tensão</SelectItem>
            <SelectItem value="freq">Frequência</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {metricInfo[metric as keyof typeof metricInfo].label}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="time" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey={metric}
                stroke={metricInfo[metric as keyof typeof metricInfo].color}
                name={metricInfo[metric as keyof typeof metricInfo].label}
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
            <CardTitle className="text-sm font-medium">Média</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatNumber(
                chartData.reduce((acc, d) => acc + d[metric as keyof typeof d], 0) /
                  chartData.length
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Máximo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatNumber(
                Math.max(...chartData.map((d) => d[metric as keyof typeof d] as number))
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Mínimo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatNumber(
                Math.min(...chartData.map((d) => d[metric as keyof typeof d] as number))
              )}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
