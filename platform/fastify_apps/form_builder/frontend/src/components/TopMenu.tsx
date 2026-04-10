import { useState } from 'react';
import { Grid, Code, Box, Upload, Download, ChevronUp, ChevronDown } from 'lucide-react';

interface TopMenuProps {
  cols: number;
  rowHeight: number;
  showStateDrawer?: boolean;
  onToggleStateDrawer?: () => void;
  showMetaBoundaries?: boolean;
  onToggleMetaBoundaries?: () => void;
  onImport?: () => void;
  onExport?: () => void;
  // Version props
  formVersion: string;
  onVersionChange: (version: string) => void;
  onIncrementVersion: (part: 'major' | 'minor' | 'patch') => void;
}

const TopMenu = ({
  cols,
  rowHeight,
  showStateDrawer,
  onToggleStateDrawer,
  showMetaBoundaries,
  onToggleMetaBoundaries,
  onImport,
  onExport,
  formVersion,
  onVersionChange,
  onIncrementVersion,
}: TopMenuProps) => {
  const [versionInput, setVersionInput] = useState(formVersion);
  const [showVersionMenu, setShowVersionMenu] = useState(false);

  return (
    <div className="top-menu">
      <div className="top-menu-section">
        <Grid className="w-4 h-4 text-gray-400" />
        <span className="top-menu-label">Grid</span>
      </div>

      <div className="top-menu-spacer" />

      {/* Version control */}
      <div className="top-menu-section">
        <span className="top-menu-label">Version</span>
        <div className="top-menu-version">
          <input
            type="text"
            value={versionInput}
            onChange={(e) => setVersionInput(e.target.value)}
            onBlur={() => {
              if (/^\d+\.\d+\.\d+$/.test(versionInput)) {
                onVersionChange(versionInput);
              } else {
                setVersionInput(formVersion);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (/^\d+\.\d+\.\d+$/.test(versionInput)) {
                  onVersionChange(versionInput);
                } else {
                  setVersionInput(formVersion);
                }
                (e.target as HTMLInputElement).blur();
              }
            }}
            className="top-menu-version-input"
            title="SemVer version (e.g., 1.0.0)"
          />
          <div className="top-menu-version-buttons">
            <button
              onClick={() => setShowVersionMenu(!showVersionMenu)}
              className="top-menu-btn"
              title="Version increment options"
            >
              {showVersionMenu ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
          {showVersionMenu && (
            <div className="top-menu-version-dropdown">
              <button
                onClick={() => { onIncrementVersion('patch'); setVersionInput(formVersion.replace(/\d+$/, (m) => String(Number(m) + 1))); setShowVersionMenu(false); }}
                className="top-menu-version-option"
              >
                Patch (+0.0.1)
              </button>
              <button
                onClick={() => { onIncrementVersion('minor'); const [maj] = formVersion.split('.'); setVersionInput(`${maj}.${Number(formVersion.split('.')[1]) + 1}.0`); setShowVersionMenu(false); }}
                className="top-menu-version-option"
              >
                Minor (+0.1.0)
              </button>
              <button
                onClick={() => { onIncrementVersion('major'); setVersionInput(`${Number(formVersion.split('.')[0]) + 1}.0.0`); setShowVersionMenu(false); }}
                className="top-menu-version-option"
              >
                Major (+1.0.0)
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="top-menu-divider" />

      {/* Import/Export buttons */}
      <button
        onClick={onImport}
        className="top-menu-btn-icon"
        title="Import form (YAML/JSON)"
      >
        <Upload className="w-4 h-4" />
      </button>
      <button
        onClick={onExport}
        className="top-menu-btn-icon"
        title="Export form (YAML/JSON)"
      >
        <Download className="w-4 h-4" />
      </button>

      <div className="top-menu-divider" />

      {/* Grid info */}
      <div className="top-menu-info">
        <span>{cols} × {rowHeight}px</span>
      </div>

      <div className="top-menu-divider" />

      {/* Meta Boundaries Toggle */}
      <button
        onClick={onToggleMetaBoundaries}
        className={`top-menu-btn-icon ${showMetaBoundaries ? 'active' : ''}`}
        title={showMetaBoundaries ? 'Hide grouping boundaries' : 'Show grouping boundaries'}
      >
        <Box className="w-4 h-4" />
      </button>

      {/* State Drawer Toggle */}
      <button
        onClick={onToggleStateDrawer}
        className={`top-menu-btn-icon ${showStateDrawer ? 'active' : ''}`}
        title={showStateDrawer ? 'Hide state inspector' : 'Show state inspector'}
      >
        <Code className="w-4 h-4" />
      </button>
    </div>
  );
};

export default TopMenu;
