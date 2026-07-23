'use client';

import { useMemo, useRef, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import type { Marker as LeafletMarker } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useGeolocation } from '@/hooks/useGeolocation';
import ReportWasteForm from '@/components/waste-report/ReportWasteForm';
import { pickupPinIcon, recyclingHubIcon, truckDispatchedIcon, userLocationIcon, wasteReportIcon } from './icons';
import { REPORT_STATUS_LABELS, WASTE_TYPE_LABELS } from '@/types';
import type { Coordinates, RecyclingShop, WasteReport } from '@/types';
import { distanceKm } from '@/lib/geo/distance';

type AppMode = 'report' | 'navigate';

// ศูนย์กลางเทศบาลนครขอนแก่น ใช้เป็นจุดตั้งต้นของแผนที่ก่อนทราบตำแหน่งผู้ใช้
const KHON_KAEN_CENTER: Coordinates = { latitude: 16.4419, longitude: 102.836 };

type MapLayerType = 'street' | 'satellite';

const TILE_LAYERS: Record<MapLayerType, { url: string; attribution: string }> = {
  street: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community',
  },
};

interface MapViewProps {
  wasteReports?: WasteReport[];
  recyclingShops?: RecyclingShop[];
  onSubmitReport?: (report: Omit<WasteReport, 'id' | 'createdAt' | 'status'>) => Promise<void> | void;
}

