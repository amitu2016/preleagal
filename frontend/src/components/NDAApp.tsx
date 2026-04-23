'use client';

import { useState, useEffect } from 'react';
import NDAForm from './NDAForm';
import NDAPreview from './NDAPreview';
import { NDAFormData, DEFAULT_FORM_DATA } from '@/types/nda';

function useDebounced<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export default function NDAApp() {
  const [data, setData] = useState<NDAFormData>(DEFAULT_FORM_DATA);
  const debouncedData = useDebounced(data, 600);

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Mutual NDA Creator</h1>
          <p className="text-xs text-gray-500">
            Fill in the details on the left — the document updates live on the right.
          </p>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: form */}
        <aside className="w-2/5 border-r border-gray-200 bg-white">
          <NDAForm data={data} onChange={setData} />
        </aside>

        {/* Right: preview */}
        <main className="flex-1 bg-gray-100">
          <NDAPreview data={debouncedData} />
        </main>
      </div>
    </div>
  );
}
