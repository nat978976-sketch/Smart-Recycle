export type WasteType =
  | 'plastic'
  | 'paper'
  | 'glass'
  | 'metal'
  | 'electronic'
  | 'organic'
  | 'mixed';

export const WASTE_TYPE_LABELS: Record<WasteType, string> = {
  plastic: 'พลาสติก',
  paper: 'กระดาษ',
  glass: 'แก้ว',
  metal: 'โลหะ/เศษเหล็ก',
  electronic: 'อิเล็กทรอนิกส์ (E-Waste)',
  organic: 'เศษอาหาร/อินทรีย์',
  mixed: 'ขยะคละ/ไม่แน่ใจ',
};

export type ReportStatus = 'pending' | 'accepted' | 'truck_dispatched' | 'completed' | 'cancelled';

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  pending: 'รอร้านรับงาน',
  accepted: 'ร้านรับงานแล้ว',
  truck_dispatched: 'เรียกรถแล้ว กำลังไปรับ',
  completed: 'เก็บเรียบร้อยแล้ว',
  cancelled: 'ยกเลิก',
};

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface WasteReport {
  id: string;
  userId: string;
  wasteType: WasteType;
  photoUrls: string[];
  latitude: number;
  longitude: number;
  note?: string;
  status: ReportStatus;
  acceptedByShopId?: string | null;
  createdAt: string;
}

export interface RecyclingShop {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  acceptedWasteTypes: WasteType[];
  isActive: boolean;
  phone?: string;
}

export interface WasteClassificationResult {
  wasteType: WasteType;
  confidence: number;
  rawLabel?: string;
}

export interface VisitorLog {
  id: string;
  path: string;
  userAgent: string | null;
  visitedAt: string;
}
