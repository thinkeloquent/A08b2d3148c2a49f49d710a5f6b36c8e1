const COVERAGE_PROPERTIES = [
  "fills",
  "strokes",
  "effects",
  "constraints",
  "layoutMode",
  "boundVariables",
  "paddingLeft",
  "paddingRight",
  "paddingTop",
  "paddingBottom",
  "itemSpacing",
  "characters",
  "style",
];

const TOKEN_CATEGORY_MATCHERS = {
  color: ["fill", "stroke", "color"],
  spacing: ["padding", "spacing", "margin", "size"],
  typography: ["font", "text", "typography", "lineHeight", "letterSpacing"],
};

function normalizeName(value) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function median(values) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

function percentage(part, total) {
  if (!total) return 0;
  return Number(((part / total) * 100).toFixed(2));
}

function matchesCategoryKey(key, category) {
  const normalized = String(key || "").toLowerCase();
  return TOKEN_CATEGORY_MATCHERS[category].some((token) => normalized.includes(token));
}

function inferPropertyCategory(propertyName) {
  const key = String(propertyName || "").toLowerCase();
  if (matchesCategoryKey(key, "color")) return "color";
  if (matchesCategoryKey(key, "spacing")) return "spacing";
  if (matchesCategoryKey(key, "typography")) return "typography";
  return null;
}

