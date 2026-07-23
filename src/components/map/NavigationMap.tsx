'use client';

import 'leaflet/dist/leaflet.css';
import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import type { RecyclingShop } from '@/types';

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function makeShopIcon(isNearest: boolean) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:36px;height:36px;border-radius:50%;
      background:${isNearest ? '#059669' : '#ffffff'};
      border:3px solid ${isNearest ? '#047857' : '#10b981'};
      display:flex;align-items:center;justify-content:center;
      font-size:18px;box-shadow:0 2px 8px rgba(0,0,0,0.25);
    ">♻️</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

function makeUserIcon() {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:20px;height:20px;border-radius:50%;
      background:#3b82f6;border:3px solid #fff;
      box-shadow:0 0 0 4px rgba(59,130,246,0.3);
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

interface Props {
  shops: RecyclingShop[];
  onSelectShop: (shop: RecyclingShop, distanceKm: number) => void;
  onNearestShop?: (shop: RecyclingShop, distanceKm: number) => void;
}

const KHON_KAEN = { lat: 16.4419, lng: 102.836 };

export default function NavigationMap({ shops, onSelectShop, onNearestShop }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const nearestFiredRef = useRef(false);

  // init map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      center: [KHON_KAEN.lat, KHON_KAEN.lng],
      zoom: 14,
      zoomControl: true,
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19,
    }).addTo(map);
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  // shop markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    let nearestIdx = -1;
    let nearestDist = Infinity;
    const distances = shops.map((s) => {
      if (!userPos) return 0;
      const d = haversineKm(userPos.lat, userPos.lng, s.latitude, s.longitude);
      if (d < nearestDist) { nearestDist = d; nearestIdx = shops.indexOf(s); }
      return d;
    });
    const markers: L.Marker[] = shops.map((shop, i) => {
      const m = L.marker([shop.latitude, shop.longitude], {
        icon: makeShopIcon(i === nearestIdx),
      }).addTo(map);
      m.on('click', () => onSelectShop(shop, distances[i] ?? 0));
      return m;
    });
    return () => { markers.forEach((m) => m.remove()); };
  }, [shops, userPos, onSelectShop]);

  // geolocation
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const watcher = navigator.geolocation?.watchPosition((pos) => {
      const { latitude: lat, longitude: lng } = pos.coords;
      setUserPos({ lat, lng });
      if (!userMarkerRef.current) {
        userMarkerRef.current = L.marker([lat, lng], { icon: makeUserIcon() }).addTo(map);
        map.setView([lat, lng], 15);
      } else {
        userMarkerRef.current.setLatLng([lat, lng]);
      }
      // แจ้งร้านที่ใกล้สุดครั้งแรกที่รู้ตำแหน่ง
      if (!nearestFiredRef.current && shops.length > 0 && onNearestShop) {
        nearestFiredRef.current = true;
        const nearest = shops
          .map((s) => ({ s, d: haversineKm(lat, lng, s.latitude, s.longitude) }))
          .sort((a, b) => a.d - b.d)[0];
        if (nearest) onNearestShop(nearest.s, nearest.d);
      }
    });
    return () => { if (watcher !== undefined) navigator.geolocation?.clearWatch(watcher); };
  }, [shops, onNearestShop]);

  return <div ref={containerRef} className="h-full w-full" />;
}
