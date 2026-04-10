import { useState, useEffect, useRef } from 'react';
import { X, Copy, Check } from 'lucide-react';
import { JsonView, darkStyles } from 'react-json-view-lite';
import 'react-json-view-lite/dist/index.css';
import { AppState, ActivityEvent } from '../types';

interface StateDrawerProps {
  state: AppState;
  onClose: () => void;
}

type TabId = 'schema' | 'runtime' | 'activity';

const tabs: { id: TabId; label: string }[] = [
  { id: 'schema', label: 'Schema' },
  { id: 'runtime', label: 'Runtime' },
  { id: 'activity', label: 'Activity' },
];

const StateDrawer = ({ state, onClose }: StateDrawerProps) => {
  const [activeTab, setActiveTab] = useState<TabId>('schema');
  const [copied, setCopied] = useState(false);
  const activityRef = useRef<HTMLDivElement>(null);

  // Auto-scroll activity log
  useEffect(() => {
    if (activeTab === 'activity' && activityRef.current) {
      activityRef.current.scrollTop = activityRef.current.scrollHeight;
    }
  }, [state.activity, activeTab]);

  const handleCopy = () => {
    const dataToCopy = activeTab === 'schema' ? state.schema :
                       activeTab === 'runtime' ? state.runtime :
                       state.activity;
    navigator.clipboard.writeText(JSON.stringify(dataToCopy, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTimestamp = (ts: number) => {
    const date = new Date(ts);
    const timeStr = date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    const ms = String(date.getMilliseconds()).padStart(3, '0');
    return `${timeStr}.${ms}`;
  };

  const getActionColor = (action: ActivityEvent['action']) => {
    switch (action) {
      case 'element_added':
      case 'page_added':
        return 'text-green-600';
      case 'element_deleted':
      case 'page_deleted':
        return 'text-red-600';
      case 'element_selected':
      case 'page_switched':
        return 'text-blue-600';
      case 'element_moved':
      case 'element_resized':
        return 'text-orange-600';
      case 'element_updated':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  const getDataForTab = () => {
    switch (activeTab) {
      case 'schema':
        return state.schema;
      case 'runtime':
        return state.runtime;
      case 'activity':
        return state.activity;
    }
  };

  return (
    <div className="state-drawer">
      <div className="state-drawer-header">
        <div className="flex items-center gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
              {tab.id === 'activity' && state.activity.length > 0 && (
                <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.id ? 'bg-indigo-500' : 'bg-gray-300'
                }`}>
                  {state.activity.length}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-md transition-colors"
            title="Copy JSON to clipboard"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </button>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-md transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="state-drawer-content">
        {activeTab === 'activity' ? (
          <div ref={activityRef} className="activity-log">
            {state.activity.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">No activity yet</p>
            ) : (
              <table className="activity-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Action</th>
                    <th>Element</th>
                    <th>Type</th>
                    <th>Page</th>
                  </tr>
                </thead>
                <tbody>
                  {state.activity.map((event) => (
                    <tr key={event.id}>
                      <td className="text-gray-500">{formatTimestamp(event.timestamp)}</td>
                      <td className={getActionColor(event.action)}>{event.action}</td>
                      <td className="text-gray-600">{event.elementId ? event.elementId.slice(-12) : '-'}</td>
                      <td className="text-gray-500">{event.elementType || '-'}</td>
                      <td className="text-gray-500">{event.pageId ? event.pageId.slice(-12) : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ) : (
          <div className="json-view">
            <JsonView data={getDataForTab()} style={darkStyles} />
          </div>
        )}
      </div>
    </div>
  );
};

export default StateDrawer;
