import { useState } from "react";
import { FileText, Download, Calendar, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockDevices } from "@/lib/mockData";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const Reports = () => {
  const [reportType, setReportType] = useState("consumo");
  const [period, setPeriod] = useState("30d");
  const [selectedDevice, setSelectedDevice] = useState("all");

  const rankingData = [
    { name: "Med TRF 01", value: 847, fp: 0.89 },
    { name: "Med TRF 02", value: 623, fp: 0.91 },
    { name: "QD Produção", value: 1204, fp: 0.87 },
    { name: "QD Admin", value: 342, fp: 0.94 },
    { name: "CCM Principal", value: 1856, fp: 0.85 },
  ];

  const handleGenerateReport = () => {
    toast.success("Relatório gerado com sucesso!");
  };

  const handleExportPDF = () => {
    toast.success("Exportando relatório em PDF...");
  };

  const handleExportCSV = () => {
    toast.success("Exportando relatório em CSV...");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-muted-foreground">
            Geração de relatórios de consumo e qualidade de energia
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" />
            CSV
          </Button>
          <Button onClick={handleExportPDF}>
            <FileText className="mr-2 h-4 w-4" />
            PDF
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuração do Relatório</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="reportType">Tipo de Relatório</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger id="reportType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consumo">Consumo de Energia</SelectItem>
                  <SelectItem value="qualidade">Qualidade de Energia</SelectItem>
                  <SelectItem value="eventos">Eventos e Alarmes</SelectItem>
                  <SelectItem value="conformidade">Conformidade</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="period">Período</Label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger id="period">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Últimos 7 dias</SelectItem>
                  <SelectItem value="30d">Últimos 30 dias</SelectItem>
                  <SelectItem value="90d">Últimos 90 dias</SelectItem>
                  <SelectItem value="custom">Período personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="device">Dispositivo</Label>
              <Select value={selectedDevice} onValueChange={setSelectedDevice}>
                <SelectTrigger id="device">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os dispositivos</SelectItem>
                  {mockDevices.map((device) => (
                    <SelectItem key={device.deviceId} value={device.deviceId}>
                      {device.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleGenerateReport} className="w-full">
            <Filter className="mr-2 h-4 w-4" />
            Gerar Relatório
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Consumo Total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">4.872 kWh</p>
            <p className="text-xs text-muted-foreground mt-1">Período selecionado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">FP Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0,89</p>
            <p className="text-xs text-critical mt-1">Abaixo do ideal (0,92)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total de Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">23</p>
            <p className="text-xs text-muted-foreground mt-1">5 críticos, 18 médios</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ranking de Pontos por Consumo</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={rankingData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
              />
              <Legend />
              <Bar dataKey="value" fill="hsl(var(--chart-1))" name="Consumo (kWh)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Conformidade com Padrões</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rankingData.map((device) => (
              <div key={device.name} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-sm">{device.name}</p>
                  <div className="mt-2 h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        device.fp >= 0.92 ? "bg-success" : device.fp >= 0.85 ? "bg-warning" : "bg-critical"
                      }`}
                      style={{ width: `${(device.fp / 1.0) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="ml-4 text-right">
                  <p className="text-sm font-mono">{device.fp.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">FP</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
