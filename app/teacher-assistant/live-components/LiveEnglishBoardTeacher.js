'use client'

import { useState, useEffect, useRef } from 'react'
import { speakWhenReady } from '../../../utils/tts'

const LETTERS_DATA = [
  { letter: 'A', forms: 'Aa', word: 'Apple', emoji: '🍎' },
  { letter: 'B', forms: 'Bb', word: 'Book', emoji: '📖' },
  { letter: 'C', forms: 'Cc', word: 'Cat', emoji: '🐱' },
  { letter: 'D', forms: 'Dd', word: 'Dog', emoji: '🐶' },
  { letter: 'E', forms: 'Ee', word: 'Elephant', emoji: '🐘' },
  { letter: 'F', forms: 'Ff', word: 'Fish', emoji: '🐟' },
  { letter: 'G', forms: 'Gg', word: 'Giraffe', emoji: '🦒' },
  { letter: 'H', forms: 'Hh', word: 'Hat', emoji: '🎩' },
  { letter: 'I', forms: 'Ii', word: 'Ice cream', emoji: '🍦' },
  { letter: 'J', forms: 'Jj', word: 'Juice', emoji: '🧃' },
  { letter: 'K', forms: 'Kk', word: 'Kite', emoji: '🪁' },
  { letter: 'L', forms: 'Ll', word: 'Lion', emoji: '🦁' },
  { letter: 'M', forms: 'Mm', word: 'Moon', emoji: '🌙' },
  { letter: 'N', forms: 'Nn', word: 'Nest', emoji: '🪺' },
  { letter: 'O', forms: 'Oo', word: 'Orange', emoji: '🍊' },
  { letter: 'P', forms: 'Pp', word: 'Pencil', emoji: '✏️' },
  { letter: 'Q', forms: 'Qq', word: 'Queen', emoji: '👑' },
  { letter: 'R', forms: 'Rr', word: 'Rainbow', emoji: '🌈' },
  { letter: 'S', forms: 'Ss', word: 'Sun', emoji: '☀️' },
  { letter: 'T', forms: 'Tt', word: 'Tree', emoji: '🌳' },
  { letter: 'U', forms: 'Uu', word: 'Umbrella', emoji: '☂️' },
  { letter: 'V', forms: 'Vv', word: 'Violin', emoji: '🎻' },
  { letter: 'W', forms: 'Ww', word: 'Watch', emoji: '⌚' },
  { letter: 'X', forms: 'Xx', word: 'Xylophone', emoji: '🎵' },
  { letter: 'Y', forms: 'Yy', word: 'Yacht', emoji: '⛵' },
  { letter: 'Z', forms: 'Zz', word: 'Zebra', emoji: '🦓' }
]

const SENTENCES_DATA = [
  { type: 'sentence', en: 'Good morning', ar: 'صباح الخير', emoji: '🌅' },
  { type: 'sentence', en: 'How are you?', ar: 'كيف حالك؟', emoji: '👋' },
  { type: 'sentence', en: 'I love my school', ar: 'أنا أحب مدرستي', emoji: '🏫' },
  { type: 'sentence', en: 'This is a book', ar: 'هذا كتاب', emoji: '📖' },
  { type: 'sentence', en: 'My name is Ali', ar: 'اسمي علي', emoji: '👦' },
  { type: 'sentence', en: 'Thank you', ar: 'شكراً لك', emoji: '🙏' },
  { type: 'sentence', en: 'Goodbye', ar: 'مع السلامة', emoji: '👋' },
  { type: 'sentence', en: 'What is your name?', ar: 'ما اسمك؟', emoji: '❓' },
  { type: 'sentence', en: 'I am happy', ar: 'أنا سعيد', emoji: '😊' },
  { type: 'sentence', en: "Let's play", ar: 'هيا نلعب', emoji: '🎮' }
]

