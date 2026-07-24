'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import type { Marker as LeafletMarker } from 'leaflet';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import { useGeolocation } from '@/hooks/useGeolocation';
import ReportWasteForm from '@/components/waste-report/ReportWasteForm';
import ShopDetailModal from '@/components/shop/ShopDetailModal';
import { pickupPinIcon, recyclingHubIcon, truckDispatchedIcon, userLocationIcon, wasteReportIcon } from './icons';
import { REPORT_STATUS_LABELS, WASTE_TYPE_LABELS } from '@/types';
import type { Coordinates, RecyclingShop, WasteReport, WasteType } from '@/types';
import { distanceKm } from '@/lib/geo/distance';
import { getReportIds } from '@/lib/reportHistory';
import ReportHistoryPanel from './ReportHistoryPanel';
import PriceComparePanel from './PriceComparePanel';
import StatsPanel from './StatsPanel';

const WASTE_EMOJI: Record<WasteType, string> = {
  plastic: '🧴', paper: '📄', glass: '🍶', metal: '🔩',
  electronic: '💻', organic: '🥬', mixed: '🗑️',
};

const Map3DView = dynamic(() => import('./Map3DView'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center text-gray-500">กำลังโหลดแผนที่ 3D...</div>
  ),
});


// ศูนย์กลางเทศบาลนครขอนแก่น ใช้เป็นจุดตั้งต้นของแผนที่ก่อนทราบตำแหน่งผู้ใช้
const KHON_KAEN_CENTER: Coordinates = { latitude: 16.4419, longitude: 102.836 };

type MapLayerType = 'street' | 'satellite' | '3d';

const LAYER_CYCLE: MapLayerType[] = ['street', 'satellite', '3d'];

const LAYER_LABELS: Record<MapLayerType, string> = {
  street:    '🗺️ แผนที่ถนน',
  satellite: '🛰️ ดาวเทียม',
  '3d':      '🏙️ แผนที่ 3D',
};

const TILE_LAYERS: Record<'street' | 'satellite', { url: string; attribution: string }> = {
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
  onCancelReport?: (id: string) => Promise<void> | void;
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
      className="absolute right-3 top-3 z-[1000] rounded-full bg-white p-2 text-lg shadow-md disabled:opacity-50 dark:bg-gray-800"
      aria-label="ไปยังตำแหน่งของฉัน"
    >
      🎯
    </button>
  );
}

