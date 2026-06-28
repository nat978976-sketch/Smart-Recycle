'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// แอบบันทึกการเข้าชมแต่ละหน้า (ยกเว้นหน้า admin เอง) ไว้ดูในหน้าจัดการเว็บไซต์
export default function VisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.startsWith('/admin')) return;

    fetch('/api/visitors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: pathname }),
    }).catch(() => {});
  }, [pathname]);

  return null;
}
