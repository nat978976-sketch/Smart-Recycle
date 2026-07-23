'use client';

import { useState } from 'react';
import { REPORT_STATUS_LABELS, WASTE_TYPE_LABELS } from '@/types';
import type { WasteReport } from '@/types';

const STATUS_COLOR: Record<WasteReport['status'], string> = {
  pending:          'bg-yellow-100 text-yellow-700',
  accepted:         'bg-blue-100 text-blue-700',
  truck_dispatched: 'bg-purple-100 text-purple-700',
  completed:        'bg-emerald-100 text-emerald-700',
  cancelled:        'bg-gray-100 text-gray-500',
};

const WASTE_EMOJI: Record<string, string> = {
  plastic: '🧴', paper: '📄', glass: '🍶', metal: '🔩',
  electronic: '💻', organic: '🥬', mixed: '🗑️',
};

interface Props {
  reports: WasteReport[];
  historyIds: string[];
  onClose: () => void;
}

export default function ReportHistoryPanel({ reports, historyIds, onClose }: Props) {
  const [tab, setTab] = useState<'all' | 'mine'>('all');

  const sorted = [...reports].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const myReports = sorted.filter((r) => historyIds.includes(r.id));
  const displayed = tab === 'mine' ? myReports : sorted;

  return (
    <div className="fixed inset-0 z-[2000] flex items-end justify-center bg-black/40"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-md rounded-t-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-gray-900">📋 ประวัติการแจ้งขาย</h2>
            <p className="text-xs text-gray-400 mt-0.5">ผู้ใช้งานทั้งหมด {reports.length} รายการ</p>
          </div>
          <button type="button" onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100">✕</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-4">
          <button
            type="button"
            onClick={() => setTab('all')}
            className={`flex-1 py-2.5 text-sm font-semibold transition border-b-2 ${
              tab === 'all' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            ทั้งระบบ ({reports.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('mine')}
            className={`flex-1 py-2.5 text-sm font-semibold transition border-b-2 ${
              tab === 'mine' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            ของฉัน ({myReports.length})
          </button>
        </div>

        {/* List */}
        <div className="max-h-[55vh] overflow-y-auto px-4 py-3">
          {displayed.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-4xl">📭</p>
              <p className="mt-2 text-sm text-gray-500">ยังไม่มีประวัติการแจ้งขายจากอุปกรณ์นี้</p>
            </div>
          ) : (
            <ul className="space-y-2.5">
              {displayed.map((r) => {
                const isMine = historyIds.includes(r.id);
                return (
                  <li key={r.id}
                    className={`rounded-xl border p-3 shadow-sm ${
                      isMine ? 'border-emerald-200 bg-emerald-50' : 'border-gray-100 bg-white'
                    }`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{WASTE_EMOJI[r.wasteType] ?? '♻️'}</span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-semibold text-gray-800">
                              {WASTE_TYPE_LABELS[r.wasteType]}
                            </p>
                            {isMine && (
                              <span className="rounded-full bg-emerald-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                                ของฉัน
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400">
                            {new Date(r.createdAt).toLocaleString('th-TH', {
                              dateStyle: 'short', timeStyle: 'short',
                            })}
                          </p>
                        </div>
                      </div>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[r.status]}`}>
                        {REPORT_STATUS_LABELS[r.status]}
                      </span>
                    </div>
                    {r.note && (
                      <p className="mt-1.5 text-xs text-gray-500 line-clamp-1">💬 {r.note}</p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="px-4 pb-5 pt-2">
          <button type="button" onClick={onClose}
            className="w-full rounded-full border border-gray-200 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50">
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}
