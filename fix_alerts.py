import os
import re

file_path = 'e:/ملفات المنصة/-/app/teacher-assistant/whiteboard/WhiteboardComponent.js'

with open(file_path, 'r', encoding='utf8') as f:
    content = f.read()

replacements = {
    r"alert\(' \?\?\? 럩!\.'\)": "alert('حدث خطأ أثناء الاستيراد.')",
    r"alert\('  럘  \.'\)": "alert('حدث خطأ.')",
    r"alert\('\? \? \? \? PDF\.   \?\?\? 럩!\.'\)": "alert('حدث خطأ أثناء تصدير PDF.')",
    r"alert\('\? \? '\)": "alert('حدث خطأ في الملف')",
    r"alert\(' \? \? PDF\?   \? \.'\)": "alert('مكتبة PDF غير متوفرة.')",
    r"window\.alert\('   뤟'\)": "window.alert('رابط يوتيوب غير صحيح')",
    r"alert\('  袠'\)": "alert('الآية غير موجودة')",
    r"alert\('\? \?  \? \?\.  ퟢ \.'\)": "alert('حدث خطأ أثناء جلب الآية. تأكد من اتصالك بالإنترنت.')",
    r"alert\(' \? 碝 \?     隧ퟢ \(Clipboard\)\.'\)": "alert('لم يتم العثور على صورة في الحافظة.')",
    r"alert\(' \?㧟\. 碚ퟢ  \?\/㧟  \?\?\? 럩! Ctrl\+V 碝\.'\)": "alert('حدث خطأ أثناء اللصق.')",
    r"alert\(' \? \?   隧ퟢ\.  \?\? 럩!\?\.'\)": "alert('حدث خطأ أثناء تسجيل الشاشة.')",
    r"alert\('ퟢ 맫   \? 袠\.'\)": "alert('هذه الميزة قيد التطوير.')"
}

for old, new in replacements.items():
    content = re.sub(old, new, content)

with open(file_path, 'w', encoding='utf8') as f:
    f.write(content)

print("Alerts fixed.")
