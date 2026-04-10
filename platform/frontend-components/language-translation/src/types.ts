import type { ReactNode } from 'react';

/** A single translation entry with a language code and translated text. */
export interface TranslationEntry {
  /** ISO language code (e.g. "en", "fr", "es"). */
  language: string;
  /** The translated text value. */
  text: string;
}

/** Language option for the language selector dropdown. */
export interface LanguageOption {
  /** ISO language code. */
  value: string;
  /** Display label for the language. */
  label: string;
}

/** Props for the LanguageTranslation component. */
export interface LanguageTranslationProps {
  /** CSS class escape hatch. */
  className?: string;
  /** The translation key identifier. */
  translationKey: string;
  /** Callback when the translation key changes. */
  onKeyChange: (key: string) => void;
  /** Array of translation entries. */
  translations: TranslationEntry[];
  /** Callback when translations change (add, remove, reorder, edit). */
  onTranslationsChange: (translations: TranslationEntry[]) => void;
  /** Available language options for the dropdown. */
  languageOptions?: LanguageOption[];
  /** Default language code when adding a new translation. */
  defaultLanguage?: string;
  /** Label for the key column header. */
  keyLabel?: string;
  /** Label for the translations column header. */
  translationsLabel?: string;
  /** Icon for the delete/remove action. Accepts ReactNode. */
  removeIcon?: ReactNode;
  /** Icon for the move-up action. Accepts ReactNode. */
  moveUpIcon?: ReactNode;
  /** Icon for the move-down action. Accepts ReactNode. */
  moveDownIcon?: ReactNode;
  /** Icon for the add action. Accepts ReactNode. */
  addIcon?: ReactNode;
  /** Called when the delete-all button at the bottom-right is clicked. */
  onDelete?: () => void;
  /** Icon for the bottom-right delete button. Accepts ReactNode. */
  deleteIcon?: ReactNode;
}
