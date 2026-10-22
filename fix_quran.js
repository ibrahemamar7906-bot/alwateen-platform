const fs = require('fs');
const path = 'e:\\ملفات المنصة\\-\\app\\teacher-assistant\\whiteboard\\QuranOrderGameOverlay.js';
let content = fs.readFileSync(path, 'utf8');

const lines = content.split('\n');

// We know the exact lines from previous inspection
// Line 287 (index 286) to 291 (index 290)
lines[286] = "                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>";
lines[287] = "                    <label style={{ color: '#059669', fontWeight: 'bold' }}>اختر السورة</label>";
lines[288] = "                    <select value={surah} onChange={e => setSurah(Number(e.target.value))} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', height: '42.5px', fontFamily: 'Tajawal' }}>";
lines[289] = "                      {QURAN_SURAHS.map((sName, idx) => (<option key={idx + 1} value={idx + 1}>{idx + 1}. سورة {sName}</option>))}";
lines[290] = "                    </select>";
lines[291] = "                  </div>";

fs.writeFileSync(path, lines.join('\n'), 'utf8');
console.log('Fixed');