const fs = require('fs');
let content = fs.readFileSync('e:/ملفات المنصة/-/app/teacher-assistant/whiteboard/WhiteboardComponent.js', 'utf8');

// 1. Fix bottom toolbar Quran Game Icon
content = content.replace(
  /<button className=\{styles\.toolBtn\} onClick=\{\(\) => setIsQuranGameActive\(true\)\} style=\{\{ color: '#059669' \}\}>📐<\/button>/,
  '<button className={styles.toolBtn} onClick={() => setIsQuranGameActive(true)} style={{ color: "#059669" }} title="أداة ترتيب الآيات">🧩</button>'
);

// 2. Fix addIframe and addCamera "إيقاف"
content = content.replace(
  /<button className=\{styles\.toolBtn\} onClick=\{addIframe\} style=\{\{ color: '#0284c7' \}\}>\s*إيقاف\s*<\/button>/,
  '<button className={styles.toolBtn} onClick={addIframe} style={{ color: "#0284c7" }} title="إضافة موقع/لعبة"><MonitorPlay size={20} /></button>'
);

content = content.replace(
  /<button className=\{styles\.toolBtn\} onClick=\{addCamera\} style=\{\{ color: '#10b981' \}\}>\s*إيقاف\s*<\/button>/,
  '<button className={styles.toolBtn} onClick={addCamera} style={{ color: "#10b981" }} title="الكاميرا"><Camera size={20} /></button>'
);

// 3. Fix Quran Modal
const quranModalRegex = /\{\/\* Quran Modal \*\/\}[\s\S]*?(?=\{\/\* Games Modal \*\/\}|$)/;
const quranModalReplacement = `{/* Quran Modal */}
      {showQuranModal && (
        <div style={{
          position: 'absolute', bottom: '80px', left: '50%', transform: 'translateX(-50%)', background: '#fff', padding: '20px', 
          borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', zIndex: 100,
          display: 'flex', flexDirection: 'column', gap: '15px', direction: 'rtl', width: '320px', fontFamily: 'Tajawal'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '18px', color: '#0f5132' }}>إضافة آية قرآنية</h3>
            <button onClick={() => setShowQuranModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#64748b' }}><X size={20}/></button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '14px', color: '#475569', fontWeight: 'bold' }}>رقم السورة (1-114):</label>
            <input type="number" min="1" max="114" value={quranSurah} onChange={e => setQuranSurah(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '14px', color: '#475569', fontWeight: 'bold' }}>رقم الآية:</label>
            <input type="number" min="1" value={quranAyah} onChange={e => setQuranAyah(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
          </div>

          <button 
            onClick={addQuranAyah} 
            disabled={isFetchingAyah}
            style={{
              background: '#059669', color: '#fff', padding: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'
            }}>
            {isFetchingAyah ? 'جاري الإضافة...' : <><BookOpen size={20} /> إضافة الآية للسبورة</>}
          </button>
        </div>
      )}

      `;
content = content.replace(quranModalRegex, quranModalReplacement);

// 4. Fix Games Modal
const gamesModalRegex = /\{\/\* Games Modal \*\/\}[\s\S]*?(?=\{\/\* Premium Alert \*\/\}|$)/;
const gamesModalReplacement = `{/* Games Modal */}
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

      `;
content = content.replace(gamesModalRegex, gamesModalReplacement);

// 5. Fix Premium Alert Modal
const premiumModalRegex = /\{\/\* Premium Alert Modal \*\/\}[\s\S]*?(?=\s*\{\s*youtubeVideos\.map|$)/;
const premiumModalReplacement = `{/* Premium Alert Modal */}
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

      `;
content = content.replace(premiumModalRegex, premiumModalReplacement);

fs.writeFileSync('e:/ملفات المنصة/-/app/teacher-assistant/whiteboard/WhiteboardComponent.js', content, 'utf8');
console.log('Fixed tools and modals!');
