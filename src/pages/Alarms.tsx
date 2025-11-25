import { useState, useEffect } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";

import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow
} from "@/components/ui/table";

import api from "@/lib/api";
import { formatDateTime } from "@/lib/formatters";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

// ----------------------
// HELPERS
// ----------------------

const normalizeSeverity = (s: string): any => {
  if (!s) return "Info";

  const map: Record<string, string> = {
    "crítico": "Crítico",
    "critico": "Crítico",
    "alto": "Alto",
    "médio": "Médio",
    "medio": "Médio",
    "info": "Info",
  };

  const clean = String(s).trim().toLowerCase();
  return map[clean] ?? "Info"; 
};

type Row = {
  "Pontos": string;
  "Tensão em V": string;
  "Corrente em A": string;
};

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

const DEVICE_MAP: Record<string, string> = {
  "Planilha1.xlsx": "Medidor TRF 01",
  "Planilha2.xlsx": "Medidor TRF 02",
  "Planilha3.xlsx": "Medidor TRF 03",
};

const Alarms = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [events, setEvents] = useState<AlarmEvent[]>([]);
  const [rules, setRules] = useState<AlarmRule[]>([
    { id: 1, name: "Tensão fora de faixa", metric: "V", condition: "outside", threshold: 175, severity: "Alto", enabled: true },
    { id: 2, name: "Corrente alta", metric: "I", condition: ">", threshold: 3.0, severity: "Crítico", enabled: true },
  ]);

  const loadAndGenerateEvents = async () => {
    try {
      const files = ["Planilha1.xlsx", "Planilha2.xlsx", "Planilha3.xlsx"];
      const allEvents: AlarmEvent[] = [];

      for (const file of files) {
        const res = await api.get(`/data/${file}`);

        const sheet = res.data.data[0];
        const rows: Row[] = sheet.data;

        rows.forEach((row) => {
          const V = Number(row["Tensão em V"]);
          const I = Number(row["Corrente em A"]);

          if (V < 170 || V > 180) {
            allEvents.push({
              id: allEvents.length + 1,
              timestamp: new Date().toISOString(),
              device: DEVICE_MAP[file],
              type: "Tensão fora da faixa",
              severity: "Alto",
              status: "ativo",
            });
          }

          if (I > 3) {
            allEvents.push({
              id: allEvents.length + 1,
              timestamp: new Date().toISOString(),
              device: DEVICE_MAP[file],
              type: "Corrente alta",
              severity: "Crítico",
              status: "ativo",
            });
          }
        });
      }

      setEvents(allEvents);

    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar dados das planilhas.");
    }
  };

  useEffect(() => {
    loadAndGenerateEvents();
  }, []);

  const handleCreateAlarm = () => {
    toast.success("Regra criada (somente local).");
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Alarmes</h1>
          <p className="text-muted-foreground">Eventos gerados a partir das planilhas</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Criar Alarme
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Regra</DialogTitle>
              <DialogDescription>Criação local.</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div>
                <Label>Nome</Label>
                <Input placeholder="Nome da regra" />
              </div>

              <div>
                <Label>Métrica</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="V">Tensão</SelectItem>
                    <SelectItem value="I">Corrente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleCreateAlarm}>Criar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="eventos">
        <TabsList>
          <TabsTrigger value="eventos">Eventos</TabsTrigger>
          <TabsTrigger value="regras">Regras</TabsTrigger>
        </TabsList>

        {/* EVENTOS */}
        <TabsContent value="eventos">
          <Card>
            <CardHeader><CardTitle>Histórico de Eventos</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Dispositivo</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Severidade</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {events.map((ev) => (
                    <TableRow key={ev.id}>
                      <TableCell>{ev.id}</TableCell>
                      <TableCell>{formatDateTime(ev.timestamp)}</TableCell>
                      <TableCell>{ev.device}</TableCell>
                      <TableCell>{ev.type}</TableCell>
                      <TableCell>
                        <StatusBadge severity={normalizeSeverity(ev.severity)}>
                          {normalizeSeverity(ev.severity)}
                        </StatusBadge>
                      </TableCell>
                      <TableCell>{ev.status}</TableCell>
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
            <CardHeader><CardTitle>Regras</CardTitle></CardHeader>
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
                      <TableCell>{rule.name}</TableCell>
                      <TableCell>{rule.metric}</TableCell>
                      <TableCell>{rule.condition}</TableCell>
                      <TableCell>{rule.threshold}</TableCell>

                      <TableCell>
                        <StatusBadge severity={normalizeSeverity(rule.severity)}>
                          {normalizeSeverity(rule.severity)}
                        </StatusBadge>
                      </TableCell>

                      <TableCell><Switch checked={rule.enabled} /></TableCell>
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
