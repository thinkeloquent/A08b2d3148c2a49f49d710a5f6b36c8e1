import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Mapping of Chrome Recorder key names to Playwright key names
const supportedRecorderKeys = {
  enter: "Enter",
  escape: "Escape",
  arrowup: "ArrowUp",
  arrowdown: "ArrowDown",
  arrowleft: "ArrowLeft",
  arrowright: "ArrowRight",
  backspace: "Backspace",
  delete: "Delete",
  tab: "Tab",
  home: "Home",
  end: "End",
  pageup: "PageUp",
  pagedown: "PageDown",
  meta: "Meta",
  control: "Control",
  shift: "Shift",
  alt: "Alt",
  " ": "Space",
};

/**
 * Resolve the best Playwright selector from a Chrome Recorder selector group.
 * Filters out aria/ selectors, converts xpath/ and pierce/ to Playwright format.
 * Prefers CSS selectors, falls back to xpath.
 */
function handleSelectors(selectors, flow) {
  if (!selectors || selectors.length === 0) return null;

  // Selectors can be nested [[".cls"]] or flat [".cls"] — normalize to nested
  const normalized = selectors.map((s) => (Array.isArray(s) ? s : [s]));
  const candidates = [];

  for (const selectorGroup of normalized) {
    for (const selector of selectorGroup) {
      if (selector.startsWith("aria/")) continue;

      if (selector.startsWith("pierce/")) {
        candidates.push({ selector: selector.slice("pierce/".length), type: "pierce" });
        continue;
      }

      if (selector.startsWith("xpath/")) {
        candidates.push({ selector: "xpath=" + selector.slice("xpath/".length), type: "xpath" });
        continue;
      }

      candidates.push({ selector, type: "css" });
    }
  }

  if (candidates.length === 0) return null;

  if (flow?.selectorAttribute) {
    const preferred = candidates.find((c) =>
      c.selector.includes(flow.selectorAttribute)
    );
    if (preferred) return preferred.selector;
  }

  const css = candidates.find((c) => c.type === "css");
  if (css) return css.selector;

  const pierce = candidates.find((c) => c.type === "pierce");
  if (pierce) return pierce.selector;

  return candidates[0].selector;
}

class ReplayExtension {
  constructor(browser, page) {
    this.browser = browser;
    this.page = page;
    this.startTime = Date.now();
    this.imgCounter = 0;
    this.cmds = [];
    // Per-step warning accumulator — populated by handlers, read/cleared by runStep
    this.stepWarnings = [];
  }

  warn(msg) {
    this.stepWarnings.push(msg);
    console.warn(msg);
  }

  async beforeAllSteps(flow) {
    console.log(`Replaying flow '${flow.title}'`);
  }

  async beforeEachStep(step, flow) {}

  async runStep(step, flow, index) {
    console.log("run", step.type, step.url || "");

    const startTime = Date.now();
    this.stepWarnings = [];
    let err;
    let resolvedSelector = null;

    try {
      resolvedSelector = await this.defaultRunStep(step, flow);
    } catch (e) {
      err = e;
    }

    const warnings = [...this.stepWarnings];
    const hasError = !!err;
    const hasWarnings = warnings.length > 0;

    const screenshotFile = await this.screenshot();

    let pageUrl;
    try { pageUrl = this.page.url(); } catch { pageUrl = null; }

    this.cmds.push({
      index,
      method: step.type,
      status: hasError ? "failed" : hasWarnings ? "warning" : "passed",
      selector: resolvedSelector,
      url: step.url || pageUrl,
      start_time: new Date(startTime).toISOString(),
      duration: (Date.now() - startTime) / 1000,
      screenshot: screenshotFile,
      request: step,
      result: hasError ? err.message : null,
      warnings,
    });

    if (err) {
      this.writeLog(flow);
      throw err;
    }
  }

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

  async handleSetViewport(step) {
    await this.page.setViewportSize({
      width: step.width,
      height: step.height,
    });
    return null;
  }

