const API_BASE = '/~/api/figma_component_inspector';
const FEATURE_FLAGS_URL = '/~/api/feature-flags/figma_component_inspector';

// ── Feature Options cache ────────────────────────────────────────────────────

export type ImageRenderingType = 'blob' | 'base64' | 'content-type';

interface FeatureOptionsCache {
  imageRenderingType: ImageRenderingType;
  loaded: boolean;
}

const _featureOptions: FeatureOptionsCache = {
  imageRenderingType: 'blob',
  loaded: false,
};

/** Fetch feature options from server (cached after first call). */
export async function loadFeatureOptions(): Promise<FeatureOptionsCache> {
  if (_featureOptions.loaded) return _featureOptions;
  try {
    const resp = await fetch(FEATURE_FLAGS_URL);
    if (resp.ok) {
      const data = await resp.json();
      const renderType = data?.options?.image?.image_rendering_type;
      if (renderType === 'blob' || renderType === 'base64' || renderType === 'content-type') {
        _featureOptions.imageRenderingType = renderType;
      }
    }
  } catch {
    // Fail silently — defaults to 'blob'
  }
  _featureOptions.loaded = true;
  return _featureOptions;
}

export function getImageRenderingType(): ImageRenderingType {
  return _featureOptions.imageRenderingType;
}

/**
 * Load a Figma node image respecting the configured rendering type.
 *
 * Returns { src, cacheStatus, cacheDate } where `src` is ready for <img src>.
 *
 *   blob         — fetch → blob → URL.createObjectURL
 *   base64       — fetch → arrayBuffer → data:image/... URI
 *   content-type — return the proxy URL directly (browser handles caching)
 */
export async function loadImageSrc(
  fileId: string,
  nodeId: string,
  options?: { scale?: number; format?: 'png' | 'jpg' | 'svg' | 'pdf'; bust?: boolean },
): Promise<{ src: string | null; cacheStatus: string | null; cacheDate: string | null; isPlaceholder: boolean }> {
  const scale = options?.scale ?? 2;
  const format = options?.format ?? 'png';
  const bust = options?.bust ?? false;
  const url = getImageProxyUrl(fileId, nodeId, scale, format) + (bust ? '&bust=1' : '');
  const renderType = getImageRenderingType();

  // content-type mode: let the browser fetch and cache via native <img src>
  if (renderType === 'content-type') {
    return { src: url, cacheStatus: 'DIRECT', cacheDate: null, isPlaceholder: false };
  }

  // blob / base64 mode: fetch the binary
  try {
    const resp = await fetch(url);
    if (!resp.ok) return { src: null, cacheStatus: null, cacheDate: null, isPlaceholder: false };

    const cacheStatus = resp.headers.get('X-Cache');
    const cacheDate = resp.headers.get('X-Cache-Date');
    const isPlaceholder = resp.headers.get('X-Placeholder') === 'true';

    if (renderType === 'base64') {
      const buffer = await resp.arrayBuffer();
      const contentType = resp.headers.get('Content-Type') || 'image/png';
      const base64 = btoa(
        new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), ''),
      );
      return { src: `data:${contentType};base64,${base64}`, cacheStatus, cacheDate, isPlaceholder };
    }

    // blob (default)
    const blob = await resp.blob();
    return { src: URL.createObjectURL(blob), cacheStatus, cacheDate, isPlaceholder };
  } catch {
    return { src: null, cacheStatus: null, cacheDate: null, isPlaceholder: false };
  }
}

async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.data !== undefined ? data.data as T : data as T;
}

export async function getFigmaFile(fileId: string) {
  if (!fileId || typeof fileId !== 'string') throw new Error('Invalid fileId');
  return fetchApi(`/figma/files/${encodeURIComponent(fileId)}`);
}

export async function getFileMeta(fileId: string) {
  if (!fileId) throw new Error('Invalid fileId');
  return fetchApi(`/figma/files/${encodeURIComponent(fileId)}/meta`);
}

export async function getComponentImages(
  fileId: string,
  nodeIds: string[],
  scale = 2,
  format: 'jpg' | 'png' | 'svg' | 'pdf' = 'png',
) {
  if (!fileId || !Array.isArray(nodeIds) || nodeIds.length === 0) throw new Error('Invalid parameters');
  const nodeIdsParam = nodeIds.join(',');
  return fetchApi(
    `/figma/images/${encodeURIComponent(fileId)}?nodeIds=${encodeURIComponent(nodeIdsParam)}&scale=${scale}&format=${format}`,
  );
}

/**
 * Returns a proxied image URL that serves from S3 cache (or fetches + caches from Figma).
 * Use as an <img src> — the server returns the binary image directly.
 */
export function getImageProxyUrl(
  fileId: string,
  nodeId: string,
  scale = 2,
  format: 'png' | 'jpg' | 'svg' | 'pdf' = 'png',
): string {
  return `${API_BASE}/image/${encodeURIComponent(fileId)}/${encodeURIComponent(nodeId)}?scale=${scale}&format=${format}`;
}

export async function getFileVariables(fileId: string) {
  if (!fileId) throw new Error('Invalid fileId');
  return fetchApi(`/figma/variables/${encodeURIComponent(fileId)}`);
}

