const fs = require('fs');
let content = fs.readFileSync('e:/ملفات المنصة/-/app/teacher-assistant/whiteboard/WhiteboardComponent.js', 'utf8');

// Find Games Modal to replace it and everything after it
const gamesModalRegex = /\{\/\* Games Modal \*\/\}[\s\S]*$/;

const replacement = `{/* Games Modal */}
      {showGamesModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 10000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: 'white', padding: '30px', borderRadius: '15px', width: '90%', maxWidth: '500px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)', position: 'relative'
          }}>
            <button onClick={() => setShowGamesModal(false)} style={{
              position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none',
              cursor: 'pointer', color: '#64748b'
            }}><X size={24} /></button>
            <h3 style={{ color: '#0f5132', marginBottom: '20px', fontSize: '1.5rem', textAlign: 'center', fontFamily: 'Tajawal' }}>🎮 الألعاب التعليمية التفاعلية</h3>
            <p style={{ textAlign: 'center', color: '#475569', marginBottom: '20px', fontFamily: 'Tajawal' }}>اختر اللعبة المناسبة لدرسك. سيتم فتح اللعبة في مساحة العمل.</p>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => { setActiveIframeUrl('/grammar-games'); setShowGamesModal(false); }} className={styles.toolBtn} style={{ width: '80px', height: '80px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '15px' }} title="ألعاب القواعد">
                <span style={{ fontSize: '2.5rem' }}>🔤</span>
              </button>
              <button onClick={() => { setActiveIframeUrl('/kids-corner/games/mario'); setShowGamesModal(false); }} className={styles.toolBtn} style={{ width: '80px', height: '80px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '15px' }} title="لعبة ماريو">
                <span style={{ fontSize: '2.5rem' }}>🍄</span>
              </button>
              <button onClick={() => { setActiveIframeUrl('/kids-corner/games/subway'); setShowGamesModal(false); }} className={styles.toolBtn} style={{ width: '80px', height: '80px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '15px' }} title="لعبة الجري">
                <span style={{ fontSize: '2.5rem' }}>🏃</span>
              </button>
              <button onClick={() => { setActiveIframeUrl('/kids-corner/games/space'); setShowGamesModal(false); }} className={styles.toolBtn} style={{ width: '80px', height: '80px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '15px' }} title="لعبة الفضاء">
                <span style={{ fontSize: '2.5rem' }}>🚀</span>
              </button>
              <button onClick={() => { setIsMemoryGameActive(true); setShowGamesModal(false); }} className={styles.toolBtn} style={{ width: '80px', height: '80px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '15px' }} title="لعبة الذاكرة">
                <span style={{ fontSize: '2.5rem' }}>🧠</span>
              </button>
              <button onClick={() => { setIsWordBuilderActive(true); setShowGamesModal(false); }} className={styles.toolBtn} style={{ width: '80px', height: '80px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '15px' }} title="تكوين الكلمات">
                <span style={{ fontSize: '2.5rem' }}>🧩</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Premium Alert Modal */}
      {showPremiumAlert && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 10000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: 'white', padding: '30px', borderRadius: '15px', maxWidth: '400px',
            textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', fontFamily: 'Tajawal'
          }}>
            <h3 style={{ color: '#0f5132', marginBottom: '15px', fontSize: '1.5rem' }}>ميزة للمشتركين فقط</h3>
            <p style={{ color: '#475569', marginBottom: '20px', lineHeight: 1.6 }}>
              {isTeacherDashboard 
                ? 'هذه الميزة متاحة فقط في الباقة المتقدمة. قم بترقية حسابك الآن للاستمتاع بكافة الأدوات الذكية!'
                : 'هذه الميزة متاحة للمشتركين فقط. يرجى تسجيل الدخول أو الاشتراك للاستمتاع بكافة الأدوات!'}
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button onClick={() => { window.location.href = isTeacherDashboard ? '/pricing' : '/login'; }} style={{ background: '#059669', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontFamily: 'Tajawal' }}>
                {isTeacherDashboard ? 'ترقية الحساب الآن' : 'تسجيل الدخول'}
              </button>
              <button onClick={() => setShowPremiumAlert(false)} style={{ background: '#e2e8f0', color: '#475569', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontFamily: 'Tajawal' }}>
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {youtubeVideos.map(video => (
        <DraggableVideo 
          key={video.id} 
          video={video} 
          onClose={() => setYoutubeVideos(prev => prev.filter(v => v.id !== video.id))} 
        />
      ))}
      
      {cameras.map(cam => (
        <DraggableCamera 
          key={cam.id} 
          data={cam} 
          onClose={() => setCameras(prev => prev.filter(c => c.id !== cam.id))} 
        />
      ))}

      {iframes.map(ifr => (
        <DraggableIframe 
          key={ifr.id} 
          data={ifr} 
          onClose={() => setIframes(prev => prev.filter(i => i.id !== ifr.id))} 
        />
      ))}

      {animatedStickers.map(sticker => (
        <DraggableAnimatedSticker
          key={sticker.id}
          data={sticker}
          onClose={() => setAnimatedStickers(prev => prev.filter(s => s.id !== sticker.id))}
        />
      ))}
    </div>
  )
}
`;

content = content.replace(gamesModalRegex, replacement);
fs.writeFileSync('e:/ملفات المنصة/-/app/teacher-assistant/whiteboard/WhiteboardComponent.js', content, 'utf8');
console.log('Restored the end of the file completely!');
