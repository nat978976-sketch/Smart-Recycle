const KEY = 'kk_my_report_ids';

export function saveReportId(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const ids: string[] = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    if (!ids.includes(id)) localStorage.setItem(KEY, JSON.stringify([...ids, id]));
  } catch { /* ข้ามถ้า localStorage เข้าถึงไม่ได้ */ }
}

export function getReportIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]');
  } catch {
    return [];
  }
}
