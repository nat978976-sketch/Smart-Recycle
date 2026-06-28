'use client';

import { useState, type FormEvent } from 'react';
import { WASTE_TYPE_LABELS } from '@/types';
import type { RecyclingShop, VisitorLog } from '@/types';

interface AdminOverview {
  shops: RecyclingShop[];
  visitors: VisitorLog[];
}

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [data, setData] = useState<AdminOverview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function fetchOverview(pwd: string) {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/overview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwd }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? 'เข้าสู่ระบบไม่สำเร็จ');
      }

      setData(await response.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เข้าสู่ระบบไม่สำเร็จ');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    fetchOverview(password);
  }

  async function handleRemoveShop(shop: RecyclingShop) {
    if (!window.confirm(`ลบร้าน "${shop.name}" ออกจากระบบ?`)) return;

    try {
      const response = await fetch(`/api/admin/shops/${shop.id}`, {
        method: 'DELETE',
        headers: { 'x-admin-password': password },
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? 'ลบร้านไม่สำเร็จ');
      }

      setData((prev) => (prev ? { ...prev, shops: prev.shops.filter((s) => s.id !== shop.id) } : prev));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'ลบร้านไม่สำเร็จ');
    }
  }

  if (!data) {
    return (
      <main className="mx-auto flex h-screen max-w-sm flex-col items-center justify-center p-5">
        <h1 className="mb-4 text-lg font-bold text-gray-900">🔒 จัดการเว็บไซต์</h1>
        <form onSubmit={handleSubmit} className="w-full">
          <input
            type="password"
            inputMode="numeric"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="รหัสผ่าน"
            autoFocus
            className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-center focus:border-emerald-500 focus:outline-none"
          />
          {error && <p className="mb-3 text-center text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={isLoading || password.length === 0}
            className="w-full rounded-lg bg-emerald-600 py-2 font-semibold text-white transition hover:bg-emerald-700 disabled:bg-gray-400"
          >
            {isLoading ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="mx-auto flex h-screen max-w-2xl flex-col">
      <header className="flex items-center justify-between p-4 pb-2">
        <h1 className="text-xl font-bold">⚙️ จัดการเว็บไซต์</h1>
        <button
          type="button"
          onClick={() => fetchOverview(password)}
          disabled={isLoading}
          className="rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-600 hover:bg-gray-50"
        >
          🔄 รีเฟรช
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        <section className="mb-6">
          <h2 className="mb-2 text-sm font-semibold text-gray-700">
            🏪 ร้านค้าที่สมัครแล้ว ({data.shops.length})
          </h2>
          <ul className="space-y-2">
            {data.shops.map((shop) => (
              <li key={shop.id} className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">{shop.name}</span>
                  <div className="flex items-center gap-2">
                    {shop.phone && <span className="text-xs text-gray-400">{shop.phone}</span>}
                    <button
                      type="button"
                      onClick={() => handleRemoveShop(shop)}
                      className="rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-100"
                    >
                      ลบร้าน
                    </button>
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  📍 {shop.latitude.toFixed(5)}, {shop.longitude.toFixed(5)}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  รับซื้อ: {shop.acceptedWasteTypes.map((type) => WASTE_TYPE_LABELS[type]).join(', ')}
                </p>
              </li>
            ))}
            {data.shops.length === 0 && <p className="text-gray-500">ยังไม่มีร้านสมัคร</p>}
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-sm font-semibold text-gray-700">
            👥 คนที่เข้าเว็บไซต์ ({data.visitors.length})
          </h2>
          <ul className="space-y-2">
            {data.visitors.map((visitor) => (
              <li key={visitor.id} className="rounded-xl border border-gray-200 bg-white p-3 text-sm shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">{visitor.path}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(visitor.visitedAt).toLocaleString('th-TH')}
                  </span>
                </div>
                {visitor.userAgent && <p className="mt-1 truncate text-xs text-gray-400">{visitor.userAgent}</p>}
              </li>
            ))}
            {data.visitors.length === 0 && <p className="text-gray-500">ยังไม่มีผู้เข้าชม</p>}
          </ul>
        </section>
      </div>
    </main>
  );
}
