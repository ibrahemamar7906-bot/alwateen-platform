const fs = require('fs');
const file = 'e:\\منصة الوتين\\app\\teacher-assistant\\whiteboard\\WhiteboardComponent.js';
let content = fs.readFileSync(file, 'utf8');

const replacements = {
  // Left Toolbar
  'onClick={() => setTool(\'select\')}><MousePointer2 size={20} /><span className={styles.tooltip}>.*?</span>': 'onClick={() => setTool(\'select\')}><MousePointer2 size={20} /><span className={styles.tooltip}>تحديد</span>',
  'onClick={() => setTool(\'pan\')}><Hand size={20} /><span className={styles.tooltip}>.*?</span>': 'onClick={() => setTool(\'pan\')}><Hand size={20} /><span className={styles.tooltip}>تحريك</span>',
  'onClick={() => setTool(\'pen\')}><Pen size={20} /><span className={styles.tooltip}>.*?</span>': 'onClick={() => setTool(\'pen\')}><Pen size={20} /><span className={styles.tooltip}>قلم</span>',
  'onClick={() => setTool(\'eraser\')}><Eraser size={20} /><span className={styles.tooltip}>.*?</span>': 'onClick={() => setTool(\'eraser\')}><Eraser size={20} /><span className={styles.tooltip}>ممحاة</span>',
  
  'onClick={() => setIsLeftToolbarExpanded(true)} style={{ color: \'#0ea5e9\' }}>\\s*<ChevronDown size={20} />\\s*<span className={styles.tooltip}>.*?</span>': 'onClick={() => setIsLeftToolbarExpanded(true)} style={{ color: \'#0ea5e9\' }}>\n               <ChevronDown size={20} />\n               <span className={styles.tooltip}>المزيد</span>',
  
  'onClick={() => setTool(\'calligraphy\')}><span role="img" aria-label=".*?">.*?</span><span className={styles.tooltip}>.*?</span>': 'onClick={() => setTool(\'calligraphy\')}><span role="img" aria-label="قلم خط">🖋️</span><span className={styles.tooltip}>قلم خط عربي</span>',
  'onClick={() => setTool(\'spray\')}><span role="img" aria-label=".*?">.*?</span><span className={styles.tooltip}>.*?</span>': 'onClick={() => setTool(\'spray\')}><span role="img" aria-label="بخاخ">💨</span><span className={styles.tooltip}>فرشاة بخاخ</span>',
  
  'onClick={() => setTool(\'highlighter\')}><Highlighter size={20} /><span className={styles.tooltip}>.*?</span>': 'onClick={() => setTool(\'highlighter\')}><Highlighter size={20} /><span className={styles.tooltip}>قلم تمييز</span>',
  'onClick={() => setTool(\'laser\')}><Crosshair size={20} /><span className={styles.tooltip}>.*?</span>': 'onClick={() => setTool(\'laser\')}><Crosshair size={20} /><span className={styles.tooltip}>مؤشر ليزر</span>',
  'onClick={() => setTool(\'magic\')}><Sparkles size={20} /><span className={styles.tooltip}>.*?</span>': 'onClick={() => setTool(\'magic\')}><Sparkles size={20} /><span className={styles.tooltip}>قلم سحري</span>',
  
  'onClick={() => setIsLeftToolbarExpanded(false)} style={{ color: \'#64748b\' }}>\\s*<ChevronUp size={20} />\\s*<span className={styles.tooltip}>.*?</span>': 'onClick={() => setIsLeftToolbarExpanded(false)} style={{ color: \'#64748b\' }}>\n                  <ChevronUp size={20} />\n                  <span className={styles.tooltip}>طي</span>',

  // Text formatting
  'title=".*?مؤقت.*?"': 'title="تعديل"',

  // Bottom toolbar
  'onClick={() => setIsBottomToolbarExpanded(true)} style={{ color: \'#0ea5e9\' }}>\\s*<ChevronUp size={20} />\\s*<span className={styles.tooltip}>.*?</span>': 'onClick={() => setIsBottomToolbarExpanded(true)} style={{ color: \'#0ea5e9\' }}>\n               <ChevronUp size={20} />\n               <span className={styles.tooltip}>أدوات الإدراج</span>',
  'onClick={() => setIsLibraryOpen(!isLibraryOpen)}><StickyNote size={20} /><span className={styles.tooltip}>.*?</span>': 'onClick={() => setIsLibraryOpen(!isLibraryOpen)}><StickyNote size={20} /><span className={styles.tooltip}>ملاحظة لاصقة / أشكال</span>',
  'onClick={addText}><Type size={20} /><span className={styles.tooltip}>.*?</span>': 'onClick={addText}><Type size={20} /><span className={styles.tooltip}>نص</span>',
  'onClick={addVoiceText} style={{ color: \'#ec4899\' }}><Mic size={20} /><span className={styles.tooltip}>.*?</span>': 'onClick={addVoiceText} style={{ color: \'#ec4899\' }}><Mic size={20} /><span className={styles.tooltip}>كتابة بالصوت</span>',
  'onClick={addRect}><Square size={20} /><span className={styles.tooltip}>.*?</span>': 'onClick={addRect}><Square size={20} /><span className={styles.tooltip}>مربع</span>',
  'onClick={addCircle}><Circle size={20} /><span className={styles.tooltip}>.*?</span>': 'onClick={addCircle}><Circle size={20} /><span className={styles.tooltip}>دائرة</span>',
  'onClick={addTriangle}><Triangle size={20} /><span className={styles.tooltip}>.*?</span>': 'onClick={addTriangle}><Triangle size={20} /><span className={styles.tooltip}>مثلث</span>',
  'onClick={addLine}><Minus size={20} /><span className={styles.tooltip}>.*?</span>': 'onClick={addLine}><Minus size={20} /><span className={styles.tooltip}>خط</span>',
  'onClick={addArrow}><ArrowRight size={20} /><span className={styles.tooltip}>.*?</span>': 'onClick={addArrow}><ArrowRight size={20} /><span className={styles.tooltip}>سهم</span>',
  
  '<ImageIcon size={20} /><span className={styles.tooltip}>.*?</span>': '<ImageIcon size={20} /><span className={styles.tooltip}>صورة</span>',
  '<Video size={20} /><span className={styles.tooltip}>.*?مؤقت.*?</span>': '<Video size={20} /><span className={styles.tooltip}>فيديو</span>',
  '<Video size={20} /><span className={styles.tooltip}>.*?ناري.*?</span>': '<Video size={20} /><span className={styles.tooltip}>يوتيوب</span>',

  // Top left
  'onClick={() => setIsTopLeftToolbarExpanded(true)} style={{ color: \'#0ea5e9\' }}>\\s*<ChevronRight size={20} />\\s*<span className={styles.tooltip}>.*?</span>': 'onClick={() => setIsTopLeftToolbarExpanded(true)} style={{ color: \'#0ea5e9\' }}>\n               <ChevronRight size={20} />\n               <span className={styles.tooltip}>القائمة</span>',
  '<a href="/teacher-assistant" className={styles.toolBtn} style={{ color: \'#ef4444\' }}><X size={20} /><span className={styles.tooltip}>.*?</span></a>': '<a href="/teacher-assistant" className={styles.toolBtn} style={{ color: \'#ef4444\' }}><X size={20} /><span className={styles.tooltip}>خروج</span></a>',
  'onClick={() => setShowGuideModal(true)} style={{ color: \'#10b981\' }}><HelpCircle size={20} /><span className={styles.tooltip}>.*?</span>': 'onClick={() => setShowGuideModal(true)} style={{ color: \'#10b981\' }}><HelpCircle size={20} /><span className={styles.tooltip}>مساعدة</span>',
  
  'onClick={addPage} style={{ color: \'#2563eb\' }}>\\?<span className={styles.tooltip}>.*?</span>': 'onClick={addPage} style={{ color: \'#2563eb\' }}>➕<span className={styles.tooltip}>صفحة جديدة</span>',
  'onClick={() => setIsStickersLibraryOpen(true)} style={{ color: \'#f59e0b\' }}><Sparkles size={20} /><span className={styles.tooltip}>.*?</span>': 'onClick={() => setIsStickersLibraryOpen(true)} style={{ color: \'#f59e0b\' }}><Sparkles size={20} /><span className={styles.tooltip}>ملصقات</span>',
  
  'onClick={() => setActiveBgMenu(!activeBgMenu)}><Grid size={20} /><span className={styles.tooltip}>.*?</span>': 'onClick={() => setActiveBgMenu(!activeBgMenu)}><Grid size={20} /><span className={styles.tooltip}>الخلفية</span>',
  'onClick={clearCanvas} style={{ color: \'#ef4444\' }}><Trash2 size={20} /><span className={styles.tooltip}>.*?</span>': 'onClick={clearCanvas} style={{ color: \'#ef4444\' }}><Trash2 size={20} /><span className={styles.tooltip}>مسح الكل</span>',
  'onClick={saveImage} style={{ color: \'#10b981\' }}><Download size={20} /><span className={styles.tooltip}>.*?</span>': 'onClick={saveImage} style={{ color: \'#10b981\' }}><Download size={20} /><span className={styles.tooltip}>حفظ صورة</span>',
  'onClick={handleUndo}><Undo2 size={20} /><span className={styles.tooltip}>.*?</span>': 'onClick={handleUndo}><Undo2 size={20} /><span className={styles.tooltip}>تراجع</span>',
  'onClick={handleRedo}><Redo2 size={20} /><span className={styles.tooltip}>.*?</span>': 'onClick={handleRedo}><Redo2 size={20} /><span className={styles.tooltip}>إعادة</span>'
};

for (const [pattern, replacement] of Object.entries(replacements)) {
  content = content.replace(new RegExp(pattern, 'g'), replacement);
}

fs.writeFileSync(file, content, 'utf8');
console.log("Done WC");