export function analyzeFileSchema(fileData) {
  const document = fileData?.document;
  if (!document) {
    return {
      census: [],
      depthMap: [],
      propertyCoverage: [],
      tokenAdherence: [],
      linkage: {
        masters: 0,
        instances: 0,
        suspectedDetached: 0,
        orphanedSets: 0,
      },
      detachedInstances: [],
      snowflakes: [],
      totals: {
        nodes: 0,
        uniqueNodeTypes: 0,
        pages: 0,
        maxDepth: 0,
        avgDepth: 0,
        medianDepth: 0,
      },
    };
  }

  const typeCounts = new Map();
  const typePropertyStats = new Map();
  const typeTokenStats = new Map();
  const pageStats = new Map();
  const allDepths = [];

  const masterComponents = new Map();
  const componentNames = new Set();
  const detachedCandidates = [];
  const snowflakeCandidates = [];

  let masters = 0;
  let instances = 0;
  let orphanedSets = 0;
  let maxDepth = 0;
  let totalNodes = 0;

  function getTypeStats(nodeType) {
    if (!typePropertyStats.has(nodeType)) {
      typePropertyStats.set(nodeType, {
        total: 0,
        properties: new Map(),
      });
    }
    return typePropertyStats.get(nodeType);
  }

  function getTypeTokenStats(nodeType) {
    if (!typeTokenStats.has(nodeType)) {
      typeTokenStats.set(nodeType, {
        color: { tokenBound: 0, hardCoded: 0 },
        spacing: { tokenBound: 0, hardCoded: 0 },
        typography: { tokenBound: 0, hardCoded: 0 },
      });
    }
    return typeTokenStats.get(nodeType);
  }

  function getPageStats(pageId, pageName) {
    if (!pageStats.has(pageId)) {
      pageStats.set(pageId, {
        pageName,
        pageId,
        maxDepth: 0,
        sumDepth: 0,
        totalNodes: 0,
        depthCounts: new Map(),
      });
    }
    return pageStats.get(pageId);
  }

  function computeSignals(node, matchedName) {
    const normalizedNodeName = normalizeName(node?.name);
    const namingScore = normalizedNodeName && matchedName
      ? normalizedNodeName === matchedName
        ? 100
        : normalizedNodeName.includes(matchedName) || matchedName.includes(normalizedNodeName)
          ? 75
          : 0
      : 0;

    const hasChildren = Array.isArray(node?.children) && node.children.length > 0;
    const structuralScore = hasChildren
      ? Math.min(100, 40 + (node.children.length * 8))
      : 45;

    const hasVisualStyle =
      (Array.isArray(node?.fills) && node.fills.length > 0)
      || (Array.isArray(node?.strokes) && node.strokes.length > 0)
      || (Array.isArray(node?.effects) && node.effects.length > 0);
    const styleScore = hasVisualStyle ? 70 : 40;

    const confidence = Math.round((structuralScore * 0.4) + (namingScore * 0.3) + (styleScore * 0.3));
    return { structuralScore, namingScore, styleScore, confidence };
  }

  function evaluateDetachedOrSnowflake(node, ancestryHasComponentId, pageName) {
    if (node?.componentId) return;
    if (node?.type !== "FRAME" && node?.type !== "GROUP") return;
    if (!componentNames.size) return;

    const normalizedNodeName = normalizeName(node?.name);
    if (!normalizedNodeName) return;

    let matchedComponentName = null;
    for (const compName of componentNames) {
      if (
        normalizedNodeName === compName
        || normalizedNodeName.startsWith(`${compName} /`)
        || compName.startsWith(`${normalizedNodeName} /`)
      ) {
        matchedComponentName = compName;
        break;
      }
    }
    if (!matchedComponentName) return;

    const matchedComponentId = masterComponents.get(matchedComponentName) || null;
    const signals = computeSignals(node, matchedComponentName);
    if (signals.confidence < 60) return;

    const payload = {
      nodeId: node.id,
      nodeName: node.name,
      pageName,
      matchedComponentId,
      matchedComponentName,
      confidence: signals.confidence,
      signals: {
        structural: signals.structuralScore,
        naming: signals.namingScore,
        style: signals.styleScore,
      },
    };

    detachedCandidates.push(payload);
    if (!ancestryHasComponentId) {
      snowflakeCandidates.push(payload);
    }
  }

  function walk(node, depth, pageCtx, ancestryHasComponentId) {
    if (!node || typeof node !== "object") return;

    const nodeType = node.type || "UNKNOWN";
    totalNodes += 1;
    maxDepth = Math.max(maxDepth, depth);
    allDepths.push(depth);
    typeCounts.set(nodeType, (typeCounts.get(nodeType) || 0) + 1);

    const page = pageCtx || {
      pageId: "unknown",
      pageName: "Unknown",
    };
    const pStats = getPageStats(page.pageId, page.pageName);
    pStats.totalNodes += 1;
    pStats.sumDepth += depth;
    pStats.maxDepth = Math.max(pStats.maxDepth, depth);
    pStats.depthCounts.set(depth, (pStats.depthCounts.get(depth) || 0) + 1);

    const tStats = getTypeStats(nodeType);
    tStats.total += 1;
    for (const prop of COVERAGE_PROPERTIES) {
      if (node[prop] !== undefined && node[prop] !== null) {
        tStats.properties.set(prop, (tStats.properties.get(prop) || 0) + 1);
      }
    }

    const tokenStats = getTypeTokenStats(nodeType);
    const boundVariables = node.boundVariables && typeof node.boundVariables === "object"
      ? Object.keys(node.boundVariables)
      : [];
    const boundCategories = new Set(
      boundVariables
        .map((k) => inferPropertyCategory(k))
        .filter(Boolean),
    );

    for (const category of ["color", "spacing", "typography"]) {
      if (boundCategories.has(category)) {
        tokenStats[category].tokenBound += 1;
      }
    }

    for (const prop of Object.keys(node)) {
      const category = inferPropertyCategory(prop);
      if (!category) continue;
      if (boundCategories.has(category)) continue;
      const value = node[prop];
      if (value === undefined || value === null) continue;
      tokenStats[category].hardCoded += 1;
    }

    if (nodeType === "COMPONENT") {
      masters += 1;
      const name = normalizeName(node.name);
      if (name) {
        componentNames.add(name);
        masterComponents.set(name, node.id);
      }
    } else if (nodeType === "INSTANCE") {
      instances += 1;
    } else if (nodeType === "COMPONENT_SET" && (!Array.isArray(node.children) || node.children.length === 0)) {
      orphanedSets += 1;
    }

    evaluateDetachedOrSnowflake(node, ancestryHasComponentId, page.pageName);

    const nextAncestryHasComponentId = ancestryHasComponentId || Boolean(node.componentId);
    for (const child of node.children || []) {
      const childPageCtx = node.type === "CANVAS"
        ? { pageId: node.id, pageName: node.name || "Untitled Page" }
        : page;
      walk(child, depth + 1, childPageCtx, nextAncestryHasComponentId);
    }
  }

  walk(document, 0, { pageId: "document", pageName: document.name || "Document" }, false);

  const census = [...typeCounts.entries()]
    .map(([nodeType, count]) => ({
      nodeType,
      count,
      percentage: percentage(count, totalNodes),
    }))
    .sort((a, b) => b.count - a.count);

  const depthMap = [...pageStats.values()]
    .filter((item) => item.pageId !== "document")
    .map((item) => ({
      pageName: item.pageName,
      pageId: item.pageId,
      maxDepth: item.maxDepth,
      avgDepth: Number((item.sumDepth / Math.max(item.totalNodes, 1)).toFixed(2)),
      totalNodes: item.totalNodes,
      depthDistribution: [...item.depthCounts.entries()]
        .sort((a, b) => a[0] - b[0])
        .map(([depth, count]) => ({ depth, count })),
    }))
    .sort((a, b) => b.totalNodes - a.totalNodes);

  const propertyCoverage = [...typePropertyStats.entries()]
    .map(([nodeType, stats]) => {
      const properties = {};
      for (const [prop, count] of stats.properties.entries()) {
        properties[prop] = percentage(count, stats.total);
      }
      return { nodeType, properties };
    })
    .sort((a, b) => {
      const ac = typeCounts.get(a.nodeType) || 0;
      const bc = typeCounts.get(b.nodeType) || 0;
      return bc - ac;
    });

  const tokenAdherence = [...typeTokenStats.entries()]
    .map(([nodeType, stats]) => ({
      nodeType,
      categories: Object.fromEntries(
        Object.entries(stats).map(([category, value]) => {
          const total = value.tokenBound + value.hardCoded;
          return [category, {
            tokenBound: value.tokenBound,
            hardCoded: value.hardCoded,
            tokenizationPercent: percentage(value.tokenBound, total),
          }];
        }),
      ),
    }));

  return {
    census,
    depthMap,
    propertyCoverage,
    tokenAdherence,
    linkage: {
      masters,
      instances,
      suspectedDetached: detachedCandidates.length,
      orphanedSets,
      snowflakes: snowflakeCandidates.length,
    },
    detachedInstances: detachedCandidates,
    snowflakes: snowflakeCandidates,
    totals: {
      nodes: totalNodes,
      uniqueNodeTypes: typeCounts.size,
      pages: depthMap.length,
      maxDepth,
      avgDepth: Number((allDepths.reduce((acc, value) => acc + value, 0) / Math.max(allDepths.length, 1)).toFixed(2)),
      medianDepth: median(allDepths),
    },
  };
}
