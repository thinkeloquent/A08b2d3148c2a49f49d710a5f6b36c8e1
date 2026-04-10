import '@testing-library/jest-dom';

// Mock console methods to reduce noise in tests
const originalConsole = { ...console };

beforeAll(() => {
  // Suppress debug logging during tests
  console.log = vi.fn();
  console.warn = vi.fn();
  console.group = vi.fn();
  console.groupEnd = vi.fn();
});

afterAll(() => {
  // Restore console
  Object.assign(console, originalConsole);
});

// Helper to create mock DragEvent with dataTransfer
export function createMockDragEvent(
  data: Record<string, string>,
  options: { clientX?: number; clientY?: number } = {}
): React.DragEvent<HTMLDivElement> {
  const dataTransferData: Record<string, string> = { ...data };

  const mockDataTransfer = {
    data: dataTransferData,
    setData(type: string, value: string) {
      this.data[type] = value;
    },
    getData(type: string) {
      return this.data[type] || '';
    },
    clearData() {
      this.data = {};
    },
    effectAllowed: 'all' as DataTransfer['effectAllowed'],
    dropEffect: 'move' as DataTransfer['dropEffect'],
    types: Object.keys(dataTransferData),
    files: [] as unknown as FileList,
    items: [] as unknown as DataTransferItemList,
  };

  return {
    dataTransfer: mockDataTransfer,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    clientX: options.clientX ?? 0,
    clientY: options.clientY ?? 0,
    target: document.createElement('div'),
    currentTarget: document.createElement('div'),
  } as unknown as React.DragEvent<HTMLDivElement>;
}
