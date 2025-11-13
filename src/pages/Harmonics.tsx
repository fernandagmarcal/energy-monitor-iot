import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockDevices, mockHarmonicData } from "@/lib/mockData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Activity, AlertTriangle } from "lucide-react";
import { formatNumber } from "@/lib/formatters";
import { Badge } from "@/components/ui/badge";

const Harmonics = () => {
  const [selectedDevice, setSelectedDevice] = useState("med-TRF-01");
  const harmonicData = mockHarmonicData();

  const thdV = 3.8;
  const thdI = 5.2;

  const getTHDStatus = (thd: number, type: 'V' | 'I') => {
    if (type === 'V') {
      if (thd > 8) return { status: 'critical', label: 'Crítico' };
      if (thd > 5) return { status: 'warning', label: 'Alto' };
      return { status: 'normal', label: 'Normal' };
    } else {
      if (thd > 20) return { status: 'critical', label: 'Crítico' };
      if (thd > 10) return { status: 'warning', label: 'Alto' };
      return { status: 'normal', label: 'Normal' };
    }
  };

  const thdVStatus = getTHDStatus(thdV, 'V');
  const thdIStatus = getTHDStatus(thdI, 'I');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Análise de Harmônicos</h1>
        <p className="text-muted-foreground">
          Distorção Harmônica Total (THD) e contribuições individuais
        </p>
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
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className={thdVStatus.status === 'critical' ? 'border-critical' : thdVStatus.status === 'warning' ? 'border-warning' : ''}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">THD - Tensão</CardTitle>
            <Activity className={`h-4 w-4 ${
              thdVStatus.status === 'critical' ? 'text-critical' : 
              thdVStatus.status === 'warning' ? 'text-warning' : 'text-success'
            }`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(thdV)}%</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={thdVStatus.status === 'normal' ? 'default' : 'destructive'}>
                {thdVStatus.label}
              </Badge>
              <p className="text-xs text-muted-foreground">
                Limite recomendado: {'<'} 5%
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className={thdIStatus.status === 'critical' ? 'border-critical' : thdIStatus.status === 'warning' ? 'border-warning' : ''}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">THD - Corrente</CardTitle>
            <Activity className={`h-4 w-4 ${
              thdIStatus.status === 'critical' ? 'text-critical' : 
              thdIStatus.status === 'warning' ? 'text-warning' : 'text-success'
            }`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(thdI)}%</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={thdIStatus.status === 'normal' ? 'default' : 'destructive'}>
                {thdIStatus.label}
              </Badge>
              <p className="text-xs text-muted-foreground">
                Limite recomendado: {'<'} 10%
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Espectro de Harmônicos - Tensão</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={harmonicData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis 
                dataKey="harmonic" 
                label={{ value: 'Ordem do Harmônico', position: 'insideBottom', offset: -5 }}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                label={{ value: 'Magnitude (%)', angle: -90, position: 'insideLeft' }}
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
              <Bar dataKey="V_magnitude" fill="hsl(var(--chart-1))" name="Tensão (%)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Espectro de Harmônicos - Corrente</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={harmonicData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis 
                dataKey="harmonic" 
                label={{ value: 'Ordem do Harmônico', position: 'insideBottom', offset: -5 }}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                label={{ value: 'Magnitude (%)', angle: -90, position: 'insideLeft' }}
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
              <Bar dataKey="I_magnitude" fill="hsl(var(--chart-2))" name="Corrente (%)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Informações Importantes sobre Harmônicos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-semibold mb-2">Causas Comuns:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Equipamentos eletrônicos com fontes chaveadas</li>
                <li>• Inversores de frequência e drives</li>
                <li>• Lâmpadas LED e fluorescentes</li>
                <li>• Retificadores e carregadores</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Consequências:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Aquecimento de transformadores e cabos</li>
                <li>• Operação incorreta de equipamentos sensíveis</li>
                <li>• Redução da vida útil de equipamentos</li>
                <li>• Possível atuação de proteções</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Soluções Recomendadas:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Instalação de filtros harmônicos passivos ou ativos</li>
              <li>• Balanceamento adequado de cargas</li>
              <li>• Uso de equipamentos com baixa emissão de harmônicos</li>
              <li>• Dimensionamento correto de condutores neutros</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Harmonics;
