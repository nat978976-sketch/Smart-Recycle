import type { WasteReport, WasteType } from '@/types';
import { getWasteReports, addWasteReport, updateWasteReport } from '@/lib/store/wasteReportsStore';

declare global {
  // eslint-disable-next-line no-var
  var __simState: { lastAdvanceMs: number; lastNewMs: number; counter: number } | undefined;
}

const STATUS_NEXT: Partial<Record<WasteReport['status'], WasteReport['status']>> = {
  pending:          'accepted',
  accepted:         'truck_dispatched',
  truck_dispatched: 'completed',
};

const WASTE_TYPES: WasteType[] = ['plastic', 'paper', 'metal', 'glass', 'electronic', 'organic', 'mixed'];
const NOTES = ['มีของเยอะมาก', 'ขวดพลาสติกหลายลัง', 'เศษเหล็กเก่า', 'กระดาษกล่องพัสดุ', undefined];
const LAT_CENTER = 16.4419;
const LNG_CENTER = 102.836;

// สถานะเปลี่ยนทุก 1 ชั่วโมง, order ใหม่ทุก 1 ชั่วโมง
const ADVANCE_INTERVAL_MS = 60 * 60 * 1000;
const NEW_REPORT_INTERVAL_MS = 60 * 60 * 1000;

function simState() {
  if (!global.__simState) {
    global.__simState = { lastAdvanceMs: Date.now(), lastNewMs: Date.now(), counter: 2000 };
  }
  return global.__simState;
}

export function runSimulation(): { newReport: boolean } {
  const state = simState();
  const now = Date.now();
  let newReport = false;

  // Advance สถานะ report ที่ active อยู่
  if (now - state.lastAdvanceMs >= ADVANCE_INTERVAL_MS) {
    const active = getWasteReports().filter(
      (r) => r.status === 'pending' || r.status === 'accepted' || r.status === 'truck_dispatched'
    );
    if (active.length > 0) {
      const target = active[Math.floor(Math.random() * active.length)];
      const next = STATUS_NEXT[target.status];
      if (next) updateWasteReport(target.id, { status: next });
    }
    state.lastAdvanceMs = now;
  }

  // เพิ่ม order ใหม่
  if (now - state.lastNewMs >= NEW_REPORT_INTERVAL_MS) {
    const wasteType = WASTE_TYPES[state.counter % WASTE_TYPES.length];
    const lat = LAT_CENTER + (Math.random() - 0.5) * 0.10;
    const lng = LNG_CENTER + (Math.random() - 0.5) * 0.10;

    addWasteReport({
      id: `sim_${state.counter}`,
      userId: `sim_user_${state.counter}`,
      wasteType,
      photoUrls: [],
      latitude: parseFloat(lat.toFixed(5)),
      longitude: parseFloat(lng.toFixed(5)),
      note: NOTES[state.counter % NOTES.length],
      status: 'pending',
      acceptedByShopId: null,
      createdAt: new Date().toISOString(),
    });

    state.counter++;
    state.lastNewMs = now;
    newReport = true;
  }

  return { newReport };
}
