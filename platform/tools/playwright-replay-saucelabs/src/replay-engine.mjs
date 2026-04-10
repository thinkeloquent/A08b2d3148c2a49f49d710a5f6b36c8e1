import fs from "fs";
import path from "path";
import { resolveSaucelabsEnv } from "@internal/env-resolver";

// ──────────────────────────────────────────────
//  W3C WebDriver special-key code points
// ──────────────────────────────────────────────
const WD_KEYS = {
  Enter: "\uE007",
  Escape: "\uE00C",
  ArrowUp: "\uE013",
  ArrowDown: "\uE015",
  ArrowLeft: "\uE012",
  ArrowRight: "\uE014",
  Backspace: "\uE003",
  Delete: "\uE017",
  Tab: "\uE004",
  Home: "\uE011",
  End: "\uE010",
  PageUp: "\uE00E",
  PageDown: "\uE00F",
  Meta: "\uE03D",
  Control: "\uE009",
  Shift: "\uE008",
  Alt: "\uE00A",
  Space: "\uE00D",
};

// Chrome Recorder key name (lowercase) → WebDriver key value
const recorderKeyMap = {
  enter: WD_KEYS.Enter,
  escape: WD_KEYS.Escape,
  arrowup: WD_KEYS.ArrowUp,
  arrowdown: WD_KEYS.ArrowDown,
  arrowleft: WD_KEYS.ArrowLeft,
  arrowright: WD_KEYS.ArrowRight,
  backspace: WD_KEYS.Backspace,
  delete: WD_KEYS.Delete,
  tab: WD_KEYS.Tab,
  home: WD_KEYS.Home,
  end: WD_KEYS.End,
  pageup: WD_KEYS.PageUp,
  pagedown: WD_KEYS.PageDown,
  meta: WD_KEYS.Meta,
  control: WD_KEYS.Control,
  shift: WD_KEYS.Shift,
  alt: WD_KEYS.Alt,
  " ": WD_KEYS.Space,
};

function resolveKey(key) {
  return recorderKeyMap[key.toLowerCase()] || key;
}

// ──────────────────────────────────────────────
//  Selector helpers
// ──────────────────────────────────────────────

/**
 * Resolve the best selector from a Chrome Recorder selector group.
 * Filters out aria/ selectors, converts xpath/ and pierce/ to usable format.
 * Tries each candidate against the live DOM with a 250ms wait, returns
 * the first one that exists. Falls back to static preference if none found.
 */
export async function handleSelectors(selectors, flow, browser) {
  if (!selectors || selectors.length === 0) return { selector: null };

  const normalized = selectors.map((s) => (Array.isArray(s) ? s : [s]));
  const candidates = [];

  for (const group of normalized) {
    for (const selector of group) {
      if (selector.startsWith("aria/")) continue;

      if (selector.startsWith("pierce/")) {
        candidates.push({
          selector: selector.slice("pierce/".length),
          type: "pierce",
        });
        continue;
      }

      if (selector.startsWith("xpath/")) {
        // WebDriverIO auto-detects XPath when string starts with //
        candidates.push({
          selector: selector.slice("xpath/".length),
          type: "xpath",
        });
        continue;
      }

      candidates.push({ selector, type: "css" });
    }
  }

  if (candidates.length === 0) return { selector: null };

  if (flow?.selectorAttribute) {
    const preferred = candidates.find((c) =>
      c.selector.includes(flow.selectorAttribute),
    );
    if (preferred) {
      console.log(`  selector [preferred] ${preferred.selector}`);
      return { selector: preferred.selector, selectorIndex: null, selectorTotal: candidates.length, match: "preferred" };
    }
  }

  // Try each candidate with 250ms wait, return first that exists
  if (browser) {
    for (let i = 0; i < candidates.length; i++) {
      const c = candidates[i];
      try {
        const el = await browser.$(c.selector);
        await el.waitForExist({ timeout: 250 });
        console.log(`  selector [${i}/${candidates.length}] found: ${c.selector}`);
        return { selector: c.selector, selectorIndex: i, selectorTotal: candidates.length, match: "live" };
      } catch {
        // selector not present, try next
      }
    }
  }

  // Static fallback
  const css = candidates.find((c) => c.type === "css");
  if (css) {
    console.log(`  selector [fallback] static css: ${css.selector}`);
    return { selector: css.selector, selectorIndex: null, selectorTotal: candidates.length, match: "fallback" };
  }

  const pierce = candidates.find((c) => c.type === "pierce");
  if (pierce) {
    console.log(`  selector [fallback] static pierce: ${pierce.selector}`);
    return { selector: pierce.selector, selectorIndex: null, selectorTotal: candidates.length, match: "fallback" };
  }

  console.log(`  selector [fallback] static first: ${candidates[0].selector}`);
  return { selector: candidates[0].selector, selectorIndex: null, selectorTotal: candidates.length, match: "fallback" };
}

