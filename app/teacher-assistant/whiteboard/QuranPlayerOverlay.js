import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, FastForward, Rewind, Repeat, Volume2, Loader } from 'lucide-react';

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

const SURAHS = [
  "الفاتحة","البقرة","آل عمران","النساء","المائدة","الأنعام","الأعراف","الأنفال","التوبة","يونس",
  "هود","يوسف","الرعد","إبراهيم","الحجر","النحل","الإسراء","الكهف","مريم","طه",
  "الأنبياء","الحج","المؤمنون","النور","الفرقان","الشعراء","النمل","القصص","العنكبوت","الروم",
  "لقمان","السجدة","الأحزاب","سبأ","فاطر","يس","الصافات","ص","الزمر","غافر",
  "فصلت","الشورى","الزخرف","الدخان","الجاثية","الأحقاف","محمد","الفتح","الحجرات","ق",
  "الذاريات","الطور","النجم","القمر","الرحمن","الواقعة","الحديد","المجادلة","الحشر","الممتحنة",
  "الصف","الجمعة","المنافقون","التغابن","الطلاق","التحريم","الملك","القلم","الحاقة","المعارج",
  "نوح","الجن","المزمل","المدثر","القيامة","الإنسان","المرسلات","النبأ","النازعات","عبس",
  "التكوير","الانفطار","المطففين","الانشقاق","البروج","الطارق","الأعلى","الغاشية","الفجر","البلد",
  "الشمس","الليل","الضحى","الشرح","التين","العلق","القدر","البينة","الزلزلة","العاديات",
  "القارعة","التكاثر","العصر","الهمزة","الفيل","قريش","الماعون","الكوثر","الكافرون","النصر",
  "المسد","الإخلاص","الفلق","الناس"
];

