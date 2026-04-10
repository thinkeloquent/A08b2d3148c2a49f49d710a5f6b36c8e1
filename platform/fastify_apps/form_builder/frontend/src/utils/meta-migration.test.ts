import { describe, it, expect } from 'vitest';
import {
  migrateLegacyMetaComponent,
  downgradeMetaComponent,
  migrateMetaComponents,
  migratePageMetadata,
  migrateFormMetadata,
  detectMetadataVersion,
  needsMigration,
  createLazyMigrator,
  isLegacyType,
  isV2Type,
  isDowngradableV2Type,
  LEGACY_TO_V2_TYPE_MAP,
  V2_TO_LEGACY_TYPE_MAP,
  MigratedMetaComponent,
} from './meta-migration';
import type {
  MetaComponent,
  GroupingMetaComponent,
  SectionMetaComponent,
  ConditionalMetaComponent,
  ValidationMetaComponent,
  FormMetadata,
  PageMetadata,
} from '../types/meta-components';

// ==========================================================================
// TEST DATA GENERATORS
// ==========================================================================

function createLegacyGrouping(): GroupingMetaComponent {
  return {
    id: 'meta-group-1',
    name: 'Test Group',
    pageId: 'page-1',
    type: 'grouping',
    childElements: [
      {
        id: 'child-1',
        type: 'text',
        label: 'Child Field',
      },
    ],
    childLayout: [
      {
        i: 'child-1',
        x: 0,
        y: 0,
        w: 12,
        h: 2,
        minW: 2,
        minH: 2,
      },
    ],
  };
}

function createLegacySection(): SectionMetaComponent {
  return {
    id: 'meta-section-1',
    name: 'Test Section',
    pageId: 'page-1',
    type: 'section',
    title: 'Section Title',
    collapsible: true,
    childElements: [],
    childLayout: [],
  };
}

function createLegacyConditional(): ConditionalMetaComponent {
  return {
    id: 'meta-cond-1',
    name: 'Test Conditional',
    pageId: 'page-1',
    type: 'conditional',
    condition: {
      sourceElementId: 'el-source',
      operator: 'equals',
      value: 'yes',
    },
    action: 'show',
    targetElementIds: ['el-target-1', 'el-target-2'],
  };
}

function createLegacyValidation(): ValidationMetaComponent {
  return {
    id: 'meta-val-1',
    name: 'Test Validation',
    pageId: 'page-1',
    type: 'validation',
    rule: {
      ruleType: 'required',
      config: {},
    },
    errorMessage: 'This field is required',
    targetElementIds: ['el-1'],
  };
}

function createV2Grouping(): MigratedMetaComponent {
  return {
    id: 'meta-group-v2',
    name: 'V2 Group',
    pageId: 'page-1',
    type: 'layout:grouping',
    version: '2.0',
    audience: 'builder-facing',
  };
}

function createFormMetadataV1(): FormMetadata {
  return {
    version: '1.0',
    pages: {
      'page-1': {
        pageId: 'page-1',
        metaComponents: [
          createLegacyGrouping() as unknown as MetaComponent,
          createLegacySection() as unknown as MetaComponent,
        ],
        metaLayout: [],
      },
    },
  };
}

function createFormMetadataV2(): FormMetadata {
  return {
    version: '2.0',
    pages: {
      'page-1': {
        pageId: 'page-1',
        metaComponents: [
          createV2Grouping() as unknown as MetaComponent,
        ],
        metaLayout: [],
      },
    },
  };
}

// ==========================================================================
// TYPE GUARD TESTS
// ==========================================================================

