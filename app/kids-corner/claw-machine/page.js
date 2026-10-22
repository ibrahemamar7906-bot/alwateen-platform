'use client'

import React, { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowRight,
  ArrowLeft,
  Volume2,
  VolumeX,
  Sparkles,
  RotateCcw,
  Languages,
  Plus,
  Trophy,
  ChevronRight
} from 'lucide-react'
import { speakWhenReady, cancelTTS } from '../../../utils/tts'
import { getInfiniteClawWord } from '../../utils/infiniteGameGenerator'
import { loadCustomGameWords } from '../../utils/customGameStore'
import TeacherGameManagerModal from '../../components/TeacherGameManagerModal'

// Arcade Sound Synthesizer
class ClawSfx {
  constructor() {
    this.ctx = null
    this.muted = false
  }
  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (AudioCtx) this.ctx = new AudioCtx()
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
  }

  // Motor glide whir
  playMotor() {
    if (this.muted) return
    this.init()
    if (!this.ctx) return
    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(240, now)
    osc.frequency.linearRampToValueAtTime(260, now + 0.35)
    gain.gain.setValueAtTime(0.12, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4)
    osc.connect(gain)
    gain.connect(this.ctx.destination)
    osc.start(now)
    osc.stop(now + 0.4)
  }

  // Claw drop & grab click
  playGrab() {
    if (this.muted) return
    this.init()
    if (!this.ctx) return
    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(520, now)
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.12)
    gain.gain.setValueAtTime(0.4, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12)
    osc.connect(gain)
    gain.connect(this.ctx.destination)
    osc.start(now)
    osc.stop(now + 0.12)
  }

  // Arcade Fanfare
  playFanfare() {
    if (this.muted) return
    this.init()
    if (!this.ctx) return
    const notes = [440, 554, 659, 880]
    notes.forEach((f, i) => {
      const now = this.ctx.currentTime + i * 0.08
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(f, now)
      gain.gain.setValueAtTime(0.3, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3)
      osc.connect(gain)
      gain.connect(this.ctx.destination)
      osc.start(now)
      osc.stop(now + 0.35)
    })
  }
}

const clawAudio = new ClawSfx()

const CLAW_WORDS_EN = [
  { id: 'dot', word: 'dot', missingIdx: 2, letters: ['d', 'o', 't'], emoji: '🔴', soundTarget: 't' },
  { id: 'cat', word: 'cat', missingIdx: 2, letters: ['c', 'a', 't'], emoji: '🐱', soundTarget: 't' },
  { id: 'bat', word: 'bat', missingIdx: 0, letters: ['b', 'a', 't'], emoji: '🦇', soundTarget: 'b' },
  { id: 'dog', word: 'dog', missingIdx: 2, letters: ['d', 'o', 'g'], emoji: '🐶', soundTarget: 'g' },
  { id: 'sun', word: 'sun', missingIdx: 1, letters: ['s', 'u', 'n'], emoji: '☀️', soundTarget: 'u' },
  { id: 'pig', word: 'pig', missingIdx: 2, letters: ['p', 'i', 'g'], emoji: '🐷', soundTarget: 'g' },
  { id: 'fox', word: 'fox', missingIdx: 2, letters: ['f', 'o', 'x'], emoji: '🦊', soundTarget: 'x' },
  { id: 'hat', word: 'hat', missingIdx: 0, letters: ['h', 'a', 't'], emoji: '🎩', soundTarget: 'h' }
]

const CLAW_WORDS_AR = [
  { id: 'asad', word: 'أَسَد', missingIdx: 2, letters: ['أَ', 'سَ', 'د'], emoji: '🦁', soundTarget: 'د' },
  { id: 'qalam', word: 'قَلَم', missingIdx: 2, letters: ['قَ', 'لَ', 'م'], emoji: '✏️', soundTarget: 'م' },
  { id: 'jamal', word: 'جَمَل', missingIdx: 1, letters: ['جَ', 'مَ', 'ل'], emoji: '🐪', soundTarget: 'مَ' },
  { id: 'shams', word: 'شَمْس', missingIdx: 2, letters: ['شَ', 'مْ', 'س'], emoji: '☀️', soundTarget: 'س' },
  { id: 'kataba', word: 'كَتَب', missingIdx: 1, letters: ['كَ', 'تَ', 'ب'], emoji: '✍️', soundTarget: 'تَ' }
]

