'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowRight, Volume2, RotateCcw, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import { speakWhenReady } from '../../../utils/tts'

function TracingBoardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const subject = searchParams.get('subject') || 'arabic'

  const canvasRef = useRef(null)
  const isDrawing = useRef(false)
  const [color, setColor] = useState('#059669')
  const [brushSize, setBrushSize] = useState(16)
  
  let initialLetters = []
  if (subject === 'math' || subject === 'math-en') {
    initialLetters = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
  } else if (subject === 'math-ar') {
    initialLetters = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']
  } else if (subject === 'english') {
    initialLetters = ['Aa', 'Bb', 'Cc', 'Dd', 'Ee', 'Ff', 'Gg', 'Hh', 'Ii', 'Jj', 'Kk', 'Ll', 'Mm', 'Nn', 'Oo', 'Pp', 'Qq', 'Rr', 'Ss', 'Tt', 'Uu', 'Vv', 'Ww', 'Xx', 'Yy', 'Zz']
  } else {
    initialLetters = ['أ', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'هـ', 'و', 'ي']
  }

  const levelStr = searchParams.get('level')
  if (levelStr && levelStr !== 'all') {
    const level = parseInt(levelStr)
    const itemsPerLevel = 3
    const startIndex = (level - 1) * itemsPerLevel
    if (startIndex < initialLetters.length) {
      initialLetters = initialLetters.slice(startIndex, startIndex + itemsPerLevel)
    }
  }

  const [letters] = useState(initialLetters)
  const [currentLetter, setCurrentLetter] = useState(0)

  useEffect(() => {
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => setTimeout(drawLetterTemplate, 50))
    } else {
      setTimeout(drawLetterTemplate, 150)
    }
  }, [currentLetter, letters])

  const drawLetterTemplate = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Background canvas
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw background grid lines (notebook style)
    ctx.strokeStyle = '#f1f5f9'
    ctx.lineWidth = 2
    for (let i = 40; i < canvas.height; i += 40) {
      ctx.beginPath()
      ctx.moveTo(0, i)
      ctx.lineTo(canvas.width, i)
      ctx.stroke()
    }

    // Midline guideline
    ctx.strokeStyle = '#e2e8f0'
    ctx.setLineDash([6, 6])
    ctx.beginPath()
    ctx.moveTo(0, canvas.height / 2)
    ctx.lineTo(canvas.width, canvas.height / 2)
    ctx.stroke()
    ctx.setLineDash([])

    // Draw the template letter
    ctx.font = 'bold 230px "Tajawal", Arial, sans-serif'
    ctx.fillStyle = 'rgba(148, 163, 184, 0.4)'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(letters[currentLetter], canvas.width / 2, canvas.height / 2 + 10)
  }

  const startDrawing = (e) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY

    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    ctx.beginPath()
    ctx.moveTo((clientX - rect.left) * scaleX, (clientY - rect.top) * scaleY)
    isDrawing.current = true
  }

  const draw = (e) => {
    if (!isDrawing.current) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY

    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    ctx.lineTo((clientX - rect.left) * scaleX, (clientY - rect.top) * scaleY)
    ctx.strokeStyle = color
    ctx.lineWidth = brushSize
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.stroke()
  }

  const stopDrawing = () => {
    isDrawing.current = false
  }

  const clearBoard = () => {
    drawLetterTemplate()
  }

  const nextLetter = () => {
    setCurrentLetter((prev) => (prev + 1) % letters.length)
  }

  const prevLetter = () => {
    setCurrentLetter((prev) => (prev - 1 + letters.length) % letters.length)
  }

  const playSound = () => {
    if (subject === 'english') {
      speakWhenReady(letters[currentLetter].charAt(0), 'US English Female')
    } else if (subject === 'math-en' || subject === 'math') {
      speakWhenReady(letters[currentLetter], 'US English Female')
    } else if (subject === 'math-ar') {
      const arabicNumbers = ['صفر', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة']
      speakWhenReady(arabicNumbers[currentLetter] || letters[currentLetter], 'Arabic Male')
    } else {
      speakWhenReady(letters[currentLetter], 'Arabic Male')
    }
  }

  const colorsList = ['#059669', '#3b82f6', '#ef4444', '#f59e0b', '#8b5cf6', '#0f172a']

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'radial-gradient(circle at 10% 20%, #d1fae5 0%, #ecfdf5 45%, #f0fdf4 100%)',
      padding: 'clamp(14px, 3vw, 32px)',
      paddingBottom: 'calc(clamp(20px, 4vw, 40px) + env(safe-area-inset-bottom, 0px))',
      fontFamily: 'Tajawal, -apple-system, BlinkMacSystemFont, sans-serif',
      direction: subject === 'english' ? 'ltr' : 'rtl',
      boxSizing: 'border-box',
    }}>
      <div style={{ maxWidth: '840px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
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
            <ArrowRight size={16} style={{ transform: subject === 'english' ? 'rotate(180deg)' : 'none' }} />
            <span>{subject === 'english' ? 'Back' : 'العودة'}</span>
          </button>

          <div style={{ textAlign: 'center' }}>
            <h1 style={{ margin: 0, fontSize: 'clamp(1.1rem, 3.5vw, 1.5rem)', fontWeight: 900, color: '#064e3b', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>✍️</span>
              <span>{subject === 'english' ? 'Magic Tracing Whiteboard' : 'السبورة السحرية للتتبع والكتابة'}</span>
            </h1>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
              {subject === 'english' ? `Element ${currentLetter + 1} of ${letters.length}` : `العنصر ${currentLetter + 1} من ${letters.length}`}
            </span>
          </div>

          <button 
            onClick={playSound} 
            title={subject === 'english' ? 'Listen pronunciation' : 'استمع للنطق الصحيح'}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #059669, #10b981)',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(5, 150, 105, 0.3)',
              flexShrink: 0
            }}
          >
            <Volume2 size={20} />
          </button>
        </header>

        {/* Main Workspace Card */}
        <main style={{
          background: 'rgba(255, 255, 255, 0.94)',
          backdropFilter: 'blur(25px)',
          WebkitBackdropFilter: 'blur(25px)',
          border: '1.5px solid rgba(255, 255, 255, 0.95)',
          padding: 'clamp(16px, 3vw, 28px)',
          borderRadius: '28px',
          boxShadow: '0 10px 30px rgba(5, 150, 105, 0.08)',
          textAlign: 'center'
        }}>
          
          {/* Tools & Palette Toolbar */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            alignItems: 'center',
            marginBottom: '18px',
            background: 'rgba(240, 253, 244, 0.6)',
            padding: '14px 18px',
            borderRadius: '20px',
            border: '1px solid rgba(5, 150, 105, 0.15)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {colorsList.map(c => (
                <button 
                  key={c}
                  onClick={() => setColor(c)}
                  aria-label={`Select color ${c}`}
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: c,
                    border: color === c ? '3.5px solid #ffffff' : '2px solid rgba(0,0,0,0.1)',
                    boxShadow: color === c ? `0 0 0 3px ${c}, 0 4px 10px rgba(0,0,0,0.15)` : 'none',
                    cursor: 'pointer',
                    transform: color === c ? 'scale(1.15)' : 'scale(1)',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                />
              ))}

              <button 
                onClick={clearBoard} 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 16px',
                  background: '#fef2f2',
                  color: '#dc2626',
                  border: '1px solid rgba(220, 38, 38, 0.2)',
                  borderRadius: '50px',
                  cursor: 'pointer',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  fontFamily: 'inherit',
                  minHeight: '38px'
                }}
              >
                <RotateCcw size={15} />
                <span>{subject === 'english' ? 'Clear' : 'مسح'}</span>
              </button>
            </div>
            
            {/* Brush Size Slider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', maxWidth: '360px' }}>
              <span style={{ fontSize: '1rem', fontWeight: 800, color: '#065f46' }}>🖌️</span>
              <input 
                type="range" min="6" max="36" value={brushSize} 
                onChange={(e) => setBrushSize(parseInt(e.target.value))}
                style={{ flex: 1, accentColor: color, cursor: 'pointer' }}
              />
              <div style={{
                width: `${brushSize}px`,
                height: `${brushSize}px`,
                borderRadius: '50%',
                background: color,
                flexShrink: 0,
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
              }} />
            </div>
          </div>

          {/* Interactive HTML5 Canvas */}
          <div style={{ position: 'relative', display: 'inline-block', maxWidth: '100%' }}>
            <canvas
              ref={canvasRef}
              width={600}
              height={380}
              style={{
                border: '2px solid #cbd5e1',
                borderRadius: '20px',
                cursor: 'crosshair',
                maxWidth: '100%',
                height: 'auto',
                touchAction: 'none',
                boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)',
                background: '#ffffff'
              }}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseOut={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
          </div>

          {/* Navigation Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', gap: '12px' }}>
            <button 
              onClick={prevLetter} 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                background: 'rgba(5, 150, 105, 0.08)',
                color: '#065f46',
                border: '1.5px solid rgba(5, 150, 105, 0.2)',
                borderRadius: '50px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 800,
                fontFamily: 'inherit',
                minHeight: '48px',
                transition: 'all 0.2s ease'
              }}
            >
              {subject === 'english' ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
              <span>{subject === 'english' ? 'Previous' : 'السابق'}</span>
            </button>

            <button 
              onClick={nextLetter} 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 28px',
                background: 'linear-gradient(135deg, #059669, #10b981)',
                color: 'white',
                border: 'none',
                borderRadius: '50px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 800,
                fontFamily: 'inherit',
                minHeight: '48px',
                boxShadow: '0 4px 16px rgba(5, 150, 105, 0.3)',
                transition: 'all 0.2s ease'
              }}
            >
              <span>{subject === 'english' ? 'Next' : 'التالي'}</span>
              {subject === 'english' ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
          </div>

        </main>
      </div>
    </div>
  )
}

export default function MagicTracingBoard() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Tajawal, sans-serif' }}>
        <p style={{ color: '#059669', fontWeight: 800 }}>جاري تحميل السبورة السحرية... ⏳</p>
      </div>
    }>
      <TracingBoardContent />
    </Suspense>
  )
}
