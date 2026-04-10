import { createRoot } from 'react-dom/client';
import './styles.css';
import { AiopsPromptOneshotTemplate } from '../src';

createRoot(document.getElementById('root')!).render(
  <AiopsPromptOneshotTemplate
    onSave={(template, data, version) => {
      console.log('[onSave]', { version, variableCount: Object.keys(data).length });
    }}
    onCopy={(output) => {
      console.log('[onCopy] copied', output.length, 'chars');
    }}
  />,
);
