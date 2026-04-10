import { remote } from "webdriverio";
import { createRunner } from "@puppeteer/replay";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class ReplayExtension {
  constructor(browser, page) {
    this.browser = browser;
    this.page = page;
    this.startTime = Date.now();
    this.imgCounter = 0;
    this.cmds = [];
    this.stepIndex = 0;
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

  async runStep(step, flow) {
    console.log("run", step.type, step.url || "");

    const index = this.stepIndex++;
    const startTime = Date.now();
    this.stepWarnings = [];
    let err;
    let resolvedSelector = null;

    try {
      resolvedSelector = await this.defaultRunStep(step);
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

  async defaultRunStep(step) {
    switch (step.type) {
      case "setViewport":
        await this.page.setViewport({
          width: step.width,
          height: step.height,
          deviceScaleFactor: step.deviceScaleFactor || 1,
          isMobile: step.isMobile || false,
          hasTouch: step.hasTouch || false,
          isLandscape: step.isLandscape || false,
        });
        return null;
      case "navigate":
        await this.page.goto(step.url, { waitUntil: "networkidle0" });
        return null;
      case "click":
        return this.handleClick(step);
      case "change":
        return this.handleChange(step);
      case "keyDown":
        await this.page.keyboard.down(step.key);
        return null;
      case "keyUp":
        await this.page.keyboard.up(step.key);
        return null;
      case "waitForElement":
        return this.handleWaitForElement(step);
      default:
        this.warn(`Unhandled step type: ${step.type}`);
        return null;
    }
  }

  async handleClick(step) {
    for (const selectorGroup of step.selectors || []) {
      for (const selector of selectorGroup) {
        try {
          if (selector.startsWith("pierce/") || selector.startsWith("aria/")) {
            continue;
          }
          await this.page.waitForSelector(selector, { timeout: 5000 });
          await this.page.click(selector, {
            offset: {
              x: step.offsetX || 0,
              y: step.offsetY || 0,
            },
          });
          return selector;
        } catch {
          // Try next selector
        }
      }
    }
    this.warn(`Selector could not be resolved from: ${JSON.stringify(step.selectors?.[0])}`);
    return null;
  }

  async handleChange(step) {
    for (const selectorGroup of step.selectors || []) {
      for (const selector of selectorGroup) {
        try {
          if (selector.startsWith("pierce/") || selector.startsWith("aria/")) {
            continue;
          }
          await this.page.waitForSelector(selector, { timeout: 5000 });
          const el = await this.page.$(selector);
          await el.click({ clickCount: 3 });
          await el.type(step.value);
          return selector;
        } catch {
          // Try next selector
        }
      }
    }
    this.warn(`Selector could not be resolved from: ${JSON.stringify(step.selectors?.[0])}`);
    return null;
  }

  async handleWaitForElement(step) {
    // Selectors can be flat [".cls"] or nested [[".cls"]]
    const selectors = (step.selectors || []).map((s) =>
      Array.isArray(s) ? s : [s]
    );

    for (const selectorGroup of selectors) {
      for (const selector of selectorGroup) {
        if (selector.startsWith("pierce/") || selector.startsWith("aria/")) {
          continue;
        }
        const timeout = step.timeout || 30000;
        try {
          await this.page.waitForSelector(selector, {
            visible: step.visible || false,
            timeout,
          });
          return selector;
        } catch {
          this.warn(`Timed out after ${timeout}ms waiting for "${selector}" to be ${step.visible ? "visible" : "present"}`);
        }
      }
    }
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
      runner: "webdriverio-puppeteer",
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
  const browser = await remote({
    automationProtocol: "devtools",
    capabilities: {
      browserName: "chrome",
      browserVersion: "latest",
      platformName: "Windows 11",
      "goog:chromeOptions": {
        args: ["--headless"],
      },
    },
  });

  try {
    const puppeteerBrowser = await browser.getPuppeteer();
    const pages = await puppeteerBrowser.pages();
    const page = pages[0];

    const recordingPath = path.join(__dirname, "replay.json");
    const recording = parseRecording(recordingPath);

    const extension = new ReplayExtension(puppeteerBrowser, page);
    const runner = await createRunner(recording, extension);
    await runner.run();

    console.log("Replay completed successfully");
  } catch (error) {
    console.error("Replay Failed:", error);
  } finally {
    await browser.deleteSession();
  }
})();
