import { useState } from "react";
import { buttonClasses } from "./Button";
import { cn } from "../../utils/cn";

interface JsonViewerProps {
  data: any;
  filename?: string;
  className?: string;
}

export function JsonViewer({ data, filename = "data", className }: JsonViewerProps) {
  const [copied, setCopied] = useState(false);

  const jsonString = JSON.stringify(data, null, 2);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    link.download = `${filename}-${timestamp}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const syntaxHighlight = (json: string): React.ReactNode[] => {
    const tokenPattern =
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = tokenPattern.exec(json)) !== null) {
      if (match.index > lastIndex) {
        parts.push(json.slice(lastIndex, match.index));
      }
      const token = match[0];
      let cls = "text-orange-600"; // number
      if (/^"/.test(token)) {
        cls = /:$/.test(token) ? "text-blue-700 font-medium" : "text-green-700";
      } else if (/true|false/.test(token)) {
        cls = "text-purple-700";
      } else if (/null/.test(token)) {
        cls = "text-neutral-500";
      }
      parts.push(
        <span key={match.index} className={cls}>
          {token}
        </span>
      );
      lastIndex = tokenPattern.lastIndex;
    }
    if (lastIndex < json.length) {
      parts.push(json.slice(lastIndex));
    }
    return parts;
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleCopy}
          className={buttonClasses({
            variant: copied ? "success" : "secondary",
            size: "sm"
          })}>

          {copied ?
          <>
              <svg
              className="size-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24" data-test-id="svg-98e87936">

                <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7" />

              </svg>
              Copied!
            </> :

          <>
              <svg
              className="size-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24" data-test-id="svg-07066382">

                <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />

              </svg>
              Copy to clipboard
            </>
          }
        </button>
        <button
          type="button"
          onClick={handleDownload}
          className={buttonClasses({
            variant: "secondary",
            size: "sm"
          })}>

          <svg
            className="size-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24" data-test-id="svg-b2c12758">

            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />

          </svg>
          Download JSON
        </button>
      </div>

      <div className="overflow-auto rounded-lg border border-neutral-200 bg-neutral-50 p-6 shadow-sm">
        <pre className="text-xs leading-relaxed text-neutral-900">
          {syntaxHighlight(jsonString)}
        </pre>
      </div>
    </div>);

}