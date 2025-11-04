import { Activity, Zap, Gauge, AlertTriangle, Radio as RadioIcon } from "lucide-react";
import { MetricCard } from "@/components/MetricCard";
import { RealTimeChart } from "@/components/RealTimeChart";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockDevices, mockEvents } from "@/lib/mockData";
import { formatDateTime } from "@/lib/formatters";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const onlineDevices = mockDevices.filter(d => d.status === "online").length;
  const activeAlarms = mockEvents.filter(e => e.status === "ativo").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Visão Geral</h1>
        <p className="text-muted-foreground">
          Monitoramento em tempo real da qualidade de energia
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Potência Total"
          value={24.8}
          unit="kW"
          icon={Zap}
          trend={{ value: 5.2, isPositive: true }}
          status="normal"
        />
        <MetricCard
          title="Fator de Potência"
          value={0.94}
          icon={Gauge}
          status="normal"
        />
        <MetricCard
          title="THD Médio"
          value={3.8}
          unit="%"
          icon={Activity}
          status="normal"
        />
        <MetricCard
          title="Alarmes Ativos"
          value={activeAlarms}
          icon={AlertTriangle}
          status={activeAlarms > 0 ? "warning" : "normal"}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <RealTimeChart deviceId="med-TRF-01" />

        <Card>
          <CardHeader>
            <CardTitle>Status dos Dispositivos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockDevices.slice(0, 5).map((device) => (
                <div
                  key={device.deviceId}
                  className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => navigate(`/dispositivos/${device.deviceId}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                      device.status === "online" ? "bg-success/10" : "bg-offline/10"
                    }`}>
                      <RadioIcon className={`h-5 w-5 ${
                        device.status === "online" ? "text-success" : "text-offline"
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{device.name}</p>
                      <p className="text-xs text-muted-foreground">{device.location}</p>
                    </div>
                  </div>
                  <StatusBadge severity={device.status}>
                    {device.status === "online" ? "Online" : "Offline"}
                  </StatusBadge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Últimos Alarmes (24h)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Horário</TableHead>
                <TableHead>Dispositivo</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Severidade</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockEvents.map((event) => {
                const device = mockDevices.find(d => d.deviceId === event.deviceId);
                return (
                  <TableRow 
                    key={event.id}
                    className="cursor-pointer hover:bg-accent"
                    onClick={() => navigate('/alarmes')}
                  >
                    <TableCell className="font-mono text-sm">
                      {formatDateTime(event.tsStart)}
                    </TableCell>
                    <TableCell>{device?.name}</TableCell>
                    <TableCell>{event.type}</TableCell>
                    <TableCell>
                      <StatusBadge severity={event.severity}>
                        {event.severity}
                      </StatusBadge>
                    </TableCell>
                    <TableCell>
                      <span className={`text-sm ${
                        event.status === "ativo" ? "text-critical" : 
                        event.status === "confirmado" ? "text-warning" : "text-muted-foreground"
                      }`}>
                        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
