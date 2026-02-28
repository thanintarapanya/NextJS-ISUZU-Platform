import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";

interface RealTimeChartProps {
  data: any[];
  dataKey: string;
  title: string;
  color?: string;
  unit?: string;
  domain?: [number | 'auto' | 'dataMin' | 'dataMax', number | 'auto' | 'dataMin' | 'dataMax'];
}

export function RealTimeChart({ data, dataKey, title, color = "#2563eb", unit, domain }: RealTimeChartProps) {
  return (
    <Card className="bg-zinc-900 border-zinc-800 col-span-1 md:col-span-2 lg:col-span-3">
      <CardHeader>
        <CardTitle className="text-zinc-100 text-sm font-medium flex items-center gap-2">
          <Activity className="w-4 h-4" style={{ color }} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pl-0">
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis 
                dataKey="timestamp" 
                hide 
                domain={['dataMin', 'dataMax']} 
                type="number" 
              />
              <YAxis 
                stroke="#52525b" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                domain={domain || ['auto', 'auto']}
                tickFormatter={(value) => `${value}${unit || ''}`}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a' }}
                itemStyle={{ color: '#e4e4e7' }}
                labelStyle={{ display: 'none' }}
                formatter={(value: any) => [`${value} ${unit || ''}`, title]}
              />
              <Line
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false} // Disable animation for smoother updates
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
