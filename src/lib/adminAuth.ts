// รหัสผ่านสำหรับหน้าจัดการเว็บไซต์ ใช้ตรวจสอบฝั่งเซิร์ฟเวอร์เท่านั้น (ใน API routes)
// ไฟล์นี้ไม่ถูก import จาก client component ใดๆ จึงไม่ถูกส่งไปอยู่ใน client bundle
const ADMIN_PASSWORD = '100954';

export function isValidAdminPassword(password: unknown): boolean {
  return password === ADMIN_PASSWORD;
}