export default function MapView({ wasteReports = [], recyclingShops = [], onSubmitReport, onCancelReport }: MapViewProps) {
  const { latitude, longitude, error, isLoading } = useGeolocation();
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [mapLayer, setMapLayer] = useState<MapLayerType>('street');
  const [isPickupMode, setIsPickupMode] = useState(false);
  const [pickupPosition, setPickupPosition] = useState<Coordinates | null>(null);
  const [selectedShop, setSelectedShop] = useState<RecyclingShop | null>(null);
  const [filterType, setFilterType] = useState<WasteType | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showPriceCompare, setShowPriceCompare] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [historyIds, setHistoryIds] = useState<string[]>([]);
  const [hasNewUpdate, setHasNewUpdate] = useState(false);
  const prevStatusRef = useRef<Record<string, WasteReport['status']>>({});

  useEffect(() => {
    setHistoryIds(getReportIds());
  }, []);

  // Feature 2: ตรวจจับสถานะที่เปลี่ยนของ "รายการของฉัน" แล้วแสดง badge
  useEffect(() => {
    const ids = getReportIds();
    let changed = false;
    for (const r of wasteReports) {
      if (!ids.includes(r.id)) continue;
      if (prevStatusRef.current[r.id] !== undefined && prevStatusRef.current[r.id] !== r.status) {
        changed = true;
      }
      prevStatusRef.current[r.id] = r.status;
    }
    if (changed) setHasNewUpdate(true);
  }, [wasteReports]);

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

  const allWasteTypes = useMemo<WasteType[]>(
    () => Array.from(new Set(recyclingShops.flatMap((s) => s.acceptedWasteTypes))) as WasteType[],
    [recyclingShops]
  );

  const filteredShops = useMemo(
    () => filterType ? recyclingShops.filter((s) => s.acceptedWasteTypes.includes(filterType)) : recyclingShops,
    [recyclingShops, filterType]
  );

  const activeOrder = useMemo(() => {
    const ids = historyIds;
    return wasteReports
      .filter((r) => ids.includes(r.id) && r.status !== 'completed' && r.status !== 'cancelled')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] ?? null;
  }, [wasteReports, historyIds]);

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
      {mapLayer === '3d' ? (
        <Map3DView center={mapCenter} recyclingShops={recyclingShops} wasteReports={visibleReports} />
      ) : (
        <MapContainer
          center={[mapCenter.latitude, mapCenter.longitude]}
          zoom={userPosition ? 16 : 13}
          minZoom={12}
          maxZoom={19}
          maxBounds={[[16.28, 102.68], [16.62, 103.02]]}
          maxBoundsViscosity={1.0}
          scrollWheelZoom
          className="h-full w-full"
        >
          <TileLayer
            key={mapLayer}
            attribution={TILE_LAYERS[mapLayer as 'street' | 'satellite'].attribution}
            url={TILE_LAYERS[mapLayer as 'street' | 'satellite'].url}
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

          {filteredShops.map((shop) => (
            <Marker
              key={shop.id}
              position={[shop.latitude, shop.longitude]}
              icon={recyclingHubIcon}
              eventHandlers={{ click: () => setSelectedShop(shop) }}
            />
          ))}

          {isPickupMode && pickupPosition && (
            <DraggablePickupMarker position={pickupPosition} onMove={setPickupPosition} />
          )}

          <RecenterControl position={userPosition} />
        </MapContainer>
      )}

      {isPickupMode && (
        <div className="absolute top-3 left-1/2 z-[1000] -translate-x-1/2 w-[90vw] max-w-sm rounded-2xl bg-white p-3 shadow-xl text-center dark:bg-gray-900">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-200">📌 ลากหมุดแดง หรือแตะแผนที่เพื่อเลือกจุดรับของ</p>
          {pickupPosition && (
            <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
              {pickupPosition.latitude.toFixed(5)}, {pickupPosition.longitude.toFixed(5)}
            </p>
          )}
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={cancelPickupMode}
              className="flex-1 rounded-full border border-gray-200 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
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
        onClick={() => setMapLayer((prev) => {
          const next = LAYER_CYCLE[(LAYER_CYCLE.indexOf(prev) + 1) % LAYER_CYCLE.length];
          return next;
        })}
        className="absolute right-3 top-16 z-[1000] rounded-full bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-md hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        aria-label="สลับรูปแบบแผนที่"
      >
        {LAYER_LABELS[LAYER_CYCLE[(LAYER_CYCLE.indexOf(mapLayer) + 1) % LAYER_CYCLE.length]]}
      </button>

      {!isPickupMode && (
        <div className="absolute bottom-6 left-1/2 z-[1000] -translate-x-1/2 flex flex-col items-center gap-2 w-[92vw] max-w-sm">
          {/* กรองตามประเภทขยะ */}
          <div className="flex gap-1.5 overflow-x-auto w-full pb-0.5 scrollbar-none">
            <button
              type="button"
              onClick={() => setFilterType(null)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition shadow-sm ${
                filterType === null ? 'bg-emerald-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              ทั้งหมด
            </button>
            {allWasteTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFilterType(filterType === type ? null : type)}
                className={`shrink-0 flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition shadow-sm ${
                  filterType === type ? 'bg-emerald-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {WASTE_EMOJI[type]} {WASTE_TYPE_LABELS[type]}
              </button>
            ))}
          </div>

          {/* ปุ่มรอง */}
          <div className="flex gap-2 w-full">
            <button
              type="button"
              onClick={() => { setHistoryIds(getReportIds()); setHasNewUpdate(false); setShowHistory(true); }}
              className="relative flex-1 rounded-full bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-md hover:bg-gray-50 transition dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              📋 ประวัติ
              {hasNewUpdate && (
                <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 ring-2 ring-white" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setShowStats(true)}
              className="flex-1 rounded-full bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-md hover:bg-gray-50 transition"
            >
              📊 สถิติ
            </button>
            <button
              type="button"
              onClick={() => setShowPriceCompare(true)}
              className="flex-1 rounded-full bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-md hover:bg-gray-50 transition"
            >
              💹 ราคา
            </button>
          </div>

          <button
            type="button"
            onClick={enterPickupMode}
            disabled={!userPosition}
            className="w-full rounded-full bg-emerald-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            📍 แจ้งขาย / เรียกรถรับซื้อของเก่า
          </button>
        </div>
      )}



      {isLoading && (
        <div className="absolute left-3 top-3 z-[1000] rounded-md bg-white px-3 py-1 text-sm shadow-md dark:bg-gray-800 dark:text-gray-200">
          กำลังค้นหาตำแหน่งของคุณ...
        </div>
      )}

      {error && (
        <div className="absolute left-3 top-3 z-[1000] max-w-xs rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 shadow-md">
          ไม่สามารถเข้าถึงตำแหน่งได้: {error}
        </div>
      )}

      {/* Banner order ที่กำลังดำเนินอยู่ */}
      {activeOrder && !isPickupMode && (
        <div className={`absolute left-1/2 z-[1000] -translate-x-1/2 w-[92vw] max-w-sm rounded-2xl px-4 py-3 shadow-lg
          ${activeOrder.status === 'truck_dispatched'
            ? 'bg-emerald-600 text-white'
            : activeOrder.status === 'accepted'
            ? 'bg-blue-600 text-white'
            : 'bg-amber-400 text-amber-900'}
          ${isLoading || error ? 'top-28' : 'top-14'}`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xl shrink-0">
                {activeOrder.status === 'truck_dispatched' ? '🚛' : activeOrder.status === 'accepted' ? '✅' : '⏳'}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold leading-tight">
                  {activeOrder.status === 'truck_dispatched' && 'รถกำลังมารับ!'}
                  {activeOrder.status === 'accepted' && 'ร้านรับงานแล้ว'}
                  {activeOrder.status === 'pending' && 'รอร้านรับงาน'}
                </p>
                <p className="text-xs opacity-80 truncate">
                  {WASTE_EMOJI[activeOrder.wasteType]} {WASTE_TYPE_LABELS[activeOrder.wasteType]}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {activeOrder.status !== 'truck_dispatched' && (
                <button
                  type="button"
                  onClick={() => onCancelReport?.(activeOrder.id)}
                  className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold hover:bg-white/30 transition"
                >
                  ยกเลิก
                </button>
              )}
              <button
                type="button"
                onClick={() => { setHistoryIds(getReportIds()); setHasNewUpdate(false); setShowHistory(true); }}
                className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold hover:bg-white/30 transition"
              >
                ดูรายละเอียด
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedShop && (
        <ShopDetailModal shop={selectedShop} onClose={() => setSelectedShop(null)} />
      )}

      {isReportOpen && (pickupPosition ?? userPosition) && (
        <ReportWasteForm
          initialPosition={(pickupPosition ?? userPosition)!}
          shopPrices={nearestShop?.pricePerKg}
          shopName={nearestShop?.name}
          allShops={recyclingShops}
          onClose={() => { setIsReportOpen(false); setPickupPosition(null); }}
          onSubmit={async (data) => {
            await onSubmitReport?.(data);
            setIsReportOpen(false);
            setPickupPosition(null);
          }}
        />
      )}

      {showHistory && (
        <ReportHistoryPanel
          reports={wasteReports}
          historyIds={historyIds}
          onClose={() => setShowHistory(false)}
        />
      )}

      {showPriceCompare && (
        <PriceComparePanel
          shops={recyclingShops}
          userPosition={userPosition}
          onClose={() => setShowPriceCompare(false)}
        />
      )}

      {showStats && (
        <StatsPanel
          reports={wasteReports}
          onClose={() => setShowStats(false)}
        />
      )}
    </div>
  );
}
