import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  className?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: LucideIcon;
  color?: string;
}

export function MetricCard({ title, value, unit, className, trend, trendValue, icon: Icon, color }: MetricCardProps) {
  return (
    <Card className={cn("bg-zinc-900 border-zinc-800", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-zinc-400">
          {title}
        </CardTitle>
        {Icon && <Icon className={cn("h-4 w-4 text-muted-foreground", color)} />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-zinc-100">
          {value}
          {unit && <span className="text-sm font-normal text-zinc-500 ml-1">{unit}</span>}
        </div>
        {trend && (
          <p className={cn("text-xs mt-1", {
            "text-green-500": trend === 'up',
            "text-red-500": trend === 'down',
            "text-zinc-500": trend === 'neutral',
          })}>
            {trend === 'up' ? '▲' : trend === 'down' ? '▼' : '−'} {trendValue}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
