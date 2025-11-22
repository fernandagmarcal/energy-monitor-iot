import { useState, useEffect } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { formatDateTime } from "@/lib/formatters";
import api from "@/lib/api";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

type AlarmEvent = {
  id: number;
  timestamp: string;
  device: string;
  type: string;
  severity: string;
  status: string;
};

type AlarmRule = {
  id: number;
  name: string;
  metric: string;
  condition: string;
  threshold: number;
  severity: string;
  enabled: boolean;
};

/* ---------------------------------------------------
   NORMALIZADOR DE SEVERIDADE
----------------------------------------------------*/

const mapSeverity = (raw: string): "Crítico" | "Alto" | "Médio" | "Info" => {
  const s = raw.toLowerCase();

  if (s.includes("crit")) return "Crítico";
  if (s.includes("alt")) return "Alto";
  if (s.includes("med") || s.includes("medio") || s.includes("médio")) return "Médio";
  return "Info";
};

const Alarms = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [events, setEvents] = useState<AlarmEvent[]>([]);
  const [rules, setRules] = useState<AlarmRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [evRes, rulesRes] = await Promise.all([
          api.get("/alarms"),
          api.get("/alarm-rules"),
        ]);

        if (!Array.isArray(evRes.data) || !Array.isArray(rulesRes.data)) {
          throw new Error("Formato inesperado vindo da API");
        }

        setEvents(evRes.data);
        setRules(rulesRes.data);
      } catch (err) {
        setError("Erro ao carregar dados. Verifique se o backend Go está ativo.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleCreateAlarm = () => {
    toast.success("Regra de alarme criada com sucesso!");
    setIsDialogOpen(false);
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold">Alarmes</h1>
        <p>Carregando dados…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold">Erro</h1>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Alarmes</h1>
          <p className="text-muted-foreground">
            Gerenciamento de eventos e regras de notificação
          </p>
        </div>

        {/* DIALOG */}
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
                Configure uma nova regra para monitoramento automático.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">

              <div className="grid gap-2">
                <Label htmlFor="name">Nome da Regra</Label>
                <Input id="name" placeholder="Ex: Fator de Potência Crítico" />
              </div>

              <div className="grid gap-2">
                <Label>Dispositivo</Label>
                <Select defaultValue="all">
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar dispositivo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os dispositivos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Métrica</Label>
                  <Select defaultValue="FP">
                    <SelectTrigger><SelectValue /></SelectTrigger>
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
                  <Label>Condição</Label>
                  <Select defaultValue="<">
                    <SelectTrigger><SelectValue /></SelectTrigger>
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
                  <Label>Limite</Label>
                  <Input type="number" placeholder="0.92" step="0.01" />
                </div>

                <div className="grid gap-2">
                  <Label>Severidade</Label>
                  <Select defaultValue="Alto">
                    <SelectTrigger><SelectValue /></SelectTrigger>
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

      {/* TABS */}
      <Tabs defaultValue="eventos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="eventos">Eventos</TabsTrigger>
          <TabsTrigger value="regras">Regras</TabsTrigger>
        </TabsList>

        {/* EVENTOS */}
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
                  {events.map((ev) => (
                    <TableRow key={ev.id}>
                      <TableCell className="font-mono text-sm">{ev.id}</TableCell>

                      <TableCell className="font-mono text-sm">
                        {formatDateTime(ev.timestamp)}
                      </TableCell>

                      <TableCell>{ev.device}</TableCell>
                      <TableCell>{ev.type}</TableCell>

                      <TableCell>
                        <StatusBadge severity={mapSeverity(ev.severity)}>
                          {mapSeverity(ev.severity)}
                        </StatusBadge>
                      </TableCell>

                      <TableCell>
                        <span
                          className={`text-sm ${
                            ev.status === "ativo"
                              ? "text-critical"
                              : ev.status === "confirmado"
                              ? "text-warning"
                              : "text-muted-foreground"
                          }`}
                        >
                          {ev.status.charAt(0).toUpperCase() +
                            ev.status.slice(1)}
                        </span>
                      </TableCell>

                      <TableCell>
                        <Button variant="ghost" size="sm">Ver detalhes</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* REGRAS */}
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
                  {rules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell className="font-medium">{rule.name}</TableCell>
                      <TableCell>{rule.metric}</TableCell>
                      <TableCell>{rule.condition}</TableCell>
                      <TableCell>{rule.threshold}</TableCell>

                      <TableCell>
                        <StatusBadge severity={mapSeverity(rule.severity)}>
                          {mapSeverity(rule.severity)}
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