import React, { useState, useEffect, useRef } from 'react';
import { X, Volume2, VolumeX, Play, Trophy, RefreshCcw } from 'lucide-react';
import { renderCheerOnCanvas } from '../../utils/cheerEffects';

const RECITERS = [
  { id: 'ar.abdulbasitmurattal', name: 'عبد الباسط عبد الصمد (مرتل)' },
  { id: 'ar.abdulsamad', name: 'عبد الباسط عبد الصمد (مجود)' },
  { id: 'ar.alafasy', name: 'مشاري راشد العفاسي' },
  { id: 'ar.husary', name: 'محمود خليل الحصري' },
  { id: 'ar.husarymujawwad', name: 'محمود خليل الحصري (مجود)' },
  { id: 'ar.minshawi', name: 'محمد صديق المنشاوي' },
  { id: 'ar.minshawimujawwad', name: 'محمد صديق المنشاوي (مجود)' },
  { id: 'ar.mahermuaiqly', name: 'ماهر المعيقلي' },
  { id: 'ar.abdurrahmaansudais', name: 'عبد الرحمن السديس' },
  { id: 'ar.saoodshuraym', name: 'سعود الشريم' },
  { id: 'ar.yasserdossari', name: 'ياسر الدوسري' },
  { id: 'ar.ahmedajamy', name: 'أحمد بن علي العجمي' },
  { id: 'ar.hudhaify', name: 'علي بن عبد الرحمن الحذيفي' },
  { id: 'ar.muhammadayyoub', name: 'محمد أيوب' },
  { id: 'ar.muhammadjibreel', name: 'محمد جبريل' },
  { id: 'ar.aymansowaid', name: 'أيمن سويد' },
  { id: 'ar.abdullahbasfar', name: 'عبد الله بصفر' }
];

