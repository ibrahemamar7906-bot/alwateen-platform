'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  X,
  ChevronRight,
  ChevronLeft,
  PenTool,
  Highlighter,
  Eraser,
  Trash2,
  Volume2,
  VolumeX,
  Play,
  Pause,
  BookOpen,
  Maximize2,
  Minimize2,
  Sparkles
} from 'lucide-react'

const SURAHS = [
  { id: 1, name: "الفاتحة", page: 1 },
  { id: 2, name: "البقرة", page: 2 },
  { id: 3, name: "آل عمران", page: 50 },
  { id: 4, name: "النساء", page: 77 },
  { id: 5, name: "المائدة", page: 106 },
  { id: 6, name: "الأنعام", page: 128 },
  { id: 7, name: "الأعراف", page: 151 },
  { id: 8, name: "الأنفال", page: 177 },
  { id: 9, name: "التوبة", page: 187 },
  { id: 10, name: "يونس", page: 208 },
  { id: 11, name: "هود", page: 221 },
  { id: 12, name: "يوسف", page: 235 },
  { id: 13, name: "الرعد", page: 249 },
  { id: 14, name: "إبراهيم", page: 255 },
  { id: 15, name: "الحجر", page: 262 },
  { id: 16, name: "النحل", page: 267 },
  { id: 17, name: "الإسراء", page: 282 },
  { id: 18, name: "الكهف", page: 293 },
  { id: 19, name: "مريم", page: 305 },
  { id: 20, name: "طه", page: 312 },
  { id: 21, name: "الأنبياء", page: 322 },
  { id: 22, name: "الحج", page: 332 },
  { id: 23, name: "المؤمنون", page: 342 },
  { id: 24, name: "النور", page: 350 },
  { id: 25, name: "الفرقان", page: 359 },
  { id: 26, name: "الشعراء", page: 367 },
  { id: 27, name: "النمل", page: 377 },
  { id: 28, name: "القصص", page: 385 },
  { id: 29, name: "العنكبوت", page: 396 },
  { id: 30, name: "الروم", page: 404 },
  { id: 31, name: "لقمان", page: 411 },
  { id: 32, name: "السجدة", page: 415 },
  { id: 33, name: "الأحزاب", page: 418 },
  { id: 34, name: "سبأ", page: 428 },
  { id: 35, name: "فاطر", page: 434 },
  { id: 36, name: "يس", page: 440 },
  { id: 37, name: "الصافات", page: 446 },
  { id: 38, name: "ص", page: 453 },
  { id: 39, name: "الزمر", page: 458 },
  { id: 40, name: "غافر", page: 467 },
  { id: 41, name: "فصلت", page: 477 },
  { id: 42, name: "الشورى", page: 483 },
  { id: 43, name: "الزخرف", page: 489 },
  { id: 44, name: "الدخان", page: 496 },
  { id: 45, name: "الجاثية", page: 499 },
  { id: 46, name: "الأحقاف", page: 502 },
  { id: 47, name: "محمد", page: 507 },
  { id: 48, name: "الفتح", page: 511 },
  { id: 49, name: "الحجرات", page: 515 },
  { id: 50, name: "ق", page: 518 },
  { id: 51, name: "الذاريات", page: 520 },
  { id: 52, name: "الطور", page: 523 },
  { id: 53, name: "النجم", page: 526 },
  { id: 54, name: "القمر", page: 528 },
  { id: 55, name: "الرحمن", page: 531 },
  { id: 56, name: "الواقعة", page: 534 },
  { id: 57, name: "الحديد", page: 537 },
  { id: 58, name: "المجادلة", page: 542 },
  { id: 59, name: "الحشر", page: 545 },
  { id: 60, name: "الممتحنة", page: 549 },
  { id: 61, name: "الصف", page: 551 },
  { id: 62, name: "الجمعة", page: 553 },
  { id: 63, name: "المنافقون", page: 554 },
  { id: 64, name: "التغابن", page: 556 },
  { id: 65, name: "الطلاق", page: 558 },
  { id: 66, name: "التحريم", page: 560 },
  { id: 67, name: "الملك", page: 562 },
  { id: 68, name: "القلم", page: 564 },
  { id: 69, name: "الحاقة", page: 566 },
  { id: 70, name: "المعارج", page: 568 },
  { id: 71, name: "نوح", page: 570 },
  { id: 72, name: "الجن", page: 572 },
  { id: 73, name: "المزمل", page: 574 },
  { id: 74, name: "المدثر", page: 575 },
  { id: 75, name: "القيامة", page: 577 },
  { id: 76, name: "الإنسان", page: 578 },
  { id: 77, name: "المرسلات", page: 580 },
  { id: 78, name: "النبأ", page: 582 },
  { id: 79, name: "النازعات", page: 583 },
  { id: 80, name: "عبس", page: 585 },
  { id: 81, name: "التكوير", page: 586 },
  { id: 82, name: "الانفطار", page: 587 },
  { id: 83, name: "المطففين", page: 587 },
  { id: 84, name: "الانشقاق", page: 589 },
  { id: 85, name: "البروج", page: 590 },
  { id: 86, name: "الطارق", page: 591 },
  { id: 87, name: "الأعلى", page: 591 },
  { id: 88, name: "الغاشية", page: 592 },
  { id: 89, name: "الفجر", page: 593 },
  { id: 90, name: "البلد", page: 594 },
  { id: 91, name: "الشمس", page: 595 },
  { id: 92, name: "الليل", page: 595 },
  { id: 93, name: "الضحى", page: 596 },
  { id: 94, name: "الشرح", page: 596 },
  { id: 95, name: "التين", page: 597 },
  { id: 96, name: "العلق", page: 597 },
  { id: 97, name: "القدر", page: 598 },
  { id: 98, name: "البينة", page: 598 },
  { id: 99, name: "الزلزلة", page: 599 },
  { id: 100, name: "العاديات", page: 599 },
  { id: 101, name: "القارعة", page: 600 },
  { id: 102, name: "التكاثر", page: 600 },
  { id: 103, name: "العصر", page: 601 },
  { id: 104, name: "الهمزة", page: 601 },
  { id: 105, name: "الفيل", page: 601 },
  { id: 106, name: "قريش", page: 602 },
  { id: 107, name: "الماعون", page: 602 },
  { id: 108, name: "الكوثر", page: 602 },
  { id: 109, name: "الكافرون", page: 603 },
  { id: 110, name: "النصر", page: 603 },
  { id: 111, name: "المسد", page: 603 },
  { id: 112, name: "الإخلاص", page: 604 },
  { id: 113, name: "الفلق", page: 604 },
  { id: 114, name: "الناس", page: 604 }
]

