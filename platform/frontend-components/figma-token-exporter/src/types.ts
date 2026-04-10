import type { ReactNode } from 'react';

/** A primitive design token (raw value) */
export interface PrimitiveToken {
  /** Unique ID, e.g. "p.blue.500" */
  id: string;
  /** Display name, e.g. "blue.500" */
  name: string;
  /** Grouping category, e.g. "blue", "spacing" */
  group: string;
  /** Platform-keyed values. "*" = default, "iOS", "Android", etc. */
  value: Record<string, string>;
  /** Token type: "color", "spacing", "radius", "fontSize", "fontWeight", "shadow" */
  type: string;
}

/** A semantic design token (references primitives) */
export interface SemanticToken {
  /** Unique ID, e.g. "s.surface.primary" */
  id: string;
  /** Display name */
  name: string;
  /** Category, e.g. "surface", "text", "border" */
  cat: string;
  /** Theme-keyed references to primitive IDs. "*" = all themes */
  ref: Record<string, string>;
  /** Token type */
  type: string;
}

/** A component-level design token (references semantics) */
export interface ComponentToken {
  /** Unique ID, e.g. "c.btn.primary.bg" */
  id: string;
  /** Display name */
  name: string;
  /** Component name, e.g. "button", "card" */
  comp: string;
  /** Theme-keyed references to semantic/primitive IDs */
  ref: Record<string, string>;
  /** Token type */
  type: string;
}

/** Version history entry */
export interface VersionEntry {
  /** User initials */
  user: string;
  /** Description of the change */
  action: string;
  /** Relative time string */
  time: string;
}

/** Resolved token with tier information */
export interface ResolvedToken extends Record<string, unknown> {
  id: string;
  name: string;
  tier: 'primitive' | 'semantic' | 'component';
  type: string;
}

/** Cascade step in the token resolution chain */
export interface CascadeStep {
  id: string;
  name: string;
  tier: 'primitive' | 'semantic' | 'component';
}

export interface FigmaTokenExporterProps {
  /** Array of primitive tokens */
  primitives: PrimitiveToken[];
  /** Array of semantic tokens */
  semantics: SemanticToken[];
  /** Array of component tokens */
  components: ComponentToken[];
  /** Available theme names (default: ["Light", "Dark"]) */
  themes?: string[];
  /** Available platform names (default: ["Web", "iOS", "Android"]) */
  platforms?: string[];
  /** Initial selected theme */
  defaultTheme?: string;
  /** Initial selected platform */
  defaultPlatform?: string;
  /** Version history entries for the inspector */
  versionHistory?: VersionEntry[];
  /** Called when a token is selected */
  onTokenSelect?: (tokenId: string) => void;
  /** CSS class escape hatch */
  className?: string;
}
