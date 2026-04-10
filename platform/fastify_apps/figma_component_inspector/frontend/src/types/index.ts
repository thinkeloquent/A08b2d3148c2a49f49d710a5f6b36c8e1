export interface FigmaNode {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
}

export interface FigmaFile {
  name: string;
  lastModified: string;
  version: string;
  document: FigmaNode;
}

export interface ComponentProperty {
  key: string;
  value: string;
}

export interface NodeDetails {
  node: FigmaNode;
  properties: Record<string, { value: string }>;
}

export interface ImageResponse {
  images: Record<string, string>;
}

export interface FigmaComment {
  id: string;
  message: string;
  created_at: string;
  resolved_at?: string;
  user: {
    handle: string;
    img_url?: string;
  };
}

export interface DesignVariable {
  name: string;
  value: string;
  type: string;
}
