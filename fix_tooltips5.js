const fs = require('fs');
const files = [
  'e:\\منصة الوتين\\app\\teacher-assistant\\live-components\\LiveWhiteboardTeacher.js',
  'e:\\منصة الوتين\\app\\teacher-assistant\\whiteboard\\WhiteboardComponent.js'
];

const escapes = (str) => str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');

  const replacements = [
    // Left Toolbar
    ['onClick={() => setTool(\'select\')}><MousePointer2 size={20} /><span className={styles.tooltip}>', '</span>', 'تحديد'],
    ['onClick={() => setTool(\'pan\')}><Hand size={20} /><span className={styles.tooltip}>', '</span>', 'تحريك'],
    ['onClick={() => setTool(\'pen\')}><Pen size={20} /><span className={styles.tooltip}>', '</span>', 'قلم'],
    ['onClick={() => setTool(\'eraser\')}><Eraser size={20} /><span className={styles.tooltip}>', '</span>', 'ممحاة'],
    ['onClick={() => setTool(\'calligraphy\')}><span role="img" aria-label="', '</span>', '🖋️">🖋️</span><span className={styles.tooltip}>قلم خط عربي', true],
    ['onClick={() => setTool(\'spray\')}><span role="img" aria-label="', '</span>', '💨">💨</span><span className={styles.tooltip}>فرشاة بخاخ', true],
    ['onClick={() => setTool(\'highlighter\')}><Highlighter size={20} /><span className={styles.tooltip}>', '</span>', 'قلم تمييز'],
    ['onClick={() => setTool(\'laser\')}><Crosshair size={20} /><span className={styles.tooltip}>', '</span>', 'مؤشر ليزر'],
    ['onClick={() => setTool(\'magic\')}><Sparkles size={20} /><span className={styles.tooltip}>', '</span>', 'قلم سحري'],
    ['<ChevronDown size={20} />\n               <span className={styles.tooltip}>', '</span>', 'المزيد'],
    ['<ChevronUp size={20} />\n                  <span className={styles.tooltip}>', '</span>', 'طي'],

    // Bottom toolbar
    ['<ChevronUp size={20} />\n               <span className={styles.tooltip}>', '</span>', 'أدوات الإدراج'],
    ['onClick={() => setIsLibraryOpen(!isLibraryOpen)}><StickyNote size={20} /><span className={styles.tooltip}>', '</span>', 'ملاحظة لاصقة / أشكال'],
    ['onClick={addText}><Type size={20} /><span className={styles.tooltip}>', '</span>', 'نص'],
    ['onClick={addVoiceText} style={{ color: \'#ec4899\' }}><Mic size={20} /><span className={styles.tooltip}>', '</span>', 'كتابة بالصوت'],
    ['onClick={addRect}><Square size={20} /><span className={styles.tooltip}>', '</span>', 'مربع'],
    ['onClick={addCircle}><Circle size={20} /><span className={styles.tooltip}>', '</span>', 'دائرة'],
    ['onClick={addTriangle}><Triangle size={20} /><span className={styles.tooltip}>', '</span>', 'مثلث'],
    ['onClick={addLine}><Minus size={20} /><span className={styles.tooltip}>', '</span>', 'خط'],
    ['onClick={addArrow}><ArrowRight size={20} /><span className={styles.tooltip}>', '</span>', 'سهم'],
    ['<ImageIcon size={20} /><span className={styles.tooltip}>', '</span>', 'صورة'],
    ['<Video size={20} /><span className={styles.tooltip}>', '</span>', 'فيديو'],
    ['onClick={addYoutubeVideo} style={{ color: \'#ef4444\' }}>\n                  <Video size={20} /><span className={styles.tooltip}>', '</span>', 'يوتيوب'],

    // Top left
    ['<ChevronRight size={20} />\n               <span className={styles.tooltip}>', '</span>', 'القائمة'],
    ['<a href="/teacher-assistant" className={styles.toolBtn} style={{ color: \'#ef4444\' }}><X size={20} /><span className={styles.tooltip}>', '</span>', 'خروج'],
    ['onClick={() => setShowGuideModal(true)} style={{ color: \'#10b981\' }}><HelpCircle size={20} /><span className={styles.tooltip}>', '</span>', 'مساعدة'],
    ['onClick={addPage} style={{ color: \'#2563eb\' }}>?<span className={styles.tooltip}>', '</span>', 'صفحة جديدة', true],
    ['onClick={() => setIsStickersLibraryOpen(true)} style={{ color: \'#f59e0b\' }}><Sparkles size={20} /><span className={styles.tooltip}>', '</span>', 'ملصقات'],
    ['onClick={() => setActiveBgMenu(!activeBgMenu)}><Grid size={20} /><span className={styles.tooltip}>', '</span>', 'الخلفية'],
    ['onClick={clearCanvas} style={{ color: \'#ef4444\' }}><Trash2 size={20} /><span className={styles.tooltip}>', '</span>', 'مسح الكل'],
    ['onClick={saveImage} style={{ color: \'#10b981\' }}><Download size={20} /><span className={styles.tooltip}>', '</span>', 'حفظ صورة'],
    ['onClick={handleUndo}><Undo2 size={20} /><span className={styles.tooltip}>', '</span>', 'تراجع'],
    ['onClick={handleRedo}><Redo2 size={20} /><span className={styles.tooltip}>', '</span>', 'إعادة']
  ];

  for (const [start, end, replacement, isCustom] of replacements) {
    if (isCustom) {
       let regex = new RegExp(escapes(start.split('?')[0]) + '.*?' + escapes(end), 'g');
       content = content.replace(regex, start.split('?')[0] + replacement + end);
    } else {
       let regex = new RegExp(escapes(start) + '.*?' + escapes(end), 'g');
       content = content.replace(regex, start + replacement + end);
    }
  }

  // Handle font size tooltip manually
  content = content.replace(/title="[^"]*?مؤقت[^"]*?"/g, 'title="تعديل"');

  // Handle addPage specifically
  content = content.replace(/onClick=\{addPage\} style=\{\{ color: '#2563eb' \}\}>.*?<span className=\{styles\.tooltip\}>.*?<\/span>/g, 'onClick={addPage} style={{ color: \'#2563eb\' }}>➕<span className={styles.tooltip}>صفحة جديدة</span>');
  
  // Custom video for youtube
  content = content.replace(/onClick=\{addYoutubeVideo\} style=\{\{ color: '#ef4444' \}\}>\s*<Video size=\{20\} \/><span className=\{styles\.tooltip\}>.*?<\/span>/g, 'onClick={addYoutubeVideo} style={{ color: \'#ef4444\' }}>\n                  <Video size={20} /><span className={styles.tooltip}>يوتيوب</span>');

  // Calligraphy and Spray
  content = content.replace(/onClick=\{\(\) => setTool\('calligraphy'\)\}><span role="img" aria-label="[^"]*">[^<]*<\/span><span className=\{styles\.tooltip\}>.*?<\/span>/g, 'onClick={() => setTool(\'calligraphy\')}><span role="img" aria-label="قلم خط">🖋️</span><span className={styles.tooltip}>قلم خط عربي</span>');
  content = content.replace(/onClick=\{\(\) => setTool\('spray'\)\}><span role="img" aria-label="[^"]*">[^<]*<\/span><span className=\{styles\.tooltip\}>.*?<\/span>/g, 'onClick={() => setTool(\'spray\')}><span role="img" aria-label="بخاخ">💨</span><span className={styles.tooltip}>فرشاة بخاخ</span>');


  fs.writeFileSync(file, content, 'utf8');
}
console.log("Fixed!");
