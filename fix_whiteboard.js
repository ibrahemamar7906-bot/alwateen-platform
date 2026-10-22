const fs = require('fs');
const file1 = 'e:/ملفات المنصة/-/app/teacher-assistant/whiteboard/WhiteboardComponent.js';
const file2 = 'e:/ملفات المنصة/-/app/teacher-assistant/live-components/LiveWhiteboardTeacher.js';

let content = fs.readFileSync(file1, 'utf8');
content = content.replace(/\{isSettingsOpen && \([\s\S]*?<\/label>\s*<\/div>\s*\)\}/, 
`{isSettingsOpen && (
            <div style={{ marginTop: '5px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
               <select className={styles.selectInput} value={bgType} onChange={(e) => { setBgType(e.target.value); setCustomBgImage(null); }}>
                 <option value="blank">سبورة بيضاء (فارغة)</option>
                 <option value="ruled">مسطرة (لغة عربية)</option>
                 <option value="grid">مربعات (رياضيات)</option>
               </select>
               <button 
                 onClick={() => setIsBackgroundsLibraryOpen(true)}
                 className={styles.actionBtn} style={{ background: '#0ea5e9', color: 'white', padding: '8px', fontWeight: 'bold' }}>
                 خلفيات إضافية (مميزة)
               </button>
               <select className={styles.selectInput} value={mouseEffect} onChange={(e) => {
                 if (e.target.value !== 'default' && !isPremium && !isAdmin) {
                   setShowPremiumAlert(true);
                   return;
                 }
                 setMouseEffect(e.target.value);
               }}>
                 <option value="default">مؤشر الماوس: عادي</option>
                 <option value="cat">مؤشر: قطة (مميز)</option>
                 <option value="octopus">مؤشر: أخطبوط (مميز)</option>
                 <option value="magic">مؤشر: عصا سحرية (مميز)</option>
                 <option value="rocket">مؤشر: صاروخ (مميز)</option>
                 <option value="star">مؤشر: نجمة (مميز)</option>
               </select>
               <label className={styles.actionBtn} style={{ background: '#e0e7ff', color: '#3730a3', cursor: 'pointer', textAlign: 'center', padding: '8px' }}>
                 صورة / PDF
                 <input type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={handleBackgroundUpload} />
               </label>
            </div>
         )}`
);
fs.writeFileSync(file1, content, 'utf8');

let content2 = fs.readFileSync(file2, 'utf8');
content2 = content2.replace(/<select className=\{styles\.selectInput\} value=\{bgType\} onChange=\{\(e\) => setBgType\(e\.target\.value\)\}>[\s\S]*?<\/select>/,
`<select className={styles.selectInput} value={bgType} onChange={(e) => setBgType(e.target.value)}>
                    <option value="blank">سبورة بيضاء</option>
                    <option value="ruled">مسطرة</option>
                    <option value="grid">مربعات</option>
                    <option value="letters">حروف إنجليزية</option>
                  </select>`
);
content2 = content2.replace(/<label className=\{styles\.actionBtn\} style=\{\{ background: '#e0e7ff', color: '#3730a3', cursor: 'pointer', textAlign: 'center', padding: '8px' \}\}>[\s\S]*?<\/label>/,
`<label className={styles.actionBtn} style={{ background: '#e0e7ff', color: '#3730a3', cursor: 'pointer', textAlign: 'center', padding: '8px' }}>
                   صورة / PDF
                   <input type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={handleBackgroundUpload} />
                 </label>`
);
fs.writeFileSync(file2, content2, 'utf8');
