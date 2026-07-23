'use client';

import Link from 'next/link';

const FEATURES = [
  { emoji: '📍', title: 'แจ้งขายง่าย ไม่ต้องขนของเอง', desc: 'กำหนดจุดรับของบนแผนที่ ร้านรับซื้อจะส่งรถมาถึงบ้าน' },
  { emoji: '💹', title: 'เปรียบเทียบราคาทุกร้าน', desc: 'ดูราคารับซื้อแบบเรียลไทม์ เลือกร้านที่ให้ราคาดีที่สุด' },
  { emoji: '♻️', title: 'รับซื้อทุกประเภทขยะ', desc: 'พลาสติก กระดาษ โลหะ แก้ว อิเล็กทรอนิกส์ และอื่นๆ' },
  { emoji: '🤖', title: 'AI จำแนกขยะจากรูปถ่าย', desc: 'ถ่ายรูปขยะแล้วให้ AI ช่วยระบุประเภทให้อัตโนมัติ' },
];

const STATS = [
  { value: '467+', label: 'ผู้ใช้งาน' },
  { value: '8', label: 'ร้านรับซื้อ' },
  { value: '7', label: 'ประเภทขยะ' },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-400 px-6 pb-24 pt-16 text-white">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10" />
        <div className="absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-white/10" />

        <div className="relative mx-auto max-w-sm text-center">
          <div className="mb-5 inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-white/20 text-5xl shadow-lg backdrop-blur">
            ♻️
          </div>
          <h1 className="mb-2 text-3xl font-extrabold tracking-tight">Smart Recycle</h1>
          <p className="mb-3 text-lg font-medium opacity-90">ขายของเก่า เรียกรถรับซื้อง่ายๆ</p>
          <p className="mb-4 text-sm leading-relaxed opacity-80">
            แพลตฟอร์มรีไซเคิลอัจฉริยะสำหรับคนขอนแก่น<br />
            แจ้งขายบนแผนที่ ร้านรับซื้อส่งรถออกมารับ<br />
            ไม่ต้องขนของเอง ได้เงินทันที
          </p>
          <div className="mb-8 inline-flex flex-col gap-1.5 rounded-2xl bg-white/15 px-5 py-3 text-left backdrop-blur-sm">
            <div className="flex items-center gap-2 text-sm"><span>🧭</span><span>นำทางไปร้านรับซื้อใกล้คุณได้เลย</span></div>
            <div className="flex items-center gap-2 text-sm"><span>🚛</span><span>เรียกรถรับซื้อ ไม่ต้องขนของเอง</span></div>
            <div className="flex items-center gap-2 text-sm"><span>🤖</span><span>AI จำแนกประเภทขยะจากรูปถ่ายอัตโนมัติ</span></div>
          </div>

          <div className="flex flex-col gap-4">
            <Link href="/map" className="rounded-full bg-white px-8 py-4 text-base font-bold text-emerald-700 shadow-lg transition hover:bg-emerald-50 active:scale-95">
              เริ่มใช้งานเลย →
            </Link>
            <Link href="/navigate" className="rounded-full bg-white/20 px-8 py-3.5 text-base font-semibold text-white shadow-md backdrop-blur-sm transition hover:bg-white/30 active:scale-95">
              🧭 นำทางหาร้านรับซื้อใกล้ฉัน
            </Link>
            <Link href="/shop-register" className="rounded-full border-2 border-white/60 px-8 py-3.5 text-base font-semibold text-white transition hover:bg-white/10 active:scale-95">
              🏪 สมัครเป็นร้านรับซื้อ
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-emerald-50 px-6 py-6 dark:bg-emerald-950/40">
        <div className="mx-auto flex max-w-sm justify-around">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400">{s.value}</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-10">
        <h2 className="mb-6 text-center text-lg font-bold text-gray-900 dark:text-white">ทำอะไรได้บ้าง?</h2>
        <div className="mx-auto max-w-sm space-y-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-2xl dark:bg-emerald-900/40">
                {f.emoji}
              </div>
              <div>
                <p className="font-semibold text-gray-800 dark:text-gray-100">{f.title}</p>
                <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 px-6 py-10 dark:bg-gray-900">
        <h2 className="mb-6 text-center text-lg font-bold text-gray-900 dark:text-white">ใช้งานง่าย 3 ขั้นตอน</h2>
        <div className="mx-auto max-w-sm space-y-3">
          {[
            { step: '1', title: 'แจ้งขายบนแผนที่', desc: 'ระบุจุดรับของและประเภทขยะ' },
            { step: '2', title: 'ร้านรับงานและส่งรถ', desc: 'รถของร้านออกเดินทางมารับ' },
            { step: '3', title: 'รับเงินทันที', desc: 'ได้รับเงินตามราคาที่ตกลงกัน' },
          ].map((item) => (
            <div key={item.step} className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm dark:bg-gray-800">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-base font-bold text-white">
                {item.step}
              </div>
              <div>
                <p className="font-semibold text-gray-800 dark:text-gray-100">{item.title}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Footer */}
      <section className="px-6 py-10 text-center">
        <p className="mb-2 text-lg font-bold text-gray-900 dark:text-white">พร้อมเริ่มรีไซเคิลแล้วหรือยัง?</p>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">ไม่ต้องสมัครสมาชิก เปิดแผนที่แล้วแจ้งขายได้เลย</p>
        <Link href="/map" className="inline-block rounded-full bg-emerald-600 px-10 py-3.5 text-base font-bold text-white shadow-lg transition hover:bg-emerald-700 active:scale-95">
          เปิดแผนที่ →
        </Link>
      </section>
    </main>
  );
}
