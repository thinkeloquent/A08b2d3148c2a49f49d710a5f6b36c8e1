// =============================================================================
// Meta-Component Migration Utilities
// Handles migration between legacy (V1) and namespaced (V2) meta-component types
// =============================================================================

import type {
  MetaComponent,
  GroupingMetaComponent,
  SectionMetaComponent,
  ConditionalMetaComponent,
  ValidationMetaComponent,
  FormMetadata,
  PageMetadata,
} from "../types/meta-components";

// -----------------------------------------------------------------------------
// Type Mappings
// -----------------------------------------------------------------------------

/**
 * Mapping from legacy types to namespaced V2 types
 */
export const LEGACY_TO_V2_TYPE_MAP = {
  grouping: "layout:grouping",
  section: "layout:section",
  conditional: "behavior:flow",
  validation: "config:guardrail",
} as const;

/**
 * Mapping from V2 namespaced types back to legacy types
 */
export const V2_TO_LEGACY_TYPE_MAP = {
  "layout:grouping": "grouping",
  "layout:section": "section",
  "behavior:flow": "conditional",
  "config:guardrail": "validation",
} as const;

// Type helpers
export type V2MetaComponentType =
  | "layout:grouping"
  | "layout:section"
  | "layout:blueprint_meta"
  | "layout:composite"
  | "config:static"
  | "config:guardrail"
  | "config:specification"
  | "behavior:higher-order"
  | "behavior:state"
  | "behavior:flow"
  | "behavior:service";

export type MigratableLegacyType = keyof typeof LEGACY_TO_V2_TYPE_MAP;
export type MigratableV2Type = keyof typeof V2_TO_LEGACY_TYPE_MAP;

// -----------------------------------------------------------------------------
// Type Guards
// -----------------------------------------------------------------------------

/**
 * Check if a type is a legacy (V1) type
 */
export function isLegacyType(type: string): type is MigratableLegacyType {
  return type in LEGACY_TO_V2_TYPE_MAP;
}

/**
 * Check if a type is a namespaced (V2) type
 */
export function isV2Type(type: string): type is V2MetaComponentType {
  return type.includes(":");
}

/**
 * Check if a V2 type can be downgraded to legacy
 */
export function isDowngradableV2Type(type: string): type is MigratableV2Type {
  return type in V2_TO_LEGACY_TYPE_MAP;
}

// -----------------------------------------------------------------------------
// Individual Component Migration
// -----------------------------------------------------------------------------

/**
 * Migrated component - base meta-component with additional V2 fields
 */
export interface MigratedMetaComponent {
  id: string;
  type: string;
  name: string;
  pageId: string;
  locked?: boolean;
  version?: string;
  audience?: string;
  [key: string]: unknown;
}

/**
 * Migrate a legacy meta-component to V2 format
 * Returns the component with the V2 type and additional migration fields
 */
export function migrateLegacyMetaComponent(
  legacy: MetaComponent
): MigratedMetaComponent {
  const legacyType = legacy.type as string;
  const v2Type = LEGACY_TO_V2_TYPE_MAP[legacyType as MigratableLegacyType];

  if (!v2Type) {
    // Already V2 or unknown type - return as-is
    return legacy as unknown as MigratedMetaComponent;
  }

  // Type-specific migrations
  switch (legacyType) {
    case "grouping":
      return migrateGroupingComponent(legacy as GroupingMetaComponent, v2Type);

    case "section":
      return migrateSectionComponent(legacy as SectionMetaComponent, v2Type);

    case "conditional":
      return migrateConditionalComponent(legacy as ConditionalMetaComponent, v2Type);

    case "validation":
      return migrateValidationComponent(legacy as ValidationMetaComponent, v2Type);

    default:
      return {
        ...(legacy as unknown as Record<string, unknown>),
        type: v2Type,
      } as MigratedMetaComponent;
  }
}

/**
 * Migrate grouping component
 */
function migrateGroupingComponent(
  legacy: GroupingMetaComponent,
  v2Type: string
): MigratedMetaComponent {
  const base = legacy as unknown as Record<string, unknown>;
  return {
    ...base,
    type: v2Type,
    version: "2.0",
    audience: "builder-facing",
    constraints: undefined,
    visualStyle: "dashed",
  } as unknown as MigratedMetaComponent;
}

/**
 * Migrate section component
 */
function migrateSectionComponent(
  legacy: SectionMetaComponent,
  v2Type: string
): MigratedMetaComponent {
  const base = legacy as unknown as Record<string, unknown>;
  return {
    ...base,
    type: v2Type,
    version: "2.0",
    audience: "builder-facing",
    header: legacy.title,
    isCollapsed: false,
    isCollapsible: legacy.collapsible,
    constraints: undefined,
  } as unknown as MigratedMetaComponent;
}

/**
 * Migrate conditional component to behavior:flow
 */
function migrateConditionalComponent(
  legacy: ConditionalMetaComponent,
  v2Type: string
): MigratedMetaComponent {
  // Handle case where condition might be undefined
  const condition = legacy.condition ?? {
    sourceElementId: "",
    operator: "equals" as const,
    value: "",
  };
  const action = legacy.action ?? "show";

  // Convert single condition to flow spec format
  const flowSpec = {
    conditions: [
      {
        id: `cond-${legacy.id}`,
        sourceElementId: condition.sourceElementId,
        operator: migrateOperator(condition.operator),
        value: condition.value as string | number | boolean,
        action: migrateAction(action),
        targetElementIds: legacy.targetElementIds,
      },
    ],
    defaultAction: "show" as const,
    combineMode: "and" as const,
  };

  const base = legacy as unknown as Record<string, unknown>;
  return {
    ...base,
    type: v2Type,
    version: "2.0",
    audience: "builder-facing",
    flowSpec,
  } as unknown as MigratedMetaComponent;
}

