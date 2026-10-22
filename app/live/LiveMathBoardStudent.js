'use client'

import { useState, useEffect, useRef } from 'react'
import { Eraser } from 'lucide-react'
import { speakWhenReady } from '../../utils/tts'

export default function LiveMathBoardStudent({ channel }) {
  const [activeTab, setActiveTab] = useState('numbers')
  const [activeNumber, setActiveNumber] = useState(null)
  const [selectedTable, setSelectedTable] = useState(2)
  const [activeEquation, setActiveEquation] = useState(null)
  const [practiceEquation, setPracticeEquation] = useState(null)
  
  const [studentHasControl, setStudentHasControl] = useState(true)
  const [isDrawing, setIsDrawing] = useState(false)
  const canvasRef = useRef(null)

  // Listen to teacher state and actions
  useEffect(() => {
    if (!channel) return
    let isMounted = true

    const handleState = ({ payload }) => {
      if (!isMounted || !payload) return
      setActiveTab(payload.activeTab || 'numbers')
      setActiveNumber(payload.activeNumber)
      setSelectedTable(payload.selectedTable)
      setActiveEquation(payload.activeEquation)
      setPracticeEquation(payload.practiceEquation)
      setStudentHasControl(payload.studentHasControl)
    }

    const handleAction = ({ payload }) => {
      if (!isMounted || !payload) return
      
      if (payload.action === 'math_board_draw') {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        
        ctx.lineWidth = 15
        ctx.lineCap = 'round'
        ctx.strokeStyle = payload.color || '#ef4444' // Teacher Red
        
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
        const canvas = canvasRef.current
        if (canvas) {
          const ctx = canvas.getContext('2d')
          ctx.clearRect(0, 0, canvas.width, canvas.height)
        }
      }
    }

    const stateHandler = (e) => handleState({ payload: e.detail })
    const actionHandler = (e) => handleAction({ payload: e.detail })
    window.addEventListener('on_math_board_state', stateHandler)
    window.addEventListener('on_math_board_action', actionHandler)

    // Request initial state from teacher for late joiners
    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'math_board_action_request',
        payload: { action: 'request_sync' }
      }).catch(err => console.error('Math sync request error:', err))
    }
    
    return () => {
      isMounted = false
      window.removeEventListener('on_math_board_state', stateHandler)
      window.removeEventListener('on_math_board_action', actionHandler)
    }
  }, [channel])

  // Pronounce Number
  useEffect(() => {
    if (activeNumber && activeTab === 'numbers') {
      speakWhenReady(activeNumber.word, 'Arabic Male')
    }
  }, [activeNumber, activeTab])

  // Pronounce Multiplication Equation
  useEffect(() => {
    if (activeEquation && activeTab === 'table') {
      const eqWord = `${activeEquation.a} في ${activeEquation.b} يساوي ${activeEquation.res}`
      speakWhenReady(eqWord, 'Arabic Male')
    }
  }, [activeEquation, activeTab])

  // Pronounce Practice Question
  useEffect(() => {
    if (practiceEquation && activeTab === 'practice') {
      let spokenText = ''
      const { a, b, type } = practiceEquation
      if (type === '+') spokenText = `كم يساوي ${a} زائد ${b}؟`
      else if (type === '-') spokenText = `كم يساوي ${a} ناقص ${b}؟`
      else if (type === '×') spokenText = `كم يساوي ${a} ضرب ${b}؟`
      else if (type === '÷') spokenText = `كم يساوي ${a} قسمة ${b}؟`
      speakWhenReady(spokenText, 'Arabic Male')
    }
  }, [practiceEquation, activeTab])

  const sendDrawEvent = (x, y, type) => {
    if (!channel || !studentHasControl) return
    channel.send({
      type: 'broadcast',
      event: 'math_board_action',
      payload: { action: 'math_board_draw', x, y, type, color: '#3b82f6' } // Student Blue
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
    
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    
    const x = (clientX - rect.left) * scaleX
    const y = (clientY - rect.top) * scaleY

    ctx.lineWidth = 15
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#3b82f6' // Student Blue
    
    ctx.lineTo(x, y)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(x, y)

    sendDrawEvent(x, y, forceType)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'math_board_action',
        payload: { action: 'clear_trace' }
      }).catch(err => console.error('Broadcast error:', err))
    }
  }

  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex', flexDirection: 'column', 
      background: '#f8fafc', borderRadius: '16px', overflow: 'hidden', fontFamily: 'Tajawal, sans-serif'
    }}>
      <div style={{ flex: 1, position: 'relative', background: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
        
        {/* Responsive Container (Aspect Ratio 4:3) */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '800px', aspectRatio: '4 / 3', backgroundColor: 'white', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          
          {/* SVG Background Layer for crisp text and perfect coordinate scaling */}
          <svg viewBox="0 0 1000 750" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
            {activeTab === 'numbers' && activeNumber && (
              <text x="500" y="375" textAnchor="middle" dominantBaseline="central" fontSize="500" fill="#f1f5f9" fontWeight="900" fontFamily="sans-serif">
                {activeNumber.value}
              </text>
            )}
            {activeTab === 'table' && activeEquation ? (
              <>
                <text x="500" y="300" textAnchor="middle" dominantBaseline="central" fontSize="120" fill="#334155" fontWeight="900" fontFamily="Tajawal, sans-serif">
                  {activeEquation.a} × {activeEquation.b}
                </text>
                <text x="500" y="450" textAnchor="middle" dominantBaseline="central" fontSize="120" fill="#3b82f6" fontWeight="900" fontFamily="Tajawal, sans-serif">
                  = {activeEquation.res}
                </text>
              </>
            ) : activeTab === 'table' && (
              <text x="500" y="375" textAnchor="middle" dominantBaseline="central" fontSize="40" fill="#cbd5e1" fontWeight="bold" fontFamily="Tajawal, sans-serif">
                انتظر حتى يختار المعلم المعادلة...
              </text>
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
                touchAction: 'none', zIndex: 10, cursor: studentHasControl ? 'crosshair' : 'not-allowed'
              }}
            />
          )}

          {/* Clear Button */}
          {studentHasControl && (activeTab === 'numbers' || activeTab === 'practice') && (
            <button
              onClick={clearCanvas}
              style={{
                position: 'absolute', bottom: '20px', right: '20px', zIndex: 20,
                padding: '12px 20px', borderRadius: '25px', border: 'none',
                background: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', gap: '8px',
                cursor: 'pointer', boxShadow: '0 4px 12px rgba(59,130,246,0.4)', fontWeight: 'bold'
              }}
            >
              <Eraser size={20} /> مسح
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
