import { remote } from "webdriverio";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import yaml from "js-yaml";
import { resolveSaucelabsEnv } from "@internal/env-resolver";
import {
  parseRecording,
  runReplay,
  updateSauceJob,
} from "./src/replay-engine.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

(async () => {
  // ── Configuration from env ──────────────────
  const _saucelabsEnv = resolveSaucelabsEnv();
  const username = _saucelabsEnv.username;
  const accessKey = _saucelabsEnv.accessKey;
  const region = _saucelabsEnv.region;
  const browserName = _saucelabsEnv.browser;
  const platformName = _saucelabsEnv.platform;
  const browserVersion = _saucelabsEnv.browserVersion;
  const tunnelName = _saucelabsEnv.tunnelName || undefined;

  if (!username || !accessKey) {
    console.error(
      "Error: Sauce Labs username and access key are required.\n" +
        "  export SAUCE_USERNAME=your_username\n" +
        "  export SAUCE_ACCESS_KEY=your_access_key\n",
    );
    process.exit(1);
  }

  // ── Load config ────────────────────────────
  const configPath = path.join(__dirname, "config.yaml");
  let config = {};
  if (fs.existsSync(configPath)) {
    config = yaml.load(fs.readFileSync(configPath, "utf8")) || {};
  }

  // ── Parse the recording ─────────────────────
  const recordingPath = path.join(__dirname, "replay.json");
  const artifactsDir = path.join(__dirname, "__artifacts__");
  const recording = parseRecording(recordingPath);

  // ── Connect to Sauce Labs ───────────────────
  console.log(
    `Connecting to Sauce Labs (${region}) — ${browserName} on ${platformName}...`,
  );

  const sauceOptions = {
    name: recording.title || "Chrome Recorder Replay",
    screenResolution: "1920x1080",
    recordVideo: true,
    recordScreenshots: true,
  };
  if (tunnelName) sauceOptions.tunnelName = tunnelName;

  const browser = await remote({
    user: username,
    key: accessKey,
    hostname: `ondemand.${region}.saucelabs.com`,
    port: 443,
    protocol: "https",
    path: "/wd/hub",
    capabilities: {
      browserName,
      platformName,
      browserVersion,
      "wdio:enforceWebDriverClassic": true,
      "sauce:options": sauceOptions,
    },
    logLevel: "warn",
  });

  const sessionId = browser.sessionId;
  console.log(`Sauce Labs session: ${sessionId}`);
  console.log(
    `Dashboard: https://app.${region}.saucelabs.com/tests/${sessionId}`,
  );

  try {
    // ── Run the replay ──────────────────────────
    const extension = await runReplay(browser, recording, artifactsDir, config);

    const failed = extension.cmds.filter((c) => c.status === "failed").length;
    const warnings = extension.cmds.filter(
      (c) => c.status === "warning",
    ).length;
    const passed = extension.cmds.filter((c) => c.status === "passed").length;

    console.log(
      `\nReplay summary: ${passed} passed, ${warnings} warnings, ${failed} failed ` +
        `out of ${extension.cmds.length} steps`,
    );

    // ── Report result to Sauce Labs ─────────────
    await updateSauceJob(browser, failed === 0, {
      replay_title: recording.title,
      total_steps: extension.cmds.length,
      passed,
      warnings,
      failed,
    });

    console.log("Replay completed successfully");
  } catch (error) {
    console.error("Replay Failed:", error);
    try {
      await updateSauceJob(browser, false);
    } catch {
      /* best-effort */
    }
  } finally {
    await browser.deleteSession();
  }
})();
