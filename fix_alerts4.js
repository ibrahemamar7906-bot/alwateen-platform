const fs = require('fs');
let content = fs.readFileSync('e:/ملفات المنصة/-/app/teacher-assistant/live-components/LiveWhiteboardTeacher.js', 'utf8');

const replacements = [
    { old: "alert('مؤقت ?🔥 ناري!إيقاف.')", new: "alert('حدث خطأ. يرجى المحاولة مرة أخرى.')" },
    { old: "alert('حدث خطأ أثناء تحميل الملف.')", new: "alert('حدث خطأ أثناء التكبير/التصغير.')" },
    { old: "alert('إيقاف? إيقاف? مؤقت? مؤقت? PDF. مؤقت إيقاف إيقاف?🔥 ناري!.')", new: "alert('حدث خطأ أثناء تصدير PDF. حاول مرة أخرى.')" },
    { old: "alert('إيقاف? إيقاف? مؤقت')", new: "alert('حدث خطأ أثناء العملية.')" },
    { old: "alert('مؤقت مؤقت? مؤقت? PDF? مؤقت مؤقتمؤقت إيقاف? مؤقت.')", new: "alert('مكتبة PDF غير متوفرة.')" },
    { old: "alert('أدوات هندسية مؤقت مؤقت مؤقت? إيقافمكتبة.')", new: "alert('هذه الميزة قيد التطوير.')" },
    { old: "window.alert('تم حفظ الصورة بنجاح')", new: "window.alert('رابط يوتيوب غير صحيح.')" },
    { old: "alert('مؤقت إيقاف إيقافمكتبة')", new: "alert('الآية غير موجودة.')" },
    { old: "alert('إيقاف? إيقاف? إيقاف إيقاف? مؤقت?. مؤقت أدوات إضافيةإيقاف.')", new: "alert('حدث خطأ أثناء جلب الآية. تأكد من اتصالك بالإنترنت.')" },
    { old: "alert('إيقاف إيقاف? مؤقتإيقاف إيقاف? مؤقت إيقاف مزيد من الأدوات (Clipboard).')", new: "alert('لم يتم العثور على صورة في الحافظة.')" },
    { old: "alert('مؤقت ?إعدادات. مؤقتأدوات إضافية مؤقت?/إعدادات إيقاف ?🔥 ناري! Ctrl+V مؤقتإيقاف.')", new: "alert('حدث خطأ أثناء اللصق.')" },
    { old: "alert('إيقاف إيقاف? إيقاف? مزيد من الأدوات. مؤقت 🔥 ناري!إيقاف?.')", new: "alert('حدث خطأ أثناء تسجيل الشاشة.')" }
];

for (const rep of replacements) {
    content = content.replace(rep.old, rep.new);
}

fs.writeFileSync('e:/ملفات المنصة/-/app/teacher-assistant/live-components/LiveWhiteboardTeacher.js', content, 'utf8');
console.log("LiveWhiteboardTeacher alerts fixed!");