const TAJWEED_COLORS = [
  { name: 'إخفاء وغنة (أخضر)', color: '#22c55e', stroke: '#16a34a' },
  { name: 'مدود (أحمر)', color: '#ef4444', stroke: '#dc2626' },
  { name: 'قلقلة (أزرق)', color: '#3b82f6', stroke: '#2563eb' },
  { name: 'إدغام (برتقالي)', color: '#f97316', stroke: '#ea580c' },
  { name: 'إقلاب (أصفر)', color: '#eab308', stroke: '#ca8a04' },
  { name: 'تنبيه (بنفسجي)', color: '#a855f7', stroke: '#9333ea' }
]

export default function InteractiveMushafOverlay({ isActive, onClose, channel = null, isTeacher = true }) {
  if (!isActive) return null

  const [page, setPage] = useState(567) // default to Surah Al-Mulk / Juz Tabarak
  const [activeTool, setActiveTool] = useState('pen') // 'pen', 'highlighter', 'eraser'
  const [currentColor, setCurrentColor] = useState('#ef4444')
  const [brushSize, setBrushSize] = useState(4)
  const [isDrawing, setIsDrawing] = useState(false)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [reciter, setReciter] = useState('ar.alafasy')

  const canvasRef = useRef(null)
  const imgRef = useRef(null)
  const audioRef = useRef(null)

  // Load KSU Page URL
  const pageImgUrl = `https://quran.ksu.edu.sa/png_big/${page}.png`

  // Change page handler
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= 604) {
      setPage(newPage)
      clearCanvas()
      if (audioRef.current) {
        audioRef.current.pause()
        setIsPlayingAudio(false)
      }
    }
  }

  // Clear Canvas
  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  // Resize canvas to match image natural aspect ratio
  const syncCanvasSize = () => {
    const canvas = canvasRef.current
    const img = imgRef.current
    if (canvas && img) {
      canvas.width = img.clientWidth || 600
      canvas.height = img.clientHeight || 850
    }
  }

  // Canvas Drawing Handlers
  const startDrawing = (e) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    const x = clientX - rect.left
    const y = clientY - rect.top

    const ctx = canvas.getContext('2d')
    ctx.beginPath()
    ctx.moveTo(x, y)
    setIsDrawing(true)

    if (activeTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out'
      ctx.lineWidth = brushSize * 4
    } else if (activeTool === 'highlighter') {
      ctx.globalCompositeOperation = 'source-over'
      ctx.strokeStyle = currentColor
      ctx.globalAlpha = 0.35 // semi-transparent highlighter!
      ctx.lineWidth = brushSize * 3.5
      ctx.lineCap = 'square'
    } else {
      ctx.globalCompositeOperation = 'source-over'
      ctx.strokeStyle = currentColor
      ctx.globalAlpha = 1.0
      ctx.lineWidth = brushSize
      ctx.lineCap = 'round'
    }
    ctx.lineJoin = 'round'
  }

  const draw = (e) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    const x = clientX - rect.left
    const y = clientY - rect.top

    const ctx = canvas.getContext('2d')
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    if (!isDrawing) return
    setIsDrawing(false)
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      ctx.closePath()
    }
  }

  // Play / Pause Page Recitation
  const togglePageAudio = async () => {
    if (isPlayingAudio) {
      if (audioRef.current) audioRef.current.pause()
      setIsPlayingAudio(false)
    } else {
      try {
        const res = await fetch(`https://api.alquran.cloud/v1/page/${page}/${reciter}`)
        const data = await res.json()
        if (data.data && data.data.ayahs && data.data.ayahs.length > 0) {
          let currentAyah = 0
          const playNext = () => {
            if (currentAyah < data.data.ayahs.length) {
              if (!audioRef.current) audioRef.current = new Audio()
              audioRef.current.src = data.data.ayahs[currentAyah].audio
              audioRef.current.play().catch(() => {})
              audioRef.current.onended = () => {
                currentAyah++
                playNext()
              }
            } else {
              setIsPlayingAudio(false)
            }
          }
          setIsPlayingAudio(true)
          playNext()
        }
      } catch (e) {
        console.error('Audio play error:', e)
      }
    }
  }

  // Find Current Surah by Page
  const currentSurah = SURAHS.slice().reverse().find(s => s.page <= page) || SURAHS[0]

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        direction: 'rtl',
        fontFamily: 'Tajawal, sans-serif',
        padding: '12px'
      }}
    >
      <div
        style={{
          width: '98%',
          maxWidth: '1100px',
          height: '94vh',
          background: '#fdfbf7',
          borderRadius: '22px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
          border: '2px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* --- HEADER CONTROLS --- */}
        <div
          style={{
            padding: '12px 20px',
            background: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap'
          }}
        >
          {/* Right: Surah info & Jump */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>📖</span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 'bold', color: '#0f172a' }}>
                  مصحف التجويد التفاعلي
                </h3>
                <span style={{ background: '#059669', color: 'white', fontSize: '11px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '99px' }}>
                  سورة {currentSurah.name}
                </span>
              </div>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                الصفحة: <strong>{page}</strong> من 604
              </span>
            </div>

            {/* Surah Selector */}
            <select
              value={currentSurah.id}
              onChange={(e) => {
                const s = SURAHS.find(item => item.id === parseInt(e.target.value))
                if (s) handlePageChange(s.page)
              }}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                fontWeight: 'bold',
                color: '#334155',
                outline: 'none',
                background: '#f8fafc'
              }}
            >
              {SURAHS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.id}. سورة {s.name} (ص {s.page})
                </option>
              ))}
            </select>
          </div>

          {/* Center: Tajweed Drawing & Highlighting Tools */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f1f5f9', padding: '4px 8px', borderRadius: '12px' }}>
            {/* Pen Tool */}
            <button
              onClick={() => setActiveTool('pen')}
              style={{
                padding: '7px 12px',
                borderRadius: '8px',
                border: 'none',
                background: activeTool === 'pen' ? '#2563eb' : 'transparent',
                color: activeTool === 'pen' ? 'white' : '#475569',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12.5px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
              title="قلم عادي للكتابة والدوائر"
            >
              <PenTool size={16} />
              <span>قلم</span>
            </button>

            {/* Tajweed Highlighter Tool */}
            <button
              onClick={() => setActiveTool('highlighter')}
              style={{
                padding: '7px 12px',
                borderRadius: '8px',
                border: 'none',
                background: activeTool === 'highlighter' ? '#059669' : 'transparent',
                color: activeTool === 'highlighter' ? 'white' : '#475569',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12.5px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
              title="تظليل فسفوري شفاف لأحكام التجويد"
            >
              <Highlighter size={16} />
              <span>تظليل تجويد</span>
            </button>

            {/* Eraser */}
            <button
              onClick={() => setActiveTool('eraser')}
              style={{
                padding: '7px 12px',
                borderRadius: '8px',
                border: 'none',
                background: activeTool === 'eraser' ? '#ef4444' : 'transparent',
                color: activeTool === 'eraser' ? 'white' : '#475569',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12.5px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
              title="ممحاة"
            >
              <Eraser size={16} />
              <span>ممحاة</span>
            </button>

            {/* Color Swatches */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', margin: '0 6px' }}>
              {TAJWEED_COLORS.map((c, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentColor(c.color)}
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    background: c.color,
                    border: currentColor === c.color ? '2.5px solid #0f172a' : '1px solid rgba(0,0,0,0.15)',
                    cursor: 'pointer',
                    boxShadow: currentColor === c.color ? '0 0 6px rgba(0,0,0,0.3)' : 'none'
                  }}
                  title={c.name}
                />
              ))}
            </div>

            {/* Clear All Button */}
            <button
              onClick={clearCanvas}
              style={{
                padding: '6px 10px',
                borderRadius: '8px',
                border: 'none',
                background: '#fee2e2',
                color: '#dc2626',
                cursor: 'pointer'
              }}
              title="مسح جميع الشروحات والتظليل"
            >
              <Trash2 size={16} />
            </button>
          </div>

          {/* Left: Audio Player & Close */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={togglePageAudio}
              style={{
                padding: '7px 14px',
                borderRadius: '10px',
                background: isPlayingAudio ? '#ef4444' : '#059669',
                color: 'white',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(5, 150, 105, 0.25)'
              }}
            >
              {isPlayingAudio ? <Pause size={16} /> : <Play size={16} />}
              <span>{isPlayingAudio ? 'إيقاف التلاوة' : 'استماع للصفحة'}</span>
            </button>

            <button
              onClick={onClose}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: '#f1f5f9',
                border: 'none',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* --- MAIN PAGE DISPLAY WITH DRAWING CANVAS --- */}
        <div
          style={{
            flex: 1,
            position: 'relative',
            overflow: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f8fafc',
            padding: '10px'
          }}
        >
          {/* Mushaf Page Container */}
          <div
            style={{
              position: 'relative',
              boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
              borderRadius: '8px',
              overflow: 'hidden',
              background: '#fffbf0',
              maxHeight: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <img
              ref={imgRef}
              src={pageImgUrl}
              alt={`مصحف صفحة ${page}`}
              onLoad={syncCanvasSize}
              style={{
                maxHeight: 'calc(94vh - 140px)',
                width: 'auto',
                display: 'block',
                userSelect: 'none',
                pointerEvents: 'none'
              }}
            />

            {/* Drawing & Highlighting Canvas Overlay */}
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                cursor: activeTool === 'eraser' ? 'crosshair' : 'crosshair',
                touchAction: 'none'
              }}
            />
          </div>
        </div>

        {/* --- BOTTOM NAVIGATION BAR --- */}
        <div
          style={{
            padding: '10px 20px',
            background: '#ffffff',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          {/* Next Page Button (Right to left: next is page + 1 or previous page depending on RTL) */}
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= 604}
            style={{
              padding: '8px 18px',
              borderRadius: '10px',
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              color: '#334155',
              fontSize: '13.5px',
              fontWeight: 'bold',
              cursor: page >= 604 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <ChevronRight size={18} />
            <span>الصفحة التالية ({page + 1})</span>
          </button>

          {/* Quick Page Jump input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: '#64748b' }}>انتقال لصفحة:</span>
            <input
              type="number"
              min="1"
              max="604"
              value={page}
              onChange={(e) => handlePageChange(parseInt(e.target.value) || 1)}
              style={{
                width: '65px',
                padding: '6px',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                textAlign: 'center',
                fontWeight: 'bold',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          {/* Previous Page Button */}
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1}
            style={{
              padding: '8px 18px',
              borderRadius: '10px',
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              color: '#334155',
              fontSize: '13.5px',
              fontWeight: 'bold',
              cursor: page <= 1 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>الصفحة السابقة ({page - 1})</span>
            <ChevronLeft size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
