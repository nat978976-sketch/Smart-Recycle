import { createClient } from '@supabase/supabase-js';

// หมายเหตุ: ตอนนี้ backend หลักของ demo นี้ยังเป็น in-memory store (ดู src/lib/store/wasteReportsStore.ts)
// ไฟล์นี้เตรียมไว้สำหรับขั้นตอนต่อไปคือย้าย waste_reports / recycling_shops ไปอยู่บน Supabase จริง
// (ดูสคีมาที่ supabase/schema.sql) โดยต้องตั้งค่า NEXT_PUBLIC_SUPABASE_URL และ NEXT_PUBLIC_SUPABASE_ANON_KEY ใน .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
