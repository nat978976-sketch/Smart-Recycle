'use client';

import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { recyclingHubIcon, wasteReportIcon } from '@/components/map/icons';
import { WASTE_TYPE_LABELS } from '@/types';
import type { RecyclingShop, WasteReport } from '@/types';

interface ShopReportsMapProps {
  shop: RecyclingShop;
  reports: WasteReport[];
}

export default function ShopReportsMap({ shop, reports }: ShopReportsMapProps) {
  return (
    <MapContainer
      center={[shop.latitude, shop.longitude]}
      zoom={14}
      scrollWheelZoom={false}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Marker position={[shop.latitude, shop.longitude]} icon={recyclingHubIcon}>
        <Popup>{shop.name} (ร้านของคุณ)</Popup>
      </Marker>

      {reports.map((report) => (
        <Marker key={report.id} position={[report.latitude, report.longitude]} icon={wasteReportIcon}>
          <Popup>
            <p className="font-semibold">{WASTE_TYPE_LABELS[report.wasteType]}</p>
            {report.note && <p>{report.note}</p>}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