/**
 * Migrate validation component to config:guardrail
 */
function migrateValidationComponent(
  legacy: ValidationMetaComponent,
  v2Type: string
): MigratedMetaComponent {
  // Handle case where rule might be undefined
  const rule = legacy.rule ?? {
    ruleType: "required",
    config: {},
  };

  // Convert single rule to guardrails array format
  const guardrails = [
    {
      id: `guard-${legacy.id}`,
      label: legacy.name,
      message: legacy.errorMessage ?? "Validation failed",
      level: "error" as const,
      ruleExpression: convertRuleToExpression(rule),
      targetElementIds: legacy.targetElementIds,
      tags: [],
    },
  ];

  const base = legacy as unknown as Record<string, unknown>;
  return {
    ...base,
    type: v2Type,
    version: "2.0",
    audience: "builder-facing",
    guardrails,
  } as unknown as MigratedMetaComponent;
}

// -----------------------------------------------------------------------------
// Helper Functions for Migration
// -----------------------------------------------------------------------------

/**
 * Migrate legacy operator to V2 operator
 */
function migrateOperator(
  legacyOp: "equals" | "notEquals" | "contains" | "isEmpty"
): "equals" | "notEquals" | "contains" | "isEmpty" | "isNotEmpty" {
  return legacyOp;
}

/**
 * Migrate legacy action to V2 action
 */
function migrateAction(
  legacyAction: "show" | "hide" | "enable" | "disable"
): "show" | "hide" | "disable" | "enable" {
  return legacyAction;
}

/**
 * Convert legacy rule object to expression string
 */
function convertRuleToExpression(rule: {
  ruleType: string;
  config: Record<string, unknown>;
}): string {
  // Basic conversion - can be enhanced based on rule types
  switch (rule.ruleType) {
    case "required":
      return "value !== null && value !== ''";
    case "minLength":
      return `value.length >= ${rule.config.min || 0}`;
    case "maxLength":
      return `value.length <= ${rule.config.max || 255}`;
    case "pattern":
      return `/${rule.config.pattern || ".*"}/.test(value)`;
    case "range":
      return `value >= ${rule.config.min || 0} && value <= ${rule.config.max || 100}`;
    default:
      return JSON.stringify(rule);
  }
}

// -----------------------------------------------------------------------------
// Downgrade Migration (V2 -> Legacy)
// -----------------------------------------------------------------------------

/**
 * Downgrade a V2 meta-component to legacy format
 * Returns null if the V2 type has no legacy equivalent
 */
export function downgradeMetaComponent(
  v2Component: MigratedMetaComponent
): MigratedMetaComponent | null {
  if (!isDowngradableV2Type(v2Component.type)) {
    // No legacy equivalent for this type
    return null;
  }

  const legacyType = V2_TO_LEGACY_TYPE_MAP[v2Component.type as MigratableV2Type];

  // Remove V2-specific fields and set legacy type
  const { version, audience, ...rest } = v2Component;
  void version;
  void audience;

  return {
    ...rest,
    type: legacyType,
  };
}

// -----------------------------------------------------------------------------
// Bulk Migration Functions
// -----------------------------------------------------------------------------

/**
 * Migrate an array of meta-components
 */
export function migrateMetaComponents(
  components: MetaComponent[]
): MigratedMetaComponent[] {
  return components.map(migrateLegacyMetaComponent);
}

/**
 * Migrate page metadata
 */
export function migratePageMetadata(
  page: PageMetadata
): PageMetadata & { metaComponents: MigratedMetaComponent[] } {
  return {
    ...page,
    metaComponents: migrateMetaComponents(page.metaComponents) as unknown as MetaComponent[],
  } as PageMetadata & { metaComponents: MigratedMetaComponent[] };
}

/**
 * Migrate full form metadata
 */
export function migrateFormMetadata(
  metadata: FormMetadata
): FormMetadata {
  const migratedPages: Record<string, PageMetadata> = {};

  for (const [pageId, page] of Object.entries(metadata.pages)) {
    migratedPages[pageId] = migratePageMetadata(page) as unknown as PageMetadata;
  }

  return {
    version: "2.0",
    pages: migratedPages,
  };
}

// -----------------------------------------------------------------------------
// Version Detection
// -----------------------------------------------------------------------------

/**
 * Detect the version of form metadata
 */
export function detectMetadataVersion(
  metadata: FormMetadata
): "1.0" | "2.0" | "mixed" {
  const allTypes = Object.values(metadata.pages).flatMap((page) =>
    page.metaComponents.map((c) => c.type as string)
  );

  const hasLegacy = allTypes.some(isLegacyType);
  const hasV2 = allTypes.some(isV2Type);

  if (hasLegacy && hasV2) return "mixed";
  if (hasV2) return "2.0";
  return "1.0";
}

/**
 * Check if migration is needed
 */
export function needsMigration(metadata: FormMetadata): boolean {
  const version = detectMetadataVersion(metadata);
  return version === "1.0" || version === "mixed";
}

// -----------------------------------------------------------------------------
// Lazy Migration Wrapper
// -----------------------------------------------------------------------------

/**
 * Lazily migrate metadata on access
 * Returns a proxy that migrates components on first access
 */
export function createLazyMigrator(
  metadata: FormMetadata
): FormMetadata {
  if (!needsMigration(metadata)) {
    return metadata;
  }

  // Return migrated copy
  return migrateFormMetadata(metadata);
}
