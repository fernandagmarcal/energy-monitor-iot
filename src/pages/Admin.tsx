import { Users, Building2, Settings2, Globe } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const mockUsers = [
  { id: "1", name: "Carlos Silva", email: "carlos@empresa.com", role: "Administrador" },
  { id: "2", name: "Ana Santos", email: "ana@empresa.com", role: "Gestor" },
  { id: "3", name: "João Oliveira", email: "joao@empresa.com", role: "Técnico" },
  { id: "4", name: "Maria Costa", email: "maria@empresa.com", role: "Visualizador" },
];

const Admin = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Administração</h1>
        <p className="text-muted-foreground">
          Configurações do sistema e gerenciamento de usuários
        </p>
      </div>

      <Tabs defaultValue="usuarios" className="space-y-4">
        <TabsList>
          <TabsTrigger value="usuarios">
            <Users className="h-4 w-4 mr-2" />
            Usuários
          </TabsTrigger>
          <TabsTrigger value="unidades">
            <Building2 className="h-4 w-4 mr-2" />
            Unidades
          </TabsTrigger>
          <TabsTrigger value="integracoes">
            <Settings2 className="h-4 w-4 mr-2" />
            Integrações
          </TabsTrigger>
          <TabsTrigger value="sistema">
            <Globe className="h-4 w-4 mr-2" />
            Sistema
          </TabsTrigger>
        </TabsList>

        <TabsContent value="usuarios">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciamento de Usuários</CardTitle>
              <CardDescription>
                Controle de acesso e permissões do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Perfil</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <StatusBadge severity="Info">{user.role}</StatusBadge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">Editar</Button>
                          <Button variant="ghost" size="sm">Remover</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="unidades">
          <Card>
            <CardHeader>
              <CardTitle>Unidades e Locais</CardTitle>
              <CardDescription>
                Organização física dos pontos de medição
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Nome da Unidade</Label>
                    <Input placeholder="Ex: Unidade Principal" />
                  </div>
                  <div className="space-y-2">
                    <Label>Endereço</Label>
                    <Input placeholder="Endereço completo" />
                  </div>
                </div>
                <Button>Adicionar Unidade</Button>
              </div>

              <div className="mt-6 space-y-2">
                {["Unidade Principal", "Unidade Produção", "Unidade Administrativa", "Unidade Industrial"].map((unit) => (
                  <div
                    key={unit}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div>
                      <p className="font-medium">{unit}</p>
                      <p className="text-sm text-muted-foreground">
                        {Math.floor(Math.random() * 5) + 1} dispositivos
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">Editar</Button>
                      <Button variant="ghost" size="sm">Remover</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integracoes">
          <Card>
            <CardHeader>
              <CardTitle>Configuração de Integrações</CardTitle>
              <CardDescription>
                Endpoints MQTT/HTTP e configurações de telemetria
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Broker MQTT</Label>
                  <Input placeholder="mqtt://broker.example.com:1883" />
                </div>
                <div className="space-y-2">
                  <Label>Tópico Base</Label>
                  <Input placeholder="energy/" />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Usuário</Label>
                    <Input placeholder="usuário" />
                  </div>
                  <div className="space-y-2">
                    <Label>Senha</Label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="text-sm font-medium mb-4">API REST</h3>
                <div className="space-y-2">
                  <Label>Endpoint Base</Label>
                  <Input placeholder="https://api.example.com/v1" />
                </div>
              </div>

              <Button>Salvar Configurações</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sistema">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Sistema</CardTitle>
              <CardDescription>
                Preferências gerais e formatação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Fuso Horário</Label>
                  <Select defaultValue="america-araguaina">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="america-araguaina">
                        America/Araguaina (UTC-03:00)
                      </SelectItem>
                      <SelectItem value="america-sao-paulo">
                        America/São Paulo (UTC-03:00)
                      </SelectItem>
                      <SelectItem value="america-manaus">
                        America/Manaus (UTC-04:00)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Formato de Números</Label>
                  <Select defaultValue="pt-br">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt-br">Português (1.234,56)</SelectItem>
                      <SelectItem value="en-us">Inglês (1,234.56)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="space-y-0.5">
                    <Label>Modo Escuro Automático</Label>
                    <p className="text-sm text-muted-foreground">
                      Alternar tema baseado no horário do sistema
                    </p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="space-y-0.5">
                    <Label>Notificações por E-mail</Label>
                    <p className="text-sm text-muted-foreground">
                      Receber alertas por e-mail
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="space-y-0.5">
                    <Label>Atualização Automática de Dados</Label>
                    <p className="text-sm text-muted-foreground">
                      Intervalo de 5 segundos
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <Button>Salvar Preferências</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
