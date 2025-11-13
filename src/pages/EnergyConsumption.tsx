import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { mockDevices, mockEnergyConsumption } from "@/lib/mockData";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from "recharts";
import { TrendingUp, Download, Calendar } from "lucide-react";
import { formatNumber } from "@/lib/formatters";
import { toast } from "sonner";

const EnergyConsumption = () => {
  const [selectedDevice, setSelectedDevice] = useState("med-TRF-01");
  const [timeRange, setTimeRange] = useState("7d");

  const periods = mockEnergyConsumption(timeRange);

  const totalEnergy = periods.reduce((acc, p) => acc + p.energyKWh, 0);
  const avgPower = periods.reduce((acc, p) => acc + p.avgPower, 0) / periods.length;
  const peakPower = Math.max(...periods.map(p => p.maxPower));

  const handleExport = () => {
    toast.success("Relatório de consumo exportado com sucesso!");
  };

  const chartData = periods.map((p, idx) => ({
    period: timeRange === "24h" ? `${idx}h` : 
            timeRange === "7d" ? `Dia ${idx + 1}` : 
            timeRange === "30d" ? `Dia ${idx + 1}` : `Mês ${idx + 1}`,
    energia: p.energyKWh,
    potenciaMedia: p.avgPower,
    potenciaPico: p.maxPower,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Consumo de Energia</h1>
          <p className="text-muted-foreground">
            Análise histórica de consumo e demanda
          </p>
        </div>
        <Button onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Exportar Relatório
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

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Energia Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(totalEnergy, 1)} kWh</div>
            <p className="text-xs text-muted-foreground mt-1">
              No período selecionado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Potência Média</CardTitle>
            <TrendingUp className="h-4 w-4 text-chart-1" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(avgPower, 1)} kW</div>
            <p className="text-xs text-muted-foreground mt-1">
              Demanda média do período
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Potência de Pico</CardTitle>
            <TrendingUp className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(peakPower, 1)} kW</div>
            <p className="text-xs text-muted-foreground mt-1">
              Demanda máxima registrada
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Consumo de Energia ao Longo do Tempo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorEnergia" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis 
                dataKey="period" 
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                label={{ value: 'Energia (kWh)', angle: -90, position: 'insideLeft' }}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="energia"
                stroke="hsl(var(--chart-1))"
                fillOpacity={1}
                fill="url(#colorEnergia)"
                name="Energia (kWh)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Curva de Demanda - Potência</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis 
                dataKey="period" 
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                label={{ value: 'Potência (kW)', angle: -90, position: 'insideLeft' }}
                tick={{ fontSize: 12 }}
              />
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
                dataKey="potenciaMedia"
                stroke="hsl(var(--chart-2))"
                name="Potência Média (kW)"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="potenciaPico"
                stroke="hsl(var(--chart-3))"
                name="Potência Pico (kW)"
                strokeWidth={2}
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Estimativa de Custos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Tarifa média:</span>
                <span className="font-medium">R$ 0,85/kWh</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Custo estimado:</span>
                <span className="font-bold text-lg">R$ {formatNumber(totalEnergy * 0.85, 2)}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                * Valores estimados baseados em tarifa média. Consulte sua concessionária para valores exatos.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Indicadores de Eficiência</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Fator de carga:</span>
                <span className="font-medium">{formatNumber((avgPower / peakPower) * 100, 1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Consumo médio diário:</span>
                <span className="font-medium">
                  {formatNumber(totalEnergy / (timeRange === "24h" ? 1 : timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 365), 1)} kWh/dia
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Fator de carga alto indica uso mais eficiente da energia.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EnergyConsumption;
