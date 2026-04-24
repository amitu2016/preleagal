'use client';

import { useState } from 'react';
import NDAChat from './NDAChat';
import NDAPreview from './NDAPreview';
import { NDAFormData, DEFAULT_FORM_DATA } from '@/types/nda';
import { useDebounced } from '@/hooks/useDebounced';

function mergeDeep<T extends object>(prev: T, partial: Partial<T>): T {
  const next = { ...prev };
  for (const [k, v] of Object.entries(partial)) {
    if (v == null) continue;
    const key = k as keyof T;
    if (typeof v === 'object' && !Array.isArray(v) && prev[key] != null && typeof prev[key] === 'object') {
      (next as Record<string, unknown>)[k] = mergeDeep(prev[key] as object, v as object);
    } else {
      (next as Record<string, unknown>)[k] = v;
    }
  }
  return next;
}

export default function NDAApp() {
  const [data, setData] = useState<NDAFormData>(DEFAULT_FORM_DATA);
  const debouncedData = useDebounced(data, 600);

  function handleFieldsUpdate(fields: Partial<NDAFormData>) {
    setData((prev) => mergeDeep(prev, fields));
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
        <div>
          <h1 className="text-lg font-bold" style={{ color: '#032147' }}>Mutual NDA Creator</h1>
          <p className="text-xs text-gray-500">
            Chat with the AI on the left — the document updates live on the right.
          </p>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: chat */}
        <aside className="w-2/5 border-r border-gray-200 bg-white overflow-hidden flex flex-col">
          <NDAChat onFieldsUpdate={handleFieldsUpdate} />
        </aside>

        {/* Right: preview */}
        <main className="flex-1 bg-gray-100">
          <NDAPreview data={debouncedData} />
        </main>
      </div>
    </div>
  );
}
