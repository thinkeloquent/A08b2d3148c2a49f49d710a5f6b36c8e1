import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ImportExportModal from './ImportExportModal';
import type { FormPage } from '../types';

// ==========================================================================
// TEST DATA
// ==========================================================================

const mockPage: FormPage = {
  id: 'page-1',
  title: 'Test Page',
  description: 'A test page',
  elements: [
    {
      id: 'el-1',
      type: 'text',
      label: 'Test Field',
    },
  ],
  layout: [
    {
      i: 'el-1',
      x: 0,
      y: 0,
      w: 6,
      h: 2,
      minW: 2,
      minH: 2,
    },
  ],
};

const mockOnClose = vi.fn();
const mockOnImport = vi.fn();

const defaultProps = {
  isOpen: true,
  onClose: mockOnClose,
  pages: [mockPage],
  version: '1.0.0',
  onImport: mockOnImport,
};

// ==========================================================================
// SETUP & HELPERS
// ==========================================================================

beforeEach(() => {
  vi.clearAllMocks();

  // Mock clipboard API
  Object.defineProperty(navigator, 'clipboard', {
    value: {
      writeText: vi.fn(() => Promise.resolve()),
    },
    writable: true,
    configurable: true,
  });

  // Mock URL and Blob for downloads
  global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
  global.URL.revokeObjectURL = vi.fn();

  // Mock FileReader
  global.FileReader = class {
    readAsText = vi.fn();
    onload: ((event: ProgressEvent<FileReader>) => void) | null = null;
    onerror: ((event: ProgressEvent<FileReader>) => void) | null = null;
    result: string | null = null;
  } as any;
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ==========================================================================
// RENDERING TESTS
// ==========================================================================

describe('ImportExportModal - Rendering', () => {
  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <ImportExportModal {...defaultProps} isOpen={false} mode="export" />
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders modal when isOpen is true', () => {
    render(<ImportExportModal {...defaultProps} mode="export" />);

    expect(screen.getByText('Export Form')).toBeInTheDocument();
  });

  it('renders export mode correctly', () => {
    render(<ImportExportModal {...defaultProps} mode="export" />);

    expect(screen.getByText('Export Form')).toBeInTheDocument();
    expect(screen.getByText('YAML')).toBeInTheDocument();
    expect(screen.getByText('JSON')).toBeInTheDocument();
    expect(screen.getByText('Copy')).toBeInTheDocument();
    expect(screen.getByText(/Download/)).toBeInTheDocument();
  });

  it('renders import mode correctly', () => {
    render(<ImportExportModal {...defaultProps} mode="import" />);

    expect(screen.getByText('Import Form')).toBeInTheDocument();
    expect(screen.getByText('Drop a file here or click to upload')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Paste YAML or JSON content here...')).toBeInTheDocument();
    expect(screen.getByText('Import')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('renders close button', () => {
    render(<ImportExportModal {...defaultProps} mode="export" />);

    const closeButtons = screen.getAllByRole('button');
    const closeButton = closeButtons.find(btn => btn.className.includes('close'));
    expect(closeButton).toBeInTheDocument();
  });
});

// ==========================================================================
// EXPORT MODE TESTS
// ==========================================================================

describe('ImportExportModal - Export Mode', () => {
  describe('Format Selection', () => {
    it('defaults to YAML format', () => {
      render(<ImportExportModal {...defaultProps} mode="export" />);

      const yamlButton = screen.getByText('YAML').closest('button');
      expect(yamlButton).toHaveClass('active');
    });

    it('switches to JSON format', async () => {
      const user = userEvent.setup();
      render(<ImportExportModal {...defaultProps} mode="export" />);

      const jsonButton = screen.getByText('JSON').closest('button');
      await user.click(jsonButton!);

      expect(jsonButton).toHaveClass('active');
    });

    it('displays YAML content when YAML is selected', () => {
      render(<ImportExportModal {...defaultProps} mode="export" />);

      const preview = screen.getByText(/version:/);
      expect(preview).toBeInTheDocument();
    });

    it('displays JSON content when JSON is selected', async () => {
      const user = userEvent.setup();
      render(<ImportExportModal {...defaultProps} mode="export" />);

      const jsonButton = screen.getByText('JSON').closest('button');
      await user.click(jsonButton!);

      const preview = screen.getByText(/"version":/);
      expect(preview).toBeInTheDocument();
    });

    it('updates preview when switching formats', async () => {
      const user = userEvent.setup();
      render(<ImportExportModal {...defaultProps} mode="export" />);

      // Initially YAML
      expect(screen.getByText(/version:/)).toBeInTheDocument();

      // Switch to JSON
      const jsonButton = screen.getByText('JSON').closest('button');
      await user.click(jsonButton!);

      expect(screen.getByText(/"version":/)).toBeInTheDocument();
    });
  });

  describe('Copy Functionality', () => {
    it('copies content to clipboard', async () => {
      const user = userEvent.setup();
      render(<ImportExportModal {...defaultProps} mode="export" />);

      const copyButton = screen.getByText('Copy');
      await user.click(copyButton);

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining('version:')
      );
    });

    it('shows "Copied!" feedback after copying', async () => {
      const user = userEvent.setup();
      render(<ImportExportModal {...defaultProps} mode="export" />);

      const copyButton = screen.getByText('Copy');
      await user.click(copyButton);

      expect(screen.getByText('Copied!')).toBeInTheDocument();
    });

    it('resets "Copied!" text after 2 seconds', async () => {
      vi.useFakeTimers();
      const user = userEvent.setup({ delay: null });
      render(<ImportExportModal {...defaultProps} mode="export" />);

      const copyButton = screen.getByText('Copy');
      await user.click(copyButton);

      expect(screen.getByText('Copied!')).toBeInTheDocument();

      vi.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(screen.getByText('Copy')).toBeInTheDocument();
      });

      vi.useRealTimers();
    });

    it('handles clipboard error gracefully', async () => {
      const user = userEvent.setup();
      const clipboardError = new Error('Clipboard access denied');
      vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(clipboardError);

      render(<ImportExportModal {...defaultProps} mode="export" />);

      const copyButton = screen.getByText('Copy');
      await user.click(copyButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to copy to clipboard')).toBeInTheDocument();
      });
    });
  });

  describe('Download Functionality', () => {
    it('downloads YAML file with correct name', async () => {
      const user = userEvent.setup();
      const createElementSpy = vi.spyOn(document, 'createElement');
      const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => null as any);
      const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => null as any);

      render(<ImportExportModal {...defaultProps} mode="export" />);

      const downloadButton = screen.getByText(/Download YAML/);
      await user.click(downloadButton);

      const mockLink = createElementSpy.mock.results.find(r => r.value.tagName === 'A')?.value;
      expect(mockLink?.download).toMatch(/form-export-\d{4}-\d{2}-\d{2}\.yaml/);

      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
    });

    it('downloads JSON file with correct name', async () => {
      const user = userEvent.setup();
      const createElementSpy = vi.spyOn(document, 'createElement');
      const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => null as any);
      const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => null as any);

      render(<ImportExportModal {...defaultProps} mode="export" />);

      // Switch to JSON
      const jsonButton = screen.getByText('JSON').closest('button');
      await user.click(jsonButton!);

      const downloadButton = screen.getByText(/Download JSON/);
      await user.click(downloadButton);

      const mockLink = createElementSpy.mock.results.find(r => r.value.tagName === 'A')?.value;
      expect(mockLink?.download).toMatch(/form-export-\d{4}-\d{2}-\d{2}\.json/);

      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
    });

    it('creates blob with correct MIME type for YAML', async () => {
      const user = userEvent.setup();
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => null as any);
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => null as any);

      render(<ImportExportModal {...defaultProps} mode="export" />);

      const downloadButton = screen.getByText(/Download YAML/);
      await user.click(downloadButton);

      expect(global.URL.createObjectURL).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'application/x-yaml' })
      );
    });

    it('creates blob with correct MIME type for JSON', async () => {
      const user = userEvent.setup();
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => null as any);
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => null as any);

      render(<ImportExportModal {...defaultProps} mode="export" />);

      // Switch to JSON
      const jsonButton = screen.getByText('JSON').closest('button');
      await user.click(jsonButton!);

      const downloadButton = screen.getByText(/Download JSON/);
      await user.click(downloadButton);

      expect(global.URL.createObjectURL).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'application/json' })
      );
    });
  });
});

