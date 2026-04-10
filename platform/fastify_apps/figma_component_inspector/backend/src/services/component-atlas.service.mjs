/**
 * Component Atlas Service
 * =======================
 *
 * Walks the Figma document tree and produces a comprehensive atlas of ALL
 * node types — frames, text, vectors, components, instances, etc.
 *
 * Categories are built from node types (FRAME, TEXT, VECTOR, …) so the atlas
 * is useful even for files with zero formal components.  When formal
 * COMPONENT / COMPONENT_SET / INSTANCE nodes exist, richer variant and
 * code-mapping data is included.
 */

const CATEGORY_COLORS = [
  "#00F5D4", "#7B61FF", "#FF6B6B", "#FFD166", "#06D6A0",
  "#F77F00", "#4D9EFF", "#A855F7", "#FF7EB6", "#9B8FFF",
];

/** Human-friendly labels for Figma node types. */
const NODE_TYPE_LABELS = {
  FRAME:             "Frames",
  TEXT:              "Text",
  VECTOR:            "Vectors",
  RECTANGLE:         "Rectangles",
  ELLIPSE:           "Ellipses",
  GROUP:             "Groups",
  COMPONENT:         "Components",
  COMPONENT_SET:     "Component Sets",
  INSTANCE:          "Instances",
  BOOLEAN_OPERATION: "Boolean Ops",
  LINE:              "Lines",
  REGULAR_POLYGON:   "Polygons",
  STAR:              "Stars",
  SLICE:             "Slices",
  SECTION:           "Sections",
  STICKY:            "Stickies",
  SHAPE_WITH_TEXT:   "Shape + Text",
  CONNECTOR:         "Connectors",
  STAMP:             "Stamps",
  WIDGET:            "Widgets",
  TABLE:             "Tables",
  TABLE_CELL:        "Table Cells",
};

const VISUAL_PROPS = [
  "fills", "strokes", "effects", "paddingLeft", "paddingRight",
  "paddingTop", "paddingBottom", "itemSpacing", "cornerRadius", "opacity",
];

const STYLE_PROPS = [
  "fills", "strokes", "effects", "layoutMode", "layoutAlign",
  "primaryAxisAlignItems", "counterAxisAlignItems",
  "paddingLeft", "paddingRight", "paddingTop", "paddingBottom",
  "itemSpacing", "cornerRadius", "opacity", "blendMode",
  "constraints", "absoluteBoundingBox",
];

// Skip structural-only types that aren't interesting for the atlas
const SKIP_TYPES = new Set(["DOCUMENT", "CANVAS"]);

