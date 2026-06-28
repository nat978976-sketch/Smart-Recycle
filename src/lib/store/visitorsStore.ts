import type { VisitorLog } from '@/types';

declare global {
  // eslint-disable-next-line no-var
  var __visitorsStore: VisitorLog[] | undefined;
}

const MAX_VISITORS = 500;

// เก็บใน memory ของ process ฝั่งเซิร์ฟเวอร์เท่านั้น ใช้สำหรับ demo/dev เหมือนสโตร์อื่นๆ ในโปรเจกต์นี้
export function getVisitors(): VisitorLog[] {
  if (!global.__visitorsStore) {
    global.__visitorsStore = [];
  }
  return global.__visitorsStore;
}

export function addVisitor(visit: VisitorLog): void {
  const visitors = getVisitors();
  visitors.unshift(visit);
  visitors.length = Math.min(visitors.length, MAX_VISITORS);
}
