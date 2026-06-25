// ใช้ localStorage จำว่าเบราว์เซอร์นี้เป็นของร้านไหน (ยังไม่มีระบบ login จริง)
// เมื่อมี Supabase Auth ในอนาคต ให้แทนที่ด้วย session ของผู้ใช้ที่ login
export const SHOP_ID_STORAGE_KEY = 'kkw_shop_id';

export function getStoredShopId(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(SHOP_ID_STORAGE_KEY);
}

export function storeShopId(shopId: string): void {
  window.localStorage.setItem(SHOP_ID_STORAGE_KEY, shopId);
}
