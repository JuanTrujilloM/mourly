'use client';

import { useState, type KeyboardEvent } from 'react';

export function TagInput({
  value,
  onChange,
  suggestions = [],
  placeholder = 'Escribí y presioná Enter',
  hasError = false,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
  hasError?: boolean;
}) {
  const [draft, setDraft] = useState('');

  const addTag = (raw: string) => {
    const tag = raw.trim();
    const exists = value.some((t) => t.toLowerCase() === tag.toLowerCase());
    if (tag && !exists) onChange([...value, tag]);
    setDraft('');
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addTag(draft);
    } else if (event.key === 'Backspace' && !draft && value.length) {
      removeTag(value[value.length - 1]);
    }
  };

  const openSuggestions = suggestions.filter(
    (s) => !value.some((t) => t.toLowerCase() === s.toLowerCase()),
  );

  return (
    <div className="space-y-3">
      <div
        className={`bg-surface rounded-input flex min-h-12 flex-wrap items-center gap-2 border px-3 py-2 ${
          hasError ? 'border-error' : 'border-line'
        }`}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="bg-ink text-page flex h-7 items-center gap-1.5 rounded-full px-3 text-[13.5px] font-[550]"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              aria-label={`Quitar ${tag}`}
              className="hover:opacity-70"
            >
              ×
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder={value.length ? '' : placeholder}
          className="text-ink placeholder:text-gris-500 min-w-[8rem] flex-1 bg-transparent py-1 text-[15px] outline-none"
        />
      </div>

      {openSuggestions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {openSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => addTag(suggestion)}
              className="border-line text-ink-2 hover:border-ink hover:text-ink rounded-full border px-3 py-1 text-xs transition duration-(--dur-fast)"
            >
              + {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
