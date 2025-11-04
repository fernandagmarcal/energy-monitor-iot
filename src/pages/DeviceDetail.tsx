import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Activity, Zap, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MetricCard } from "@/components/MetricCard";
import { RealTimeChart } from "@/components/RealTimeChart";
import { StatusBadge } from "@/components/StatusBadge";
import { mockDevices, mockEvents, generateTelemetry } from "@/lib/mockData";
import { formatDateTime, formatNumber } from "@/lib/formatters";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const DeviceDetail = () => {
  const { deviceId } = useParams();
  const navigate = useNavigate();
  const device = mockDevices.find((d) => d.deviceId === deviceId);
  
  if (!device) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Dispositivo não encontrado</h2>
          <Button onClick={() => navigate("/dispositivos")}>
            Voltar para Dispositivos
          </Button>
        </div>
      </div>
    );
  }

  const telemetry = generateTelemetry(deviceId || "");
  const deviceEvents = mockEvents.filter((e) => e.deviceId === deviceId);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dispositivos")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{device.name}</h1>
          <p className="text-muted-foreground">{device.location}</p>
        </div>
        <StatusBadge severity={device.status}>
          {device.status === "online" ? "Online" : "Offline"}
        </StatusBadge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Potência Ativa"
          value={telemetry.P}
          unit="kW"
          icon={Zap}
          status="normal"
        />
        <MetricCard
          title="Fator de Potência"
          value={telemetry.FP}
          icon={Gauge}
          status={telemetry.FP < 0.92 ? "warning" : "normal"}
        />
        <MetricCard
          title="Frequência"
          value={telemetry.freq}
          unit="Hz"
          icon={Activity}
          status="normal"
        />
        <MetricCard
          title="THD Corrente"
          value={telemetry.THD.I}
          unit="%"
          icon={Activity}
          status={telemetry.THD.I > 5 ? "warning" : "normal"}
        />
      </div>

      <Tabs defaultValue="medições" className="space-y-4">
        <TabsList>
          <TabsTrigger value="medições">Medições</TabsTrigger>
          <TabsTrigger value="eventos">Eventos</TabsTrigger>
          <TabsTrigger value="config">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="medições" className="space-y-4">
          <RealTimeChart deviceId={deviceId || ""} />

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Tensão por Fase</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(telemetry.V).map(([phase, value]) => (
                    <div key={phase} className="flex items-center justify-between">
                      <span className="text-sm font-medium">Fase {phase}</span>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-32 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-chart-1"
                            style={{ width: `${(value / 240) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-mono">{formatNumber(value)} V</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Corrente por Fase</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(telemetry.I).map(([phase, value]) => (
                    <div key={phase} className="flex items-center justify-between">
                      <span className="text-sm font-medium">Fase {phase}</span>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-32 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-chart-2"
                            style={{ width: `${(value / 20) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-mono">{formatNumber(value)} A</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="eventos">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Eventos</CardTitle>
            </CardHeader>
            <CardContent>
              {deviceEvents.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Severidade</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Detalhes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deviceEvents.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell className="font-mono text-sm">
                          {formatDateTime(event.tsStart)}
                        </TableCell>
                        <TableCell>{event.type}</TableCell>
                        <TableCell>
                          <StatusBadge severity={event.severity}>
                            {event.severity}
                          </StatusBadge>
                        </TableCell>
                        <TableCell>{event.status}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {JSON.stringify(event.details)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum evento registrado
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Dispositivo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">ID do Dispositivo</p>
                  <p className="font-mono text-sm">{device.deviceId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Versão Firmware</p>
                  <p className="font-mono text-sm">{device.fwVersion}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Localização</p>
                  <p className="text-sm">{device.location}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fases</p>
                  <p className="text-sm">{device.phases.join(", ")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DeviceDetail;
