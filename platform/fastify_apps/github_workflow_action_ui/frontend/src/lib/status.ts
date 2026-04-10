export type StatusCategory =
  | "success"
  | "failure"
  | "in_progress"
  | "queued"
  | "skipped";

export function getStatusCategory(
  conclusion: string | null | undefined,
  status: string | null | undefined,
): StatusCategory {
  if (conclusion === "success") return "success";
  if (conclusion === "failure") return "failure";
  if (conclusion === "cancelled" || conclusion === "skipped") return "skipped";
  if (status === "in_progress") return "in_progress";
  if (status === "queued" || status === "waiting" || status === "pending")
    return "queued";
  return "skipped";
}

export function getStatusColor(category: StatusCategory): string {
  switch (category) {
    case "success":
      return "text-green-500";
    case "failure":
      return "text-red-500";
    case "in_progress":
      return "text-yellow-500";
    case "queued":
      return "text-indigo-400";
    case "skipped":
      return "text-gray-400";
  }
}

export function getBadgeClasses(category: StatusCategory): string {
  switch (category) {
    case "success":
      return "bg-green-100 text-green-700";
    case "failure":
      return "bg-red-100 text-red-700";
    case "in_progress":
      return "bg-yellow-100 text-yellow-700";
    case "queued":
      return "bg-indigo-100 text-indigo-700";
    case "skipped":
      return "bg-gray-100 text-gray-600";
  }
}
