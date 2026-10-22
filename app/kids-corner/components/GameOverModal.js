'use client'

import { useState } from 'react'
import { supabase } from '../../../utils/supabase'
import { Trophy, RotateCcw, Medal } from 'lucide-react'
import Link from 'next/link'

export default function GameOverModal({ score, gameName, subject, onRestart }) {
  const [playerName, setPlayerName] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!playerName.trim() || score <= 0) return
    setSubmitting(true)
    try {
      const { error } = await supabase.from('game_scores').insert([
        {
          student_name: playerName,
          game_name: gameName,
          subject: subject,
          score: score
        }
      ])
      if (!error) {
        setSubmitted(true)
      } else {
        alert('حدث خطأ أثناء تسجيل النتيجة')
      }
    } catch (err) {
      console.error(err)
    }
    setSubmitting(false)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
      fontFamily: 'Tajawal, sans-serif'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1e293b, #0f172a)',
        border: '4px solid #3b82f6',
        borderRadius: '20px',
        padding: '30px',
        width: '90%',
        maxWidth: '450px',
        textAlign: 'center',
        color: 'white',
        boxShadow: '0 10px 30px rgba(59, 130, 246, 0.4)'
      }}>
        <h2 style={{ fontSize: '2.5rem', color: '#ef4444', marginBottom: '10px', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>انتهت اللعبة!</h2>
        
        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '15px', marginBottom: '20px' }}>
          <Trophy size={48} color="#f59e0b" style={{ margin: '0 auto 10px auto' }} />
          <p style={{ fontSize: '1.2rem', margin: 0 }}>لقد جمعت</p>
          <p style={{ fontSize: '3rem', fontWeight: 'bold', color: '#facc15', margin: '5px 0', textShadow: '0 2px 5px rgba(0,0,0,0.5)' }}>{score}</p>
          <p style={{ fontSize: '1.2rem', margin: 0 }}>نقطة</p>
        </div>

        {!submitted ? (
          score > 0 ? (
            <div style={{ marginBottom: '25px' }}>
              <p style={{ marginBottom: '10px' }}>سجل اسمك في لوحة الشرف العالمية!</p>
              <input 
                type="text" 
                placeholder="اسم البطل..." 
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                style={{
                  width: '100%', padding: '12px', borderRadius: '10px', border: '2px solid #3b82f6',
                  background: 'rgba(255,255,255,0.9)', color: '#0f172a', fontSize: '1.2rem',
                  textAlign: 'center', marginBottom: '10px', fontWeight: 'bold', boxSizing: 'border-box'
                }}
              />
              <button 
                onClick={handleSubmit}
                disabled={submitting || !playerName.trim()}
                style={{
                  width: '100%', padding: '12px', borderRadius: '10px', border: 'none',
                  background: submitting || !playerName.trim() ? '#64748b' : '#22c55e',
                  color: 'white', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer',
                  boxShadow: '0 4px 0 ' + (submitting || !playerName.trim() ? '#475569' : '#16a34a')
                }}
              >
                {submitting ? 'جاري التسجيل...' : 'تسجيل النتيجة'}
              </button>
            </div>
          ) : (
            <p style={{ marginBottom: '20px', color: '#94a3b8' }}>حاول مرة أخرى لتحقيق نقاط أعلى!</p>
          )
        ) : (
          <div style={{ marginBottom: '25px', padding: '15px', background: 'rgba(34, 197, 94, 0.2)', border: '2px solid #22c55e', borderRadius: '10px' }}>
            <h3 style={{ color: '#4ade80', margin: '0 0 10px 0' }}>تم تسجيل نتيجتك بنجاح! 🚀</h3>
            <Link href="/kids-corner/leaderboard" style={{ color: 'white', textDecoration: 'underline', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
              <Medal size={20} /> عرض لوحة الشرف
            </Link>
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={onRestart}
            style={{
              flex: 1, padding: '12px', borderRadius: '10px', border: 'none',
              background: '#3b82f6', color: 'white', fontSize: '1.1rem', fontWeight: 'bold',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
              boxShadow: '0 4px 0 #2563eb'
            }}
          >
            <RotateCcw size={20} /> العب مرة أخرى
          </button>
          
          <Link href="/kids-corner" style={{
            flex: 1, padding: '12px', borderRadius: '10px', border: 'none',
            background: '#475569', color: 'white', fontSize: '1.1rem', fontWeight: 'bold',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none',
            boxShadow: '0 4px 0 #334155'
          }}>
            خروج
          </Link>
        </div>
      </div>
    </div>
  )
}
