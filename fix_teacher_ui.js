const fs = require('fs');
const teacher = fs.readFileSync('e:\\منصة الوتين\\app\\teacher-assistant\\live-components\\LiveWhiteboardTeacher.js', 'utf8');

let newTeacher = teacher;

// Manual mapping of known corruptions based on context and WhiteboardComponent matches:
newTeacher = newTeacher.replace(/backText: options\.backText \|\| '🔥 ناري!\?',/g, "backText: options.backText || 'إجابة البطاقة',");
newTeacher = newTeacher.replace(/window\.prompt\('مؤقت\? مؤقت:',/g, "window.prompt('تعديل النص:',");
newTeacher = newTeacher.replace(/alert\('إيقاف\? إيقاف\? مؤقت'\);/g, "alert('الرجاء إدخال نص صحيح');");
newTeacher = newTeacher.replace(/alert\('مؤقت مؤقتمؤقت مؤقت مؤقت\? مؤقت\? PDF\.'\);/g, "alert('حدث خطأ أثناء تحميل ملف PDF.');");
newTeacher = newTeacher.replace(/alert\('إيقاف\? إيقاف\? مؤقت\? مؤقت\? إيقاف\? PDF'\);/g, "alert('حدث خطأ أثناء قراءة ملف PDF');");
newTeacher = newTeacher.replace(/new fabric\.IText\('مؤقت 🔥 ناري!\?',/g, "new fabric.IText('اكتب نصك هنا',");
newTeacher = newTeacher.replace(/parts\[0\] \? parts\[0\]\.trim\(\) : 'مؤقت';/g, "parts[0] ? parts[0].trim() : 'السؤال';");
newTeacher = newTeacher.replace(/parts\[1\] \? parts\[1\]\.trim\(\) : 'مؤقت\?';/g, "parts[1] ? parts[1].trim() : 'الإجابة';");
newTeacher = newTeacher.replace(/'\?🔥 ناري!إيقاف'/g, "'فكرة رئيسية'");
newTeacher = newTeacher.replace(/'مؤقت مؤقت\?'/g, "'فكرة فرعية'");
newTeacher = newTeacher.replace(/window\.prompt\('مؤقت مؤقت 🔥 ناري! \(YouTube URL\):'\);/g, "window.prompt('أدخل رابط فيديو يوتيوب (YouTube URL):');");
newTeacher = newTeacher.replace(/\{ name: 'مؤقت', hex: '#0f172a' \}/g, "{ name: 'أسود', hex: '#0f172a' }");
newTeacher = newTeacher.replace(/\{ name: 'مؤقت', hex: '#2563eb' \}/g, "{ name: 'أزرق', hex: '#2563eb' }");
newTeacher = newTeacher.replace(/\{ name: 'مؤقت', hex: '#dc2626' \}/g, "{ name: 'أحمر', hex: '#dc2626' }");
newTeacher = newTeacher.replace(/\{ name: 'مؤقت', hex: '#16a34a' \}/g, "{ name: 'أخضر', hex: '#16a34a' }");
newTeacher = newTeacher.replace(/'مؤقت 3D'/g, "'نموذج 3D'");

// UI Text
newTeacher = newTeacher.replace(/<span className=\{styles\.tooltip\}>🔥 ناري!\?<\/span>/g, "<span className={styles.tooltip}>تحديث</span>");
newTeacher = newTeacher.replace(/<span className=\{styles\.tooltip\}>إيقاف🔥 ناري!<\/span>/g, "<span className={styles.tooltip}>مزيد من الأدوات</span>");
newTeacher = newTeacher.replace(/<span className=\{styles\.mobileHidden\} style=\{\{ fontSize: '12px', fontWeight: 'bold' \}\}>مؤقت\?<\/span>/g, "<span className={styles.mobileHidden} style={{ fontSize: '12px', fontWeight: 'bold' }}>تشجيع</span>");
newTeacher = newTeacher.replace(/aria-label="مؤقت\?">إيقاف<\/span>/g, 'aria-label="تصفيق">👏</span>');
newTeacher = newTeacher.replace(/aria-label="مؤقت\?">\?<\/span>/g, 'aria-label="سحري">✨</span>');
newTeacher = newTeacher.replace(/<span className=\{styles\.mobileHidden\}>🔥 ناري!\?<\/span>/g, '<span className={styles.mobileHidden}>تنشيط</span>');
newTeacher = newTeacher.replace(/<span className=\{styles\.mobileHidden\}>إيقاف\? مؤقت\?<\/span>/g, '<span className={styles.mobileHidden}>إيقاف التنشيط</span>');
newTeacher = newTeacher.replace(/assignPageToStudent\(val, st\.name \|\| 'مؤقت'\);/g, "assignPageToStudent(val, st.name || 'طالب');");
newTeacher = newTeacher.replace(/<option value="none">مؤقت<\/option>/g, '<option value="none">الكل</option>');
newTeacher = newTeacher.replace(/st\.name\?\.split\(' '\)\[0\] \|\| 'مؤقت'/g, "st.name?.split(' ')[0] || 'طالب'");
newTeacher = newTeacher.replace(/<span className=\{styles\.tooltip\}>مؤقت\?<\/span>/g, '<span className={styles.tooltip}>تراجع</span>'); // Wait, undo/redo both had مؤقت?
newTeacher = newTeacher.replace(/<Undo2 size=\{20\} \/><span className=\{styles\.tooltip\}>تراجع<\/span>/g, '<Undo2 size={20} /><span className={styles.tooltip}>تراجع</span>');
newTeacher = newTeacher.replace(/<Redo2 size=\{20\} \/><span className=\{styles\.tooltip\}>مؤقت\?<\/span>/g, '<Redo2 size={20} /><span className={styles.tooltip}>إعادة</span>');
newTeacher = newTeacher.replace(/<Redo2 size=\{20\} \/><span className=\{styles\.tooltip\}>تراجع<\/span>/g, '<Redo2 size={20} /><span className={styles.tooltip}>إعادة</span>');

newTeacher = newTeacher.replace(/<span className=\{styles\.tooltip\}>إيقاف🔥 ناري!إيقاف<\/span>/g, '<span className={styles.tooltip}>أدوات متقدمة</span>');
newTeacher = newTeacher.replace(/>إيقاف مؤقت\?<\/button>/g, '>تشغيل</button>');
newTeacher = newTeacher.replace(/>إيقاف مؤقت\?<\/button>/g, '>إيقاف</button>');
newTeacher = newTeacher.replace(/<label>🔥 ناري!\?:<\/label>/g, '<label>نوع الخلفية:</label>');
newTeacher = newTeacher.replace(/>مؤقت \(مؤقت\)<\/button>/g, '>عرضي (Landscape)</button>');
newTeacher = newTeacher.replace(/<option value="blank">مؤقت<\/option>/g, '<option value="blank">فارغ</option>');
newTeacher = newTeacher.replace(/<option value="ruled">مؤقت\?<\/option>/g, '<option value="ruled">مسطّر</option>');
newTeacher = newTeacher.replace(/<option value="letters">🔥 ناري!<\/option>/g, '<option value="letters">حروف</option>');
newTeacher = newTeacher.replace(/<label>مؤقت\?:<\/label>/g, '<label>شكل الإضاءة:</label>');
newTeacher = newTeacher.replace(/<h4 style=\{\{ margin: 0, color: '#334155' \}\}>إيقاف🔥 ناري!\?<\/h4>/g, "<h4 style={{ margin: 0, color: '#334155' }}>مكتبة الأشكال</h4>");
newTeacher = newTeacher.replace(/<h5>إيقاف مؤقت\? مؤقت\?<\/h5>/g, "<h5>رسومات متحركة</h5>");

newTeacher = newTeacher.replace(/>إيقاف<span>مؤقت<\/span><\/button>/g, ">مجهر<span>مجهر</span></button>"); // addMicroscope
newTeacher = newTeacher.replace(/>إيقاف<span>مؤقت\?<\/span><\/button>/g, ">كتاب<span>كتاب</span></button>"); // addBook
newTeacher = newTeacher.replace(/>إيقاف<span>مؤقت\?<\/span><\/button>/g, ">تنبيه<span>تنبيه</span></button>"); // addWarningTriangle
newTeacher = newTeacher.replace(/>إيقاف<span>مؤقت<\/span><\/button>/g, ">تحديث<span>تحديث</span></button>"); // addSyncArrows
newTeacher = newTeacher.replace(/>إيقاف<span>مؤقت\?<\/span><\/button>/g, ">صاروخ<span>صاروخ</span></button>"); // addShakingRocket
newTeacher = newTeacher.replace(/>\?<span>مؤقت\?<\/span><\/button>/g, ">تحميل<span>تحميل</span></button>"); // addLoadingSpinner
newTeacher = newTeacher.replace(/>إيقاف<span>مؤقت\?<\/span><\/button>/g, ">بندول<span>بندول</span></button>"); // addSwingingPendulum
newTeacher = newTeacher.replace(/<span className=\{styles\.tooltip\}>مؤقت<\/span>/g, "<span className={styles.tooltip}>مؤقت</span>");
newTeacher = newTeacher.replace(/>إيقاف\?<\/span>/g, ">مسح الكل</span>");
newTeacher = newTeacher.replace(/مؤقت\?:/g, "السُمك:");

fs.writeFileSync('e:\\منصة الوتين\\app\\teacher-assistant\\live-components\\LiveWhiteboardTeacher.js', newTeacher, 'utf8');
console.log('Fixed LiveWhiteboardTeacher UI Text');
