const fs = require('fs');
const file = 'e:\\منصة الوتين\\app\\teacher-assistant\\whiteboard\\QuranOrderGameOverlay.js';
let content = fs.readFileSync(file, 'utf8');

const missingPart = `  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 40,
      backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column',
      fontFamily: 'Tajawal, sans-serif', direction: 'rtl'
    }}>
      <style>{\`
        .quran-game-modal { background: #f8fafc; flex: 1; padding: 20px; width: 100%; overflow-y: auto; position: relative; }
        .quran-game-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin-bottom: 20px; }
        .quran-game-header-btns { display: flex; gap: 10px; }
        .quran-game-ayah { padding: 15px; font-size: 1.5rem; line-height: 2; }
        @media (max-width: 768px) {
          .quran-game-modal { padding: 10px; width: 100%; }
          .quran-game-grid { grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; }
          .quran-game-header-btns { flex-direction: column; gap: 5px; }
          .quran-game-ayah { padding: 8px; font-size: 1rem; line-height: 1.6; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounceIn {
          0% { transform: scale(0.8); opacity: 0; }
          50% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); }
        }
      \`}</style>
      
      {/* Header */}
      <div style={{
        minHeight: '60px', backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)', flexWrap: 'wrap', gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {!isStudent && (
            <button onClick={stopAudioAndClose} style={{
              background: '#fee2e2', border: 'none', width: '36px', height: '36px',
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#ef4444'
            }}>
              <X size={20} />
            </button>
          )}
          <h2 style={{ margin: 0, color: '#1e293b', fontSize: '1.2rem', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '5px' }}>
            📖 لعبة ترتيب الآيات
          </h2>
        </div>

        {gameState !== 'setup' && !isStudent && (
          <div className="quran-game-header-btns">
            <button onClick={() => setAudioEnabled(!audioEnabled)} style={{
              background: audioEnabled ? '#e0f2fe' : '#f1f5f9', color: audioEnabled ? '#0284c7' : '#64748b',
              border: 'none', padding: '8px 15px', borderRadius: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold'
            }}>
              {audioEnabled ? <><Volume2 size={18}/> إيقاف الصوت</> : <><VolumeX size={18}/> تشغيل الصوت</>}
            </button>
            <button onClick={resetGame} style={{
              background: '#f1f5f9', color: '#475569', border: 'none', padding: '8px 15px', borderRadius: '20px', 
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold'
            }}>
              <RefreshCcw size={18} /> إعادة تعيين`;

content = content.replace('if (!isActive) return null;\n            </button>', 'if (!isActive) return null;\n' + missingPart + '\n            </button>');

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed syntax');
