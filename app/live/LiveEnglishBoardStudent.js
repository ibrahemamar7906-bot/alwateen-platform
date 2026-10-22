'use client'

import { useState, useEffect, useRef } from 'react'
import { speakWhenReady } from '../../utils/tts'

export default function LiveEnglishBoardStudent({ channel }) {
  const [activeItem, setActiveItem] = useState(null)
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
        if (payload.isTracing !== undefined) setIsTracing(payload.isTracing);
        if (payload.studentHasControl !== undefined) setStudentHasControl(payload.studentHasControl);

        clearCanvasLocal();
        return;
      }

      if (!isMounted || !payload) return
      
      if (payload.action === 'select_letter') {
        const item = typeof payload.item === 'string' 
          ? { letter: payload.item, word: '', emoji: '' } 
          : (payload.item || { letter: payload.letter, word: '', emoji: '' })
          
        setActiveItem(item)
        
        if (payload.isTracing !== undefined) setIsTracing(payload.isTracing)
        if (payload.studentHasControl !== undefined) setStudentHasControl(payload.studentHasControl)
        
        clearCanvasLocal()
        
        // Auto pronounce when letter changes
        speakWhenReady(`${item.letter}, ${item.word}`, 'UK English Female')
      } else if (payload.action === 'pronounce_letter') {
        const item = payload.item
        speakWhenReady(`${item.letter}, ${item.word}`, 'UK English Female')
      } else if (payload.action === 'toggle_tracing') {
        setIsTracing(payload.isTracing)
        if (payload.studentHasControl !== undefined) setStudentHasControl(payload.studentHasControl)
        clearCanvasLocal()
      } else if (payload.action === 'update_control') {
        setStudentHasControl(payload.studentHasControl)
      } else if (payload.action === 'clear') {
        setActiveItem(null)
        setIsTracing(false)
        clearCanvasLocal()
      } else if (payload.action === 'english_trace_draw') {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        
        ctx.lineWidth = 15
        ctx.lineCap = 'round'
        ctx.strokeStyle = payload.color || '#3b82f6' // Teacher usually blue in english
        
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
    window.addEventListener('on_english_board_action', handler)

    // Request initial state from teacher for late joiners
    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'english_board_action_request',
        payload: { action: 'request_sync' }
      }).catch(err => console.error('Request sync error:', err));
    }

    return () => {
      isMounted = false
      window.removeEventListener('on_english_board_action', handler)
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
        event: 'english_board_action_student',
        payload: { action: 'english_trace_clear' }
      }).catch(err => console.error('Broadcast error:', err))
    }
  }

  // Drawing Handlers
  const sendDrawEvent = (x, y, type) => {
    if (!channel) return
    channel.send({
      type: 'broadcast',
      event: 'english_board_action_student',
      payload: { action: 'english_trace_draw', x, y, type, color: '#ef4444' } // Student color: Red
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
    ctx.strokeStyle = '#ef4444' // Student color: Red
    
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
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
        color: '#94a3b8', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Inter', sans-serif", padding: '20px', textAlign: 'center'
      }}>
        <div style={{ fontSize: '5rem', marginBottom: '16px', animation: 'pulse 2s infinite' }}>✏️</div>
        <h2 style={{ fontSize: '1.4rem', color: '#64748b', fontWeight: '600' }}>Waiting for the teacher...</h2>
        <style>{`@keyframes pulse { 0%,100%{opacity:0.4;transform:scale(1)} 50%{opacity:0.8;transform:scale(1.1)} }`}</style>
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%', width: '100%',
      background: isTracing
        ? 'linear-gradient(160deg, #f0f4ff 0%, #e8eeff 100%)'
        : 'linear-gradient(160deg, #4338ca 0%, #4f46e5 50%, #6366f1 100%)',
      color: isTracing ? '#0f172a' : 'white',
      alignItems: 'center', justifyContent: isTracing ? 'center' : 'flex-start',
      fontFamily: "'Inter', sans-serif",
      position: 'relative', overflowY: 'auto', overflowX: 'hidden', padding: 'clamp(8px, 1.5vh, 16px)', gap: '10px',
      boxSizing: 'border-box', WebkitOverflowScrolling: 'touch'
    }}>

      {!isTracing && (<>
        <div style={{ position:'absolute', top:'-60px', right:'-60px', width:'200px', height:'200px', borderRadius:'50%', background:'rgba(255,255,255,0.06)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:'-80px', left:'-40px', width:'250px', height:'250px', borderRadius:'50%', background:'rgba(255,255,255,0.04)', pointerEvents:'none' }} />
      </>)}

      {isTracing ? (
        /* ── TRACING MODE ─────────────────────────────── */
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', width:'100%', height:'100%', gap:'8px' }}>

          {/* Top info bar */}
          <div style={{
            display:'flex', alignItems:'center', justifyContent:'space-between',
            width:'100%', maxWidth:'420px', padding:'8px 16px',
            background:'rgba(255,255,255,0.92)', borderRadius:'16px',
            boxShadow:'0 2px 8px rgba(0,0,0,0.08)', flexShrink: 0
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
              <span style={{ fontSize:'1.8rem' }}>{activeItem.emoji}</span>
              <div>
                <div style={{ fontWeight:'800', fontSize:'1.3rem', color:'#0f172a', lineHeight:1, fontFamily:"'Comic Sans MS', cursive" }}>{activeItem.letter}</div>
                <div style={{ fontSize:'0.75rem', color:'#64748b' }}>{activeItem.word}</div>
              </div>
            </div>
            {studentHasControl ? (
              <button onClick={clearCanvasAndBroadcast} style={{
                padding:'6px 14px', borderRadius:'10px', border:'none',
                background:'linear-gradient(135deg,#ef4444,#dc2626)', color:'white',
                fontWeight:'bold', cursor:'pointer', fontSize:'0.85rem',
                boxShadow:'0 2px 6px rgba(239,68,68,0.4)'
              }}>
                Clear 🧹
              </button>
            ) : (
              <span style={{ fontSize:'0.8rem', color:'#ef4444', fontWeight:'bold' }}>🔒 Locked</span>
            )}
          </div>

          {/* Main canvas area */}
          <div style={{
            position:'relative',
            width: '100%',
            maxWidth: 'min(400px, 88vw, calc((100vh - 140px) * 10 / 14))',
            maxHeight: 'min(65vh, 520px)',
            aspectRatio: '10 / 14',
            background:'white', borderRadius:'24px',
            boxShadow:'0 8px 32px rgba(79,70,229,0.15), 0 2px 8px rgba(0,0,0,0.06)',
            border:'3px solid #e0e7ff', overflow:'hidden',
            margin: 'auto 0'
          }}>
            {/* English writing guide lines (4-line system in exact 1000x1400 coordinate space) */}
            <svg viewBox="0 0 1000 1400" style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:1 }}>
              {/* Top line */}
              <line x1="50" y1="350" x2="950" y2="350" stroke="#fde68a" strokeWidth="4" strokeDasharray="16,16"/>
              {/* Waist line */}
              <line x1="50" y1="580" x2="950" y2="580" stroke="#bfdbfe" strokeWidth="4" />
              {/* Base line */}
              <line x1="50" y1="880" x2="950" y2="880" stroke="#93c5fd" strokeWidth="5" />
              {/* Descender line */}
              <line x1="50" y1="1100" x2="950" y2="1100" stroke="#fde68a" strokeWidth="4" strokeDasharray="16,16"/>
              {/* Vertical margin */}
              <line x1="100" y1="0" x2="100" y2="1400" stroke="#fde68a" strokeWidth="4" opacity="0.5"/>
            </svg>

            {/* Ghost letter */}
            <svg viewBox="0 0 1000 1400" style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:2 }}>
              <text x="506" y="706" textAnchor="middle" dominantBaseline="central"
                fontSize="420" fill="none" stroke="#e0e7ff" strokeWidth="30"
                fontWeight="bold" fontFamily="'Comic Sans MS', cursive, sans-serif">
                {activeItem?.forms || activeItem?.letter}
              </text>
              <text x="500" y="700" textAnchor="middle" dominantBaseline="central"
                fontSize="420" fill="none" stroke="#c7d2fe" strokeWidth="6"
                strokeDasharray="22,14" fontWeight="bold"
                fontFamily="'Comic Sans MS', cursive, sans-serif"
                strokeLinecap="round">
                {activeItem?.forms || activeItem?.letter}
              </text>
            </svg>

            <div style={{ position:'absolute', top:'8px', left:'50%', transform:'translateX(-50%)', zIndex:3, opacity:0.5, fontSize:'0.7rem', color:'#4f46e5', fontWeight:'bold', whiteSpace:'nowrap' }}>
              ✏️ Draw here
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

          {/* Pen indicator */}
          <div style={{ display:'flex', alignItems:'center', gap:'6px', flexShrink:0 }}>
            <div style={{ width:'12px', height:'12px', borderRadius:'50%', background: studentHasControl ? '#ef4444' : '#94a3b8' }} />
            <span style={{ fontSize:'0.75rem', color:'#64748b' }}>
              {studentHasControl ? '✏️ قلمك بالأحمر (المعلم بالأزرق)' : '🔒 التحكم مغلق بيد المعلم'}
            </span>
          </div>
        </div>

      ) : (
        /* ── DISPLAY MODE ─────────────────────────────── */
        <div style={{
          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
          gap:'clamp(8px, 1.5vh, 16px)', animation:'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
          width: '100%', maxWidth: '800px', margin: 'auto 0', padding: '0 8px', boxSizing: 'border-box'
        }}>
          {activeItem.type === 'sentence' ? (
            <>
              <div style={{
                background:'rgba(255,255,255,0.18)', backdropFilter:'blur(8px)',
                borderRadius:'24px', padding:'clamp(16px, 3vh, 32px) clamp(16px, 3vw, 28px)', width: '100%', maxWidth: '700px',
                boxShadow:'0 15px 40px rgba(0,0,0,0.15)',
                border:'2px solid rgba(255,255,255,0.3)',
                textAlign:'center', display: 'flex', flexDirection: 'column', gap: 'clamp(8px, 1.5vh, 16px)',
                boxSizing: 'border-box'
              }}>
                <div style={{ fontSize: 'clamp(2.5rem, 8vw, 4rem)' }}>{activeItem.emoji}</div>
                <div style={{
                  fontSize: 'clamp(1.4rem, 5vw, 3rem)',
                  fontWeight:'900', lineHeight: 1.3,
                  textShadow:'0 4px 16px rgba(0,0,0,0.2)',
                  fontFamily:"'Inter', sans-serif"
                }}>
                  {activeItem.en}
                </div>
              </div>
              <div style={{
                background:'rgba(255,255,255,0.2)', borderRadius:'16px',
                padding:'clamp(8px, 1.5vh, 14px) clamp(16px, 4vw, 32px)', border:'2px solid rgba(255,255,255,0.25)',
                fontSize:'clamp(1.1rem, 4vw, 1.8rem)', fontWeight:'700',
                color: '#ffedd5', textAlign: 'center'
              }}>
                {activeItem.ar}
              </div>
            </>
          ) : (
            <>
              {/* Letter card - shows Capital AND Small */}
              <div style={{
                background:'rgba(255,255,255,0.18)', backdropFilter:'blur(8px)',
                borderRadius:'24px', padding:'clamp(14px, 2.5vh, 28px) clamp(20px, 5vw, 44px)',
                boxShadow:'0 15px 40px rgba(0,0,0,0.15)',
                border:'2px solid rgba(255,255,255,0.3)',
                textAlign:'center', display: 'flex', alignItems: 'center', justifyContent: 'center',
                minWidth: 'clamp(120px, 30vw, 220px)'
              }}>
                <div style={{
                  fontSize: 'clamp(4rem, 16vw, 10rem)',
                  fontWeight:'900', lineHeight:1,
                  textShadow:'0 6px 20px rgba(0,0,0,0.2)',
                  fontFamily:"'Comic Sans MS', cursive, sans-serif",
                  letterSpacing: '-0.02em'
                }}>
                  {activeItem.forms || `${activeItem.letter}${activeItem.letter.toLowerCase()}`}
                </div>
              </div>

              {activeItem.word && (
                <div style={{
                  display:'flex', alignItems:'center', gap:'clamp(8px, 2vw, 12px)',
                  background:'rgba(255,255,255,0.2)', borderRadius:'18px',
                  padding:'clamp(8px, 1.5vh, 14px) clamp(16px, 4vw, 28px)', border:'2px solid rgba(255,255,255,0.25)'
                }}>
                  <span style={{ fontSize:'clamp(2rem, 6vw, 2.8rem)' }}>{activeItem.emoji}</span>
                  <span style={{ fontSize:'clamp(1.3rem, 4.5vw, 2.2rem)', fontWeight:'700' }}>{activeItem.word}</span>
                </div>
              )}
            </>
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
