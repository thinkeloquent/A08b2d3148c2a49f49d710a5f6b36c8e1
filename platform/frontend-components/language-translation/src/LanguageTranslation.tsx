import { type LanguageTranslationProps, type TranslationEntry } from './types';

const DEFAULT_LANGUAGES = [
  { value: 'en', label: 'en' },
  { value: 'fr', label: 'fr' },
  { value: 'es', label: 'es' },
  { value: 'de', label: 'de' },
];

const DEFAULT_REMOVE_ICON = <span aria-label="Remove">&times;</span>;
const DEFAULT_UP_ICON = <span aria-label="Move up">&uarr;</span>;
const DEFAULT_DOWN_ICON = <span aria-label="Move down">&darr;</span>;
const DEFAULT_ADD_ICON = <span aria-label="Add">+</span>;

export function LanguageTranslation({
  className,
  translationKey,
  onKeyChange,
  translations,
  onTranslationsChange,
  languageOptions = DEFAULT_LANGUAGES,
  defaultLanguage = 'es',
  keyLabel = 'key',
  translationsLabel = 'Translations',
  removeIcon = DEFAULT_REMOVE_ICON,
  moveUpIcon = DEFAULT_UP_ICON,
  moveDownIcon = DEFAULT_DOWN_ICON,
  addIcon = DEFAULT_ADD_ICON,
  onDelete,
  deleteIcon,
}: LanguageTranslationProps) {
  const baseClass = 'border border-gray-300 rounded bg-gray-50 p-4';
  const containerClass = [baseClass, className].filter(Boolean).join(' ');

  const update = (fn: (draft: TranslationEntry[]) => TranslationEntry[]) => {
    onTranslationsChange(fn([...translations.map((t) => ({ ...t }))]));
  };

  const handleDeleteTranslation = (index: number) => {
    update((d) => {
      d.splice(index, 1);
      return d;
    });
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    update((d) => {
      [d[index], d[index - 1]] = [d[index - 1], d[index]];
      return d;
    });
  };

  const handleMoveDown = (index: number) => {
    if (index === translations.length - 1) return;
    update((d) => {
      [d[index], d[index + 1]] = [d[index + 1], d[index]];
      return d;
    });
  };

  const handleTextChange = (index: number, value: string) => {
    update((d) => {
      d[index].text = value;
      return d;
    });
  };

  const handleLanguageChange = (index: number, value: string) => {
    update((d) => {
      d[index].language = value;
      return d;
    });
  };

  const addTranslation = () => {
    onTranslationsChange([...translations, { language: defaultLanguage, text: '' }]);
  };

  const deleteAllTranslations = () => {
    onTranslationsChange([]);
  };

  const deleteLastTranslation = () => {
    if (translations.length === 0) return;
    onTranslationsChange(translations.slice(0, -1));
  };

  return (
    <div className={containerClass}>
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="font-semibold text-gray-700">{keyLabel}</div>
        <div className="font-semibold text-gray-700 col-span-2">{translationsLabel}</div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="border bg-white rounded p-2">
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={translationKey}
            onChange={(e) => onKeyChange(e.target.value)}
          />
        </div>

        <div className="col-span-2 border rounded bg-white p-4">
          <div className="grid grid-cols-6 gap-2 mb-2">
            <div className="col-span-1 font-medium text-gray-700">language</div>
            <div className="col-span-4 font-medium text-gray-700">text</div>
            <div className="col-span-1" />
          </div>

          {translations.map((translation, index) => (
            <div key={index} className="grid grid-cols-6 gap-2 mb-2">
              <div className="col-span-1">
                <select
                  className="w-full p-2 border rounded"
                  value={translation.language}
                  onChange={(e) => handleLanguageChange(index, e.target.value)}
                >
                  {languageOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-4">
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={translation.text}
                  onChange={(e) => handleTextChange(index, e.target.value)}
                />
              </div>
              <div className="col-span-1 flex justify-between">
                <button
                  type="button"
                  className="p-1 border rounded hover:bg-gray-100"
                  onClick={() => handleDeleteTranslation(index)}
                >
                  {removeIcon}
                </button>
                <div className="flex flex-col">
                  <button
                    type="button"
                    className="p-1 border rounded hover:bg-gray-100"
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                  >
                    {moveUpIcon}
                  </button>
                  <button
                    type="button"
                    className="p-1 border rounded hover:bg-gray-100 mt-1"
                    onClick={() => handleMoveDown(index)}
                    disabled={index === translations.length - 1}
                  >
                    {moveDownIcon}
                  </button>
                </div>
              </div>
            </div>
          ))}

          <div className="flex mt-4 space-x-2">
            <button
              type="button"
              className="flex items-center px-3 py-2 border rounded hover:bg-gray-100"
              onClick={addTranslation}
            >
              {addIcon}
              <span className="ml-1">Translation</span>
            </button>
            <button
              type="button"
              className="flex items-center px-3 py-2 border rounded hover:bg-gray-100"
              onClick={deleteLastTranslation}
            >
              {removeIcon}
              <span className="ml-1">Last Translation</span>
            </button>
            <button
              type="button"
              className="flex items-center px-3 py-2 border rounded hover:bg-gray-100"
              onClick={deleteAllTranslations}
            >
              {removeIcon}
              <span className="ml-1">All</span>
            </button>
          </div>
        </div>

        {onDelete && (
          <div className="col-span-3 flex justify-end mt-2">
            <button
              type="button"
              className="p-2 border rounded hover:bg-gray-100"
              onClick={onDelete}
            >
              {deleteIcon ?? removeIcon}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
