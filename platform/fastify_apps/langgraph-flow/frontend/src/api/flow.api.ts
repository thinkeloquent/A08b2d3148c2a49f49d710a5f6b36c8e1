import type { FlowListItem, FlowVersion } from '@/types/flow.types';

const BASE = '/~/api/langgraph-flow';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`${res.status} ${res.statusText}${body ? ': ' + body : ''}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

/** Convert snake_case API response to camelCase frontend shape. */
function toFlowItem(raw: Record<string, unknown>): FlowListItem {
  return {
    id: raw.id as string,
    name: raw.name as string,
    description: (raw.description as string) ?? undefined,
    nodeCount: (raw.node_count as number) ?? 0,
    edgeCount: (raw.edge_count as number) ?? 0,
    sourceFormat: (raw.source_format as string) ?? 'native',
    createdAt: (raw.created_at as string) ?? '',
    updatedAt: (raw.updated_at as string) ?? '',
    flowData: raw.flow_data as FlowListItem['flowData'],
  };
}

function toFlowVersion(raw: Record<string, unknown>): FlowVersion {
  return {
    id: raw.id as string,
    flowId: (raw.flow_id as string) ?? '',
    version: raw.version as number,
    label: (raw.change_summary as string) ?? undefined,
    flowData: raw.flow_data as FlowVersion['flowData'],
    createdAt: (raw.created_at as string) ?? '',
  };
}

export async function listFlows(): Promise<{ flows: FlowListItem[] }> {
  const data = await request<{ flows: Record<string, unknown>[] }>('/flows');
  return { flows: data.flows.map(toFlowItem) };
}

export async function getFlow(id: string): Promise<FlowListItem> {
  const data = await request<{ flow: Record<string, unknown> }>(`/flows/${id}`);
  return toFlowItem(data.flow);
}

export async function createFlow(data: Partial<FlowListItem>): Promise<FlowListItem> {
  const res = await request<{ flow: Record<string, unknown> }>('/flows', {
    method: 'POST',
    body: JSON.stringify({
      name: data.name,
      description: data.description,
      flow_data: data.flowData,
      source_format: data.sourceFormat,
    }),
  });
  return toFlowItem(res.flow);
}

export async function updateFlow(id: string, data: Partial<FlowListItem>): Promise<FlowListItem> {
  const res = await request<{ flow: Record<string, unknown> }>(`/flows/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      name: data.name,
      description: data.description,
      flow_data: data.flowData,
      source_format: data.sourceFormat,
    }),
  });
  return toFlowItem(res.flow);
}

export async function deleteFlow(id: string): Promise<void> {
  return request(`/flows/${id}`, { method: 'DELETE' });
}

export async function importFlow(json: string, format: string): Promise<FlowListItem> {
  const res = await request<{ flow: Record<string, unknown> }>('/flows/import', {
    method: 'POST',
    body: JSON.stringify({ json, format }),
  });
  return toFlowItem(res.flow);
}

export async function exportFlow(id: string, format: string): Promise<string | object> {
  return request(`/flows/${id}/export?format=${encodeURIComponent(format)}`);
}

export async function getFlowVersions(id: string): Promise<FlowVersion[]> {
  const data = await request<{ versions: Record<string, unknown>[] }>(`/flows/${id}/versions`);
  return data.versions.map(toFlowVersion);
}

export async function restoreFlowVersion(flowId: string, versionId: string): Promise<FlowListItem> {
  const res = await request<{ flow: Record<string, unknown> }>(`/flows/${flowId}/restore/${versionId}`, { method: 'POST' });
  return toFlowItem(res.flow);
}