describe('Type Guards', () => {
  describe('isLegacyType', () => {
    it('returns true for grouping', () => {
      expect(isLegacyType('grouping')).toBe(true);
    });

    it('returns true for section', () => {
      expect(isLegacyType('section')).toBe(true);
    });

    it('returns true for conditional', () => {
      expect(isLegacyType('conditional')).toBe(true);
    });

    it('returns true for validation', () => {
      expect(isLegacyType('validation')).toBe(true);
    });

    it('returns false for V2 types', () => {
      expect(isLegacyType('layout:grouping')).toBe(false);
      expect(isLegacyType('behavior:flow')).toBe(false);
      expect(isLegacyType('config:guardrail')).toBe(false);
    });

    it('returns false for unknown types', () => {
      expect(isLegacyType('unknown')).toBe(false);
      expect(isLegacyType('')).toBe(false);
    });
  });

  describe('isV2Type', () => {
    it('returns true for namespaced types with colon', () => {
      expect(isV2Type('layout:grouping')).toBe(true);
      expect(isV2Type('layout:section')).toBe(true);
      expect(isV2Type('behavior:flow')).toBe(true);
      expect(isV2Type('config:guardrail')).toBe(true);
      expect(isV2Type('behavior:state')).toBe(true);
      expect(isV2Type('config:static')).toBe(true);
    });

    it('returns false for legacy types', () => {
      expect(isV2Type('grouping')).toBe(false);
      expect(isV2Type('section')).toBe(false);
      expect(isV2Type('conditional')).toBe(false);
    });

    it('returns false for empty or invalid types', () => {
      expect(isV2Type('')).toBe(false);
      expect(isV2Type('unknown')).toBe(false);
    });
  });

  describe('isDowngradableV2Type', () => {
    it('returns true for V2 types with legacy equivalents', () => {
      expect(isDowngradableV2Type('layout:grouping')).toBe(true);
      expect(isDowngradableV2Type('layout:section')).toBe(true);
      expect(isDowngradableV2Type('behavior:flow')).toBe(true);
      expect(isDowngradableV2Type('config:guardrail')).toBe(true);
    });

    it('returns false for V2-only types', () => {
      expect(isDowngradableV2Type('behavior:state')).toBe(false);
      expect(isDowngradableV2Type('behavior:service')).toBe(false);
      expect(isDowngradableV2Type('config:static')).toBe(false);
      expect(isDowngradableV2Type('layout:composite')).toBe(false);
    });

    it('returns false for legacy types', () => {
      expect(isDowngradableV2Type('grouping')).toBe(false);
    });
  });
});

// ==========================================================================
// TYPE MAPPING TESTS
// ==========================================================================

describe('Type Mappings', () => {
  describe('LEGACY_TO_V2_TYPE_MAP', () => {
    it('maps grouping to layout:grouping', () => {
      expect(LEGACY_TO_V2_TYPE_MAP.grouping).toBe('layout:grouping');
    });

    it('maps section to layout:section', () => {
      expect(LEGACY_TO_V2_TYPE_MAP.section).toBe('layout:section');
    });

    it('maps conditional to behavior:flow', () => {
      expect(LEGACY_TO_V2_TYPE_MAP.conditional).toBe('behavior:flow');
    });

    it('maps validation to config:guardrail', () => {
      expect(LEGACY_TO_V2_TYPE_MAP.validation).toBe('config:guardrail');
    });
  });

  describe('V2_TO_LEGACY_TYPE_MAP', () => {
    it('maps layout:grouping to grouping', () => {
      expect(V2_TO_LEGACY_TYPE_MAP['layout:grouping']).toBe('grouping');
    });

    it('maps layout:section to section', () => {
      expect(V2_TO_LEGACY_TYPE_MAP['layout:section']).toBe('section');
    });

    it('maps behavior:flow to conditional', () => {
      expect(V2_TO_LEGACY_TYPE_MAP['behavior:flow']).toBe('conditional');
    });

    it('maps config:guardrail to validation', () => {
      expect(V2_TO_LEGACY_TYPE_MAP['config:guardrail']).toBe('validation');
    });

    it('has reverse mapping for all legacy types', () => {
      Object.entries(LEGACY_TO_V2_TYPE_MAP).forEach(([legacy, v2]) => {
        expect(V2_TO_LEGACY_TYPE_MAP[v2]).toBe(legacy);
      });
    });
  });
});

// ==========================================================================
// INDIVIDUAL COMPONENT MIGRATION TESTS
// ==========================================================================

