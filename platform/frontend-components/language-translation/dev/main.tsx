import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { LanguageTranslation, type TranslationEntry } from '../src';

const INITIAL_TRANSLATIONS: TranslationEntry[] = [
  { language: 'en', text: 'Login' },
  { language: 'fr', text: "S'identifier" },
  { language: 'es', text: 'Iniciar sesion' },
];

function App() {
  const [translationKey, setTranslationKey] = useState('login_label');
  const [translations, setTranslations] = useState(INITIAL_TRANSLATIONS);

  return (
    <div className="p-8 max-w-4xl mx-auto font-[DM_Sans]">
      <h1 className="text-xl font-semibold mb-6">LanguageTranslation — Dev Harness</h1>
      <LanguageTranslation
        translationKey={translationKey}
        onKeyChange={setTranslationKey}
        translations={translations}
        onTranslationsChange={setTranslations}
        onDelete={() => alert('Delete clicked')}
      />
      <pre className="mt-6 p-4 bg-gray-100 rounded text-sm overflow-auto">
        {JSON.stringify({ translationKey, translations }, null, 2)}
      </pre>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
