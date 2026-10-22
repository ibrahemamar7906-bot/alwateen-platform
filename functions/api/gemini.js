export async function onRequestPost() {
  return new Response(JSON.stringify({ 
    error: { message: 'تم إيقاف خدمات الذكاء الاصطناعي بناءً على إعدادات المنصة الحالية.' } 
  }), {
    status: 403,
    headers: { 'Content-Type': 'application/json' }
  });
}