describe('Component Migration', () => {
  describe('migrateLegacyMetaComponent', () => {
    describe('Grouping Component', () => {
      it('migrates grouping to layout:grouping', () => {
        const legacy = createLegacyGrouping();
        const migrated = migrateLegacyMetaComponent(legacy as unknown as MetaComponent);

        expect(migrated.type).toBe('layout:grouping');
        expect(migrated.id).toBe('meta-group-1');
        expect(migrated.name).toBe('Test Group');
        expect(migrated.pageId).toBe('page-1');
      });

      it('adds V2 fields to grouping', () => {
        const legacy = createLegacyGrouping();
        const migrated = migrateLegacyMetaComponent(legacy as unknown as MetaComponent);

        expect(migrated.version).toBe('2.0');
        expect(migrated.audience).toBe('builder-facing');
        expect((migrated as any).visualStyle).toBe('dashed');
      });

      it('preserves child elements and layout', () => {
        const legacy = createLegacyGrouping();
        const migrated = migrateLegacyMetaComponent(legacy as unknown as MetaComponent);

        expect((migrated as any).childElements).toHaveLength(1);
        expect((migrated as any).childLayout).toHaveLength(1);
      });
    });

    describe('Section Component', () => {
      it('migrates section to layout:section', () => {
        const legacy = createLegacySection();
        const migrated = migrateLegacyMetaComponent(legacy as unknown as MetaComponent);

        expect(migrated.type).toBe('layout:section');
        expect(migrated.version).toBe('2.0');
        expect(migrated.audience).toBe('builder-facing');
      });

      it('maps title to header', () => {
        const legacy = createLegacySection();
        const migrated = migrateLegacyMetaComponent(legacy as unknown as MetaComponent);

        expect((migrated as any).header).toBe('Section Title');
      });

      it('maps collapsible to isCollapsible', () => {
        const legacy = createLegacySection();
        const migrated = migrateLegacyMetaComponent(legacy as unknown as MetaComponent);

        expect((migrated as any).isCollapsible).toBe(true);
        expect((migrated as any).isCollapsed).toBe(false);
      });
    });

    describe('Conditional Component', () => {
      it('migrates conditional to behavior:flow', () => {
        const legacy = createLegacyConditional();
        const migrated = migrateLegacyMetaComponent(legacy as unknown as MetaComponent);

        expect(migrated.type).toBe('behavior:flow');
        expect(migrated.version).toBe('2.0');
      });

      it('converts condition to flowSpec', () => {
        const legacy = createLegacyConditional();
        const migrated = migrateLegacyMetaComponent(legacy as unknown as MetaComponent);

        const flowSpec = (migrated as any).flowSpec;
        expect(flowSpec).toBeDefined();
        expect(flowSpec.conditions).toHaveLength(1);
        expect(flowSpec.conditions[0].sourceElementId).toBe('el-source');
        expect(flowSpec.conditions[0].operator).toBe('equals');
        expect(flowSpec.conditions[0].value).toBe('yes');
        expect(flowSpec.conditions[0].action).toBe('show');
        expect(flowSpec.conditions[0].targetElementIds).toEqual(['el-target-1', 'el-target-2']);
      });

      it('sets flowSpec defaults', () => {
        const legacy = createLegacyConditional();
        const migrated = migrateLegacyMetaComponent(legacy as unknown as MetaComponent);

        const flowSpec = (migrated as any).flowSpec;
        expect(flowSpec.defaultAction).toBe('show');
        expect(flowSpec.combineMode).toBe('and');
      });

      it('handles undefined condition', () => {
        const legacy = createLegacyConditional();
        delete (legacy as any).condition;

        const migrated = migrateLegacyMetaComponent(legacy as unknown as MetaComponent);

        const flowSpec = (migrated as any).flowSpec;
        expect(flowSpec.conditions[0].sourceElementId).toBe('');
        expect(flowSpec.conditions[0].operator).toBe('equals');
        expect(flowSpec.conditions[0].value).toBe('');
      });

      it('handles undefined action', () => {
        const legacy = createLegacyConditional();
        delete (legacy as any).action;

        const migrated = migrateLegacyMetaComponent(legacy as unknown as MetaComponent);

        const flowSpec = (migrated as any).flowSpec;
        expect(flowSpec.conditions[0].action).toBe('show');
      });
    });

    describe('Validation Component', () => {
      it('migrates validation to config:guardrail', () => {
        const legacy = createLegacyValidation();
        const migrated = migrateLegacyMetaComponent(legacy as unknown as MetaComponent);

        expect(migrated.type).toBe('config:guardrail');
        expect(migrated.version).toBe('2.0');
      });

      it('converts rule to guardrails array', () => {
        const legacy = createLegacyValidation();
        const migrated = migrateLegacyMetaComponent(legacy as unknown as MetaComponent);

        const guardrails = (migrated as any).guardrails;
        expect(guardrails).toHaveLength(1);
        expect(guardrails[0].label).toBe('Test Validation');
        expect(guardrails[0].message).toBe('This field is required');
        expect(guardrails[0].level).toBe('error');
        expect(guardrails[0].targetElementIds).toEqual(['el-1']);
      });

      it('converts required rule to expression', () => {
        const legacy = createLegacyValidation();
        const migrated = migrateLegacyMetaComponent(legacy as unknown as MetaComponent);

        const guardrails = (migrated as any).guardrails;
        expect(guardrails[0].ruleExpression).toBe("value !== null && value !== ''");
      });

      it('handles undefined rule', () => {
        const legacy = createLegacyValidation();
        delete (legacy as any).rule;

        const migrated = migrateLegacyMetaComponent(legacy as unknown as MetaComponent);

        const guardrails = (migrated as any).guardrails;
        expect(guardrails).toHaveLength(1);
        expect(guardrails[0].ruleExpression).toContain('required');
      });

      it('handles undefined errorMessage', () => {
        const legacy = createLegacyValidation();
        delete (legacy as any).errorMessage;

        const migrated = migrateLegacyMetaComponent(legacy as unknown as MetaComponent);

        const guardrails = (migrated as any).guardrails;
        expect(guardrails[0].message).toBe('Validation failed');
      });

      it('converts minLength rule', () => {
        const legacy = createLegacyValidation();
        legacy.rule = { ruleType: 'minLength', config: { min: 5 } };

        const migrated = migrateLegacyMetaComponent(legacy as unknown as MetaComponent);

        const guardrails = (migrated as any).guardrails;
        expect(guardrails[0].ruleExpression).toBe('value.length >= 5');
      });

      it('converts maxLength rule', () => {
        const legacy = createLegacyValidation();
        legacy.rule = { ruleType: 'maxLength', config: { max: 100 } };

        const migrated = migrateLegacyMetaComponent(legacy as unknown as MetaComponent);

        const guardrails = (migrated as any).guardrails;
        expect(guardrails[0].ruleExpression).toBe('value.length <= 100');
      });

      it('converts pattern rule', () => {
        const legacy = createLegacyValidation();
        legacy.rule = { ruleType: 'pattern', config: { pattern: '^[A-Z]+$' } };

        const migrated = migrateLegacyMetaComponent(legacy as unknown as MetaComponent);

        const guardrails = (migrated as any).guardrails;
        expect(guardrails[0].ruleExpression).toBe('/^[A-Z]+$/.test(value)');
      });

      it('converts range rule', () => {
        const legacy = createLegacyValidation();
        legacy.rule = { ruleType: 'range', config: { min: 10, max: 50 } };

        const migrated = migrateLegacyMetaComponent(legacy as unknown as MetaComponent);

        const guardrails = (migrated as any).guardrails;
        expect(guardrails[0].ruleExpression).toBe('value >= 10 && value <= 50');
      });

      it('handles unknown rule type', () => {
        const legacy = createLegacyValidation();
        legacy.rule = { ruleType: 'custom', config: { foo: 'bar' } };

        const migrated = migrateLegacyMetaComponent(legacy as unknown as MetaComponent);

        const guardrails = (migrated as any).guardrails;
        expect(guardrails[0].ruleExpression).toContain('custom');
      });
    });

    describe('Already V2 Components', () => {
      it('returns V2 components unchanged', () => {
        const v2 = createV2Grouping();
        const result = migrateLegacyMetaComponent(v2 as unknown as MetaComponent);

        expect(result.type).toBe('layout:grouping');
        expect(result.id).toBe('meta-group-v2');
      });

      it('returns unknown type components unchanged', () => {
        const unknown: any = {
          id: 'meta-unknown',
          name: 'Unknown',
          pageId: 'page-1',
          type: 'custom:unknown',
        };

        const result = migrateLegacyMetaComponent(unknown);

        expect(result.type).toBe('custom:unknown');
      });
    });
  });

  describe('downgradeMetaComponent', () => {
    it('downgrades layout:grouping to grouping', () => {
      const v2 = createV2Grouping();
      const downgraded = downgradeMetaComponent(v2);

      expect(downgraded).not.toBeNull();
      expect(downgraded!.type).toBe('grouping');
      expect(downgraded!.id).toBe('meta-group-v2');
    });

    it('removes version and audience fields', () => {
      const v2 = createV2Grouping();
      const downgraded = downgradeMetaComponent(v2);

      expect(downgraded!.version).toBeUndefined();
      expect(downgraded!.audience).toBeUndefined();
    });

    it('downgrades layout:section to section', () => {
      const v2: MigratedMetaComponent = {
        id: 'meta-sec',
        name: 'Section',
        pageId: 'page-1',
        type: 'layout:section',
        version: '2.0',
      };

      const downgraded = downgradeMetaComponent(v2);

      expect(downgraded!.type).toBe('section');
    });

    it('downgrades behavior:flow to conditional', () => {
      const v2: MigratedMetaComponent = {
        id: 'meta-flow',
        name: 'Flow',
        pageId: 'page-1',
        type: 'behavior:flow',
        version: '2.0',
      };

      const downgraded = downgradeMetaComponent(v2);

      expect(downgraded!.type).toBe('conditional');
    });

    it('downgrades config:guardrail to validation', () => {
      const v2: MigratedMetaComponent = {
        id: 'meta-guard',
        name: 'Guardrail',
        pageId: 'page-1',
        type: 'config:guardrail',
        version: '2.0',
      };

      const downgraded = downgradeMetaComponent(v2);

      expect(downgraded!.type).toBe('validation');
    });

    it('returns null for V2-only types', () => {
      const v2Only: MigratedMetaComponent = {
        id: 'meta-state',
        name: 'State',
        pageId: 'page-1',
        type: 'behavior:state',
        version: '2.0',
      };

      const downgraded = downgradeMetaComponent(v2Only);

      expect(downgraded).toBeNull();
    });

    it('returns null for config:static', () => {
      const v2Static: MigratedMetaComponent = {
        id: 'meta-static',
        name: 'Static',
        pageId: 'page-1',
        type: 'config:static',
        version: '2.0',
      };

      const downgraded = downgradeMetaComponent(v2Static);

      expect(downgraded).toBeNull();
    });
  });
});

