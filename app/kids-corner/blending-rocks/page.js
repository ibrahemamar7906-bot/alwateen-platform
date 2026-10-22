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
  Plus,
  Play,
  CheckCircle2,
  Trophy,
  Maximize2,
  Minimize2,
  Languages,
  X
} from 'lucide-react'
import { speakWhenReady, cancelTTS } from '../../../utils/tts'
import { getInfiniteBlendingRockWord } from '../../utils/infiniteGameGenerator'
import { loadCustomGameWords } from '../../utils/customGameStore'
import TeacherGameManagerModal from '../../components/TeacherGameManagerModal'

// --- SOUND SYNTHESIS ENGINE (Web Audio API - zero latency & 100% offline) ---
class SoundFx {
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

  // Stone tap hit (clink)
  playTap() {
    if (this.muted) return
    this.init()
    if (!this.ctx) return

    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(320 + Math.random() * 80, now)
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.08)

    gain.gain.setValueAtTime(0.4, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08)

    osc.connect(gain)
    gain.connect(this.ctx.destination)

    osc.start(now)
    osc.stop(now + 0.08)
  }

  // Rock Crack (sharper crunch)
  playCrack() {
    if (this.muted) return
    this.init()
    if (!this.ctx) return

    const now = this.ctx.currentTime
    // Noise buffer for snap
    const bufferSize = this.ctx.sampleRate * 0.12
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1
    }

    const noise = this.ctx.createBufferSource()
    noise.buffer = buffer

    const filter = this.ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(800, now)
    filter.Q.setValueAtTime(2, now)

    const gain = this.ctx.createGain()
    gain.gain.setValueAtTime(0.6, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12)

    noise.connect(filter)
    filter.connect(gain)
    gain.connect(this.ctx.destination)

    noise.start(now)
  }

  // Rock Smash / Break Explosion
  playSmash() {
    if (this.muted) return
    this.init()
    if (!this.ctx) return

    const now = this.ctx.currentTime
    // Rumble + noise crash
    const bufferSize = this.ctx.sampleRate * 0.35
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.08))
    }

    const noise = this.ctx.createBufferSource()
    noise.buffer = buffer

    const filter = this.ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(600, now)
    filter.frequency.exponentialRampToValueAtTime(80, now + 0.3)

    const gain = this.ctx.createGain()
    gain.gain.setValueAtTime(0.9, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35)

    noise.connect(filter)
    filter.connect(gain)
    gain.connect(this.ctx.destination)

    noise.start(now)

    // Sub-thud
    const osc = this.ctx.createOscillator()
    const oscGain = this.ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(140, now)
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.25)
    oscGain.gain.setValueAtTime(0.7, now)
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.25)
    osc.connect(oscGain)
    oscGain.connect(this.ctx.destination)
    osc.start(now)
    osc.stop(now + 0.25)
  }

  // Victory celebration chime
  playVictory() {
    if (this.muted) return
    this.init()
    if (!this.ctx) return

    const notes = [523.25, 659.25, 783.99, 1046.50] // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const now = this.ctx.currentTime + idx * 0.09
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now)

      gain.gain.setValueAtTime(0.35, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4)

      osc.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start(now)
      osc.stop(now + 0.45)
    })
  }
}

const sfx = new SoundFx()

