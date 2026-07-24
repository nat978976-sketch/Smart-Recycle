import type { WasteReport, WasteType, ReportStatus } from '@/types';

const WASTE_TYPES: WasteType[] = ['plastic', 'paper', 'metal', 'glass', 'electronic', 'organic', 'mixed'];
const WASTE_WEIGHT = [30, 20, 15, 10, 10, 10, 5]; // weighted probability

// รายการที่ active บนแผนที่ถูกกำหนดด้านล่างแยกต่างหาก เหลือแค่ 5 อัน
const CLOSED_STATUSES: ReportStatus[] = [
  'completed', 'completed', 'completed', 'completed', 'completed',
  'completed', 'completed', 'completed', 'completed', 'cancelled',
];

const NOTES = [
  'มีของเยอะมาก', 'ขวดพลาสติกหลายลัง', 'กระดาษหนังสือพิมพ์เก่า', 'เศษเหล็กจากงานก่อสร้าง',
  'เครื่องใช้ไฟฟ้าเก่า', 'ขวดแก้วจากร้านอาหาร', 'ขยะคละจากครัวเรือน', 'กระป๋องอลูมิเนียม',
  'กระดาษกล่องพัสดุ', 'โทรศัพท์มือถือเก่า', undefined, undefined, undefined, undefined,
];

// Khon Kaen city area center
const LAT_CENTER = 16.4419;
const LNG_CENTER = 102.836;

// deterministic pseudo-random using seed
function prng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function pickWeighted<T>(items: T[], weights: number[], rand: () => number): T {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rand() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

export function generateSeedReports(): WasteReport[] {
  const rand = prng(20240101);
  const reports: WasteReport[] = [];

  // Start date: 2026-01-01, spread 467 reports over ~200 days
  const startMs = new Date('2026-01-01T08:00:00+07:00').getTime();
  const endMs = new Date('2026-07-22T20:00:00+07:00').getTime();
  const spanMs = endMs - startMs;

  // 456 รายการที่ปิดแล้ว (completed/cancelled) — ไม่แสดงบนแผนที่
  for (let i = 0; i < 456; i++) {
    const wasteType = pickWeighted(WASTE_TYPES, WASTE_WEIGHT, rand);
    const status = CLOSED_STATUSES[Math.floor(rand() * CLOSED_STATUSES.length)];
    const note = NOTES[Math.floor(rand() * NOTES.length)];
    const lat = LAT_CENTER + (rand() - 0.5) * 0.12;
    const lng = LNG_CENTER + (rand() - 0.5) * 0.12;
    const createdAt = new Date(startMs + rand() * spanMs).toISOString();

    reports.push({
      id: `seed_${String(i + 1).padStart(4, '0')}`,
      userId: `user_${String(i + 1).padStart(4, '0')}`,
      wasteType,
      photoUrls: [],
      latitude: parseFloat(lat.toFixed(5)),
      longitude: parseFloat(lng.toFixed(5)),
      note,
      status,
      acceptedByShopId: status === 'completed' ? 'shop_001' : null,
      createdAt,
    });
  }

  // 11 รายการที่ยังค้างอยู่ — แสดงเป็นหมุดบนแผนที่ (รถ 5 คัน + ผู้เรียก 6 คน)
  const activeStatuses: ReportStatus[] = [
    'truck_dispatched', 'truck_dispatched', 'truck_dispatched', 'truck_dispatched', 'truck_dispatched',
    'pending', 'pending', 'accepted', 'pending', 'accepted', 'pending',
  ];
  const activeWasteTypes: WasteType[] = ['plastic', 'metal', 'paper', 'glass', 'electronic', 'organic', 'mixed', 'plastic', 'paper', 'metal', 'glass'];
  const activeNotes = [
    'รถกำลังออกเดินทาง', 'รถใกล้ถึงแล้ว', 'รถกำลังมา', 'รถออกจากร้านแล้ว', 'รถกำลังจัดการ',
    'รอรับที่บ้าน', 'รอร้านรับงาน', 'ร้านรับงานแล้ว', 'รอรับอยู่', 'นัดรับวันนี้', 'รอรับที่บ้าน',
  ];
  for (let i = 0; i < 11; i++) {
    const status = activeStatuses[i];
    const wasteType = activeWasteTypes[i];
    const lat = LAT_CENTER + (rand() - 0.5) * 0.08;
    const lng = LNG_CENTER + (rand() - 0.5) * 0.08;
    const createdAt = new Date(endMs - rand() * 3 * 24 * 60 * 60 * 1000).toISOString();

    reports.push({
      id: `seed_${String(457 + i).padStart(4, '0')}`,
      userId: `user_${String(457 + i).padStart(4, '0')}`,
      wasteType,
      photoUrls: [],
      latitude: parseFloat(lat.toFixed(5)),
      longitude: parseFloat(lng.toFixed(5)),
      note: activeNotes[i],
      status,
      acceptedByShopId: status !== 'pending' ? 'shop_001' : null,
      createdAt,
    });
  }

  // newest first
  return reports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