// ==========================================================================
// BULK MIGRATION TESTS
// ==========================================================================

describe('Bulk Migration', () => {
  describe('migrateMetaComponents', () => {
    it('migrates array of components', () => {
      const components = [
        createLegacyGrouping() as unknown as MetaComponent,
        createLegacySection() as unknown as MetaComponent,
        createLegacyConditional() as unknown as MetaComponent,
      ];

      const migrated = migrateMetaComponents(components);

      expect(migrated).toHaveLength(3);
      expect(migrated[0].type).toBe('layout:grouping');
      expect(migrated[1].type).toBe('layout:section');
      expect(migrated[2].type).toBe('behavior:flow');
    });

    it('handles empty array', () => {
      const migrated = migrateMetaComponents([]);

      expect(migrated).toEqual([]);
    });

    it('handles mixed legacy and V2 components', () => {
      const components = [
        createLegacyGrouping() as unknown as MetaComponent,
        createV2Grouping() as unknown as MetaComponent,
      ];

      const migrated = migrateMetaComponents(components);

      expect(migrated).toHaveLength(2);
      expect(migrated[0].type).toBe('layout:grouping');
      expect(migrated[1].type).toBe('layout:grouping');
    });
  });

  describe('migratePageMetadata', () => {
    it('migrates page metadata', () => {
      const page: PageMetadata = {
        pageId: 'page-1',
        metaComponents: [
          createLegacyGrouping() as unknown as MetaComponent,
          createLegacySection() as unknown as MetaComponent,
        ],
        metaLayout: [],
      };

      const migrated = migratePageMetadata(page);

      expect(migrated.pageId).toBe('page-1');
      expect(migrated.metaComponents).toHaveLength(2);
      expect(migrated.metaComponents[0].type).toBe('layout:grouping');
      expect(migrated.metaComponents[1].type).toBe('layout:section');
    });

    it('preserves metaLayout', () => {
      const page: PageMetadata = {
        pageId: 'page-1',
        metaComponents: [],
        metaLayout: [
          { id: 'meta-1', x: 0, y: 0, w: 12, h: 6, static: false },
        ],
      };

      const migrated = migratePageMetadata(page);

      expect(migrated.metaLayout).toHaveLength(1);
      expect(migrated.metaLayout[0].id).toBe('meta-1');
    });
  });

  describe('migrateFormMetadata', () => {
    it('migrates form metadata to V2', () => {
      const metadata = createFormMetadataV1();
      const migrated = migrateFormMetadata(metadata);

      expect(migrated.version).toBe('2.0');
      expect(Object.keys(migrated.pages)).toEqual(['page-1']);
    });

    it('migrates all pages', () => {
      const metadata: FormMetadata = {
        version: '1.0',
        pages: {
          'page-1': {
            pageId: 'page-1',
            metaComponents: [createLegacyGrouping() as unknown as MetaComponent],
            metaLayout: [],
          },
          'page-2': {
            pageId: 'page-2',
            metaComponents: [createLegacySection() as unknown as MetaComponent],
            metaLayout: [],
          },
        },
      };

      const migrated = migrateFormMetadata(metadata);

      expect(Object.keys(migrated.pages)).toEqual(['page-1', 'page-2']);
    });

    it('handles empty pages', () => {
      const metadata: FormMetadata = {
        version: '1.0',
        pages: {},
      };

      const migrated = migrateFormMetadata(metadata);

      expect(migrated.version).toBe('2.0');
      expect(migrated.pages).toEqual({});
    });
  });
});

