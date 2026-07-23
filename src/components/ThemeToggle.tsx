'use client';

import { useEffect, useState } from 'react';

export default function ThemeToggle({ className }: { className?: string }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'));
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    try { localStorage.setItem('kk_theme', next ? 'dark' : 'light'); } catch { /* ข้ามถ้า localStorage ใช้ไม่ได้ */ }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="เปลี่ยนธีม"
      className={className}
    >
      {dark ? '☀️' : '🌙'}
    </button>
  );
}
