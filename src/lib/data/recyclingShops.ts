import type { RecyclingShop } from '@/types';

// ข้อมูลร้านรับซื้อของเก่าจริงในเขตเทศบาลนครขอนแก่น
// นำเข้าจาก Google My Maps: https://www.google.com/maps/d/edit?mid=1Wh3th3laPUvYqG_2vjBoEjRtkLkBM8M
// หมายเหตุ: ข้อมูลต้นทาง (KML) มีแค่ชื่อ/พิกัด/เบอร์โทร ไม่มีหมวดประเภทขยะที่รับซื้อ
// จึงตั้งค่า acceptedWasteTypes เป็นค่าสมมติ (รับซื้อทั่วไปยกเว้นเศษอาหาร) ไปก่อน
// ควรให้ร้านยืนยัน/แก้ไขหมวดที่รับจริงผ่านหน้า shop-dashboard ในอนาคต
// เมื่อเชื่อมต่อ Supabase จริง ให้ดึงจากตาราง recycling_shops แทน (ดู supabase/schema.sql)
const DEFAULT_ACCEPTED_TYPES: RecyclingShop['acceptedWasteTypes'] = [
  'plastic',
  'paper',
  'glass',
  'metal',
  'electronic',
];

export const SEED_RECYCLING_SHOPS: RecyclingShop[] = [
  {
    id: 'shop-1',
    name: 'เจ้าพระยาค้าเศษ',
    latitude: 16.4137418,
    longitude: 102.8511445,
    phone: '065-156-5628',
    acceptedWasteTypes: DEFAULT_ACCEPTED_TYPES,
    isActive: true,
  },
  {
    id: 'shop-2',
    name: 'โชคเฮงเจริญ',
    latitude: 16.4192198,
    longitude: 102.8580524,
    phone: '081-717-7633',
    acceptedWasteTypes: DEFAULT_ACCEPTED_TYPES,
    isActive: true,
  },
  {
    id: 'shop-3',
    name: 'รุ่งเจริญ',
    latitude: 16.4433337,
    longitude: 102.8308334,
    phone: '080-457-7265',
    acceptedWasteTypes: DEFAULT_ACCEPTED_TYPES,
    isActive: true,
  },
  {
    id: 'shop-4',
    name: 'อาภรณ์ค้าของเก่า',
    latitude: 16.4168968,
    longitude: 102.8575949,
    phone: '081-954-5813',
    acceptedWasteTypes: DEFAULT_ACCEPTED_TYPES,
    isActive: true,
  },
  {
    id: 'shop-5',
    name: 'รัตนารับซื้อของเก่า',
    latitude: 16.4187161,
    longitude: 102.8453573,
    phone: '089-711-6922',
    acceptedWasteTypes: DEFAULT_ACCEPTED_TYPES,
    isActive: true,
  },
  {
    id: 'shop-6',
    name: 'ร้านทองใบรับซื้อของเก่า',
    latitude: 16.4494405,
    longitude: 102.825407,
    phone: '081-260-7180',
    acceptedWasteTypes: DEFAULT_ACCEPTED_TYPES,
    isActive: true,
  },
  {
    id: 'shop-7',
    name: 'โชคดีรับซื้อของเก่า',
    latitude: 16.4184138,
    longitude: 102.8302816,
    phone: '095-958-4745',
    acceptedWasteTypes: DEFAULT_ACCEPTED_TYPES,
    isActive: true,
  },
  {
    id: 'shop-8',
    name: 'โชคชัยรับซื้อของเก่า',
    latitude: 16.4183458,
    longitude: 102.8301971,
    phone: '062-019-1399',
    acceptedWasteTypes: DEFAULT_ACCEPTED_TYPES,
    isActive: true,
  },
];