// ==========================================================================
// VERSION DETECTION TESTS
// ==========================================================================

describe('Version Detection', () => {
  describe('detectMetadataVersion', () => {
    it('detects V1 metadata', () => {
      const metadata = createFormMetadataV1();
      const version = detectMetadataVersion(metadata);

      expect(version).toBe('1.0');
    });

    it('detects V2 metadata', () => {
      const metadata = createFormMetadataV2();
      const version = detectMetadataVersion(metadata);

      expect(version).toBe('2.0');
    });

    it('detects mixed metadata', () => {
      const metadata: FormMetadata = {
        version: '1.0',
        pages: {
          'page-1': {
            pageId: 'page-1',
            metaComponents: [
              createLegacyGrouping() as unknown as MetaComponent,
              createV2Grouping() as unknown as MetaComponent,
            ],
            metaLayout: [],
          },
        },
      };

      const version = detectMetadataVersion(metadata);

      expect(version).toBe('mixed');
    });

    it('handles empty pages', () => {
      const metadata: FormMetadata = {
        version: '1.0',
        pages: {},
      };

      const version = detectMetadataVersion(metadata);

      expect(version).toBe('1.0'); // Default to V1 when no types present
    });

    it('handles pages with no meta-components', () => {
      const metadata: FormMetadata = {
        version: '1.0',
        pages: {
          'page-1': {
            pageId: 'page-1',
            metaComponents: [],
            metaLayout: [],
          },
        },
      };

      const version = detectMetadataVersion(metadata);

      expect(version).toBe('1.0');
    });
  });

  describe('needsMigration', () => {
    it('returns true for V1 metadata', () => {
      const metadata = createFormMetadataV1();

      expect(needsMigration(metadata)).toBe(true);
    });

    it('returns true for mixed metadata', () => {
      const metadata: FormMetadata = {
        version: '1.0',
        pages: {
          'page-1': {
            pageId: 'page-1',
            metaComponents: [
              createLegacyGrouping() as unknown as MetaComponent,
              createV2Grouping() as unknown as MetaComponent,
            ],
            metaLayout: [],
          },
        },
      };

      expect(needsMigration(metadata)).toBe(true);
    });

    it('returns false for V2 metadata', () => {
      const metadata = createFormMetadataV2();

      expect(needsMigration(metadata)).toBe(false);
    });
  });
});

