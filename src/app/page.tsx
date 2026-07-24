'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

/* ─── Animated counter ─── */
function StatCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      obs.disconnect();
      let start: number | null = null;
      const step = (ts: number) => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / 1600, 1);
        setCount(Math.floor((1 - Math.pow(1 - p, 3)) * value));
        if (p < 1) requestAnimationFrame(step);
        else setCount(value);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.4 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [value]);
  return <span ref={ref}>{count}{suffix}</span>;
}

/* ─── Mini app preview ─── */
function AppPreview() {
  const PINS = [
    { top: '22%', left: '14%' },
    { top: '32%', left: '62%' },
    { top: '58%', left: '38%' },
  ];
  return (
    <div className="mx-auto mb-8 w-full max-w-[280px]">
      <div className="relative">
        <div className="absolute -inset-3 rounded-3xl blur-2xl opacity-60" style={{ background: 'radial-gradient(circle, #6ee7b7, #0d9488)' }} />
        <div className="relative overflow-hidden rounded-2xl border border-white/35 shadow-2xl">
          {/* Map area */}
          <div className="relative h-36" style={{ background: 'linear-gradient(135deg, rgba(110,231,183,0.4), rgba(52,211,153,0.3), rgba(103,232,249,0.35))' }}>
            <div className="absolute inset-0 opacity-25" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.7) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.7) 1px,transparent 1px)', backgroundSize: '20px 20px' }} />
            <div className="absolute top-1/2 left-0 right-0 h-px bg-white/40" />
            <div className="absolute top-0 bottom-0 left-[38%] w-px bg-white/40" />
            {PINS.map((pin, i) => (
              <div key={i} className="absolute flex flex-col items-center" style={{ top: pin.top, left: pin.left }}>
                <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-emerald-400 to-teal-500 text-[9px] shadow-md">♻</div>
                <div className="h-1.5 w-px bg-emerald-600/70" />
              </div>
            ))}
            {/* User dot */}
            <div className="absolute" style={{ bottom: '22%', right: '18%' }}>
              <div className="relative flex items-center justify-center">
                <div className="absolute h-7 w-7 rounded-full bg-blue-400/30 animate-ping" />
                <div className="h-3.5 w-3.5 rounded-full border-2 border-white bg-blue-500 shadow" />
              </div>
            </div>
          </div>
          {/* Card */}
          <div className="bg-white px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-base shadow">♻️</div>
              <div className="flex-1">
                <div className="h-2.5 w-28 rounded-full bg-gray-200" />
                <div className="mt-1.5 h-2 w-16 rounded-full bg-gray-100" />
              </div>
              <div className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-1.5 text-xs font-bold text-white shadow">
                นำทาง →
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Data ─── */
const FEATURES = [
  { emoji: '📍', color: 'from-emerald-400 to-teal-500', title: 'แจ้งขายง่าย ไม่ต้องขนของเอง', desc: 'กำหนดจุดรับของบนแผนที่ ร้านรับซื้อจะส่งรถมาถึงบ้าน' },
  { emoji: '💹', color: 'from-blue-400 to-indigo-500', title: 'เปรียบเทียบราคาทุกร้าน', desc: 'ดูราคารับซื้อแบบเรียลไทม์ เลือกร้านที่ให้ราคาดีที่สุด' },
  { emoji: '♻️', color: 'from-teal-400 to-cyan-500', title: 'รับซื้อทุกประเภทขยะ', desc: 'พลาสติก กระดาษ โลหะ แก้ว อิเล็กทรอนิกส์ และอื่นๆ' },
  { emoji: '🤖', color: 'from-violet-400 to-purple-500', title: 'AI จำแนกขยะจากรูปถ่าย', desc: 'ถ่ายรูปขยะแล้วให้ AI ช่วยระบุประเภทให้อัตโนมัติ' },
];

const STATS = [
  { value: 467, suffix: '+', label: 'ผู้ใช้งาน', icon: '👥' },
  { value: 8, suffix: '', label: 'ร้านรับซื้อ', icon: '🏪' },
  { value: 7, suffix: '', label: 'ประเภทขยะ', icon: '♻️' },
];