// --- WORD DATASETS ---
const ENGLISH_WORDS = [
  {
    id: 'bat',
    word: 'bat',
    imageEmoji: '🦇',
    letters: ['b', 'a', 't'],
    phonics: ['b', 'æ', 't'], // or speakable sounds
    pronouncePhonics: ['b', 'a', 't'],
    blend12: 'ba',
    category: 'Animals'
  },
  {
    id: 'cat',
    word: 'cat',
    imageEmoji: '🐱',
    letters: ['c', 'a', 't'],
    phonics: ['k', 'æ', 't'],
    pronouncePhonics: ['k', 'a', 't'],
    blend12: 'ca',
    category: 'Animals'
  },
  {
    id: 'dog',
    word: 'dog',
    imageEmoji: '🐶',
    letters: ['d', 'o', 'g'],
    phonics: ['d', 'ɒ', 'g'],
    pronouncePhonics: ['d', 'o', 'g'],
    blend12: 'do',
    category: 'Animals'
  },
  {
    id: 'sun',
    word: 'sun',
    imageEmoji: '☀️',
    letters: ['s', 'u', 'n'],
    phonics: ['s', 'ʌ', 'n'],
    pronouncePhonics: ['s', 'u', 'n'],
    blend12: 'su',
    category: 'Nature'
  },
  {
    id: 'hat',
    word: 'hat',
    imageEmoji: '🎩',
    letters: ['h', 'a', 't'],
    phonics: ['h', 'æ', 't'],
    pronouncePhonics: ['h', 'a', 't'],
    blend12: 'ha',
    category: 'Objects'
  },
  {
    id: 'fox',
    word: 'fox',
    imageEmoji: '🦊',
    letters: ['f', 'o', 'x'],
    phonics: ['f', 'ɒ', 'ks'],
    pronouncePhonics: ['f', 'o', 'x'],
    blend12: 'fo',
    category: 'Animals'
  },
  {
    id: 'pig',
    word: 'pig',
    imageEmoji: '🐷',
    letters: ['p', 'i', 'g'],
    phonics: ['p', 'ɪ', 'g'],
    pronouncePhonics: ['p', 'i', 'g'],
    blend12: 'pi',
    category: 'Animals'
  },
  {
    id: 'cup',
    word: 'cup',
    imageEmoji: '☕',
    letters: ['c', 'u', 'p'],
    phonics: ['k', 'ʌ', 'p'],
    pronouncePhonics: ['k', 'u', 'p'],
    blend12: 'cu',
    category: 'Objects'
  },
  {
    id: 'bus',
    word: 'bus',
    imageEmoji: '🚌',
    letters: ['b', 'u', 's'],
    phonics: ['b', 'ʌ', 's'],
    pronouncePhonics: ['b', 'u', 's'],
    blend12: 'bu',
    category: 'Vehicles'
  },
  {
    id: 'pen',
    word: 'pen',
    imageEmoji: '🖊️',
    letters: ['p', 'e', 'n'],
    phonics: ['p', 'e', 'n'],
    pronouncePhonics: ['p', 'e', 'n'],
    blend12: 'pe',
    category: 'Objects'
  },
  {
    id: 'bed',
    word: 'bed',
    imageEmoji: '🛏️',
    letters: ['b', 'e', 'd'],
    phonics: ['b', 'e', 'd'],
    pronouncePhonics: ['b', 'e', 'd'],
    blend12: 'be',
    category: 'Home'
  },
  {
    id: 'bug',
    word: 'bug',
    imageEmoji: '🐛',
    letters: ['b', 'u', 'g'],
    phonics: ['b', 'ʌ', 'g'],
    pronouncePhonics: ['b', 'u', 'g'],
    blend12: 'bu',
    category: 'Animals'
  }
]

const ARABIC_WORDS = [
  {
    id: 'asad',
    word: 'أَسَد',
    imageEmoji: '🦁',
    letters: ['أَ', 'سَ', 'د'],
    phonics: ['أَ', 'سَ', 'د'],
    pronouncePhonics: ['أَ', 'سَ', 'د'],
    blend12: 'أَسَ',
    category: 'حيوانات'
  },
  {
    id: 'qalam',
    word: 'قَلَم',
    imageEmoji: '✏️',
    letters: ['قَ', 'لَ', 'م'],
    phonics: ['قَ', 'لَ', 'م'],
    pronouncePhonics: ['قَ', 'لَ', 'م'],
    blend12: 'قَلَ',
    category: 'أدوات'
  },
  {
    id: 'jamal',
    word: 'جَمَل',
    imageEmoji: '🐪',
    letters: ['جَ', 'مَ', 'ل'],
    phonics: ['جَ', 'مَ', 'ل'],
    pronouncePhonics: ['جَ', 'مَ', 'ل'],
    blend12: 'جَمَ',
    category: 'حيوانات'
  },
  {
    id: 'shams',
    word: 'شَمْس',
    imageEmoji: '☀️',
    letters: ['شَ', 'مْ', 'س'],
    phonics: ['شَ', 'مْ', 'س'],
    pronouncePhonics: ['شَ', 'مْ', 'س'],
    blend12: 'شَمْ',
    category: 'طبيعة'
  },
  {
    id: 'kataba',
    word: 'كَتَب',
    imageEmoji: '✍️',
    letters: ['كَ', 'تَ', 'ب'],
    phonics: ['كَ', 'تَ', 'ب'],
    pronouncePhonics: ['كَ', 'تَ', 'ب'],
    blend12: 'كَتَ',
    category: 'أفعال'
  },
  {
    id: 'baqar',
    word: 'بَقَر',
    imageEmoji: '🐄',
    letters: ['بَ', 'قَ', 'ر'],
    phonics: ['بَ', 'قَ', 'ر'],
    pronouncePhonics: ['بَ', 'قَ', 'ر'],
    blend12: 'بَقَ',
    category: 'حيوانات'
  },
  {
    id: 'inab',
    word: 'عِنَب',
    imageEmoji: '🍇',
    letters: ['عِ', 'نَ', 'ب'],
    phonics: ['عِ', 'نَ', 'ب'],
    pronouncePhonics: ['عِ', 'نَ', 'ب'],
    blend12: 'عِنَ',
    category: 'فواكه'
  },
  {
    id: 'najm',
    word: 'نَجْم',
    imageEmoji: '⭐',
    letters: ['نَ', 'جْ', 'م'],
    phonics: ['نَ', 'جْ', 'م'],
    pronouncePhonics: ['نَ', 'جْ', 'م'],
    blend12: 'نَجْ',
    category: 'فضاء'
  }
]

