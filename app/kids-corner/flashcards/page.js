'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Volume2, Sparkles } from 'lucide-react'
import { playTTS } from '../../../utils/tts'

const LETTERS = ['أ', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'هـ', 'و', 'ي']

const TABS = [
  { id: 'fatha', label: 'فَتْحَة', mark: 'َ', example: 'بَ' },
  { id: 'damma', label: 'ضَمَّة', mark: 'ُ', example: 'بُ' },
  { id: 'kasra', label: 'كَسْرَة', mark: 'ِ', example: 'بِ' },
  { id: 'sukoon', label: 'سُكُون', mark: 'ْ', example: 'بْ' },
  { id: 'tanween', label: 'تَنْوِين', mark: 'ً', example: 'باً' },
]

export default function Flashcards() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('fatha')
  const [activeLetter, setActiveLetter] = useState(null)

  const currentTab = TABS.find(t => t.id === activeTab) || TABS[0]

  const playSound = (letter) => {
    setActiveLetter(letter)
    const soundText = letter + currentTab.mark
    playTTS(soundText, { isArabic: true, rate: 0.85 })
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
      <div style={{ maxWidth: '1040px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
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
          <button 
            onClick={() => router.back()} 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 18px',
              background: 'rgba(5, 150, 105, 0.08)',
              color: '#065f46',
              border: '1px solid rgba(5, 150, 105, 0.2)',
              borderRadius: '50px',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '0.9rem',
              fontFamily: 'inherit',
              minHeight: '40px'
            }}
          >
            <ArrowRight size={16} />
            <span>العودة</span>
          </button>

          <h1 style={{ margin: 0, fontSize: 'clamp(1.1rem, 3.5vw, 1.5rem)', fontWeight: 900, color: '#064e3b', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🔊</span>
            <span>البطاقات الناطقة والحركات</span>
          </h1>

          <div style={{
            background: 'rgba(5, 150, 105, 0.1)',
            padding: '6px 14px',
            borderRadius: '50px',
            color: '#065f46',
            fontWeight: 800,
            fontSize: '0.85rem'
          }}>
            {LETTERS.length} حرفاً
          </div>
        </header>

        {/* Tashkeel Tabs */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 'clamp(8px, 1.5vw, 14px)',
          flexWrap: 'wrap',
          background: 'rgba(255, 255, 255, 0.7)',
          padding: '10px',
          borderRadius: '24px',
          border: '1.5px solid rgba(255, 255, 255, 0.9)'
        }}>
          {TABS.map((tab) => {
            const isTabActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '8px 20px',
                  fontSize: 'clamp(0.95rem, 2.5vw, 1.15rem)',
                  fontWeight: 900,
                  borderRadius: '50px',
                  border: 'none',
                  cursor: 'pointer',
                  background: isTabActive ? 'linear-gradient(135deg, #059669, #10b981)' : 'rgba(5, 150, 105, 0.08)',
                  color: isTabActive ? 'white' : '#065f46',
                  boxShadow: isTabActive ? '0 6px 16px rgba(5, 150, 105, 0.3)' : 'none',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  fontFamily: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>{tab.label}</span>
                <span style={{ opacity: 0.8, fontSize: '0.9em' }}>({tab.example})</span>
              </button>
            )
          })}
        </div>

        {/* Letters Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(80px, 13vw, 110px), 1fr))',
          gap: 'clamp(10px, 2vw, 16px)',
          width: '100%'
        }}>
          {LETTERS.map((letter, idx) => {
            const isSelected = activeLetter === letter
            return (
              <button
                key={idx}
                onClick={() => playSound(letter)}
                style={{
                  background: isSelected ? 'linear-gradient(135deg, #059669, #10b981)' : 'rgba(255, 255, 255, 0.92)',
                  border: isSelected ? '2px solid transparent' : '1.5px solid rgba(5, 150, 105, 0.18)',
                  borderRadius: '24px',
                  height: 'clamp(95px, 16vw, 125px)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: isSelected 
                    ? '0 10px 24px rgba(5, 150, 105, 0.35)' 
                    : '0 4px 12px rgba(0, 0, 0, 0.03)',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  transform: isSelected ? 'scale(1.06)' : 'none',
                  fontFamily: 'inherit'
                }}
              >
                <span style={{
                  fontSize: 'clamp(2.5rem, 6vw, 3.5rem)',
                  fontWeight: 900,
                  color: isSelected ? 'white' : '#064e3b',
                  lineHeight: 1
                }}>
                  {letter}{currentTab.mark}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