function DraggablePickupMarker({ position, onMove }: { position: Coordinates; onMove: (pos: Coordinates) => void }) {
  const markerRef = useRef<LeafletMarker>(null);

  useMapEvents({
    click(e) {
      onMove({ latitude: e.latlng.lat, longitude: e.latlng.lng });
    },
  });

  return (
    <Marker
      draggable
      position={[position.latitude, position.longitude]}
      icon={pickupPinIcon}
      ref={markerRef}
      eventHandlers={{
        dragend: () => {
          const ll = markerRef.current?.getLatLng();
          if (ll) onMove({ latitude: ll.lat, longitude: ll.lng });
        },
      }}
    >
      <Popup>📌 จุดรับของ — ลากหรือแตะแผนที่เพื่อเปลี่ยนตำแหน่ง</Popup>
    </Marker>
  );
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
  const [mapLayer, setMapLayer] = useState<MapLayerType>('street');
  const [appMode, setAppMode] = useState<AppMode>('report');
  const [isPickupMode, setIsPickupMode] = useState(false);
  const [pickupPosition, setPickupPosition] = useState<Coordinates | null>(null);

  function enterPickupMode() {
    if (!userPosition) return;
    setPickupPosition(userPosition);
    setIsPickupMode(true);
  }

  function confirmPickup() {
    setIsPickupMode(false);
    setIsReportOpen(true);
  }

  function cancelPickupMode() {
    setIsPickupMode(false);
    setPickupPosition(null);
  }

  const userPosition = useMemo<Coordinates | null>(
    () => (latitude !== null && longitude !== null ? { latitude, longitude } : null),
    [latitude, longitude]
  );

  const mapCenter = userPosition ?? KHON_KAEN_CENTER;

  // ไม่แสดงรายงานที่เก็บเรียบร้อย/ยกเลิกแล้วบนแผนที่ เพื่อไม่ให้หมุดเก่าค้างอยู่
  const visibleReports = useMemo(
    () => wasteReports.filter((report) => report.status !== 'completed' && report.status !== 'cancelled'),
    [wasteReports]
  );

  const nearestShop = useMemo<(RecyclingShop & { distanceKm: number }) | null>(() => {
    if (!userPosition || recyclingShops.length === 0) return null;
    const active = recyclingShops.filter((s) => s.isActive);
    if (active.length === 0) return null;
    let closest = active[0];
    let closestDist = distanceKm(userPosition, active[0]);
    for (const shop of active.slice(1)) {
      const d = distanceKm(userPosition, shop);
      if (d < closestDist) { closestDist = d; closest = shop; }
    }
    return { ...closest, distanceKm: closestDist };
  }, [userPosition, recyclingShops]);

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={[mapCenter.latitude, mapCenter.longitude]}
        zoom={userPosition ? 16 : 13}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          key={mapLayer}
          attribution={TILE_LAYERS[mapLayer].attribution}
          url={TILE_LAYERS[mapLayer].url}
        />

        {userPosition && (
          <Marker position={[userPosition.latitude, userPosition.longitude]} icon={userLocationIcon}>
            <Popup>ตำแหน่งของคุณ</Popup>
          </Marker>
        )}

        {visibleReports.map((report) => (
          <Marker
            key={report.id}
            position={[report.latitude, report.longitude]}
            icon={report.status === 'truck_dispatched' ? truckDispatchedIcon : wasteReportIcon}
          >
            <Popup>
              <p className="font-semibold">คำขอขายของเก่า</p>
              <p>ประเภท: {WASTE_TYPE_LABELS[report.wasteType]}</p>
              <p>สถานะ: {REPORT_STATUS_LABELS[report.status]}</p>
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

        {isPickupMode && pickupPosition && (
          <DraggablePickupMarker position={pickupPosition} onMove={setPickupPosition} />
        )}

        <RecenterControl position={userPosition} />
      </MapContainer>

      {isPickupMode && (
        <div className="absolute top-3 left-1/2 z-[1000] -translate-x-1/2 w-[90vw] max-w-sm rounded-2xl bg-white p-3 shadow-xl text-center">
          <p className="text-sm font-medium text-gray-700">📌 ลากหมุดแดง หรือแตะแผนที่เพื่อเลือกจุดรับของ</p>
          {pickupPosition && (
            <p className="mt-0.5 text-xs text-gray-400">
              {pickupPosition.latitude.toFixed(5)}, {pickupPosition.longitude.toFixed(5)}
            </p>
          )}
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={cancelPickupMode}
              className="flex-1 rounded-full border border-gray-200 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
            >
              ✕ ยกเลิก
            </button>
            <button
              type="button"
              onClick={confirmPickup}
              className="flex-1 rounded-full bg-emerald-600 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition"
            >
              ✓ ยืนยันจุดรับ
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setMapLayer((prev) => (prev === 'street' ? 'satellite' : 'street'))}
        className="absolute right-3 top-16 z-[1000] rounded-full bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-md hover:bg-gray-100"
        aria-label="สลับรูปแบบแผนที่"
      >
        {mapLayer === 'street' ? '🛰️ ดาวเทียม' : '🗺️ แผนที่ถนน'}
      </button>

      {/* โหมดเรียกรถ */}
      {appMode === 'report' && !isPickupMode && (
        <div className="absolute bottom-6 left-1/2 z-[1000] -translate-x-1/2 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => setAppMode('navigate')}
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-blue-600 shadow-md hover:bg-blue-50 transition"
          >
            🧭 โหมดนำทางไปร้านค้า
          </button>
          <button
            type="button"
            onClick={enterPickupMode}
            disabled={!userPosition}
            className="rounded-full bg-emerald-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            📍 แจ้งขาย / เรียกรถรับซื้อของเก่า
          </button>
        </div>
      )}

      {/* โหมดนำทาง */}
      {appMode === 'navigate' && (
        <div className="absolute bottom-6 left-1/2 z-[1000] w-[90vw] max-w-sm -translate-x-1/2 rounded-2xl bg-white p-4 shadow-xl">
          {!userPosition ? (
            <p className="text-center text-sm text-gray-500">รอตำแหน่งของคุณ...</p>
          ) : nearestShop ? (
            <>
              <p className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">ร้านที่ใกล้ที่สุด</p>
              <p className="font-bold text-gray-800 text-base">{nearestShop.name}</p>
              <p className="text-sm text-gray-500 mt-0.5">
                ห่าง {nearestShop.distanceKm < 1
                  ? `${Math.round(nearestShop.distanceKm * 1000)} เมตร`
                  : `${nearestShop.distanceKm.toFixed(1)} กม.`}
              </p>
              <p className="text-sm text-gray-500">รับ: {nearestShop.acceptedWasteTypes.map((t) => WASTE_TYPE_LABELS[t]).join(', ')}</p>
              {nearestShop.phone && <p className="text-sm text-gray-500">โทร: {nearestShop.phone}</p>}
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${nearestShop.latitude},${nearestShop.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 block w-full rounded-full bg-blue-600 py-2 text-center text-sm font-semibold text-white hover:bg-blue-700 transition"
              >
                🗺️ เปิดแผนที่นำทาง
              </a>
            </>
          ) : (
            <p className="text-center text-sm text-gray-500">ไม่พบร้านค้าในระบบ</p>
          )}
          <button
            type="button"
            onClick={() => setAppMode('report')}
            className="mt-3 block w-full rounded-full border border-gray-200 py-2 text-center text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
          >
            🚛 กลับโหมดเรียกรถ
          </button>
        </div>
      )}

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

      {isReportOpen && (pickupPosition ?? userPosition) && (
        <ReportWasteForm
          initialPosition={(pickupPosition ?? userPosition)!}
          onClose={() => { setIsReportOpen(false); setPickupPosition(null); }}
          onSubmit={async (data) => {
            await onSubmitReport?.(data);
            setIsReportOpen(false);
            setPickupPosition(null);
          }}
        />
      )}
    </div>
  );
}
