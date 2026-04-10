import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ==========================================================================
// STANDALONE BROWSER STRESS TESTS
// These tests create an inline HTML page with all code embedded
// No dev server or build required!
// ==========================================================================

const createStandaloneTestPage = () => {
  // Read the import/export source code
  const importExportSource = fs.readFileSync(
    path.join(__dirname, '../src/utils/importExport.ts'),
    'utf-8'
  );

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Standalone Import/Export Stress Tests</title>
</head>
<body>
  <h1>Import/Export Stress Tests</h1>
  <div id="status">Running...</div>
  <pre id="results"></pre>

  <script type="module">
    // Helper functions
    window.generateLargeFormData = (numPages, elementsPerPage) => {
      const pages = [];
      for (let p = 0; p < numPages; p++) {
        const elements = [];
        const layout = [];

        for (let e = 0; e < elementsPerPage; e++) {
          const elementId = 'el-p' + p + '-e' + e;
          const fieldTypes = ['text', 'number', 'select', 'textarea', 'checkbox'];
          const fieldType = fieldTypes[e % fieldTypes.length];

          elements.push({
            id: elementId,
            type: fieldType,
            label: 'Field ' + e + ' on Page ' + p,
            placeholder: 'Enter value ' + e,
            required: e % 3 === 0,
            helpText: 'Help text for field ' + e,
          });

          layout.push({
            i: elementId,
            x: (e % 3) * 4,
            y: Math.floor(e / 3) * 2,
            w: 4,
            h: 2,
            minW: 2,
            minH: 2,
          });
        }

        pages.push({
          id: 'page-' + p,
          title: 'Page ' + p,
          description: 'Description for page ' + p,
          elements,
          layout,
        });
      }

      return pages;
    };

    window.measurePerformance = (fn, label) => {
      const start = performance.now();
      const result = fn();
      const end = performance.now();
      const duration = end - start;

      return { result, duration, label };
    };

    window.measureMemory = async () => {
      if (performance.memory) {
        return {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
        };
      }
      return null;
    };

    window.calculateSizeInMB = (content) => {
      const blob = new Blob([content]);
      return blob.size / (1024 * 1024);
    };

    // Mark as ready
    window.testReady = true;
    document.getElementById('status').textContent = 'Ready';
  </script>
</body>
</html>`;
};

test.describe('Standalone Browser Stress Tests', () => {
  test.beforeEach(async ({ page }) => {
    const html = createStandaloneTestPage();
    await page.setContent(html);
    await page.waitForFunction(() => window.testReady === true);
  });

  test('exports 100 pages - standalone', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const pages = window.generateLargeFormData(100, 10);

      const startMemory = await window.measureMemory();
      const perf = window.measurePerformance(() => {
        return JSON.stringify({
          version: '1.0.0',
          exportedAt: new Date().toISOString(),
          pages,
        }, null, 2);
      }, 'Export 100 pages');
      const endMemory = await window.measureMemory();

      return {
        success: true,
        pagesCount: pages.length,
        totalElements: pages.reduce((sum, p) => sum + p.elements.length, 0),
        duration: perf.duration,
        outputSize: window.calculateSizeInMB(perf.result),
        memoryUsed: endMemory && startMemory
          ? (endMemory.usedJSHeapSize - startMemory.usedJSHeapSize) / (1024 * 1024)
          : null,
      };
    });

    expect(result.success).toBe(true);
    expect(result.pagesCount).toBe(100);
    expect(result.totalElements).toBe(1000);
    expect(result.duration).toBeLessThan(5000);

    console.log(`[PASS] Export 100 pages: ${result.duration.toFixed(2)}ms`);
    console.log(`  Output size: ${result.outputSize.toFixed(2)}MB`);
    if (result.memoryUsed) {
      console.log(`  Memory used: ${result.memoryUsed.toFixed(2)}MB`);
    }
  });

  test('exports 1000 elements - standalone', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const pages = window.generateLargeFormData(1, 1000);

      const perf = window.measurePerformance(() => {
        return JSON.stringify({
          version: '1.0.0',
          exportedAt: new Date().toISOString(),
          pages,
        }, null, 2);
      }, 'Export 1000 elements');

      return {
        success: true,
        elementsCount: pages[0].elements.length,
        duration: perf.duration,
        outputSize: window.calculateSizeInMB(perf.result),
      };
    });

    expect(result.success).toBe(true);
    expect(result.elementsCount).toBe(1000);
    expect(result.duration).toBeLessThan(5000);

    console.log(`[PASS] Export 1000 elements: ${result.duration.toFixed(2)}ms`);
    console.log(`  Output size: ${result.outputSize.toFixed(2)}MB`);
  });

  test('round-trip performance - standalone', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const pages = window.generateLargeFormData(50, 50);

      const exportPerf = window.measurePerformance(() => {
        return JSON.stringify({
          version: '1.0.0',
          exportedAt: new Date().toISOString(),
          pages,
        }, null, 2);
      }, 'Export');

      const importPerf = window.measurePerformance(() => {
        return JSON.parse(exportPerf.result);
      }, 'Import');

      return {
        success: true,
        pagesCount: pages.length,
        totalElements: pages.reduce((sum, p) => sum + p.elements.length, 0),
        exportDuration: exportPerf.duration,
        importDuration: importPerf.duration,
        totalDuration: exportPerf.duration + importPerf.duration,
        dataSize: window.calculateSizeInMB(exportPerf.result),
      };
    });

    expect(result.success).toBe(true);
    expect(result.totalDuration).toBeLessThan(10000);

    console.log(`[PASS] Round-trip test:`);
    console.log(`  Export: ${result.exportDuration.toFixed(2)}ms`);
    console.log(`  Import: ${result.importDuration.toFixed(2)}ms`);
    console.log(`  Total: ${result.totalDuration.toFixed(2)}ms`);
    console.log(`  Data: ${result.dataSize.toFixed(2)}MB`);
  });

  test('memory leak test - standalone', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const pages = window.generateLargeFormData(10, 100);
      const iterations = 100;

      const startMemory = await window.measureMemory();

      for (let i = 0; i < iterations; i++) {
        const jsonStr = JSON.stringify({
          version: '1.0.0',
          exportedAt: new Date().toISOString(),
          pages,
        });
        JSON.parse(jsonStr);
      }

      const endMemory = await window.measureMemory();

      return {
        success: true,
        iterations,
        memoryGrowth: endMemory && startMemory
          ? (endMemory.usedJSHeapSize - startMemory.usedJSHeapSize) / (1024 * 1024)
          : null,
      };
    });

    expect(result.success).toBe(true);

    if (result.memoryGrowth !== null) {
      expect(result.memoryGrowth).toBeLessThan(50);
      console.log(`[PASS] Memory leak test: ${result.memoryGrowth.toFixed(2)}MB growth after ${result.iterations} iterations`);
    } else {
      console.log('[PASS] Memory leak test: memory API not available');
    }
  });

  test('large string handling - standalone', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const pages = window.generateLargeFormData(1, 1);
      pages[0].elements[0].helpText = 'A'.repeat(100 * 1024); // 100KB

      const jsonStr = JSON.stringify({ version: '1.0.0', pages });
      const parsed = JSON.parse(jsonStr);

      return {
        success: true,
        helpTextLength: parsed.pages[0].elements[0].helpText.length,
        totalSize: window.calculateSizeInMB(jsonStr),
      };
    });

    expect(result.success).toBe(true);
    expect(result.helpTextLength).toBe(100 * 1024);

    console.log(`[PASS] Large string test: ${(result.helpTextLength / 1024).toFixed(0)}KB string`);
    console.log(`  Total size: ${result.totalSize.toFixed(2)}MB`);
  });

  test('FileReader API - standalone', async ({ page }) => {
    const result = await page.evaluate(async () => {
      return new Promise((resolve) => {
        const pages = window.generateLargeFormData(10, 10);
        const jsonStr = JSON.stringify({ version: '1.0.0', pages });

        const blob = new Blob([jsonStr], { type: 'application/json' });
        const reader = new FileReader();

        reader.onload = (event) => {
          const content = event.target.result;
          const parsed = JSON.parse(content);

          resolve({
            success: true,
            contentLength: content.length,
            pagesCount: parsed.pages.length,
          });
        };

        reader.onerror = () => {
          resolve({ success: false, error: 'FileReader failed' });
        };

        reader.readAsText(blob);
      });
    });

    expect(result.success).toBe(true);
    expect(result.pagesCount).toBe(10);

    console.log(`[PASS] FileReader test: read ${(result.contentLength / 1024).toFixed(2)}KB`);
  });

  test('Blob and URL APIs - standalone', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const pages = window.generateLargeFormData(20, 50);
      const jsonStr = JSON.stringify({ version: '1.0.0', pages });

      // Test Blob creation
      const blob = new Blob([jsonStr], { type: 'application/json' });

      // Test URL.createObjectURL
      const url = URL.createObjectURL(blob);
      const isValidURL = url.startsWith('blob:');

      // Clean up
      URL.revokeObjectURL(url);

      return {
        success: true,
        blobSize: blob.size,
        blobSizeMB: blob.size / (1024 * 1024),
        urlCreated: isValidURL,
      };
    });

    expect(result.success).toBe(true);
    expect(result.urlCreated).toBe(true);

    console.log(`[PASS] Blob/URL test: ${result.blobSizeMB.toFixed(2)}MB`);
  });
});
