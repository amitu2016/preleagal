'use client';

import { useCallback, useEffect, useState } from 'react';
import DocumentChat from './DocumentChat';
import NDAPreview from './NDAPreview';
import GenericDocPreview from './GenericDocPreview';
import { NDAFormData, DEFAULT_FORM_DATA } from '@/types/nda';
import { DocSlug, DOC_NAMES, GenericDocFields, DEFAULT_GENERIC_FIELDS } from '@/types/document';
import { useDebounced } from '@/hooks/useDebounced';

function mergeDeep<T extends object>(prev: T, partial: Partial<T>): T {
  const next = { ...prev };
  for (const [k, v] of Object.entries(partial)) {
    if (v == null) continue;
    const key = k as keyof T;
    if (
      typeof v === 'object' &&
      !Array.isArray(v) &&
      prev[key] != null &&
      typeof prev[key] === 'object'
    ) {
      (next as Record<string, unknown>)[k] = mergeDeep(prev[key] as object, v as object);
    } else {
      (next as Record<string, unknown>)[k] = v;
    }
  }
  return next;
}

export default function DocumentApp() {
  const [documentType, setDocumentType] = useState<DocSlug | null>(null);
  const [ndaFields, setNdaFields] = useState<NDAFormData>(DEFAULT_FORM_DATA);
  const [genericFields, setGenericFields] = useState<GenericDocFields>(DEFAULT_GENERIC_FIELDS);
  const [templateContent, setTemplateContent] = useState<string | null>(null);

  const debouncedNda = useDebounced(ndaFields, 600);
  const debouncedGeneric = useDebounced(genericFields, 600);

  useEffect(() => {
    if (!documentType || documentType === 'mutual-nda') return;
    fetch(`/api/documents/${documentType}/template`)
      .then((r) => r.json())
      .then((data) => setTemplateContent(data.content))
      .catch(() => setTemplateContent(null));
  }, [documentType]);

  const handleDocumentType = useCallback((slug: DocSlug) => {
    setDocumentType(slug);
  }, []);

  const handleNdaFields = useCallback((fields: Partial<NDAFormData>) => {
    setNdaFields((prev) => mergeDeep(prev, fields));
  }, []);

  const handleGenericFields = useCallback((fields: Partial<GenericDocFields>) => {
    setGenericFields((prev) => mergeDeep(prev, fields));
  }, []);

  const title = documentType ? DOC_NAMES[documentType] : 'Legal Document Creator';
  const subtitle = documentType
    ? 'Chat with the AI on the left — the document updates live on the right.'
    : 'Tell me what legal document you need and I will help you create it.';

  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center gap-3 border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
        <div>
          <h1 className="text-lg font-bold" style={{ color: '#032147' }}>{title}</h1>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-2/5 border-r border-gray-200 bg-white overflow-hidden flex flex-col">
          <DocumentChat
            documentType={documentType}
            onDocumentType={handleDocumentType}
            onNdaFields={handleNdaFields}
            onGenericFields={handleGenericFields}
          />
        </aside>

        <main className="flex-1 bg-gray-100">
          {documentType === 'mutual-nda' ? (
            <NDAPreview data={debouncedNda} />
          ) : documentType !== null ? (
            <GenericDocPreview documentType={documentType} fields={debouncedGeneric} templateContent={templateContent ?? undefined} />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3">
              <p className="text-sm text-gray-400">Document preview will appear here once identified.</p>
              <p className="text-xs text-gray-300">Try: &ldquo;I need an NDA&rdquo; or &ldquo;Help me draft a cloud service agreement&rdquo;</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
