const fs = require('fs');
const files = [
  'e:\\منصة الوتين\\app\\teacher-assistant\\live-components\\LiveWhiteboardTeacher.js',
  'e:\\منصة الوتين\\app\\teacher-assistant\\whiteboard\\WhiteboardComponent.js'
];

for (const file of files) {
  if(!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');

  // Generic Alerts
  content = content.replace(/alert\(['"]إيقاف مؤقت مؤقت\? إيقاف\? إيقاف\? مؤقتإيقاف إيقاف إيقاف\? مؤقتإيقاف\?\.['"]\);/g, "alert('حدث خطأ أثناء تحميل الملف.');");
  content = content.replace(/alert\(['"]إيقاف مؤقت إيقاف\? مؤقتإيقاف مؤقت\.['"]\);/g, "alert('الرجاء تحديد ملف صالح.');");
  content = content.replace(/alert\(['"]إيقاف\? مؤقتإيقاف\? 🔥 ناري!إيقاف\.['"]\);/g, "alert('لا يمكن إتمام العملية.');");
  content = content.replace(/alert\(['"]🔥 ناري! إيقاف مؤقت إيقاف🔥 ناري!\. مؤقت مؤقتإيقاف\? Google Chrome\.['"]\);/g, "alert('هذا المتصفح لا يدعم التعرف على الصوت. الرجاء استخدام Google Chrome.');");
  content = content.replace(/window\.alert\(['"]مؤقت مؤقتإيقاف إيقاف\? مؤقت['"]\);/g, "window.alert('تم حفظ الصورة بنجاح');");

  // General texts
  content = content.replace(/new fabric\.Textbox\('مؤقتإيقاف\.\.\.',/g, "new fabric.Textbox('اكتب نصاً...',");
  content = content.replace(/\{ name: 'مؤقتإيقاف\?', hex: '#ea580c' \}, \{ name: 'مؤقتإيقاف', hex: '#9333ea' \},/g, "{ name: 'برتقالي', hex: '#ea580c' }, { name: 'بنفسجي', hex: '#9333ea' },");
  content = content.replace(/<span>مؤقت مؤقتإيقاف مؤقت إيقاف\? PDF\.\.\.<\/span>/g, "<span>جاري تحميل PDF...</span>");
  content = content.replace(/إيقاف\? مؤقتإيقاف\? \(Flip\)/g, "قلب البطاقة (Flip)");
  
  content = content.replace(/<span className=\{styles\.tooltip\}>إيقاف مؤقتإيقاف\?<\/span>/g, "<span className={styles.tooltip}>المزيد</span>");
  content = content.replace(/<span role="img" aria-label="مؤقتإيقاف\?">إيقاف<\/span>/g, '<span role="img" aria-label="احتفال">🎉</span>');
  content = content.replace(/<span className=\{styles\.tooltip\}>إيقاف🔥 ناري!\? مؤقتإيقاف<\/span>/g, "<span className={styles.tooltip}>المزيد</span>");
  content = content.replace(/<span className=\{styles\.mobileHidden\}> مؤقتإيقاف\?<\/span>/g, '<span className={styles.mobileHidden}> إعدادات</span>');
  
  content = content.replace(/مؤقت \(مؤقتإيقاف\)/g, 'أفقي (عريض)');
  content = content.replace(/<option value="grid">مؤقتإيقاف<\/option>/g, '<option value="grid">شبكة</option>');
  content = content.replace(/مؤقت\/PDF مؤقتإيقاف/g, 'صورة/PDF');
  content = content.replace(/<h5>إيقاف مؤقتإيقاف\? مؤقت\?<\/h5>/g, '<h5>أدوات تفاعلية</h5>');
  content = content.replace(/إيقاف<span>مؤقتإيقاف<\/span>/g, '⚗️<span>دورق</span>');

  fs.writeFileSync(file, content, 'utf8');
}
console.log('Cleaned gibberish');