// --- SVG ROCK COMPONENT ---
// Renders chunky textured rock with cracks appearing at hits 1, 2, and shatter animation
function RockSvg({ hitCount, isBig = false, isShattering = false }) {
  // hitCount: 0 = untouched, 1 = slight cracks, 2 = deep cracks, 3 = destroyed
  const w = isBig ? 240 : 130
  const h = isBig ? 190 : 120

  return (
    <div
      style={{
        width: `${w}px`,
        height: `${h}px`,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: hitCount === 1 ? 'rotate(-2deg) scale(0.98)' : hitCount === 2 ? 'rotate(3deg) scale(0.96)' : 'none',
        transition: 'transform 0.1s ease',
        cursor: 'pointer',
        filter: 'drop-shadow(0 12px 16px rgba(0,0,0,0.22))'
      }}
    >
      <svg
        viewBox="0 0 200 160"
        style={{
          width: '100%',
          height: '100%',
          overflow: 'visible'
        }}
      >
        <defs>
          <linearGradient id={isBig ? "rockGradBig" : "rockGrad"} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#94a3b8" />
            <stop offset="45%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>
          <linearGradient id="rockHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#cbd5e1" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#64748b" stopOpacity="0" />
          </linearGradient>
          <filter id="rockShadow" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="2" dy="5" stdDeviation="4" floodColor="#1e293b" floodOpacity="0.35" />
          </filter>
        </defs>

        {/* Rock Base Shape */}
        <path
          d={
            isBig
              ? "M 40,35 Q 85,12 135,18 Q 185,25 190,70 Q 195,125 155,145 Q 105,155 50,145 Q 10,135 15,85 Q 18,50 40,35 Z"
              : "M 30,30 Q 80,15 130,22 Q 175,28 175,65 Q 180,115 145,135 Q 95,145 45,135 Q 15,125 18,75 Q 18,45 30,30 Z"
          }
          fill={isBig ? "url(#rockGradBig)" : "url(#rockGrad)"}
          stroke="#334155"
          strokeWidth="5"
          strokeLinejoin="round"
          filter="url(#rockShadow)"
        />

        {/* Top Rock Highlight / Texture */}
        <path
          d={
            isBig
              ? "M 48,40 Q 88,24 130,26 Q 165,30 172,55 Q 130,48 85,55 Q 52,65 48,40 Z"
              : "M 36,36 Q 78,25 120,28 Q 152,32 158,52 Q 120,46 78,50 Q 42,58 36,36 Z"
          }
          fill="url(#rockHighlight)"
        />

        {/* Moss / Little Foliage detail */}
        <circle cx={isBig ? 45 : 35} cy={isBig ? 125 : 115} r="7" fill="#84cc16" opacity="0.85" />
        <circle cx={isBig ? 55 : 45} cy={isBig ? 130 : 120} r="5" fill="#65a30d" opacity="0.9" />
        <circle cx={isBig ? 150 : 135} cy={isBig ? 130 : 120} r="6" fill="#84cc16" opacity="0.8" />

        {/* Cracks Level 1 */}
        {hitCount >= 1 && (
          <g stroke="#1e293b" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M 85,45 L 98,72 L 88,95 L 105,118" />
            <path d="M 98,72 L 122,80" />
            <path d="M 88,95 L 68,105" />
          </g>
        )}

        {/* Cracks Level 2 (Deeper, radiating everywhere) */}
        {hitCount >= 2 && (
          <g stroke="#0f172a" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M 50,55 L 75,70 L 85,45" />
            <path d="M 122,80 L 155,75 L 170,95" />
            <path d="M 105,118 L 115,142" />
            <path d="M 68,105 L 45,120" />
            <path d="M 98,72 L 95,30" />
          </g>
        )}
      </svg>

      {/* Tap indicator label badge */}
      {hitCount < 3 && (
        <div
          style={{
            position: 'absolute',
            bottom: '-12px',
            background: hitCount === 0 ? '#3b82f6' : hitCount === 1 ? '#f59e0b' : '#ef4444',
            color: 'white',
            fontSize: '11px',
            fontWeight: 'bold',
            padding: '2px 10px',
            borderRadius: '99px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            userSelect: 'none',
            pointerEvents: 'none'
          }}
        >
          <span>{hitCount === 0 ? 'اضغط 🔨' : hitCount === 1 ? 'اكسر 💥' : 'الضربة الأخيرة! ⚡'}</span>
        </div>
      )}
    </div>
  )
}