function slugify(value) {
  return String(value || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function percentage(part, total) {
  if (!total) return 0;
  return Number(((part / total) * 100).toFixed(2));
}

function labelForType(nodeType) {
  return NODE_TYPE_LABELS[nodeType] || nodeType.charAt(0) + nodeType.slice(1).toLowerCase();
}

function hasSlashNaming(name) {
  return typeof name === "string" && name.includes("/");
}

function countBoundVisualProps(node) {
  const bound = new Set(
    Object.keys((node && typeof node.boundVariables === "object" && node.boundVariables) || {}),
  );
  let boundCount = 0;
  let hardCodedCount = 0;
  for (const prop of VISUAL_PROPS) {
    if (node[prop] !== undefined && node[prop] !== null) {
      if (bound.has(prop)) {
        boundCount += 1;
      } else {
        hardCodedCount += 1;
      }
    }
  }
  return { boundCount, hardCodedCount };
}

function extractTokenNames(node) {
  const tokens = [];
  const bv = node.boundVariables;
  if (!bv || typeof bv !== "object") return tokens;
  for (const [, binding] of Object.entries(bv)) {
    if (Array.isArray(binding)) {
      for (const item of binding) {
        if (item && item.id) tokens.push(item.id);
      }
    } else if (binding && binding.id) {
      tokens.push(binding.id);
    }
  }
  return tokens;
}

function countStyleProps(node) {
  let count = 0;
  for (const prop of STYLE_PROPS) {
    if (node[prop] !== undefined && node[prop] !== null) count += 1;
  }
  return count;
}

/**
 * Infer a CSS-relevant tag for a Figma node based on its type and properties.
 */
function inferHtmlTag(node) {
  const t = node.type;
  if (t === "TEXT") return "p";
  if (t === "VECTOR" || t === "ELLIPSE" || t === "LINE" || t === "STAR" || t === "REGULAR_POLYGON" || t === "BOOLEAN_OPERATION") return "svg";
  if (t === "RECTANGLE") {
    // Check if it looks like an image placeholder
    if (Array.isArray(node.fills) && node.fills.some((f) => f.type === "IMAGE")) return "img";
    return "div";
  }
  if (t === "INSTANCE" || t === "COMPONENT" || t === "COMPONENT_SET") return "Component";
  if (t === "GROUP") return "div";
  if (t === "FRAME") {
    if (node.layoutMode === "HORIZONTAL" || node.layoutMode === "VERTICAL") return "Flex";
    return "div";
  }
  return "div";
}

/**
 * Generate a suggested React/HTML snippet for a representative node.
 */
function generateCodeSnippet(node) {
  const tag = inferHtmlTag(node);
  const name = node.name || "Element";
  const safeName = name.replace(/[<>"'&]/g, "");

  if (tag === "p") {
    const text = node.characters || safeName;
    return `<p className="...">${text.length > 40 ? text.slice(0, 40) + "..." : text}</p>`;
  }
  if (tag === "svg") {
    return `<svg viewBox="..." className="...">\n  {/* ${safeName} */}\n</svg>`;
  }
  if (tag === "img") {
    return `<img src="..." alt="${safeName}" className="..." />`;
  }
  if (tag === "Component") {
    const pascal = safeName.split(/[\s/_-]+/)
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
      .join("");
    return `<${pascal} />`;
  }
  if (tag === "Flex") {
    const dir = node.layoutMode === "HORIZONTAL" ? "flex-row" : "flex-col";
    return `<div className="flex ${dir} gap-...">\n  {/* ${safeName} */}\n</div>`;
  }
  return `<div className="...">\n  {/* ${safeName} */}\n</div>`;
}

/**
 * Extract CSS-like style attributes from a node.
 */
function extractStyleAttributes(node) {
  const attrs = {};
  // Layout
  if (node.layoutMode) attrs.display = "flex";
  if (node.layoutMode === "HORIZONTAL") attrs.flexDirection = "row";
  if (node.layoutMode === "VERTICAL") attrs.flexDirection = "column";
  if (node.primaryAxisAlignItems) attrs.justifyContent = node.primaryAxisAlignItems.toLowerCase();
  if (node.counterAxisAlignItems) attrs.alignItems = node.counterAxisAlignItems.toLowerCase();
  // Spacing
  if (node.paddingLeft) attrs.paddingLeft = `${node.paddingLeft}px`;
  if (node.paddingRight) attrs.paddingRight = `${node.paddingRight}px`;
  if (node.paddingTop) attrs.paddingTop = `${node.paddingTop}px`;
  if (node.paddingBottom) attrs.paddingBottom = `${node.paddingBottom}px`;
  if (node.itemSpacing) attrs.gap = `${node.itemSpacing}px`;
  // Border
  if (node.cornerRadius) attrs.borderRadius = `${node.cornerRadius}px`;
  if (node.strokeWeight) attrs.borderWidth = `${node.strokeWeight}px`;
  // Size
  if (node.absoluteBoundingBox) {
    attrs.width = `${Math.round(node.absoluteBoundingBox.width)}px`;
    attrs.height = `${Math.round(node.absoluteBoundingBox.height)}px`;
  }
  // Fills -> background
  if (Array.isArray(node.fills) && node.fills.length > 0) {
    const fill = node.fills[0];
    if (fill.type === "SOLID" && fill.color) {
      const r = Math.round(fill.color.r * 255);
      const g = Math.round(fill.color.g * 255);
      const b = Math.round(fill.color.b * 255);
      attrs.background = `rgb(${r}, ${g}, ${b})`;
    }
  }
  // Opacity
  if (node.opacity !== undefined && node.opacity !== 1) attrs.opacity = node.opacity;
  // Typography
  if (node.style) {
    if (node.style.fontFamily) attrs.fontFamily = node.style.fontFamily;
    if (node.style.fontSize) attrs.fontSize = `${node.style.fontSize}px`;
    if (node.style.fontWeight) attrs.fontWeight = node.style.fontWeight;
    if (node.style.lineHeightPx) attrs.lineHeight = `${node.style.lineHeightPx}px`;
    if (node.style.letterSpacing) attrs.letterSpacing = `${node.style.letterSpacing}px`;
    if (node.style.textAlignHorizontal) attrs.textAlign = node.style.textAlignHorizontal.toLowerCase();
  }
  return attrs;
}

export function analyzeComponentAtlas(fileData, devResources = []) {
  const emptyResult = {
    categories: [],
    variantDetails: {},
    totals: {
      activeComponents: 0,
      totalInstances: 0,
      orphaned: 0,
      detached: 0,
      designHealth: 0,
      totalNodes: 0,
      pages: 0,
      maxDepth: 0,
    },
    governance: {
      tokenCompliance: 0,
      namingConvention: 0,
      documentation: 0,
      devResources: 0,
    },
    devResourceLinks: [],
  };

  const document = fileData?.document;
  if (!document) return emptyResult;

  const topLevelComponents = fileData.components || {};

  // ── Phase 1: Walk the entire tree, collect all nodes by type ──────────────

  // Map: nodeType -> array of { node, depth, pageName }
  const nodesByType = new Map();
  // Track top-level named nodes per type (representative examples)
  const representativeNodes = new Map();

  let totalNodes = 0;
  let maxDepth = 0;
  let pageCount = 0;
  let componentCount = 0;
  let componentSetCount = 0;
  let instanceCount = 0;
  let orphanedSets = 0;
  let detachedFrames = 0;
  let totalBound = 0;
  let totalHardCoded = 0;
  let slashNamedCount = 0;
  let documentedCount = 0;

  // Component tracking for richer analytics
  const componentNames = new Set();
  const instanceCounts = new Map(); // componentId -> count

  function walk(node, depth, pageName) {
    if (!node || typeof node !== "object") return;

    const type = node.type || "UNKNOWN";

    if (type === "CANVAS") {
      pageCount += 1;
      // Walk children with page context
      for (const child of node.children || []) {
        walk(child, depth + 1, node.name || "Untitled Page");
      }
      return;
    }
    if (type === "DOCUMENT") {
      for (const child of node.children || []) {
        walk(child, depth + 1, pageName);
      }
      return;
    }

    totalNodes += 1;
    maxDepth = Math.max(maxDepth, depth);

    // Accumulate by type
    if (!nodesByType.has(type)) nodesByType.set(type, []);
    nodesByType.get(type).push({ node, depth, pageName });

    // Track representative nodes (top-level or named ones, up to 50 per type)
    if (!representativeNodes.has(type)) representativeNodes.set(type, []);
    const reps = representativeNodes.get(type);
    if (reps.length < 50 && node.name && depth <= 8) {
      reps.push(node);
    }

    // Token adherence across all nodes
    const { boundCount, hardCodedCount } = countBoundVisualProps(node);
    totalBound += boundCount;
    totalHardCoded += hardCodedCount;

    // Component-specific tracking
    if (type === "COMPONENT") {
      componentCount += 1;
      if (node.name) componentNames.add(node.name);
      if (hasSlashNaming(node.name)) slashNamedCount += 1;
      const apiMeta = topLevelComponents[node.id];
      if ((apiMeta?.description || node.description || "").trim()) documentedCount += 1;
    } else if (type === "COMPONENT_SET") {
      componentSetCount += 1;
      if (!Array.isArray(node.children) || node.children.length === 0) orphanedSets += 1;
    } else if (type === "INSTANCE") {
      instanceCount += 1;
      if (node.componentId) {
        instanceCounts.set(node.componentId, (instanceCounts.get(node.componentId) || 0) + 1);
      }
    } else if (type === "FRAME" || type === "GROUP") {
      // Count frames/groups that might be detached instances
      if (!node.componentId) detachedFrames += 1;
    }

    for (const child of node.children || []) {
      walk(child, depth + 1, pageName);
    }
  }

  walk(document, 0, "Root");

  // ── Phase 2: Build categories from node types ────────────────────────────

  let colorIdx = 0;
  const categories = [];
  const variantDetails = {};

  // Sort types by count (descending) for visual priority
  const sortedTypes = [...nodesByType.entries()]
    .filter(([type]) => !SKIP_TYPES.has(type))
    .sort((a, b) => b[1].length - a[1].length);

  for (const [nodeType, nodes] of sortedTypes) {
    const catId = slugify(nodeType);
    const catLabel = labelForType(nodeType);
    const catColor = CATEGORY_COLORS[colorIdx % CATEGORY_COLORS.length];
    colorIdx += 1;

    // Gather representative node names as "components" within this category
    const reps = representativeNodes.get(nodeType) || [];
    // Group by unique name, count occurrences
    const nameCountMap = new Map();
    for (const entry of nodes) {
      const n = entry.node.name || "(unnamed)";
      nameCountMap.set(n, (nameCountMap.get(n) || 0) + 1);
    }
    // Top named elements sorted by frequency
    const sortedNames = [...nameCountMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20);

    const componentNames = sortedNames.map(([n]) => n);

    // Calculate category-level health
    let catBound = 0;
    let catHardCoded = 0;
    let catStyleTotal = 0;
    for (const entry of nodes) {
      const bv = countBoundVisualProps(entry.node);
      catBound += bv.boundCount;
      catHardCoded += bv.hardCodedCount;
      catStyleTotal += countStyleProps(entry.node);
    }
    const catTokenAdherence = (catBound + catHardCoded) > 0
      ? percentage(catBound, catBound + catHardCoded)
      : 0;
    // Design Health Score: 50% token adherence + 20% style presence + 30% naming quality
    const stylePresence = nodes.length > 0
      ? Math.min(100, catStyleTotal > 0 ? Math.round((catStyleTotal / nodes.length) * 25 + 50) : 0)
      : 0;
    const namingQuality = (() => {
      let named = 0;
      for (const entry of nodes) {
        const n = entry.node.name;
        if (n && n !== entry.node.type && !/^(Frame|Group|Rectangle|Vector|Ellipse|Text)\s*\d*$/i.test(n)) {
          named += 1;
        }
      }
      return percentage(named, nodes.length);
    })();
    const health = Math.round(catTokenAdherence * 0.5 + stylePresence * 0.2 + namingQuality * 0.3);

    categories.push({
      id: catId,
      label: catLabel,
      color: catColor,
      count: nodes.length,
      instances: nodes.length,
      health,
      components: componentNames,
    });

    // Build variant details for each named element in this category
    variantDetails[catId] = {};

    for (const [name, count] of sortedNames) {
      // Find a representative node with this name
      const repNode = reps.find((n) => n.name === name) || nodes.find((e) => e.node.name === name)?.node;
      if (!repNode) continue;

      const bv = countBoundVisualProps(repNode);
      const tokenAdherence = (bv.boundCount + bv.hardCodedCount) > 0
        ? percentage(bv.boundCount, bv.boundCount + bv.hardCodedCount)
        : 0;
      const elemStyleCount = countStyleProps(repNode);
      const elemNamingQuality = (name && name !== repNode.type && !/^(Frame|Group|Rectangle|Vector|Ellipse|Text)\s*\d*$/i.test(name)) ? 100 : 20;
      const elemStylePresence = Math.min(100, elemStyleCount > 0 ? elemStyleCount * 25 + 50 : 0);
      const elemHealth = Math.round(tokenAdherence * 0.5 + elemStylePresence * 0.2 + elemNamingQuality * 0.3);
      const elemStatus = elemHealth > 70 ? "compliant" : elemHealth >= 40 ? "partial" : "detached";

      const tokens = extractTokenNames(repNode);
      const code = generateCodeSnippet(repNode);
      const styleAttrs = extractStyleAttributes(repNode);

      // Build "states" from CSS/style properties found on this node
      const states = [];
      const styleEntries = Object.entries(styleAttrs);
      for (const [prop, value] of styleEntries.slice(0, 8)) {
        states.push({
          name: prop,
          props: { [prop]: value },
          instances: count,
        });
      }

      variantDetails[catId][name] = {
        instances: count,
        health: elemHealth,
        status: elemStatus,
        tokensCovered: bv.boundCount,
        nodeId: repNode.id,
        states,
        tokens,
        sizes: [],
        code,
        htmlTag: inferHtmlTag(repNode),
        cssProperties: styleAttrs,
      };
    }
  }

  // ── Phase 3: Totals and governance ───────────────────────────────────────

  const healthAll = categories.map((c) => c.health);
  const systemHealth = healthAll.length
    ? Math.round(healthAll.reduce((a, b) => a + b, 0) / healthAll.length)
    : 0;

  const totals = {
    activeComponents: componentCount,
    totalInstances: instanceCount,
    orphaned: orphanedSets,
    detached: detachedFrames,
    designHealth: systemHealth,
    totalNodes,
    pages: pageCount,
    maxDepth,
  };

  const governance = {
    tokenCompliance: percentage(totalBound, totalBound + totalHardCoded),
    namingConvention: componentCount > 0 ? percentage(slashNamedCount, componentCount) : percentage(
      // For non-component files, measure how many nodes have meaningful names
      (() => {
        let named = 0;
        for (const [, nodes] of nodesByType) {
          for (const entry of nodes) {
            const n = entry.node.name;
            if (n && !/^(Frame|Group|Rectangle|Vector|Ellipse|Text)\s*\d*$/i.test(n)) {
              named += 1;
            }
          }
        }
        return named;
      })(),
      totalNodes,
    ),
    documentation: componentCount > 0
      ? percentage(documentedCount, componentCount)
      : 0,
    devResources: 0,
  };

  // ── Phase 4: Dev resource links ───────────────────────────────────────────

  // Build a set of component node IDs for matching
  const componentNodeIds = new Set();
  for (const [, nodes] of nodesByType) {
    for (const entry of nodes) {
      if (entry.node.type === "COMPONENT" || entry.node.type === "COMPONENT_SET") {
        componentNodeIds.add(entry.node.id);
      }
    }
  }

  // Normalize dev resources into a clean list
  const devResourceLinks = [];
  const nodesWithDevResources = new Set();

  for (const resource of devResources) {
    const nodeId = resource.node_id || "";
    const url = resource.url || "";
    const name = resource.name || url;

    if (!url) continue;

    // Classify link type from URL patterns
    let linkType = "other";
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes("storybook") || lowerUrl.includes("chromatic")) linkType = "storybook";
    else if (lowerUrl.includes("github.com") || lowerUrl.includes("gitlab.com") || lowerUrl.includes("bitbucket")) linkType = "repository";
    else if (lowerUrl.includes("figma.com")) linkType = "figma";
    else if (lowerUrl.includes("notion.") || lowerUrl.includes("confluence") || lowerUrl.includes("readme") || lowerUrl.includes("docs.")) linkType = "documentation";
    else if (lowerUrl.includes("npm") || lowerUrl.includes("unpkg") || lowerUrl.includes("jsdelivr")) linkType = "package";

    devResourceLinks.push({
      nodeId,
      name,
      url,
      linkType,
    });

    if (nodeId) nodesWithDevResources.add(nodeId);
  }

  // Dev resource coverage: % of component/component-set nodes with at least one dev link
  if (componentNodeIds.size > 0) {
    let coveredCount = 0;
    for (const id of componentNodeIds) {
      if (nodesWithDevResources.has(id)) coveredCount += 1;
    }
    governance.devResources = percentage(coveredCount, componentNodeIds.size);
  }

  return { categories, variantDetails, totals, governance, devResourceLinks };
}
