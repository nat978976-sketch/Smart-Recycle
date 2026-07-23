'use client';

import { useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { Coordinates, RecyclingShop, WasteReport } from '@/types';

interface Map3DViewProps {
  center: Coordinates;
  wasteReports?: WasteReport[];
  recyclingShops?: RecyclingShop[];
}

// Hybrid style: Esri satellite + CARTO Voyager labels only
// → ดูเหมือน Google Maps Satellite mode — ภาพดาวเทียมพร้อมชื่อถนน
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const BASE_STYLE: any = {
  version: 8,
  sources: {
    satellite: {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      maxzoom: 19,
      attribution: 'Tiles &copy; Esri',
    },
    labels: {
      type: 'raster',
      tiles: [
        'https://a.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}@2x.png',
        'https://b.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}@2x.png',
        'https://c.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}@2x.png',
      ],
      tileSize: 512,
    },
  },
  layers: [
    {
      id: 'satellite',
      type: 'raster',
      source: 'satellite',
      paint: {
        'raster-saturation': 0.2,   // เพิ่ม vivid เล็กน้อย
        'raster-contrast': 0.1,     // contrast นิดหน่อย
        'raster-brightness-max': 0.95,
      },
    },
    {
      id: 'labels',
      type: 'raster',
      source: 'labels',
      paint: { 'raster-opacity': 0.8 },  // ชื่อถนน + ป้าย overlay บน satellite
    },
  ],
};

function buildingRing(lat: number, lng: number, size: number) {
  return [[
    [lng - size, lat - size],
    [lng + size, lat - size],
    [lng + size, lat + size],
    [lng - size, lat + size],
    [lng - size, lat - size],
  ]];
}

function makePinEl(name: string) {
  const wrap = document.createElement('div');
  wrap.title = name;
  wrap.style.cssText =
    'display:flex;flex-direction:column;align-items:center;cursor:pointer;' +
    'filter:drop-shadow(0 6px 18px rgba(0,0,0,.65));';

  wrap.innerHTML =
    `<div style="` +
      `width:50px;height:50px;border-radius:50%;` +
      `background:linear-gradient(145deg,#a7f3d0 0%,#10b981 40%,#065f46 100%);` +
      `border:3px solid rgba(255,255,255,0.95);` +
      `box-shadow:0 0 0 5px rgba(16,185,129,0.45),0 4px 14px rgba(0,0,0,.45);` +
      `display:flex;align-items:center;justify-content:center;font-size:26px;` +
    `">♻️</div>` +
    `<div style="width:4px;height:20px;background:linear-gradient(to bottom,#059669,#064e3b);border-radius:2px;"></div>` +
    `<div style="width:0;height:0;` +
      `border-left:8px solid transparent;border-right:8px solid transparent;` +
      `border-top:14px solid #064e3b;` +
    `"></div>`;

  return wrap;
}

export default function Map3DView({ center, recyclingShops = [] }: Map3DViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: BASE_STYLE,
      center: [center.longitude, center.latitude],
      zoom: 15.5,
      pitch: 65,
      bearing: -18,
    });

    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl(), 'top-right');

    map.on('load', () => {

      // Terrain DEM — AWS free tiles
      try {
        map.addSource('terrain-dem', {
          type: 'raster-dem',
          tiles: ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],
          tileSize: 256,
          encoding: 'terrarium' as const,
          maxzoom: 15,
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (map as any).setTerrain({ source: 'terrain-dem', exaggeration: 3 });
      } catch { /* ข้าม */ }

      // Sky atmosphere
      try {
        map.addLayer({
          id: 'sky',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          type: 'sky' as any,
          paint: {
            'sky-type': 'atmosphere',
            'sky-atmosphere-sun': [0.0, 90.0],
            'sky-atmosphere-sun-intensity': 15,
          } as object,
        });
      } catch { /* ข้าม */ }

      // ---- อาคารร้านค้า 3D ----
      const activeShops = recyclingShops.filter((s) => s.isActive);
      if (activeShops.length === 0) return;

      const features = activeShops.map((shop) => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Polygon' as const,
          coordinates: buildingRing(shop.latitude, shop.longitude, 0.00022),
        },
        properties: { name: shop.name, phone: shop.phone ?? '' },
      }));

      // halo glow รอบอาคาร (ใหญ่กว่า + โปร่งใส)
      const glowFeatures = activeShops.map((shop) => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Polygon' as const,
          coordinates: buildingRing(shop.latitude, shop.longitude, 0.0005),
        },
        properties: {},
      }));

      map.addSource('shops', { type: 'geojson', data: { type: 'FeatureCollection', features } });
      map.addSource('shops-glow', { type: 'geojson', data: { type: 'FeatureCollection', features: glowFeatures } });

      // 1) Glow พื้นรอบอาคาร
      map.addLayer({
        id: 'shop-glow',
        type: 'fill-extrusion',
        source: 'shops-glow',
        paint: {
          'fill-extrusion-color': '#34d399',
          'fill-extrusion-height': 1,
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': 0.2,
        },
      });

      // 2) ฐาน
      map.addLayer({
        id: 'shop-base',
        type: 'fill-extrusion',
        source: 'shops',
        paint: {
          'fill-extrusion-color': '#022c22',
          'fill-extrusion-height': 14,
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': 1,
        },
      });

      // 3) ผนัง
      map.addLayer({
        id: 'shop-walls',
        type: 'fill-extrusion',
        source: 'shops',
        paint: {
          'fill-extrusion-color': '#059669',
          'fill-extrusion-height': 62,
          'fill-extrusion-base': 14,
          'fill-extrusion-opacity': 0.93,
        },
      });

      // 4) หลังคา
      map.addLayer({
        id: 'shop-roof',
        type: 'fill-extrusion',
        source: 'shops',
        paint: {
          'fill-extrusion-color': '#6ee7b7',
          'fill-extrusion-height': 70,
          'fill-extrusion-base': 62,
          'fill-extrusion-opacity': 1,
        },
      });

      // ---- Pin markers ----
      activeShops.forEach((shop) => {
        const el = makePinEl(shop.name);

        const popup = new maplibregl.Popup({
          offset: [0, -86],
          maxWidth: '240px',
          closeButton: false,
        }).setHTML(
          `<div style="font-family:sans-serif;padding:6px 2px">` +
          `<p style="margin:0 0 4px;font-weight:700;font-size:14px">♻️ ${shop.name}</p>` +
          (shop.phone
            ? `<p style="margin:0 0 6px;color:#555;font-size:12px">📞 ${shop.phone}</p>`
            : '') +
          `<a href="https://www.google.com/maps/dir/?api=1&destination=${shop.latitude},${shop.longitude}" ` +
          `target="_blank" rel="noopener noreferrer" ` +
          `style="display:block;text-align:center;padding:6px;background:#059669;color:#fff;` +
          `border-radius:16px;font-size:12px;font-weight:600;text-decoration:none">🗺️ นำทาง</a>` +
          `</div>`
        );

        new maplibregl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat([shop.longitude, shop.latitude])
          .setPopup(popup)
          .addTo(map);
      });

      map.on('click', 'shop-walls', (e) => {
        if (!e.features?.[0]) return;
        const p = e.features[0].properties as { name: string; phone: string };
        new maplibregl.Popup({ offset: 5 })
          .setLngLat(e.lngLat)
          .setHTML(
            `<strong>♻️ ${p.name}</strong>` +
            (p.phone ? `<br><span style="color:#555;font-size:12px">📞 ${p.phone}</span>` : '')
          )
          .addTo(map);
      });

      map.on('mouseenter', 'shop-walls', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'shop-walls', () => { map.getCanvas().style.cursor = ''; });
    });

    return () => { map.remove(); mapRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={containerRef} className="h-full w-full" />;
}
