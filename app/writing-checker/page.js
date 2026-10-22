'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../utils/supabase'

export default function WritingChecker() {
  const router = useRouter()
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [matches, setMatches] = useState(null)
  const [score, setScore] = useState(null)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
      }
    }
    checkUser()
  }, [router])

  const handleCheck = async () => {
    if (!text.trim()) {
      alert('يرجى إدخال النص أولاً!')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('https://api.languagetool.org/v2/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          text: text,
          language: 'ar', // Arabic
        }),
      })

      const data = await response.json()
      setMatches(data.matches)
      
      // Calculate score out of 10
      // Assume each error deducts 0.5 points
      const errorsCount = data.matches.length
      let finalScore = 10 - (errorsCount * 0.5)
      if (finalScore < 0) finalScore = 0
      setScore(finalScore)

    } catch (err) {
      console.error(err)
      alert('حدث خطأ أثناء الاتصال بالمصحح، يرجى المحاولة لاحقاً.')
    } finally {
      setLoading(false)
    }
  }

  const applyCorrection = (matchIndex, replacementIndex) => {
    const match = matches[matchIndex]
    const replacement = match.replacements[replacementIndex].value
    
    // Replace in original text
    const newText = text.slice(0, match.offset) + replacement + text.slice(match.offset + match.length)
    setText(newText)
    
    // Quick re-check or just clear this match locally?
    // Doing a re-check is safer to get new offsets
    // For now, let's just clear the matches and force a re-check
    setMatches(null)
    setScore(null)
  }

  const renderHighlightedText = () => {
    if (!matches || matches.length === 0) {
      return <div style={{lineHeight: '2', fontSize: '1.2rem', padding: '15px', background: '#f8fafc', borderRadius: '10px'}}>{text}</div>
    }

    let result = []
    let lastIndex = 0

    matches.forEach((match, idx) => {
      // Push text before the match
      if (match.offset > lastIndex) {
        result.push(<span key={`text-${idx}`}>{text.substring(lastIndex, match.offset)}</span>)
      }

      // Push the matched error
      const isSpelling = match.rule.issueType === 'misspelling'
      const color = isSpelling ? '#fca5a5' : '#fde047'
      const border = isSpelling ? '#ef4444' : '#eab308'

      result.push(
        <span 
          key={`match-${idx}`}
          className="error-highlight"
          title={match.message}
          style={{
            background: color,
            borderBottom: `2px solid ${border}`,
            cursor: 'pointer',
            padding: '0 4px',
            borderRadius: '3px',
            position: 'relative'
          }}
        >
          {text.substring(match.offset, match.offset + match.length)}
          
          {/* Tooltip for suggestions (CSS hover based) */}
          <div className="correction-tooltip">
            <p style={{margin: '0 0 10px 0', fontSize: '0.9rem', color: '#fff'}}>{match.message}</p>
            <div style={{display: 'flex', gap: '5px', flexWrap: 'wrap'}}>
              {match.replacements.slice(0, 3).map((rep, rIdx) => (
                <button 
                  key={rIdx}
                  onClick={(e) => { e.stopPropagation(); applyCorrection(idx, rIdx); }}
                  style={{background: '#10b981', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontSize: '0.9rem'}}
                >
                  {rep.value}
                </button>
              ))}
              {match.replacements.length === 0 && <span style={{fontSize: '0.8rem', color: '#cbd5e1'}}>لا توجد اقتراحات</span>}
            </div>
          </div>
        </span>
      )

      lastIndex = match.offset + match.length
    })

    // Push remaining text
    if (lastIndex < text.length) {
      result.push(<span key="text-end">{text.substring(lastIndex)}</span>)
    }

    return (
      <div style={{lineHeight: '2.5', fontSize: '1.2rem', padding: '20px', background: '#fff', border: '2px solid #e2e8f0', borderRadius: '15px', position: 'relative', zIndex: 1}}>
        {result}
      </div>
    )
  }

  const handleBack = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    
    if (profile?.role === 'admin') router.push('/admin-dashboard')
    else if (['teacher', 'teacher_pro'].includes(profile?.role)) router.push('/teacher-assistant')
    else router.push('/student-dashboard')
  }

  return (
    <div style={{minHeight: '100dvh', background: '#f0f9ff', padding: '20px', fontFamily: 'Tajawal, sans-serif'}}>
      <style>{`
        .error-highlight .correction-tooltip {
          display: none;
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: #334155;
          padding: 15px;
          border-radius: 10px;
          min-width: 250px;
          z-index: 10;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
          margin-bottom: 10px;
        }
        .error-highlight .correction-tooltip::after {
          content: "";
          position: absolute;
          top: 100%;
          left: 50%;
          margin-left: -5px;
          border-width: 5px;
          border-style: solid;
          border-color: #334155 transparent transparent transparent;
        }
        .error-highlight:hover .correction-tooltip {
          display: block;
        }
      `}</style>

      <div style={{maxWidth: '900px', margin: '0 auto'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px'}}>
          <button onClick={handleBack} style={{padding: '10px 20px', background: '#94a3b8', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold'}}>العودة</button>
          <h1 style={{color: '#0284c7', margin: 0, fontSize: '2.5rem', textShadow: '1px 1px 0px #bae6fd'}}>المصحح الذكي 📝</h1>
          <div style={{width: '80px'}}></div>
        </div>

        <div style={{background: 'white', padding: '30px', borderRadius: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)'}}>
          
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
            <p style={{color: '#64748b', margin: 0}}>اكتب أو انسخ موضوع التعبير هنا وسيقوم الذكاء الاصطناعي باكتشاف الأخطاء الإملائية والنحوية.</p>
            {score !== null && (
              <div style={{background: score >= 8 ? '#dcfce7' : score >= 5 ? '#fef08a' : '#fee2e2', padding: '10px 20px', borderRadius: '15px', fontWeight: 'bold', fontSize: '1.2rem', color: score >= 8 ? '#166534' : score >= 5 ? '#854d0e' : '#991b1b', border: `2px solid ${score >= 8 ? '#22c55e' : score >= 5 ? '#eab308' : '#ef4444'}`}}>
                التقييم: {score} / 10
              </div>
            )}
          </div>

          {!matches ? (
            <>
              <textarea 
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="مثال: انا اذهب الي المدرسه كل يوم لكي اتعلم..."
                style={{width: '100%', height: '300px', padding: '20px', fontSize: '1.2rem', borderRadius: '15px', border: '2px solid #e2e8f0', resize: 'vertical', lineHeight: '2', fontFamily: 'Tajawal, sans-serif'}}
              />
              <button 
                onClick={handleCheck}
                disabled={loading}
                style={{width: '100%', padding: '15px', background: '#0ea5e9', color: 'white', border: 'none', borderRadius: '15px', fontSize: '1.3rem', fontWeight: 'bold', marginTop: '20px', cursor: loading ? 'wait' : 'pointer', transition: '0.2s'}}
                onMouseOver={e => e.currentTarget.style.background = '#0284c7'}
                onMouseOut={e => e.currentTarget.style.background = '#0ea5e9'}
              >
                {loading ? 'جاري الفحص والتحليل... ⏳' : 'تحليل وتصحيح النص 🔍'}
              </button>
            </>
          ) : (
            <>
              <div style={{marginBottom: '20px'}}>
                <h3 style={{color: '#334155', marginBottom: '10px'}}>نتيجة الفحص (مرر الماوس على الأخطاء لمعرفة السبب):</h3>
                <div style={{display: 'flex', gap: '15px', marginBottom: '15px', fontSize: '0.9rem'}}>
                  <span style={{background: '#fca5a5', padding: '2px 8px', borderRadius: '5px'}}>خطأ إملائي</span>
                  <span style={{background: '#fde047', padding: '2px 8px', borderRadius: '5px'}}>خطأ نحوي / أسلوبي</span>
                  <span style={{color: '#64748b'}}>تم العثور على {matches.length} أخطاء.</span>
                </div>
                {renderHighlightedText()}
              </div>

              <div style={{display: 'flex', gap: '15px'}}>
                <button 
                  onClick={() => setMatches(null)}
                  style={{flex: 1, padding: '15px', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '15px', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer'}}
                >
                  تعديل النص ✏️
                </button>
                <button 
                  onClick={() => {setText(''); setMatches(null); setScore(null);}}
                  style={{flex: 1, padding: '15px', background: '#fecdd3', color: '#be123c', border: 'none', borderRadius: '15px', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer'}}
                >
                  فحص نص جديد 🔄
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  )
}
