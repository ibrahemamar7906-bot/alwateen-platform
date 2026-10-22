const fs = require('fs');

const filePath = 'e:/ملفات المنصة/-/app/teacher-assistant/whiteboard/WhiteboardComponent.js';
let content = fs.readFileSync(filePath, 'utf8');

const replacements = [
    { old: /alert\(' \?\?\? 럩!\.'\)/g, new: "alert('حدث خطأ أثناء الاستيراد.')" },
    { old: /alert\('  럘  \.'\)/g, new: "alert('حدث خطأ.')" },
    { old: /alert\('\? \? \? \? PDF\.   \?\?\? 럩!\.'\)/g, new: "alert('حدث خطأ أثناء تصدير PDF.')" },
    { old: /alert\('\? \? '\)/g, new: "alert('حدث خطأ في الملف')" },
    { old: /alert\(' \? \? PDF\?   \? \.'\)/g, new: "alert('مكتبة PDF غير متوفرة.')" },
    { old: /window\.alert\('   뤟'\)/g, new: "window.alert('رابط يوتيوب غير صحيح')" },
    { old: /alert\('  袠'\)/g, new: "alert('الآية غير موجودة')" },
    { old: /alert\('\? \?  \? \?\.  ퟢ \.'\)/g, new: "alert('حدث خطأ أثناء جلب الآية. تأكد من اتصالك بالإنترنت.')" },
    { old: /alert\(' \? 碝 \?     隧ퟢ \(Clipboard\)\.'\)/g, new: "alert('لم يتم العثور على صورة في الحافظة.')" },
    { old: /alert\(' \?㧟\. 碚ퟢ  \?\/㧟  \?\?\? 럩! Ctrl\+V 碝\.'\)/g, new: "alert('حدث خطأ أثناء اللصق.')" },
    { old: /alert\(' \? \?   隧ퟢ\.  \?\? 럩!\?\.'\)/g, new: "alert('حدث خطأ أثناء تسجيل الشاشة.')" },
    { old: /alert\('ퟢ 맫   \? 袠\.'\)/g, new: "alert('هذه الميزة قيد التطوير.')" },
    { old: /alert\('쨟 ꢭ     \. 驤  Google Chrome\.'\)/g, new: "alert('هذه الميزة غير مدعومة في متصفحك. يرجى استخدام Google Chrome.')" },
    { old: /alert\(": " \+ e\.error\)/g, new: 'alert("خطأ: " + e.error)' }
];

for (const rep of replacements) {
    content = content.replace(rep.old, rep.new);
}

// Hardcode exact string replacement just in case regex fails for corrupted chars
content = content.replace("alert('ퟢ 맫   ? 袠.');", "alert('هذه الميزة قيد التطوير.');");

fs.writeFileSync(filePath, content, 'utf8');
console.log("Alerts fixed.");
