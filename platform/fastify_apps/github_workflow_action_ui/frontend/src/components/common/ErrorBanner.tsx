import { AlertTriangle } from "lucide-react";
import { ApiError } from "@/services/api/client";

interface ErrorBannerProps {
  error: Error | null;
}

export function ErrorBanner({ error }: ErrorBannerProps) {
  if (!error) return null;

  const message =
    error instanceof ApiError
      ? error.getUserMessage()
      : error.message || "An unexpected error occurred";

  return (
    <div className="mx-4 my-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
      <AlertTriangle size={14} className="shrink-0 text-red-500 mt-0.5" />
      <p className="text-xs text-red-700">{message}</p>
    </div>
  );
}
