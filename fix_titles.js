const fs = require('fs');
const path = 'e:/منصة الوتين/app/kids-corner/pathway/prep2_data.js';

let content = fs.readFileSync(path, 'utf8');

const replacements = {
  "ص 103\\)": "اهتمام المصريين القدماء بالبيئة",
  "ص 160\\)": "خلاف كبير بين الفتاة وصديقتها",
  "ص 167\\)": "عبقرية الخوارزمي",
  "ص 181\\)": "تعدد مصادر المعرفة",
  "ص 195\\)": "بقدر الكد تكتسب المعالي",
  "كتابة مقال وصف مكان \\(ص 301\\)": "كتابة مقال وصف مكان",
  "كتابة خطبة إقناعية \\(ص 308\\)": "كتابة خطبة إقناعية"
};

for (const [oldT, newT] of Object.entries(replacements)) {
  const regexLessonTitle = new RegExp(`title: '${oldT}'`, 'g');
  const regexChallengeTitle = new RegExp(`title: 'تحدي: ${oldT}'`, 'g');
  const regexLessonDesc = new RegExp(`desc: 'تعرف على ${oldT}'`, 'g');
  
  content = content.replace(regexLessonTitle, `title: '${newT}'`);
  content = content.replace(regexChallengeTitle, `title: 'تحدي: ${newT}'`);
  content = content.replace(regexLessonDesc, `desc: 'تعرف على ${newT}'`);
}

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully fixed titles.');
