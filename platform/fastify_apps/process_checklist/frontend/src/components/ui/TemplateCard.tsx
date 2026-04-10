import { MoreHorizontal, Star } from "lucide-react";
import { Card } from "./Card";
import { cn } from "../../utils/cn";

export type TemplateStatus = "published" | "draft" | "private";
export type TemplateType = "custom" | "marketplace";

type TemplateCardProps = {
  id: string;
  name: string;
  category: string;
  version?: string;
  steps: number;
  status: TemplateStatus;
  description?: string;
  tags?: string[];
  usage?: number;
  rating?: number;
  author?: string;
  price?: number;
  type?: TemplateType;
  onMenuClick?: () => void;
  className?: string;
};

const statusColors: Record<TemplateStatus, string> = {
  published: "bg-green-100 text-green-700 border-green-200",
  draft: "bg-orange-100 text-orange-700 border-orange-200",
  private: "bg-neutral-100 text-neutral-600 border-neutral-200",
};

export function TemplateCard({
  name,
  category,
  version,
  steps,
  status,
  description,
  tags,
  usage,
  rating,
  author,
  price,
  type = "custom",
  onMenuClick,
  className,
}: TemplateCardProps) {
  return (
    <Card className={cn("hover:scale-[1.02] transition-transform", className)}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3
              className="font-semibold text-neutral-900 truncate"
              data-testid="template-name"
            >
              {name}
            </h3>
            {type === "marketplace" && (
              <Star className="w-4 h-4 text-yellow-400 fill-current flex-shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <span data-testid="template-category">{category}</span>
            {version && (
              <>
                <span className="text-neutral-300">•</span>
                <span className="text-neutral-400">{version}</span>
              </>
            )}
          </div>
        </div>
        <button
          onClick={onMenuClick}
          className="text-neutral-400 hover:text-neutral-600 transition-colors p-1 -m-1"
          aria-label="More options"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {description && (
        <p className="text-sm text-neutral-600 mb-4 line-clamp-2">{description}</p>
      )}

      <div className="flex items-center justify-between mb-4 text-sm text-neutral-500">
        <div className="flex items-center gap-4">
          <span data-testid="template-steps">{steps} steps</span>
          {usage !== undefined && (
            <>
              <span className="text-neutral-300">•</span>
              <span>{usage.toLocaleString()} uses</span>
            </>
          )}
          {rating !== undefined && rating > 0 && (
            <>
              <span className="text-neutral-300">•</span>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                <span>{rating.toFixed(1)}</span>
              </div>
            </>
          )}
        </div>
        {price && (
          <span className="text-sm font-medium text-neutral-700">${price}</span>
        )}
      </div>

      <div className="flex items-center justify-between">
        <span
          className={cn(
            "px-3 py-1 rounded-full text-xs font-medium border",
            statusColors[status]
          )}
          data-testid="template-status"
        >
          {status}
        </span>
        {author && (
          <span className="text-xs text-neutral-500">by {author}</span>
        )}
      </div>

      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-4">
          {tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-neutral-50 text-neutral-500 rounded-md text-xs border border-neutral-200"
            >
              {tag}
            </span>
          ))}
          {tags.length > 3 && (
            <span className="px-2 py-1 text-neutral-400 text-xs">
              +{tags.length - 3} more
            </span>
          )}
        </div>
      )}
    </Card>
  );
}
