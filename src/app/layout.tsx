import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Khon Kaen Waste Management Ecosystem',
  description: 'เชื่อมต่อประชาชน ร้านรับซื้อของเก่า และรถเก็บขยะ ในเขตเทศบาลนครขอนแก่น',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body className="h-screen overflow-hidden bg-gray-100 text-gray-900">{children}</body>
    </html>
  );
}
