import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateTelemetry } from "@/lib/mockData";
import { formatTime, formatNumber } from "@/lib/formatters";

interface DataPoint {
  time: string;
  VA: number;
  VB: number;
  VC: number;
  IA: number;
  IB: number;
  IC: number;
}

export const RealTimeChart = ({ deviceId }: { deviceId: string }) => {
  const [data, setData] = useState<DataPoint[]>([]);

  // Função de segurança contra valores inválidos
  const safeNumber = (value: any): number => {
    const n = Number(value);
    return isNaN(n) ? 0 : n;
  };

  useEffect(() => {
    const initialData: DataPoint[] = [];
    for (let i = 0; i < 20; i++) {
      const telemetry = generateTelemetry(deviceId);

      initialData.push({
        time: formatTime(telemetry.ts),
        VA: safeNumber(telemetry.V.A),
        VB: safeNumber(telemetry.V.B),
        VC: safeNumber(telemetry.V.C),
        IA: safeNumber(telemetry.I.A),
        IB: safeNumber(telemetry.I.B),
        IC: safeNumber(telemetry.I.C),
      });
    }

    setData(initialData);

    const interval = setInterval(() => {
      const telemetry = generateTelemetry(deviceId);

      const newPoint: DataPoint = {
        time: formatTime(telemetry.ts),
        VA: safeNumber(telemetry.V.A),
        VB: safeNumber(telemetry.V.B),
        VC: safeNumber(telemetry.V.C),
        IA: safeNumber(telemetry.I.A),
        IB: safeNumber(telemetry.I.B),
        IC: safeNumber(telemetry.I.C),
      };

      setData((prev) => [...prev.slice(-19), newPoint]);
    }, 5000);

    return () => clearInterval(interval);
  }, [deviceId]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium mb-2">{payload[0]?.payload?.time}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatNumber(entry.value, 2)} {entry.name.startsWith("V") ? "V" : "A"}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tensão e Corrente em Tempo Real</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />

            <Line type="monotone" dataKey="VA" stroke="hsl(var(--chart-1))" name="Tensão A" dot={false} strokeWidth={2} />
            <Line type="monotone" dataKey="VB" stroke="hsl(var(--chart-2))" name="Tensão B" dot={false} strokeWidth={2} />
            <Line type="monotone" dataKey="VC" stroke="hsl(var(--chart-3))" name="Tensão C" dot={false} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
