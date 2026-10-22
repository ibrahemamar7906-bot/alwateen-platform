'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, RotateCcw, Sparkles, Volume2 } from 'lucide-react'
import { speakWhenReady } from '../../../utils/tts'

export default function ShapesAndColors() {
  const router = useRouter()

  const colors = [
    { name: 'أحمر', hex: '#ef4444' },
    { name: 'أزرق', hex: '#3b82f6' },
    { name: 'أخضر', hex: '#10b981' },
    { name: 'أصفر', hex: '#f59e0b' },
    { name: 'برتقالي', hex: '#f97316' },
    { name: 'بنفسجي', hex: '#8b5cf6' },
    { name: 'وردي', hex: '#ec4899' },
    { name: 'سماوي', hex: '#06b6d4' }
  ]

  const shapes = [
    { name: 'نجمة', path: 'M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z' },
    { name: 'قلب', path: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z' },
    { name: 'دائرة', path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z' },
    { name: 'مربع', path: 'M3 3h18v18H3z' },
    { name: 'مثلث', path: 'M12 2L1 21h22L12 2z' },
    { name: 'ماسة', path: 'M12 2L2 12l10 10 10-10L12 2z' }
  ]

  const [selectedColor, setSelectedColor] = useState(colors[0])
  const [shapeColors, setShapeColors] = useState(shapes.map(() => '#f1f5f9'))
  const [showConfetti, setShowConfetti] = useState(false)

  const speak = (text) => {
    speakWhenReady(text, 'Arabic Male')
  }

  const handleSelectColor = (color) => {
    setSelectedColor(color)
    speak(color.name)
  }

  const handleShapeClick = (idx) => {
    const newColors = [...shapeColors]
    newColors[idx] = selectedColor.hex
    setShapeColors(newColors)
    speak(`${shapes[idx].name} باللون ${selectedColor.name}`)

    if (newColors.every(c => c !== '#f1f5f9')) {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3500)
    }
  }

  const handleReset = () => {
    setShapeColors(shapes.map(() => '#f1f5f9'))
  }

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'radial-gradient(circle at 10% 20%, #d1fae5 0%, #ecfdf5 45%, #f0fdf4 100%)',
      padding: 'clamp(14px, 3vw, 36px)',
      paddingBottom: 'calc(clamp(24px, 5vw, 48px) + env(safe-area-inset-bottom, 0px))',
      fontFamily: 'Tajawal, -apple-system, BlinkMacSystemFont, sans-serif',
      direction: 'rtl',
      boxSizing: 'border-box',
      textAlign: 'center'
    }}>
      <div style={{ maxWidth: '920px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Header */}
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

          <h1 style={{ margin: 0, fontSize: 'clamp(1.1rem, 3.5vw, 1.5rem)', fontWeight: 900, color: '#064e3b', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>🎨</span>
            <span>عالم الألوان والأشكال الهندسية</span>
          </h1>

          <button 
            onClick={handleReset} 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 18px',
              background: '#fef2f2',
              color: '#dc2626',
              border: '1px solid rgba(220, 38, 38, 0.2)',
              borderRadius: '50px',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '0.9rem',
              fontFamily: 'inherit',
              minHeight: '40px'
            }}
          >
            <RotateCcw size={16} />
            <span>إعادة تلوين</span>
          </button>
        </header>

        {/* Main Card */}
        <main style={{
          background: 'rgba(255, 255, 255, 0.94)',
          backdropFilter: 'blur(25px)',
          WebkitBackdropFilter: 'blur(25px)',
          border: '1.5px solid rgba(255, 255, 255, 0.95)',
          padding: 'clamp(20px, 4vw, 36px)',
          borderRadius: '28px',
          boxShadow: '0 10px 30px rgba(5, 150, 105, 0.08)',
        }}>
          
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(240, 253, 244, 0.8)',
            padding: '8px 20px',
            borderRadius: '50px',
            border: '1px solid rgba(5, 150, 105, 0.2)',
            marginBottom: '20px'
          }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#064e3b' }}>اللون المختار حالياً:</span>
            <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: selectedColor.hex, border: '2px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
            <span style={{ fontSize: '1rem', fontWeight: 900, color: selectedColor.hex }}>{selectedColor.name}</span>
          </div>

          {/* Color Palette */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 'clamp(8px, 2vw, 16px)',
            marginBottom: '36px',
            flexWrap: 'wrap'
          }}>
            {colors.map((color, idx) => (
              <button 
                key={idx}
                onClick={() => handleSelectColor(color)}
                aria-label={`Select ${color.name}`}
                style={{
                  width: 'clamp(44px, 8vw, 56px)',
                  height: 'clamp(44px, 8vw, 56px)',
                  background: color.hex,
                  borderRadius: '50%',
                  cursor: 'pointer',
                  border: selectedColor.hex === color.hex ? '4px solid #ffffff' : '2px solid rgba(255,255,255,0.8)',
                  boxShadow: selectedColor.hex === color.hex ? `0 0 0 3px ${color.hex}, 0 6px 14px rgba(0,0,0,0.18)` : '0 3px 8px rgba(0,0,0,0.1)',
                  transform: selectedColor.hex === color.hex ? 'scale(1.18)' : 'scale(1)',
                  transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
                  padding: 0
                }}
              />
            ))}
          </div>

          {/* Shapes Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 130px), 1fr))',
            gap: 'clamp(14px, 3vw, 24px)',
            justifyItems: 'center'
          }}>
            {shapes.map((shape, idx) => (
              <div 
                key={idx} 
                onClick={() => handleShapeClick(idx)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '16px',
                  background: 'rgba(248, 250, 252, 0.7)',
                  border: '1.5px solid rgba(5, 150, 105, 0.15)',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  width: '100%',
                  maxWidth: '150px',
                  boxSizing: 'border-box',
                  transition: 'all 0.2s ease'
                }}
              >
                <svg 
                  viewBox="0 0 24 24" 
                  width="70" 
                  height="70"
                  style={{
                    fill: shapeColors[idx],
                    stroke: '#334155',
                    strokeWidth: '1.2',
                    filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.08))',
                    transition: 'fill 0.3s ease, transform 0.2s ease',
                  }}
                >
                  <path d={shape.path} />
                </svg>
                <span style={{ fontWeight: 800, color: '#064e3b', fontSize: '1rem' }}>{shape.name}</span>
              </div>
            ))}
          </div>

          {/* Celebration */}
          {showConfetti && (
            <div style={{
              marginTop: '28px',
              padding: '16px 24px',
              background: 'linear-gradient(135deg, #059669, #10b981)',
              color: 'white',
              borderRadius: '20px',
              boxShadow: '0 8px 24px rgba(5, 150, 105, 0.3)',
              animation: 'confettiPop 0.5s ease-out'
            }}>
              <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Sparkles size={24} />
                <span>أحسنت يا بطل! لونت جميع الأشكال ببراعة! 🎨✨</span>
              </h2>
            </div>
          )}

          <p style={{ marginTop: '24px', color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>
            💡 اختر اللون أولاً من الأعلى، ثم اضغط على أي شكل لتلوينه والاستماع لاسمه!
          </p>
        </main>
      </div>
    </div>
  )
}
