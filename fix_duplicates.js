const fs = require('fs');
const files = [
  'e:\\منصة الوتين\\app\\teacher-assistant\\live-components\\LiveWhiteboardTeacher.js',
  'e:\\منصة الوتين\\app\\teacher-assistant\\whiteboard\\WhiteboardComponent.js'
];
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/<span className=\{styles\.tooltip\}>قلم خط عربي<\/span><span className=\{styles\.tooltip\}>.*?<\/span>/g, '<span className={styles.tooltip}>قلم خط عربي</span>');
  content = content.replace(/<span className=\{styles\.tooltip\}>فرشاة بخاخ<\/span><span className=\{styles\.tooltip\}>.*?<\/span>/g, '<span className={styles.tooltip}>فرشاة بخاخ</span>');
  content = content.replace(/<span className=\{styles\.tooltip\}>مؤقتإيقاف إيقاف مؤقتإيقاف\?<\/span>/g, '<span className={styles.tooltip}>المزيد</span>');
  fs.writeFileSync(file, content, 'utf8');
}
console.log('Cleaned up tooltips');
