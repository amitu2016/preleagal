import dynamic from 'next/dynamic';

const DocumentApp = dynamic(() => import('@/components/DocumentApp'), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen items-center justify-center">
      <p className="text-gray-500">Loading…</p>
    </div>
  ),
});

export default function Home() {
  return <DocumentApp />;
}
