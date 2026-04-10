import { createRoot } from 'react-dom/client';
import './styles.css';
import { PanelPropertyDesignGuide } from '../src';

function App() {
  return (
    <div className="min-h-screen bg-gray-950 p-8 flex justify-end">
      <PanelPropertyDesignGuide
        defaultSettings={{
          type: 'columns',
          count: 12,
          color: '#0099FF',
        }}
      />
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
