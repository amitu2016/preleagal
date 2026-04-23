import dynamic from 'next/dynamic';

const NDAApp = dynamic(() => import('@/components/NDAApp'), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen items-center justify-center">
      <p className="text-gray-500">Loading NDA Creator…</p>
    </div>
  ),
});

export default function Home() {
  return <NDAApp />;
}
