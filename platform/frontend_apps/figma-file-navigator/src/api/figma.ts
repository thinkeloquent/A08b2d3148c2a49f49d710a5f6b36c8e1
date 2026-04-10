/**
 * Figma API client — talks to the local proxy at
 * /~/api/rest/02-01-2026/providers/figma_api/v1/...
 */

const API_PREFIX = '/~/api/rest/02-01-2026/providers/figma_api/v1';

/* ─── Figma API response types ─── */

export interface FigmaColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface FigmaPaint {
  type: string;
  color?: FigmaColor;
  opacity?: number;
  visible?: boolean;
  blendMode?: string;
  gradientHandlePositions?: Array<{ x: number; y: number }>;
  gradientStops?: Array<{ position: number; color: FigmaColor }>;
  scaleMode?: string;
  imageRef?: string;
}

export interface FigmaEffect {
  type: string;
  visible?: boolean;
  radius?: number;
  color?: FigmaColor;
  blendMode?: string;
  offset?: { x: number; y: number };
  spread?: number;
}

export interface FigmaConstraint {
  type: string;
  value: number;
}

export interface FigmaLayoutGrid {
  pattern: string;
  sectionSize: number;
  visible?: boolean;
  color?: FigmaColor;
  alignment?: string;
  gutterSize?: number;
  offset?: number;
  count?: number;
}

export interface FigmaTypeStyle {
  fontFamily?: string;
  fontPostScriptName?: string;
  fontWeight?: number;
  fontSize?: number;
  lineHeightPx?: number;
  lineHeightPercent?: number;
  lineHeightUnit?: string;
  letterSpacing?: number;
  textAlignHorizontal?: string;
  textAlignVertical?: string;
  textDecoration?: string;
  textCase?: string;
}

export interface FigmaNode {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
  visible?: boolean;
  opacity?: number;
  blendMode?: string;
  absoluteBoundingBox?: { x: number; y: number; width: number; height: number };
  absoluteRenderBounds?: { x: number; y: number; width: number; height: number };
  constraints?: { vertical: string; horizontal: string };
  fills?: FigmaPaint[];
  strokes?: FigmaPaint[];
  strokeWeight?: number;
  strokeAlign?: string;
  strokeDashes?: number[];
  effects?: FigmaEffect[];
  cornerRadius?: number;
  rectangleCornerRadii?: [number, number, number, number];
  layoutMode?: string;
  primaryAxisSizingMode?: string;
  counterAxisSizingMode?: string;
  primaryAxisAlignItems?: string;
  counterAxisAlignItems?: string;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  itemSpacing?: number;
  layoutGrids?: FigmaLayoutGrid[];
  clipsContent?: boolean;
  characters?: string;
  style?: FigmaTypeStyle;
  componentId?: string;
  componentProperties?: Record<string, { type: string; value: unknown; preferredValues?: unknown[] }>;
  styles?: Record<string, string>;
  boundVariables?: Record<string, unknown>;
  exportSettings?: Array<{ suffix: string; format: string; constraint: FigmaConstraint }>;
}

export interface FigmaFileResponse {
  name: string;
  lastModified: string;
  version: string;
  document: FigmaNode;
  schemaVersion: number;
}

export interface FigmaFileNodesResponse {
  name: string;
  lastModified: string;
  nodes: Record<string, { document: FigmaNode }>;
}

export interface FigmaComponent {
  key: string;
  name: string;
  description: string;
  node_id: string;
  containing_frame?: { name: string; nodeId: string };
}

export interface FigmaFileComponentsResponse {
  meta: { components: FigmaComponent[] };
}

export interface FigmaVersion {
  id: string;
  created_at: string;
  label: string;
  description: string;
  user: { handle: string; img_url: string };
}

export interface FigmaFileVersionsResponse {
  versions: FigmaVersion[];
}

export interface FigmaVariable {
  id: string;
  name: string;
  key: string;
  variableCollectionId: string;
  resolvedType: string;
  valuesByMode: Record<string, unknown>;
  description?: string;
  hiddenFromPublishing?: boolean;
  scopes?: string[];
  codeSyntax?: Record<string, string>;
}

export interface FigmaVariableCollection {
  id: string;
  name: string;
  key: string;
  modes: Array<{ modeId: string; name: string }>;
  defaultModeId: string;
  variableIds: string[];
  hiddenFromPublishing?: boolean;
}

export interface FigmaVariablesResponse {
  meta: {
    variables: Record<string, FigmaVariable>;
    variableCollections: Record<string, FigmaVariableCollection>;
  };
}

export interface FigmaStyle {
  key: string;
  name: string;
  description: string;
  style_type: string;
  node_id: string;
}

export interface FigmaStyleDetailResponse {
  name: string;
  description: string;
  style_type: string;
  node_id: string;
}

/* ─── API functions ─── */

export async function fetchFigmaFile(fileKey: string): Promise<FigmaFileResponse> {
  const res = await fetch(`${API_PREFIX}/files/${encodeURIComponent(fileKey)}`);
  if (!res.ok) throw new Error(`Failed to load Figma file: ${res.status} ${res.statusText}`);
  return res.json();
}

export async function fetchFigmaFileNodes(
  fileKey: string,
  nodeIds: string[],
): Promise<FigmaFileNodesResponse> {
  const ids = nodeIds.map(encodeURIComponent).join(',');
  const res = await fetch(`${API_PREFIX}/files/${encodeURIComponent(fileKey)}/nodes?ids=${ids}`);
  if (!res.ok) throw new Error(`Failed to load file nodes: ${res.status} ${res.statusText}`);
  return res.json();
}

export async function fetchFigmaFileComponents(fileKey: string): Promise<FigmaFileComponentsResponse> {
  const res = await fetch(`${API_PREFIX}/files/${encodeURIComponent(fileKey)}/components`);
  if (!res.ok) throw new Error(`Failed to load components: ${res.status} ${res.statusText}`);
  return res.json();
}

export async function fetchFigmaFileVersions(fileKey: string): Promise<FigmaFileVersionsResponse> {
  const res = await fetch(`${API_PREFIX}/files/${encodeURIComponent(fileKey)}/versions`);
  if (!res.ok) throw new Error(`Failed to load versions: ${res.status} ${res.statusText}`);
  return res.json();
}

export async function fetchFigmaVariablesLocal(fileKey: string): Promise<FigmaVariablesResponse> {
  const res = await fetch(`${API_PREFIX}/files/${encodeURIComponent(fileKey)}/variables/local`);
  if (!res.ok) throw new Error(`Failed to load variables: ${res.status} ${res.statusText}`);
  return res.json();
}

export async function fetchFigmaVariablesPublished(fileKey: string): Promise<FigmaVariablesResponse> {
  const res = await fetch(`${API_PREFIX}/files/${encodeURIComponent(fileKey)}/variables/published`);
  if (!res.ok) throw new Error(`Failed to load published variables: ${res.status} ${res.statusText}`);
  return res.json();
}

export async function fetchFigmaStyleDetail(styleKey: string): Promise<FigmaStyleDetailResponse> {
  const res = await fetch(`${API_PREFIX}/styles/${encodeURIComponent(styleKey)}`);
  if (!res.ok) throw new Error(`Failed to load style: ${res.status} ${res.statusText}`);
  return res.json();
}

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch('/~/api/rest/02-01-2026/providers/figma_api/health');
    return res.ok;
  } catch {
    return false;
  }
}
