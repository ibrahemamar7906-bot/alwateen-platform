'use client'

import { useState, useEffect, useRef } from 'react'
import { speakWhenReady } from '../../../utils/tts'
import { Hash, Calculator, HelpCircle, Eraser, Trash2, Mic2 } from 'lucide-react'

const NUMBERS = [
  { value: '0', word: 'صِفْر' },
  { value: '1', word: 'وَاحِد' },
  { value: '2', word: 'اِثْنَان' },
  { value: '3', word: 'ثَلَاثَة' },
  { value: '4', word: 'أَرْبَعَة' },
  { value: '5', word: 'خَمْسَة' },
  { value: '6', word: 'سِتَّة' },
  { value: '7', word: 'سَبْعَة' },
  { value: '8', word: 'ثَمَانِيَة' },
  { value: '9', word: 'تِسْعَة' },
  { value: '10', word: 'عَشَرَة' }
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

export default function LiveMathBoardTeacher({ channel }) {
  const [activeTab, setActiveTab] = useState('numbers') // numbers, table, practice
  const [activeNumber, setActiveNumber] = useState(null)
  
  // Table state
  const [selectedTable, setSelectedTable] = useState(2)
  const [activeEquation, setActiveEquation] = useState(null)

  // Practice state
  const [practiceEquation, setPracticeEquation] = useState(null)

  const [studentHasControl, setStudentHasControl] = useState(true)
  const canvasRef = useRef(null)

  const activeTabRef = useRef(activeTab);
  useEffect(() => { activeTabRef.current = activeTab; }, [activeTab]);
  const activeNumberRef = useRef(activeNumber);
  useEffect(() => { activeNumberRef.current = activeNumber; }, [activeNumber]);
  const selectedTableRef = useRef(selectedTable);
  useEffect(() => { selectedTableRef.current = selectedTable; }, [selectedTable]);
  const activeEquationRef = useRef(activeEquation);
  useEffect(() => { activeEquationRef.current = activeEquation; }, [activeEquation]);
  const practiceEquationRef = useRef(practiceEquation);
  useEffect(() => { practiceEquationRef.current = practiceEquation; }, [practiceEquation]);
  const studentHasControlRef = useRef(studentHasControl);
  useEffect(() => { studentHasControlRef.current = studentHasControl; }, [studentHasControl]);

  const [isDrawing, setIsDrawing] = useState(false)

  // Handle incoming student drawings
  useEffect(() => {
    if (!channel) return
    let isMounted = true

    const handleBroadcast = ({ payload }) => {
      if (!isMounted || !payload) return
      
      if (payload.action === 'math_board_draw') {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        
        ctx.lineWidth = 15
        ctx.lineCap = 'round'
        ctx.strokeStyle = payload.color || '#2563eb'
        
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

    channel.on('broadcast', { event: 'math_board_action' }, handleBroadcast)

    return () => {
      isMounted = false
      removeBroadcastBinding(channel, 'math_board_action', handleBroadcast)
    }
  }, [channel])

  // Sync state to student when tabs or content change
  useEffect(() => {
    if (!channel) return
    let isMounted = true
    const syncState = () => {
      if (!isMounted) return
      channel.send({
        type: 'broadcast',
        event: 'math_board_state',
        payload: { 
          activeTab, activeNumber, selectedTable, activeEquation, practiceEquation, studentHasControl 
        }
      }).catch(err => console.error('Broadcast error:', err))
    }
    
    // Broadcast on change
    syncState()

    const handleSyncRequest = ({ payload }) => {
      if (!isMounted) return
      if (payload?.action === 'request_sync') {
        syncState()
      }
    }
    channel.on('broadcast', { event: 'math_board_action_request' }, handleSyncRequest)

    // Broadcast on late join request
    window.addEventListener('on_global_sync_request', syncState)
    return () => {
      isMounted = false
      window.removeEventListener('on_global_sync_request', syncState)
      removeBroadcastBinding(channel, 'math_board_action_request', handleSyncRequest)
    }
  }, [activeTab, activeNumber, selectedTable, activeEquation, practiceEquation, studentHasControl, channel])

  const handleSelectNumber = (numObj) => {
    setActiveNumber(numObj)
    speakWhenReady(numObj.word, 'Arabic Male')
    clearCanvasLocal()
  }

  const handleSelectEquation = (a, b) => {
    setActiveEquation({ a, b, res: a * b })
    const eqWord = `${a} في ${b} يساوي ${a * b}`
    speakWhenReady(eqWord, 'Arabic Male')
  }

  const generatePractice = (operation) => {
    let a, b, res
    let typeChar = ''
    let spokenText = ''

    if (operation === 'add') {
      a = Math.floor(Math.random() * 50) + 1
      b = Math.floor(Math.random() * 50) + 1
      res = a + b
      typeChar = '+'
      spokenText = `كم يساوي ${a} زائد ${b}؟`
    } else if (operation === 'sub') {
      a = Math.floor(Math.random() * 50) + 20
      b = Math.floor(Math.random() * 20) + 1
      res = a - b
      typeChar = '-'
      spokenText = `كم يساوي ${a} ناقص ${b}؟`
    } else if (operation === 'mul') {
      a = Math.floor(Math.random() * 10) + 1
      b = Math.floor(Math.random() * 10) + 1
      res = a * b
      typeChar = '×'
      spokenText = `كم يساوي ${a} ضرب ${b}؟`
    } else if (operation === 'div') {
      b = Math.floor(Math.random() * 10) + 1
      const ans = Math.floor(Math.random() * 10) + 1
      a = b * ans
      res = ans
      typeChar = '÷'
      spokenText = `كم يساوي ${a} قسمة ${b}؟`
    }

    setPracticeEquation({ type: typeChar, a, b, res })
    speakWhenReady(spokenText, 'Arabic Male')
    clearCanvasLocal()
  }

  const handleClear = () => {
    clearCanvasLocal()
    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'math_board_action',
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

  // Teacher Drawing Logic
  const sendDrawEvent = (x, y, type) => {
    if (!channel) return
    channel.send({
      type: 'broadcast',
      event: 'math_board_action',
      payload: { action: 'math_board_draw', x, y, type, color: '#ef4444' } // Teacher Red
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
    
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    
    const x = (clientX - rect.left) * scaleX
    const y = (clientY - rect.top) * scaleY

    ctx.lineWidth = 15
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#ef4444'
    
    ctx.lineTo(x, y)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(x, y)

    sendDrawEvent(x, y, forceType)
  }

  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex', flexDirection: 'column', 
      background: '#f8fafc', borderRadius: '16px', overflow: 'hidden', fontFamily: 'Tajawal, sans-serif'
    }}>
      {/* Tabs */}
      <div style={{ display: 'flex', background: '#1e293b', padding: '10px', gap: '10px', overflowX: 'auto' }}>
        <button onClick={() => setActiveTab('numbers')} style={{
          padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
          background: activeTab === 'numbers' ? '#3b82f6' : 'rgba(255,255,255,0.1)',
          color: 'white', fontWeight: 'bold'
        }}>
          <Hash size={18} /> الأرقام
        </button>
        <button onClick={() => setActiveTab('table')} style={{
          padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
          background: activeTab === 'table' ? '#3b82f6' : 'rgba(255,255,255,0.1)',
          color: 'white', fontWeight: 'bold'
        }}>
          <Calculator size={18} /> جدول الضرب
        </button>
        <button onClick={() => setActiveTab('practice')} style={{
          padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
          background: activeTab === 'practice' ? '#3b82f6' : 'rgba(255,255,255,0.1)',
          color: 'white', fontWeight: 'bold'
        }}>
          <HelpCircle size={18} /> تدريب
        </button>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => setStudentHasControl(!studentHasControl)}
            style={{
              padding: '6px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              background: studentHasControl ? '#10b981' : '#64748b', color: 'white', fontWeight: 'bold', fontSize: '0.8rem'
            }}
          >
            {studentHasControl ? 'قلم الطالب: مفعل' : 'قلم الطالب: متوقف'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', flex: 1, minHeight: 0, overflowY: 'auto' }}>
        
        {/* Left Side: Controls based on active tab */}
        <div style={{ flex: '1 1 300px', maxWidth: '100%', background: 'white', borderLeft: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
          
          {activeTab === 'numbers' && (
            <div style={{ padding: '15px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {NUMBERS.map((n, i) => (
                <button 
                  key={i}
                  onClick={() => handleSelectNumber(n)}
                  style={{
                    padding: '15px', borderRadius: '12px', border: '2px solid',
                    borderColor: activeNumber?.value === n.value ? '#3b82f6' : '#e2e8f0',
                    background: activeNumber?.value === n.value ? '#eff6ff' : 'white',
                    cursor: 'pointer', fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b'
                  }}
                >
                  {n.value}
                </button>
              ))}
            </div>
          )}

          {activeTab === 'table' && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', overflowX: 'auto', padding: '10px', gap: '5px', background: '#f1f5f9' }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(t => (
                  <button 
                    key={t}
                    onClick={() => setSelectedTable(t)}
                    style={{
                      minWidth: '40px', height: '40px', borderRadius: '50%', border: 'none',
                      background: selectedTable === t ? '#3b82f6' : 'white',
                      color: selectedTable === t ? 'white' : '#64748b',
                      fontWeight: 'bold', cursor: 'pointer', flexShrink: 0,
                      boxShadow: selectedTable === t ? '0 4px 10px rgba(59,130,246,0.3)' : '0 2px 4px rgba(0,0,0,0.05)'
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div style={{ padding: '15px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(mult => (
                  <button
                    key={mult}
                    onClick={() => handleSelectEquation(selectedTable, mult)}
                    style={{
                      padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0',
                      background: activeEquation?.a === selectedTable && activeEquation?.b === mult ? '#dbeafe' : 'white',
                      cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      fontSize: '1.2rem', fontWeight: 'bold', color: '#1e293b', transition: 'all 0.2s'
                    }}
                  >
                    <span>{selectedTable} × {mult}</span>
                    <span style={{ color: '#3b82f6' }}>= {selectedTable * mult}</span>
                    {activeEquation?.a === selectedTable && activeEquation?.b === mult && <Mic2 size={16} color="#3b82f6" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'practice' && (
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', width: '100%' }}>
                <button 
                  onClick={() => generatePractice('add')}
                  style={{
                    padding: '12px', borderRadius: '12px', border: 'none',
                    background: '#10b981', color: 'white', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer',
                    boxShadow: '0 4px 10px rgba(16,185,129,0.3)'
                  }}
                >
                  ➕ مسألة جمع
                </button>
                <button 
                  onClick={() => generatePractice('sub')}
                  style={{
                    padding: '12px', borderRadius: '12px', border: 'none',
                    background: '#f59e0b', color: 'white', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer',
                    boxShadow: '0 4px 10px rgba(245,158,11,0.3)'
                  }}
                >
                  ➖ مسألة طرح
                </button>
                <button 
                  onClick={() => generatePractice('mul')}
                  style={{
                    padding: '12px', borderRadius: '12px', border: 'none',
                    background: '#3b82f6', color: 'white', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer',
                    boxShadow: '0 4px 10px rgba(59,130,246,0.3)'
                  }}
                >
                  ✖️ مسألة ضرب
                </button>
                <button 
                  onClick={() => generatePractice('div')}
                  style={{
                    padding: '12px', borderRadius: '12px', border: 'none',
                    background: '#8b5cf6', color: 'white', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer',
                    boxShadow: '0 4px 10px rgba(139,92,246,0.3)'
                  }}
                >
                  ➗ مسألة قسمة
                </button>
              </div>
              <button 
                onClick={handleClear}
                style={{
                  width: '100%', padding: '15px', borderRadius: '12px', border: '2px solid #ef4444',
                  background: 'white', color: '#ef4444', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
                  fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px'
                }}
              >
                <Eraser size={20} /> مسح السبورة
              </button>
            </div>
          )}

        </div>

        {/* Right Side: The Interactive Board Area */}
        <div style={{ flex: '3 1 400px', minHeight: '400px', position: 'relative', background: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
          
          {/* Responsive Container (Aspect Ratio 4:3) */}
          <div style={{ position: 'relative', width: '100%', maxWidth: '800px', aspectRatio: '4 / 3', backgroundColor: 'white', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
            
            {/* SVG Background Layer for crisp text and perfect coordinate scaling */}
            <svg viewBox="0 0 1000 750" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
              {activeTab === 'numbers' && activeNumber && (
                <text x="500" y="375" textAnchor="middle" dominantBaseline="central" fontSize="500" fill="#f1f5f9" fontWeight="900" fontFamily="sans-serif">
                  {activeNumber.value}
                </text>
              )}
              {activeTab === 'table' && activeEquation && (
                <>
                  <text x="500" y="300" textAnchor="middle" dominantBaseline="central" fontSize="120" fill="#334155" fontWeight="900" fontFamily="Tajawal, sans-serif">
                    {activeEquation.a} × {activeEquation.b}
                  </text>
                  <text x="500" y="450" textAnchor="middle" dominantBaseline="central" fontSize="120" fill="#bae6fd" fontWeight="900" fontFamily="Tajawal, sans-serif">
                    = {activeEquation.res}
                  </text>
                </>
              )}
              {activeTab === 'practice' && practiceEquation && (
                <text x="500" y="150" textAnchor="middle" dominantBaseline="central" fontSize="80" fill="#334155" fontWeight="900" fontFamily="Tajawal, sans-serif">
                  {practiceEquation.a} {practiceEquation.type} {practiceEquation.b} = ؟
                </text>
              )}
            </svg>

            {/* Drawing Canvas */}
            {(activeTab === 'numbers' || activeTab === 'practice') && (
              <canvas
                ref={canvasRef}
                width={1000}
                height={750}
                onPointerDown={startDrawing}
                onPointerMove={draw}
                onPointerUp={stopDrawing}
                onPointerOut={stopDrawing}
                style={{
                  position: 'absolute', inset: 0, width: '100%', height: '100%',
                  touchAction: 'none', zIndex: 10, cursor: 'crosshair'
                }}
              />
            )}

            {/* Quick Clear Button overlay */}
            {(activeTab === 'numbers' || activeTab === 'practice') && (
              <button
                onClick={handleClear}
                style={{
                  position: 'absolute', bottom: '20px', right: '20px', zIndex: 20,
                  width: '50px', height: '50px', borderRadius: '25px', border: 'none',
                  background: '#ef4444', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', boxShadow: '0 4px 12px rgba(239,68,68,0.4)'
                }}
              >
                <Trash2 size={24} />
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