const STEPS = [
  { icon: '📍', title: 'แจ้งขายบนแผนที่', desc: 'ระบุจุดรับของและประเภทขยะ' },
  { icon: '🚛', title: 'ร้านรับงานและส่งรถ', desc: 'รถของร้านออกเดินทางมารับ' },
  { icon: '💰', title: 'รับเงินทันที', desc: 'ได้รับเงินตามราคาที่ตกลงกัน' },
];

/* ─── Page ─── */
export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const heroStyle = { background: 'linear-gradient(160deg, #052e16 0%, #065f46 28%, #059669 62%, #2dd4bf 100%)' };
  const ctaStyle = { background: 'linear-gradient(160deg, #052e16 0%, #065f46 35%, #059669 70%, #14b8a6 100%)' };
  const t = (delay: string) => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? 'none' : 'translateY(20px)',
    transition: `opacity 0.6s ${delay}, transform 0.6s ${delay}`,
  });

  return (
    <main className="min-h-screen bg-white overflow-x-hidden">

      {/* ═══════════ HERO ═══════════ */}
      <section className="relative min-h-[100svh] flex items-center overflow-hidden text-white" style={heroStyle}>

        {/* Noise texture */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.045]" xmlns="http://www.w3.org/2000/svg">
          <filter id="n1"><feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="4" stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter>
          <rect width="100%" height="100%" filter="url(#n1)" />
        </svg>

        {/* Blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-32 -top-32 h-[36rem] w-[36rem] rounded-full opacity-20 blur-3xl animate-blob"
            style={{ background: 'radial-gradient(circle, #6ee7b7, #0d9488)' }} />
          <div className="absolute -left-24 top-1/3 h-96 w-96 rounded-full opacity-15 blur-3xl animate-blob animation-delay-3000"
            style={{ background: 'radial-gradient(circle, #a7f3d0, #10b981)' }} />
          <div className="absolute bottom-0 right-1/4 h-80 w-80 rounded-full opacity-15 blur-3xl animate-blob animation-delay-2000"
            style={{ background: 'radial-gradient(circle, #67e8f9, #0ea5e9)' }} />
        </div>

        {/* Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

        {/* Floating dots */}
        <div className="pointer-events-none absolute inset-0">
          {([
            { s: 'top-[15%] right-[8%]', sz: 'h-3 w-3', d: '' },
            { s: 'top-[38%] left-[6%]', sz: 'h-2 w-2', d: 'animation-delay-2000' },
            { s: 'bottom-[28%] right-[12%]', sz: 'h-4 w-4', d: 'animation-delay-1000' },
            { s: 'top-[58%] left-[4%]', sz: 'h-2 w-2', d: 'animation-delay-3000' },
            { s: 'top-[12%] left-[28%]', sz: 'h-1.5 w-1.5', d: 'animation-delay-500' },
            { s: 'bottom-[18%] left-[22%]', sz: 'h-2.5 w-2.5', d: 'animation-delay-2000' },
          ] as const).map((dot, i) => (
            <div key={i} className={`absolute ${dot.sz} ${dot.s} rounded-full bg-white/40 animate-float ${dot.d}`} />
          ))}
        </div>

        <div className="relative mx-auto w-full max-w-sm px-6 py-14 text-center">

          {/* Live badge */}
          <div style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.5s' }} className="mb-6 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-4 py-1.5 text-xs font-semibold backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" />
              แพลตฟอร์มรีไซเคิลอัจฉริยะ · ขอนแก่น
            </span>
          </div>

          {/* Logo */}
          <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'none' : 'translateY(-20px)', transition: 'opacity 0.6s 0.1s, transform 0.6s 0.1s' }}
            className="mb-6 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-3xl blur-2xl scale-125 opacity-50" style={{ background: 'radial-gradient(circle, #6ee7b7, #059669)' }} />
              <div className="relative flex h-28 w-28 items-center justify-center rounded-3xl text-6xl shadow-2xl border border-white/40 ring-1 ring-white/20 backdrop-blur-md"
                style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.25), rgba(255,255,255,0.08))' }}>
                ♻️
              </div>
            </div>
          </div>

          {/* Headline */}
          <div style={t('0.2s')}>
            <h1 className="mb-2 text-5xl font-black tracking-tight drop-shadow-2xl leading-[1.05]">
              Smart<br />Recycle
            </h1>
            <p className="mb-1 text-xl font-bold opacity-95">ขายของเก่า เรียกรถรับซื้อง่ายๆ</p>
            <p className="mb-7 text-sm leading-relaxed opacity-75">
              แพลตฟอร์มรีไซเคิลอัจฉริยะสำหรับคนขอนแก่น<br />
              แจ้งขายบนแผนที่ — ร้านส่งรถออกมารับถึงที่<br />
              ไม่ต้องขนของเอง ได้เงินทันที
            </p>
          </div>

          {/* App preview card */}
          <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'none' : 'scale(0.95)', transition: 'opacity 0.7s 0.35s, transform 0.7s 0.35s' }}>
            <AppPreview />
          </div>

          {/* CTA buttons */}
          <div style={t('0.5s')} className="flex flex-col gap-3.5">
            <Link href="/map"
              className="group relative overflow-hidden rounded-2xl bg-white py-[18px] text-base font-black text-emerald-900 shadow-[0_12px_40px_rgba(0,0,0,0.35)] transition-all hover:-translate-y-1 hover:shadow-[0_20px_55px_rgba(0,0,0,0.45)] active:scale-95">
              <span className="relative z-10 flex items-center justify-center gap-2">
                เริ่มใช้งานเลย
                <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 via-white to-teal-50 opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
            <Link href="/navigate"
              className="rounded-2xl border-2 border-white/35 py-[15px] text-base font-bold text-white shadow-lg backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white/22 hover:border-white/60 active:scale-95"
              style={{ background: 'rgba(255,255,255,0.13)' }}>
              🧭 นำทางหาร้านรับซื้อใกล้ฉัน
            </Link>
            <Link href="/shop-register"
              className="rounded-2xl border-2 border-white/25 py-[15px] text-base font-semibold text-white/85 transition-all hover:-translate-y-0.5 hover:bg-white/10 hover:border-white/45 hover:text-white active:scale-95">
              🏪 สมัครเป็นร้านรับซื้อ
            </Link>
          </div>

          {/* Trust chips */}
          <div style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.6s 0.75s' }} className="mt-8 flex justify-center gap-2">
            {['✅ ฟรี 100%', '🔒 ปลอดภัย', '⚡ เร็ว'].map((t) => (
              <span key={t} className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur-sm">
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Double wave */}
        <div className="absolute bottom-0 left-0 right-0 leading-none">
          <svg viewBox="0 0 1440 80" className="w-full" preserveAspectRatio="none">
            <path d="M0,42 C180,80 360,0 540,42 C720,80 900,10 1080,42 C1260,70 1360,22 1440,42 L1440,80 L0,80 Z" fill="white" opacity="0.35" />
            <path d="M0,56 C240,80 480,22 720,56 C960,80 1200,28 1440,56 L1440,80 L0,80 Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ═══════════ STATS ═══════════ */}
      <section className="bg-white px-6 py-14">
        <div className="mx-auto max-w-sm">
          <p className="mb-10 text-center text-xs font-black uppercase tracking-[0.25em] text-gray-400">— ตัวเลขที่น่าภาคภูมิใจ —</p>
          <div className="grid grid-cols-3 gap-3">
            {STATS.map((s) => (
              <div key={s.label} className="rounded-2xl border border-gray-100 bg-gradient-to-b from-gray-50 to-white p-4 text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-2 text-2xl">{s.icon}</div>
                <p className="bg-gradient-to-br from-emerald-600 to-teal-500 bg-clip-text text-3xl font-black text-transparent">
                  <StatCounter value={s.value} suffix={s.suffix} />
                </p>
                <p className="mt-1 text-[10px] font-black uppercase tracking-wider text-gray-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURES ═══════════ */}
      <section className="px-6 py-14" style={{ background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)' }}>
        <div className="mx-auto max-w-sm">
          <p className="mb-1 text-center text-xs font-black uppercase tracking-[0.2em] text-emerald-600">Features</p>
          <h2 className="mb-8 text-center text-2xl font-black text-gray-900">ทำอะไรได้บ้าง?</h2>
          <div className="space-y-4">
            {FEATURES.map((f) => (
              <div key={f.title}
                className="group relative flex items-start gap-4 overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:border-gray-200">
                <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-gradient-to-b ${f.color}`} />
                <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${f.color} text-2xl shadow-md ring-4 ring-white`}>
                  {f.emoji}
                </div>
                <div className="pt-1">
                  <p className="font-bold text-gray-900 leading-tight">{f.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-gray-500">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section className="bg-white px-6 py-14">
        <div className="mx-auto max-w-sm">
          <p className="mb-1 text-center text-xs font-black uppercase tracking-[0.2em] text-emerald-600">How it works</p>
          <h2 className="mb-10 text-center text-2xl font-black text-gray-900">ใช้งานง่าย 3 ขั้นตอน</h2>
          <div className="relative">
            <div className="absolute left-7 top-7 h-[calc(100%-4rem)] w-0.5 bg-gradient-to-b from-emerald-400 via-teal-400 to-cyan-300" />
            <div className="space-y-6">
              {STEPS.map((item, i) => (
                <div key={item.title} className="relative flex items-start gap-4">
                  <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-2xl shadow-lg ring-4 ring-white">
                    {item.icon}
                    <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-black text-emerald-600 shadow-md ring-1 ring-emerald-100">
                      {i + 1}
                    </span>
                  </div>
                  <div className="ml-1 flex-1 rounded-2xl border border-gray-100 bg-gray-50 p-4 shadow-sm transition-transform hover:-translate-y-0.5">
                    <p className="font-bold text-gray-900">{item.title}</p>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ REVIEW SNIPPET ═══════════ */}
      <section className="px-6 py-12" style={{ background: 'linear-gradient(135deg, #ecfdf5, #f0fdf4, #e6fffa)' }}>
        <div className="mx-auto max-w-sm">
          <p className="mb-6 text-center text-xs font-black uppercase tracking-[0.2em] text-emerald-700">เสียงจากผู้ใช้จริง</p>
          <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-md">
            <div className="mb-3 flex gap-0.5 text-xl text-amber-400">{'★★★★★'}</div>
            <p className="text-sm leading-relaxed text-gray-700 italic">
              "ใช้ง่ายมากเลยครับ กดแจ้งขายปุ๊บ ร้านรับงานแป๊บเดียว รถมาถึงบ้านไม่เกินชั่วโมง ประทับใจมากกว่าที่คิดไว้เลย"
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-base font-black text-white shadow">
                ก
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">กิตติพงษ์ ว.</p>
                <p className="text-xs text-gray-400">ผู้ใช้งาน · ขอนแก่น</p>
              </div>
              <div className="ml-auto rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                ✓ รีวิวจริง
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ CTA FOOTER ═══════════ */}
      <section className="relative overflow-hidden px-6 py-16 text-center text-white" style={ctaStyle}>
        <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <filter id="n2"><feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="4" stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter>
          <rect width="100%" height="100%" filter="url(#n2)" />
        </svg>
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-20 blur-2xl" style={{ background: 'radial-gradient(circle, #6ee7b7, #0d9488)' }} />
          <div className="absolute -left-20 bottom-0 h-56 w-56 rounded-full opacity-20 blur-2xl" style={{ background: 'radial-gradient(circle, #a7f3d0, #10b981)' }} />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:28px_28px]" />
        </div>
        <div className="relative">
          <div className="mb-5 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/30 text-3xl shadow-2xl backdrop-blur"
              style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.25), rgba(255,255,255,0.08))' }}>
              🌿
            </div>
          </div>
          <p className="mb-2 text-3xl font-black tracking-tight">พร้อมแล้วหรือยัง?</p>
          <p className="mb-8 text-sm opacity-75">ไม่ต้องสมัครสมาชิก เปิดแผนที่แล้วแจ้งขายได้เลย</p>
          <Link href="/map"
            className="group inline-flex items-center gap-2 rounded-2xl bg-white px-10 py-4 text-base font-black text-emerald-900 shadow-[0_12px_40px_rgba(0,0,0,0.35)] transition-all hover:-translate-y-1 hover:shadow-[0_20px_55px_rgba(0,0,0,0.45)] active:scale-95">
            เปิดแผนที่
            <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
          </Link>
          <p className="mt-7 text-xs opacity-40">Smart Recycle · เทศบาลนครขอนแก่น</p>
        </div>
      </section>

    </main>
  );
}
