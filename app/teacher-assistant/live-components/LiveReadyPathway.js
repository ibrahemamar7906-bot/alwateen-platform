'use client'

import { useState, Suspense, useEffect, useRef } from 'react'
import { pathways } from '../../kids-corner/pathway/data'

import { PathwayLessonContent } from '../../kids-corner/pathway/lesson/page'

const SUBJECT_LABELS = {
  primary1_arabic: 'منهج أولى ابتدائي',
  primary2_arabic: 'منهج تانية ابتدائي',
  prep1_arabic: 'منهج أولى إعدادي',
  prep2_arabic: 'منهج تانية إعدادي',
  prep3_arabic: 'منهج تالتة إعدادي',
  sec2_arabic: 'منهج تانية ثانوي (قراءة متحررة)',
  arabic: 'تأسيس اللغة العربية'
}

export default function LiveReadyPathway({ channel, isTeacher }) {
  const scrollRef = useRef(null)
  
  useEffect(() => {
    if (!channel) return;
    let isMounted = true;
    channel.on('broadcast', { event: 'pathway_scroll' }, ({ payload }) => {
      if (!isMounted) return;
      if (payload && scrollRef.current && !isTeacher) {
        scrollRef.current.scrollTop = payload.scrollTop;
      }
    });
    return () => {
      isMounted = false;
    }
  }, [channel, isTeacher])

  const handleScroll = (e) => {
    if (!isTeacher || !channel) return;
    channel.send({
      type: 'broadcast',
      event: 'pathway_scroll',
      payload: { scrollTop: e.target.scrollTop }
    }).catch(() => {});
  }

  const [selectedSubject, setSelectedSubject] = useState('primary1_arabic')
  const [activeLesson, setActiveLesson] = useState(null)

  useEffect(() => {
    if (!channel) return;
    let isMounted = true;
    channel.on('broadcast', { event: 'open_ready_lesson' }, ({ payload }) => {
      if (!isMounted) return;
      if (payload) {
        setSelectedSubject(payload.subject || 'primary1_arabic');
        setActiveLesson(payload.lessonId);
      }
    });
    return () => { isMounted = false; }
  }, [channel])

  useEffect(() => {
    if (!channel) return;
    const handleSync = () => {
      if (isTeacher && activeLesson) {
        channel.send({
          type: 'broadcast',
          event: 'open_ready_lesson',
          payload: { lessonId: activeLesson, subject: selectedSubject }
        }).catch(() => {})
      }
    }
    window.addEventListener('on_global_sync_request', handleSync)
    
    return () => {
      window.removeEventListener('on_global_sync_request', handleSync)
    }
  }, [channel, isTeacher, activeLesson, selectedSubject])

  const handleSubjectChange = (e) => {
    setSelectedSubject(e.target.value)
    closeLesson()
  }

  const handleLessonSelect = (lessonId) => {
    setActiveLesson(lessonId)
    if (channel && isTeacher) {
      channel.send({
        type: 'broadcast',
        event: 'open_ready_lesson',
        payload: { lessonId, subject: selectedSubject }
      }).catch(() => {})
    }
  }

  const closeLesson = () => {
    setActiveLesson(null)
    if (channel && isTeacher) {
      channel.send({
        type: 'broadcast',
        event: 'open_ready_lesson',
        payload: { lessonId: null }
      }).catch(() => {})
    }
  }

  if (activeLesson) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
        {isTeacher && (
          <div style={{ padding: '10px', backgroundColor: '#f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #cbd5e1' }}>
            <span style={{ fontWeight: 'bold', color: '#059669' }}>الدرس معروض حالياً للطلاب 🟢</span>
            <button 
              onClick={closeLesson}
              style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              إغلاق الدرس والعودة للمسار ✖️
            </button>
          </div>
        )}
        <div ref={scrollRef} onScroll={handleScroll} style={{ width: '100%', height: '100%', overflow: 'auto', flex: 1, backgroundColor: 'white' }}>
          <Suspense fallback={<div>جاري التحميل...</div>}>
            <PathwayLessonContent subjectProp={selectedSubject} idProp={activeLesson} channel={channel} isTeacher={isTeacher} />
          </Suspense>
        </div>
      </div>
    )
  }

  const currentPathway = pathways[selectedSubject] || []
  
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
      <div style={{ padding: '15px', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'center', gap: '15px', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: 0, color: '#1e293b' }}>اختر المرحلة:</h2>
        <select 
          value={selectedSubject} 
          onChange={handleSubjectChange}
          style={{ padding: '8px 16px', fontSize: '1.1rem', borderRadius: '8px', border: '2px solid #cbd5e1', outline: 'none' }}
        >
          {Object.entries(SUBJECT_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {currentPathway.map((node, index) => {
            if (node.type === 'unit_start') {
              return (
                <div key={node.id} style={{
                  background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                  color: 'white', padding: '15px 20px', borderRadius: '12px',
                  fontWeight: 'bold', fontSize: '1.2rem', marginTop: index > 0 ? '20px' : '0',
                  boxShadow: '0 4px 6px rgba(5, 150, 105, 0.2)'
                }}>
                  {node.title}
                </div>
              )
            }
            return (
              <div key={node.id} 
                onClick={() => handleLessonSelect(node.id)}
                style={{
                  backgroundColor: 'white', padding: '15px 20px', borderRadius: '12px',
                  border: '2px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '15px',
                  cursor: 'pointer', transition: 'all 0.2s',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#059669'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                <div style={{ 
                  width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#f1f5f9',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0
                }}>
                  {node.emoji || '📚'}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#334155' }}>{node.title}</h3>
                  {node.description && <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem', color: '#64748b' }}>{node.description}</p>}
                </div>
                <button style={{
                  padding: '8px 16px', backgroundColor: '#059669', color: 'white',
                  border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer'
                }}>
                  فتح الدرس للطلاب
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
