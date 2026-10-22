'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Volume2, Sparkles } from 'lucide-react'
import { speakWhenReady } from '../../../utils/tts'

const LETTERS_DATA = [
  { letter: 'A', word: 'Apple', emoji: '🍎' },
  { letter: 'B', word: 'Book', emoji: '📖' },
  { letter: 'C', word: 'Cat', emoji: '🐱' },
  { letter: 'D', word: 'Dog', emoji: '🐶' },
  { letter: 'E', word: 'Elephant', emoji: '🐘' },
  { letter: 'F', word: 'Fish', emoji: '🐟' },
  { letter: 'G', word: 'Giraffe', emoji: '🦒' },
  { letter: 'H', word: 'Hat', emoji: '🎩' },
  { letter: 'I', word: 'Ice cream', emoji: '🍦' },
  { letter: 'J', word: 'Juice', emoji: '🧃' },
  { letter: 'K', word: 'Kite', emoji: '🪁' },
  { letter: 'L', word: 'Lion', emoji: '🦁' },
  { letter: 'M', word: 'Moon', emoji: '🌙' },
  { letter: 'N', word: 'Nest', emoji: '🪺' },
  { letter: 'O', word: 'Orange', emoji: '🍊' },
  { letter: 'P', word: 'Pencil', emoji: '✏️' },
  { letter: 'Q', word: 'Queen', emoji: '👑' },
  { letter: 'R', word: 'Rainbow', emoji: '🌈' },
  { letter: 'S', word: 'Sun', emoji: '☀️' },
  { letter: 'T', word: 'Tree', emoji: '🌳' },
  { letter: 'U', word: 'Umbrella', emoji: '☂️' },
  { letter: 'V', word: 'Violin', emoji: '🎻' },
  { letter: 'W', word: 'Watch', emoji: '⌚' },
  { letter: 'X', word: 'Xylophone', emoji: '🎵' },
  { letter: 'Y', word: 'Yacht', emoji: '⛵' },
  { letter: 'Z', word: 'Zebra', emoji: '🦓' }
]

export default function EnglishAlphabet() {
  const router = useRouter()
  const [activeLetter, setActiveLetter] = useState(null)

  const playSound = (item) => {
    setActiveLetter(item.letter)
    speakWhenReady(`${item.letter}, ${item.word}`, 'US English Female', { rate: 0.85 })
  }

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'radial-gradient(circle at 10% 20%, #d1fae5 0%, #ecfdf5 45%, #f0fdf4 100%)',
      padding: 'clamp(14px, 3vw, 28px)',
      paddingBottom: 'calc(clamp(24px, 4vw, 40px) + env(safe-area-inset-bottom, 0px))',
      fontFamily: 'Tajawal, -apple-system, BlinkMacSystemFont, sans-serif',
      boxSizing: 'border-box'
    }}>
      <div style={{ maxWidth: '1080px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Header Bar */}
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1.5px solid rgba(255, 255, 255, 0.95)',
          borderRadius: '24px',
          padding: '12px 20px',
          boxShadow: '0 6px 20px rgba(5, 150, 105, 0.06)',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <h1 style={{
            margin: 0,
            fontSize: 'clamp(1.2rem, 3.5vw, 1.6rem)',
            fontWeight: 900,
            color: '#064e3b',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>🔤</span>
            <span>ABC Phonics & Letters</span>
          </h1>

          <Link 
            href="/kids-corner/english" 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 18px',
              background: 'rgba(5, 150, 105, 0.08)',
              color: '#065f46',
              border: '1px solid rgba(5, 150, 105, 0.2)',
              borderRadius: '50px',
              fontWeight: 800,
              fontSize: '0.9rem',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              minHeight: '40px'
            }}
          >
            <ArrowLeft size={16} />
            <span>English Hub</span>
          </Link>
        </header>

        {/* Letters Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(85px, 14vw, 120px), 1fr))',
          gap: 'clamp(10px, 2vw, 16px)',
          width: '100%'
        }}>
          {LETTERS_DATA.map((item) => {
            const isSelected = activeLetter === item.letter
            return (
              <button
                key={item.letter}
                onClick={() => playSound(item)}
                style={{
                  background: isSelected ? 'linear-gradient(135deg, #059669, #10b981)' : 'rgba(255, 255, 255, 0.92)',
                  border: isSelected ? '2px solid transparent' : '1.5px solid rgba(5, 150, 105, 0.18)',
                  borderRadius: '24px',
                  padding: 'clamp(12px, 2.5vw, 18px) 8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  boxShadow: isSelected 
                    ? '0 10px 24px rgba(5, 150, 105, 0.35)' 
                    : '0 4px 12px rgba(0, 0, 0, 0.03)',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  transform: isSelected ? 'scale(1.05)' : 'none',
                  fontFamily: 'inherit'
                }}
              >
                <div style={{
                  fontSize: 'clamp(2rem, 5vw, 2.8rem)',
                  fontWeight: 900,
                  color: isSelected ? 'white' : '#064e3b',
                  lineHeight: 1
                }}>
                  {item.letter}
                </div>
                <div style={{
                  fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
                  fontWeight: 800,
                  color: isSelected ? 'rgba(255, 255, 255, 0.85)' : '#059669'
                }}>
                  {item.letter.toLowerCase()}
                </div>
                <div style={{ fontSize: '1.2rem', marginTop: '2px' }}>
                  {item.emoji}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
