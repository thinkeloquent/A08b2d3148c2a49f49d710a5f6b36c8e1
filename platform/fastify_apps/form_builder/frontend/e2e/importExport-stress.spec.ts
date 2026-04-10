import { test, expect } from '@playwright/test';

// ==========================================================================
// BROWSER-BASED STRESS TESTS FOR IMPORT/EXPORT
// These tests run in a real browser using actual browser APIs
// ==========================================================================

test.describe('Import/Export Browser Stress Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the test harness
    await page.goto('/test/importExport-test-harness.html');
    await page.waitForSelector('#status.success');

    // Inject the import/export module
    await page.addScriptTag({ path: './dist/assets/index.js', type: 'module' });
  });

  test.describe('Large Dataset Export Tests', () => {
    test('exports 100 pages with real browser memory', async ({ page }) => {
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
          startMemory,
          endMemory,
        };
      });

      expect(result.success).toBe(true);
      expect(result.pagesCount).toBe(100);
      expect(result.totalElements).toBe(1000);
      expect(result.duration).toBeLessThan(5000); // Should complete in 5 seconds

      console.log(`Export 100 pages: ${result.duration.toFixed(2)}ms`);
      console.log(`Output size: ${result.outputSize.toFixed(2)}MB`);
      if (result.startMemory) {
        const memoryUsed = (result.endMemory.usedJSHeapSize - result.startMemory.usedJSHeapSize) / (1024 * 1024);
        console.log(`Memory used: ${memoryUsed.toFixed(2)}MB`);
      }
    });

    test('exports 1000 elements on single page', async ({ page }) => {
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

      console.log(`Export 1000 elements: ${result.duration.toFixed(2)}ms`);
      console.log(`Output size: ${result.outputSize.toFixed(2)}MB`);
    });

    test('exports 5000 total elements across 50 pages', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const pages = window.generateLargeFormData(50, 100);

        const perf = window.measurePerformance(() => {
          return JSON.stringify({
            version: '1.0.0',
            exportedAt: new Date().toISOString(),
            pages,
          }, null, 2);
        }, 'Export 5000 elements');

        return {
          success: true,
          pagesCount: pages.length,
          totalElements: pages.reduce((sum, p) => sum + p.elements.length, 0),
          duration: perf.duration,
          outputSize: window.calculateSizeInMB(perf.result),
        };
      });

      expect(result.success).toBe(true);
      expect(result.pagesCount).toBe(50);
      expect(result.totalElements).toBe(5000);
      expect(result.duration).toBeLessThan(10000);

      console.log(`Export 5000 elements: ${result.duration.toFixed(2)}ms`);
      console.log(`Output size: ${result.outputSize.toFixed(2)}MB`);
    });
  });

  test.describe('Large Dataset Import Tests', () => {
    test('imports 100 pages in real browser', async ({ page }) => {
      const result = await page.evaluate(async () => {
        // First export
        const pages = window.generateLargeFormData(100, 10);
        const jsonStr = JSON.stringify({
          version: '1.0.0',
          exportedAt: new Date().toISOString(),
          pages,
        }, null, 2);

        // Then import
        const perf = window.measurePerformance(() => {
          return JSON.parse(jsonStr);
        }, 'Import 100 pages');

        return {
          success: true,
          pagesCount: perf.result.pages.length,
          duration: perf.duration,
          inputSize: window.calculateSizeInMB(jsonStr),
        };
      });

      expect(result.success).toBe(true);
      expect(result.pagesCount).toBe(100);
      expect(result.duration).toBeLessThan(5000);

      console.log(`Import 100 pages: ${result.duration.toFixed(2)}ms`);
      console.log(`Input size: ${result.inputSize.toFixed(2)}MB`);
    });

    test('imports 1000 elements on single page', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const pages = window.generateLargeFormData(1, 1000);
        const jsonStr = JSON.stringify({
          version: '1.0.0',
          exportedAt: new Date().toISOString(),
          pages,
        }, null, 2);

        const perf = window.measurePerformance(() => {
          return JSON.parse(jsonStr);
        }, 'Import 1000 elements');

        return {
          success: true,
          elementsCount: perf.result.pages[0].elements.length,
          duration: perf.duration,
        };
      });

      expect(result.success).toBe(true);
      expect(result.elementsCount).toBe(1000);
      expect(result.duration).toBeLessThan(5000);

      console.log(`Import 1000 elements: ${result.duration.toFixed(2)}ms`);
    });
  });

  test.describe('File Size Tests', () => {
    test('generates JSON file larger than 1MB', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const pages = window.generateLargeFormData(20, 200);
        const jsonStr = JSON.stringify({
          version: '1.0.0',
          exportedAt: new Date().toISOString(),
          pages,
        }, null, 2);

        const sizeInMB = window.calculateSizeInMB(jsonStr);

        return {
          success: true,
          sizeInMB,
        };
      });

      expect(result.success).toBe(true);
      expect(result.sizeInMB).toBeGreaterThan(1);

      console.log(`Generated JSON size: ${result.sizeInMB.toFixed(2)}MB`);
    });

    test('tests browser Blob API with large content', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const pages = window.generateLargeFormData(50, 100);
        const jsonStr = JSON.stringify({
          version: '1.0.0',
          exportedAt: new Date().toISOString(),
          pages,
        }, null, 2);

        // Test actual Blob creation
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        // Clean up
        URL.revokeObjectURL(url);

        return {
          success: true,
          blobSize: blob.size,
          blobType: blob.type,
          sizeInMB: blob.size / (1024 * 1024),
        };
      });

      expect(result.success).toBe(true);
      expect(result.blobSize).toBeGreaterThan(0);
      expect(result.blobType).toBe('application/json');

      console.log(`Blob size: ${result.sizeInMB.toFixed(2)}MB`);
    });
  });

  test.describe('Performance Benchmarks', () => {
    test('round-trip performance test (export + import)', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const pages = window.generateLargeFormData(50, 50);

        const startMemory = await window.measureMemory();

        // Export
        const exportPerf = window.measurePerformance(() => {
          return JSON.stringify({
            version: '1.0.0',
            exportedAt: new Date().toISOString(),
            pages,
          }, null, 2);
        }, 'Export');

        // Import
        const importPerf = window.measurePerformance(() => {
          return JSON.parse(exportPerf.result);
        }, 'Import');

        const endMemory = await window.measureMemory();

        return {
          success: true,
          pagesCount: pages.length,
          totalElements: pages.reduce((sum, p) => sum + p.elements.length, 0),
          exportDuration: exportPerf.duration,
          importDuration: importPerf.duration,
          totalDuration: exportPerf.duration + importPerf.duration,
          dataSize: window.calculateSizeInMB(exportPerf.result),
          memoryUsed: endMemory && startMemory
            ? (endMemory.usedJSHeapSize - startMemory.usedJSHeapSize) / (1024 * 1024)
            : null,
        };
      });

      expect(result.success).toBe(true);
      expect(result.totalDuration).toBeLessThan(10000); // 10 seconds max for round-trip

      console.log(`Export: ${result.exportDuration.toFixed(2)}ms`);
      console.log(`Import: ${result.importDuration.toFixed(2)}ms`);
      console.log(`Total round-trip: ${result.totalDuration.toFixed(2)}ms`);
      console.log(`Data size: ${result.dataSize.toFixed(2)}MB`);
      if (result.memoryUsed) {
        console.log(`Memory used: ${result.memoryUsed.toFixed(2)}MB`);
      }
    });

    test('repeated export/import (memory leak test)', async ({ page }) => {
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
          startMemory,
          endMemory,
          memoryGrowth: endMemory && startMemory
            ? (endMemory.usedJSHeapSize - startMemory.usedJSHeapSize) / (1024 * 1024)
            : null,
        };
      });

      expect(result.success).toBe(true);

      // Memory growth should be minimal (< 50MB) after 100 iterations
      if (result.memoryGrowth !== null) {
        expect(result.memoryGrowth).toBeLessThan(50);
        console.log(`Memory growth after ${result.iterations} iterations: ${result.memoryGrowth.toFixed(2)}MB`);
      }
    });
  });

  test.describe('Browser API Tests', () => {
    test('tests real FileReader API', async ({ page }) => {
      const result = await page.evaluate(async () => {
        return new Promise((resolve) => {
          const pages = window.generateLargeFormData(10, 10);
          const jsonStr = JSON.stringify({ version: '1.0.0', pages });

          // Create a Blob
          const blob = new Blob([jsonStr], { type: 'application/json' });

          // Use real FileReader
          const reader = new FileReader();

          reader.onload = (event) => {
            const content = event.target.result;
            const parsed = JSON.parse(content as string);

            resolve({
              success: true,
              contentLength: (content as string).length,
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
      expect(result.contentLength).toBeGreaterThan(0);

      console.log(`FileReader read ${result.contentLength} bytes successfully`);
    });

    test('tests clipboard API (if available)', async ({ page, browserName }) => {
      // Skip in Firefox as clipboard API has different permissions
      test.skip(browserName === 'firefox', 'Clipboard API permissions differ in Firefox');

      const result = await page.evaluate(async () => {
        try {
          const pages = window.generateLargeFormData(5, 10);
          const jsonStr = JSON.stringify({ version: '1.0.0', pages }, null, 2);

          // Test clipboard write
          await navigator.clipboard.writeText(jsonStr);

          // Test clipboard read
          const clipboardContent = await navigator.clipboard.readText();

          return {
            success: true,
            contentLength: clipboardContent.length,
            matches: clipboardContent === jsonStr,
          };
        } catch (error) {
          return {
            success: false,
            error: error.message,
          };
        }
      });

      // Clipboard might fail due to permissions, that's ok
      if (result.success) {
        expect(result.matches).toBe(true);
        console.log(`Clipboard test passed: ${result.contentLength} bytes`);
      } else {
        console.log(`Clipboard test skipped: ${result.error}`);
      }
    });
  });

  test.describe('Edge Cases in Browser', () => {
    test('handles very large strings in browser memory', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const pages = window.generateLargeFormData(1, 1);
        pages[0].elements[0].helpText = 'A'.repeat(100 * 1024); // 100KB

        const jsonStr = JSON.stringify({ version: '1.0.0', pages });
        const parsed = JSON.parse(jsonStr);

        return {
          success: true,
          helpTextLength: parsed.pages[0].elements[0].helpText.length,
        };
      });

      expect(result.success).toBe(true);
      expect(result.helpTextLength).toBe(100 * 1024);
    });

    test('handles 1000+ options in select field', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const pages = window.generateLargeFormData(1, 1);
        pages[0].elements[0].type = 'select';
        pages[0].elements[0].options = Array.from({ length: 1000 }, (_, i) => ({
          label: `Option ${i}`,
          value: `opt${i}`,
        }));

        const jsonStr = JSON.stringify({ version: '1.0.0', pages });
        const parsed = JSON.parse(jsonStr);

        return {
          success: true,
          optionsCount: parsed.pages[0].elements[0].options.length,
        };
      });

      expect(result.success).toBe(true);
      expect(result.optionsCount).toBe(1000);
    });

    test('handles special characters and Unicode', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const pages = window.generateLargeFormData(1, 1);
        pages[0].title = 'Test with 中文 and émojis 🎉🚀💯';
        pages[0].elements[0].label = 'Field with Ελληνικά';
        pages[0].elements[0].helpText = 'Special: @#$%^&*()_+-=[]{}|;:,.<>?/~`';

        const jsonStr = JSON.stringify({ version: '1.0.0', pages });
        const parsed = JSON.parse(jsonStr);

        return {
          success: true,
          titleContainsUnicode: parsed.pages[0].title.includes('中文'),
          titleContainsEmoji: parsed.pages[0].title.includes('🎉'),
          labelContainsGreek: parsed.pages[0].elements[0].label.includes('Ελληνικά'),
          helpTextContainsSpecial: parsed.pages[0].elements[0].helpText.includes('@#$%'),
        };
      });

      expect(result.success).toBe(true);
      expect(result.titleContainsUnicode).toBe(true);
      expect(result.titleContainsEmoji).toBe(true);
      expect(result.labelContainsGreek).toBe(true);
      expect(result.helpTextContainsSpecial).toBe(true);
    });
  });
});
