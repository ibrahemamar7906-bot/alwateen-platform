const fs = require('fs');
const path = require('path');

// Fix corrupted tooltip text in the whiteboard files
// The replacements are for malformed tooltip strings that came from encoding errors
const FINAL_TOOLTIP_MAP = {
  // The mix-ups from wrong substitutions in tooltips:
  'إيقاف مؤقت': 'مؤقت',        // Timer was mapped wrong
  'إيقاف? مؤقت?': 'آلة حساب',   // Calculator was mapped wrong
  'مؤقتإيقاف?': 'الستارة الذكية', // Blind was mapped wrong
  'مؤقت? مؤقت?': 'الستارة الذكية',
  '🔥 ناري!': 'أدوات متقدمة',   // The expand button 
  '🔥 ناري!إيقاف?': 'اختبار رياضيات', // Math quiz  
  '?🔥 ناري!': 'معادلة رياضية',
  'مؤقتإيقاف LaTeX': 'معادلة LaTeX',
  'مؤقت مؤقتإيقاف': 'رسم بياني',
  'مؤقت? 3D (إيقاف?)': 'مكتبة 3D (علوم)',
  'مؤقتإيقاف? إيقاف?': 'استيراد ذكي',
  'مؤقتإيقاف مؤقت?': 'بطاقات تحفيزية', // Motivational and poll both?
  'مؤقت? مؤقت?': 'خريطة ذهنية',
  'مؤقتإيقاف? مؤقت?': 'استيراد خريطة',
  'مؤقتإيقاف مؤقت?': 'إضافة فرع',
  'مؤقت X O': 'لعبة X O',
  '#إيقاف': '#',
  'إيقاف': '📊',  // left as generic
  
  // Cheer overlay
  'إيقاف?': '👍',
  
  // Other malformed ones
  '?مؤقت': 'مؤقت',
};

// More specific replacements - context-sensitive for the tooltips section
// Do a complete section replacement for lines 3538-3575
function fixTooltipSection(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace known malformed tooltip texts with the correct ones
  const replacements = [
    // Expand button tooltip
    [/<span className=\{styles\.tooltip\}>🔥 ناري!<\/span>\n\s+<\/button>\s*\n\s*\) : \(/g, 
     '<span className={styles.tooltip}>أدوات متقدمة</span>\n          </button>\n        ) : ('],
    
    // Timer button
    [/\>إيقاف<span className=\{styles\.tooltip\}>مؤقت<\/span>/g, 
     '>⏱️<span className={styles.tooltip}>مؤقت</span>'],
    
    // Calculator button  
    [/<span className=\{styles\.tooltip\}>إيقاف\? مؤقت\?<\/span>/g,
     '<span className={styles.tooltip}>آلة حساب</span>'],
    
    // Blind button  
    [/\>مؤقتإيقاف\?<span className=\{styles\.tooltip\}>مؤقت\? مؤقت\?<\/span>/g,
     '>🙈<span className={styles.tooltip}>الستارة الذكية</span>'],
    
    // Geometry Tools
    [/\>إيقاف<span className=\{styles\.tooltip\}>🔥 ناري!<\/span>/g,
     '>📐<span className={styles.tooltip}>أدوات هندسية</span>'],
    
    // Math Quiz
    [/<span className=\{styles\.tooltip\}>🔥 ناري!إيقاف\?<\/span>/g,
     '<span className={styles.tooltip}>اختبار رياضيات</span>'],
    
    // Quran Player
    [/<span className=\{styles\.tooltip\}>🔥 ناري!<\/span><\/button>\n\s+<button.*setIsMathModalOpen/,
     (match) => match.replace('🔥 ناري!', 'مقرأة القرآن')],
    
    // Math equation
    [/\>\?<span className=\{styles\.tooltip\}>\?🔥 ناري!<\/span>/g,
     '>π<span className={styles.tooltip}>معادلة رياضية</span>'],
    
    // Math equation LaTeX
    [/<span className=\{styles\.tooltip\}>مؤقتإيقاف LaTeX<\/span>/g,
     '<span className={styles.tooltip}>معادلة LaTeX</span>'],
    
    // Smart Graph  
    [/\>إيقاف<span className=\{styles\.tooltip\}>مؤقت مؤقتإيقاف<\/span>/g,
     '>📈<span className={styles.tooltip}>رسم بياني</span>'],
    
    // Science 3D Library
    [/\>إيقاف<span className=\{styles\.tooltip\}>مؤقت\? 3D \(إيقاف\?\)<\/span>/g,
     '>🔬<span className={styles.tooltip}>مكتبة 3D (علوم)</span>'],
    
    // Smart Import
    [/<span className=\{styles\.tooltip\}>مؤقتإيقاف\? إيقاف\?<\/span>/g,
     '<span className={styles.tooltip}>استيراد ذكي</span>'],
    
    // Motivational
    [/\>\?<span className=\{styles\.tooltip\}>مؤقتإيقاف مؤقت\?<\/span><\/button>\n\s+<button onClick=\{\(\) => setIsPollModalOpen/,
     (match) => match.replace('مؤقتإيقاف مؤقت?', 'بطاقات تحفيزية')],
    
    // Poll
    [/\>إيقاف<span className=\{styles\.tooltip\}>مؤقتإيقاف مؤقت\?<\/span><\/button>\n\s+<button onClick=\{addMindMapRoot\}/,
     (match) => match.replace('مؤقتإيقاف مؤقت?', 'تصويت سريع')],
    
    // Mind Map Root
    [/\>إيقاف<span className=\{styles\.tooltip\}>مؤقت\? مؤقت\?<\/span><\/button>\n\s+<button onClick=\{\(\) => setIsMindMapImportOpen/,
     (match) => match.replace('مؤقت? مؤقت?', 'خريطة ذهنية')],
    
    // Mind Map Import
    [/<span className=\{styles\.tooltip\}>مؤقتإيقاف\? مؤقت\?<\/span>/g,
     '<span className={styles.tooltip}>استيراد خريطة</span>'],
    
    // Add Branch
    [/\>\?<span className=\{styles\.tooltip\}>مؤقتإيقاف مؤقت\?<\/span><\/button>\n\s+<button onClick=\{addTicTacToeGrid\}/,
     (match) => match.replace('مؤقتإيقاف مؤقت?', 'إضافة فرع')],
    
    // Tic Tac Toe
    [/\>#إيقاف<span className=\{styles\.tooltip\}>مؤقت X O<\/span>/g,
     '>#️⃣<span className={styles.tooltip}>لعبة X O</span>'],
    
    // Cheer reactions
    [/<span className=\{styles\.tooltip\}>إيقاف\?<\/span>/g,
     '<span className={styles.tooltip}>👍 أحسنت</span>'],
    
    [/<span className=\{styles\.tooltip\}>مؤقت? مؤقت\?<\/span>/g,
     '<span className={styles.tooltip}>🔥 ناري!</span>'],
  ];
  
  let changed = false;
  for (const [pattern, replacement] of replacements) {
    const before = content;
    content = content.replace(pattern, replacement);
    if (content !== before) changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed tooltip section in:', path.basename(filePath));
  }
}

fixTooltipSection('e:\\منصة الوتين\\app\\teacher-assistant\\live-components\\LiveWhiteboardTeacher.js');
fixTooltipSection('e:\\منصة الوتين\\app\\teacher-assistant\\whiteboard\\WhiteboardComponent.js');
console.log('Done!');
