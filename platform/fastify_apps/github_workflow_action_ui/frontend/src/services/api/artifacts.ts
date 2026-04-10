import { API_BASE } from "@/config";
import { get } from "./client";
import type { ArtifactsListResponse } from "@/types";

export function listArtifacts(
  owner: string,
  repo: string,
  runId: number,
): Promise<ArtifactsListResponse> {
  return get<ArtifactsListResponse>(
    `/repos/${owner}/${repo}/actions/runs/${runId}/artifacts`,
  );
}

/**
 * Returns the proxied download URL for an artifact.
 * Uses the proxy endpoint (not direct GitHub URL) — fixes GAP G5/G12.
 */
export function getArtifactDownloadUrl(
  owner: string,
  repo: string,
  artifactId: number,
): string {
  return `${API_BASE}/repos/${owner}/${repo}/actions/artifacts/${artifactId}/zip`;
}
