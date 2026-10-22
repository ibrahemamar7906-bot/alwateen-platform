const fs = require('fs');
const teacher = fs.readFileSync('e:\\منصة الوتين\\app\\teacher-assistant\\live-components\\LiveWhiteboardTeacher.js', 'utf8');

let newTeacher = teacher;

newTeacher = newTeacher.replace(/alert\("إيقاف\?: " \+ e\.error\);/g, 'alert("خطأ: " + e.error);');
newTeacher = newTeacher.replace(/aria-label="إيقاف\?">إيقاف<\/span>/g, 'aria-label="انتصار">✌️</span>');
newTeacher = newTeacher.replace(/<span className=\{styles\.tooltip\}>إيقاف\? JSON<\/span><\/button>/g, '<span className={styles.tooltip}>تصدير JSON</span></button>');
newTeacher = newTeacher.replace(/<span className=\{styles\.tooltip\}>إيقاف\? JSON<\/span>/g, '<span className={styles.tooltip}>استيراد JSON</span>');
newTeacher = newTeacher.replace(/title="إيقاف\?"><Trash2 size=\{16\} \/><span className=\{styles\.mobileHidden\}> إيقاف\?<\/span>/g, 'title="حذف الكل"><Trash2 size={16} /><span className={styles.mobileHidden}> حذف الكل</span>');
newTeacher = newTeacher.replace(/title="إيقاف\?">\?<span>مسح الكل<\/span><\/button>/g, 'title="تعديل">⏳<span>ساعة رملية</span></button>'); // addRotatingHourglass

fs.writeFileSync('e:\\منصة الوتين\\app\\teacher-assistant\\live-components\\LiveWhiteboardTeacher.js', newTeacher, 'utf8');
console.log('Fixed remaining UI Text');
