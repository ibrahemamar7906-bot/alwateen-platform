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
  X,
  Play,
  Flag,
  ChevronRight
} from 'lucide-react'
import { speakWhenReady, cancelTTS } from '../../../utils/tts'
import { getInfiniteCarWord } from '../../utils/infiniteGameGenerator'
import { loadCustomGameWords } from '../../utils/customGameStore'
import TeacherGameManagerModal from '../../components/TeacherGameManagerModal'

// --- SOUND EFFECTS (Web Audio API) ---
class CarSoundFx {
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

  // Car engine rev/zoom sound
  playEngine() {
    if (this.muted) return
    this.init()
    if (!this.ctx) return
    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(110, now)
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.15)
    gain.gain.setValueAtTime(0.25, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2)
    osc.connect(gain)
    gain.connect(this.ctx.destination)
    osc.start(now)
    osc.stop(now + 0.2)
  }

  // Car Honk (beep beep)
  playHonk() {
    if (this.muted) return
    this.init()
    if (!this.ctx) return
    const now = this.ctx.currentTime
    ;[0, 0.12].forEach((offset) => {
      const osc1 = this.ctx.createOscillator()
      const osc2 = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      osc1.type = 'sine'
      osc2.type = 'sine'
      osc1.frequency.setValueAtTime(440, now + offset)
      osc2.frequency.setValueAtTime(554.37, now + offset)
      gain.gain.setValueAtTime(0.3, now + offset)
      gain.gain.exponentialRampToValueAtTime(0.01, now + offset + 0.08)
      osc1.connect(gain)
      osc2.connect(gain)
      gain.connect(this.ctx.destination)
      osc1.start(now + offset)
      osc2.start(now + offset)
      osc1.stop(now + offset + 0.09)
      osc2.stop(now + offset + 0.09)
    })
  }

  // Curtain Open magic chime
  playCurtain() {
    if (this.muted) return
    this.init()
    if (!this.ctx) return
    const now = this.ctx.currentTime
    const notes = [440, 554, 659, 880]
    notes.forEach((f, i) => {
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(f, now + i * 0.08)
      gain.gain.setValueAtTime(0.3, now + i * 0.08)
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.35)
      osc.connect(gain)
      gain.connect(this.ctx.destination)
      osc.start(now + i * 0.08)
      osc.stop(now + i * 0.08 + 0.4)
    })
  }
}

const carSfx = new CarSoundFx()

const WORDS_ENGLISH = [
  { id: 'cup', word: 'cup', letters: ['c', 'u', 'p'], phonics: ['k', 'ʌ', 'p'], emoji: '☕', category: 'Objects' },
  { id: 'cat', word: 'cat', letters: ['c', 'a', 't'], phonics: ['k', 'æ', 't'], emoji: '🐱', category: 'Animals' },
  { id: 'bat', word: 'bat', letters: ['b', 'a', 't'], phonics: ['b', 'æ', 't'], emoji: '🦇', category: 'Animals' },
  { id: 'dog', word: 'dog', letters: ['d', 'o', 'g'], phonics: ['d', 'ɒ', 'g'], emoji: '🐶', category: 'Animals' },
  { id: 'sun', word: 'sun', letters: ['s', 'u', 'n'], phonics: ['s', 'ʌ', 'n'], emoji: '☀️', category: 'Nature' },
  { id: 'bus', word: 'bus', letters: ['b', 'u', 's'], phonics: ['b', 'ʌ', 's'], emoji: '🚌', category: 'Vehicles' },
  { id: 'pen', word: 'pen', letters: ['p', 'e', 'n'], phonics: ['p', 'e', 'n'], emoji: '🖊️', category: 'Objects' },
  { id: 'fox', word: 'fox', letters: ['f', 'o', 'x'], phonics: ['f', 'ɒ', 'ks'], emoji: '🦊', category: 'Animals' },
  { id: 'hat', word: 'hat', letters: ['h', 'a', 't'], phonics: ['h', 'æ', 't'], emoji: '🎩', category: 'Objects' },
  { id: 'pig', word: 'pig', letters: ['p', 'i', 'g'], phonics: ['p', 'ɪ', 'g'], emoji: '🐷', category: 'Animals' }
]

