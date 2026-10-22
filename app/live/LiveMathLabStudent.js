'use client'

import { useState, useEffect } from 'react'
import { speakWhenReady } from '../../utils/tts'
import confetti from 'canvas-confetti'

export default function LiveMathLabStudent({ channel }) {
  const [problem, setProblem] = useState(null)
  const [feedback, setFeedback] = useState(null) // 'correct' or 'wrong'

  useEffect(() => {
    if (!channel) return
    let isMounted = true

    const handleBroadcast = ({ payload }) => {
      if (!isMounted) return
      const { action } = payload || {}
      
      if (action === 'clear') {
        setProblem(null)
        setFeedback(null)
      } else if (action === 'new_problem' && payload?.problem) {
        setProblem(payload.problem)
        setFeedback(null)
        
        const { num1, num2, mode } = payload.problem
        const opText = mode === 'add' ? 'زائد' : 'ناقص'
        speakWhenReady(`كم يساوي ${num1} ${opText} ${num2}`, 'Arabic Male', { rate: 0.9 })
      } else if (action === 'feedback') {
        setFeedback(payload.isCorrect ? 'correct' : 'wrong')
        
        if (payload.isCorrect) {
          speakWhenReady('أحسنت يا بطل', 'Arabic Male')
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          })
        } else {
          speakWhenReady('حاول مرة أخرى', 'Arabic Male')
        }
      }
    }

    const handler = (e) => handleBroadcast({ payload: e.detail })
    window.addEventListener('on_math_lab_action', handler)

    
    return () => {
      isMounted = false
      window.removeEventListener('on_math_lab_action', handler)
    }
  }, [channel])

  const renderVisuals = (count) => {
    const displayCount = Math.min(count, 10)
    const extra = count > 10 ? ` +${count - 10}` : ''
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', justifyContent: 'center' }}>
        {Array.from({ length: displayCount }).map((_, i) => (
          <span key={i} style={{ fontSize: '2rem' }}>🍎</span>
        ))}
        {extra && <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#065f46' }}>{extra}</span>}
      </div>
    )
  }

  if (!problem) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', height: '100%',
        alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#f8fafc', color: '#64748b',
        fontFamily: "'Tajawal', sans-serif"
      }}>
        <div style={{ fontSize: '5rem', marginBottom: '20px' }}>🔢</div>
        <h2 style={{ fontSize: '2rem' }}>مستعدون لدرس الحساب!</h2>
        <p>ننتظر المعلم لإرسال المسألة...</p>
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(circle at center, #f0fdf4 0%, #dcfce7 100%)', 
      color: '#064e3b',
      fontFamily: "'Tajawal', sans-serif",
      overflow: 'hidden'
    }}>
      
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        background: 'white', padding: '40px', borderRadius: '30px',
        boxShadow: '0 20px 50px rgba(22, 163, 74, 0.1)',
        position: 'relative', minWidth: '60%'
      }}>
        
        {/* Equation */}
        <div style={{
          fontSize: 'clamp(5rem, 15vw, 10rem)',
          fontWeight: 900,
          color: '#0f172a',
          direction: 'ltr',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          marginBottom: '30px'
        }}>
          <span>{problem.num1}</span>
          <span style={{ color: problem.mode === 'add' ? '#0ea5e9' : '#f59e0b' }}>
            {problem.mode === 'add' ? '+' : '-'}
          </span>
          <span>{problem.num2}</span>
          <span>=</span>
          <span style={{ 
            color: feedback === 'correct' ? '#10b981' : feedback === 'wrong' ? '#ef4444' : '#cbd5e1' 
          }}>
            ?
          </span>
        </div>

        {/* Visuals */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '30px', direction: 'ltr',
          background: '#f8fafc', padding: '20px', borderRadius: '20px', width: '100%', justifyContent: 'center'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
            {renderVisuals(problem.num1)}
          </div>
          <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#94a3b8' }}>
            {problem.mode === 'add' ? '+' : '-'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
            {renderVisuals(problem.num2)}
          </div>
        </div>

        {/* Feedback Overlay */}
        {feedback && (
          <div style={{
            position: 'absolute', top: '-20px', right: '-20px',
            fontSize: '5rem',
            animation: 'bounceIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
          }}>
            {feedback === 'correct' ? '🌟' : '❌'}
          </div>
        )}

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes bounceIn {
          0% { transform: scale(0); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
      `}} />
    </div>
  )
}
