const fs = require('fs');
let content = fs.readFileSync('e:/ملفات المنصة/-/app/teacher-assistant/whiteboard/WhiteboardComponent.js', 'utf8');

const regex = /<div className=\{styles\.libraryPanel\}>[\s\S]*?<\/div>\s*<\/div>\s*\)\s*\}/;

const replacement = `<div className={styles.libraryPanel}>
   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
      <h4 style={{ margin: 0, color: '#334155' }}>المكتبة</h4>
      <button onClick={() => setIsLibraryOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color="#94a3b8" /></button>
   </div>
   
   <div className={styles.librarySection}>
     <h5>ملاحظات لاصقة</h5>
     <div className={styles.libraryGrid}>
        <div className={styles.stickyNoteItem} style={{ background: '#fef08a' }} onClick={() => addStickyNote('#fef08a')} title="أصفر"></div>
        <div className={styles.stickyNoteItem} style={{ background: '#a7f3d0' }} onClick={() => addStickyNote('#a7f3d0')} title="أخضر"></div>
        <div className={styles.stickyNoteItem} style={{ background: '#bfdbfe' }} onClick={() => addStickyNote('#bfdbfe')} title="أزرق"></div>
        <div className={styles.stickyNoteItem} style={{ background: '#fbcfe8' }} onClick={() => addStickyNote('#fbcfe8')} title="وردي"></div>
     </div>
   </div>

   <div className={styles.librarySection}>
     <h5>أدوات علمية</h5>
     <div className={styles.libraryGrid}>
        <button className={styles.libraryItem} onClick={addMicroscope} title="ميكروسكوب">🔬<span>مجهر</span></button>
        <button className={styles.libraryItem} onClick={addFlask} title="دورق">⚗️<span>دورق</span></button>
        <button className={styles.libraryItem} onClick={addBook} title="كتاب">📖<span>كتاب</span></button>
        <button className={styles.libraryItem} onClick={addGradCap} title="قبعة تخرج">🎓<span>قبعة</span></button>
        <button className={styles.libraryItem} onClick={addAtom} title="ذرة">⚛️<span>ذرة</span></button>
        <button className={styles.libraryItem} onClick={addTelescope} title="تلسكوب">🔭<span>تلسكوب</span></button>
        <button className={styles.libraryItem} onClick={addGlobe} title="مجسم الكرة الأرضية">🌍<span>أرض</span></button>
        <button className={styles.libraryItem} onClick={addPalette} title="ألوان">🎨<span>ألوان</span></button>
        <button className={styles.libraryItem} onClick={addMusicNote} title="نوتة موسيقية">🎵<span>نوتة</span></button>
        <button className={styles.libraryItem} onClick={() => { if (!isPremium && !isTeacherDashboard) { setShowPremiumAlert(true); return; } setIsPeriodicTableActive(true); setIsLibraryOpen(false); }} title="الجدول الدوري">🧪<span>عناصر</span></button>
     </div>
   </div>

   <div className={styles.librarySection}>
     <h5>أدوات هندسية</h5>
     <div className={styles.libraryGrid}>
        <button className={styles.libraryItem} onClick={() => { addRuler(); setIsLibraryOpen(false); }} title="مسطرة">📏<span>مسطرة</span></button>
        <button className={styles.libraryItem} onClick={() => { addProtractor(); setIsLibraryOpen(false); }} title="منقلة">📐<span>منقلة</span></button>
        <button className={styles.libraryItem} onClick={() => { setTool('compass'); setIsLibraryOpen(false); }} title="فرجار (برجل)">📍<span>برجل</span></button>
        <button className={styles.libraryItem} onClick={() => { addAxes(); setIsLibraryOpen(false); }} title="محاور">➕<span>محاور</span></button>
     </div>
   </div>

   <div className={styles.librarySection}>
     <h5>رموز تعبيرية</h5>
     <div className={styles.libraryGrid}>
        <button className={styles.libraryItem} onClick={() => { addEmoji('😀'); setIsLibraryOpen(false); }} title="مبتسم">😀<span>مبتسم</span></button>
        <button className={styles.libraryItem} onClick={() => { addEmoji('😂'); setIsLibraryOpen(false); }} title="يضحك">😂<span>يضحك</span></button>
        <button className={styles.libraryItem} onClick={() => { addEmoji('🥰'); setIsLibraryOpen(false); }} title="حب">🥰<span>حب</span></button>
        <button className={styles.libraryItem} onClick={() => { addEmoji('🤔'); setIsLibraryOpen(false); }} title="يفكر">🤔<span>يفكر</span></button>
        <button className={styles.libraryItem} onClick={() => { addEmoji('😎'); setIsLibraryOpen(false); }} title="نظارة">😎<span>نظارة</span></button>
        <button className={styles.libraryItem} onClick={() => { addEmoji('😭'); setIsLibraryOpen(false); }} title="يبكي">😭<span>يبكي</span></button>
        <button className={styles.libraryItem} onClick={() => { addEmoji('😡'); setIsLibraryOpen(false); }} title="غاضب">😡<span>غاضب</span></button>
        <button className={styles.libraryItem} onClick={() => { addEmoji('🤯'); setIsLibraryOpen(false); }} title="مندهش">🤯<span>مندهش</span></button>
        <button className={styles.libraryItem} onClick={() => { addEmoji('🥳'); setIsLibraryOpen(false); }} title="احتفال">🥳<span>احتفال</span></button>
        <button className={styles.libraryItem} onClick={() => { addEmoji('😴'); setIsLibraryOpen(false); }} title="نائم">😴<span>نائم</span></button>
        <button className={styles.libraryItem} onClick={() => { addEmoji('👍'); setIsLibraryOpen(false); }} title="جيد">👍<span>جيد</span></button>
        <button className={styles.libraryItem} onClick={() => { addEmoji('👎'); setIsLibraryOpen(false); }} title="سيء">👎<span>سيء</span></button>
     </div>
   </div>

   <div className={styles.librarySection}>
     <h5>أشكال متنوعة</h5>
     <div className={styles.libraryGrid}>
        <button className={styles.libraryItem} onClick={() => { addEmoji('⭐'); setIsLibraryOpen(false); }} title="نجمة">⭐<span>نجمة</span></button>
        <button className={styles.libraryItem} onClick={() => { addEmoji('❤️'); setIsLibraryOpen(false); }} title="قلب">❤️<span>قلب</span></button>
        <button className={styles.libraryItem} onClick={() => { addEmoji('🔥'); setIsLibraryOpen(false); }} title="نار">🔥<span>نار</span></button>
        <button className={styles.libraryItem} onClick={() => { addEmoji('✅'); setIsLibraryOpen(false); }} title="صح">✅<span>صح</span></button>
        <button className={styles.libraryItem} onClick={() => { addEmoji('❌'); setIsLibraryOpen(false); }} title="خطأ">❌<span>خطأ</span></button>
        <button className={styles.libraryItem} onClick={() => { addEmoji('💡'); setIsLibraryOpen(false); }} title="فكرة">💡<span>فكرة</span></button>
        <button className={styles.libraryItem} onClick={() => { addEmoji('🏆'); setIsLibraryOpen(false); }} title="كأس">🏆<span>كأس</span></button>
        <button className={styles.libraryItem} onClick={() => { addEmoji('👑'); setIsLibraryOpen(false); }} title="تاج">👑<span>تاج</span></button>
        <button className={styles.libraryItem} onClick={() => { addEmoji('🚀'); setIsLibraryOpen(false); }} title="صاروخ">🚀<span>صاروخ</span></button>
        <button className={styles.libraryItem} onClick={() => { addEmoji('🧠'); setIsLibraryOpen(false); }} title="عقل">🧠<span>عقل</span></button>
        <button className={styles.libraryItem} onClick={() => { addEmoji('⚙️'); setIsLibraryOpen(false); }} title="إعدادات">⚙️<span>إعدادات</span></button>
        <button className={styles.libraryItem} onClick={() => { addEmoji('⏰'); setIsLibraryOpen(false); }} title="ساعة">⏰<span>ساعة</span></button>
     </div>
   </div>

   <div className={styles.librarySection}>
     <h5>أشكال إضافية</h5>
     <div className={styles.libraryGrid}>
        <button className={styles.libraryItem} onClick={() => { addHexagon(); setIsLibraryOpen(false); }} title="سداسي">⬡<span>سداسي</span></button>
        <button className={styles.libraryItem} onClick={() => { addCylinder(); setIsLibraryOpen(false); }} title="أسطوانة">🛢️<span>أسطوانة</span></button>
        <button className={styles.libraryItem} onClick={() => { addCube(); setIsLibraryOpen(false); }} title="مكعب">🧊<span>مكعب</span></button>
        <button className={styles.libraryItem} onClick={() => { addPyramid(); setIsLibraryOpen(false); }} title="هرم">🔺<span>هرم</span></button>
        <button className={styles.libraryItem} onClick={() => { addCone(); setIsLibraryOpen(false); }} title="مخروط">🍦<span>مخروط</span></button>
        <button className={styles.libraryItem} onClick={() => { addEllipse(); setIsLibraryOpen(false); }} title="بيضاوي">⬭<span>بيضاوي</span></button>
        <button className={styles.libraryItem} onClick={() => { addCloud(); setIsLibraryOpen(false); }} title="سحابة">☁️<span>سحابة</span></button>
        <button className={styles.libraryItem} onClick={() => { if(typeof addSpeechBubble === 'function') addSpeechBubble(); else { addRect(); }; setIsLibraryOpen(false); }} title="محادثة">💬<span>محادثة</span></button>
     </div>
   </div>

   <div className={styles.librarySection}>
     <h5>عناصر متحركة</h5>
     <div className={styles.libraryGrid}>
        <button className={styles.libraryItem} onClick={() => { addRotatingGear(); setIsLibraryOpen(false); }} title="ترس دوار">⚙️<span>ترس</span></button>
        <button className={styles.libraryItem} onClick={() => { addPulsingStar(); setIsLibraryOpen(false); }} title="نجمة نابضة">🌟<span>نجمة</span></button>
        <button className={styles.libraryItem} onClick={() => { addBlinkingArrow(); setIsLibraryOpen(false); }} title="سهم يومض">➡️<span>سهم</span></button>
        <button className={styles.libraryItem} onClick={() => { addBeatingHeart(); setIsLibraryOpen(false); }} title="قلب ينبض">💓<span>قلب</span></button>
        <button className={styles.libraryItem} onClick={() => { addWarningTriangle(); setIsLibraryOpen(false); }} title="تحذير">⚠️<span>تحذير</span></button>
        <button className={styles.libraryItem} onClick={() => { addRotatingHourglass(); setIsLibraryOpen(false); }} title="ساعة رملية">⏳<span>ساعة</span></button>
        <button className={styles.libraryItem} onClick={() => { addSyncArrows(); setIsLibraryOpen(false); }} title="تزامن">🔄<span>تزامن</span></button>
        <button className={styles.libraryItem} onClick={() => { addShakingRocket(); setIsLibraryOpen(false); }} title="صاروخ يهتز">🚀<span>صاروخ</span></button>
        <button className={styles.libraryItem} onClick={() => { addLoadingSpinner(); setIsLibraryOpen(false); }} title="تحميل">🌀<span>تحميل</span></button>
        <button className={styles.libraryItem} onClick={() => { addSwingingPendulum(); setIsLibraryOpen(false); }} title="بندول يتأرجح">⚖️<span>بندول</span></button>
        <button className={styles.libraryItem} onClick={() => { addBouncingBall(); setIsLibraryOpen(false); }} title="كرة ترتد">⚽<span>كرة</span></button>
     </div>
   </div>
</div>
)}
`;

content = content.replace(regex, replacement);
fs.writeFileSync('e:/ملفات المنصة/-/app/teacher-assistant/whiteboard/WhiteboardComponent.js', content, 'utf8');
console.log('Done replacing!');