export default function QuranPlayerOverlay({ isActive, onClose, channel = null, isTeacher = true }) {
  if (!isActive) return null;

  const [selectedSurah, setSelectedSurah] = useState(1);
  const [selectedReciter, setSelectedReciter] = useState('ar.alafasy');
  const [surahData, setSurahData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAyahIndex, setCurrentAyahIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [repeatMode, setRepeatMode] = useState('none');
  const [repeatStart, setRepeatStart] = useState(1);
  const [repeatEnd, setRepeatEnd] = useState(1);

  const audioRef = useRef(null);
  const preloadAudioRef = useRef(null);
  const containerRef = useRef(null);
  const currentAyahRef = useRef(null);

  useEffect(() => {
    if (isActive) {
      fetchSurah();
    }
  }, [isActive, selectedSurah, selectedReciter]);

  // Sync logic (Teacher broadcasting state)
  useEffect(() => {
    if (!channel || !isTeacher) return;
    channel.send({
      type: 'broadcast',
      event: 'quran_sync',
      payload: {
        surah: selectedSurah,
        reciter: selectedReciter,
        ayah: currentAyahIndex,
        playing: isPlaying,
        mode: repeatMode,
        start: repeatStart,
        end: repeatEnd
      }
    }).catch(() => {});
  }, [selectedSurah, selectedReciter, currentAyahIndex, isPlaying, repeatMode, repeatStart, repeatEnd, channel, isTeacher]);

  // Sync logic (Student receiving state)
  useEffect(() => {
    if (!channel || isTeacher) return;
    
    // We patched .on() in page.js so that calling .unsubscribe() is completely safe
    // and only removes this specific listener without closing the channel.
    const sub = channel.on('broadcast', { event: 'quran_sync' }, ({ payload }) => {
      setSelectedSurah(payload.surah);
      setSelectedReciter(payload.reciter);
      setCurrentAyahIndex(payload.ayah);
      setRepeatMode(payload.mode);
      setRepeatStart(payload.start);
      setRepeatEnd(payload.end);
      
      setIsPlaying(prev => {
        if (payload.playing !== prev) {
          if (audioRef.current) {
            if (payload.playing) audioRef.current.play().catch(e => console.log('Audio Autoplay Blocked:', e));
            else audioRef.current.pause();
          }
          return payload.playing;
        }
        return prev;
      });
    });
    return () => {
      if (sub && typeof sub.unsubscribe === 'function') sub.unsubscribe();
    };
  }, [channel, isTeacher]);

  useEffect(() => {
    if (currentAyahRef.current && containerRef.current) {
      currentAyahRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentAyahIndex]);


  // Preload next Ayah audio to eliminate gaps
  useEffect(() => {
    if (preloadAudioRef.current && surahData) {
      let nextSrc = null;
      if (repeatMode === 'range') {
        const startIndex = repeatStart - 1;
        const endIndex = repeatEnd - 1;
        if (currentAyahIndex < endIndex && currentAyahIndex < surahData.ayahs.length - 1) {
          nextSrc = surahData.ayahs[currentAyahIndex + 1].audio;
        } else {
          nextSrc = surahData.ayahs[startIndex].audio;
        }
      } else if (repeatMode === 'surah' || repeatMode === 'none') {
        if (currentAyahIndex < surahData.ayahs.length - 1) {
          nextSrc = surahData.ayahs[currentAyahIndex + 1].audio;
        } else if (repeatMode === 'surah') {
          nextSrc = surahData.ayahs[0].audio;
        }
      }

      if (nextSrc && preloadAudioRef.current.src !== nextSrc) {
        preloadAudioRef.current.src = nextSrc;
      }
    }
  }, [currentAyahIndex, surahData, repeatMode, repeatStart, repeatEnd]);

  const fetchSurah = async () => {
    setIsLoading(true);
    setIsPlaying(false);
    setCurrentAyahIndex(0);
    setRepeatMode('none');
    setRepeatStart(1);
    setRepeatEnd(1);
    try {
      const res = await fetch(`https://api.alquran.cloud/v1/surah/${selectedSurah}/${selectedReciter}`);
      const data = await res.json();
      if (data && data.data) {
        setSurahData(data.data);
      }
    } catch (err) {
      console.error(err);
    }
    setIsLoading(false);
  };

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      if (repeatMode === 'range') {
        const startIndex = repeatStart - 1;
        const endIndex = repeatEnd - 1;
        if (currentAyahIndex < startIndex || currentAyahIndex > endIndex) {
          setCurrentAyahIndex(startIndex);
          setIsPlaying(true);
          return;
        }
      }
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (surahData && currentAyahIndex < surahData.ayahs.length - 1) {
      setCurrentAyahIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentAyahIndex > 0) {
      setCurrentAyahIndex(prev => prev - 1);
    }
  };

  // Update Media Session API for background playback and lock screen controls
  useEffect(() => {
    if ('mediaSession' in navigator && surahData) {
      const reciterName = RECITERS.find(r => r.id === selectedReciter)?.name || 'القرآن الكريم';
      navigator.mediaSession.metadata = new window.MediaMetadata({
        title: `سورة ${SURAHS[selectedSurah - 1]} - آية ${currentAyahIndex + 1}`,
        artist: reciterName,
        album: 'مقرأة منصة الوتين'
      });
    }
  }, [currentAyahIndex, surahData, selectedSurah, selectedReciter]);

  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', handlePlayPause);
      navigator.mediaSession.setActionHandler('pause', handlePlayPause);
      navigator.mediaSession.setActionHandler('previoustrack', handlePrev);
      navigator.mediaSession.setActionHandler('nexttrack', handleNext);
    }
    return () => {
      if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('play', null);
        navigator.mediaSession.setActionHandler('pause', null);
        navigator.mediaSession.setActionHandler('previoustrack', null);
        navigator.mediaSession.setActionHandler('nexttrack', null);
      }
    };
  }, [handlePlayPause, handlePrev, handleNext]);


  const handleAudioEnded = () => {
    if (repeatMode === 'verse') {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else if (repeatMode === 'surah') {
      if (surahData && currentAyahIndex < surahData.ayahs.length - 1) {
        setCurrentAyahIndex(prev => prev + 1);
      } else {
        setCurrentAyahIndex(0);
      }
    } else if (repeatMode === 'range') {
      const startIndex = repeatStart - 1;
      const endIndex = repeatEnd - 1;
      if (currentAyahIndex >= startIndex && currentAyahIndex < endIndex && currentAyahIndex < (surahData?.ayahs.length - 1 || 0)) {
        setCurrentAyahIndex(prev => prev + 1);
      } else {
        setCurrentAyahIndex(startIndex);
      }
    } else {
      if (surahData && currentAyahIndex < surahData.ayahs.length - 1) {
        setCurrentAyahIndex(prev => prev + 1);
      } else {
        setIsPlaying(false);
      }
    }
  };

  useEffect(() => {
    if (audioRef.current && surahData && surahData.ayahs[currentAyahIndex]) {
      const newSrc = surahData.ayahs[currentAyahIndex].audio;
      if (audioRef.current.src !== newSrc) {
        audioRef.current.src = newSrc;
      }
      
      if (isPlaying) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(e => {
            console.warn("Autoplay prevented:", e);
            if (e.name === 'NotAllowedError') {
              setIsPlaying(false);
            }
          });
        }
      }
    }
  }, [currentAyahIndex, surahData]);

  // Handle network reconnection
  useEffect(() => {
    const handleOnline = () => {
      if (isPlaying && audioRef.current) {
        audioRef.current.load();
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {});
        }
      }
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [isPlaying]);

  const handleAudioError = () => {
    if (isPlaying && audioRef.current && surahData && surahData.ayahs[currentAyahIndex]) {
      console.warn("Audio error. Trying fallback...");
      
      const currentSrc = audioRef.current.src;
      // If we haven't tried the 64kbps fallback yet
      if (currentSrc.includes('/128/')) {
        const fallbackSrc = currentSrc.replace('/128/', '/64/');
        audioRef.current.src = fallbackSrc;
        audioRef.current.load();
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {});
        }
      } else {
        // If fallback also fails, retry after 3 seconds (network issue)
        setTimeout(() => {
          if (isPlaying && audioRef.current && navigator.onLine) {
            audioRef.current.load();
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
              playPromise.catch(() => {});
            }
          }
        }, 3000);
      }
    }
  };
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(255, 255, 255, 0.95)', zIndex: 9000,
      display: 'flex', flexDirection: 'column',
      fontFamily: '"Amiri", "Cairo", sans-serif', direction: 'rtl'
    }}>
      <style>{`
        .quran-overlay-controls { display: flex; gap: 20px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 20px; }
        .quran-text-container { font-size: 2.5rem; padding: 40px; }
        .quran-player-bar { padding: 15px; display: flex; justify-content: center; alignItems: center; gap: 20px; background: white; border-bottom: 1px solid #e2e8f0; flex-wrap: wrap; }
        .quran-repeat-section { display: flex; flex-direction: column; gap: 10px; }
        .quran-repeat-inputs { display: flex; align-items: center; gap: 10px; font-size: 0.9rem; }
        @media (max-width: 768px) {
          .quran-overlay-controls { flex-direction: column; gap: 10px; padding: 15px; }
          .quran-text-container { font-size: 1.5rem !important; padding: 15px !important; }
          .quran-player-bar { gap: 10px; padding: 10px; }
          .quran-repeat-section { width: 100%; align-items: center; }
          .quran-repeat-inputs { flex-wrap: wrap; justify-content: center; }
        }
      `}</style>
      {isTeacher && (
        <>
          <div style={{
            padding: '15px 20px', background: '#10b981', color: 'white',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Volume2 size={24} /> مقرأة القرآن
            </h2>
            <button onClick={onClose} style={{
              background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white',
              borderRadius: '50%', width: '40px', height: '40px', display: 'flex',
              alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
            }}>
              <X size={24} />
            </button>
          </div>

          <div className="quran-overlay-controls">
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>اختر السورة:</label>
              <select 
                value={selectedSurah} 
                onChange={(e) => setSelectedSurah(Number(e.target.value))}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1.1rem' }}
              >
                {SURAHS.map((s, idx) => (
                  <option key={idx} value={idx + 1}>{idx + 1}. سورة {s}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>اختر القارئ:</label>
              <select 
                value={selectedReciter} 
                onChange={(e) => setSelectedReciter(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1.1rem' }}
              >
                {RECITERS.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="quran-player-bar">
            <button onClick={handlePrev} disabled={currentAyahIndex === 0} style={{ width: '40px', height: '40px', borderRadius: '50%', border: 'none', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <FastForward size={20} />
            </button>
            <button onClick={handlePlayPause} style={{ width: '50px', height: '50px', borderRadius: '50%', border: 'none', background: '#10b981', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 6px rgba(16,185,129,0.3)' }}>
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>
            <button onClick={handleNext} disabled={surahData && currentAyahIndex === surahData.ayahs.length - 1} style={{ width: '40px', height: '40px', borderRadius: '50%', border: 'none', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Rewind size={20} />
            </button>
            <div style={{ width: '10px' }}></div>
            <div className="quran-repeat-section">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <Repeat size={20} color="#64748b" />
                <select 
                  value={repeatMode} 
                  onChange={(e) => {
                    setRepeatMode(e.target.value);
                    if (e.target.value === 'range') {
                  setRepeatStart(currentAyahIndex + 1);
                  setRepeatEnd(currentAyahIndex + 1);
                }
              }}
              style={{ padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
            >
              <option value="none">بدون تكرار</option>
              <option value="verse">تكرار الآية الحالية</option>
              <option value="surah">تكرار السورة كاملة</option>
              <option value="range">تكرار جزء (مخصص)</option>
            </select>
          </div>
          {repeatMode === 'range' && (
            <div className="quran-repeat-inputs">
              <span>من:</span>
              <input 
                type="number" min={1} max={surahData?.ayahs.length || 1} 
                value={repeatStart} 
                onChange={e => setRepeatStart(Math.max(1, Math.min(surahData?.ayahs.length || 1, Number(e.target.value))))} 
                style={{ width: '50px', padding: '5px', borderRadius: '5px', border: '1px solid #cbd5e1', textAlign: 'center' }} 
              />
              <span>إلى:</span>
              <input 
                type="number" min={repeatStart} max={surahData?.ayahs.length || 1} 
                value={repeatEnd} 
                onChange={e => setRepeatEnd(Math.max(repeatStart, Math.min(surahData?.ayahs.length || 1, Number(e.target.value))))} 
                style={{ width: '50px', padding: '5px', borderRadius: '5px', border: '1px solid #cbd5e1', textAlign: 'center' }} 
              />
            </div>
          )}
        </div>
      </div>
      </>
      )}

      <div ref={containerRef} className="quran-text-container" style={{
        flex: 1, overflowY: 'auto', background: '#f8fafc',
        textAlign: 'center', lineHeight: '2', color: '#1e293b'
      }}>
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', color: '#64748b', marginTop: '50px' }}>
            <Loader className="animate-spin" size={48} />
            <p>جاري تحميل السورة...</p>
          </div>
        ) : (
          surahData && surahData.ayahs.map((ayah, idx) => {
            const isCurrent = idx === currentAyahIndex;
  if (!isActive) return null;
  return (
              <span 
                key={ayah.number}
                ref={isCurrent ? currentAyahRef : null}
                onClick={() => {
                  setCurrentAyahIndex(idx);
                  if (!isPlaying) {
                    setIsPlaying(true);
                  }
                }}
                style={{
                  display: 'inline',
                  cursor: 'pointer',
                  padding: '5px 10px',
                  borderRadius: '10px',
                  background: isCurrent ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                  color: isCurrent ? '#047857' : '#1e293b',
                  transition: 'all 0.3s ease'
                }}
              >
                {ayah.text}
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: '40px', height: '40px', borderRadius: '50%', border: '2px solid',
                  borderColor: isCurrent ? '#10b981' : '#cbd5e1',
                  fontSize: '1.2rem', margin: '0 10px', verticalAlign: 'middle',
                  color: isCurrent ? '#10b981' : '#94a3b8'
                }}>
                  {ayah.numberInSurah}
                </span>
              </span>
            );
          })
        )}
      </div>

      <audio ref={audioRef} onEnded={handleAudioEnded} onError={handleAudioError} />
      <audio ref={preloadAudioRef} preload="auto" style={{ display: 'none' }} />
    </div>
  );
}