// ──────────────────────────────────────────────
//  ReplayExtension  (WebDriverIO / Sauce Labs)
// ──────────────────────────────────────────────

export class ReplayExtension {
  /**
   * @param {import('webdriverio').Browser} browser – WebDriverIO remote instance
   * @param {string} artifactsDir – local directory for screenshots & log.json
   */
  constructor(browser, artifactsDir, config = {}) {
    this.browser = browser;
    this.artifactsDir = artifactsDir;
    this.config = config;
    this.ignoreErrors = config.ignoreErrors || [];
    this.startTime = Date.now();
    this.imgCounter = 0;
    this.cmds = [];
    this.stepWarnings = [];
  }

  warn(msg) {
    this.stepWarnings.push(msg);
    console.warn(msg);
  }

  // ── lifecycle ───────────────────────────────

  async beforeAllSteps(flow) {
    console.log(`Replaying flow '${flow.title}'`);
    // Set generous page-load timeout
    await this.browser.setTimeout({
      pageLoad: 60000,
      implicit: 0,
      script: 30000,
    });
  }

  async beforeEachStep(step, flow) {}

  async runStep(step, flow, index) {
    console.log("run", step.type, step.url || "");

    const startTime = Date.now();
    this.stepWarnings = [];
    let err;
    let stepResult = null;

    try {
      stepResult = await this.defaultRunStep(step, flow);
    } catch (e) {
      err = e;
    }

    // stepResult is either null (no selector) or { selector, selectorIndex, selectorTotal, match }
    const resolvedSelector = stepResult?.selector || null;
    const selectorLookup = stepResult && resolvedSelector
      ? { selector: resolvedSelector, index: stepResult.selectorIndex, total: stepResult.selectorTotal, match: stepResult.match }
      : null;

    const warnings = [...this.stepWarnings];
    const hasError = !!err;
    const hasWarnings = warnings.length > 0;

    const screenshotFile = await this.screenshot();

    let pageUrl;
    try {
      pageUrl = await this.browser.getUrl();
    } catch {
      pageUrl = null;
    }

    // On error, capture outerHTML of target's grandparent for debugging
    let domSnapshot = null;
    if (hasError && resolvedSelector) {
      try {
        domSnapshot = await this.browser.execute(function (sel) {
          var el = document.querySelector(sel);
          if (!el) return { found: false, selector: sel };
          var target =
            el.parentElement?.parentElement || el.parentElement || el;
          return { found: true, selector: sel, outerHTML: target.outerHTML };
        }, resolvedSelector);
      } catch {
        domSnapshot = { found: false, error: "Could not capture DOM snapshot" };
      }
    }

    this.cmds.push({
      index,
      method: step.type,
      status: hasError ? "failed" : hasWarnings ? "warning" : "passed",
      selector: resolvedSelector,
      ...(selectorLookup ? { selectorLookup } : {}),
      url: step.url || pageUrl,
      start_time: new Date(startTime).toISOString(),
      duration: (Date.now() - startTime) / 1000,
      screenshot: screenshotFile,
      request: step,
      result: hasError ? err.message : null,
      warnings,
      ...(domSnapshot ? { domSnapshot } : {}),
    });

    if (err) {
      const ignored = this.ignoreErrors.includes(step.type);
      if (ignored) {
        console.warn(
          `[IGNORED ERROR] step=${step.type} selector=${resolvedSelector || "N/A"} error=${err.message}`,
        );
        // Downgrade to warning status instead of failed
        const lastCmd = this.cmds[this.cmds.length - 1];
        lastCmd.status = "warning";
        lastCmd.warnings.push(
          `Ignored error: step=${step.type} selector=${resolvedSelector || "N/A"} error=${err.message}`,
        );
      } else {
        this.writeLog(flow);
        throw err;
      }
    }
  }

  async afterEachStep(step, flow) {}

  async afterAllSteps(flow) {
    this.writeLog(flow);
    console.log("Done");
  }

  // ── step router ─────────────────────────────

  async defaultRunStep(step, flow) {
    switch (step.type) {
      case "setViewport":
        return this.handleSetViewport(step);
      case "navigate":
        return this.handleNavigate(step);
      case "click":
        return this.handleClick(step, flow);
      case "doubleClick":
        return this.handleDoubleClick(step, flow);
      case "change":
        return this.handleChange(step, flow);
      case "keyDown":
        return this.handleKeyDown(step);
      case "keyUp":
        return this.handleKeyUp(step);
      case "hover":
        return this.handleHover(step, flow);
      case "scroll":
        return this.handleScroll(step, flow);
      case "waitForElement":
        return this.handleWaitForElement(step, flow);
      case "waitForExpression":
        return this.handleWaitForExpression(step);
      default:
        this.warn(`Unhandled step type: ${step.type}`);
        return null;
    }
  }