export async function getTokenExport(fileId: string): Promise<{
  nodes: Record<string, any>;
  meta: { fileName: string; lastModified: string; version: string; nodeCount: number; nodesWithTokens: number };
}> {
  if (!fileId) throw new Error('Invalid fileId');
  return fetchApi(`/figma/token-export/${encodeURIComponent(fileId)}`);
}

export interface FileSchemaSummary {
  census: Array<{ nodeType: string; count: number; percentage: number }>;
  depthMap: Array<{
    pageName: string;
    pageId: string;
    maxDepth: number;
    avgDepth: number;
    totalNodes: number;
    depthDistribution?: Array<{ depth: number; count: number }>;
  }>;
  propertyCoverage: Array<{ nodeType: string; properties: Record<string, number> }>;
  tokenAdherence: Array<{
    nodeType: string;
    categories: Record<string, { tokenBound: number; hardCoded: number; tokenizationPercent: number }>;
  }>;
  linkage: {
    masters: number;
    instances: number;
    suspectedDetached: number;
    orphanedSets: number;
    snowflakes?: number;
  };
  detachedInstances: Array<{
    nodeId: string;
    nodeName: string;
    pageName: string;
    matchedComponentId: string | null;
    matchedComponentName: string | null;
    confidence: number;
    signals: { structural: number; naming: number; style: number };
  }>;
  snowflakes: Array<{
    nodeId: string;
    nodeName: string;
    pageName: string;
    matchedComponentId: string | null;
    matchedComponentName: string | null;
    confidence: number;
    signals: { structural: number; naming: number; style: number };
  }>;
  totals: {
    nodes: number;
    uniqueNodeTypes: number;
    pages: number;
    maxDepth: number;
    avgDepth: number;
    medianDepth: number;
  };
}

export async function getFileSchema(fileId: string): Promise<FileSchemaSummary> {
  if (!fileId) throw new Error('Invalid fileId');
  return fetchApi(`/schema/${encodeURIComponent(fileId)}`);
}

export async function getNodeDetails(fileId: string, nodeId: string) {
  if (!fileId || !nodeId) throw new Error('Invalid parameters');
  return fetchApi(`/figma/node/${encodeURIComponent(fileId)}/${encodeURIComponent(nodeId)}`);
}

export async function getComments(fileId: string, nodeId?: string) {
  if (!fileId) throw new Error('Invalid fileId');

  const params = new URLSearchParams({ fileId });
  if (nodeId) {
    params.append('nodeId', nodeId);
  }

  return fetchApi(`/comments?${params.toString()}`);
}

export async function createComment(data: {
  fileId: string;
  nodeId?: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  text: string;
  priority?: 'high' | 'normal' | 'low';
  position?: { x: number; y: number };
}) {
  return fetchApi('/comments', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateComment(
  commentId: number,
  data: {
    text?: string;
    priority?: 'high' | 'normal' | 'low';
    resolved?: boolean;
    position?: { x: number; y: number };
  }
) {
  return fetchApi(`/comments/${commentId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteComment(commentId: number) {
  return fetchApi(`/comments/${commentId}`, {
    method: 'DELETE',
  });
}

// ── Pinned Nodes ──

export interface PinData {
  id: string;
  fileId: string;
  nodeId: string;
  nodeName: string | null;
  nodeType: string | null;
  tags: string[];
  description: string | null;
  nodePath: string | null;
  pinnedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function getPins(fileId: string, nodeId?: string): Promise<PinData[]> {
  if (!fileId) throw new Error('Invalid fileId');
  const params = new URLSearchParams({ fileId });
  if (nodeId) params.append('nodeId', nodeId);
  return fetchApi(`/pins?${params.toString()}`);
}

export async function createPin(data: {
  fileId: string;
  nodeId: string;
  nodeName?: string;
  nodeType?: string;
  tags?: string[];
  description?: string;
  nodePath?: string;
  pinnedBy?: string;
}): Promise<PinData> {
  return fetchApi('/pins', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updatePin(
  pinId: string,
  data: { tags?: string[]; description?: string },
): Promise<PinData> {
  return fetchApi(`/pins/${pinId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deletePin(pinId: string) {
  return fetchApi(`/pins/${pinId}`, { method: 'DELETE' });
}

// ── Node Labels ──

export interface NodeLabelData {
  id: string;
  fileId: string;
  nodeId: string;
  displayName: string;
  createdAt: string;
  updatedAt: string;
}

export async function getNodeLabels(fileId: string): Promise<NodeLabelData[]> {
  if (!fileId) throw new Error('Invalid fileId');
  return fetchApi(`/node-labels?fileId=${encodeURIComponent(fileId)}`);
}

export async function upsertNodeLabel(data: {
  fileId: string;
  nodeId: string;
  displayName: string;
}): Promise<NodeLabelData | null> {
  return fetchApi('/node-labels', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteNodeLabel(labelId: string) {
  return fetchApi(`/node-labels/${labelId}`, { method: 'DELETE' });
}

// ── Component Atlas ──

export async function getComponentAtlas(fileId: string) {
  if (!fileId) throw new Error('Invalid fileId');
  return fetchApi(`/schema/${encodeURIComponent(fileId)}/component-atlas`);
}

export async function createCommentReply(
  commentId: number,
  data: {
    userId: string;
    userName: string;
    userAvatar?: string;
    text: string;
  }
) {
  return fetchApi(`/comments/${commentId}/replies`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
