import { SEED_RECYCLING_SHOPS } from '@/lib/data/recyclingShops';
import type { RecyclingShop } from '@/types';

declare global {
  // eslint-disable-next-line no-var
  var __recyclingShopsStore: RecyclingShop[] | undefined;
}

// เก็บข้อมูลใน memory ของ process ฝั่งเซิร์ฟเวอร์เท่านั้น ใช้สำหรับ demo/dev
// เริ่มต้นด้วยร้านตัวอย่างจาก SEED_RECYCLING_SHOPS แล้วร้านที่ลงทะเบียนใหม่จะถูกเติมเข้ามาเรื่อยๆ
export function getRecyclingShops(): RecyclingShop[] {
  if (!global.__recyclingShopsStore) {
    global.__recyclingShopsStore = [...SEED_RECYCLING_SHOPS];
  }
  return global.__recyclingShopsStore;
}

export function addRecyclingShop(shop: RecyclingShop): void {
  getRecyclingShops().push(shop);
}