const QURAN_SURAHS = [
  "الفاتحة", "البقرة", "آل عمران", "النساء", "المائدة", "الأنعام", "الأعراف", "الأنفال", "التوبة", "يونس",
  "هود", "يوسف", "الرعد", "إبراهيم", "الحجر", "النحل", "الإسراء", "الكهف", "مريم", "طه",
  "الأنبياء", "الحج", "المؤمنون", "النور", "الفرقان", "الشعراء", "النمل", "القصص", "العنكبوت", "الروم",
  "لقمان", "السجدة", "الأحزاب", "سبأ", "فاطر", "يس", "الصافات", "ص", "الزمر", "غافر",
  "فصلت", "الشورى", "الزخرف", "الدخان", "الجاثية", "الأحقاف", "محمد", "الفتح", "الحجرات", "ق",
  "الذاريات", "الطور", "النجم", "القمر", "الرحمن", "الواقعة", "الحديد", "المجادلة", "الحشر", "الممتحنة",
  "الصف", "الجمعة", "المنافقون", "التغابن", "الطلاق", "التحريم", "الملك", "القلم", "الحاقة", "المعارج",
  "نوح", "الجن", "المزمل", "المدثر", "القيامة", "الإنسان", "المرسلات", "النبأ", "النازعات", "عبس",
  "التكوير", "الانفطار", "المطففين", "الانشقاق", "البروج", "الطارق", "الأعلى", "الغاشية", "الفجر", "البلد",
  "الشمس", "الليل", "الضحى", "الشرح", "التين", "العلق", "القدر", "البينة", "الزلزلة", "العاديات",
  "القارعة", "التكاثر", "العصر", "الهمزة", "الفيل", "قريش", "الماعون", "الكوثر", "الكافرون", "النصر",
  "المسد", "الإخلاص", "الفلق", "الناس"
];
export default function QuranOrderGameOverlay({ isActive, onClose, isStudent = false, channel, hasControl = false }) {
  if (!isActive) return null;


  const [surah, setSurah] = useState(1);
  const [startAyah, setStartAyah] = useState(1);
  const [endAyah, setEndAyah] = useState(7);
  const [selectedReciter, setSelectedReciter] = useState('ar.alafasy');
  
  const [gameState, setGameState] = useState('setup'); // 'setup', 'playing', 'won'
  const [loading, setLoading] = useState(false);
  
  const [originalAyahs, setOriginalAyahs] = useState([]);
  const [scrambledAyahs, setScrambledAyahs] = useState([]);
  const [orderedAyahs, setOrderedAyahs] = useState([]);
  
  const [audioEnabled, setAudioEnabled] = useState(true);
  const audioRef = useRef(null);

  const stateRef = useRef({ scrambledAyahs });
  useEffect(() => {
    stateRef.current = { scrambledAyahs };
  }, [scrambledAyahs]);

  useEffect(() => {
    if (!channel || isStudent) return;
    const payload = { gameState, originalAyahs, scrambledAyahs, orderedAyahs };
    channel.send({
      type: 'broadcast',
      event: 'quran_game_sync',
      payload
    }).catch(()=>{});
  }, [gameState, originalAyahs, scrambledAyahs, orderedAyahs, channel, isStudent]);

  useEffect(() => {
    if (!channel || !isStudent) return;
    const sub = channel.on('broadcast', { event: 'quran_game_sync' }, ({ payload }) => {
      if (payload) {
        setGameState(payload.gameState);
        setOriginalAyahs(payload.originalAyahs);
        setScrambledAyahs(payload.scrambledAyahs);
        setOrderedAyahs(payload.orderedAyahs);
      }
    });
    return () => {
      if (sub && typeof sub.unsubscribe === 'function') sub.unsubscribe();
    }
  }, [channel, isStudent]);


  const startGame = async () => {
    if (isStudent) return;
    if (startAyah > endAyah || startAyah < 1) {
      alert('يجب أن تكون الآية البداية أصغر من النهاية');
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch(`https://api.alquran.cloud/v1/surah/${surah}/${selectedReciter}`);
      const data = await res.json();
      
      if (data.code === 200) {
        const ayahs = data.data.ayahs;
        if (endAyah > ayahs.length) {
          alert(`هذه السورة تحتوي فقط على ${ayahs.length} آية فقط.`);
          setLoading(false);
          return;
        }

        const selectedAyahs = ayahs.slice(startAyah - 1, endAyah);
        
        setOriginalAyahs(selectedAyahs);
        
        const shuffled = [...selectedAyahs].sort(() => Math.random() - 0.5);
        const shuffledWithState = shuffled.map(a => ({ ...a, isError: false }));
        setScrambledAyahs(shuffledWithState);
        setOrderedAyahs([]);
        setGameState('playing');
      }
    } catch (e) {
      alert('حدث خطأ أثناء جلب الآيات. الرجاء التأكد من الاتصال.');
    } finally {
      setLoading(false);
    }
  };

  const handleAyahClick = (clickedAyah) => {
    if (gameState !== 'playing') return;

    if (isStudent) {
      if (hasControl && channel) {
        channel.send({
          type: 'broadcast',
          event: 'quran_game_click',
          payload: { ayahNumber: clickedAyah.number }
        }).catch(()=>{});
      }
      return;
    }

    const nextCorrectIndex = orderedAyahs.length;
    const correctAyah = originalAyahs[nextCorrectIndex];

    if (clickedAyah.number === correctAyah.number) {
      if (audioEnabled) {
        if (audioRef.current) audioRef.current.pause();
        const audio = new Audio(clickedAyah.audio);
        audio.play();
        audioRef.current = audio;
      }

      setScrambledAyahs(prev => prev.filter(a => a.number !== clickedAyah.number));
      const newOrdered = [...orderedAyahs, clickedAyah];
      setOrderedAyahs(newOrdered);

      if (newOrdered.length === originalAyahs.length) {
        setGameState('won');
        renderCheerOnCanvas(null, 'victory');
      } else {
        renderCheerOnCanvas(null, 'magic');
      }
    } else {
      setScrambledAyahs(prev => prev.map(a => 
        a.number === clickedAyah.number ? { ...a, isError: true } : a
      ));
      
      setTimeout(() => {
        setScrambledAyahs(prev => prev.map(a => 
          a.number === clickedAyah.number ? { ...a, isError: false } : a
        ));
      }, 500);
    }
  };

  const handleAyahClickRef = useRef();
  useEffect(() => {
    handleAyahClickRef.current = handleAyahClick;
  });

  useEffect(() => {
    if (!channel || isStudent) return;
    const sub = channel.on('broadcast', { event: 'quran_game_click' }, ({ payload }) => {
      if (payload && payload.ayahNumber) {
        const currentScrambled = stateRef.current.scrambledAyahs;
        const clickedAyah = currentScrambled.find(a => a.number === payload.ayahNumber);
        if (clickedAyah && handleAyahClickRef.current) {
          handleAyahClickRef.current(clickedAyah);
        }
      }
    });
    return () => {
      if (sub && typeof sub.unsubscribe === 'function') sub.unsubscribe();
    }
  }, [channel, isStudent]);

  const stopAudioAndClose = () => {
    if (isStudent) return;
    if (audioRef.current) audioRef.current.pause();
    onClose();
  };

  const resetGame = () => {
    if (isStudent) return;
    if (audioRef.current) audioRef.current.pause();
    setGameState('setup');
    setOrderedAyahs([]);
    setScrambledAyahs([]);
  };
  if (!isActive) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100000,
      backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column',
      fontFamily: 'Tajawal, sans-serif', direction: 'rtl'
    }}>
      <style>{`
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
      `}</style>
      
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
              <RefreshCcw size={18} /> إعادة تعيين
            </button>
          </div>
        )}
      </div>

      <div className="quran-game-modal">
        {gameState === 'setup' && (
          <div style={{ background: '#fff', padding: '30px', borderRadius: '15px', border: '1px solid #e2e8f0', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', maxWidth: '800px', margin: '0 auto' }}>
            {isStudent ? (
              <p style={{ color: '#059669', fontSize: '18px', fontWeight: 'bold' }}>جاري تحضير اللعبة من قبل المعلم...</p>
            ) : (
              <>
                <p style={{ color: '#475569', marginBottom: '20px', fontSize: '15px' }}>
                  اختر السورة وحدد نطاق الآيات لتدريب الطلاب.
                </p>
                <div className="quran-game-grid">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label style={{ color: '#059669', fontWeight: 'bold' }}>اختر السورة</label>
                    <select value={surah} onChange={e => setSurah(Number(e.target.value))} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', height: '42.5px', fontFamily: 'Tajawal' }}>
                      {QURAN_SURAHS.map((sName, idx) => (<option key={idx + 1} value={idx + 1}>{idx + 1}. سورة {sName}</option>))}
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label style={{ color: '#059669', fontWeight: 'bold' }}>من آية</label>
                    <input type="number" min="1" value={startAyah} onChange={e => setStartAyah(Number(e.target.value))} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label style={{ color: '#059669', fontWeight: 'bold' }}>إلى آية</label>
                    <input type="number" min="1" value={endAyah} onChange={e => setEndAyah(Number(e.target.value))} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label style={{ color: '#059669', fontWeight: 'bold' }}>القارئ</label>
                    <select value={selectedReciter} onChange={e => setSelectedReciter(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', height: '42.5px' }}>
                      {RECITERS.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                  </div>
                </div>
                <button 
                  onClick={startGame} 
                  disabled={loading}
                  style={{
                    width: '100%', background: '#059669', color: 'white', padding: '15px', borderRadius: '8px', 
                    border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '18px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px'
                  }}
                >
                  {loading ? 'جاري التحميل...' : <><Play size={20} /> ابدأ اللعبة</>}
                </button>
              </>
            )}
          </div>
        )}

        {(gameState === 'playing' || gameState === 'won') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
            
            {/* Area 1 */}
            <div>
              <h4 style={{ color: '#059669', borderBottom: '2px solid #059669', paddingBottom: '10px', marginBottom: '15px' }}>
                الترتيب الصحيح ({orderedAyahs.length} / {originalAyahs.length})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minHeight: '100px' }}>
                {orderedAyahs.map(ayah => (
                  <div key={ayah.number} className="quran-game-ayah" style={{
                    background: '#ecfdf5', border: '1px solid #10b981', borderRadius: '10px',
                    color: '#064e3b', textAlign: 'center', animation: 'fadeIn 0.5s'
                  }}>
                    {ayah.text} {'\uFD3F'}{ayah.numberInSurah}{'\uFD3E'}</div>
                ))}
                {gameState === 'playing' && (
                  <div style={{
                    background: '#fff', border: '2px dashed #cbd5e1', padding: '15px', borderRadius: '10px',
                    color: '#94a3b8', textAlign: 'center', fontSize: '1rem'
                  }}>
                    الآية القادمة هنا...
                  </div>
                )}
              </div>
            </div>

            {/* Area 2 */}
            {gameState === 'playing' && (
              <div>
                <h4 style={{ color: '#b45309', borderBottom: '2px solid #b45309', paddingBottom: '10px', marginBottom: '15px' }}>
                  الآيات المتاحة (انقر على الآية الصحيحة)
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {scrambledAyahs.map((ayah, idx) => (
                    <button 
                      key={ayah.number}
                      className="quran-game-ayah"
                      onClick={() => handleAyahClick(ayah)}
                      style={{
                        background: ayah.isError ? '#fee2e2' : '#fff', 
                        border: `2px solid ${ayah.isError ? '#ef4444' : '#fbbf24'}`, 
                        borderRadius: '10px', cursor: 'pointer',
                        color: '#78350f', width: '100%',
                        textAlign: 'center', transition: 'all 0.2s',
                        transform: ayah.isError ? 'translateX(5px)' : 'none'
                      }}
                      onMouseOver={(e) => { if(!ayah.isError) e.currentTarget.style.background = '#fef3c7'; }}
                      onMouseOut={(e) => { if(!ayah.isError) e.currentTarget.style.background = '#fff'; }}
                    >
                      {ayah.text}</button>
                  ))}
                </div>
              </div>
            )}

            {gameState === 'won' && (
              <div style={{
                background: '#fef3c7', padding: '30px', borderRadius: '15px', textAlign: 'center',
                border: '2px solid #f59e0b', animation: 'bounceIn 1s'
              }}>
                <Trophy size={60} color="#f59e0b" style={{ margin: '0 auto 15px auto', display: 'block' }} />
                <h2 style={{ color: '#b45309', margin: '0 0 10px 0' }}>أحسنت! ترتيب صحيح 100%</h2>
                <p style={{ color: '#78350f', fontSize: '18px', margin: 0 }}>تمت مراجعة الآيات بنجاح.</p>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
