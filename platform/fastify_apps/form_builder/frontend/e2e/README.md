# Browser-Based Stress Tests with Playwright

This directory contains end-to-end stress tests that run in a real browser using Playwright.

## Why Browser-Based Tests?

Unlike unit tests that run in jsdom, these tests:
- Use real browser APIs (FileReader, Blob, Clipboard, URL.createObjectURL)
- Measure actual browser memory usage
- Test real-world performance characteristics
- Validate browser compatibility
- Don't require mocking browser APIs

## Setup

1. **Install Playwright browsers** (one-time):
   ```bash
   npm run playwright:install
   ```

2. **Build the application** (required before first run):
   ```bash
   npm run build
   ```

3. **Start the dev server** (in another terminal):
   ```bash
   npm run dev
   ```

## Running Tests

### Run standalone stress tests (RECOMMENDED):
```bash
npx playwright test e2e/importExport-stress-standalone.spec.ts
```

The standalone tests are self-contained, require no dev server or build, and run much faster.

### Run all E2E tests:
```bash
npm run test:e2e
```

### Run only stress tests:
```bash
npm run test:e2e:stress
```

**Note:** The `importExport-stress.spec.ts` tests require a dev server and have some setup complexity. The standalone tests (`importExport-stress-standalone.spec.ts`) are recommended as they cover the same functionality without requiring a dev server.

### Run with visible browser (headed mode):
```bash
npm run test:e2e:headed
```

### Debug tests interactively:
```bash
npm run test:e2e:debug
```

### Run specific test file:
```bash
npx playwright test e2e/importExport-stress.spec.ts
```

## Test Categories

### 1. Large Dataset Export Tests
- Exports 100 pages with 1000 total elements
- Exports 1000 elements on a single page
- Exports 5000 total elements across 50 pages
- Measures: duration, output size, memory usage

### 2. Large Dataset Import Tests
- Imports 100 pages
- Imports 1000 elements on a single page
- Measures: duration, input size

### 3. File Size Tests
- Generates JSON files larger than 1MB
- Tests browser Blob API with large content
- Measures actual file sizes in browser

### 4. Performance Benchmarks
- Round-trip performance (export + import)
- Repeated operations (memory leak detection)
- Measures: execution time, memory growth

### 5. Browser API Tests
- Tests real FileReader API
- Tests Clipboard API (if available)
- Validates browser API behavior

### 6. Edge Cases
- Very large strings (100KB+)
- 1000+ options in select fields
- Special characters and Unicode
- Emoji support

## Performance Thresholds

All tests include performance assertions:
- Single operations: < 5 seconds
- Round-trip operations: < 10 seconds
- Memory growth (100 iterations): < 50MB

## Viewing Results

After running tests, view the HTML report:
```bash
npx playwright show-report
```

## Test Output

Tests log performance metrics to console:
- Execution duration (ms)
- File sizes (MB)
- Memory usage (MB)
- Element counts

Example output:
```
Export 100 pages: 245.32ms
Output size: 2.45MB
Memory used: 5.23MB
```

## Troubleshooting

### Port already in use
If port 5173 is in use, the dev server won't start. Stop other instances or change the port in `playwright.config.ts`.

### Tests timing out
Increase timeout in test file or run with more workers:
```bash
npx playwright test --workers=1
```

### Memory issues
Some tests require significant memory. Close other applications if tests fail with OOM errors.

## Notes

- Tests run in Chromium by default (can be configured for other browsers)
- The test harness is loaded from `/test/importExport-test-harness.html`
- Real browser environment means real performance characteristics
- Memory measurements use `performance.memory` API (Chrome-specific)
