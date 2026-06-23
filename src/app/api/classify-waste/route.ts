import { NextResponse } from 'next/server';
import type { WasteClassificationResult, WasteType } from '@/types';

// TODO: เชื่อมต่อกับโมเดล Vision จริง เช่น GPT-4o Vision API หรือโมเดล custom ของทีม
// ตัวอย่างโครงสร้างเมื่อเชื่อมต่อ AI จริง:
//   const imageBuffer = Buffer.from(await photo.arrayBuffer());
//   const completion = await openai.chat.completions.create({
//     model: 'gpt-4o',
//     messages: [{
//       role: 'user',
//       content: [
//         { type: 'text', text: 'จำแนกประเภทขยะในรูปนี้ตามหมวด: plastic, paper, glass, metal, electronic, organic, mixed' },
//         { type: 'image_url', image_url: { url: `data:${photo.type};base64,${imageBuffer.toString('base64')}` } },
//       ],
//     }],
//   });
// ตอนนี้เป็น placeholder ที่สุ่มผลลัพธ์ เพื่อให้ frontend พัฒนาและทดสอบ flow ได้ก่อนมีโมเดลจริง
const PLACEHOLDER_TYPES: WasteType[] = ['plastic', 'paper', 'glass', 'metal', 'electronic', 'organic'];

export async function POST(request: Request) {
  const formData = await request.formData();
  const photo = formData.get('photo');

  if (!photo || !(photo instanceof Blob)) {
    return NextResponse.json({ error: 'ไม่พบไฟล์รูปภาพ' }, { status: 400 });
  }

  const result: WasteClassificationResult = {
    wasteType: PLACEHOLDER_TYPES[Math.floor(Math.random() * PLACEHOLDER_TYPES.length)],
    confidence: 0.6 + Math.random() * 0.35,
    rawLabel: 'placeholder-model-v0',
  };

  return NextResponse.json(result);
}
