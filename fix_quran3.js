const fs = require('fs');
const file = 'e:\\منصة الوتين\\app\\teacher-assistant\\whiteboard\\QuranOrderGameOverlay.js';
let content = fs.readFileSync(file, 'utf8');

const reciterReplacement = `const RECITERS = [
  { id: 'ar.abdulbasitmurattal', name: 'عبد الباسط عبد الصمد (مرتل)' },
  { id: 'ar.abdulsamad', name: 'عبد الباسط عبد الصمد (مجود)' },
  { id: 'ar.alafasy', name: 'مشاري راشد العفاسي' },
  { id: 'ar.husary', name: 'محمود خليل الحصري' },
  { id: 'ar.husarymujawwad', name: 'محمود خليل الحصري (مجود)' },
  { id: 'ar.minshawi', name: 'محمد صديق المنشاوي' },
  { id: 'ar.minshawimujawwad', name: 'محمد صديق المنشاوي (مجود)' },
  { id: 'ar.mahermuaiqly', name: 'ماهر المعيقلي' },
  { id: 'ar.abdurrahmaansudais', name: 'عبد الرحمن السديس' },
  { id: 'ar.saoodshuraym', name: 'سعود الشريم' },
  { id: 'ar.yasserdossari', name: 'ياسر الدوسري' },
  { id: 'ar.ahmedajamy', name: 'أحمد بن علي العجمي' },
  { id: 'ar.hudhaify', name: 'علي بن عبد الرحمن الحذيفي' },
  { id: 'ar.muhammadayyoub', name: 'محمد أيوب' },
  { id: 'ar.muhammadjibreel', name: 'محمد جبريل' },
  { id: 'ar.aymansowaid', name: 'أيمن سويد' },
  { id: 'ar.abdullahbasfar', name: 'عبد الله بصفر' }
];`;

content = content.replace(/const RECITERS = \[\s*\{ id: 'ar\.abdulbasitmurattal'[\s\S]*?\];/m, reciterReplacement);
content = content.replace(/ط·آ[^\n]+/g, ''); // just wipe out remaining broken comments

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed RECITERS');
