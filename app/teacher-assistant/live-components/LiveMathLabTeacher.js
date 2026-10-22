'use client'

import { useState, useEffect } from 'react'
import { speakWhenReady } from '../../../utils/tts'

export default function LiveMathLabTeacher({ channel }) {
  const [opMode, setOpMode] = useState('add') // 'add' or 'sub'
  const [currentProblem, setCurrentProblem] = useState(null)

  // Handle late joiners
  useEffect(() => {
    if (!channel) return;
    const handleSync = () => {
      if (currentProblem) {
        channel.send({
          type: 'broadcast',
          event: 'math_lab_action',
          payload: { action: 'new_problem', problem: currentProblem }
        }).catch(err => console.error('Broadcast error:', err))
      }
    }
    window.addEventListener('on_global_sync_request', handleSync)
    return () => window.removeEventListener('on_global_sync_request', handleSync)
  }, [channel, currentProblem])

  const generateProblem = () => {
    let a = Math.floor(Math.random() * 10) + 1
    let b = Math.floor(Math.random() * 10) + 1

    if (opMode === 'sub') {
      if (a < b) {
        const temp = a
        a = b
        b = temp
      }
      if (a === b) a += 1
    }

    const problem = { num1: a, num2: b, mode: opMode }
    setCurrentProblem(problem)
    
    // Speak the problem
    const opWord = opMode === 'add' ? 'زائد' : 'ناقص'
    speakWhenReady(`${a} ${opWord} ${b}`, 'Arabic Male')
    
    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'math_lab_action',
        payload: { action: 'new_problem', problem }
      }).catch(err => console.error('Broadcast error:', err))
    }
  }

  const sendFeedback = (isCorrect) => {
    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'math_lab_action',
        payload: { action: 'feedback', isCorrect }
      }).catch(err => console.error('Broadcast error:', err))
    }
  }

  const handleClear = () => {
    setCurrentProblem(null)
    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'math_lab_action',
        payload: { action: 'clear' }
      }).catch(err => console.error('Broadcast error:', err))
    }
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      backgroundColor: '#f8fafc', color: '#0f172a', direction: 'rtl',
      fontFamily: "'Tajawal', sans-serif"
    }}>
      <div style={{
        padding: '20px', backgroundColor: '#0369a1', color: 'white',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🔢</span> مختبر الأرقام (تحكم المعلم)
        </h2>
        <button 
          onClick={handleClear}
          style={{
            backgroundColor: '#ef4444', color: 'white', border: 'none',
            padding: '8px 16px', borderRadius: '8px', cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          إخفاء المسألة
        </button>
      </div>

      <div style={{
        flex: 1, padding: '20px', display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: '30px'
      }}>
        
        <div style={{ display: 'flex', gap: '15px' }}>
          <button 
            onClick={() => setOpMode('add')}
            style={{
              padding: '12px 24px', borderRadius: '12px', border: 'none', cursor: 'pointer',
              fontWeight: 'bold', fontSize: '1.2rem', transition: '0.2s',
              backgroundColor: opMode === 'add' ? '#0ea5e9' : '#e2e8f0',
              color: opMode === 'add' ? 'white' : '#64748b'
            }}
          >
            جمع (+)
          </button>
          <button 
            onClick={() => setOpMode('sub')}
            style={{
              padding: '12px 24px', borderRadius: '12px', border: 'none', cursor: 'pointer',
              fontWeight: 'bold', fontSize: '1.2rem', transition: '0.2s',
              backgroundColor: opMode === 'sub' ? '#f59e0b' : '#e2e8f0',
              color: opMode === 'sub' ? 'white' : '#64748b'
            }}
          >
            طرح (-)
          </button>
        </div>

        <button
          onClick={generateProblem}
          style={{
            padding: '20px 40px', borderRadius: '16px', border: 'none', cursor: 'pointer',
            fontWeight: '900', fontSize: '1.5rem', backgroundColor: '#10b981', color: 'white',
            boxShadow: '0 10px 25px rgba(16, 185, 129, 0.4)', transition: 'transform 0.1s'
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          أرسل مسألة جديدة للطلاب 🚀
        </button>

        {currentProblem && (
          <div style={{
            background: 'white', padding: '30px', borderRadius: '24px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.05)', textAlign: 'center',
            minWidth: '300px'
          }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#64748b' }}>المسألة الحالية عند الطلاب:</h3>
            <div style={{ fontSize: '4rem', fontWeight: 900, color: '#0f172a', direction: 'ltr' }}>
              {currentProblem.num1} {currentProblem.mode === 'add' ? '+' : '-'} {currentProblem.num2} = ?
            </div>
            
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '30px' }}>
              <button
                onClick={() => sendFeedback(true)}
                style={{
                  padding: '12px 24px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                  fontWeight: 'bold', fontSize: '1.2rem', backgroundColor: '#10b981', color: 'white'
                }}
              >
                إجابة صحيحة ✅
              </button>
              <button
                onClick={() => sendFeedback(false)}
                style={{
                  padding: '12px 24px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                  fontWeight: 'bold', fontSize: '1.2rem', backgroundColor: '#ef4444', color: 'white'
                }}
              >
                إجابة خاطئة ❌
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
