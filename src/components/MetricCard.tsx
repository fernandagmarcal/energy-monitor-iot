import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { formatNumber } from "@/lib/formatters";

interface MetricCardProps {
  title: string;
  value: number | string;
  unit?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  status?: "normal" | "warning" | "critical";
}

export const MetricCard = ({ 
  title, 
  value, 
  unit, 
  icon: Icon, 
  trend,
  status = "normal" 
}: MetricCardProps) => {
  const statusColors = {
    normal: "text-success",
    warning: "text-warning",
    critical: "text-critical"
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${statusColors[status]}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {typeof value === 'number' ? formatNumber(value) : value}
          {unit && <span className="text-sm font-normal ml-1 text-muted-foreground">{unit}</span>}
        </div>
        {trend && (
          <p className={`text-xs ${trend.isPositive ? 'text-success' : 'text-critical'}`}>
            {trend.isPositive ? '+' : ''}{formatNumber(trend.value, 1)}% em relação ao período anterior
          </p>
        )}
      </CardContent>
    </Card>
  );
};
