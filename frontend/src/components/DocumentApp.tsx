'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import DocumentChat, { Message } from './DocumentChat';
import NDAPreview from './NDAPreview';
import GenericDocPreview from './GenericDocPreview';
import AuthScreen from './AuthScreen';
import MyDocumentsModal from './MyDocumentsModal';
import { NDAFormData, DEFAULT_FORM_DATA } from '@/types/nda';
import { DocSlug, DOC_NAMES, GenericDocFields, DEFAULT_GENERIC_FIELDS } from '@/types/document';
import { useDebounced } from '@/hooks/useDebounced';
import { useAuth } from '@/context/AuthContext';

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

function docTitle(documentType: DocSlug, ndaFields: NDAFormData, genericFields: GenericDocFields): string {
  const name = DOC_NAMES[documentType];
  const p1 = ndaFields.party1?.company || genericFields.party1?.company;
  const p2 = ndaFields.party2?.company || genericFields.party2?.company;
  return p1 && p2 ? `${name} - ${p1} & ${p2}` : name;
}

export default function DocumentApp() {
  const { user, loading: authLoading, signOut } = useAuth();

  const [documentType, setDocumentType] = useState<DocSlug | null>(null);
  const [ndaFields, setNdaFields] = useState<NDAFormData>(DEFAULT_FORM_DATA);
  const [genericFields, setGenericFields] = useState<GenericDocFields>(DEFAULT_GENERIC_FIELDS);
  const [templateContent, setTemplateContent] = useState<string | null>(null);
  const [chatKey, setChatKey] = useState(0);
  const [initialMessages, setInitialMessages] = useState<Message[]>([]);
  const messagesRef = useRef<Message[]>([]);

  const [showMyDocs, setShowMyDocs] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const debouncedNda = useDebounced(ndaFields, 600);
  const debouncedGeneric = useDebounced(genericFields, 600);

  // Reset all document state when the signed-in user changes (e.g. sign out → sign in as different user)
  useEffect(() => {
    if (!user) return;
    setDocumentType(null);
    setNdaFields(DEFAULT_FORM_DATA);
    setGenericFields(DEFAULT_GENERIC_FIELDS);
    setTemplateContent(null);
    setInitialMessages([]);
    setSaveStatus('idle');
    messagesRef.current = [];
    setChatKey((k) => k + 1);
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const handleMessagesChange = useCallback((msgs: Message[]) => {
    messagesRef.current = msgs;
  }, []);

  function handleNewDocument() {
    setDocumentType(null);
    setNdaFields(DEFAULT_FORM_DATA);
    setGenericFields(DEFAULT_GENERIC_FIELDS);
    setTemplateContent(null);
    setInitialMessages([]);
    setSaveStatus('idle');
    setChatKey((k) => k + 1);
  }

  async function handleLoadDocument(docId: number) {
    setShowMyDocs(false);
    const res = await fetch(`/api/documents/${docId}`);
    if (!res.ok) return;
    const doc = await res.json();
    setDocumentType(doc.document_type as DocSlug);
    if (doc.document_type === 'mutual-nda') {
      setNdaFields(mergeDeep(DEFAULT_FORM_DATA, doc.fields));
      setGenericFields(DEFAULT_GENERIC_FIELDS);
    } else {
      setGenericFields(mergeDeep(DEFAULT_GENERIC_FIELDS, doc.fields));
      setNdaFields(DEFAULT_FORM_DATA);
    }
    setInitialMessages(doc.messages);
    setSaveStatus('idle');
    setChatKey((k) => k + 1);
  }

  async function handleSave() {
    if (!documentType || saveStatus === 'saving') return;
    setSaveStatus('saving');
    const fields = documentType === 'mutual-nda' ? ndaFields : genericFields;
    const title = docTitle(documentType, ndaFields, genericFields);
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document_type: documentType,
          title,
          fields,
          messages: messagesRef.current,
        }),
      });
      if (res.ok) {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2500);
      } else {
        setSaveStatus('idle');
      }
    } catch {
      setSaveStatus('idle');
    }
  }

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-400">Loading…</p>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  const title = documentType ? DOC_NAMES[documentType] : 'Legal Document Creator';
  const subtitle = documentType
    ? 'Chat with the AI on the left — the document updates live on the right.'
    : 'Tell me what legal document you need and I will help you create it.';

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3 shadow-sm">
        <div className="flex items-center gap-4 min-w-0">
          <span className="text-lg font-bold shrink-0" style={{ color: '#032147' }}>
            Prelegal
          </span>
          {documentType && (
            <>
              <span className="text-gray-300">|</span>
              <p className="truncate text-sm font-medium text-gray-700">{title}</p>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-4">
          {documentType && (
            <button
              onClick={handleSave}
              disabled={saveStatus === 'saving'}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                saveStatus === 'saved'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-[#209dd7] text-white hover:bg-[#1a8abf] disabled:opacity-50'
              }`}
            >
              {saveStatus === 'saving' ? 'Saving…' : saveStatus === 'saved' ? 'Saved!' : 'Save'}
            </button>
          )}

          <button
            onClick={() => setShowMyDocs(true)}
            className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50"
          >
            My Documents
          </button>

          <button
            onClick={handleNewDocument}
            className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50"
          >
            New Document
          </button>

          <div className="ml-1 flex items-center gap-2 border-l border-gray-200 pl-3">
            <span className="max-w-[140px] truncate text-xs text-gray-500">{user.email}</span>
            <button
              onClick={signOut}
              className="text-xs text-gray-400 underline-offset-2 hover:text-gray-600 hover:underline"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Disclaimer banner */}
      <div className="border-b border-yellow-200 bg-yellow-50 px-6 py-1.5 text-center text-xs text-yellow-800">
        Documents are drafts for review purposes only and do not constitute legal advice.
      </div>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-2/5 border-r border-gray-200 bg-white overflow-hidden flex flex-col">
          <DocumentChat
            key={chatKey}
            documentType={documentType}
            onDocumentType={handleDocumentType}
            onNdaFields={handleNdaFields}
            onGenericFields={handleGenericFields}
            onMessagesChange={handleMessagesChange}
            initialMessages={initialMessages}
          />
        </aside>

        <main className="flex-1 bg-gray-100 overflow-hidden flex flex-col">
          {!documentType && (
            <div className="flex h-full flex-col items-center justify-center gap-3">
              <div className="text-center max-w-sm px-4">
                <p className="text-sm text-gray-500 font-medium">{subtitle}</p>
                <p className="mt-2 text-xs text-gray-400">
                  Try: &ldquo;I need an NDA&rdquo; or &ldquo;Help me draft a cloud service agreement&rdquo;
                </p>
              </div>
            </div>
          )}
          {documentType === 'mutual-nda' && <NDAPreview data={debouncedNda} />}
          {documentType !== null && documentType !== 'mutual-nda' && (
            <GenericDocPreview
              documentType={documentType}
              fields={debouncedGeneric}
              templateContent={templateContent ?? undefined}
            />
          )}
        </main>
      </div>

      {showMyDocs && (
        <MyDocumentsModal onClose={() => setShowMyDocs(false)} onLoad={handleLoadDocument} />
      )}
    </div>
  );
}
