import { chromium } from "playwright"; // or '@playwright/test'
(async () => {
  const browser = await chromium.launch({
    headless: false,
    // Expose the port for your external app/inspector
    args: ["--remote-debugging-port=9222"],
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto("https://www.nvidia.com/");

  // This pauses execution and opens the Playwright Inspector (Codegen)
  await page.pause();
})();
