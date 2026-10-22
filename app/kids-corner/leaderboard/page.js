'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../utils/supabase'
import { Trophy, Medal, ArrowRight, Gamepad2 } from 'lucide-react'
import Link from 'next/link'

export default function LeaderboardPage() {
  const [scores, setScores] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('mario') // 'mario', 'subway', 'tank-battle'

  useEffect(() => {
    fetchTopScores(activeTab)
  }, [activeTab])

  const fetchTopScores = async (gameName) => {
    setLoading(true)
    const { data, error } = await supabase
      .from('game_scores')
      .select('*')
      .eq('game_name', gameName)
      .order('score', { ascending: false })
      .limit(10)
      
    if (data) {
      setScores(data)
    }
    setLoading(false)
  }

  const getRankColor = (index) => {
    if (index === 0) return '#fbbf24' // Gold
    if (index === 1) return '#94a3b8' // Silver
    if (index === 2) return '#b45309' // Bronze
    return '#3b82f6'
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e293b, #0f172a)',
      color: 'white',
      fontFamily: 'Tajawal, sans-serif',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px' }}>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '15px', color: '#fbbf24', fontSize: '2.5rem', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
            <Trophy size={40} /> لوحة الشرف للأبطال
          </h1>
          <Link href="/kids-corner" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.1)', padding: '10px 20px', borderRadius: '30px', color: 'white', textDecoration: 'none', fontWeight: 'bold', backdropFilter: 'blur(5px)' }}>
            الركن <ArrowRight size={20} />
          </Link>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '15px' }}>
          <button 
            onClick={() => setActiveTab('mario')}
            style={{ flex: 1, padding: '15px', borderRadius: '10px', border: 'none', background: activeTab === 'mario' ? '#ef4444' : 'transparent', color: 'white', fontWeight: 'bold', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.3s' }}
          >
            🍄 ماريو الذكي
          </button>
          <button 
            onClick={() => setActiveTab('subway')}
            style={{ flex: 1, padding: '15px', borderRadius: '10px', border: 'none', background: activeTab === 'subway' ? '#3b82f6' : 'transparent', color: 'white', fontWeight: 'bold', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.3s' }}
          >
            🏃 صب واي
          </button>
          <button 
            onClick={() => setActiveTab('tank-battle')}
            style={{ flex: 1, padding: '15px', borderRadius: '10px', border: 'none', background: activeTab === 'tank-battle' ? '#22c55e' : 'transparent', color: 'white', fontWeight: 'bold', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.3s' }}
          >
            🎯 حرب الدبابات
          </button>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '20px', padding: '20px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px', color: '#94a3b8', fontSize: '1.2rem' }}>جاري تحميل الأبطال...</div>
          ) : scores.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px', color: '#94a3b8' }}>
              <Gamepad2 size={64} style={{ margin: '0 auto 15px auto', opacity: 0.5 }} />
              <h2>لا توجد نتائج بعد!</h2>
              <p>كن أول بطل يسجل اسمه في هذه اللعبة.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {scores.map((score, index) => (
                <div key={score.id} style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                  background: index < 3 ? `linear-gradient(90deg, rgba(255,255,255,0.1), transparent)` : 'rgba(0,0,0,0.2)',
                  padding: '20px', borderRadius: '15px',
                  border: `1px solid ${index < 3 ? getRankColor(index) : 'rgba(255,255,255,0.05)'}`,
                  transform: index < 3 ? 'scale(1.02)' : 'none',
                  boxShadow: index < 3 ? `0 4px 15px ${getRankColor(index)}40` : 'none'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ 
                      width: '40px', height: '40px', borderRadius: '50%', 
                      background: getRankColor(index), color: index === 1 ? '#0f172a' : 'white', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 'bold', fontSize: '1.2rem'
                    }}>
                      {index < 3 ? <Medal size={24} /> : `#${index + 1}`}
                    </div>
                    <div>
                      <h3 style={{ margin: '0 0 5px 0', fontSize: '1.4rem' }}>{score.student_name}</h3>
                      <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>مادة: {score.subject === 'arabic' ? 'اللغة العربية' : score.subject === 'english' ? 'اللغة الإنجليزية' : 'الرياضيات'}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: getRankColor(index) }}>
                    {score.score}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
