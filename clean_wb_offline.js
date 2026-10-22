const fs = require('fs');
const file = 'e:\\منصة الوتين\\app\\teacher-assistant\\whiteboard\\WhiteboardComponent.js';
if (fs.existsSync(file)) {
  let content = fs.readFileSync(file, 'utf8');

  // We are going to replace specific known corruptions that I observed earlier in WhiteboardComponent
  content = content.replace(/مؤقت\? 3D \(إيقاف\?\)/g, 'نماذج 3D');
  content = content.replace(/إيقاف\? JSON/g, 'استيراد JSON');
  content = content.replace(/إيقاف\? إيقاف مؤقتإيقاف\?/g, 'استيراد PDF');
  content = content.replace(/مؤقت إيقاف\? \(إيقاف\?\)/g, 'تراجع');
  content = content.replace(/مؤقتإيقاف \(إيقاف\?\)/g, 'إعادة');
  content = content.replace(/مؤقتمؤقت \(إيقاف\?\)/g, 'مسح الكل');
  content = content.replace(/مؤقتإيقاف\?/g, 'مزيد من الأدوات');
  content = content.replace(/مؤقت مؤقت \(إيقاف\?\)/g, 'ملاحظة لاصقة');
  content = content.replace(/مؤقت\? إيقاف PDF \(إيقاف\?\)/g, 'استيراد PDF');
  content = content.replace(/مؤقتإيقاف مؤقت\?/g, 'مؤقت');
  content = content.replace(/إيقاف مؤقت\? مؤقت\?/g, 'أدوات هندسية');
  content = content.replace(/إيقاف إيقاف🔥 ناري!/g, 'أدوات متقدمة');
  content = content.replace(/إيقاف 🔥 ناري!/g, 'أدوات إضافية');
  content = content.replace(/\? \?🔥 ناري!\?/g, 'خلفيات');
  content = content.replace(/\? \?🔥 ناري!/g, 'مكتبة');
  content = content.replace(/إيقاف مؤقتإيقاف \(مؤقتإيقاف\? مؤقت\?\)/g, 'استيراد خريطة');
  content = content.replace(/🔥 ناري!\?/g, 'إعدادات');
  
  // Just in case there are single ? floating around
  content = content.replace(/>مؤقت\?<\/span>/g, '>مؤقت</span>');
  content = content.replace(/>إيقاف\?<\/span>/g, '>إعدادات</span>');

  fs.writeFileSync(file, content, 'utf8');
  console.log('Cleaned WhiteboardComponent');
}
