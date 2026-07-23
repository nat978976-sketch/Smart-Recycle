'use client';

import { WASTE_TYPE_LABELS } from '@/types';
import type { WasteReport, WasteType } from '@/types';

const WASTE_EMOJI: Record<WasteType, string> = {
  plastic: '🧴', paper: '📄', glass: '🍶', metal: '🔩',
  electronic: '💻', organic: '🥬', mixed: '🗑️',
};

interface Props {
  reports: WasteReport[];
  historyIds: string[];
  onClose: () => void;
}

function buildStats(list: WasteReport[]) {
  const completed = list.filter((r) => r.status === 'completed').length;
  const byType = list.reduce<Partial<Record<WasteType, number>>>((acc, r) => {
    acc[r.wasteType] = (acc[r.wasteType] ?? 0) + 1;
    return acc;
  }, {});
  const topType = (Object.entries(byType) as [WasteType, number][]).sort((a, b) => b[1] - a[1])[0];
  const maxCount = Math.max(...Object.values(byType), 1);
  return { completed, byType, topType, maxCount };
}

function StatsList({ list, emptyMsg }: { list: WasteReport[]; emptyMsg: string }) {
  if (list.length === 0) {
    return (
      <div className="py-10 text-center">
        <p className="text-4xl">🌱</p>
        <p className="mt-2 text-sm text-gray-500">{emptyMsg}</p>
      </div>
    );
  }
  const { completed, byType, topType, maxCount } = buildStats(list);
  return (
    <>
      <div className="mb-5 grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-emerald-50 p-3 text-center">
          <p className="text-2xl font-bold text-emerald-700">{list.length}</p>
          <p className="mt-0.5 text-xs text-emerald-600">ครั้งทั้งหมด</p>
        </div>
        <div className="rounded-xl bg-blue-50 p-3 text-center">
          <p className="text-2xl font-bold text-blue-700">{completed}</p>
          <p className="mt-0.5 text-xs text-blue-600">เสร็จสมบูรณ์</p>
        </div>
        <div className="rounded-xl bg-amber-50 p-3 text-center">
          <p className="text-2xl font-bold text-amber-700">
            {Math.round((completed / list.length) * 100)}%
          </p>
          <p className="mt-0.5 text-xs text-amber-600">สำเร็จ</p>
        </div>
      </div>

      {topType && (
        <div className="mb-4 rounded-xl bg-gray-50 px-4 py-3">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">แจ้งบ่อยที่สุด</p>
          <p className="text-base font-bold text-gray-800">
            {WASTE_EMOJI[topType[0]]} {WASTE_TYPE_LABELS[topType[0]]}
            <span className="ml-2 text-sm font-normal text-gray-500">{topType[1]} ครั้ง</span>
          </p>
        </div>
      )}

      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">แยกตามประเภทขยะ</p>
      <ul className="space-y-2">
        {(Object.entries(byType) as [WasteType, number][])
          .sort((a, b) => b[1] - a[1])
          .map(([type, count]) => (
            <li key={type} className="flex items-center gap-3">
              <span className="w-5 text-center text-base">{WASTE_EMOJI[type]}</span>
              <span className="w-24 shrink-0 text-xs text-gray-600">{WASTE_TYPE_LABELS[type]}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${(count / maxCount) * 100}%` }}
                />
              </div>
              <span className="w-8 text-right text-xs font-semibold text-gray-700">{count}</span>
            </li>
          ))}
      </ul>
    </>
  );
}

export default function StatsPanel({ reports, onClose }: Omit<Props, 'historyIds'>) {
  return (
    <div className="fixed inset-0 z-[2000] flex items-end justify-center bg-black/40"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-md rounded-t-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-gray-900">📊 สถิติการรีไซเคิล</h2>
            <p className="text-xs text-gray-400 mt-0.5">ข้อมูลรวมทั้งระบบ {reports.length} รายการ</p>
          </div>
          <button type="button" onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100">✕</button>
        </div>

        <div className="max-h-[65vh] overflow-y-auto px-5 py-4">
          <StatsList list={reports} emptyMsg="ยังไม่มีข้อมูลในระบบ" />
        </div>

        <div className="px-4 pb-5 pt-1">
          <button type="button" onClick={onClose}
            className="w-full rounded-full border border-gray-200 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50">
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}
