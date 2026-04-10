/**
 * Figma Service
 *
 * Provides methods for interacting with the Figma REST API.
 * Uses fetch-undici AsyncClient with proxy/TLS support from AppYamlConfig.
 * Implements singleton pattern for shared usage across routes.
 */

import { AsyncClient, getEnvProxy } from "fetch-undici";

const FIGMA_API_BASE = "https://api.figma.com/v1";
const DEFAULT_TIMEOUT_MS = 30_000;

/**
 * Resolve proxy URL from provider config.
 *   false  → no proxy
 *   null   → env proxy
 *   string → explicit proxy
 * @param {*} proxyUrl
 * @returns {string|null}
 */
function buildProxyConfig(proxyUrl) {
  if (proxyUrl === false) return null;
  if (typeof proxyUrl === "string" && proxyUrl.length > 0) return proxyUrl;
  const envProxy = getEnvProxy();
  return envProxy.https || envProxy.http || null;
}

export class FigmaService {
  /** @type {FigmaService | null} */
  static #instance = null;

  /** @type {string} */
  #token;

  /** @type {string} */
  #baseUrl;

  /** @type {Record<string, string>} */
  #headers;

  /** @type {AsyncClient} */
  #client;

  /**
   * @param {string} figmaToken - Figma personal access token
   * @param {object} [options] - Provider config options
   * @param {string} [options.baseUrl] - Base URL (from providers.figma.base_url)
   * @param {string|false|null} [options.proxyUrl] - Proxy URL (false=none, null=env, string=explicit)
   * @param {boolean} [options.verifySsl] - Whether to verify TLS (default true)
   * @param {Record<string, string>} [options.extraHeaders] - Additional headers from provider config
   */
  constructor(figmaToken, options = {}) {
    const { baseUrl, proxyUrl, verifySsl, extraHeaders } = options;

    this.#token = figmaToken || "";
    this.#baseUrl = baseUrl ? baseUrl.replace(/\/+$/, "") : FIGMA_API_BASE;
    this.#headers = {
      "X-Figma-Token": this.#token,
      Accept: "application/json",
      ...(extraHeaders || {}),
    };