function ClawMachineGame() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialSubject = searchParams.get('subject') || 'english'

  const [lang, setLang] = useState(initialSubject === 'arabic' ? 'arabic' : 'english')
  const [customWords, setCustomWords] = useState(() => loadCustomGameWords(initialSubject === 'arabic' ? 'arabic' : 'english'))
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [showTeacherModal, setShowTeacherModal] = useState(false)

  // Infinite Claw Word Generator + Teacher Custom Words
  const currentItem = React.useMemo(() => {
    if (customWords && currentIndex < customWords.length) {
      return customWords[currentIndex]
    }
    return getInfiniteClawWord(lang, currentIndex - (customWords ? customWords.length : 0))
  }, [lang, currentIndex, customWords])

  // Sync with Teacher Game Store
  useEffect(() => {
    const handleWordsUpdate = (e) => {
      const updated = e.detail?.words || loadCustomGameWords(lang)
      setCustomWords(updated)
      setCurrentIndex(0)
      resetRound()
    }
    setCustomWords(loadCustomGameWords(lang))
    window.addEventListener('customGameWordsUpdated', handleWordsUpdate)
    return () => window.removeEventListener('customGameWordsUpdated', handleWordsUpdate)
  }, [lang])

  // Claw animation states: 'idle', 'moving-to-key', 'grabbing', 'moving-to-slot', 'dropping', 'done'
  const [clawState, setClawState] = useState('idle')
  const [clawX, setClawX] = useState(50) // percentage
  const [clawY, setClawY] = useState(0) // px down
  const [carriedLetter, setCarriedLetter] = useState(null)
  const [isCompleted, setIsCompleted] = useState(false)
  const [muted, setMuted] = useState(false)

  // Keyboard options: A to Z or arabic alphabet
  const englishKeys = 'abcdefghijklmnopqrstuvwxyz'.split('')
  const arabicKeys = ['أ', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'ه', 'و', 'ي']
  const keyboard = lang === 'arabic' ? arabicKeys : englishKeys

  useEffect(() => {
    const list = lang === 'arabic' ? CLAW_WORDS_AR : CLAW_WORDS_EN
    setWordList(list)
    setCurrentIndex(0)
    resetRound()
  }, [lang])

  const resetRound = () => {
    setClawState('idle')
    setClawX(50)
    setClawY(0)
    setCarriedLetter(null)
    setIsCompleted(false)
    cancelTTS()
  }

  // Handle letter clicked
  const handleKeyClick = (letter) => {
    if (clawState !== 'idle' || isCompleted) return

    const correctLetter = currentItem.soundTarget.replace(/[\u064B-\u0652]/g, '') // strip harakat for comparison
    const clickedLetter = letter.replace(/[\u064B-\u0652]/g, '')

    if (clickedLetter.toLowerCase() === correctLetter.toLowerCase()) {
      // 1. Move claw to key
      clawAudio.playMotor()
      setClawState('moving-to-key')
      setClawX(70)

      setTimeout(() => {
        // 2. Drop down to grab
        clawAudio.playGrab()
        setClawState('grabbing')
        setClawY(110)
        setCarriedLetter(currentItem.soundTarget)

        setTimeout(() => {
          // 3. Lift up and move to word slot
          clawAudio.playMotor()
          setClawY(0)
          setClawState('moving-to-slot')
          setClawX(35)

          setTimeout(() => {
            // 4. Drop into slot
            clawAudio.playGrab()
            setClawY(50)
            setClawState('dropping')

            setTimeout(() => {
              // 5. Complete!
              setClawY(0)
              setCarriedLetter(null)
              setClawState('done')
              setIsCompleted(true)
              setScore(s => s + 1)
              clawAudio.playFanfare()

              const voice = lang === 'arabic' ? 'Arabic Male' : 'US English Female'
              speakWhenReady(currentItem.word, voice)
            }, 500)
          }, 600)
        }, 500)
      }, 500)
    } else {
      // Wrong letter sound
      clawAudio.playGrab()
      const voice = lang === 'arabic' ? 'Arabic Male' : 'US English Female'
      speakWhenReady(letter, voice)
    }
  }

  // Next word (Infinite Generator)
  const nextWord = () => {
    setCurrentIndex(prev => prev + 1)
    resetRound()
  }

  // Prev word
  const prevWord = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1))
    resetRound()
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        width: '100%',
        background: 'linear-gradient(180deg, #0284c7 0%, #0369a1 40%, #075985 100%)',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontFamily: 'Tajawal, sans-serif',
        userSelect: 'none',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* --- TOP CONTROL BAR --- */}
      <header
        style={{
          width: '100%',
          maxWidth: '1100px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 10,
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => router.back()}
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.18)',
              border: '1px solid rgba(255,255,255,0.25)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <ArrowLeft size={22} />
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '24px' }}>🕹️</span>
              <h1 style={{ margin: 0, fontSize: 'clamp(18px, 2.8vw, 24px)', fontWeight: 'bold' }}>
                {lang === 'english' ? 'Claw Machine Spelling' : 'لعبة مخلب صيد الحروف'}
              </h1>
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: '#bae6fd' }}>
              {lang === 'english' ? 'Choose the missing letter and watch the claw grab it!' : 'اختر الحرف الناقص وشاهد المخلب يسحبه لمكانه!'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setLang(l => (l === 'english' ? 'arabic' : 'english'))}
            style={{
              padding: '8px 14px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.18)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <Languages size={17} />
            <span>{lang === 'english' ? 'العربية' : 'English'}</span>
          </button>

          <button
            onClick={() => setShowTeacherModal(true)}
            style={{
              padding: '8px 14px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              border: 'none',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.4)'
            }}
            title="إدارة كلمات المعلم والتوليد بالذكاء الاصطناعي"
          >
            <Sparkles size={16} />
            <span>إعدادات وأسئلة المعلم / ذكاء اصطناعي 🤖</span>
            {customWords && customWords.length > 0 && (
              <span style={{ background: '#38bdf8', color: '#0369a1', padding: '1px 7px', borderRadius: '10px', fontSize: '11px', fontWeight: 800 }}>
                {customWords.length}
              </span>
            )}
          </button>

          <div
            style={{
              background: '#ffffff',
              color: '#0369a1',
              padding: '6px 14px',
              borderRadius: '99px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px'
            }}
          >
            <Trophy size={16} style={{ color: '#f59e0b' }} />
            <span>النقاط: {score}</span>
          </div>

          <button
            onClick={() => {
              setMuted(!muted)
              clawAudio.muted = !muted
            }}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.18)',
              border: 'none',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        </div>
      </header>

      {/* --- ARCADE CLAW MACHINE STAGE --- */}
      <main
        style={{
          width: '100%',
          maxWidth: '900px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
          padding: '12px 16px',
          flex: 1,
          justifyContent: 'center',
          position: 'relative'
        }}
      >
        {/* Overhead Crane Rail */}
        <div
          style={{
            width: '100%',
            maxWidth: '680px',
            height: '14px',
            background: '#334155',
            borderRadius: '7px',
            position: 'relative',
            boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
            border: '2px solid #64748b'
          }}
        >
          {/* Animated Motorized Crane Cart */}
          <div
            style={{
              position: 'absolute',
              top: '-10px',
              left: `${clawX}%`,
              transform: 'translateX(-50%)',
              transition: 'left 0.45s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              zIndex: 10
            }}
          >
            {/* Crane Base Box */}
            <div
              style={{
                width: '44px',
                height: '24px',
                borderRadius: '8px',
                background: '#f59e0b',
                border: '2px solid #d97706',
                boxShadow: '0 4px 8px rgba(0,0,0,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: 'bold',
                color: '#78350f'
              }}
            >
              🕹️
            </div>

            {/* Crane Cable */}
            <div
              style={{
                width: '3px',
                height: `${40 + clawY}px`,
                background: '#cbd5e1',
                transition: 'height 0.4s ease'
              }}
            />

            {/* Claw Head */}
            <div
              style={{
                width: '48px',
                height: '32px',
                background: '#ef4444',
                borderRadius: '10px 10px 16px 16px',
                border: '2px solid #b91c1c',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 12px rgba(0,0,0,0.3)',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '18px'
              }}
            >
              {carriedLetter || '🪝'}
            </div>
          </div>
        </div>

        {/* Target Picture & Word Blanks Box */}
        <div
          style={{
            width: '100%',
            maxWidth: '680px',
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '26px',
            padding: '24px 30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            border: '4px solid #38bdf8'
          }}
        >
          {/* Target Illustration */}
          <div
            onClick={() => {
              const voice = lang === 'arabic' ? 'Arabic Male' : 'US English Female'
              speakWhenReady(currentItem.word, voice)
            }}
            style={{
              width: '110px',
              height: '110px',
              borderRadius: '24px',
              background: '#f0f9ff',
              border: '3px solid #7dd3fc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '60px',
              cursor: 'pointer',
              boxShadow: '0 8px 16px rgba(0,0,0,0.08)'
            }}
            title="اضغط للاستماع"
          >
            {currentItem.emoji}
          </div>

          {/* Letter Slots */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {currentItem.letters.map((letter, idx) => {
              const isMissing = idx === currentItem.missingIdx
              const isRevealed = !isMissing || isCompleted

              return (
                <div
                  key={idx}
                  style={{
                    width: 'clamp(60px, 12vw, 85px)',
                    height: 'clamp(70px, 14vw, 95px)',
                    background: isRevealed ? '#ffffff' : '#e2e8f0',
                    border: isMissing
                      ? isCompleted
                        ? '3.5px solid #10b981'
                        : '3.5px dashed #0284c7'
                      : '3px solid #cbd5e1',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: isRevealed ? '0 6px 14px rgba(0,0,0,0.08)' : 'none',
                    animation: isCompleted && isMissing ? 'popIn 0.3s ease' : 'none'
                  }}
                >
                  <span
                    style={{
                      fontSize: 'clamp(38px, 8vw, 56px)',
                      fontWeight: 'bold',
                      color: isMissing ? (isCompleted ? '#059669' : 'transparent') : '#0f172a'
                    }}
                  >
                    {isRevealed ? letter : '_'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Keyboard / Letter Choices */}
        <div
          style={{
            width: '100%',
            maxWidth: '720px',
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '16px',
            border: '1.5px solid rgba(255,255,255,0.25)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            justifyContent: 'center'
          }}
        >
          {keyboard.map((k) => (
            <button
              key={k}
              onClick={() => handleKeyClick(k)}
              disabled={clawState !== 'idle' || isCompleted}
              style={{
                width: 'clamp(36px, 7vw, 44px)',
                height: 'clamp(40px, 8vw, 48px)',
                borderRadius: '10px',
                background: '#ffffff',
                border: '2px solid #cbd5e1',
                color: '#0f172a',
                fontSize: '20px',
                fontWeight: 'bold',
                cursor: clawState === 'idle' && !isCompleted ? 'pointer' : 'default',
                boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                transition: 'transform 0.1s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                if (clawState === 'idle') e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              {k}
            </button>
          ))}
        </div>
      </main>

      {/* --- FOOTER CONTROLS --- */}
      <footer
        style={{
          width: '100%',
          maxWidth: '1100px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 10
        }}
      >
        <button
          onClick={resetRound}
          style={{
            padding: '10px 18px',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.18)',
            border: 'none',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer'
          }}
        >
          <RotateCcw size={18} />
          <span>إعادة</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={prevWord}
            style={{
              padding: '10px 16px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.18)',
              border: 'none',
              color: 'white',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            السابق
          </button>
          <button
            onClick={nextWord}
            style={{
              padding: '10px 22px',
              borderRadius: '12px',
              background: isCompleted ? '#10b981' : '#f59e0b',
              color: 'white',
              border: 'none',
              fontWeight: 'bold',
              fontSize: '15px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 14px rgba(0,0,0,0.2)'
            }}
          >
            <span>الكلمة التالية</span>
            <ChevronRight size={18} />
          </button>
        </div>
      </footer>

      {/* Teacher Game Manager & AI Generator Modal */}
      <TeacherGameManagerModal
        isOpen={showTeacherModal}
        onClose={() => setShowTeacherModal(false)}
        initialMode="words"
        lang={lang}
        onWordsUpdated={(newWords) => {
          setCustomWords(newWords)
          setCurrentIndex(0)
          resetRound()
        }}
      />

      <style>{`
        @keyframes popIn {
          0% { transform: scale(0.5); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

export default function ClawMachinePage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>جاري التحميل...</div>}>
      <ClawMachineGame />
    </Suspense>
  )
}