  async handleNavigate(step) {
    await this.page.goto(step.url, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });
    return null;
  }

  async handleClick(step, flow) {
    const selector = handleSelectors(step.selectors, flow);
    if (!selector) {
      this.warn(
        `Selector could not be resolved from: ${JSON.stringify(step.selectors?.[0])}`
      );
      return null;
    }

    const locator = this.page.locator(selector);
    await locator.waitFor({ state: "visible", timeout: 5000 });

    const clickOptions = { timeout: 5000 };
    if (step.offsetX != null || step.offsetY != null) {
      clickOptions.position = {
        x: step.offsetX || 0,
        y: step.offsetY || 0,
      };
    }
    if (step.button === "secondary") {
      clickOptions.button = "right";
    }

    try {
      await locator.click(clickOptions);
    } catch (e) {
      this.warn(`Click intercepted on "${selector}", retried with force: true (${e.message.split("\n")[0]})`);
      await locator.click({ ...clickOptions, force: true });
    }
    return selector;
  }

  async handleDoubleClick(step, flow) {
    const selector = handleSelectors(step.selectors, flow);
    if (!selector) {
      this.warn(
        `Selector could not be resolved from: ${JSON.stringify(step.selectors?.[0])}`
      );
      return null;
    }

    const locator = this.page.locator(selector);
    await locator.waitFor({ state: "visible", timeout: 5000 });
    await locator.dblclick();
    return selector;
  }

  async handleChange(step, flow) {
    const selector = handleSelectors(step.selectors, flow);
    if (!selector) {
      this.warn(
        `Selector could not be resolved from: ${JSON.stringify(step.selectors?.[0])}`
      );
      return null;
    }

    const locator = this.page.locator(selector);
    await locator.waitFor({ state: "visible", timeout: 5000 });
    await locator.fill(step.value);
    return selector;
  }

  async handleKeyDown(step) {
    const key = step.key.toLowerCase();
    const mappedKey = supportedRecorderKeys[key] || step.key;
    await this.page.keyboard.down(mappedKey);
    return null;
  }

  async handleKeyUp(step) {
    const key = step.key.toLowerCase();
    const mappedKey = supportedRecorderKeys[key] || step.key;
    await this.page.keyboard.up(mappedKey);
    return null;
  }

  async handleHover(step, flow) {
    const selector = handleSelectors(step.selectors, flow);
    if (!selector) {
      this.warn(
        `Selector could not be resolved from: ${JSON.stringify(step.selectors?.[0])}`
      );
      return null;
    }

    const locator = this.page.locator(selector);
    await locator.waitFor({ state: "visible", timeout: 5000 });
    await locator.hover();
    return selector;
  }

  async handleScroll(step, flow) {
    if (step.selectors) {
      const selector = handleSelectors(step.selectors, flow);
      if (selector) {
        const locator = this.page.locator(selector);
        await locator.scrollIntoViewIfNeeded();
        return selector;
      }
    }
    await this.page.mouse.wheel(step.x || 0, step.y || 0);
    return null;
  }

  async handleWaitForElement(step, flow) {
    const selector = handleSelectors(step.selectors, flow);
    if (!selector) {
      this.warn(`Selector could not be resolved from: ${JSON.stringify(step.selectors)}`);
      return null;
    }

    const timeout = step.timeout || 30000;
    const state = step.visible ? "visible" : "attached";
    try {
      await this.page.locator(selector).waitFor({ state, timeout });
    } catch {
      this.warn(`Timed out after ${timeout}ms waiting for "${selector}" to be ${state}`);
    }
    return selector;
  }

  async handleWaitForExpression(step) {
    await this.page.waitForFunction(step.expression, {
      timeout: step.timeout || 30000,
    });
    return null;
  }

  async afterEachStep(step, flow) {}

  async afterAllSteps(flow) {
    this.writeLog(flow);
    console.log("Done");
  }

  writeLog(flow) {
    const assetsDir = path.join(__dirname, "__artifacts__");
    if (!fs.existsSync(assetsDir)) {
      fs.mkdirSync(assetsDir, { recursive: true });
    }

    const endTime = Date.now();
    const passed = this.cmds.filter((c) => c.status === "passed").length;
    const failed = this.cmds.filter((c) => c.status === "failed").length;
    const warning = this.cmds.filter((c) => c.status === "warning").length;

    const report = {
      title: flow?.title || "Untitled Recording",
      runner: "playwright",
      status: failed > 0 ? "failed" : warning > 0 ? "completed_with_warnings" : "passed",
      startTime: new Date(this.startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      duration: (endTime - this.startTime) / 1000,
      summary: {
        total: this.cmds.length,
        passed,
        failed,
        warning,
      },
      steps: this.cmds,
    };

    fs.writeFileSync(
      path.join(assetsDir, "log.json"),
      JSON.stringify(report, null, 2),
    );
  }

  async screenshot() {
    const paddedCounter = String(this.imgCounter).padStart(4, "0");
    const filename = `${paddedCounter}screenshot.png`;
    const assetsDir = path.join(__dirname, "__artifacts__");
    if (!fs.existsSync(assetsDir)) {
      fs.mkdirSync(assetsDir, { recursive: true });
    }
    try {
      await this.page.screenshot({
        path: path.join(assetsDir, filename),
      });
    } catch (e) {
      console.error("Failed to take a screenshot:", e);
      return null;
    }
    this.imgCounter++;
    return filename;
  }
}

function parseRecording(recordingPath) {
  const content = fs.readFileSync(recordingPath, "utf8");
  return JSON.parse(content);
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
  });

  try {
    const context = await browser.newContext();
    const page = await context.newPage();

    // Parse the recording
    const recordingPath = path.join(__dirname, "replay.json");
    const recording = parseRecording(recordingPath);

    // Create the replay extension
    const extension = new ReplayExtension(browser, page);

    // Run the replay
    await extension.beforeAllSteps(recording);

    for (let i = 0; i < recording.steps.length; i++) {
      const step = recording.steps[i];
      await extension.beforeEachStep(step, recording);
      await extension.runStep(step, recording, i);
      await extension.afterEachStep(step, recording);
    }

    await extension.afterAllSteps(recording);

    console.log("Replay completed successfully");
  } catch (error) {
    console.error("Replay Failed:", error);
  } finally {
    await browser.close();
  }
})();
