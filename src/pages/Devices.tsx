import { useState } from "react";
import { Radio, MapPin, Clock, Wifi } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/StatusBadge";
import { mockDevices } from "@/lib/mockData";
import { getRelativeTime } from "@/lib/formatters";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Devices = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredDevices = mockDevices.filter((device) => {
    const matchesSearch = 
      device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || device.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dispositivos</h1>
        <p className="text-muted-foreground">
          Gerenciamento de pontos de medição e dispositivos IoT
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Buscar dispositivo ou localização..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="online">Online</SelectItem>
            <SelectItem value="offline">Offline</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredDevices.map((device) => (
          <Card
            key={device.deviceId}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate(`/dispositivos/${device.deviceId}`)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {device.name}
              </CardTitle>
              <StatusBadge severity={device.status}>
                {device.status === "online" ? "Online" : "Offline"}
              </StatusBadge>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className={`h-16 w-16 rounded-lg mx-auto flex items-center justify-center ${
                device.status === "online" ? "bg-success/10" : "bg-offline/10"
              }`}>
                <Radio className={`h-8 w-8 ${
                  device.status === "online" ? "text-success" : "text-offline"
                }`} />
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{device.location}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{getRelativeTime(device.lastSeen)}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Wifi className="h-4 w-4" />
                  <span>Firmware v{device.fwVersion}</span>
                </div>
              </div>

              <div className="flex gap-1 pt-2">
                {device.phases.map((phase) => (
                  <div
                    key={phase}
                    className="flex-1 h-1 rounded-full bg-chart-1"
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDevices.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Radio className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Nenhum dispositivo encontrado</p>
            <p className="text-sm text-muted-foreground">
              Tente ajustar os filtros de busca
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Devices;
