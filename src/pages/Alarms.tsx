import { useState } from "react";
import { Plus, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockEvents, mockDevices, mockAlarmRules } from "@/lib/mockData";
import { formatDateTime } from "@/lib/formatters";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const Alarms = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCreateAlarm = () => {
    toast.success("Regra de alarme criada com sucesso!");
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Alarmes</h1>
          <p className="text-muted-foreground">
            Gerenciamento de eventos e regras de notificação
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Criar Alarme
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Criar Nova Regra de Alarme</DialogTitle>
              <DialogDescription>
                Configure uma nova regra para monitoramento automático
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome da Regra</Label>
                <Input id="name" placeholder="Ex: Fator de Potência Crítico" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="device">Dispositivo</Label>
                <Select defaultValue="all">
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar dispositivo" />
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
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="metric">Métrica</Label>
                  <Select defaultValue="FP">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FP">Fator de Potência</SelectItem>
                      <SelectItem value="THD">THD</SelectItem>
                      <SelectItem value="V">Tensão</SelectItem>
                      <SelectItem value="I">Corrente</SelectItem>
                      <SelectItem value="freq">Frequência</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="condition">Condição</Label>
                  <Select defaultValue="<">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="<">Menor que</SelectItem>
                      <SelectItem value=">">Maior que</SelectItem>
                      <SelectItem value="between">Entre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="threshold">Limite</Label>
                  <Input id="threshold" type="number" placeholder="0.92" step="0.01" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="severity">Severidade</Label>
                  <Select defaultValue="Alto">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Crítico">Crítico</SelectItem>
                      <SelectItem value="Alto">Alto</SelectItem>
                      <SelectItem value="Médio">Médio</SelectItem>
                      <SelectItem value="Info">Info</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateAlarm}>Criar Regra</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="eventos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="eventos">Eventos</TabsTrigger>
          <TabsTrigger value="regras">Regras</TabsTrigger>
        </TabsList>

        <TabsContent value="eventos">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Eventos</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Dispositivo</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Severidade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockEvents.map((event) => {
                    const device = mockDevices.find((d) => d.deviceId === event.deviceId);
                    return (
                      <TableRow key={event.id}>
                        <TableCell className="font-mono text-sm">{event.id}</TableCell>
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
                          <span
                            className={`text-sm ${
                              event.status === "ativo"
                                ? "text-critical"
                                : event.status === "confirmado"
                                ? "text-warning"
                                : "text-muted-foreground"
                            }`}
                          >
                            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            Ver detalhes
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regras">
          <Card>
            <CardHeader>
              <CardTitle>Regras de Alarme</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Métrica</TableHead>
                    <TableHead>Condição</TableHead>
                    <TableHead>Limite</TableHead>
                    <TableHead>Severidade</TableHead>
                    <TableHead>Ativo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockAlarmRules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell className="font-medium">{rule.name}</TableCell>
                      <TableCell>{rule.metric}</TableCell>
                      <TableCell>{rule.condition}</TableCell>
                      <TableCell>{rule.threshold.toString()}</TableCell>
                      <TableCell>
                        <StatusBadge severity={rule.severity}>
                          {rule.severity}
                        </StatusBadge>
                      </TableCell>
                      <TableCell>
                        <Switch checked={rule.enabled} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Alarms;
