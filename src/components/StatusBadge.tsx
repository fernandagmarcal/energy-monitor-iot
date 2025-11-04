import { Badge } from "@/components/ui/badge";
import { Severity } from "@/types/energy";

interface StatusBadgeProps {
  severity: Severity | "online" | "offline";
  children: React.ReactNode;
  className?: string;
}

export const StatusBadge = ({ severity, children, className }: StatusBadgeProps) => {
  const variantMap = {
    "Crítico": "bg-critical text-critical-foreground",
    "Alto": "bg-warning text-warning-foreground",
    "Médio": "bg-alert text-warning-foreground",
    "Info": "bg-info text-info-foreground",
    "online": "bg-online text-success-foreground",
    "offline": "bg-offline text-muted-foreground",
  };

  return (
    <Badge className={`${variantMap[severity]} ${className || ''}`}>
      {children}
    </Badge>
  );
};
