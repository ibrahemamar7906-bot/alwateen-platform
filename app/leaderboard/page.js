'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../utils/supabase'
import { useRouter } from 'next/navigation'

const STAGES = {
  all: 'المنصة كاملة',
  primary_1: 'الصف الأول الابتدائي',
  primary_2: 'الصف الثاني الابتدائي',
  primary_3: 'الصف الثالث الابتدائي',
  primary_4: 'الصف الرابع الابتدائي',
  primary_5: 'الصف الخامس الابتدائي',
  primary_6: 'الصف السادس الابتدائي',
  prep_1: 'الصف الأول الإعدادي',
  prep_2: 'الصف الثاني الإعدادي',
  prep_3: 'الصف الثالث الإعدادي',
  sec_1: 'الصف الأول الثانوي',
  sec_2: 'الصف الثاني الثانوي',
  sec_3: 'الصف الثالث الثانوي'
}

export default function Leaderboard() {
  const router = useRouter()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedStage, setSelectedStage] = useState('all')

  useEffect(() => {
    fetchLeaderboard()
  }, [selectedStage])

  const fetchLeaderboard = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('profiles')
        .select('id, full_name, stage, points, badges')
        .order('points', { ascending: false })
        .limit(50)
      
      if (selectedStage !== 'all') {
        query = query.eq('stage', selectedStage)
      }

      const { data, error } = await query
      if (error) throw error
      setStudents(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{minHeight: '100dvh', background: 'linear-gradient(135deg, #1e293b, #0f172a)', color: 'white', fontFamily: 'var(--font-cairo)', padding: '40px 20px'}}>
      <button onClick={() => router.push('/student-dashboard')} style={{background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', marginBottom: '30px', fontWeight: 'bold', fontSize: '1rem'}}>
        &larr; العودة للوحة القيادة
      </button>

      <div style={{maxWidth: '800px', margin: '0 auto', textAlign: 'center'}}>
        <h1 style={{fontSize: '2.5rem', marginBottom: '10px', color: '#fbbf24', textShadow: '0 2px 10px rgba(251, 191, 36, 0.5)'}}>
          🏆 لوحة الشرف 🏆
        </h1>
        <p style={{fontSize: '1.2rem', color: '#cbd5e1', marginBottom: '30px'}}>
          أبطال منصة الوتين، استمروا في التألق!
        </p>

        <div style={{marginBottom: '30px', display: 'inline-block', background: 'rgba(255,255,255,0.1)', padding: '5px', borderRadius: '15px'}}>
          <select value={selectedStage} onChange={e => setSelectedStage(e.target.value)} style={{background: 'transparent', color: 'white', border: 'none', outline: 'none', padding: '10px 20px', fontSize: '1.1rem', cursor: 'pointer'}}>
            {Object.entries(STAGES).map(([key, label]) => (
              <option key={key} value={key} style={{color: 'black'}}>{label}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div style={{padding: '50px', fontSize: '1.5rem'}}>جاري جلب قائمة الأبطال...</div>
        ) : (
          <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
            {students.map((student, index) => {
              let rankStyle = { background: 'rgba(255,255,255,0.05)' }
              let medal = ''
              if (index === 0) {
                rankStyle = { background: 'linear-gradient(135deg, #fbbf24, #d97706)', transform: 'scale(1.05)', zIndex: 3, boxShadow: '0 10px 25px rgba(251, 191, 36, 0.4)' }
                medal = '🥇'
              } else if (index === 1) {
                rankStyle = { background: 'linear-gradient(135deg, #94a3b8, #64748b)', transform: 'scale(1.02)', zIndex: 2, boxShadow: '0 8px 20px rgba(148, 163, 184, 0.3)' }
                medal = '🥈'
              } else if (index === 2) {
                rankStyle = { background: 'linear-gradient(135deg, #b45309, #78350f)', transform: 'scale(1.01)', zIndex: 1, boxShadow: '0 6px 15px rgba(180, 83, 9, 0.3)' }
                medal = '🥉'
              }

              return (
                <div key={student.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', borderRadius: '15px',
                  border: '1px solid rgba(255,255,255,0.1)', transition: 'transform 0.3s', ...rankStyle
                }}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
                    <div style={{fontSize: '2rem', width: '50px', textAlign: 'center', fontWeight: 'bold'}}>
                      {medal || `#${index + 1}`}
                    </div>
                    <div style={{textAlign: 'right'}}>
                      <div style={{fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '5px'}}>{student.full_name}</div>
                      <div style={{fontSize: '0.9rem', color: index < 3 ? 'rgba(255,255,255,0.9)' : '#94a3b8'}}>{STAGES[student.stage] || student.stage}</div>
                    </div>
                  </div>
                  
                  <div style={{textAlign: 'center'}}>
                    <div style={{fontSize: '1.8rem', fontWeight: 'bold', textShadow: '0 2px 4px rgba(0,0,0,0.3)'}}>{student.points}</div>
                    <div style={{fontSize: '0.8rem', opacity: 0.8}}>نقطة 🌟</div>
                  </div>

                  {student.badges && student.badges.length > 0 && (
                    <div style={{display: 'flex', gap: '5px', flexWrap: 'wrap', maxWidth: '', width: '100%', justifyContent: 'flex-end'}}>
                      {student.badges.slice(0, 3).map((badge, idx) => (
                        <span key={idx} title={badge} style={{fontSize: '1.2rem'}}>{badge.split(' ')[0]}</span>
                      ))}
                      {student.badges.length > 3 && <span style={{fontSize: '0.8rem', background: 'rgba(0,0,0,0.3)', padding: '2px 5px', borderRadius: '5px'}}>+{student.badges.length - 3}</span>}
                    </div>
                  )}
                </div>
              )
            })}
            {students.length === 0 && (
              <div style={{padding: '30px', background: 'rgba(255,255,255,0.05)', borderRadius: '15px', color: '#94a3b8'}}>
                لا يوجد طلاب في هذه المرحلة بعد.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