  // ── step handlers ───────────────────────────

  async handleSetViewport(step) {
    await this.browser.setWindowSize(step.width, step.height);
    return null;
  }

  async handleNavigate(step) {
    await this.browser.url(step.url);
    // browser.url() already waits for pageLoad per the timeout we set
    return null;
  }

  // Click offset handling:
  //   Chrome Recorder records offsets from the element's top-left corner,
  //   but WebDriverIO expects offsets relative to the element's center.
  //   We convert by subtracting (width/2, height/2) from the recorded values.
  //   If the converted position would land outside the element bounds, the
  //   offset is dropped and we click the element center instead.
  //
  // 3-tier fallback strategy:
  //   1. Click with converted center-relative offset
  //   2. Click without any offset (element center)
  //   3. JavaScript el.click() — bypasses overlays and intercepted-click errors
  async handleClick(step, flow) {
    const result = await handleSelectors(step.selectors, flow, this.browser);
    if (!result.selector) {
      this.warn(
        `Selector could not be resolved from: ${JSON.stringify(step.selectors?.[0])}`,
      );
      return result;
    }

    const element = await this.browser.$(result.selector);
    if (step.waitForDisplay) {
      await element.waitForDisplayed({ timeout: 5000 });
    }
    await this.browser.execute(function (el) {
      el.scrollIntoView({ block: "center" });
    }, element);

    const clickOptions = {};
    if (step.button === "secondary") {
      clickOptions.button = "right";
    }

    // Tier 1: try click with converted offset
    try {
      if (step.offsetX != null || step.offsetY != null) {
        // Convert top-left origin (Chrome Recorder) → center origin (WebDriverIO)
        const size = await element.getSize();
        const cx = Math.round((step.offsetX || 0) - size.width / 2);
        const cy = Math.round((step.offsetY || 0) - size.height / 2);
        // Only apply if the point stays inside the element
        if (Math.abs(cx) <= size.width / 2 && Math.abs(cy) <= size.height / 2) {
          clickOptions.x = cx;
          clickOptions.y = cy;
        }
        // Otherwise fall through — click element center (no x/y)
      }
      await element.click(clickOptions);
    } catch (e) {
      // Tier 2: retry without offset (plain element-center click)
      try {
        await element.click(
          step.button === "secondary" ? { button: "right" } : {},
        );
      } catch (e2) {
        // Tier 3: JS click — works even when another element intercepts the click
        this.warn(
          `Click intercepted on "${result.selector}", retried with JS click (${e2.message.split("\n")[0]})`,
        );
        await this.browser.execute(function (el) {
          el.click();
        }, element);
      }
    }
    return result;
  }

  async handleDoubleClick(step, flow) {
    const result = await handleSelectors(step.selectors, flow, this.browser);
    if (!result.selector) {
      this.warn(
        `Selector could not be resolved from: ${JSON.stringify(step.selectors?.[0])}`,
      );
      return result;
    }

    const element = await this.browser.$(result.selector);
    if (step.waitForDisplay) {
      await element.waitForDisplayed({ timeout: 5000 });
    }
    await element.doubleClick();
    return result;
  }

  async handleChange(step, flow) {
    const result = await handleSelectors(step.selectors, flow, this.browser);
    if (!result.selector) {
      this.warn(
        `Selector could not be resolved from: ${JSON.stringify(step.selectors?.[0])}`,
      );
      return result;
    }

    const element = await this.browser.$(result.selector);
    if (step.waitForDisplay) {
      await element.waitForDisplayed({ timeout: 5000 });
    }
    await element.clearValue();
    await element.setValue(step.value);
    return result;
  }

  async handleKeyDown(step) {
    const keyValue = resolveKey(step.key);
    await this.browser.performActions([
      {
        type: "key",
        id: "keyboard",
        actions: [{ type: "keyDown", value: keyValue }],
      },
    ]);
    return null;
  }

  async handleKeyUp(step) {
    const keyValue = resolveKey(step.key);
    await this.browser.performActions([
      {
        type: "key",
        id: "keyboard",
        actions: [{ type: "keyUp", value: keyValue }],
      },
    ]);
    return null;
  }

  async handleHover(step, flow) {
    const result = await handleSelectors(step.selectors, flow, this.browser);
    if (!result.selector) {
      this.warn(
        `Selector could not be resolved from: ${JSON.stringify(step.selectors?.[0])}`,
      );
      return result;
    }

    const element = await this.browser.$(result.selector);
    if (step.waitForDisplay) {
      await element.waitForDisplayed({ timeout: 5000 });
    }
    await element.moveTo();
    return result;
  }

