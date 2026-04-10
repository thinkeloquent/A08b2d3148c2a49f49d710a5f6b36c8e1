import {
  CheckCircle2,
  XCircle,
  Loader2,
  Circle,
  SkipForward,
} from "lucide-react";
import { getStatusCategory, getStatusColor } from "@/lib/status";

interface StatusIconProps {
  conclusion: string | null | undefined;
  status: string | null | undefined;
  size?: number;
}

export function StatusIcon({ conclusion, status, size = 18 }: StatusIconProps) {
  const category = getStatusCategory(conclusion, status);
  const color = getStatusColor(category);

  switch (category) {
    case "success":
      return <CheckCircle2 size={size} className={`shrink-0 ${color}`} />;
    case "failure":
      return <XCircle size={size} className={`shrink-0 ${color}`} />;
    case "in_progress":
      return (
        <Loader2
          size={size}
          className={`shrink-0 ${color} animate-spin-slow`}
        />
      );
    case "queued":
      return <Circle size={size} className={`shrink-0 ${color}`} />;
    case "skipped":
      return <SkipForward size={size} className={`shrink-0 ${color}`} />;
  }
}
