'use client';

import { usePDF } from '@react-pdf/renderer';
import { useEffect } from 'react';
import NDADocument from './NDADocument';
import { NDAFormData } from '@/types/nda';
import { pdfFilename } from '@/lib/ndaHelpers';

interface Props {
  data: NDAFormData;
}

export default function NDAPreview({ data }: Props) {
  const [instance, updateInstance] = usePDF({ document: <NDADocument data={data} /> });

  useEffect(() => {
    updateInstance(<NDADocument data={data} />);
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-5 py-3">
        <span className="text-sm font-medium text-gray-700">Preview</span>
        <a
          href={instance.url ?? undefined}
          download={pdfFilename(data)}
          className={`rounded-md px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors ${
            instance.loading || !instance.url
              ? 'cursor-not-allowed bg-blue-300'
              : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
          }`}
          aria-disabled={instance.loading || !instance.url}
          onClick={(e) => {
            if (instance.loading || !instance.url) e.preventDefault();
          }}
        >
          {instance.loading ? 'Preparing PDF…' : 'Download PDF'}
        </a>
      </div>
      <div className="flex-1">
        {instance.url ? (
          <iframe
            src={instance.url}
            className="h-full w-full border-0"
            title="NDA Preview"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            {instance.error ? 'Error rendering PDF.' : 'Generating preview…'}
          </div>
        )}
      </div>
    </div>
  );
}
