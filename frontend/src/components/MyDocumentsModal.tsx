'use client';

import { useEffect, useState } from 'react';
import { DocSlug, DOC_NAMES } from '@/types/document';

interface DocSummary {
  id: number;
  document_type: string;
  title: string;
  created_at: string;
}

interface Props {
  onClose: () => void;
  onLoad: (docId: number) => void;
}

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function MyDocumentsModal({ onClose, onLoad }: Props) {
  const [docs, setDocs] = useState<DocSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/documents')
      .then((r) => r.json())
      .then(setDocs)
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: number, e: React.MouseEvent) {
    e.stopPropagation();
    setDeleting(id);
    const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
    if (res.ok || res.status === 204) {
      setDocs((prev) => prev.filter((d) => d.id !== id));
    }
    setDeleting(null);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl bg-white shadow-xl ring-1 ring-black/5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-base font-semibold" style={{ color: '#032147' }}>
            My Documents
          </h2>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-6 py-4">
          {loading ? (
            <p className="py-10 text-center text-sm text-gray-400">Loading…</p>
          ) : docs.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-400">
              No saved documents yet. Create and save a document to see it here.
            </p>
          ) : (
            <ul className="space-y-2">
              {docs.map((doc) => (
                <li
                  key={doc.id}
                  onClick={() => onLoad(doc.id)}
                  className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-200 px-4 py-3 transition-colors hover:border-[#209dd7]/40 hover:bg-blue-50/30"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">{doc.title}</p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {DOC_NAMES[doc.document_type as DocSlug] ?? doc.document_type}
                      &nbsp;·&nbsp;
                      {formatDate(doc.created_at)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDelete(doc.id, e)}
                    disabled={deleting === doc.id}
                    className="ml-4 shrink-0 rounded px-2.5 py-1 text-xs text-red-500 transition-colors hover:bg-red-50 disabled:opacity-40"
                  >
                    {deleting === doc.id ? '…' : 'Delete'}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
