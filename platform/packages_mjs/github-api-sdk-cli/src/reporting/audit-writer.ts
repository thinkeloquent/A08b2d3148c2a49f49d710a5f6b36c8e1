import fs from "fs/promises";

export interface ApiCallRecord {
  url: string;
  duration: number;
  status: number | string;
  error?: string;
  timestamp: string;
}

/**
 * Write an audit report to disk (debug mode only).
 */
export async function writeAuditReport(
  apiCalls: ApiCallRecord[],
  errors: unknown[],
  config: Record<string, unknown>,
  filePath: string,
  { totalFetched, cancelled }: { totalFetched: number; cancelled: boolean },
): Promise<void> {
  const audit = {
    apiCalls,
    errors,
    configuration: config,
    generatedAt: new Date().toISOString(),
    totalRecordsFetched: totalFetched,
    cancelled,
  };

  await fs.writeFile(filePath, JSON.stringify(audit, null, 2));
}
