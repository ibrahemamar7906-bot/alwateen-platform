import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST() {
  return NextResponse.json({ 
    error: 'تم إيقاف ميزة توليد الاختبارات بالذكاء الاصطناعي. يمكنك إضافة وتعديل الأسئلة يدوياً أو من بنك الأسئلة.' 
  }, { status: 403 });
}