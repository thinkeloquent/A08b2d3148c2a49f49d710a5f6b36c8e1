import { useState } from "react";
import { Eye, EyeOff, Copy, Settings, Trash2 } from "lucide-react";
import { Card } from "./Card";
import { Button } from "./Button";
import { cn } from "../../utils/cn";

export type IntegrationStatus = "active" | "inactive";

type IntegrationCardProps = {
  id: string;
  name: string;
  apiKey: string;
  domain: string;
  status: IntegrationStatus;
  lastUsed: string;
  totalRequests: number;
  templatesUsed: number;
  onConfigure?: () => void;
  onDelete?: () => void;
  className?: string;
};

export function IntegrationCard({
  name,
  apiKey,
  domain,
  status,
  lastUsed,
  totalRequests,
  templatesUsed,
  onConfigure,
  onDelete,
  className,
}: IntegrationCardProps) {
  const [showApiKey, setShowApiKey] = useState(false);
  const [copied, setCopied] = useState(false);

  const maskedApiKey = apiKey.slice(0, 12) + "...";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className={className}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3
            className="font-semibold text-neutral-900 mb-1"
            data-testid="integration-name"
          >
            {name}
          </h3>
          <p className="text-sm text-neutral-500 truncate">{domain}</p>
        </div>
        <div
          className={cn(
            "px-3 py-1 rounded-full text-xs font-medium",
            status === "active"
              ? "bg-green-100 text-green-700 border border-green-200"
              : "bg-neutral-100 text-neutral-600 border border-neutral-200"
          )}
          data-testid="integration-status"
        >
          {status}
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-500">API Key</span>
          <div className="flex items-center gap-2">
            <code
              className="text-xs font-mono bg-neutral-50 px-3 py-1.5 rounded border border-neutral-200"
              data-testid="api-key-display"
            >
              {showApiKey ? apiKey : maskedApiKey}
            </code>
            <button
              onClick={() => setShowApiKey(!showApiKey)}
              className="p-1.5 hover:bg-neutral-100 rounded transition-colors"
              aria-label={showApiKey ? "Hide API key" : "Show API key"}
            >
              {showApiKey ? (
                <EyeOff className="w-3.5 h-3.5 text-neutral-500" />
              ) : (
                <Eye className="w-3.5 h-3.5 text-neutral-500" />
              )}
            </button>
            <button
              onClick={handleCopy}
              className="p-1.5 hover:bg-neutral-100 rounded transition-colors"
              aria-label="Copy API key"
              data-testid="copy-api-key"
            >
              <Copy
                className={cn(
                  "w-3.5 h-3.5",
                  copied ? "text-green-500" : "text-neutral-500"
                )}
              />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm pt-2">
          <div className="text-center">
            <p
              className="font-semibold text-neutral-900 text-lg"
              data-testid="total-requests"
            >
              {totalRequests.toLocaleString()}
            </p>
            <p className="text-neutral-500 text-xs mt-1">Requests</p>
          </div>
          <div className="text-center">
            <p
              className="font-semibold text-neutral-900 text-lg"
              data-testid="templates-used"
            >
              {templatesUsed}
            </p>
            <p className="text-neutral-500 text-xs mt-1">Templates</p>
          </div>
          <div className="text-center">
            <p className="font-semibold text-neutral-900 text-xs truncate">
              {lastUsed}
            </p>
            <p className="text-neutral-500 text-xs mt-1">Last Used</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-2 border-t border-neutral-200">
        <Button
          variant="secondary"
          size="sm"
          onClick={onConfigure}
          className="flex-1"
          data-testid="configure-button"
        >
          <Settings className="w-3.5 h-3.5" />
          Configure
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          aria-label="Delete integration"
          data-testid="delete-button"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </Card>
  );
}
