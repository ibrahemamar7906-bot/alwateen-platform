'use client'

import { useState, useEffect, useRef } from 'react'
import { speakWhenReady } from '../../utils/tts'

export default function LiveArabicBoardStudent({ channel }) {
  const [activeItem, setActiveItem] = useState(null)
  const [activeHaraka, setActiveHaraka] = useState(null)
  const [isTracing, setIsTracing] = useState(false)
  const [studentHasControl, setStudentHasControl] = useState(true)
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)

  useEffect(() => {
    if (!channel) return
    let isMounted = true

    const handleBroadcast = ({ payload }) => {
      if (payload.action === 'sync_state') {
        if (payload.activeItem !== undefined) setActiveItem(payload.activeItem);
        if (payload.activeHaraka !== undefined) setActiveHaraka(payload.activeHaraka);
        if (payload.isTracing !== undefined) setIsTracing(payload.isTracing);
        if (payload.studentHasControl !== undefined) setStudentHasControl(payload.studentHasControl);

        clearCanvasLocal();
        return;
      }

      console.log('[Arabic Board Student] Received broadcast:', payload)
      if (!isMounted || !payload) return
      
      if (payload.action === 'select_letter') {
        const item = typeof payload.item === 'string' 
          ? { letter: payload.item, word: '', emoji: '' } 
          : (payload.item || { letter: payload.letter, word: '', emoji: '' })
          
        setActiveItem(item)
        setActiveHaraka(payload.activeHaraka || null)
        
        if (payload.isTracing !== undefined) setIsTracing(payload.isTracing)
        if (payload.studentHasControl !== undefined) setStudentHasControl(payload.studentHasControl)
        
        clearCanvasLocal()
        
        speakWhenReady(`${item.name || item.letter} ${item.word}`, 'Arabic Male')
      } else if (payload.action === 'set_haraka') {
        setActiveHaraka(payload.haraka)
        const charWithHaraka = activeItem?.letter + (payload.haraka?.char || '')
        speakWhenReady(charWithHaraka, 'Arabic Male')
      } else if (payload.action === 'pronounce_letter') {
        const item = payload.item
        const haraka = payload.haraka
        if (haraka) {
          speakWhenReady(item.letter + haraka.char, 'Arabic Male')
        } else {
          speakWhenReady(`${item.name || item.letter} ${item.word}`, 'Arabic Male')
        }
      } else if (payload.action === 'toggle_tracing') {
        setIsTracing(payload.isTracing)
        if (payload.studentHasControl !== undefined) setStudentHasControl(payload.studentHasControl)
        clearCanvasLocal()
      } else if (payload.action === 'update_control') {
        setStudentHasControl(payload.studentHasControl)
      } else if (payload.action === 'clear') {
        setActiveItem(null)
        setActiveHaraka(null)
        setIsTracing(false)
        clearCanvasLocal()
      } else if (payload.action === 'arabic_trace_draw') {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        
        ctx.lineWidth = 15
        ctx.lineCap = 'round'
        ctx.strokeStyle = payload.color || '#ef4444' // Teacher usually red
        
        if (payload.type === 'start') {
          ctx.beginPath()
          ctx.moveTo(payload.x, payload.y)
        } else if (payload.type === 'end') {
          ctx.beginPath()
        } else {
          ctx.lineTo(payload.x, payload.y)
          ctx.stroke()
          ctx.beginPath()
          ctx.moveTo(payload.x, payload.y)
        }
      } else if (payload.action === 'clear_trace') {
        clearCanvasLocal()
      }
    }

    const handler = (e) => {
      const payload = e.detail
      handleBroadcast({ payload })
    }
    window.addEventListener('on_arabic_board_action', handler)

    // Request initial state from teacher for late joiners
    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'arabic_board_action_request',
        payload: { action: 'request_sync' }
      }).catch(err => console.error('Request sync error:', err));
    }

    return () => {
      isMounted = false
      window.removeEventListener('on_arabic_board_action', handler)
    }
  }, [channel])

  const clearCanvasLocal = () => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  }
  
  const clearCanvasAndBroadcast = () => {
    if (!studentHasControl) return
    clearCanvasLocal()
    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'arabic_board_action_student',
        payload: { action: 'arabic_trace_clear' }
      }).catch(err => console.error('Broadcast error:', err))
    }
  }

  // Student Drawing Handlers
  const sendDrawEvent = (x, y, type) => {
    if (!channel) return
    channel.send({
      type: 'broadcast',
      event: 'arabic_board_action_student',
      payload: { action: 'arabic_trace_draw', x, y, type, color: '#2563eb' } // Student color: Blue
    }).catch(err => console.error('Broadcast error:', err))
  }

  const startDrawing = (e) => {
    if (!studentHasControl) return
    setIsDrawing(true)
    draw(e, 'start')
  }

  const stopDrawing = () => {
    if (!studentHasControl) return
    setIsDrawing(false)
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      ctx.beginPath()
    }
    sendDrawEvent(0, 0, 'end')
  }

  const draw = (e, forceType = null) => {
    if (!studentHasControl) return
    if (!isDrawing && forceType !== 'start') return
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    
    let clientX = e.clientX
    let clientY = e.clientY
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    }
    
    // Normalize coordinates
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    
    const x = (clientX - rect.left) * scaleX
    const y = (clientY - rect.top) * scaleY

    ctx.lineWidth = 15
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#2563eb' // Blue ink
    
    ctx.lineTo(x, y)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(x, y)
    
    sendDrawEvent(x, y, forceType || 'draw')
  }

  // Prevent scrolling while drawing on mobile
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const preventScroll = (e) => { if (studentHasControl) e.preventDefault() }
    canvas.addEventListener('touchstart', preventScroll, { passive: false })
    canvas.addEventListener('touchmove', preventScroll, { passive: false })
    return () => {
      canvas.removeEventListener('touchstart', preventScroll)
      canvas.removeEventListener('touchmove', preventScroll)
    }
  }, [isTracing, activeItem, studentHasControl])

  if (!activeItem) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', height: '100%',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: '#94a3b8', alignItems: 'center', justifyContent: 'center',
        direction: 'rtl', fontFamily: "'Tajawal', 'Cairo', sans-serif",
        padding: '20px', textAlign: 'center'
      }}>
        <div style={{ fontSize: '5rem', marginBottom: '16px', animation: 'pulse 2s infinite' }}>🖊️</div>
        <h2 style={{ fontSize: '1.4rem', color: '#64748b', fontWeight: '600' }}>في انتظار المعلم لعرض الحرف...</h2>
        <style>{`@keyframes pulse { 0%,100%{opacity:0.4;transform:scale(1)} 50%{opacity:0.8;transform:scale(1.1)} }`}</style>
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%', width: '100%',
      background: isTracing
        ? 'linear-gradient(160deg, #fef9f0 0%, #fdf4e3 100%)'
        : 'linear-gradient(160deg, #059669 0%, #10b981 50%, #34d399 100%)',
      color: isTracing ? '#0f172a' : 'white',
      alignItems: 'center', justifyContent: isTracing ? 'center' : 'flex-start',
      fontFamily: "'Tajawal', 'Cairo', sans-serif",
      position: 'relative', overflowY: 'auto', overflowX: 'hidden', padding: 'clamp(8px, 1.5vh, 16px)', gap: '10px',
      boxSizing: 'border-box', WebkitOverflowScrolling: 'touch'
    }}>

      {/* Decorative background circles */}
      {!isTracing && (<>
        <div style={{ position:'absolute', top:'-60px', right:'-60px', width:'200px', height:'200px', borderRadius:'50%', background:'rgba(255,255,255,0.05)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:'-80px', left:'-40px', width:'250px', height:'250px', borderRadius:'50%', background:'rgba(255,255,255,0.04)', pointerEvents:'none' }} />
      </>)}

      {isTracing ? (
        /* ── TRACING MODE ─────────────────────────────── */
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', width:'100%', height:'100%', gap:'8px' }}>

          {/* Top info bar */}
          <div style={{
            display:'flex', alignItems:'center', justifyContent:'space-between',
            width:'100%', maxWidth:'420px', padding:'8px 16px',
            background:'rgba(255,255,255,0.9)', borderRadius:'16px',
            boxShadow:'0 2px 8px rgba(0,0,0,0.08)', flexShrink: 0
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
              <span style={{ fontSize:'1.8rem' }}>{activeItem.emoji}</span>
              <div>
                <div style={{ fontWeight:'800', fontSize:'1.1rem', color:'#0f172a', lineHeight:1 }}>{activeItem.letter}</div>
                <div style={{ fontSize:'0.75rem', color:'#64748b' }}>{activeItem.word}</div>
              </div>
            </div>
            {studentHasControl ? (
              <button onClick={clearCanvasAndBroadcast} style={{
                padding:'6px 14px', borderRadius:'10px', border:'none',
                background:'linear-gradient(135deg,#ef4444,#dc2626)', color:'white',
                fontWeight:'bold', cursor:'pointer', fontSize:'0.85rem',
                fontFamily:"'Tajawal','Cairo',sans-serif",
                boxShadow:'0 2px 6px rgba(239,68,68,0.4)'
              }}>
                مسح 🧹
              </button>
            ) : (
              <span style={{ fontSize:'0.8rem', color:'#ef4444', fontWeight:'bold' }}>🔒 مقفول</span>
            )}
          </div>

          {/* Main tracing canvas */}
          <div style={{
            position:'relative',
            width: '100%',
            maxWidth: 'min(400px, 88vw, calc((100vh - 140px) * 10 / 14))',
            maxHeight: 'min(65vh, 520px)',
            aspectRatio: '10 / 14',
            background:'white', borderRadius:'24px',
            boxShadow:'0 8px 32px rgba(5,150,105,0.15), 0 2px 8px rgba(0,0,0,0.06)',
            border:'3px solid #d1fae5', overflow:'hidden',
            margin: 'auto 0'
          }}>
            {/* Notebook lines in exact 1000x1400 space */}
            <svg viewBox="0 0 1000 1400" style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:1 }}>
              {/* Horizontal lines */}
              {[280, 490, 700, 910, 1120].map(y => (
                <line key={y} x1="50" y1={y} x2="950" y2={y} stroke="#e2e8f0" strokeWidth="2" strokeDasharray="12,12"/>
              ))}
              {/* Center guide line */}
              <line x1="50" y1="700" x2="950" y2="700" stroke="#bfdbfe" strokeWidth="3" />
              {/* Left margin */}
              <line x1="120" y1="0" x2="120" y2="1400" stroke="#fde68a" strokeWidth="4" opacity="0.6"/>
            </svg>

            {/* Ghost letter guide */}
            <svg viewBox="0 0 1000 1400" style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:2 }}>
              {/* Shadow layer for depth */}
              <text x="506" y="706" textAnchor="middle" dominantBaseline="central"
                fontSize={activeItem?.forms?.length > 4 ? "190" : "340"}
                fill="none" stroke="#d1fae5" strokeWidth="28"
                fontWeight="bold" fontFamily="Tajawal, Cairo, Arial, sans-serif">
                {activeItem ? `${activeItem.forms} ${activeHaraka ? activeHaraka.char : ''}` : ''}
              </text>
              {/* Main dashed outline */}
              <text x="500" y="700" textAnchor="middle" dominantBaseline="central"
                fontSize={activeItem?.forms?.length > 4 ? "190" : "340"}
                fill="none" stroke="#a7f3d0" strokeWidth="6" strokeDasharray="20,12"
                fontWeight="bold" fontFamily="Tajawal, Cairo, Arial, sans-serif"
                strokeLinecap="round">
                {activeItem ? `${activeItem.forms} ${activeHaraka ? activeHaraka.char : ''}` : ''}
              </text>
            </svg>

            {/* Arrow hint */}
            <div style={{ position:'absolute', top:'8px', left:'50%', transform:'translateX(-50%)', zIndex:3, opacity:0.5, fontSize:'0.7rem', color:'#059669', fontWeight:'bold', whiteSpace:'nowrap' }}>
              ✏️ ارسم هنا
            </div>

            <canvas
              ref={canvasRef}
              width={1000}
              height={1400}
              onMouseDown={startDrawing}
              onMouseUp={stopDrawing}
              onMouseOut={stopDrawing}
              onMouseMove={draw}
              onTouchStart={startDrawing}
              onTouchEnd={stopDrawing}
              onTouchMove={draw}
              style={{
                position:'absolute', inset:0, width:'100%', height:'100%',
                zIndex:5, borderRadius:'21px',
                cursor: studentHasControl ? 'crosshair' : 'not-allowed',
                touchAction: studentHasControl ? 'none' : 'auto'
              }}
            />
          </div>

          {/* Pencil color indicator */}
          <div style={{ display:'flex', alignItems:'center', gap:'6px', flexShrink:0 }}>
            <div style={{ width:'12px', height:'12px', borderRadius:'50%', background: studentHasControl ? '#2563eb' : '#94a3b8' }} />
            <span style={{ fontSize:'0.75rem', color:'#64748b' }}>
              {studentHasControl ? 'قلمك أزرق' : '🔒 المعلم يتحكم'}
            </span>
          </div>
        </div>

      ) : (
        /* ── DISPLAY MODE ─────────────────────────────── */
        <div style={{
          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
          gap:'clamp(8px, 1.5vh, 14px)', animation:'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
          width: '100%', maxWidth: '800px', margin: 'auto 0'
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(10px, 2vw, 20px)', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
            {/* Large letter display */}
            <div style={{
              background:'rgba(255,255,255,0.18)', backdropFilter:'blur(8px)',
              borderRadius:'24px', padding:'clamp(10px, 2vh, 20px) clamp(16px, 4vw, 40px)',
              boxShadow:'0 10px 30px rgba(0,0,0,0.15)',
              border:'2px solid rgba(255,255,255,0.3)',
              textAlign:'center', display: 'flex', alignItems: 'center', justifyContent: 'center',
              minWidth: 'clamp(110px, 25vw, 200px)'
            }}>
              <div style={{
                fontSize: 'clamp(3.8rem, 15vw, 10rem)',
                fontWeight:'900', lineHeight:1,
                textShadow:'0 4px 16px rgba(0,0,0,0.2)',
                fontFamily:"'Tajawal','Cairo',sans-serif"
              }}>
                {activeItem.letter}{activeHaraka?.char || ''}
              </div>
            </div>

            {/* Word + emoji */}
            {activeItem.word && (
              <div style={{
                display:'flex', flexDirection: 'column', alignItems:'center', gap:'clamp(6px, 1vh, 12px)',
                background:'rgba(255,255,255,0.2)', borderRadius:'20px',
                padding:'clamp(10px, 2vh, 20px) clamp(16px, 4vw, 36px)',
                border:'2px solid rgba(255,255,255,0.25)',
                minWidth: 'clamp(110px, 25vw, 200px)'
              }}>
                <span style={{ fontSize:'clamp(2.5rem, 8vw, 4.8rem)' }}>{activeItem.emoji}</span>
                <span style={{ fontSize:'clamp(1.3rem, 4vw, 2.6rem)', fontWeight:'700' }}>{activeItem.word}</span>
              </div>
            )}
          </div>
          
          {/* Display Forms (أول، وسط، آخر) */}
          {activeItem.forms && (
            <div style={{
              display: 'flex', gap: 'clamp(6px, 1.5vw, 15px)', marginTop: 'clamp(6px, 1.5vh, 16px)', flexWrap: 'wrap',
              backgroundColor: 'rgba(255,255,255,0.2)', padding: 'clamp(10px, 1.8vh, 18px)', borderRadius: '16px',
              width: '100%', justifyContent: 'space-around', border:'2px solid rgba(255,255,255,0.25)',
              boxSizing: 'border-box'
            }}>
              {(activeItem.forms || '').split(' ').filter(Boolean).map((form, idx) => {
                const labels = ['مفرد', 'أول الكلمة', 'وسط الكلمة', 'آخر الكلمة'];
                return (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 'clamp(55px, 18vw, 85px)' }}>
                    <span style={{ fontSize: 'clamp(1.8rem, 6vw, 3.2rem)', fontWeight: 'bold' }}>{form}</span>
                    <span style={{ fontSize: 'clamp(0.7rem, 2.5vw, 0.95rem)', opacity: 0.9, backgroundColor: 'rgba(0,0,0,0.2)', padding: '3px 8px', borderRadius: '14px', whiteSpace: 'nowrap' }}>{labels[idx] || 'شكل'}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes popIn {
          0% { transform: scale(0.5); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

