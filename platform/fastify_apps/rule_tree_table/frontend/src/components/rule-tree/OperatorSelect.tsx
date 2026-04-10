import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { OperatorDef } from '../../utils/field-config';

interface OperatorSelectProps {
  value: string;
  operators: OperatorDef[];
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function OperatorSelect({ value, operators, onChange, disabled = false }: OperatorSelectProps) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });

  const selected = operators.find((op) => op.value === value);

  const updatePos = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
  }, []);

  useEffect(() => {
    if (!open) return;
    updatePos();
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      if (
        buttonRef.current && !buttonRef.current.contains(target) &&
        listRef.current && !listRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    function handleScroll() {
      updatePos();
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [open, updatePos]);

  return (
    <div className="inline-block w-full">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => !disabled && setOpen((prev) => !prev)}
        disabled={disabled}
        className={`w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg text-center font-mono
          focus:outline-none focus:ring-2 focus:ring-accent-400
          ${disabled ? 'bg-slate-50 cursor-not-allowed text-slate-400' : 'bg-white hover:border-slate-300 cursor-pointer'} transition-colors`}
        title={selected?.label}
      >
        {selected?.symbol ?? value}
      </button>

      {open && createPortal(
        <ul
          ref={listRef}
          className="fixed z-[9999] w-max bg-white border border-slate-200 rounded-xl shadow-card-hover py-1 max-h-60 overflow-auto animate-fade-in"
          style={{ top: pos.top, left: pos.left, minWidth: pos.width }}
        >
          {operators.map((op) => (
            <li key={op.value}>
              <button
                type="button"
                onClick={() => {
                  onChange(op.value);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 text-sm hover:bg-accent-50 transition-colors
                  ${op.value === value ? 'bg-accent-50 text-accent-700 font-medium' : 'text-slate-600'}`}
              >
                {op.label}
              </button>
            </li>
          ))}
        </ul>,
        document.body
      )}
    </div>
  );
}
