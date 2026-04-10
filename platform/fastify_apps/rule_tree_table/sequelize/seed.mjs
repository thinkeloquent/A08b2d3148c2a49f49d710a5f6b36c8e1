import { sequelize, SCHEMA, RuleTree, RuleItem } from './models/index.mjs';

// ── Field / operator pools ─────────────────────────────────────────
const fields = [
  { field: 'user_id',    dataType: 'string',  operators: ['equals', 'not_equals', 'contains', 'starts_with', 'in'] },
  { field: 'email',      dataType: 'string',  operators: ['equals', 'not_equals', 'contains', 'ends_with', 'regex'] },
  { field: 'age',        dataType: 'number',  operators: ['equals', 'greater_than', 'less_than', 'between', 'greater_or_equal'] },
  { field: 'created_at', dataType: 'date',    operators: ['equals', 'before', 'after', 'between', 'in_last'] },
  { field: 'is_active',  dataType: 'boolean', operators: ['is_true', 'is_false', 'is_null', 'is_not_null'] },
  { field: 'department', dataType: 'string',  operators: ['equals', 'not_equals', 'in', 'not_in', 'contains'] },
  { field: 'salary',     dataType: 'number',  operators: ['equals', 'greater_than', 'less_than', 'between', 'not_between'] },
  { field: 'last_login', dataType: 'date',    operators: ['before', 'after', 'in_last', 'not_in_last', 'is_today'] },
  { field: 'role',       dataType: 'string',  operators: ['equals', 'not_equals', 'in', 'not_in'] },
  { field: 'country',    dataType: 'string',  operators: ['equals', 'not_equals', 'in', 'not_in', 'contains'] },
];

const sampleValues = {
  user_id:    ['USR-001', 'USR-100', 'USR-999', 'admin-*', 'service-*'],
  email:      ['@company.com', '@partner.org', 'admin@', 'noreply@', 'support@'],
  age:        ['18', '21', '25', '30', '40', '50', '65'],
  created_at: ['2024-01-01', '2024-06-15', '2025-01-01', '30', '90'],
  is_active:  ['true', 'false'],
  department: ['Engineering', 'Sales', 'Marketing', 'Finance', 'HR', 'Legal', 'Support', 'Operations'],
  salary:     ['50000', '75000', '100000', '120000', '150000', '200000'],
  last_login: ['2025-01-01', '2025-06-01', '7', '30', '90'],
  role:       ['admin', 'editor', 'viewer', 'manager', 'superadmin', 'analyst'],
  country:    ['USA', 'Canada', 'UK', 'Germany', 'France', 'Japan', 'Australia', 'Brazil', 'India'],
};

const logics = ['AND', 'OR', 'NOT', 'XOR'];
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const coinFlip = (p = 0.5) => Math.random() < p;

let sortCounter = 0;

// ── Helper: create a random condition ──────────────────────────────
async function createCondition(treeId, parentId, opts = {}) {
  const f = pick(fields);
  const op = pick(f.operators);
  const val = pick(sampleValues[f.field]);
  const valueType = coinFlip(0.85) ? 'value' : pick(['field', 'function', 'regex']);
  return RuleItem.create({
    rule_tree_id: treeId,
    parent_id:    parentId,
    type:         'condition',
    sort_order:   sortCounter++,
    enabled:      coinFlip(0.9),
    field:        f.field,
    operator:     op,
    value_type:   opts.valueType ?? valueType,
    value:        opts.value ?? val,
    data_type:    f.dataType,
    description:  opts.description ?? null,
  });
}

// ── Helper: create a group with children ───────────────────────────
async function createGroup(treeId, parentId, name, logic, depth, opts = {}) {
  const group = await RuleItem.create({
    rule_tree_id: treeId,
    parent_id:    parentId,
    type:         'group',
    sort_order:   sortCounter++,
    enabled:      opts.enabled ?? true,
    name,
    logic,
    color:        opts.color ?? null,
    description:  opts.description ?? null,
  });
  return group;
}