function removeBroadcastBinding(channel, event, callback) {
  if (!channel) return
  try {
    if (channel.bindings && Array.isArray(channel.bindings.broadcast)) {
      const binding = channel.bindings.broadcast.find(b => b.callback === callback)
      if (binding) {
        if (channel.channelAdapter && typeof channel.channelAdapter.off === 'function') {
          channel.channelAdapter.off('broadcast', binding.ref)
        }
        channel.bindings.broadcast = channel.bindings.broadcast.filter(b => b !== binding)
      }
    }
  } catch (e) {
    // safe fallback
  }
}

export default function LiveEnglishBoardTeacher({ channel }) {
  const [activeTab, setActiveTab] = useState('letters') // letters, sentences
  const [activeItem, setActiveItem] = useState(LETTERS_DATA[0])
  const [isTracing, setIsTracing] = useState(false)
  const [studentHasControl, setStudentHasControl] = useState(true)
  const canvasRef = useRef(null)

  const activeItemRef = useRef(activeItem);
  useEffect(() => { activeItemRef.current = activeItem; }, [activeItem]);
  const isTracingRef = useRef(isTracing);
  useEffect(() => { isTracingRef.current = isTracing; }, [isTracing]);
  const studentHasControlRef = useRef(studentHasControl);
  useEffect(() => { studentHasControlRef.current = studentHasControl; }, [studentHasControl]);

  const [isDrawing, setIsDrawing] = useState(false)

  // Listen for student drawing events
  useEffect(() => {
    if (!channel) return
    let isMounted = true

    const handleBroadcast = ({ payload }) => {
      if (!isMounted || !payload) return
      
      if (payload.action === 'english_trace_draw') {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        
        ctx.lineWidth = 15
        ctx.lineCap = 'round'
        ctx.strokeStyle = payload.color || '#ef4444' // Student usually red
        
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
      } else if (payload.action === 'english_trace_clear') {
        clearCanvasLocal()
      }
    }

    channel.on('broadcast', { event: 'english_board_action_student' }, handleBroadcast)

    const handleSyncRequest = ({ payload }) => {
      if (!isMounted) return;
      if (payload?.action === 'request_sync') {
        channel.send({
          type: 'broadcast',
          event: 'english_board_action',
          payload: { action: 'sync_state', activeItem: activeItemRef.current, isTracing: isTracingRef.current, studentHasControl: studentHasControlRef.current }
        }).catch(err => console.error('Sync Broadcast error:', err));
      }
    };
    channel.on('broadcast', { event: 'english_board_action_request' }, handleSyncRequest);

    return () => {
      isMounted = false
      removeBroadcastBinding(channel, 'english_board_action_student', handleBroadcast)
      removeBroadcastBinding(channel, 'english_board_action_request', handleSyncRequest)
    }
  }, [channel])

  // Handle global sync request for late joiners
  useEffect(() => {
    if (!channel) return
    let isMounted = true
    const handleSync = () => {
      if (!isMounted) return
      if (activeItemRef.current) {
        channel.send({
          type: 'broadcast',
          event: 'english_board_action',
          payload: { action: 'select_letter', item: activeItemRef.current, isTracing: isTracingRef.current, studentHasControl: studentHasControlRef.current }
        }).catch(err => console.error('Broadcast error:', err))
      }
    }
    window.addEventListener('on_global_sync_request', handleSync)
    return () => {
      isMounted = false
      window.removeEventListener('on_global_sync_request', handleSync)
    }
  }, [channel])

  const handleLetterClick = (item) => {
    setActiveItem(item)
    const textToSpeak = item.type === 'sentence' ? item.en : `${item.letter}, ${item.word}`
    speakWhenReady(textToSpeak, 'UK English Female')
    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'english_board_action',
        payload: { action: 'select_letter', item, isTracing, studentHasControl }
      }).catch(err => console.error('Broadcast error:', err))
    }
  }

  const handlePronounce = () => {
    if (!activeItem) return
    const textToSpeak = activeItem.type === 'sentence' ? activeItem.en : `${activeItem.letter}, ${activeItem.word}`
    speakWhenReady(textToSpeak, 'UK English Female')
    if (!channel) return
    channel.send({
      type: 'broadcast',
      event: 'english_board_action',
      payload: { action: 'pronounce_letter', item: activeItem }
    }).catch(err => console.error('Broadcast error:', err))
  }

  const handleToggleTracing = () => {
    const newTracingState = !isTracing
    setIsTracing(newTracingState)
    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'english_board_action',
        payload: { action: 'toggle_tracing', isTracing: newTracingState, studentHasControl }
      }).catch(err => console.error('Broadcast error:', err))
    }
  }

  const handleToggleStudentControl = () => {
    const newControlState = !studentHasControl
    setStudentHasControl(newControlState)
    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'english_board_action',
        payload: { action: 'update_control', studentHasControl: newControlState }
      }).catch(err => console.error('Broadcast error:', err))
    }
  }

  const handleClear = () => {
    setActiveItem(null)
    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'english_board_action',
        payload: { action: 'clear' }
      }).catch(err => console.error('Broadcast error:', err))
    }
  }

  const clearCanvas = () => {
    clearCanvasLocal()
    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'english_board_action',
        payload: { action: 'clear_trace' }
      }).catch(err => console.error('Broadcast error:', err))
    }
  }
  
  const clearCanvasLocal = () => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  }

  // Teacher Drawing Handlers
  const sendDrawEvent = (x, y, type) => {
    if (!channel) return
    channel.send({
      type: 'broadcast',
      event: 'english_board_action',
      payload: { action: 'english_trace_draw', x, y, type, color: '#3b82f6' } // Teacher color: Blue
    }).catch(err => console.error('Broadcast error:', err))
  }

  const startDrawing = (e) => {
    setIsDrawing(true)
    draw(e, 'start')
  }

  const stopDrawing = () => {
    setIsDrawing(false)
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      ctx.beginPath()
    }
    sendDrawEvent(0, 0, 'end')
  }

  const draw = (e, forceType = null) => {
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
    ctx.strokeStyle = '#3b82f6' // Teacher color: Blue
    
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
    const preventScroll = (e) => e.preventDefault()
    canvas.addEventListener('touchstart', preventScroll, { passive: false })
    canvas.addEventListener('touchmove', preventScroll, { passive: false })
    return () => {
      canvas.removeEventListener('touchstart', preventScroll)
      canvas.removeEventListener('touchmove', preventScroll)
    }
  }, [isTracing, activeItem])
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      backgroundColor: '#f8fafc', color: '#0f172a', direction: 'ltr',
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{
        padding: 'clamp(8px, 1.5vh, 12px) clamp(10px, 2vw, 20px)', backgroundColor: '#4338ca', color: 'white',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', flexShrink: 0
      }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'clamp(1rem, 2.5vw, 1.4rem)' }}>
          <span>🔤</span> English Board (Teacher)
        </h2>
        <button 
          onClick={handleClear}
          style={{
            backgroundColor: '#ef4444', color: 'white', border: 'none',
            padding: '6px 12px', borderRadius: '8px', cursor: 'pointer',
            fontWeight: 'bold', fontSize: 'clamp(0.75rem, 2vw, 0.85rem)'
          }}
        >
          Clear Board
        </button>
      </div>

      {/* Toolbar */}
      <div style={{
        padding: 'clamp(8px, 1.5vh, 12px) clamp(8px, 2vw, 16px)', backgroundColor: '#e2e8f0',
        display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', alignItems: 'center', flexShrink: 0
      }}>
        <button 
          onClick={handlePronounce}
          disabled={!activeItem}
          style={{
            backgroundColor: activeItem ? '#3b82f6' : '#cbd5e1', color: 'white', border: 'none',
            padding: '7px 14px', borderRadius: '8px', cursor: activeItem ? 'pointer' : 'not-allowed',
            fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'clamp(0.78rem, 2.2vw, 0.88rem)'
          }}
        >
          <span>🔊</span> Pronounce Sound
        </button>
        <button 
          onClick={handleToggleTracing}
          style={{
            backgroundColor: isTracing ? '#10b981' : '#f59e0b', color: 'white', border: 'none',
            padding: '7px 14px', borderRadius: '8px', cursor: 'pointer',
            fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'clamp(0.78rem, 2.2vw, 0.88rem)'
          }}
        >
          <span>{isTracing ? '✍️' : '📝'}</span> 
          {isTracing ? 'Close Tracing Board' : 'Open Tracing Board'}
        </button>
        
        {isTracing && activeItem?.type !== 'sentence' && (
          <>
            <button 
              onClick={handleToggleStudentControl}
              style={{
                backgroundColor: studentHasControl ? '#ef4444' : '#10b981', color: 'white', border: 'none',
                padding: '7px 14px', borderRadius: '8px', cursor: 'pointer',
                fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'clamp(0.78rem, 2.2vw, 0.88rem)'
              }}
            >
              <span>{studentHasControl ? '🔒' : '🔓'}</span> 
              {studentHasControl ? 'Lock Student Pen' : 'Unlock Student Pen'}
            </button>
            <button 
              onClick={clearCanvas}
              style={{
                backgroundColor: '#64748b', color: 'white', border: 'none',
                padding: '7px 14px', borderRadius: '8px', cursor: 'pointer',
                fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'clamp(0.78rem, 2.2vw, 0.88rem)'
              }}
            >
              <span>🗑️</span> Clear For All
            </button>
          </>
        )}
      </div>

      <div style={{
        flex: 1, padding: '16px', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'flex-start', overflowY: 'auto'
      }}>
        {isTracing && activeItem?.type !== 'sentence' ? (
          /* Tracing Board for Teacher */
          <div style={{ position: 'relative', width: '100%', maxWidth: 'min(400px, 88vw, calc((100vh - 140px) * 10 / 14))', maxHeight: 'min(65vh, 520px)', aspectRatio: '10 / 14', backgroundColor: 'white', borderRadius: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', marginBottom: '35px', margin: '0 auto 35px' }}>
            <div style={{ position: 'absolute', inset: 0, border: '3px dashed #cbd5e1', borderRadius: '24px', pointerEvents: 'none', zIndex: 1 }} />
            
            {/* English writing guide lines (4-line system) */}
            <svg viewBox="0 0 1000 1400" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
              <line x1="50" y1="350" x2="950" y2="350" stroke="#fde68a" strokeWidth="4" strokeDasharray="16,16"/>
              <line x1="50" y1="580" x2="950" y2="580" stroke="#bfdbfe" strokeWidth="4" />
              <line x1="50" y1="880" x2="950" y2="880" stroke="#93c5fd" strokeWidth="5" />
              <line x1="50" y1="1100" x2="950" y2="1100" stroke="#fde68a" strokeWidth="4" strokeDasharray="16,16"/>
              <line x1="100" y1="0" x2="100" y2="1400" stroke="#fde68a" strokeWidth="4" opacity="0.5"/>
            </svg>

            <svg viewBox="0 0 1000 1400" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 2 }}>
              <text x="500" y="700" textAnchor="middle" dominantBaseline="central" fontSize="450" fill="none" stroke="#e2e8f0" strokeWidth="6" strokeDasharray="20,20" fontWeight="bold" fontFamily="'Comic Sans MS', cursive, sans-serif">
                {activeItem?.forms || activeItem?.letter}
              </text>
            </svg>
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
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 5, borderRadius: '24px', cursor: 'crosshair', touchAction: 'none' }}
            />
            <div style={{ position: 'absolute', bottom: '-30px', width: '100%', textAlign: 'center', color: '#64748b', fontWeight: 'bold', fontSize: '0.85rem' }}>
              Your pen is Blue, Student's pen is Red
            </div>
          </div>
        ) : (
          /* Active Item Display (Preview) */
          <div style={{
            width: activeItem?.type === 'sentence' ? '90%' : 'min(90%, 200px)', 
            maxWidth: '600px',
            minHeight: 'clamp(110px, 18vh, 160px)', 
            backgroundColor: activeItem ? '#4f46e5' : '#e2e8f0',
            color: activeItem ? 'white' : '#cbd5e1',
            borderRadius: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 20px rgba(0,0,0,0.08)', transition: '0.3s', marginBottom: '16px', flexShrink: 0,
            padding: 'clamp(10px, 2vh, 18px)', textAlign: 'center'
          }}>
            {activeItem ? (
              activeItem.type === 'sentence' ? (
                <>
                  <span style={{ fontSize: 'clamp(1.2rem, 4vw, 2.2rem)', fontWeight: 'bold', marginBottom: '8px' }}>{activeItem.en} {activeItem.emoji}</span>
                  <span style={{ fontSize: 'clamp(0.95rem, 3vw, 1.3rem)', opacity: 0.9, backgroundColor: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '12px' }}>{activeItem.ar}</span>
                </>
              ) : (
                <>
                  <span style={{ fontSize: 'clamp(3rem, 10vw, 4.5rem)', fontWeight: 'bold', lineHeight: 1 }}>{activeItem.letter}</span>
                  <span style={{ fontSize: 'clamp(1rem, 3vw, 1.3rem)', opacity: 0.9 }}>{activeItem.word} {activeItem.emoji}</span>
                </>
              )
            ) : (
              <span style={{ fontSize: '3.5rem', fontWeight: 'bold' }}>?</span>
            )}
          </div>
        )}

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button 
            onClick={() => setActiveTab('letters')}
            style={{
              padding: '7px 16px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: 'clamp(0.8rem, 2.2vw, 0.95rem)',
              backgroundColor: activeTab === 'letters' ? '#4f46e5' : '#e2e8f0',
              color: activeTab === 'letters' ? 'white' : '#64748b'
            }}
          >
            🔤 Letters (الحروف)
          </button>
          <button 
            onClick={() => setActiveTab('sentences')}
            style={{
              padding: '7px 16px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: 'clamp(0.8rem, 2.2vw, 0.95rem)',
              backgroundColor: activeTab === 'sentences' ? '#4f46e5' : '#e2e8f0',
              color: activeTab === 'sentences' ? 'white' : '#64748b'
            }}
          >
            💬 Sentences (الجمل)
          </button>
        </div>

        {/* Keyboard / Board */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', maxWidth: '800px', width: '100%'
        }}>
          {activeTab === 'letters' ? LETTERS_DATA.map(item => (
            <button
              key={item.letter}
              onClick={() => handleLetterClick(item)}
              style={{
                width: 'clamp(38px, 9.5vw, 54px)', height: 'clamp(38px, 9.5vw, 54px)', borderRadius: '10px',
                fontSize: 'clamp(1.2rem, 3.8vw, 1.8rem)', fontWeight: 'bold', border: '2px solid #cbd5e1',
                backgroundColor: activeItem?.letter === item.letter ? '#4f46e5' : 'white',
                color: activeItem?.letter === item.letter ? 'white' : '#334155',
                cursor: 'pointer', transition: '0.2s',
                boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              {item.letter}
            </button>
          )) : SENTENCES_DATA.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleLetterClick(item)}
              style={{
                padding: 'clamp(6px, 1.5vh, 10px) clamp(10px, 2.5vw, 16px)', borderRadius: '10px',
                fontSize: 'clamp(0.85rem, 2.5vw, 1.05rem)', fontWeight: 'bold', border: '2px solid #cbd5e1',
                backgroundColor: activeItem?.en === item.en ? '#4f46e5' : 'white',
                color: activeItem?.en === item.en ? 'white' : '#334155',
                cursor: 'pointer', transition: '0.2s',
                boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                display: 'flex', alignItems: 'center', gap: '6px'
              }}
            >
              <span>{item.emoji}</span> {item.en}
            </button>
          ))}
        </div>
        
        <p style={{ marginTop: '25px', color: '#64748b', direction: 'rtl', fontSize: '0.85rem' }}>
          * انقر على أي حرف أو جملة لنطق الصوت وعرضه فوراً على أجهزة الطلاب.
        </p>
      </div>
    </div>
  )
}