const WORDS_ARABIC = [
  { id: 'asad', word: 'أَسَد', letters: ['أَ', 'سَ', 'د'], phonics: ['أَ', 'سَ', 'د'], emoji: '🦁', category: 'حيوانات' },
  { id: 'qalam', word: 'قَلَم', letters: ['قَ', 'لَ', 'م'], phonics: ['قَ', 'لَ', 'م'], emoji: '✏️', category: 'أدوات' },
  { id: 'jamal', word: 'جَمَل', letters: ['جَ', 'مَ', 'ل'], phonics: ['جَ', 'مَ', 'ل'], emoji: '🐪', category: 'حيوانات' },
  { id: 'shams', word: 'شَمْس', letters: ['شَ', 'مْ', 'س'], phonics: ['شَ', 'مْ', 'س'], emoji: '☀️', category: 'طبيعة' },
  { id: 'kataba', word: 'كَتَب', letters: ['كَ', 'تَ', 'ب'], phonics: ['كَ', 'تَ', 'ب'], emoji: '✍️', category: 'أفعال' },
  { id: 'inab', word: 'عِنَب', letters: ['عِ', 'نَ', 'ب'], phonics: ['عِ', 'نَ', 'ب'], emoji: '🍇', category: 'فواكه' }
]

function CarBlendingGame() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialSubject = searchParams.get('subject') || 'english'

  const [lang, setLang] = useState(initialSubject === 'arabic' ? 'arabic' : 'english')
  const [customWords, setCustomWords] = useState(() => loadCustomGameWords(initialSubject === 'arabic' ? 'arabic' : 'english'))
  const [currentIndex, setCurrentIndex] = useState(0)

  // Infinite Word Generator
  const currentItem = React.useMemo(() => {
    if (customWords && currentIndex < customWords.length) {
      return customWords[currentIndex]
    }
    return getInfiniteCarWord(lang, currentIndex - (customWords ? customWords.length : 0))
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

  // Car progress: 0 (start), 1 (under letter 1), 2 (under letter 2), 3 (under letter 3 / finish line)
  const [carStep, setCarStep] = useState(0)
  const [isCurtainOpen, setIsCurtainOpen] = useState(false)
  const [muted, setMuted] = useState(false)

  // Teacher custom word
  const [showCustomModal, setShowCustomModal] = useState(false)
  const [customWord, setCustomWord] = useState('')
  const [customEmoji, setCustomEmoji] = useState('🚗')

  useEffect(() => {
    setCurrentIndex(0)
    resetRound()
  }, [lang])

  const resetRound = () => {
    setCarStep(0)
    setIsCurtainOpen(false)
    cancelTTS()
  }

  // Advance car to next step
  const advanceCar = () => {
    const totalLetters = currentItem.letters.length
    if (carStep < totalLetters) {
      const nextStep = carStep + 1
      setCarStep(nextStep)
      carSfx.playEngine()

      // Speak phonics sound of the letter the car is under
      const letterIndex = nextStep - 1
      const sound = currentItem.phonics[letterIndex] || currentItem.letters[letterIndex]
      const voice = lang === 'arabic' ? 'Arabic Male' : 'US English Female'
      speakWhenReady(sound, voice, { rate: 0.85 })

      // If reached the finish line
      if (nextStep === totalLetters) {
        setTimeout(() => {
          carSfx.playHonk()
        }, 500)
      }
    }
  }

  // Click specific letter directly
  const jumpToLetter = (idx) => {
    setCarStep(idx + 1)
    carSfx.playEngine()
    const sound = currentItem.phonics[idx] || currentItem.letters[idx]
    const voice = lang === 'arabic' ? 'Arabic Male' : 'US English Female'
    speakWhenReady(sound, voice, { rate: 0.85 })
    if (idx + 1 === currentItem.letters.length) {
      setTimeout(() => carSfx.playHonk(), 500)
    }
  }

  // Reveal Curtain
  const handleReveal = () => {
    setIsCurtainOpen(true)
    carSfx.playCurtain()
    setTimeout(() => {
      const voice = lang === 'arabic' ? 'Arabic Male' : 'US English Female'
      speakWhenReady(currentItem.word, voice, { rate: 0.9 })
    }, 400)
  }

  // Next Word (Infinite Generator)
  const nextWord = () => {
    setCurrentIndex(prev => prev + 1)
    resetRound()
  }

  // Prev Word
  const prevWord = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1))
    resetRound()
  }

  // Teacher Custom Word submit
  const handleAddCustomWord = (e) => {
    e.preventDefault()
    const trimmed = customWord.trim()
    if (!trimmed) return
    const letters = trimmed.split('')
    const newItem = {
      id: `custom-${Date.now()}`,
      word: trimmed,
      letters: letters,
      phonics: letters,
      emoji: customEmoji || '🚗',
      category: 'مخصص'
    }
    setCustomWords(prev => [newItem, ...prev])
    setCurrentIndex(0)
    resetRound()
    setShowCustomModal(false)
    setCustomWord('')
  }

  // Total letters for layout
  const totalLetters = currentItem.letters.length
  const isFinished = carStep >= totalLetters

  // Calculate car position percentage on road: 0% to 88%
  const carLeftPercent = carStep === 0 ? 4 : carStep === 1 ? 25 : carStep === 2 ? 55 : 85

  return (
    <div
      style={{
        minHeight: '100dvh',
        width: '100%',
        background: 'linear-gradient(180deg, #1e1b4b 0%, #312e81 35%, #4c1d95 70%, #581c87 100%)',
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
              background: 'rgba(255,255,255,0.15)',
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
              <span style={{ fontSize: '24px' }}>🚗</span>
              <h1 style={{ margin: 0, fontSize: 'clamp(18px, 2.8vw, 24px)', fontWeight: 'bold' }}>
                {lang === 'english' ? 'Car Blending Track' : 'سباق سيارة دمج الكلمات'}
              </h1>
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: '#cbd5e1' }}>
              {lang === 'english' ? 'Slide under the word and read it aloud!' : 'حرّك السيارة تحت الحروف لتنطق الأصوات وتدمج الكلمة!'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
            onClick={() => setShowCustomModal(true)}
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

          <button
            onClick={() => {
              setMuted(!muted)
              carSfx.muted = !muted
            }}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.25)',
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

      {/* --- STAGE BANNER PROMPT --- */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.12)',
          backdropFilter: 'blur(10px)',
          padding: '8px 24px',
          borderRadius: '99px',
          border: '1px solid rgba(255,255,255,0.2)',
          fontSize: '16px',
          fontWeight: 'bold',
          color: '#fef08a',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
        }}
      >
        {lang === 'english' ? 'Slide under the word and read it aloud.' : 'حرّك السيارة تحت الحروف واقرأ بصوت واضح'}
      </div>

      {/* --- MAIN PLAY AREA --- */}
      <main
        style={{
          width: '100%',
          maxWidth: '820px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
          padding: '10px 16px',
          flex: 1,
          justifyContent: 'center'
        }}
      >
        {/* --- THEATER STAGE / VELVET CURTAIN BOX --- */}
        <div
          style={{
            width: 'clamp(260px, 45vw, 360px)',
            height: 'clamp(180px, 32vw, 240px)',
            background: '#ffffff',
            borderRadius: '24px',
            border: '6px solid #fbbf24',
            boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {/* Revealed Picture inside */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              animation: isCurtainOpen ? 'popIn 0.4s ease' : 'none'
            }}
          >
            <span style={{ fontSize: 'clamp(72px, 15vw, 105px)', lineHeight: 1 }}>{currentItem.emoji}</span>
            <button
              onClick={() => {
                const voice = lang === 'arabic' ? 'Arabic Male' : 'US English Female'
                speakWhenReady(currentItem.word, voice)
              }}
              style={{
                position: 'absolute',
                bottom: '12px',
                right: '12px',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#eff6ff',
                border: 'none',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <Volume2 size={20} />
            </button>
          </div>

          {/* Velvet Curtains (Left & Right halves) */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              width: '50%',
              background: 'linear-gradient(90deg, #9d174d 0%, #db2777 50%, #be185d 100%)',
              borderRight: '2px solid #831843',
              transform: isCurtainOpen ? 'translateX(-100%)' : 'translateX(0)',
              transition: 'transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)',
              boxShadow: 'inset 0 0 20px rgba(0,0,0,0.4)',
              zIndex: 2
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              right: 0,
              width: '50%',
              background: 'linear-gradient(270deg, #9d174d 0%, #db2777 50%, #be185d 100%)',
              borderLeft: '2px solid #831843',
              transform: isCurtainOpen ? 'translateX(100%)' : 'translateX(0)',
              transition: 'transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)',
              boxShadow: 'inset 0 0 20px rgba(0,0,0,0.4)',
              zIndex: 2
            }}
          />

          {/* Mystery ? Badge on Curtains */}
          {!isCurtainOpen && (
            <div
              style={{
                position: 'absolute',
                zIndex: 3,
                fontSize: '52px',
                fontWeight: 'bold',
                color: '#fef08a',
                textShadow: '0 4px 12px rgba(0,0,0,0.5)',
                animation: 'pulse 1.5s infinite'
              }}
            >
              ?
            </div>
          )}
        </div>

        {/* --- REVEAL BUTTON (Appears when car finishes the word!) --- */}
        {isFinished && !isCurtainOpen && (
          <button
            onClick={handleReveal}
            style={{
              padding: '12px 28px',
              borderRadius: '99px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              border: '2px solid #a7f3d0',
              fontSize: '17px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.45)',
              animation: 'bounce 0.8s infinite'
            }}
          >
            <Sparkles size={22} />
            <span>{lang === 'english' ? 'I read it! Reveal! ✨' : 'قرأت الكلمة! افتح الستار! ✨'}</span>
          </button>
        )}

        {/* --- LETTER TILES TRACK --- */}
        <div
          style={{
            width: '100%',
            maxWidth: '560px',
            background: 'rgba(254, 215, 170, 0.95)',
            borderRadius: '24px',
            padding: '18px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            boxShadow: '0 12px 30px rgba(0,0,0,0.25)',
            border: '3px solid #fb923c'
          }}
        >
          {currentItem.letters.map((letter, idx) => {
            const isHighlighted = carStep === idx + 1
            const hasPassed = carStep > idx + 1

            return (
              <div
                key={idx}
                onClick={() => jumpToLetter(idx)}
                style={{
                  width: 'clamp(70px, 16vw, 100px)',
                  height: 'clamp(70px, 16vw, 100px)',
                  background: isHighlighted ? '#fde047' : hasPassed ? '#fed7aa' : 'transparent',
                  borderRadius: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transform: isHighlighted ? 'scale(1.12)' : 'scale(1)',
                  transition: 'all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
                  boxShadow: isHighlighted ? '0 0 25px #fde047' : 'none'
                }}
              >
                <span
                  style={{
                    fontSize: 'clamp(44px, 10vw, 68px)',
                    fontWeight: '900',
                    color: isHighlighted ? '#1e1b4b' : '#312e81',
                    lineHeight: 1
                  }}
                >
                  {letter}
                </span>
              </div>
            )
          })}
        </div>

        {/* --- ROAD TRACK WITH CAR & FINISH FLAG --- */}
        <div
          style={{
            width: '100%',
            maxWidth: '560px',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          {/* The Asphalt Road */}
          <div
            style={{
              width: '100%',
              height: '52px',
              background: '#334155',
              borderRadius: '26px',
              border: '3px solid #64748b',
              position: 'relative',
              boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {/* White Dashed Center Line */}
            <div
              style={{
                width: '84%',
                height: '0px',
                borderTop: '3px dashed #f8fafc',
                margin: '0 auto',
                opacity: 0.65
              }}
            />

            {/* Finish Line Checkered Flag */}
            <div
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'repeating-conic-gradient(#000 0% 25%, #fff 0% 50%) 50% / 10px 10px',
                border: '2px solid #ffffff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="خط النهاية"
            >
              🏁
            </div>

            {/* Draggable / Clickable Moving Sports Car 🚗 */}
            <div
              onClick={advanceCar}
              style={{
                position: 'absolute',
                left: `${carLeftPercent}%`,
                transform: 'translate(-50%, -50%)',
                top: '50%',
                transition: 'left 0.35s cubic-bezier(0.2, 0.8, 0.3, 1)',
                cursor: 'pointer',
                filter: 'drop-shadow(0 6px 8px rgba(0,0,0,0.4))'
              }}
              title="اضغط لتحريك السيارة إلى الحرف التالي"
            >
              <div
                style={{
                  width: '54px',
                  height: '34px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
                  border: '2px solid #fca5a5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  transform: 'scaleX(-1)' // facing right
                }}
              >
                🏎️
              </div>
            </div>
          </div>

          {/* Drive Helper Button */}
          <button
            onClick={advanceCar}
            style={{
              marginTop: '12px',
              padding: '8px 20px',
              borderRadius: '99px',
              background: '#fbbf24',
              color: '#78350f',
              border: 'none',
              fontWeight: 'bold',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(251, 191, 36, 0.35)'
            }}
          >
            <span>حرّك السيارة 🚗💨</span>
          </button>
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
          zIndex: 10,
          gap: '12px'
        }}
      >
        <button
          onClick={resetRound}
          style={{
            padding: '10px 18px',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.25)',
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
          <span>إعادة المحاولة</span>
        </button>

        {/* Infinite Mode Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.18)', padding: '6px 16px', borderRadius: '99px', border: '1px solid rgba(255,255,255,0.3)', fontWeight: 800, fontSize: '13px' }}>
          <span style={{ color: '#fbbf24' }}>♾️ الوضع اللانهائي</span>
          <span>•</span>
          <span>الكلمة {currentIndex + 1} ({currentItem.category})</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={prevWord}
            style={{
              padding: '10px 16px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.25)',
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
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              fontWeight: 'bold',
              fontSize: '15px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)'
            }}
          >
            <span>الكلمة التالية</span>
            <ChevronRight size={18} />
          </button>
        </div>
      </footer>

      {/* --- TEACHER GAME MANAGER & AI MODAL --- */}
      <TeacherGameManagerModal
        isOpen={showCustomModal}
        onClose={() => setShowCustomModal(false)}
        initialMode="words"
        lang={lang}
        onWordsUpdated={(newWords) => {
          setCustomWords(newWords)
          setCurrentIndex(0)
          resetRound()
        }}
      />

      {/* --- STYLES --- */}
      <style>{`
        @keyframes popIn {
          0% { transform: scale(0.5); opacity: 0; }
          70% { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

export default function CarBlendingPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>جاري تحميل اللعبة...</div>}>
      <CarBlendingGame />
    </Suspense>
  )
}