// ── Build a realistic enterprise rule tree ─────────────────────────
async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');
    if (process.env.POSTGRES_SCHEMA_EXIST) {
      await sequelize.query(`CREATE SCHEMA IF NOT EXISTS "${SCHEMA}";`);
    }

    // ────────────────────────────────────────────────────────────────
    // Tree: Enterprise Access & Compliance Rules
    // ────────────────────────────────────────────────────────────────
    const tree = await RuleTree.create({
      name: 'Enterprise Access & Compliance Rules',
      description: 'Complex hierarchical rule set with 200+ items across deeply nested groups for stress-testing the rule tree UI',
      is_active: true,
      graph_type: 'conditional_logic',
    });
    const T = tree.id;

    // ── Root group ─────────────────────────────────────────────────
    const root = await createGroup(T, null, 'Root Policy', 'AND', 0, {
      description: 'Top-level policy: all sub-policies must pass',
    });

    // ════════════════════════════════════════════════════════════════
    //  1. User Identity Verification  (depth 1)
    // ════════════════════════════════════════════════════════════════
    const identity = await createGroup(T, root.id, 'User Identity Verification', 'AND', 1);
    await createCondition(T, identity.id, { value: 'USR-*', description: 'Must have a valid user ID prefix' });
    await createCondition(T, identity.id, { value: '@company.com', description: 'Must use company email' });
    await createCondition(T, identity.id);
    await createCondition(T, identity.id);

    //  1.1 MFA Requirements (depth 2)
    const mfa = await createGroup(T, identity.id, 'MFA Requirements', 'OR', 2);
    await createCondition(T, mfa.id);
    await createCondition(T, mfa.id);
    await createCondition(T, mfa.id);

    //  1.2 Account Age Check (depth 2)
    const accountAge = await createGroup(T, identity.id, 'Account Age Check', 'AND', 2);
    await createCondition(T, accountAge.id);
    await createCondition(T, accountAge.id);

    //    1.2.1 Probation Exceptions (depth 3)
    const probation = await createGroup(T, accountAge.id, 'Probation Exceptions', 'OR', 3);
    await createCondition(T, probation.id);
    await createCondition(T, probation.id);
    await createCondition(T, probation.id);
    await createCondition(T, probation.id);

    // ════════════════════════════════════════════════════════════════
    //  2. Geographic Compliance  (depth 1)
    // ════════════════════════════════════════════════════════════════
    const geo = await createGroup(T, root.id, 'Geographic Compliance', 'OR', 1);

    //  2.1 North America (depth 2)
    const northAm = await createGroup(T, geo.id, 'North America', 'OR', 2);
    await createCondition(T, northAm.id, { value: 'USA' });
    await createCondition(T, northAm.id, { value: 'Canada' });

    //    2.1.1 US State Rules (depth 3)
    const usStates = await createGroup(T, northAm.id, 'US State Rules', 'OR', 3);
    const states = ['California', 'New York', 'Texas', 'Florida', 'Washington', 'Illinois', 'Colorado', 'Oregon'];
    for (const state of states) {
      await createCondition(T, usStates.id, { value: state });
    }

    //      2.1.1.1 California Sub-rules (depth 4)
    const cali = await createGroup(T, usStates.id, 'California Specific', 'AND', 4);
    await createCondition(T, cali.id);
    await createCondition(T, cali.id);
    await createCondition(T, cali.id);

    //        2.1.1.1.1 CCPA Data Handling (depth 5)
    const ccpa = await createGroup(T, cali.id, 'CCPA Data Handling', 'AND', 5);
    await createCondition(T, ccpa.id);
    await createCondition(T, ccpa.id);
    await createCondition(T, ccpa.id);
    await createCondition(T, ccpa.id);

    //          2.1.1.1.1.1 Data Retention Tiers (depth 6)
    const retention = await createGroup(T, ccpa.id, 'Data Retention Tiers', 'OR', 6);
    await createCondition(T, retention.id);
    await createCondition(T, retention.id);
    await createCondition(T, retention.id);

    //            2.1.1.1.1.1.1 Archival Policy (depth 7)
    const archival = await createGroup(T, retention.id, 'Archival Policy', 'AND', 7);
    await createCondition(T, archival.id);
    await createCondition(T, archival.id);

    //              2.1.1.1.1.1.1.1 Cold Storage Rules (depth 8)
    const coldStorage = await createGroup(T, archival.id, 'Cold Storage Rules', 'AND', 8);
    await createCondition(T, coldStorage.id);
    await createCondition(T, coldStorage.id);
    await createCondition(T, coldStorage.id);

    //    2.1.2 Canadian Province Rules (depth 3)
    const caProvinces = await createGroup(T, northAm.id, 'Canadian Provinces', 'OR', 3);
    const provinces = ['Ontario', 'Quebec', 'British Columbia', 'Alberta', 'Manitoba'];
    for (const prov of provinces) {
      await createCondition(T, caProvinces.id, { value: prov });
    }

    //  2.2 Europe (depth 2)
    const europe = await createGroup(T, geo.id, 'Europe', 'OR', 2);
    const euCountries = ['UK', 'Germany', 'France'];
    for (const c of euCountries) {
      await createCondition(T, europe.id, { value: c });
    }

    //    2.2.1 GDPR Compliance (depth 3)
    const gdpr = await createGroup(T, europe.id, 'GDPR Compliance', 'AND', 3);
    await createCondition(T, gdpr.id);
    await createCondition(T, gdpr.id);
    await createCondition(T, gdpr.id);
    await createCondition(T, gdpr.id);
    await createCondition(T, gdpr.id);

    //      2.2.1.1 Data Subject Rights (depth 4)
    const dsRights = await createGroup(T, gdpr.id, 'Data Subject Rights', 'AND', 4);
    await createCondition(T, dsRights.id);
    await createCondition(T, dsRights.id);
    await createCondition(T, dsRights.id);

    //      2.2.1.2 Cross-Border Transfer (depth 4)
    const crossBorder = await createGroup(T, gdpr.id, 'Cross-Border Transfer Rules', 'OR', 4);
    await createCondition(T, crossBorder.id);
    await createCondition(T, crossBorder.id);
    await createCondition(T, crossBorder.id);

    //        2.2.1.2.1 Standard Contractual Clauses (depth 5)
    const scc = await createGroup(T, crossBorder.id, 'Standard Contractual Clauses', 'AND', 5);
    await createCondition(T, scc.id);
    await createCondition(T, scc.id);

    //  2.3 Asia Pacific (depth 2)
    const apac = await createGroup(T, geo.id, 'Asia Pacific', 'OR', 2);
    await createCondition(T, apac.id, { value: 'Japan' });
    await createCondition(T, apac.id, { value: 'Australia' });
    await createCondition(T, apac.id, { value: 'India' });

    //    2.3.1 Japan Data Privacy (depth 3)
    const jpPrivacy = await createGroup(T, apac.id, 'Japan APPI Compliance', 'AND', 3);
    await createCondition(T, jpPrivacy.id);
    await createCondition(T, jpPrivacy.id);
    await createCondition(T, jpPrivacy.id);

    // ════════════════════════════════════════════════════════════════
    //  3. Role-Based Access Control  (depth 1)
    // ════════════════════════════════════════════════════════════════
    const rbac = await createGroup(T, root.id, 'Role-Based Access Control', 'OR', 1);

    //  3.1 Admin Access (depth 2)
    const adminAccess = await createGroup(T, rbac.id, 'Admin Access', 'AND', 2);
    await createCondition(T, adminAccess.id, { value: 'admin' });
    await createCondition(T, adminAccess.id, { value: 'superadmin' });
    await createCondition(T, adminAccess.id);
    await createCondition(T, adminAccess.id);

    //    3.1.1 Super Admin Privileges (depth 3)
    const superAdmin = await createGroup(T, adminAccess.id, 'Super Admin Privileges', 'AND', 3);
    await createCondition(T, superAdmin.id);
    await createCondition(T, superAdmin.id);
    await createCondition(T, superAdmin.id);

    //      3.1.1.1 Audit Trail Requirements (depth 4)
    const auditTrail = await createGroup(T, superAdmin.id, 'Audit Trail Requirements', 'AND', 4);
    await createCondition(T, auditTrail.id);
    await createCondition(T, auditTrail.id);
    await createCondition(T, auditTrail.id);
    await createCondition(T, auditTrail.id);

    //  3.2 Editor Access (depth 2)
    const editorAccess = await createGroup(T, rbac.id, 'Editor Access', 'AND', 2);
    await createCondition(T, editorAccess.id, { value: 'editor' });
    await createCondition(T, editorAccess.id);
    await createCondition(T, editorAccess.id);

    //    3.2.1 Content Permissions (depth 3)
    const contentPerms = await createGroup(T, editorAccess.id, 'Content Permissions', 'OR', 3);
    await createCondition(T, contentPerms.id);
    await createCondition(T, contentPerms.id);
    await createCondition(T, contentPerms.id);
    await createCondition(T, contentPerms.id);

    //  3.3 Viewer Access (depth 2)
    const viewerAccess = await createGroup(T, rbac.id, 'Viewer Access', 'AND', 2);
    await createCondition(T, viewerAccess.id, { value: 'viewer' });
    await createCondition(T, viewerAccess.id);

    //  3.4 Manager Access (depth 2)
    const managerAccess = await createGroup(T, rbac.id, 'Manager Access', 'AND', 2);
    await createCondition(T, managerAccess.id, { value: 'manager' });
    await createCondition(T, managerAccess.id);
    await createCondition(T, managerAccess.id);

    //    3.4.1 Team Management Rules (depth 3)
    const teamMgmt = await createGroup(T, managerAccess.id, 'Team Management Rules', 'AND', 3);
    await createCondition(T, teamMgmt.id);
    await createCondition(T, teamMgmt.id);
    await createCondition(T, teamMgmt.id);

    //      3.4.1.1 Hiring Approval Chain (depth 4)
    const hiringApproval = await createGroup(T, teamMgmt.id, 'Hiring Approval Chain', 'AND', 4);
    await createCondition(T, hiringApproval.id);
    await createCondition(T, hiringApproval.id);

    //        3.4.1.1.1 Budget Threshold Rules (depth 5)
    const budgetRules = await createGroup(T, hiringApproval.id, 'Budget Threshold Rules', 'OR', 5);
    await createCondition(T, budgetRules.id, { value: '50000' });
    await createCondition(T, budgetRules.id, { value: '100000' });
    await createCondition(T, budgetRules.id, { value: '200000' });

    // ════════════════════════════════════════════════════════════════
    //  4. Department Rules  (depth 1)
    // ════════════════════════════════════════════════════════════════
    const deptRules = await createGroup(T, root.id, 'Department Rules', 'OR', 1);

    const departments = [
      { name: 'Engineering', logic: 'AND', conditions: 6 },
      { name: 'Sales', logic: 'OR', conditions: 5 },
      { name: 'Marketing', logic: 'AND', conditions: 4 },
      { name: 'Finance', logic: 'AND', conditions: 5 },
      { name: 'HR', logic: 'OR', conditions: 4 },
      { name: 'Legal', logic: 'AND', conditions: 3 },
      { name: 'Support', logic: 'OR', conditions: 5 },
      { name: 'Operations', logic: 'AND', conditions: 4 },
    ];

    for (const dept of departments) {
      const deptGroup = await createGroup(T, deptRules.id, `${dept.name} Policies`, dept.logic, 2);
      for (let i = 0; i < dept.conditions; i++) {
        await createCondition(T, deptGroup.id);
      }

      // Each department gets a sub-group with a few conditions
      const subGroup = await createGroup(T, deptGroup.id, `${dept.name} Exceptions`, 'OR', 3);
      await createCondition(T, subGroup.id);
      await createCondition(T, subGroup.id);
      await createCondition(T, subGroup.id);
    }

    // ════════════════════════════════════════════════════════════════
    //  5. Time-Based Access  (depth 1)
    // ════════════════════════════════════════════════════════════════
    const timeBased = await createGroup(T, root.id, 'Time-Based Access', 'AND', 1);

    //  5.1 Business Hours (depth 2)
    const bizHours = await createGroup(T, timeBased.id, 'Business Hours', 'OR', 2);
    await createCondition(T, bizHours.id);
    await createCondition(T, bizHours.id);
    await createCondition(T, bizHours.id);

    //  5.2 Maintenance Windows (depth 2)
    const maintenance = await createGroup(T, timeBased.id, 'Maintenance Windows', 'NOT', 2);
    await createCondition(T, maintenance.id);
    await createCondition(T, maintenance.id);

    //  5.3 Holiday Schedule (depth 2)
    const holidays = await createGroup(T, timeBased.id, 'Holiday Schedule', 'OR', 2);
    await createCondition(T, holidays.id);
    await createCondition(T, holidays.id);
    await createCondition(T, holidays.id);
    await createCondition(T, holidays.id);

    //    5.3.1 Regional Holidays (depth 3)
    const regionalHolidays = await createGroup(T, holidays.id, 'Regional Holidays', 'OR', 3);
    await createCondition(T, regionalHolidays.id);
    await createCondition(T, regionalHolidays.id);
    await createCondition(T, regionalHolidays.id);

    // ════════════════════════════════════════════════════════════════
    //  6. Security & Threat Detection  (depth 1)
    // ════════════════════════════════════════════════════════════════
    const security = await createGroup(T, root.id, 'Security & Threat Detection', 'AND', 1);

    //  6.1 Rate Limiting (depth 2)
    const rateLimit = await createGroup(T, security.id, 'Rate Limiting', 'OR', 2);
    await createCondition(T, rateLimit.id);
    await createCondition(T, rateLimit.id);
    await createCondition(T, rateLimit.id);
    await createCondition(T, rateLimit.id);

    //  6.2 IP Restrictions (depth 2)
    const ipRestrict = await createGroup(T, security.id, 'IP Restrictions', 'AND', 2);
    await createCondition(T, ipRestrict.id);
    await createCondition(T, ipRestrict.id);
    await createCondition(T, ipRestrict.id);

    //    6.2.1 VPN Requirements (depth 3)
    const vpn = await createGroup(T, ipRestrict.id, 'VPN Requirements', 'OR', 3);
    await createCondition(T, vpn.id);
    await createCondition(T, vpn.id);
    await createCondition(T, vpn.id);

    //      6.2.1.1 VPN Tier Access (depth 4)
    const vpnTier = await createGroup(T, vpn.id, 'VPN Tier Access', 'OR', 4);
    await createCondition(T, vpnTier.id);
    await createCondition(T, vpnTier.id);
    await createCondition(T, vpnTier.id);

    //  6.3 Anomaly Detection (depth 2)
    const anomaly = await createGroup(T, security.id, 'Anomaly Detection', 'AND', 2);
    await createCondition(T, anomaly.id);
    await createCondition(T, anomaly.id);

    //    6.3.1 Behavioral Patterns (depth 3)
    const behavioral = await createGroup(T, anomaly.id, 'Behavioral Patterns', 'OR', 3);
    await createCondition(T, behavioral.id);
    await createCondition(T, behavioral.id);
    await createCondition(T, behavioral.id);
    await createCondition(T, behavioral.id);

    //      6.3.1.1 Login Pattern Analysis (depth 4)
    const loginPatterns = await createGroup(T, behavioral.id, 'Login Pattern Analysis', 'AND', 4);
    await createCondition(T, loginPatterns.id);
    await createCondition(T, loginPatterns.id);
    await createCondition(T, loginPatterns.id);

    //        6.3.1.1.1 Geo-Velocity Check (depth 5)
    const geoVelocity = await createGroup(T, loginPatterns.id, 'Geo-Velocity Check', 'AND', 5);
    await createCondition(T, geoVelocity.id);
    await createCondition(T, geoVelocity.id);

    //          6.3.1.1.1.1 Travel Exception Rules (depth 6)
    const travelExcept = await createGroup(T, geoVelocity.id, 'Travel Exception Rules', 'OR', 6);
    await createCondition(T, travelExcept.id);
    await createCondition(T, travelExcept.id);
    await createCondition(T, travelExcept.id);

    // ════════════════════════════════════════════════════════════════
    //  7. Data Classification  (depth 1)
    // ════════════════════════════════════════════════════════════════
    const dataClass = await createGroup(T, root.id, 'Data Classification', 'OR', 1);

    const classifications = ['Public', 'Internal', 'Confidential', 'Restricted', 'Top Secret'];
    for (const cls of classifications) {
      const clsGroup = await createGroup(T, dataClass.id, `${cls} Data Rules`, 'AND', 2);
      await createCondition(T, clsGroup.id);
      await createCondition(T, clsGroup.id);
      await createCondition(T, clsGroup.id);

      if (cls === 'Restricted' || cls === 'Top Secret') {
        const approval = await createGroup(T, clsGroup.id, `${cls} Approval Chain`, 'AND', 3);
        await createCondition(T, approval.id);
        await createCondition(T, approval.id);
        await createCondition(T, approval.id);
        await createCondition(T, approval.id);

        const escalation = await createGroup(T, approval.id, `${cls} Escalation`, 'OR', 4);
        await createCondition(T, escalation.id);
        await createCondition(T, escalation.id);
      }
    }

    // ════════════════════════════════════════════════════════════════
    //  8. Miscellaneous top-level conditions  (depth 1 — flat)
    // ════════════════════════════════════════════════════════════════
    for (let i = 0; i < 8; i++) {
      await createCondition(T, root.id);
    }

    const tree1Count = sortCounter;
    console.log(`\nTree 1 done: ${tree1Count} rule items.`);

    // ════════════════════════════════════════════════════════════════
    // ════════════════════════════════════════════════════════════════
    //  Tree 2: Stress Test — 500 items, 40 nesting levels
    // ════════════════════════════════════════════════════════════════
    // ════════════════════════════════════════════════════════════════
    sortCounter = 0;

    const tree2 = await RuleTree.create({
      name: 'Stress Test: 500 Items / 40 Deep',
      description: 'Deep-nesting stress test — 500 total rule items with a 40-level chain to validate horizontal scroll, performance, and drag-and-drop at extreme depths',
      is_active: true,
      graph_type: 'conditional_logic',
    });
    const T2 = tree2.id;

    const root2 = await createGroup(T2, null, 'Global Policy Engine', 'AND', 0, {
      description: 'Stress-test root — 40-level deep chain with lateral branches',
    });

    // ── 40-level deep chain ─────────────────────────────────────────
    // Each chain group gets 2 conditions = 40 groups + 80 conditions = 120
    // Plus root = 121 items
    const chainNames = [
      'Auth Gateway',          'Session Validator',     'Token Inspector',       'Credential Verifier',
      'Identity Provider',     'Access Controller',     'Permission Resolver',   'Scope Analyzer',
      'Resource Guard',        'Policy Enforcer',       'Rule Evaluator',        'Condition Matcher',
      'Predicate Engine',      'Expression Parser',     'Logic Processor',       'Data Validator',
      'Schema Checker',        'Format Verifier',       'Type Inspector',        'Constraint Solver',
      'Compliance Auditor',    'Regulation Checker',    'Standard Verifier',     'Protocol Inspector',
      'Certification Guard',   'Network Filter',        'Traffic Analyzer',      'Packet Inspector',
      'Connection Guard',      'Firewall Rule',         'Encryption Verifier',   'Key Validator',
      'Certificate Checker',   'Signature Inspector',   'Hash Verifier',         'Quota Manager',
      'Rate Controller',       'Throttle Inspector',    'Limit Enforcer',        'Capacity Guard',
    ];

    const chain = [root2];
    for (let d = 0; d < 40; d++) {
      const parent = chain[d];
      const g = await createGroup(T2, parent.id, chainNames[d], pick(logics), d + 1);
      chain.push(g);
      await createCondition(T2, g.id);
      await createCondition(T2, g.id);
    }
    // sortCounter = 121

    // ── Wide branches at every 4th depth ────────────────────────────
    // depths 4,8,12,16,20,24,28,32,36,40 = 10 points
    // Each: 2 groups × 5 conditions = 12 items per point = 120 total
    const wideBranchNames = [
      'Override Rules',     'Exception Handling',   'Fallback Logic',       'Edge Cases',
      'Special Conditions', 'Legacy Compat',        'Migration Rules',      'Deprecation Checks',
      'Version Gates',      'Feature Flags',        'A/B Test Rules',       'Canary Policies',
      'Rollback Guards',    'Circuit Breakers',     'Retry Policies',       'Timeout Rules',
      'Backpressure Cfg',   'Bulkhead Isolation',   'Failover Rules',       'Redundancy Checks',
    ];
    let wideIdx = 0;
    for (let d = 4; d <= 40; d += 4) {
      for (let b = 0; b < 2; b++) {
        const br = await createGroup(T2, chain[d].id, wideBranchNames[wideIdx % wideBranchNames.length], pick(logics), d + 1);
        wideIdx++;
        for (let c = 0; c < 5; c++) await createCondition(T2, br.id);
      }
    }
    // sortCounter = 121 + 120 = 241

    // ── Deep branches at every 7th depth ────────────────────────────
    // depths 7,14,21,28,35 = 5 points
    // Each: 3 groups × 6 conditions = 21 items per point = 105 total
    const deepBranchNames = [
      'Tier-1 Validation',  'Tier-2 Validation',  'Tier-3 Validation',
      'Primary Check',      'Secondary Check',    'Tertiary Check',
      'Fast Path',          'Slow Path',          'Recovery Path',
      'Input Sanitizer',    'Output Formatter',   'Transform Pipeline',
      'Cache Policy',       'Eviction Rules',     'Prefetch Logic',
    ];
    let deepIdx = 0;
    for (let d = 7; d <= 40; d += 7) {
      for (let b = 0; b < 3; b++) {
        const br = await createGroup(T2, chain[d].id, deepBranchNames[deepIdx % deepBranchNames.length], pick(logics), d + 1);
        deepIdx++;
        for (let c = 0; c < 6; c++) await createCondition(T2, br.id);
      }
    }
    // sortCounter = 241 + 105 = 346

    // ── Small branch at every remaining (unbranched) depth ──────────
    // Already branched by ÷4 or ÷7: {4,7,8,12,14,16,20,21,24,28,32,35,36,40}
    // Unbranched: 26 depths
    // Each: 1 group + 3 conditions = 4 items = 104 total
    const branchedDepths = new Set([4, 7, 8, 12, 14, 16, 20, 21, 24, 28, 32, 35, 36, 40]);
    for (let d = 1; d <= 40; d++) {
      if (branchedDepths.has(d)) continue;
      const br = await createGroup(T2, chain[d].id, `Sub-Policy L${d}`, pick(logics), d + 1);
      await createCondition(T2, br.id);
      await createCondition(T2, br.id);
      await createCondition(T2, br.id);
    }
    // sortCounter = 346 + 104 = 450

    // ── Pad to exactly 500 with flat conditions on root ─────────────
    const remaining = 500 - sortCounter;
    for (let i = 0; i < remaining; i++) {
      await createCondition(T2, root2.id);
    }
    // sortCounter = 500

    // ── Done ───────────────────────────────────────────────────────
    console.log(`\nSeeding complete.`);
    console.log(`Tree 1: "Enterprise Access & Compliance Rules" — ${tree1Count} items, 8 levels deep`);
    console.log(`Tree 2: "Stress Test: 500 Items / 40 Deep"    — ${sortCounter} items, 40 levels deep`);
    console.log('  - 40-level deep chain (each level has 2 conditions)');
    console.log('  - 10 wide branches (every 4th depth: 2 groups × 5 conditions)');
    console.log('  - 5 deep branches (every 7th depth: 3 groups × 6 conditions)');
    console.log('  - 26 small branches (remaining depths: 1 group × 3 conditions)');
    console.log(`  - ${remaining} flat conditions on root`);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

seed();
