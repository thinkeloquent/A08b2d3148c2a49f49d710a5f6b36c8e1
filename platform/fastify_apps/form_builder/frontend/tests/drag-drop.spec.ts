import { test, expect } from '@playwright/test';

test.describe('Drag and Drop to Grouping Container', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the form builder
    await page.goto('http://localhost:5176/');

    // Wait for the page to load
    await page.waitForSelector('.canvas-drop-zone');

    // Capture console logs
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('[DragDrop]') || text.includes('[State]')) {
        console.log(`BROWSER: ${text}`);
      }
    });
  });

  test('should add a Grouping meta-component to canvas', async ({ page }) => {
    // Find the Grouping component in the sidebar (under Declarative tab or search)
    // First, let's check what's in the sidebar
    const sidebar = page.locator('.app-sidebar, [class*="sidebar"]').first();
    await expect(sidebar).toBeVisible();

    // Look for Grouping in the components list
    const groupingItem = page.locator('text=Grouping').first();

    if (await groupingItem.isVisible()) {
      // Get the canvas drop zone
      const canvas = page.locator('.canvas-grid').first();
      await expect(canvas).toBeVisible();

      // Perform drag and drop
      const canvasBox = await canvas.boundingBox();
      if (canvasBox) {
        await groupingItem.dragTo(canvas, {
          targetPosition: { x: canvasBox.width / 2, y: 100 }
        });
      }

      // Wait for the grouping to appear
      await page.waitForTimeout(500);

      // Check if a nested-grid-container was created
      const container = page.locator('.nested-grid-container');
      await expect(container).toBeVisible({ timeout: 5000 });

      console.log('SUCCESS: Grouping container created');
    } else {
      console.log('Grouping item not found in sidebar');
    }
  });

  test('should drag element from sidebar to Grouping container', async ({ page }) => {
    // Enable console logging for this test
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('[DragDrop]') || text.includes('[State]')) {
        console.log(`BROWSER: ${text}`);
      }
    });

    // First, add a Grouping container
    const declarativeTab = page.locator('text=Declarative');
    if (await declarativeTab.isVisible()) {
      await declarativeTab.click();
      await page.waitForTimeout(300);
    }

    const groupingItem = page.locator('text=Grouping').first();
    const canvas = page.locator('.canvas-grid').first();

    if (await groupingItem.isVisible() && await canvas.isVisible()) {
      const canvasBox = await canvas.boundingBox();
      if (canvasBox) {
        await groupingItem.dragTo(canvas, {
          targetPosition: { x: canvasBox.width / 2, y: 100 }
        });
      }
    }

    // Wait for container to be created
    await page.waitForTimeout(500);
    const container = page.locator('.nested-grid-container').first();

    if (await container.isVisible()) {
      console.log('Container found, now trying to drop element into it');

      // After dropping grouping, a component editor might be open. Click somewhere neutral to close it.
      await canvas.click({ position: { x: 10, y: 10 } });
      await page.waitForTimeout(300);

      // Switch to Components tab - need to find the correct tab button
      const componentsTab = page.locator('button').filter({ hasText: 'Components' }).first();
      const tabVisible = await componentsTab.isVisible();
      console.log(`Components tab visible: ${tabVisible}`);

      if (tabVisible) {
        await componentsTab.click();
        await page.waitForTimeout(500);
        console.log('Clicked Components tab');
      } else {
        // The tabs might not be visible yet. Let's log what we see.
        const allButtons = await page.locator('button').allTextContents();
        console.log('All buttons found:', allButtons.slice(0, 10).join(', '));

        // Look in the resizable sidebar on the left
        const leftSidebar = page.locator('.app-sidebar, .resizable-sidebar');
        console.log('Left sidebar visible:', await leftSidebar.first().isVisible());
      }

      // Find a draggable element
      const droppableElement = page.locator('.droppable-element').first();
      const isDroppableVisible = await droppableElement.isVisible();
      console.log(`Droppable element visible: ${isDroppableVisible}`);

      if (isDroppableVisible) {
        const containerBox = await container.boundingBox();
        const canvasBox = await canvas.boundingBox();

        // Also get the canvas-drop-zone for comparison
        const canvasDropZone = page.locator('.canvas-drop-zone').first();
        const dropZoneBox = await canvasDropZone.boundingBox();

        if (containerBox && canvasBox && dropZoneBox) {
          console.log(`Container bounds: ${JSON.stringify(containerBox)}`);
          console.log(`Canvas grid bounds: ${JSON.stringify(canvasBox)}`);
          console.log(`Canvas drop zone bounds: ${JSON.stringify(dropZoneBox)}`);

          // IMPORTANT: Drag to the CANVAS at coordinates where the container is
          // This allows Canvas's coordinate-based detection to route to the container
          // We target the center of the container in absolute screen coordinates
          // Then convert to canvas-relative coordinates for dragTo

          // Container center in absolute coordinates
          const containerCenterX = containerBox.x + containerBox.width / 2;
          const containerCenterY = containerBox.y + containerBox.height / 2;
          console.log(`Container center (absolute): (${containerCenterX}, ${containerCenterY})`);

          // Convert to canvas-relative for dragTo targetPosition
          const targetX = containerCenterX - canvasBox.x;
          const targetY = containerCenterY - canvasBox.y;

          console.log(`Dragging to canvas position (relative): (${targetX}, ${targetY})`);
          console.log('About to perform drag...');

          // Use manual event dispatch since Playwright's dragTo doesn't fire drop events correctly
          // We simulate the drop event at the container's center coordinates
          const result = await page.evaluate(({ containerCenterX, containerCenterY }) => {
            const dropZone = document.querySelector('.canvas-drop-zone');
            if (!dropZone) {
              return { success: false, error: 'Drop zone not found' };
            }

            const dragData = JSON.stringify({ type: 'Multiple Selection', isMeta: false, isExisting: false });

            // Create a mock DataTransfer
            const dataTransferData: Record<string, string> = {};
            const mockDataTransfer = {
              data: dataTransferData,
              setData(type: string, data: string) {
                this.data[type] = data;
              },
              getData(type: string) {
                return this.data[type] || '';
              },
              effectAllowed: 'copy',
              dropEffect: 'copy',
              types: ['text/plain'],
            };
            mockDataTransfer.setData('text/plain', dragData);

            // Dispatch drop event at the container's center coordinates
            const dropEvent = new DragEvent('drop', {
              bubbles: true,
              cancelable: true,
              clientX: containerCenterX,
              clientY: containerCenterY,
            });
            Object.defineProperty(dropEvent, 'dataTransfer', { value: mockDataTransfer });

            console.log('[TestDrag] Manual drop event dispatched to canvas-drop-zone at', containerCenterX, containerCenterY);
            dropZone.dispatchEvent(dropEvent);

            return { success: true };
          }, { containerCenterX, containerCenterY });

          console.log('Manual drop result:', JSON.stringify(result));

          await page.waitForTimeout(1000);

          // Check if the element was added to the container
          const nestedItem = page.locator('.nested-grid-container .nested-grid-item');
          const nestedCount = await nestedItem.count();

          console.log(`\n--- RESULT ---`);
          console.log(`Nested items found: ${nestedCount}`);

          // Also check if element was added to root canvas instead
          const rootItems = await page.locator('.grid-item').count();
          console.log(`Root canvas items: ${rootItems}`);

          // This should succeed because Canvas uses coordinate-based detection
          expect(nestedCount).toBeGreaterThan(0);
          console.log('SUCCESS: Element was added to container');
        }
      }
    } else {
      console.log('Container not visible after drop');
    }
  });

  test('debug: verify document drag events fire', async ({ page }) => {
    // This test validates that Playwright's dragTo fires document-level drag events
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('[TestDrag]') || text.includes('[DragDoc]') || text.includes('[DragDrop]') || text.includes('[Context]')) {
        console.log(`BROWSER: ${text}`);
      }
    });

    // Add document-level listener BEFORE any drag to catch all events
    await page.evaluate(() => {
      let enterCount = 0;
      let leaveCount = 0;
      document.addEventListener('dragenter', (e) => {
        enterCount++;
        console.log(`[TestDrag] ENTER #${enterCount}`, (e.target as HTMLElement)?.className?.slice(0, 50));
      });
      document.addEventListener('dragleave', (e) => {
        leaveCount++;
        console.log(`[TestDrag] LEAVE #${leaveCount}`, (e.target as HTMLElement)?.className?.slice(0, 50));
      });
      document.addEventListener('dragover', () => {
        // Uncomment to see dragover (very verbose)
        // console.log('[TestDrag] OVER');
      });
      document.addEventListener('drop', () => {
        console.log('[TestDrag] DROP');
      });
      document.addEventListener('dragend', () => {
        console.log('[TestDrag] DRAGEND');
      });
    });

    // First, add a Grouping container to the canvas
    const declarativeTab = page.locator('text=Declarative');
    if (await declarativeTab.isVisible()) {
      await declarativeTab.click();
      await page.waitForTimeout(300);
    }

    console.log('\\n--- Dragging Grouping to canvas ---');
    const groupingItem = page.locator('text=Grouping').first();
    const canvas = page.locator('.canvas-grid').first();

    await groupingItem.dragTo(canvas, {
      targetPosition: { x: 400, y: 100 }
    });

    await page.waitForTimeout(500);

    // Verify container was created
    const container = page.locator('.nested-grid-container').first();
    console.log('Container created:', await container.isVisible());

    // Click somewhere on the canvas to deselect the container and close any editors
    await canvas.click({ position: { x: 600, y: 300 } });
    await page.waitForTimeout(300);

    // Now drag a FORM ELEMENT (not meta) to the container - use Components tab
    console.log('\\n--- Dragging Text element to container ---');

    // Click Components tab
    const componentsTab = page.locator('button').filter({ hasText: 'Components' });
    if (await componentsTab.first().isVisible()) {
      await componentsTab.first().click();
      await page.waitForTimeout(300);
      console.log('Clicked Components tab');
    }

    // Find a Text element to drag
    const textItem = page.locator('.droppable-element').first();
    console.log('First droppable element visible:', await textItem.isVisible());
    if (await textItem.isVisible()) {
      const textLabel = await textItem.textContent();
      console.log('First droppable element label:', textLabel);
    }

    // List all droppable elements for debugging
    const allDroppable = page.locator('.droppable-element');
    const dropCount = await allDroppable.count();
    console.log('Total droppable elements:', dropCount);

    if (dropCount > 0) {
      console.log('Dragging first element to container using manual dispatch...');

      // Use page.evaluate to dispatch real drag events with data
      const result = await page.evaluate(() => {
        const sourceElement = document.querySelector('.droppable-element');
        const overlay = document.querySelector('.nested-drop-overlay');

        if (!sourceElement || !overlay) {
          return { success: false, error: 'Elements not found' };
        }

        const dragData = JSON.stringify({ type: 'Multiple Selection', isMeta: false, isExisting: false });

        // Create a DataTransfer mock
        const dataTransferData: Record<string, string> = {};
        const mockDataTransfer = {
          data: dataTransferData,
          setData(type: string, data: string) {
            this.data[type] = data;
          },
          getData(type: string) {
            return this.data[type] || '';
          },
          effectAllowed: 'move',
          dropEffect: 'move',
          types: ['text/plain'],
        };

        // Set the drag data
        mockDataTransfer.setData('text/plain', dragData);

        // Dispatch dragenter
        const enterEvent = new DragEvent('dragenter', {
          bubbles: true,
          cancelable: true,
        });
        Object.defineProperty(enterEvent, 'dataTransfer', { value: mockDataTransfer });
        overlay.dispatchEvent(enterEvent);
        console.log('[TestDrag] dragenter dispatched');

        // Dispatch dragover
        const overEvent = new DragEvent('dragover', {
          bubbles: true,
          cancelable: true,
        });
        Object.defineProperty(overEvent, 'dataTransfer', { value: mockDataTransfer });
        overlay.dispatchEvent(overEvent);
        console.log('[TestDrag] dragover dispatched');

        // Dispatch drop
        const dropEvent = new DragEvent('drop', {
          bubbles: true,
          cancelable: true,
        });
        Object.defineProperty(dropEvent, 'dataTransfer', { value: mockDataTransfer });
        overlay.dispatchEvent(dropEvent);
        console.log('[TestDrag] drop dispatched');

        return { success: true };
      });

      console.log('Manual dispatch result:', result);
      await page.waitForTimeout(500);

      // Check if nested items were added
      const nestedItems = await page.locator('.nested-grid-item').count();
      console.log('Nested items after drag:', nestedItems);
    }

    // Summary
    const overlay = page.locator('.nested-drop-overlay').first();
    const overlayClass = await overlay.getAttribute('class');
    console.log('\\n--- Summary ---');
    console.log('Final overlay classes:', overlayClass);
  });
});
