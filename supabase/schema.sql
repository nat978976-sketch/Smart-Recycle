-- เปิดใช้งาน extension สำหรับข้อมูลภูมิสารสนเทศ (จำเป็นสำหรับคำนวณระยะทาง/ค้นหาร้านใกล้เคียง)
create extension if not exists postgis;

create type waste_type as enum (
  'plastic', 'paper', 'glass', 'metal', 'electronic', 'organic', 'mixed'
);

create type report_status as enum ('pending', 'accepted', 'truck_dispatched', 'completed', 'cancelled');

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role text not null default 'resident' check (role in ('resident', 'shop', 'driver', 'admin')),
  created_at timestamptz not null default now()
);

create table recycling_shops (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles (id),
  name text not null,
  location geography(point, 4326) not null,
  accepted_waste_types waste_type[] not null default '{}',
  phone text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table waste_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id),
  waste_type waste_type not null,
  photo_urls text[] not null default '{}',
  location geography(point, 4326) not null,
  note text,
  status report_status not null default 'pending',
  accepted_by_shop_id uuid references recycling_shops (id),
  created_at timestamptz not null default now()
);

-- ดัชนีเชิงพื้นที่ ทำให้ค้นหา "ร้าน/รายงานที่อยู่ใกล้ที่สุด" ได้รวดเร็ว
create index waste_reports_location_idx on waste_reports using gist (location);
create index recycling_shops_location_idx on recycling_shops using gist (location);

-- ตัวอย่าง: ค้นหาร้านรับซื้อของเก่าในระยะ 5 กม. จากจุดที่แจ้งขยะ เรียงจากใกล้สุด
-- select * from recycling_shops
-- where is_active and st_dwithin(location, st_makepoint(:lng, :lat)::geography, 5000)
-- order by location <-> st_makepoint(:lng, :lat)::geography;
