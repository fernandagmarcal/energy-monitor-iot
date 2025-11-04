import { MapPin, Radio, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockDevices, mockEvents } from "@/lib/mockData";
import { StatusBadge } from "@/components/StatusBadge";
import { useNavigate } from "react-router-dom";

const Map = () => {
  const navigate = useNavigate();

  const locations = [
    { x: 20, y: 30, location: "Quadro Geral / Bloco A" },
    { x: 70, y: 25, location: "Quadro Geral / Bloco B" },
    { x: 45, y: 60, location: "Produção / Setor 3" },
    { x: 80, y: 70, location: "Administrativo / 4º Andar" },
    { x: 15, y: 75, location: "Casa de Máquinas" },
  ];

  const getDevicesByLocation = (location: string) => {
    return mockDevices.filter((d) => d.location === location);
  };

  const getLocationStatus = (location: string) => {
    const devices = getDevicesByLocation(location);
    const hasOffline = devices.some((d) => d.status === "offline");
    const deviceIds = devices.map((d) => d.deviceId);
    const hasActiveAlarms = mockEvents.some(
      (e) => e.status === "ativo" && deviceIds.includes(e.deviceId)
    );

    if (hasOffline || hasActiveAlarms) return "critical";
    return "online";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mapa</h1>
        <p className="text-muted-foreground">
          Visualização geográfica dos pontos de medição
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Planta da Instalação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative w-full aspect-[16/10] bg-muted rounded-lg border-2 border-border overflow-hidden">
              {/* Simplified floor plan background */}
              <div className="absolute inset-0">
                <div className="absolute top-[10%] left-[10%] right-[10%] h-[35%] border-2 border-border/50 rounded" />
                <div className="absolute top-[55%] left-[10%] right-[40%] bottom-[10%] border-2 border-border/50 rounded" />
                <div className="absolute top-[55%] right-[10%] left-[65%] bottom-[10%] border-2 border-border/50 rounded" />
              </div>

              {/* Device pins */}
              {locations.map((loc, idx) => {
                const status = getLocationStatus(loc.location);
                const devices = getDevicesByLocation(loc.location);
                
                return (
                  <div
                    key={idx}
                    className="absolute cursor-pointer group"
                    style={{ left: `${loc.x}%`, top: `${loc.y}%`, transform: "translate(-50%, -50%)" }}
                    onClick={() => devices[0] && navigate(`/dispositivos/${devices[0].deviceId}`)}
                  >
                    <div className="relative">
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center border-2 transition-all group-hover:scale-110 ${
                          status === "critical"
                            ? "bg-critical border-critical shadow-lg shadow-critical/50"
                            : "bg-success border-success shadow-lg shadow-success/50"
                        }`}
                      >
                        {status === "critical" ? (
                          <AlertCircle className="h-4 w-4 text-white" />
                        ) : (
                          <Radio className="h-4 w-4 text-white" />
                        )}
                      </div>
                      
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        <div className="bg-popover border border-border rounded-lg p-2 shadow-lg whitespace-nowrap">
                          <p className="text-xs font-medium">{devices[0]?.name}</p>
                          <p className="text-xs text-muted-foreground">{loc.location}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-success" />
                <span className="text-muted-foreground">Normal</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-warning" />
                <span className="text-muted-foreground">Aviso</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-critical" />
                <span className="text-muted-foreground">Crítico</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Localizações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {locations.map((loc, idx) => {
                  const devices = getDevicesByLocation(loc.location);
                  const status = getLocationStatus(loc.location);
                  
                  return (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-accent transition-colors"
                      onClick={() => devices[0] && navigate(`/dispositivos/${devices[0].deviceId}`)}
                    >
                      <MapPin className={`h-5 w-5 mt-0.5 ${
                        status === "critical" ? "text-critical" : "text-success"
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{loc.location}</p>
                        <p className="text-xs text-muted-foreground">
                          {devices.length} dispositivo{devices.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <StatusBadge severity={status === "critical" ? "Crítico" : "online"}>
                        {status === "critical" ? "Alerta" : "OK"}
                      </StatusBadge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Map;