// ==========================================================================
// IMPORT MODE TESTS
// ==========================================================================

describe('ImportExportModal - Import Mode', () => {
  describe('Paste Content', () => {
    it('allows pasting content into textarea', async () => {
      const user = userEvent.setup();
      render(<ImportExportModal {...defaultProps} mode="import" />);

      const textarea = screen.getByPlaceholderText('Paste YAML or JSON content here...');
      const yamlContent = 'version: 1.0.0\npages: []';

      await user.type(textarea, yamlContent);

      expect(textarea).toHaveValue(yamlContent);
    });

    it('enables import button when content is pasted', async () => {
      const user = userEvent.setup();
      render(<ImportExportModal {...defaultProps} mode="import" />);

      const textarea = screen.getByPlaceholderText('Paste YAML or JSON content here...');
      const importButton = screen.getByText('Import').closest('button');

      expect(importButton).toBeDisabled();

      await user.type(textarea, 'version: 1.0.0\npages: []');

      expect(importButton).toBeEnabled();
    });

    it('disables import button when content is empty', () => {
      render(<ImportExportModal {...defaultProps} mode="import" />);

      const importButton = screen.getByText('Import').closest('button');

      expect(importButton).toBeDisabled();
    });

    it('clears error when typing new content', async () => {
      const user = userEvent.setup();
      render(<ImportExportModal {...defaultProps} mode="import" />);

      const textarea = screen.getByPlaceholderText('Paste YAML or JSON content here...');
      const importButton = screen.getByText('Import').closest('button');

      // Trigger error with invalid content
      await user.type(textarea, 'invalid yaml: {');
      await user.click(importButton!);

      expect(screen.getByText(/Failed to parse/)).toBeInTheDocument();

      // Type new content - error should clear
      await user.clear(textarea);
      await user.type(textarea, 'new content');

      expect(screen.queryByText(/Failed to parse/)).not.toBeInTheDocument();
    });
  });

  describe('File Upload', () => {
    it('opens file picker when clicking drop zone', async () => {
      const user = userEvent.setup();
      render(<ImportExportModal {...defaultProps} mode="import" />);

      const dropZone = screen.getByText('Drop a file here or click to upload').closest('div');
      const fileInput = screen.getByRole('textbox', { hidden: true }) as HTMLInputElement;

      const clickSpy = vi.spyOn(fileInput, 'click');

      await user.click(dropZone!);

      expect(clickSpy).toHaveBeenCalled();
    });

    it('reads file content when file is selected', async () => {
      render(<ImportExportModal {...defaultProps} mode="import" />);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(['version: 1.0.0\npages: []'], 'test.yaml', { type: 'application/x-yaml' });

      fireEvent.change(fileInput, { target: { files: [file] } });

      const readerInstance = (FileReader as any).mock.instances[0];
      expect(readerInstance.readAsText).toHaveBeenCalledWith(file);
    });

    it('updates textarea with file content', async () => {
      render(<ImportExportModal {...defaultProps} mode="import" />);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const fileContent = 'version: 1.0.0\npages: []';
      const file = new File([fileContent], 'test.yaml', { type: 'application/x-yaml' });

      fireEvent.change(fileInput, { target: { files: [file] } });

      const readerInstance = (FileReader as any).mock.instances[0];
      readerInstance.result = fileContent;
      readerInstance.onload?.({ target: readerInstance } as any);

      await waitFor(() => {
        const textarea = screen.getByPlaceholderText('Paste YAML or JSON content here...');
        expect(textarea).toHaveValue(fileContent);
      });
    });

    it('handles file read error', async () => {
      render(<ImportExportModal {...defaultProps} mode="import" />);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(['content'], 'test.yaml', { type: 'application/x-yaml' });

      fireEvent.change(fileInput, { target: { files: [file] } });

      const readerInstance = (FileReader as any).mock.instances[0];
      readerInstance.onerror?.({} as any);

      await waitFor(() => {
        expect(screen.getByText('Failed to read file')).toBeInTheDocument();
      });
    });

    it('accepts .yaml, .yml, and .json files', () => {
      render(<ImportExportModal {...defaultProps} mode="import" />);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

      expect(fileInput.accept).toBe('.yaml,.yml,.json');
    });
  });

  describe('Drag and Drop', () => {
    it('handles file drop', async () => {
      render(<ImportExportModal {...defaultProps} mode="import" />);

      const dropZone = screen.getByText('Drop a file here or click to upload').closest('div');
      const fileContent = 'version: 1.0.0\npages: []';
      const file = new File([fileContent], 'test.yaml', { type: 'application/x-yaml' });

      const dropEvent = {
        dataTransfer: {
          files: [file],
        },
      };

      fireEvent.drop(dropZone!, dropEvent);

      const readerInstance = (FileReader as any).mock.instances[0];
      readerInstance.result = fileContent;
      readerInstance.onload?.({ target: readerInstance } as any);

      await waitFor(() => {
        const textarea = screen.getByPlaceholderText('Paste YAML or JSON content here...');
        expect(textarea).toHaveValue(fileContent);
      });
    });

    it('prevents default on drag over', () => {
      render(<ImportExportModal {...defaultProps} mode="import" />);

      const dropZone = screen.getByText('Drop a file here or click to upload').closest('div');
      const event = new Event('dragover', { bubbles: true, cancelable: true });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      fireEvent(dropZone!, event);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('handles empty drop (no files)', () => {
      render(<ImportExportModal {...defaultProps} mode="import" />);

      const dropZone = screen.getByText('Drop a file here or click to upload').closest('div');

      const dropEvent = {
        dataTransfer: {
          files: [],
        },
      };

      fireEvent.drop(dropZone!, dropEvent);

      // Should not crash
      const textarea = screen.getByPlaceholderText('Paste YAML or JSON content here...');
      expect(textarea).toHaveValue('');
    });
  });

  describe('Import Execution', () => {
    it('calls onImport with parsed data', async () => {
      const user = userEvent.setup();
      render(<ImportExportModal {...defaultProps} mode="import" />);

      const textarea = screen.getByPlaceholderText('Paste YAML or JSON content here...');
      const importButton = screen.getByText('Import').closest('button');

      const validYaml = `
version: 1.0.0
exportedAt: '2025-01-01T00:00:00.000Z'
pages:
  - id: page-1
    title: Imported Page
    elements:
      - id: el-1
        fieldType: text
        label: Imported Field
    layout:
      - id: el-1
        rgl_grid: [0, 0, 6, 2]
`;

      await user.type(textarea, validYaml);
      await user.click(importButton!);

      expect(mockOnImport).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'page-1',
            title: 'Imported Page',
          }),
        ]),
        expect.anything(),
        expect.anything()
      );
    });

    it('closes modal after successful import', async () => {
      const user = userEvent.setup();
      render(<ImportExportModal {...defaultProps} mode="import" />);

      const textarea = screen.getByPlaceholderText('Paste YAML or JSON content here...');
      const importButton = screen.getByText('Import').closest('button');

      await user.type(textarea, 'version: 1.0.0\npages:\n  - id: p1\n    title: Page\n    elements: []\n    layout: []');
      await user.click(importButton!);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('shows error for invalid YAML', async () => {
      const user = userEvent.setup();
      render(<ImportExportModal {...defaultProps} mode="import" />);

      const textarea = screen.getByPlaceholderText('Paste YAML or JSON content here...');
      const importButton = screen.getByText('Import').closest('button');

      await user.type(textarea, 'invalid: yaml: syntax: {{{');
      await user.click(importButton!);

      expect(screen.getByText(/Failed to parse/)).toBeInTheDocument();
      expect(mockOnImport).not.toHaveBeenCalled();
    });

    it('shows error for invalid JSON', async () => {
      const user = userEvent.setup();
      render(<ImportExportModal {...defaultProps} mode="import" />);

      const textarea = screen.getByPlaceholderText('Paste YAML or JSON content here...');
      const importButton = screen.getByText('Import').closest('button');

      await user.type(textarea, '{ invalid json }');
      await user.click(importButton!);

      expect(screen.getByText(/Failed to parse/)).toBeInTheDocument();
      expect(mockOnImport).not.toHaveBeenCalled();
    });

    it('shows error when no valid pages are found', async () => {
      const user = userEvent.setup();
      render(<ImportExportModal {...defaultProps} mode="import" />);

      const textarea = screen.getByPlaceholderText('Paste YAML or JSON content here...');
      const importButton = screen.getByText('Import').closest('button');

      await user.type(textarea, 'version: 1.0.0\npages: []');
      await user.click(importButton!);

      expect(screen.getByText('No valid pages found in the imported content')).toBeInTheDocument();
      expect(mockOnImport).not.toHaveBeenCalled();
    });

    it('clears error state before import attempt', async () => {
      const user = userEvent.setup();
      render(<ImportExportModal {...defaultProps} mode="import" />);

      const textarea = screen.getByPlaceholderText('Paste YAML or JSON content here...');
      const importButton = screen.getByText('Import').closest('button');

      // First, trigger an error
      await user.type(textarea, 'invalid');
      await user.click(importButton!);

      expect(screen.getByText(/Failed to parse/)).toBeInTheDocument();

      // Clear and try valid content
      await user.clear(textarea);
      await user.type(textarea, 'version: 1.0.0\npages:\n  - id: p1\n    title: Page\n    elements: []\n    layout: []');
      await user.click(importButton!);

      expect(mockOnImport).toHaveBeenCalled();
    });
  });

  describe('Cancel Functionality', () => {
    it('closes modal when cancel is clicked', async () => {
      const user = userEvent.setup();
      render(<ImportExportModal {...defaultProps} mode="import" />);

      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('does not call onImport when cancel is clicked', async () => {
      const user = userEvent.setup();
      render(<ImportExportModal {...defaultProps} mode="import" />);

      const textarea = screen.getByPlaceholderText('Paste YAML or JSON content here...');
      await user.type(textarea, 'version: 1.0.0\npages: []');

      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      expect(mockOnImport).not.toHaveBeenCalled();
    });
  });
});

// ==========================================================================
// MODAL BEHAVIOR TESTS
// ==========================================================================

describe('ImportExportModal - Modal Behavior', () => {
  it('closes modal when overlay is clicked', async () => {
    const user = userEvent.setup();
    render(<ImportExportModal {...defaultProps} mode="export" />);

    const overlay = screen.getByText('Export Form').closest('.import-export-modal-overlay');
    await user.click(overlay!);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('does not close modal when modal content is clicked', async () => {
    const user = userEvent.setup();
    render(<ImportExportModal {...defaultProps} mode="export" />);

    const modalContent = screen.getByText('Export Form').closest('.import-export-modal');
    await user.click(modalContent!);

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('closes modal when close button is clicked', async () => {
    const user = userEvent.setup();
    render(<ImportExportModal {...defaultProps} mode="export" />);

    const closeButtons = screen.getAllByRole('button');
    const closeButton = closeButtons.find(btn => btn.className.includes('close'));

    await user.click(closeButton!);

    expect(mockOnClose).toHaveBeenCalled();
  });
});

// ==========================================================================
// EDGE CASES
// ==========================================================================

describe('ImportExportModal - Edge Cases', () => {
  it('handles very large export content', () => {
    const largePages = Array.from({ length: 100 }, (_, i) => ({
      ...mockPage,
      id: `page-${i}`,
      title: `Page ${i}`,
    }));

    render(<ImportExportModal {...defaultProps} pages={largePages} mode="export" />);

    const preview = screen.getByText(/version:/);
    expect(preview).toBeInTheDocument();
  });

  it('handles metadata and elementMetadata in export', () => {
    const metadata = {
      version: '2.0.0' as const,
      pages: {
        'page-1': {
          pageId: 'page-1',
          metaComponents: [],
          metaLayout: [],
        },
      },
    };

    const elementMetadata = {
      'el-1': {
        elementId: 'el-1',
        annotation: { type: 'string' as const, entries: [] },
        comments: 'Test comment',
        references: [],
      },
    };

    render(
      <ImportExportModal
        {...defaultProps}
        metadata={metadata}
        elementMetadata={elementMetadata}
        mode="export"
      />
    );

    const preview = screen.getByText(/version:/);
    expect(preview).toBeInTheDocument();
  });

  it('handles empty pages array in export', () => {
    render(<ImportExportModal {...defaultProps} pages={[]} mode="export" />);

    const preview = screen.getByText(/version:/);
    expect(preview).toBeInTheDocument();
  });

  it('handles whitespace-only import content', async () => {
    const user = userEvent.setup();
    render(<ImportExportModal {...defaultProps} mode="import" />);

    const textarea = screen.getByPlaceholderText('Paste YAML or JSON content here...');
    await user.type(textarea, '   \n   \t   ');

    const importButton = screen.getByText('Import').closest('button');
    expect(importButton).toBeDisabled();
  });

  it('imports JSON content correctly', async () => {
    const user = userEvent.setup();
    render(<ImportExportModal {...defaultProps} mode="import" />);

    const textarea = screen.getByPlaceholderText('Paste YAML or JSON content here...');
    const importButton = screen.getByText('Import').closest('button');

    const validJson = JSON.stringify({
      version: '1.0.0',
      exportedAt: '2025-01-01T00:00:00.000Z',
      pages: [
        {
          id: 'page-1',
          title: 'JSON Page',
          elements: [
            { id: 'el-1', fieldType: 'text', label: 'Field' },
          ],
          layout: [
            { id: 'el-1', rgl_grid: [0, 0, 6, 2] },
          ],
        },
      ],
    });

    await user.type(textarea, validJson);
    await user.click(importButton!);

    expect(mockOnImport).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'page-1',
          title: 'JSON Page',
        }),
      ]),
      expect.anything(),
      expect.anything()
    );
  });

  it('handles special characters in imported content', async () => {
    const user = userEvent.setup();
    render(<ImportExportModal {...defaultProps} mode="import" />);

    const textarea = screen.getByPlaceholderText('Paste YAML or JSON content here...');
    const importButton = screen.getByText('Import').closest('button');

    const yamlWithSpecialChars = `
version: 1.0.0
exportedAt: '2025-01-01T00:00:00.000Z'
pages:
  - id: page-1
    title: "Page with 'quotes' and émojis 🎉"
    description: "Special: @#$%^&*()"
    elements:
      - id: el-1
        fieldType: text
        label: "Field with \\"escapes\\""
    layout:
      - id: el-1
        rgl_grid: [0, 0, 6, 2]
`;

    await user.type(textarea, yamlWithSpecialChars);
    await user.click(importButton!);

    expect(mockOnImport).toHaveBeenCalled();
  });
});