// ==========================================================================
// LAZY MIGRATOR TESTS
// ==========================================================================

describe('Lazy Migrator', () => {
  describe('createLazyMigrator', () => {
    it('migrates V1 metadata', () => {
      const metadata = createFormMetadataV1();
      const migrated = createLazyMigrator(metadata);

      expect(migrated.version).toBe('2.0');
    });

    it('returns V2 metadata unchanged', () => {
      const metadata = createFormMetadataV2();
      const result = createLazyMigrator(metadata);

      expect(result).toBe(metadata); // Same reference
    });

    it('migrates mixed metadata', () => {
      const metadata: FormMetadata = {
        version: '1.0',
        pages: {
          'page-1': {
            pageId: 'page-1',
            metaComponents: [
              createLegacyGrouping() as unknown as MetaComponent,
            ],
            metaLayout: [],
          },
        },
      };

      const migrated = createLazyMigrator(metadata);

      expect(migrated.version).toBe('2.0');
    });
  });
});

// ==========================================================================
// EDGE CASES
// ==========================================================================

describe('Edge Cases', () => {
  it('handles conditional with all operator types', () => {
    const operators = ['equals', 'notEquals', 'contains', 'isEmpty'] as const;

    operators.forEach(operator => {
      const legacy = createLegacyConditional();
      legacy.condition!.operator = operator;

      const migrated = migrateLegacyMetaComponent(legacy as unknown as MetaComponent);

      const flowSpec = (migrated as any).flowSpec;
      expect(flowSpec.conditions[0].operator).toBe(operator);
    });
  });

  it('handles conditional with all action types', () => {
    const actions = ['show', 'hide', 'enable', 'disable'] as const;

    actions.forEach(action => {
      const legacy = createLegacyConditional();
      legacy.action = action;

      const migrated = migrateLegacyMetaComponent(legacy as unknown as MetaComponent);

      const flowSpec = (migrated as any).flowSpec;
      expect(flowSpec.conditions[0].action).toBe(action);
    });
  });

  it('handles section with collapsible=false', () => {
    const legacy = createLegacySection();
    legacy.collapsible = false;

    const migrated = migrateLegacyMetaComponent(legacy as unknown as MetaComponent);

    expect((migrated as any).isCollapsible).toBe(false);
  });

  it('handles validation with missing config', () => {
    const legacy = createLegacyValidation();
    legacy.rule!.config = undefined as any;

    const migrated = migrateLegacyMetaComponent(legacy as unknown as MetaComponent);

    const guardrails = (migrated as any).guardrails;
    expect(guardrails).toHaveLength(1);
  });

  it('handles component with additional custom fields', () => {
    const legacy: any = {
      ...createLegacyGrouping(),
      customField: 'custom value',
      metadata: { foo: 'bar' },
    };

    const migrated = migrateLegacyMetaComponent(legacy);

    expect((migrated as any).customField).toBe('custom value');
    expect((migrated as any).metadata).toEqual({ foo: 'bar' });
  });

  it('handles locked components', () => {
    const legacy: any = {
      ...createLegacyGrouping(),
      locked: true,
    };

    const migrated = migrateLegacyMetaComponent(legacy);

    expect(migrated.locked).toBe(true);
  });

  it('preserves component ID during migration', () => {
    const legacy = createLegacyGrouping();
    const originalId = legacy.id;

    const migrated = migrateLegacyMetaComponent(legacy as unknown as MetaComponent);

    expect(migrated.id).toBe(originalId);
  });

  it('handles empty targetElementIds', () => {
    const legacy = createLegacyConditional();
    legacy.targetElementIds = [];

    const migrated = migrateLegacyMetaComponent(legacy as unknown as MetaComponent);

    const flowSpec = (migrated as any).flowSpec;
    expect(flowSpec.conditions[0].targetElementIds).toEqual([]);
  });

  it('handles conditional with numeric value', () => {
    const legacy = createLegacyConditional();
    legacy.condition!.value = 42;

    const migrated = migrateLegacyMetaComponent(legacy as unknown as MetaComponent);

    const flowSpec = (migrated as any).flowSpec;
    expect(flowSpec.conditions[0].value).toBe(42);
  });

  it('handles conditional with boolean value', () => {
    const legacy = createLegacyConditional();
    legacy.condition!.value = true;

    const migrated = migrateLegacyMetaComponent(legacy as unknown as MetaComponent);

    const flowSpec = (migrated as any).flowSpec;
    expect(flowSpec.conditions[0].value).toBe(true);
  });
});
