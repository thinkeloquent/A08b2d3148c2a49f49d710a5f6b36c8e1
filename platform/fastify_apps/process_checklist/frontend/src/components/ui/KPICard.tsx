import { ReactNode } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "./Card";
import { cn } from "../../utils/cn";

export type KPICardColor = "blue" | "green" | "orange" | "purple";

type KPICardProps = {
  title: string;
  value: string | number;
  icon: ReactNode;
  color?: KPICardColor;
  subtitle?: string;
  trend?: number;
  className?: string;
};

const colorClasses: Record<KPICardColor, string> = {
  blue: "bg-blue-50 text-blue-500 border-blue-200",
  green: "bg-green-50 text-green-500 border-green-200",
  orange: "bg-orange-50 text-orange-500 border-orange-200",
  purple: "bg-purple-50 text-purple-500 border-purple-200",
};

export function KPICard({
  title,
  value,
  icon,
  color = "blue",
  subtitle,
  trend,
  className,
}: KPICardProps) {
  return (
    <Card className={cn("hover:scale-[1.02] transition-transform", className)}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="text-sm font-medium text-neutral-500 mb-2">{title}</p>
          <p className="text-3xl font-bold text-neutral-900 mb-1" data-testid="kpi-value">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
          {subtitle && (
            <p className="text-sm text-neutral-500 mt-1">{subtitle}</p>
          )}
          {trend !== undefined && (
            <div className="flex items-center gap-1 mt-3" data-testid="kpi-trend">
              {trend > 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <span
                className={cn(
                  "text-sm font-medium",
                  trend > 0 ? "text-green-500" : "text-red-500"
                )}
              >
                {Math.abs(trend)}%
              </span>
              <span className="text-xs text-neutral-400 ml-1">vs last period</span>
            </div>
          )}
        </div>

        <div
          className={cn(
            "p-3 rounded-xl border",
            colorClasses[color]
          )}
          data-testid="kpi-icon"
        >
          {icon}
        </div>
      </div>
    </Card>
  );
}