    // Build AsyncClient with proxy + timeout support
    this.#client = new AsyncClient({
      baseUrl: this.#baseUrl,
      headers: this.#headers,
      proxy: buildProxyConfig(proxyUrl),
      timeout: DEFAULT_TIMEOUT_MS,
      verify: verifySsl !== false,
      trust_env: proxyUrl === null || proxyUrl === undefined,
    });
  }

  /**
   * Get or create the singleton instance.
   * @param {string} [figmaToken] - Token is required on first call
   * @param {object} [options] - Provider config options (baseUrl, proxyUrl, verifySsl, extraHeaders)
   * @returns {FigmaService}
   */
  static getInstance(figmaToken, options) {
    if (!FigmaService.#instance) {
      if (figmaToken === undefined) {
        throw new Error(
          "FigmaService.getInstance() requires a token on first call",
        );
      }
      FigmaService.#instance = new FigmaService(figmaToken, options);
    }
    return FigmaService.#instance;
  }

  /**
   * Reset the singleton (useful for testing).
   */
  static resetInstance() {
    FigmaService.#instance = null;
  }

  /**
   * Get the token (for proxying requests).
   * @returns {string}
   */
  get token() {
    return this.#token;
  }

  /**
   * Internal fetch helper using AsyncClient with timeout and error handling.
   * @param {string} path - API path (appended to base URL)
   * @param {Record<string, string>} [queryParams] - URL query parameters
   * @returns {Promise<any>} Parsed JSON response
   */
  async #fetchApi(path, queryParams) {
    if (!this.#token) {
      const err = new Error("FIGMA_TOKEN is not configured");
      err.statusCode = 503;
      throw err;
    }

    // Build query object for request params (filter out empty values)
    let query;
    if (queryParams && Object.keys(queryParams).length > 0) {
      query = {};
      for (const [key, value] of Object.entries(queryParams)) {
        if (value !== undefined && value !== null && value !== "") {
          query[key] = String(value);
        }
      }
      if (Object.keys(query).length === 0) query = undefined;
    }

    try {
      const response = await this.#client.get(path, { params: query });

      let data;
      try {
        data = await response.json();
      } catch {
        data = await response.text();
      }

      if (!response.ok) {
        const body = typeof data === "string"
          ? data
          : JSON.stringify(data);
        const err = new Error(
          `Figma API error ${response.statusCode}: ${body || "unknown error"}`,
        );
        err.statusCode = response.statusCode;
        throw err;
      }

      return data;
    } catch (err) {
      // Map undici timeout errors
      if (err.code === "UND_ERR_HEADERS_TIMEOUT" || err.code === "UND_ERR_BODY_TIMEOUT") {
        const timeoutErr = new Error(
          `Figma API request timed out after ${DEFAULT_TIMEOUT_MS}ms`,
        );
        timeoutErr.statusCode = 504;
        throw timeoutErr;
      }
      throw err;
    }
  }

  /**
   * Fetch a Figma file by ID.
   * @param {string} fileId
   * @returns {Promise<object>} Full Figma file JSON
   */
  async getFigmaFile(fileId) {
    if (!fileId || typeof fileId !== "string" || !fileId.trim()) {
      const err = new Error("fileId is required and must be a non-empty string");
      err.statusCode = 400;
      throw err;
    }
    return this.#fetchApi(`/files/${encodeURIComponent(fileId.trim())}`);
  }

  /**
   * Fetch file metadata (name, folder_name, creator, etc.) via the /meta endpoint.
   * @param {string} fileId
   * @returns {Promise<object>} File metadata object
   */
  async getFileMeta(fileId) {
    if (!fileId || typeof fileId !== "string" || !fileId.trim()) {
      const err = new Error("fileId is required and must be a non-empty string");
      err.statusCode = 400;
      throw err;
    }
    return this.#fetchApi(`/files/${encodeURIComponent(fileId.trim())}/meta`);
  }

  /**
   * Get rendered images for component nodes.
   * @param {string} fileId
   * @param {string[]} nodeIds - Array of node IDs
   * @param {number} [scale=2.0]
   * @param {string} [format='png']
   * @returns {Promise<object>} Image URLs keyed by node ID
   */
  async getComponentImages(fileId, nodeIds, scale = 2.0, format = "png") {
    if (!fileId || typeof fileId !== "string" || !fileId.trim()) {
      const err = new Error("fileId is required");
      err.statusCode = 400;
      throw err;
    }
    if (!Array.isArray(nodeIds) || nodeIds.length === 0) {
      const err = new Error("nodeIds must be a non-empty array");
      err.statusCode = 400;
      throw err;
    }

    const validFormats = ["png", "jpg", "svg", "pdf"];
    const fmt = validFormats.includes(format) ? format : "png";

    return this.#fetchApi(
      `/images/${encodeURIComponent(fileId.trim())}`,
      {
        ids: nodeIds.join(","),
        scale: String(scale),
        format: fmt,
      },
    );
  }

  /**
   * Fetch local variables for a Figma file.
   * Tries the /variables/local endpoint first (Enterprise plans).
   * Falls back to extracting design tokens from the file document tree.
   * @param {string} fileId
   * @returns {Promise<Array<{id: string, name: string, value: any, type: string, description: string, collectionName: string, source: string}>>}
   */
  async getFileVariables(fileId) {
    if (!fileId || typeof fileId !== "string" || !fileId.trim()) {
      const err = new Error("fileId is required");
      err.statusCode = 400;
      throw err;
    }

    // Try the variables/local endpoint first (Enterprise / token with variables:read scope)
    try {
      const data = await this.#fetchApi(
        `/files/${encodeURIComponent(fileId.trim())}/variables/local`,
      );

      const collections = data?.meta?.variableCollections || {};
      const collectionNameById = {};
      for (const [cid, col] of Object.entries(collections)) {
        collectionNameById[cid] = col.name || cid;
      }

      const variables = [];
      const variableCollection = data?.meta?.variables || {};

      for (const [_id, variable] of Object.entries(variableCollection)) {
        const resolvedType = variable.resolvedType || "UNKNOWN";
        const modeValues = variable.valuesByMode || {};
        const firstModeValue = Object.values(modeValues)[0] ?? null;

        variables.push({
          id: variable.id || _id,
          name: variable.name || "unnamed",
          value: firstModeValue,
          type: resolvedType,
          description: variable.description || "",
          collectionName:
            collectionNameById[variable.variableCollectionId] || "",
          scopes: variable.scopes || [],
          codeSyntax: variable.codeSyntax || {},
          hiddenFromPublishing: variable.hiddenFromPublishing || false,
          source: "api",
        });
      }

      if (variables.length > 0) return variables;
    } catch {
      // Variables endpoint may fail (403 on non-Enterprise) — fall through
    }

    // Fallback: extract tokens from the file document tree
    return this.#extractTokensFromFile(fileId);
  }

  /**
   * Extract design tokens by walking the Figma file document tree.
   * Collects: bound variables, unique fill/stroke colors, font styles,
   * spacing values, corner radii, and effects.
   * @param {string} fileId
   * @returns {Promise<Array>}
   */
  async #extractTokensFromFile(fileId) {
    const fileData = await this.getFigmaFile(fileId);
    const doc = fileData?.document;
    if (!doc) return [];

    const colors = new Map(); // hex -> { value, count, nodeName }
    const strokeColors = new Map();
    const fonts = new Map(); // key -> { family, weight, size, count }
    const radii = new Map(); // value -> count
    const effects = new Map(); // key -> { type, color?, radius?, count }
    const boundVarIds = new Map(); // varId -> { nodeName, property }
    const spacingVals = new Map(); // value -> count
    let idCounter = 0;

    const rgbToHex = (c) => {
      const r = Math.round(Number(c.r) * 255);
      const g = Math.round(Number(c.g) * 255);
      const b = Math.round(Number(c.b) * 255);
      return `#${r.toString(16).padStart(2, "0").toUpperCase()}${g.toString(16).padStart(2, "0").toUpperCase()}${b.toString(16).padStart(2, "0").toUpperCase()}`;
    };

    const walkNode = (node) => {
      if (!node || typeof node !== "object") return;

      // Bound variables
      const bv = node.boundVariables;
      if (bv && typeof bv === "object") {
        for (const [prop, binding] of Object.entries(bv)) {
          const bindings = Array.isArray(binding) ? binding : [binding];
          for (const b of bindings) {
            if (b?.id && !boundVarIds.has(b.id)) {
              boundVarIds.set(b.id, {
                nodeName: node.name || "unnamed",
                property: prop,
              });
            }
          }
        }
      }

      // Fill colors
      if (Array.isArray(node.fills)) {
        for (const fill of node.fills) {
          if (fill.type === "SOLID" && fill.color) {
            const hex = rgbToHex(fill.color);
            const prev = colors.get(hex);
            colors.set(hex, {
              value: fill.color,
              count: (prev?.count || 0) + 1,
              nodeName: prev?.nodeName || node.name,
            });
          }
        }
      }

      // Stroke colors
      if (Array.isArray(node.strokes)) {
        for (const stroke of node.strokes) {
          if (stroke.type === "SOLID" && stroke.color) {
            const hex = rgbToHex(stroke.color);
            const prev = strokeColors.get(hex);
            strokeColors.set(hex, {
              value: stroke.color,
              count: (prev?.count || 0) + 1,
              nodeName: prev?.nodeName || node.name,
            });
          }
        }
      }

      // Typography
      const style = node.style;
      if (style && style.fontFamily) {
        const key = `${style.fontFamily}|${style.fontWeight || 400}|${Math.round(style.fontSize || 0)}`;
        const prev = fonts.get(key);
        fonts.set(key, {
          family: style.fontFamily,
          weight: style.fontWeight || 400,
          size: style.fontSize || 0,
          lineHeight: style.lineHeightPx || null,
          letterSpacing: style.letterSpacing || 0,
          count: (prev?.count || 0) + 1,
        });
      }

      // Corner radius
      if (typeof node.cornerRadius === "number" && node.cornerRadius > 0) {
        radii.set(
          node.cornerRadius,
          (radii.get(node.cornerRadius) || 0) + 1,
        );
      }

      // Padding / spacing from auto-layout
      if (node.paddingLeft > 0)
        spacingVals.set(
          node.paddingLeft,
          (spacingVals.get(node.paddingLeft) || 0) + 1,
        );
      if (node.paddingTop > 0)
        spacingVals.set(
          node.paddingTop,
          (spacingVals.get(node.paddingTop) || 0) + 1,
        );
      if (node.itemSpacing > 0)
        spacingVals.set(
          node.itemSpacing,
          (spacingVals.get(node.itemSpacing) || 0) + 1,
        );

      // Effects
      if (Array.isArray(node.effects)) {
        for (const eff of node.effects) {
          const key = `${eff.type}|${eff.radius || 0}`;
          const prev = effects.get(key);
          effects.set(key, {
            type: eff.type,
            radius: eff.radius || 0,
            color: eff.color || null,
            count: (prev?.count || 0) + 1,
          });
        }
      }

      // Recurse into children
      if (Array.isArray(node.children)) {
        for (const child of node.children) {
          walkNode(child);
        }
      }
    };

    walkNode(doc);

    // Assemble tokens
    const tokens = [];
    const makeId = () => `extracted-${++idCounter}`;

    // Bound variables (highest priority — these are actual Figma variables)
    for (const [varId, info] of boundVarIds) {
      tokens.push({
        id: makeId(),
        name: info.nodeName,
        value: varId,
        type: "VARIABLE_ALIAS",
        description: `Bound variable on "${info.property}" property (${varId})`,
        collectionName: "Bound Variables",
        source: "file-bound",
      });
    }

    // Fill colors sorted by usage
    const sortedColors = [...colors.entries()].sort(
      (a, b) => b[1].count - a[1].count,
    );
    for (const [hex, info] of sortedColors) {
      tokens.push({
        id: makeId(),
        name: `color-fill-${hex.slice(1).toLowerCase()}`,
        value: info.value,
        type: "COLOR",
        description: `Fill color used ${info.count}x (first on "${info.nodeName}")`,
        collectionName: "Fill Colors",
        source: "file-extracted",
      });
    }

    // Stroke colors sorted by usage
    const sortedStrokes = [...strokeColors.entries()].sort(
      (a, b) => b[1].count - a[1].count,
    );
    for (const [hex, info] of sortedStrokes) {
      // Skip if already in fill colors
      if (colors.has(hex)) continue;
      tokens.push({
        id: makeId(),
        name: `color-stroke-${hex.slice(1).toLowerCase()}`,
        value: info.value,
        type: "COLOR",
        description: `Stroke color used ${info.count}x (first on "${info.nodeName}")`,
        collectionName: "Stroke Colors",
        source: "file-extracted",
      });
    }

    // Font styles sorted by usage
    const sortedFonts = [...fonts.entries()].sort(
      (a, b) => b[1].count - a[1].count,
    );
    for (const [_key, info] of sortedFonts) {
      tokens.push({
        id: makeId(),
        name: `font-${info.family.toLowerCase().replace(/\s+/g, "-")}-${info.weight}-${Math.round(info.size)}`,
        value: `${info.family}, ${info.weight}, ${Math.round(info.size)}px`,
        type: "STRING",
        description: `Font used ${info.count}x — ${info.family} ${info.weight} @ ${Math.round(info.size)}px${info.lineHeight ? ` / ${Math.round(info.lineHeight)}px LH` : ""}`,
        collectionName: "Typography",
        source: "file-extracted",
      });
    }

    // Spacing values sorted by usage
    const sortedSpacing = [...spacingVals.entries()].sort(
      (a, b) => b[1] - a[1],
    );
    for (const [val, count] of sortedSpacing) {
      tokens.push({
        id: makeId(),
        name: `spacing-${Math.round(val)}`,
        value: val,
        type: "FLOAT",
        description: `Spacing value used ${count}x`,
        collectionName: "Spacing",
        source: "file-extracted",
      });
    }

    // Corner radii sorted by usage
    const sortedRadii = [...radii.entries()].sort((a, b) => b[1] - a[1]);
    for (const [val, count] of sortedRadii) {
      tokens.push({
        id: makeId(),
        name: `radius-${Math.round(val)}`,
        value: val,
        type: "FLOAT",
        description: `Corner radius used ${count}x`,
        collectionName: "Radii",
        source: "file-extracted",
      });
    }

    // Effects sorted by usage
    const sortedEffects = [...effects.entries()].sort(
      (a, b) => b[1].count - a[1].count,
    );
    for (const [_key, info] of sortedEffects) {
      const typeName = info.type
        .toLowerCase()
        .replace(/_/g, "-");
      tokens.push({
        id: makeId(),
        name: `effect-${typeName}${info.radius ? `-${Math.round(info.radius)}` : ""}`,
        value: info.radius || true,
        type: info.color ? "COLOR" : "FLOAT",
        description: `${info.type} effect${info.radius ? ` (radius ${Math.round(info.radius)}px)` : ""} used ${info.count}x`,
        collectionName: "Effects",
        source: "file-extracted",
      });
    }

    return tokens;
  }

  /**
   * Build a rich token-node association map for export.
   * Returns every node with its design properties (fills, strokes, typography,
   * spacing, radii, effects, bound variables) keyed by nodeId.
   * @param {string} fileId
   * @returns {Promise<object>} { nodes: Record<nodeId, NodeTokenRecord>, meta }
   */
  async getTokenNodeMap(fileId) {
    if (!fileId || typeof fileId !== "string" || !fileId.trim()) {
      const err = new Error("fileId is required");
      err.statusCode = 400;
      throw err;
    }

    const fileData = await this.getFigmaFile(fileId);
    const doc = fileData?.document;
    if (!doc) return { nodes: {}, meta: { fileName: "", nodeCount: 0 } };

    const rgbToHex = (c) => {
      const r = Math.round(Number(c.r) * 255);
      const g = Math.round(Number(c.g) * 255);
      const b = Math.round(Number(c.b) * 255);
      return `#${r.toString(16).padStart(2, "0").toUpperCase()}${g.toString(16).padStart(2, "0").toUpperCase()}${b.toString(16).padStart(2, "0").toUpperCase()}`;
    };

    const nodes = {};
    let nodeCount = 0;

    const walkNode = (node, parentPath = []) => {
      if (!node || typeof node !== "object") return;
      nodeCount++;

      const nodeId = node.id || "";
      const nodeName = node.name || "";
      const nodeType = node.type || "UNKNOWN";
      const path = [...parentPath, nodeName];

      // ── Parse boundVariables first so we can merge IDs into fills/strokes/etc. ──
      const bv = node.boundVariables || {};
      // Figma boundVariables shape: { fills: [{id, type}], strokes: [...], ...scalar props }
      // Array props (fills, strokes, effects) are index-aligned with the node arrays.
      // Scalar props (e.g. "fontSize", "cornerRadius") are a single binding object.
      const bvFills = Array.isArray(bv.fills) ? bv.fills : [];
      const bvStrokes = Array.isArray(bv.strokes) ? bv.strokes : [];
      const bvEffects = Array.isArray(bv.effects) ? bv.effects : [];
      // Collect scalar bound variable IDs for typography/layout/radius
      const bvScalars = {};
      for (const [prop, binding] of Object.entries(bv)) {
        if (["fills", "strokes", "effects"].includes(prop)) continue;
        const b = Array.isArray(binding) ? binding[0] : binding;
        if (b?.id) bvScalars[prop] = b.id;
      }

      // Collect design properties for this node
      const fills = [];
      const strokes = [];
      let typography = null;
      let layout = null;
      let cornerRadius = null;
      const effects = [];

      // Fills — merge variableId from boundVariables by index
      if (Array.isArray(node.fills)) {
        let visibleIdx = 0;
        for (let rawIdx = 0; rawIdx < node.fills.length; rawIdx++) {
          const fill = node.fills[rawIdx];
          if (fill.visible === false) continue;
          const entry = { type: fill.type, opacity: fill.opacity ?? 1 };
          if (fill.type === "SOLID" && fill.color) {
            entry.hex = rgbToHex(fill.color);
            entry.rgba = {
              r: fill.color.r,
              g: fill.color.g,
              b: fill.color.b,
              a: fill.color.a ?? 1,
            };
          }
          if (fill.type === "GRADIENT_LINEAR" || fill.type === "GRADIENT_RADIAL") {
            entry.gradientStops = (fill.gradientStops || []).map((s) => ({
              position: s.position,
              hex: s.color ? rgbToHex(s.color) : null,
            }));
          }
          // Merge variableId — boundVariables.fills[rawIdx] aligns with node.fills[rawIdx]
          if (bvFills[rawIdx]?.id) {
            entry.variableId = bvFills[rawIdx].id;
          }
          fills.push(entry);
          visibleIdx++;
        }
      }

      // Strokes — merge variableId by index
      if (Array.isArray(node.strokes)) {
        for (let rawIdx = 0; rawIdx < node.strokes.length; rawIdx++) {
          const stroke = node.strokes[rawIdx];
          if (stroke.visible === false) continue;
          const entry = { type: stroke.type, opacity: stroke.opacity ?? 1 };
          if (stroke.type === "SOLID" && stroke.color) {
            entry.hex = rgbToHex(stroke.color);
            entry.rgba = {
              r: stroke.color.r,
              g: stroke.color.g,
              b: stroke.color.b,
              a: stroke.color.a ?? 1,
            };
          }
          if (bvStrokes[rawIdx]?.id) {
            entry.variableId = bvStrokes[rawIdx].id;
          }
          strokes.push(entry);
        }
      }
      if (node.strokeWeight) {
        for (const s of strokes) s.weight = node.strokeWeight;
      }

      // Typography — merge scalar variableIds for font properties
      const style = node.style;
      if (style && style.fontFamily) {
        typography = {
          fontFamily: style.fontFamily,
          fontWeight: style.fontWeight || 400,
          fontSize: style.fontSize || 0,
          lineHeightPx: style.lineHeightPx || null,
          lineHeightUnit: style.lineHeightUnit || null,
          letterSpacing: style.letterSpacing || 0,
          textAlignHorizontal: style.textAlignHorizontal || null,
          textAlignVertical: style.textAlignVertical || null,
          textCase: style.textCase || null,
          textDecoration: style.textDecoration || null,
        };
        // Merge any typography-related variable bindings
        const typoVarKeys = [
          "fontFamily",
          "fontSize",
          "fontWeight",
          "lineHeight",
          "letterSpacing",
          "fontStyle",
        ];
        const typoVars = {};
        for (const k of typoVarKeys) {
          if (bvScalars[k]) typoVars[k] = bvScalars[k];
        }
        if (Object.keys(typoVars).length > 0) {
          typography.variableIds = typoVars;
        }
      }

      // Layout (auto-layout) — merge scalar variableIds for spacing
      if (
        node.layoutMode ||
        node.paddingLeft ||
        node.paddingTop ||
        node.itemSpacing
      ) {
        layout = {
          layoutMode: node.layoutMode || null,
          primaryAxisAlignItems: node.primaryAxisAlignItems || null,
          counterAxisAlignItems: node.counterAxisAlignItems || null,
          paddingLeft: node.paddingLeft || 0,
          paddingRight: node.paddingRight || 0,
          paddingTop: node.paddingTop || 0,
          paddingBottom: node.paddingBottom || 0,
          itemSpacing: node.itemSpacing || 0,
        };
        const layoutVarKeys = [
          "paddingLeft",
          "paddingRight",
          "paddingTop",
          "paddingBottom",
          "itemSpacing",
        ];
        const layoutVars = {};
        for (const k of layoutVarKeys) {
          if (bvScalars[k]) layoutVars[k] = bvScalars[k];
        }
        if (Object.keys(layoutVars).length > 0) {
          layout.variableIds = layoutVars;
        }
      }

      // Corner radius — merge variableId
      if (typeof node.cornerRadius === "number" && node.cornerRadius > 0) {
        cornerRadius = { value: node.cornerRadius };
        if (bvScalars.topLeftRadius || bvScalars.cornerRadius) {
          cornerRadius.variableId =
            bvScalars.cornerRadius || bvScalars.topLeftRadius;
        }
      } else if (node.rectangleCornerRadii) {
        cornerRadius = { value: node.rectangleCornerRadii };
        const radiusVars = {};
        for (const k of [
          "topLeftRadius",
          "topRightRadius",
          "bottomLeftRadius",
          "bottomRightRadius",
        ]) {
          if (bvScalars[k]) radiusVars[k] = bvScalars[k];
        }
        if (Object.keys(radiusVars).length > 0) {
          cornerRadius.variableIds = radiusVars;
        }
      }

      // Effects — merge variableId by index
      if (Array.isArray(node.effects)) {
        for (let rawIdx = 0; rawIdx < node.effects.length; rawIdx++) {
          const eff = node.effects[rawIdx];
          if (eff.visible === false) continue;
          const entry = {
            type: eff.type,
            radius: eff.radius || 0,
          };
          if (eff.color) {
            entry.hex = rgbToHex(eff.color);
            entry.rgba = eff.color;
          }
          if (eff.offset) entry.offset = eff.offset;
          if (eff.spread !== undefined) entry.spread = eff.spread;
          if (bvEffects[rawIdx]?.id) {
            entry.variableId = bvEffects[rawIdx].id;
          }
          effects.push(entry);
        }
      }

      // Only emit nodes that have at least one design property
      const hasProps =
        fills.length > 0 ||
        strokes.length > 0 ||
        typography ||
        layout ||
        cornerRadius ||
        effects.length > 0;

      if (hasProps) {
        const record = {
          nodeId,
          nodeName,
          nodeType,
          path: path.join(" > "),
        };
        if (fills.length > 0) record.fills = fills;
        if (strokes.length > 0) record.strokes = strokes;
        if (typography) record.typography = typography;
        if (layout) record.layout = layout;
        if (cornerRadius) record.cornerRadius = cornerRadius;
        if (effects.length > 0) record.effects = effects;
        // Dimensions
        if (node.absoluteBoundingBox) {
          record.dimensions = {
            width: node.absoluteBoundingBox.width,
            height: node.absoluteBoundingBox.height,
          };
        }
        // Component metadata
        if (node.componentId) record.componentId = node.componentId;
        if (node.componentProperties)
          record.componentProperties = node.componentProperties;

        nodes[nodeId] = record;
      }

      // Recurse
      if (Array.isArray(node.children)) {
        for (const child of node.children) {
          walkNode(child, path);
        }
      }
    };

    walkNode(doc);

    return {
      nodes,
      meta: {
        fileName: fileData.name || "",
        lastModified: fileData.lastModified || "",
        version: fileData.version || "",
        schemaVersion: fileData.schemaVersion || 0,
        nodeCount,
        nodesWithTokens: Object.keys(nodes).length,
      },
    };
  }

  /**
   * Extract CSS-like properties from a Figma node.
   * @param {object} node - Figma document node
   * @returns {Record<string, {value: any, type: string}>}
   */
  extractComponentProperties(node) {
    if (!node || typeof node !== "object") {
      return {};
    }

    const properties = {};

    // Dimensions from absoluteBoundingBox
    const bbox = node.absoluteBoundingBox;
    if (bbox) {
      if (bbox.width !== undefined) {
        properties.width = { value: bbox.width, type: "dimension" };
      }
      if (bbox.height !== undefined) {
        properties.height = { value: bbox.height, type: "dimension" };
      }
      if (bbox.x !== undefined) {
        properties.x = { value: bbox.x, type: "position" };
      }
      if (bbox.y !== undefined) {
        properties.y = { value: bbox.y, type: "position" };
      }
    }

    // Background color
    const bg = node.backgroundColor;
    if (bg) {
      properties.backgroundColor = {
        value: {
          r: bg.r ?? 0,
          g: bg.g ?? 0,
          b: bg.b ?? 0,
          a: bg.a ?? 1,
        },
        type: "color",
      };
    }

    // Fills
    if (Array.isArray(node.fills) && node.fills.length > 0) {
      properties.fills = {
        value: node.fills.map((fill) => ({
          type: fill.type,
          color: fill.color || null,
          opacity: fill.opacity ?? 1,
        })),
        type: "fills",
      };
    }

    // Strokes
    if (Array.isArray(node.strokes) && node.strokes.length > 0) {
      properties.strokes = {
        value: node.strokes.map((stroke) => ({
          type: stroke.type,
          color: stroke.color || null,
        })),
        type: "strokes",
      };
    }

    // Corner radius
    if (node.cornerRadius !== undefined) {
      properties.cornerRadius = { value: node.cornerRadius, type: "dimension" };
    }

    // Opacity
    if (node.opacity !== undefined) {
      properties.opacity = { value: node.opacity, type: "number" };
    }

    // Effects (shadows, blurs)
    if (Array.isArray(node.effects) && node.effects.length > 0) {
      properties.effects = {
        value: node.effects.map((effect) => ({
          type: effect.type,
          visible: effect.visible ?? true,
          radius: effect.radius,
          color: effect.color || null,
          offset: effect.offset || null,
        })),
        type: "effects",
      };
    }

    return properties;
  }

  /**
   * Fetch dev resources attached to nodes in a Figma file.
   * @param {string} fileId
   * @returns {Promise<Array<{id: string, name: string, url: string, node_id: string}>>}
   */
  async getDevResources(fileId) {
    if (!fileId || typeof fileId !== "string" || !fileId.trim()) {
      const err = new Error("fileId is required");
      err.statusCode = 400;
      throw err;
    }

    try {
      const data = await this.#fetchApi(
        `/files/${encodeURIComponent(fileId.trim())}/dev_resources`,
      );
      return data?.dev_resources || [];
    } catch (err) {
      // Dev resources endpoint may not be available on all plans — return empty
      if (err.statusCode === 403 || err.statusCode === 404) {
        return [];
      }
      throw err;
    }
  }

  /**
   * Recursively find a node by ID in the Figma document tree.
   * @param {object} root - Root node to search from
   * @param {string} nodeId - Node ID to find
   * @returns {object | null}
   */
  findNodeById(root, nodeId) {
    if (!root || typeof root !== "object" || !nodeId) {
      return null;
    }

    if (root.id === nodeId) {
      return root;
    }

    const children = root.children;
    if (Array.isArray(children)) {
      for (const child of children) {
        const found = this.findNodeById(child, nodeId);
        if (found) {
          return found;
        }
      }
    }

    return null;
  }

  /**
   * Recursively collect all COMPONENT nodes from the document tree.
   * @param {object} root - Root node to search from
   * @param {Array} [result=[]] - Accumulator (internal)
   * @returns {Array<object>}
   */
  getAllComponentNodes(root, result = []) {
    if (!root || typeof root !== "object") {
      return result;
    }

    if (root.type === "COMPONENT") {
      result.push(root);
    }

    const children = root.children;
    if (Array.isArray(children)) {
      for (const child of children) {
        this.getAllComponentNodes(child, result);
      }
    }

    return result;
  }
}
