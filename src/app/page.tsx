'use client';

import dynamic from 'next/dynamic';
import { useWasteReports } from '@/hooks/useWasteReports';
import { SEED_RECYCLING_SHOPS } from '@/lib/data/recyclingShops';

// โหลด MapView แบบ client-only เพราะ Leaflet ต้องใช้ window/document
const MapView = dynamic(() => import('@/components/map/MapView'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center text-gray-500">กำลังโหลดแผนที่...</div>
  ),
});

export default function HomePage() {
  const { reports, submitReport } = useWasteReports();

  return (
    <main className="h-screen w-screen">
      <MapView wasteReports={reports} recyclingShops={SEED_RECYCLING_SHOPS} onSubmitReport={submitReport} />
    </main>
  );
}