  async handleScroll(step, flow) {
    if (step.selectors) {
      const result = await handleSelectors(step.selectors, flow, this.browser);
      if (result.selector) {
        const element = await this.browser.$(result.selector);
        await element.scrollIntoView();
        return result;
      }
    }
    // Scroll the page by the given offset via JavaScript
    await this.browser.execute(
      (x, y) => window.scrollBy(x, y),
      step.x || 0,
      step.y || 0,
    );
    return null;
  }

  async handleWaitForElement(step, flow) {
    const result = await handleSelectors(step.selectors, flow, this.browser);
    if (!result.selector) {
      this.warn(
        `Selector could not be resolved from: ${JSON.stringify(step.selectors)}`,
      );
      return result;
    }

    const timeout = step.timeout || 30000;
    try {
      const element = await this.browser.$(result.selector);
      if (step.visible) {
        await element.waitForDisplayed({ timeout });
      } else {
        await element.waitForExist({ timeout });
      }
    } catch {
      const state = step.visible ? "visible" : "attached";
      this.warn(
        `Timed out after ${timeout}ms waiting for "${result.selector}" to be ${state}`,
      );
    }
    return result;
  }

  async handleWaitForExpression(step) {
    const timeout = step.timeout || 30000;
    const expression = step.expression;
    await this.browser.waitUntil(
      async () => {
        const result = await this.browser.execute(`return !!(${expression})`);
        return result;
      },
      {
        timeout,
        timeoutMsg: `waitForExpression timed out after ${timeout}ms: ${expression}`,
      },
    );
    return null;
  }

  // ── reporting / artifacts ───────────────────

  writeLog(flow) {
    if (!fs.existsSync(this.artifactsDir)) {
      fs.mkdirSync(this.artifactsDir, { recursive: true });
    }

    const endTime = Date.now();
    const passed = this.cmds.filter((c) => c.status === "passed").length;
    const failed = this.cmds.filter((c) => c.status === "failed").length;
    const warning = this.cmds.filter((c) => c.status === "warning").length;

    const report = {
      title: flow?.title || "Untitled Recording",
      runner: "webdriverio-saucelabs",
      status:
        failed > 0
          ? "failed"
          : warning > 0
            ? "completed_with_warnings"
            : "passed",
      startTime: new Date(this.startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      duration: (endTime - this.startTime) / 1000,
      summary: { total: this.cmds.length, passed, failed, warning },
      steps: this.cmds,
    };

    fs.writeFileSync(
      path.join(this.artifactsDir, "log.json"),
      JSON.stringify(report, null, 2),
    );

    return report;
  }

  async screenshot() {
    const paddedCounter = String(this.imgCounter).padStart(4, "0");
    const filename = `${paddedCounter}screenshot.png`;
    if (!fs.existsSync(this.artifactsDir)) {
      fs.mkdirSync(this.artifactsDir, { recursive: true });
    }
    try {
      await this.browser.saveScreenshot(path.join(this.artifactsDir, filename));
    } catch (e) {
      console.error("Failed to take a screenshot:", e);
      return null;
    }
    this.imgCounter++;
    return filename;
  }
}

// ──────────────────────────────────────────────
//  Helpers
// ──────────────────────────────────────────────

export function parseRecording(recordingPath) {
  const content = fs.readFileSync(recordingPath, "utf8");
  return JSON.parse(content);
}

/**
 * Run a full replay session.
 * @returns {Promise<ReplayExtension>} – the extension instance (check .cmds for results)
 */
export async function runReplay(browser, recording, artifactsDir, config = {}) {
  const extension = new ReplayExtension(browser, artifactsDir, config);

  await extension.beforeAllSteps(recording);

  for (let i = 0; i < recording.steps.length; i++) {
    const step = recording.steps[i];
    await extension.beforeEachStep(step, recording);
    await extension.runStep(step, recording, i);
    await extension.afterEachStep(step, recording);
  }

  await extension.afterAllSteps(recording);

  return extension;
}

/**
 * Update the Sauce Labs job with pass/fail and optional custom data.
 */
export async function updateSauceJob(browser, passed, customData) {
  const _saucelabsEnv = resolveSaucelabsEnv();
  const username = _saucelabsEnv.username;
  const accessKey = _saucelabsEnv.accessKey;
  const region = _saucelabsEnv.region;
  const sessionId = browser.sessionId;

  if (!username || !accessKey || !sessionId) return;

  const body = { passed };
  if (customData) body["custom-data"] = customData;

  try {
    const response = await fetch(
      `https://api.${region}.saucelabs.com/rest/v1/${username}/jobs/${sessionId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Basic " +
            Buffer.from(`${username}:${accessKey}`).toString("base64"),
        },
        body: JSON.stringify(body),
      },
    );
    if (!response.ok) {
      console.warn(`Sauce Labs job update returned ${response.status}`);
    }
  } catch (e) {
    console.warn("Failed to update Sauce Labs job:", e.message);
  }
}