// --- PARTICLE SMASH EXPLOSION ---
function SmashParticles({ active }) {
  if (!active) return null
  const particles = Array.from({ length: 16 })
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10 }}>
      {particles.map((_, i) => {
        const angle = (i / 16) * 360
        const dist = 60 + Math.random() * 60
        const x = Math.cos((angle * Math.PI) / 180) * dist
        const y = Math.sin((angle * Math.PI) / 180) * dist
        const size = 6 + Math.random() * 10
        const isDust = i % 3 === 0
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: `${size}px`,
              height: `${size}px`,
              background: isDust ? '#cbd5e1' : i % 2 === 0 ? '#64748b' : '#475569',
              borderRadius: isDust ? '50%' : '3px',
              transform: `translate(-50%, -50%)`,
              animation: `particleFly 0.55s cubic-bezier(0.1, 0.8, 0.3, 1) forwards`,
              ['--tx']: `${x}px`,
              ['--ty']: `${y}px`,
              opacity: 0.9
            }}
          />
        )
      })}
    </div>
  )
}

function BlendingRocksGame() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialSubject = searchParams.get('subject') || 'english'

  // State
  const [lang, setLang] = useState(initialSubject === 'arabic' ? 'arabic' : 'english')
  const [customWords, setCustomWords] = useState(() => loadCustomGameWords(initialSubject === 'arabic' ? 'arabic' : 'english'))
  const [currentIndex, setCurrentIndex] = useState(0)

  // Infinite Blending Rock Word Generator
  const currentItem = React.useMemo(() => {
    if (customWords && currentIndex < customWords.length) {
      return customWords[currentIndex]
    }
    return getInfiniteBlendingRockWord(lang, currentIndex - (customWords ? customWords.length : 0))
  }, [lang, currentIndex, customWords])

  // Sync with Teacher Game Store
  useEffect(() => {
    const handleWordsUpdate = (e) => {
      const updated = e.detail?.words || loadCustomGameWords(lang)
      setCustomWords(updated)
      setCurrentIndex(0)
      resetStones()
    }
    setCustomWords(loadCustomGameWords(lang))
    window.addEventListener('customGameWordsUpdated', handleWordsUpdate)
    return () => window.removeEventListener('customGameWordsUpdated', handleWordsUpdate)
  }, [lang])

  // Stone hit counts: lettersHits[0], lettersHits[1], lettersHits[2] -> 0 to 3
  const [lettersHits, setLettersHits] = useState([0, 0, 0])
  const [pictureHits, setPictureHits] = useState(0) // 0 to 3

  // Smashed states
  const [lettersSmashed, setLettersSmashed] = useState([false, false, false])
  const [pictureSmashed, setPictureSmashed] = useState(false)

  // Particle burst flags
  const [burstLetter, setBurstLetter] = useState([false, false, false])
  const [burstPicture, setBurstPicture] = useState(false)

  // Sound Muted state
  const [muted, setMuted] = useState(false)

  // Teacher Custom Word Modal
  const [showCustomModal, setShowCustomModal] = useState(false)
  const [customWordInput, setCustomWordInput] = useState('')
  const [customEmojiInput, setCustomEmojiInput] = useState('🌟')

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false)
  const containerRef = useRef(null)

  // Update list when language changes
  useEffect(() => {
    setCurrentIndex(0)
    resetStones(getInfiniteBlendingRockWord(lang, 0))
  }, [lang])

  // Reset stones whenever current word changes
  const resetStones = (item = currentItem) => {
    const letterCount = item?.letters?.length || 3
    setLettersHits(new Array(letterCount).fill(0))
    setLettersSmashed(new Array(letterCount).fill(false))
    setBurstLetter(new Array(letterCount).fill(false))
    setPictureHits(0)
    setPictureSmashed(false)
    setBurstPicture(false)
    cancelTTS()
  }

  // Handle Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.().catch(() => {})
      setIsFullscreen(true)
    } else {
      document.exitFullscreen?.().catch(() => {})
      setIsFullscreen(false)
    }
  }

  // Hit Letter Stone
  const hitLetterStone = (idx) => {
    if (lettersSmashed[idx]) {
      // Re-play phonics sound
      playLetterSound(idx)
      return
    }

    // Must be sequential? No, or sequential for blending pedagogy
    const newHits = [...lettersHits]
    const cur = newHits[idx]
    if (cur < 2) {
      newHits[idx] = cur + 1
      setLettersHits(newHits)
      sfx.playCrack()
    } else {
      // Smash!
      newHits[idx] = 3
      setLettersHits(newHits)
      sfx.playSmash()

      // trigger particles
      const newBurst = [...burstLetter]
      newBurst[idx] = true
      setBurstLetter(newBurst)
      setTimeout(() => {
        const b = [...burstLetter]
        b[idx] = false
        setBurstLetter(b)
      }, 600)

      const newSmashed = [...lettersSmashed]
      newSmashed[idx] = true
      setLettersSmashed(newSmashed)

      // Speak phonics sound
      playLetterSound(idx)

      // Check if letters 1 & 2 are both smashed to speak blended sound!
      if (idx === 1 && newSmashed[0]) {
        setTimeout(() => {
          if (currentItem.blend12) {
            speakWord(currentItem.blend12)
          }
        }, 1100)
      }
    }
  }

  // Hit Picture Stone
  const hitPictureStone = () => {
    const allLettersSmashed = lettersSmashed.every(Boolean)
    if (!allLettersSmashed) {
      // Prompt user to break the letters first!
      sfx.playTap()
      const msg = lang === 'english' ? 'Break the letter stones first!' : 'اكسر صخور الحروف أولاً يا بطل!'
      speakWord(msg)
      return
    }

    if (pictureSmashed) {
      // Replay full word
      speakWord(currentItem.word)
      return
    }

    if (pictureHits < 2) {
      setPictureHits(prev => prev + 1)
      sfx.playCrack()
    } else {
      // Big Smash!
      setPictureHits(3)
      setPictureSmashed(true)
      sfx.playSmash()

      setBurstPicture(true)
      setTimeout(() => setBurstPicture(false), 700)

      sfx.playVictory()

      // Pronounce full word
      setTimeout(() => {
        speakWord(currentItem.word)
      }, 700)
    }
  }

  // Speak sound of letter
  const playLetterSound = (idx) => {
    if (muted) return
    const sound = currentItem.pronouncePhonics?.[idx] || currentItem.letters[idx]
    const voice = lang === 'arabic' ? 'Arabic Male' : 'US English Female'
    speakWhenReady(sound, voice, { rate: 0.85 })
  }

  // Speak whole word
  const speakWord = (text) => {
    if (muted) return
    const voice = lang === 'arabic' ? 'Arabic Male' : 'US English Female'
    speakWhenReady(text, voice, { rate: 0.9 })
  }

  // Move to next word (Infinite Generator)
  const nextWord = () => {
    const nextIdx = currentIndex + 1
    setCurrentIndex(nextIdx)
    const nextItem = (customWords && nextIdx < customWords.length)
      ? customWords[nextIdx]
      : getInfiniteBlendingRockWord(lang, nextIdx - (customWords ? customWords.length : 0))
    resetStones(nextItem)
  }

  // Move to prev word
  const prevWord = () => {
    const prevIdx = Math.max(0, currentIndex - 1)
    setCurrentIndex(prevIdx)
    const prevItem = (customWords && prevIdx < customWords.length)
      ? customWords[prevIdx]
      : getInfiniteBlendingRockWord(lang, prevIdx - (customWords ? customWords.length : 0))
    resetStones(prevItem)
  }

  // Add Custom Word
  const handleAddCustomWord = (e) => {
    e.preventDefault()
    const trimmed = customWordInput.trim()
    if (!trimmed) return

    // Split word into letters (3 or 4)
    const letters = trimmed.split('')
    const newWordObj = {
      id: `custom-${Date.now()}`,
      word: trimmed,
      imageEmoji: customEmojiInput || '⭐',
      letters: letters,
      phonics: letters,
      pronouncePhonics: letters,
      blend12: letters.slice(0, 2).join(''),
      category: 'كلمات المعلم'
    }

    setCustomWords(prev => [newWordObj, ...prev])
    setCurrentIndex(0)
    resetStones(newWordObj)
    setShowCustomModal(false)
    setCustomWordInput('')
  }

  // Status prompt banner logic (just like in video!)
  const allLettersBroken = lettersSmashed.every(Boolean)
  let statusBannerText = ''
  let statusBannerEmoji = '🔨'

  if (!lettersSmashed[0]) {
    statusBannerText = lang === 'english' ? 'Sound 1: tap, tap, smash!' : 'الحرف الأول: اضغط واكسر الصخرة! 🔨'
  } else if (!lettersSmashed[1]) {
    statusBannerText = lang === 'english' ? 'Sound 2: tap, tap, smash!' : 'الحرف الثاني: اضغط واكسر الصخرة! 🔨'
  } else if (!lettersSmashed[2]) {
    statusBannerText = lang === 'english' ? 'Sound 3: tap, tap, smash!' : 'الحرف الثالث: اضغط واكسر الصخرة! 🔨'
  } else if (!pictureSmashed) {
    statusBannerText = lang === 'english' ? 'Now smash the picture stone! 💥' : 'رائع! الآن اكسر صخرة الصورة الكبيرة! 💥'
    statusBannerEmoji = '🖼️'
  } else {
    statusBannerText = lang === 'english' ? 'Say the word together! 🌟' : 'انطق الكلمة كاملة معاً! 🌟'
    statusBannerEmoji = '🎉'
  }

  return (
    <div
      ref={containerRef}
      style={{
        minHeight: '100dvh',
        width: '100%',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        overflow: 'hidden',
        fontFamily: 'Tajawal, sans-serif',
        userSelect: 'none',
        direction: lang === 'arabic' ? 'rtl' : 'ltr',
        background: 'linear-gradient(180deg, #38bdf8 0%, #7dd3fc 35%, #fed7aa 70%, #f97316 100%)'
      }}
    >
      {/* --- DESERT CANYON LANDSCAPE BACKGROUND --- */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
          zIndex: 0
        }}
      >
        {/* Sun in sky */}
        <div
          style={{
            position: 'absolute',
            top: '8%',
            right: lang === 'arabic' ? 'auto' : '12%',
            left: lang === 'arabic' ? '12%' : 'auto',
            width: '90px',
            height: '90px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, #fef08a 0%, #fde047 60%, rgba(250, 204, 21, 0) 100%)',
            boxShadow: '0 0 50px #fef08a'
          }}
        />

        {/* Clouds */}
        <div style={{ position: 'absolute', top: '12%', left: '8%', opacity: 0.85, animation: 'floatClouds 45s linear infinite' }}>
          <svg width="140" height="60" viewBox="0 0 140 60" fill="white">
            <path d="M 20,45 Q 10,45 10,35 Q 10,25 25,25 Q 35,10 60,15 Q 85,10 95,25 Q 115,25 120,38 Q 120,45 110,45 Z" opacity="0.9" />
          </svg>
        </div>
        <div style={{ position: 'absolute', top: '18%', right: '15%', opacity: 0.75, animation: 'floatClouds 60s linear infinite' }}>
          <svg width="180" height="70" viewBox="0 0 180 70" fill="white">
            <path d="M 25,55 Q 15,55 15,45 Q 15,35 30,35 Q 45,15 80,20 Q 110,15 125,35 Q 150,35 155,48 Q 155,55 145,55 Z" opacity="0.85" />
          </svg>
        </div>

        {/* Distant Sandstone Mesas / Canyons (Back Layer) */}
        <svg
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          style={{
            position: 'absolute',
            bottom: '120px',
            width: '100%',
            height: '240px',
            opacity: 0.65
          }}
        >
          <path
            fill="#ea580c"
            d="M 0,160 L 120,110 L 260,110 L 320,170 L 480,90 L 620,90 L 710,180 L 890,70 L 1050,70 L 1150,160 L 1320,120 L 1440,160 L 1440,320 L 0,320 Z"
          />
        </svg>

        {/* Mid Canyons */}
        <svg
          viewBox="0 0 1440 280"
          preserveAspectRatio="none"
          style={{
            position: 'absolute',
            bottom: '80px',
            width: '100%',
            height: '220px',
            opacity: 0.85
          }}
        >
          <path
            fill="#c2410c"
            d="M 0,140 L 90,80 L 220,80 L 290,150 L 420,60 L 590,60 L 670,160 L 850,50 L 1020,50 L 1120,150 L 1280,90 L 1440,140 L 1440,280 L 0,280 Z"
          />
        </svg>

        {/* Foreground Sand Dunes */}
        <svg
          viewBox="0 0 1440 200"
          preserveAspectRatio="none"
          style={{
            position: 'absolute',
            bottom: 0,
            width: '100%',
            height: '180px'
          }}
        >
          <path
            fill="#f97316"
            d="M 0,60 Q 360,140 720,70 Q 1080,0 1440,80 L 1440,200 L 0,200 Z"
          />
          <path
            fill="#fb923c"
            opacity="0.8"
            d="M 0,100 Q 400,30 800,100 Q 1200,160 1440,90 L 1440,200 L 0,200 Z"
          />
        </svg>
      </div>

      {/* --- TOP CONTROL BAR --- */}
      <header
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: '1200px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap'
        }}
      >
        {/* Back and Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => router.back()}
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#1e293b',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              transition: 'transform 0.15s ease'
            }}
            title="رجوع"
          >
            {lang === 'arabic' ? <ArrowRight size={22} /> : <ArrowLeft size={22} />}
          </button>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '24px' }}>🪨</span>
              <h1 style={{ margin: 0, fontSize: 'clamp(17px, 2.8vw, 22px)', fontWeight: 'bold', color: '#0f172a' }}>
                {lang === 'english' ? 'Blending Rocks' : 'صخور الفونكس والدمج'}
              </h1>
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: '#334155', fontWeight: '500' }}>
              {lang === 'english' ? 'Tap, Smash, and Blend Phonics Sounds!' : 'اكسر الصخور، اكتشف الحروف، وكوّن الكلمات!'}
            </p>
          </div>
        </div>

        {/* Center / Right Quick Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Language Toggle */}
          <button
            onClick={() => setLang(l => (l === 'english' ? 'arabic' : 'english'))}
            style={{
              padding: '8px 14px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.92)',
              border: '2px solid #3b82f6',
              color: '#1d4ed8',
              fontWeight: 'bold',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(0,0,0,0.08)'
            }}
          >
            <Languages size={17} />
            <span>{lang === 'english' ? 'العربية' : 'English'}</span>
          </button>

          {/* Teacher Game Manager & AI Generator */}
          <button
            onClick={() => setShowCustomModal(true)}
            style={{
              padding: '8px 14px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: 'white',
              border: 'none',
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

          {/* Sound Mute Toggle */}
          <button
            onClick={() => {
              setMuted(!muted)
              sfx.muted = !muted
            }}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.92)',
              border: '1px solid #cbd5e1',
              color: muted ? '#ef4444' : '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 8px rgba(0,0,0,0.08)'
            }}
          >
            {muted ? <VolumeX size={19} /> : <Volume2 size={19} />}
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.92)',
              border: '1px solid #cbd5e1',
              color: '#334155',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 8px rgba(0,0,0,0.08)'
            }}
            title="شاشة كاملة للسبورة"
          >
            {isFullscreen ? <Minimize2 size={19} /> : <Maximize2 size={19} />}
          </button>
        </div>
      </header>

      {/* --- MAIN GAMEPLAY BOARD --- */}
      <main
        style={{
          position: 'relative',
          zIndex: 5,
          width: '100%',
          maxWidth: '860px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '26px',
          padding: '10px 16px',
          flex: 1
        }}
      >
        {/* --- TOP MYSTERY PICTURE STONE --- */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {/* If not smashed: show Big Rock with cracks */}
          {!pictureSmashed ? (
            <div
              onClick={hitPictureStone}
              style={{
                position: 'relative',
                transition: 'transform 0.15s ease',
                cursor: allLettersBroken ? 'pointer' : 'not-allowed',
                filter: !allLettersBroken ? 'grayscale(0.2) contrast(0.9)' : 'none'
              }}
              title={allLettersBroken ? 'اضغط لتكسير صخرة الصورة!' : 'اكسر صخور الحروف بالأسفل أولاً'}
            >
              <RockSvg hitCount={pictureHits} isBig={true} />
              <SmashParticles active={burstPicture} />
            </div>
          ) : (
            /* Once Smashed: Reveal Illustrated Picture Card! */
            <div
              style={{
                width: 'clamp(180px, 32vw, 240px)',
                height: 'clamp(150px, 28vw, 190px)',
                background: '#ffffff',
                borderRadius: '24px',
                border: '4px solid #38bdf8',
                boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                position: 'relative',
                animation: 'cardPop 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28) forwards',
                cursor: 'pointer'
              }}
              onClick={() => speakWord(currentItem.word)}
              title="اضغط للاستماع للكلمة كاملة"
            >
              <div style={{ fontSize: 'clamp(60px, 12vw, 84px)', lineHeight: 1 }}>
                {currentItem.imageEmoji}
              </div>

              {/* Speaker Replay Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  speakWord(currentItem.word)
                }}
                style={{
                  position: 'absolute',
                  bottom: '10px',
                  right: lang === 'arabic' ? 'auto' : '10px',
                  left: lang === 'arabic' ? '10px' : 'auto',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: '#e0f2fe',
                  border: 'none',
                  color: '#0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <Volume2 size={18} />
              </button>
            </div>
          )}
        </div>

        {/* --- BOTTOM LETTER / PHONICS STONES (Row of 3) --- */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'clamp(12px, 3vw, 28px)',
            flexWrap: 'nowrap',
            width: '100%'
          }}
        >
          {currentItem.letters.map((letter, idx) => {
            const isSmashed = lettersSmashed[idx]
            const hits = lettersHits[idx]

            return (
              <div
                key={idx}
                style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {!isSmashed ? (
                  /* Rock in progress */
                  <div
                    onClick={() => hitLetterStone(idx)}
                    style={{
                      position: 'relative',
                      cursor: 'pointer'
                    }}
                    title={`صوت ${idx + 1}`}
                  >
                    <RockSvg hitCount={hits} isBig={false} />
                    <SmashParticles active={burstLetter[idx]} />
                  </div>
                ) : (
                  /* Smashed -> Card with Letter */
                  <div
                    onClick={() => playLetterSound(idx)}
                    style={{
                      width: 'clamp(85px, 18vw, 130px)',
                      height: 'clamp(85px, 18vw, 120px)',
                      background: '#ffffff',
                      borderRadius: '20px',
                      border: '3px solid #60a5fa',
                      boxShadow: '0 12px 24px rgba(0,0,0,0.18)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      animation: 'cardPop 0.35s cubic-bezier(0.18, 0.89, 0.32, 1.28) forwards',
                      cursor: 'pointer',
                      transform: 'translateY(0)'
                    }}
                    title="اضغط للاستماع لصوت الحرف"
                  >
                    <span
                      style={{
                        fontSize: 'clamp(38px, 8vw, 56px)',
                        fontWeight: 'bold',
                        color: '#1e3a8a',
                        lineHeight: 1
                      }}
                    >
                      {letter}
                    </span>

                    {/* Speaker Button on Letter */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        playLetterSound(idx)
                      }}
                      style={{
                        position: 'absolute',
                        bottom: '6px',
                        right: lang === 'arabic' ? 'auto' : '6px',
                        left: lang === 'arabic' ? '6px' : 'auto',
                        width: '26px',
                        height: '26px',
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
                      <Volume2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* --- SUCCESSIVE BLENDING PEDAGOGY BANNER (Directly as in video) --- */}
        <div
          style={{
            width: '100%',
            maxWidth: '520px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(8px)',
            borderRadius: '16px',
            border: '2px solid #fdba74',
            padding: '12px 20px',
            textAlign: 'center',
            boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px',
            animation: 'fadeIn 0.3s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>{statusBannerEmoji}</span>
            <span style={{ fontSize: 'clamp(15px, 2.5vw, 18px)', fontWeight: 'bold', color: '#7c2d12' }}>
              {statusBannerText}
            </span>
          </div>

          {/* Successive Blending Visual Helper (e.g., b + a = ba) */}
          {lettersSmashed[0] && lettersSmashed[1] && !pictureSmashed && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#ffedd5',
                padding: '4px 14px',
                borderRadius: '99px',
                fontSize: '15px',
                fontWeight: 'bold',
                color: '#c2410c'
              }}
            >
              <span>{currentItem.letters[0]}</span>
              <span>+</span>
              <span>{currentItem.letters[1]}</span>
              <span>=</span>
              <span style={{ color: '#ea580c', fontSize: '18px' }}>{currentItem.blend12}</span>
            </div>
          )}

          {/* If completely finished -> Whole word pronounced together */}
          {pictureSmashed && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginTop: '4px'
              }}
            >
              <button
                onClick={() => speakWord(currentItem.word)}
                style={{
                  padding: '6px 16px',
                  borderRadius: '99px',
                  background: '#0284c7',
                  color: 'white',
                  border: 'none',
                  fontSize: '15px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)'
                }}
              >
                <Volume2 size={17} />
                <span>نطق الكلمة</span>
              </button>
            </div>
          )}
        </div>
      </main>

      {/* --- FOOTER / BOTTOM NAV BAR --- */}
      <footer
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: '900px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap'
        }}
      >
        {/* Reset / Retry Button */}
        <button
          onClick={() => resetStones()}
          style={{
            padding: '10px 18px',
            borderRadius: '14px',
            background: 'rgba(255, 255, 255, 0.92)',
            border: '1px solid #cbd5e1',
            color: '#475569',
            fontWeight: 'bold',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(0,0,0,0.06)'
          }}
        >
          <RotateCcw size={18} />
          <span>إعادة المحاولة</span>
        </button>

        {/* Word Progress Dots */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {wordList.slice(0, 10).map((_, i) => (
            <div
              key={i}
              onClick={() => {
                setCurrentIndex(i)
                resetStones(wordList[i])
              }}
              style={{
                width: i === currentIndex ? '22px' : '9px',
                height: '9px',
                borderRadius: '99px',
                background: i === currentIndex ? '#ffffff' : 'rgba(255,255,255,0.45)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            />
          ))}
        </div>

        {/* Next / Previous Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={prevWord}
            style={{
              padding: '10px 18px',
              borderRadius: '14px',
              background: 'rgba(255, 255, 255, 0.92)',
              border: '1px solid #cbd5e1',
              color: '#334155',
              fontWeight: 'bold',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            {lang === 'arabic' ? 'السابق ←' : '→ Prev'}
          </button>

          {/* Finish or Next Button */}
          <button
            onClick={nextWord}
            style={{
              padding: '10px 22px',
              borderRadius: '14px',
              background: pictureSmashed ? '#10b981' : '#3b82f6',
              color: 'white',
              border: 'none',
              fontWeight: 'bold',
              fontSize: '15px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: pictureSmashed
                ? '0 6px 18px rgba(16, 185, 129, 0.4)'
                : '0 6px 18px rgba(59, 130, 246, 0.35)',
              transition: 'transform 0.15s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.04)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <span>{pictureSmashed ? (lang === 'english' ? 'Next Word →' : 'الكلمة التالية ←') : (lang === 'english' ? 'Skip →' : 'تخطي ←')}</span>
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
          resetStones()
        }}
      />

      {/* --- INLINE KEYFRAME ANIMATIONS --- */}
      <style>{`
        @keyframes cardPop {
          0% { transform: scale(0.4) rotate(-5deg); opacity: 0; }
          70% { transform: scale(1.1) rotate(2deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes particleFly {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          100% { transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(0.2); opacity: 0; }
        }
        @keyframes floatClouds {
          0% { transform: translateX(0); }
          50% { transform: translateX(40px); }
          100% { transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

export default function BlendingRocksPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>جاري تحميل اللعبة...</div>}>
      <BlendingRocksGame />
    </Suspense>
  )
}
