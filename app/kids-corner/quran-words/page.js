'use client'

import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowRight,
  Sparkles,
  RotateCcw,
  BookOpen,
  CheckCircle2,
  Trophy,
  ChevronRight,
  ChevronLeft,
  Volume2,
  VolumeX,
  SlidersHorizontal,
  Search,
  Play,
  Pause,
  Award,
  Layers,
  Check,
  RefreshCw
} from 'lucide-react'
import { getAllSurahs, getFilteredSurahs, loadSurahData } from './quranService'
import { speakWhenReady } from '../../../utils/tts'

// Audio synthesizer for Quran chimes (independent of web audio files)
function playQuranChime(isCorrect) {
  if (typeof window === 'undefined') return
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const now = ctx.currentTime

    if (isCorrect) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(587.33, now) // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.16) // A5
      gain.gain.setValueAtTime(0.35, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.32)
    } else {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(220, now)
      osc.frequency.setValueAtTime(175, now + 0.12)
      gain.gain.setValueAtTime(0.25, now)
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.28)
    }
  } catch (_) {}
}

function QuranWordsGame() {
  const router = useRouter()

  // Surah & Range Selection States
  const [selectedSurahId, setSelectedSurahId] = useState(112) // Default to Al-Ikhlas (friendly start)
  const [fromAyah, setFromAyah] = useState(1)
  const [toAyah, setToAyah] = useState(4)
  const [isConfigOpen, setIsConfigOpen] = useState(false)
  const [surahCategory, setSurahCategory] = useState('juz_30') // 'juz_30', 'short', 'juz_29', 'all'
  const [searchQuery, setSearchQuery] = useState('')

  // Active Surah Data & Loading
  const [currentSurahData, setCurrentSurahData] = useState(null)
  const [isLoadingSurah, setIsLoadingSurah] = useState(true)
  const [loadError, setLoadError] = useState(null)

  // Game Progress State
  const [currentRangeIndex, setCurrentRangeIndex] = useState(0) // index in the active range
  const [score, setScore] = useState(0)
  const [cards, setCards] = useState([])
  const [currentWordStep, setCurrentWordStep] = useState(0)
  const [isAyahCompleted, setIsAyahCompleted] = useState(false)
  const [showHearts, setShowHearts] = useState(false)
  const [wrongShakeId, setWrongShakeId] = useState(null)
  const [isRangeFinished, setIsRangeFinished] = useState(false)
  const [isPlayingRecitation, setIsPlayingRecitation] = useState(false)

  const audioRef = useRef(null)

  // Surahs list filtered by category and search
  const availableSurahs = useMemo(() => {
    return getFilteredSurahs(surahCategory, searchQuery)
  }, [surahCategory, searchQuery])

  // Load selected Surah data
  useEffect(() => {
    let isCancelled = false
    setIsLoadingSurah(true)
    setLoadError(null)

    loadSurahData(selectedSurahId)
      .then((data) => {
        if (!isCancelled) {
          setCurrentSurahData(data)
          setIsLoadingSurah(false)

          // Adjust range defaults based on new surah
          const total = data.ayahs ? data.ayahs.length : data.ayahsCount
          const newFrom = 1
          const newTo = Math.min(total, 5)
          setFromAyah(newFrom)
          setToAyah(newTo)
          setCurrentRangeIndex(0)
          setIsRangeFinished(false)
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          console.error('Error loading surah:', err)
          setLoadError('تعذر تحميل بيانات السورة. تحقق من الاتصال بالإنترنت ثم حاول مرة أخرى.')
          setIsLoadingSurah(false)
        }
      })

    return () => {
      isCancelled = true
    }
  }, [selectedSurahId])

  // Get active range of ayahs
  const activeAyahs = useMemo(() => {
    if (!currentSurahData || !currentSurahData.ayahs) return []
    const start = Math.max(1, fromAyah)
    const end = Math.min(currentSurahData.ayahs.length, toAyah)
    return currentSurahData.ayahs.filter(a => a.num >= start && a.num <= end)
  }, [currentSurahData, fromAyah, toAyah])

  // Current active ayah in the range
  const currentAyah = activeAyahs[currentRangeIndex] || null

  // Shuffle & prepare words when active ayah changes
  useEffect(() => {
    if (!currentAyah) return

    // Stop any existing recitation
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlayingRecitation(false)
    }

    const rawWords = currentAyah.words.map((w, idx) => ({
      id: `${idx}-${w}`,
      text: w,
      targetOrder: idx,
      isPlaced: false
    }))

    // Scramble cards
    const shuffled = [...rawWords].sort(() => Math.random() - 0.5)
    if (shuffled.length > 1 && shuffled.every((item, i) => item.targetOrder === i)) {
      const temp = shuffled[0]
      shuffled[0] = shuffled[1]
      shuffled[1] = temp
    }

    setCards(shuffled)
    setCurrentWordStep(0)
    setIsAyahCompleted(false)
    setShowHearts(false)
  }, [currentAyah])

  // Play Sheikh Mishary recitation or TTS fallback
  const playAyahAudio = (audioUrl, ayahText) => {
    if (typeof window === 'undefined') return

    if (audioUrl) {
      try {
        if (!audioRef.current) {
          audioRef.current = new Audio()
        }
        audioRef.current.src = audioUrl
        setIsPlayingRecitation(true)
        audioRef.current.play().catch(() => {
          // Fallback to TTS
          speakWhenReady(ayahText, 'Arabic Male')
        })
        audioRef.current.onended = () => {
          setIsPlayingRecitation(false)
        }
        audioRef.current.onerror = () => {
          setIsPlayingRecitation(false)
          speakWhenReady(ayahText, 'Arabic Male')
        }
        return
      } catch (_) {}
    }
    speakWhenReady(ayahText, 'Arabic Male')
  }

  // Handle word card click
  const handleWordClick = (card) => {
    if (card.isPlaced || isAyahCompleted) return

    if (card.targetOrder === currentWordStep) {
      // Correct word!
      playQuranChime(true)
      const nextStep = currentWordStep + 1
      setCurrentWordStep(nextStep)

      const updated = cards.map(c => (c.id === card.id ? { ...c, isPlaced: true } : c))
      setCards(updated)

      // When entire Ayah is completed
      if (nextStep === currentAyah.words.length) {
        setIsAyahCompleted(true)
        setShowHearts(true)
        setScore(s => s + 1)
        playQuranChime(true)

        // Play recitation of this completed Ayah
        playAyahAudio(currentAyah.audio, currentAyah.text)

        // Auto advance or finish range after audio/celebration
        setTimeout(() => {
          if (currentRangeIndex + 1 < activeAyahs.length) {
            setCurrentRangeIndex(prev => prev + 1)
          } else {
            setIsRangeFinished(true)
            playQuranChime(true)
          }
        }, 3000)
      }
    } else {
      // Wrong word clicked
      playQuranChime(false)
      setWrongShakeId(card.id)
      setTimeout(() => setWrongShakeId(null), 500)
    }
  }

  // Quick range helper functions
  const setRangeFullSurah = () => {
    if (!currentSurahData) return
    const total = currentSurahData.ayahs ? currentSurahData.ayahs.length : currentSurahData.ayahsCount
    setFromAyah(1)
    setToAyah(total)
  }

  const setRangeFirstFive = () => {
    if (!currentSurahData) return
    const total = currentSurahData.ayahs ? currentSurahData.ayahs.length : currentSurahData.ayahsCount
    setFromAyah(1)
    setToAyah(Math.min(total, 5))
  }

  const setRangeNextBlock = () => {
    if (!currentSurahData) return
    const total = currentSurahData.ayahs ? currentSurahData.ayahs.length : currentSurahData.ayahsCount
    const blockSize = Math.max(1, toAyah - fromAyah + 1)
    const nextStart = toAyah + 1
    if (nextStart <= total) {
      setFromAyah(nextStart)
      setToAyah(Math.min(total, nextStart + blockSize - 1))
      setCurrentRangeIndex(0)
      setIsRangeFinished(false)
    }
  }

  const handleApplyRangeAndStart = () => {
    setCurrentRangeIndex(0)
    setIsRangeFinished(false)
    setIsConfigOpen(false)
  }

  const restartCurrentRange = () => {
    setCurrentRangeIndex(0)
    setIsRangeFinished(false)
    setIsAyahCompleted(false)
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        width: '100%',
        background: 'linear-gradient(180deg, #ecfdf5 0%, #f0fdf4 40%, #e6f7ef 100%)',
        direction: 'rtl',
        fontFamily: 'Tajawal, sans-serif',
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        overflowX: 'hidden'
      }}
    >
      {/* Floating Confetti / Hearts Animation on Completion */}
      {showHearts && (
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 60 }}>
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                top: `${30 + Math.random() * 40}%`,
                left: `${10 + Math.random() * 80}%`,
                fontSize: `${22 + Math.random() * 26}px`,
                animation: `floatUp 1.8s ease-out forwards`,
                opacity: 0.95
              }}
            >
              {['✨', '⭐', '❤️', '🌿', '🎉'][i % 5]}
            </div>
          ))}
        </div>
      )}

      {/* ── TOP HEADER ── */}
      <header
        style={{
          width: '100%',
          maxWidth: '1100px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 20,
          gap: '12px',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link
            href="/kids-corner"
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '14px',
              background: '#ffffff',
              border: '1.5px solid #a7f3d0',
              color: '#065f46',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(5,150,105,0.08)',
              textDecoration: 'none'
            }}
            aria-label="العودة لركن التأسيس"
          >
            <ArrowRight size={22} />
          </Link>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '26px' }}>🌿</span>
              <h1 style={{ margin: 0, fontSize: 'clamp(18px, 2.8vw, 22px)', fontWeight: 900, color: '#064e3b' }}>
                أنشطة حلقات القرآن الكريم
              </h1>
            </div>
            <p style={{ margin: 0, fontSize: '13px', color: '#047857', fontWeight: 600 }}>
              رتّب كلمات الآيات الكريمة بالترتيب الصحيح لتكتمل وتستمع للتلاوة!
            </p>
          </div>
        </div>

        {/* Action Controls & Range Modal Opener */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Configure Range Button */}
          <button
            onClick={() => setIsConfigOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 16px',
              borderRadius: '14px',
              background: '#ffffff',
              border: '2px solid #059669',
              color: '#065f46',
              fontWeight: 800,
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(5,150,105,0.12)',
              transition: 'all 0.2s'
            }}
          >
            <SlidersHorizontal size={17} color="#059669" />
            <span>تحديد السورة والآيات ({currentSurahData?.name || 'اختر'})</span>
          </button>

          {/* Points Counter */}
          <div
            style={{
              background: '#ffffff',
              padding: '8px 16px',
              borderRadius: '99px',
              border: '1.5px solid #a7f3d0',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 900,
              color: '#065f46',
              fontSize: '14px',
              boxShadow: '0 4px 12px rgba(5,150,105,0.08)'
            }}
          >
            <Trophy size={17} style={{ color: '#f59e0b' }} />
            <span>النقاط: {score}</span>
          </div>
        </div>
      </header>

      {/* ── ACTIVE AYAH BANNER & CONTROLS ── */}
      <section
        style={{
          width: '100%',
          maxWidth: '920px',
          padding: '0 16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          zIndex: 10
        }}
      >
        {/* Current Surah & Range Indicator Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            flexWrap: 'wrap',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1.5px solid #6ee7b7',
            padding: '8px 20px',
            borderRadius: '50px',
            boxShadow: '0 4px 16px rgba(5, 150, 105, 0.08)'
          }}
        >
          <span style={{ fontWeight: 900, color: '#064e3b', fontSize: '15px' }}>
            📖 {currentSurahData?.name || 'جاري التحميل...'}
          </span>
          <span style={{ color: '#a7f3d0' }}>•</span>
          <span style={{ fontWeight: 800, color: '#047857', fontSize: '14px' }}>
            الآيات المحددة: من {fromAyah} إلى {toAyah}
          </span>
          <span style={{ color: '#a7f3d0' }}>•</span>
          <span style={{ fontWeight: 800, color: '#059669', fontSize: '14px' }}>
            الآية الحالية: {currentAyah ? currentAyah.num : 0} (التقدم: {currentRangeIndex + 1} من {activeAyahs.length})
          </span>

          {/* Listen to Ayah Button */}
          {currentAyah && (
            <button
              onClick={() => playAyahAudio(currentAyah.audio, currentAyah.text)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                background: isPlayingRecitation ? '#059669' : '#ecfdf5',
                color: isPlayingRecitation ? '#ffffff' : '#047857',
                border: '1px solid #10b981',
                borderRadius: '20px',
                padding: '4px 12px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              title="استمع لتلاوة هذه الآية"
            >
              <Volume2 size={14} />
              <span>{isPlayingRecitation ? 'جاري الاستماع...' : 'استمع للآية'}</span>
            </button>
          )}
        </div>

        {/* Progress Bar of Range */}
        <div
          style={{
            width: '100%',
            maxWidth: '500px',
            height: '8px',
            background: 'rgba(5, 150, 105, 0.15)',
            borderRadius: '99px',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${activeAyahs.length > 0 ? ((currentRangeIndex + (isAyahCompleted ? 1 : 0)) / activeAyahs.length) * 100 : 0}%`,
              background: 'linear-gradient(90deg, #10b981, #059669)',
              borderRadius: '99px',
              transition: 'width 0.4s ease'
            }}
          />
        </div>
      </section>

      {/* ── MAIN ACTIVITY PLAYGROUND ── */}
      <main
        style={{
          width: '100%',
          maxWidth: '920px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '26px',
          padding: '16px',
          flex: 1,
          justifyContent: 'center'
        }}
      >
        {isLoadingSurah ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              padding: '40px',
              background: 'white',
              borderRadius: '24px',
              border: '2px solid #a7f3d0'
            }}
          >
            <RefreshCw size={36} color="#059669" className="animate-spin" />
            <span style={{ fontWeight: 800, color: '#064e3b', fontSize: '16px' }}>
              جاري تجهيز آيات السورة الكريمة...
            </span>
          </div>
        ) : loadError ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '14px',
              padding: '30px',
              background: '#fef2f2',
              borderRadius: '24px',
              border: '2px solid #fecaca',
              textAlign: 'center'
            }}
          >
            <p style={{ margin: 0, color: '#b91c1c', fontWeight: 800 }}>{loadError}</p>
            <button
              onClick={() => setSelectedSurahId(selectedSurahId)}
              style={{
                padding: '10px 20px',
                borderRadius: '12px',
                background: '#059669',
                color: 'white',
                border: 'none',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              إعادة المحاولة
            </button>
          </div>
        ) : isRangeFinished ? (
          /* Range Finished Celebration Card */
          <div
            style={{
              width: '100%',
              maxWidth: '650px',
              padding: '36px 24px',
              borderRadius: '28px',
              background: '#ffffff',
              border: '3px solid #10b981',
              boxShadow: '0 20px 40px rgba(16, 185, 129, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '18px',
              textAlign: 'center',
              animation: 'bounceIn 0.5s ease'
            }}
          >
            <div style={{ fontSize: '64px', lineHeight: 1 }}>🏆</div>
            <h2 style={{ margin: 0, fontSize: '26px', fontWeight: 900, color: '#064e3b' }}>
              مبارك يا بطل القرآن! 🎉
            </h2>
            <p style={{ margin: 0, fontSize: '16px', color: '#047857', fontWeight: 700, maxWidth: '480px', lineHeight: 1.6 }}>
              أتممت بنجاح ترتيب وحفظ الآيات من ({fromAyah}) إلى ({toAyah}) من {currentSurahData?.name}! ما شاء الله تبارك الله.
            </p>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '10px' }}>
              <button
                onClick={restartCurrentRange}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 22px',
                  borderRadius: '14px',
                  background: '#ecfdf5',
                  border: '1.5px solid #10b981',
                  color: '#065f46',
                  fontWeight: 800,
                  fontSize: '15px',
                  cursor: 'pointer'
                }}
              >
                <RotateCcw size={18} />
                <span>إعادة هذا المقطع</span>
              </button>

              {toAyah < (currentSurahData?.ayahs?.length || 0) && (
                <button
                  onClick={setRangeNextBlock}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 24px',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #059669, #10b981)',
                    color: 'white',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: '15px',
                    cursor: 'pointer',
                    boxShadow: '0 6px 18px rgba(5,150,105,0.3)'
                  }}
                >
                  <span>المقطع التالي ⏩</span>
                </button>
              )}

              <button
                onClick={() => setIsConfigOpen(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 22px',
                  borderRadius: '14px',
                  background: '#ffffff',
                  border: '1.5px solid #d1d5db',
                  color: '#374151',
                  fontWeight: 800,
                  fontSize: '15px',
                  cursor: 'pointer'
                }}
              >
                <BookOpen size={18} />
                <span>اختيار سورة جديدة</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Display Ayah Completion Card or Target Sentence */}
            {isAyahCompleted ? (
              <div
                style={{
                  width: '100%',
                  padding: '22px 28px',
                  borderRadius: '24px',
                  background: '#ffffff',
                  border: '3px solid #10b981',
                  boxShadow: '0 14px 32px rgba(16, 185, 129, 0.22)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px',
                  animation: 'bounceIn 0.5s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '24px' }}>🎉</span>
                  <span style={{ fontSize: '18px', fontWeight: 900, color: '#047857' }}>
                    ما شاء الله! إجابة صحيحة يا بطل! +1
                  </span>
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: 'clamp(24px, 5.5vw, 34px)',
                    fontWeight: 'bold',
                    color: '#064e3b',
                    textAlign: 'center',
                    fontFamily: 'Amiri, serif',
                    lineHeight: 1.8
                  }}
                >
                  {currentAyah.text} ﴿{currentAyah.num}﴾
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#059669', fontWeight: 700 }}>
                  <Volume2 size={15} />
                  <span>تلاوة الشيخ مشاري العفاسي 🎧</span>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: '16px', color: '#064e3b', fontWeight: 800 }}>
                  اضغط على الكلمة التالية بالترتيب القرآني الصحيح:
                </p>
                <span style={{ fontSize: '13px', color: '#047857', opacity: 0.85 }}>
                  (الكلمات تتطابق كلمة تلو الأخرى لتكتمل الآية وتستمع إليها)
                </span>
              </div>
            )}

            {/* Scrambled Word Cards */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '14px',
                flexWrap: 'wrap',
                width: '100%',
                maxWidth: '820px',
                minHeight: '120px'
              }}
            >
              {cards.map((card) => {
                const isPlaced = card.isPlaced
                const isShaking = wrongShakeId === card.id

                return (
                  <button
                    key={card.id}
                    onClick={() => handleWordClick(card)}
                    disabled={isPlaced}
                    style={{
                      minWidth: 'clamp(100px, 20vw, 150px)',
                      padding: '16px 20px',
                      borderRadius: '20px',
                      background: isPlaced
                        ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                        : 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
                      border: isPlaced ? '3px solid #6ee7b7' : '2.5px solid #10b981',
                      color: isPlaced ? '#ffffff' : '#064e3b',
                      cursor: isPlaced ? 'default' : 'pointer',
                      fontSize: 'clamp(22px, 4.2vw, 30px)',
                      fontWeight: 900,
                      fontFamily: 'Amiri, serif',
                      boxShadow: isPlaced
                        ? '0 8px 20px rgba(16, 185, 129, 0.3)'
                        : '0 8px 22px rgba(5, 150, 105, 0.12)',
                      transform: isPlaced ? 'scale(0.96)' : 'scale(1)',
                      transition: 'all 0.22s cubic-bezier(0.2, 0.8, 0.2, 1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      position: 'relative',
                      animation: isShaking ? 'shake 0.4s ease' : 'none'
                    }}
                  >
                    {isPlaced && <CheckCircle2 size={22} style={{ color: '#ffffff' }} />}
                    <span>{card.text}</span>
                  </button>
                )
              })}
            </div>
          </>
        )}
      </main>

      {/* ── FOOTER CONTROLS ── */}
      <footer
        style={{
          width: '100%',
          maxWidth: '1100px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 20,
          gap: '12px',
          flexWrap: 'wrap'
        }}
      >
        <button
          onClick={restartCurrentRange}
          style={{
            padding: '10px 18px',
            borderRadius: '14px',
            background: '#ffffff',
            border: '1.5px solid #a7f3d0',
            color: '#065f46',
            fontWeight: 800,
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}
        >
          <RotateCcw size={17} />
          <span>إعادة المقطع</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setCurrentRangeIndex(prev => Math.max(0, prev - 1))}
            disabled={currentRangeIndex === 0}
            style={{
              padding: '10px 18px',
              borderRadius: '14px',
              background: '#ffffff',
              border: '1.5px solid #a7f3d0',
              color: currentRangeIndex === 0 ? '#9ca3af' : '#065f46',
              fontWeight: 800,
              fontSize: '14px',
              cursor: currentRangeIndex === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            الآية السابقة
          </button>

          <button
            onClick={() => {
              if (currentRangeIndex + 1 < activeAyahs.length) {
                setCurrentRangeIndex(prev => prev + 1)
              } else {
                setIsRangeFinished(true)
              }
            }}
            disabled={isRangeFinished}
            style={{
              padding: '10px 22px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #059669, #10b981)',
              color: 'white',
              border: 'none',
              fontWeight: 900,
              fontSize: '15px',
              cursor: isRangeFinished ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 14px rgba(5,150,105,0.25)'
            }}
          >
            <span>الآية التالية</span>
            <ChevronLeft size={18} />
          </button>
        </div>
      </footer>

      {/* ── SURAH & AYAH RANGE CONFIGURATION MODAL ── */}
      {isConfigOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(6, 78, 59, 0.45)',
            backdropFilter: 'blur(8px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
          onClick={() => setIsConfigOpen(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '28px',
              width: '100%',
              maxWidth: '620px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: 'clamp(20px, 4vw, 32px)',
              boxShadow: '0 25px 50px rgba(0,0,0,0.2)',
              border: '2px solid #a7f3d0',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Title */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb', paddingBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '26px' }}>📖</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: '#064e3b' }}>
                    تحديد السورة ونطاق الآيات
                  </h3>
                  <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
                    اختر السورة الكريمة وحدد من أي آية إلى أي آية تريد حفظها وترتيبها
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsConfigOpen(false)}
                style={{
                  background: '#f3f4f6',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '6px 12px',
                  cursor: 'pointer',
                  fontWeight: 800,
                  color: '#4b5563'
                }}
              >
                إغلاق ✕
              </button>
            </div>

            {/* Surah Category Filter Tabs */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#374151', marginBottom: '8px' }}>
                قسم السور:
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[
                  { id: 'juz_30', label: '🌟 جزء عم (٣٧ سورة)' },
                  { id: 'short', label: '📖 قصار السور' },
                  { id: 'juz_29', label: '✨ جزء تبارك' },
                  { id: 'all', label: '📚 كامل المصحف (١١٤ سورة)' }
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSurahCategory(cat.id)}
                    style={{
                      padding: '7px 14px',
                      borderRadius: '12px',
                      background: surahCategory === cat.id ? '#059669' : '#f0fdf4',
                      color: surahCategory === cat.id ? '#ffffff' : '#065f46',
                      border: surahCategory === cat.id ? '1.5px solid #059669' : '1.5px solid #a7f3d0',
                      fontWeight: 800,
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input for Surahs */}
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="ابحث باسم السورة (مثلاً: الملك، الفاتحة، الكهف...)"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 38px',
                  borderRadius: '14px',
                  border: '1.5px solid #d1d5db',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <Search size={18} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            </div>

            {/* Surah Selector Dropdown */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#374151', marginBottom: '8px' }}>
                اختر السورة:
              </label>
              <select
                value={selectedSurahId}
                onChange={e => setSelectedSurahId(parseInt(e.target.value, 10))}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '14px',
                  border: '2px solid #059669',
                  background: '#ffffff',
                  fontSize: '15px',
                  fontWeight: 800,
                  color: '#064e3b',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {availableSurahs.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.id}. {s.name} ({s.ayahsCount} آية) - {s.englishName}
                  </option>
                ))}
              </select>
            </div>

            {/* Verse Range Inputs: "من آية كذا إلى آية كذا" */}
            <div
              style={{
                background: '#f0fdf4',
                padding: '16px',
                borderRadius: '18px',
                border: '1.5px solid #a7f3d0'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '14px', fontWeight: 900, color: '#065f46' }}>
                  🎯 تحديد نطاق الآيات:
                </span>
                <span style={{ fontSize: '12px', color: '#047857', fontWeight: 700 }}>
                  عدد آيات السورة: {currentSurahData?.ayahsCount || 0}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '120px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#065f46', marginBottom: '6px' }}>
                    من آية رقم:
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={currentSurahData?.ayahsCount || 1}
                    value={fromAyah}
                    onChange={e => {
                      const val = parseInt(e.target.value, 10) || 1
                      setFromAyah(Math.max(1, Math.min(val, currentSurahData?.ayahsCount || 1)))
                      if (val > toAyah) setToAyah(val)
                    }}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '12px',
                      border: '1.5px solid #6ee7b7',
                      fontSize: '15px',
                      fontWeight: 800,
                      textAlign: 'center',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ flex: 1, minWidth: '120px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#065f46', marginBottom: '6px' }}>
                    إلى آية رقم:
                  </label>
                  <input
                    type="number"
                    min={fromAyah}
                    max={currentSurahData?.ayahsCount || 1}
                    value={toAyah}
                    onChange={e => {
                      const val = parseInt(e.target.value, 10) || fromAyah
                      setToAyah(Math.max(fromAyah, Math.min(val, currentSurahData?.ayahsCount || 1)))
                    }}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '12px',
                      border: '1.5px solid #6ee7b7',
                      fontSize: '15px',
                      fontWeight: 800,
                      textAlign: 'center',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Quick Presets Buttons */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '14px' }}>
                <button
                  type="button"
                  onClick={setRangeFirstFive}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '10px',
                    background: '#ffffff',
                    border: '1px solid #10b981',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#065f46',
                    cursor: 'pointer'
                  }}
                >
                  أول ٥ آيات
                </button>
                <button
                  type="button"
                  onClick={setRangeFullSurah}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '10px',
                    background: '#ffffff',
                    border: '1px solid #10b981',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#065f46',
                    cursor: 'pointer'
                  }}
                >
                  كامل السورة
                </button>
              </div>

              {/* Range Summary */}
              <div style={{ marginTop: '12px', fontSize: '13px', fontWeight: 800, color: '#064e3b' }}>
                📌 الورد المختار: {toAyah - fromAyah + 1} آيات ({fromAyah} إلى {toAyah})
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={handleApplyRangeAndStart}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #059669, #10b981)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 900,
                fontSize: '16px',
                cursor: 'pointer',
                boxShadow: '0 8px 20px rgba(5, 150, 105, 0.25)',
                transition: 'all 0.2s'
              }}
            >
              🚀 ابدأ النشاط بهذا النطاق
            </button>
          </div>
        </div>
      )}

      {/* ── STYLES & ANIMATIONS ── */}
      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(0) scale(0.6); opacity: 1; }
          100% { transform: translateY(-130px) scale(1.3); opacity: 0; }
        }
        @keyframes bounceIn {
          0% { transform: scale(0.7); opacity: 0; }
          60% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
      `}</style>
    </div>
  )
}

export default function QuranWordsPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>جاري التحميل...</div>}>
      <QuranWordsGame />
    </Suspense>
  )
}
