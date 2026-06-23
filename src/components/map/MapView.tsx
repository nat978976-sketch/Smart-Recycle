'use client';

import { useMemo, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useGeolocation } from '@/hooks/useGeolocation';
import ReportWasteForm from '@/components/waste-report/ReportWasteForm';
import { recyclingHubIcon, userLocationIcon, wasteReportIcon } from './icons';
import { WASTE_TYPE_LABELS } from '@/types';
import type { Coordinates, RecyclingShop, WasteReport } from '@/types';

// ศูนย์กลางเทศบาลนครขอนแก่น ใช้เป็นจุดตั้งต้นของแผนที่ก่อนทราบตำแหน่งผู้ใช้
const KHON_KAEN_CENTER: Coordinates = { latitude: 16.4419, longitude: 102.836 };

interface MapViewProps {
  wasteReports?: WasteReport[];
  recyclingShops?: RecyclingShop[];
  onSubmitReport?: (report: Omit<WasteReport, 'id' | 'createdAt' | 'status'>) => Promise<void> | void;
}

function RecenterControl({ position }: { position: Coordinates | null }) {
  const map = useMap();

  return (
    <button
      type="button"
      onClick={() => position && map.flyTo([position.latitude, position.longitude], 16)}
      disabled={!position}
      className="absolute right-3 top-3 z-[1000] rounded-full bg-white p-2 text-lg shadow-md disabled:opacity-50"
      aria-label="ไปยังตำแหน่งของฉัน"
    >
      🎯
    </button>
  );
}

export default function MapView({ wasteReports = [], recyclingShops = [], onSubmitReport }: MapViewProps) {
  const { latitude, longitude, error, isLoading } = useGeolocation();
  const [isReportOpen, setIsReportOpen] = useState(false);

  const userPosition = useMemo<Coordinates | null>(
    () => (latitude !== null && longitude !== null ? { latitude, longitude } : null),
    [latitude, longitude]
  );

  const mapCenter = userPosition ?? KHON_KAEN_CENTER;

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={[mapCenter.latitude, mapCenter.longitude]}
        zoom={userPosition ? 16 : 13}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {userPosition && (
          <Marker position={[userPosition.latitude, userPosition.longitude]} icon={userLocationIcon}>
            <Popup>ตำแหน่งของคุณ</Popup>
          </Marker>
        )}

        {wasteReports.map((report) => (
          <Marker key={report.id} position={[report.latitude, report.longitude]} icon={wasteReportIcon}>
            <Popup>
              <p className="font-semibold">รายงานขยะ</p>
              <p>ประเภท: {WASTE_TYPE_LABELS[report.wasteType]}</p>
              <p>สถานะ: {report.status}</p>
            </Popup>
          </Marker>
        ))}

        {recyclingShops.map((shop) => (
          <Marker key={shop.id} position={[shop.latitude, shop.longitude]} icon={recyclingHubIcon}>
            <Popup>
              <p className="font-semibold">{shop.name}</p>
              <p>รับ: {shop.acceptedWasteTypes.map((type) => WASTE_TYPE_LABELS[type]).join(', ')}</p>
              {shop.phone && <p>โทร: {shop.phone}</p>}
            </Popup>
          </Marker>
        ))}

        <RecenterControl position={userPosition} />
      </MapContainer>

      <div className="absolute bottom-6 left-1/2 z-[1000] -translate-x-1/2">
        <button
          type="button"
          onClick={() => setIsReportOpen(true)}
          disabled={!userPosition}
          className="rounded-full bg-emerald-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          📍 รายงานขยะ / เรียกรถเก็บขยะ
        </button>
      </div>

      {isLoading && (
        <div className="absolute left-3 top-3 z-[1000] rounded-md bg-white px-3 py-1 text-sm shadow-md">
          กำลังค้นหาตำแหน่งของคุณ...
        </div>
      )}

      {error && (
        <div className="absolute left-3 top-3 z-[1000] max-w-xs rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 shadow-md">
          ไม่สามารถเข้าถึงตำแหน่งได้: {error}
        </div>
      )}

      {isReportOpen && userPosition && (
        <ReportWasteForm
          initialPosition={userPosition}
          onClose={() => setIsReportOpen(false)}
          onSubmit={async (data) => {
            await onSubmitReport?.(data);
            setIsReportOpen(false);
          }}
        />
      )}
    </div>
  );
}
