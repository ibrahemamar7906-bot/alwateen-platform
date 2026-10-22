'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, BookOpen, Video, Award, Sparkles, ExternalLink, PlayCircle, Layers, ArrowRight } from 'lucide-react'
import { CURRICULUM_INDEX, normalizeArabicText, STAGE_NAMES } from '../data/curriculumData'

export default function StudentSearchModal({
  isOpen,
  onClose,
  lessons = [],
  courses = [],
  studentStage = '',
  student = null,
  onSwitchTab = null
}) {
  const router = useRouter()
  const inputRef = useRef(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState('all') // all, lessons, tracks, grammar, dictation

  // Focus input automatically on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    } else {
      setSearchTerm('')
      setActiveCategory('all')
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Build searchable items
  const allSearchableItems = useMemo(() => {
    const list = []

    // 1. Dynamic Lessons added by Teacher in DB
    lessons.forEach(l => {
      list.push({
        id: `db-lesson-${l.id}`,
        title: l.title || 'حصة بدون عنوان',
        desc: l.description || (l.video_type === 'canva' ? 'عرض تفاعلي مباشر' : 'فيديو درايف وشرح مسجل'),
        category: 'lessons',
        typeBadge: l.video_type === 'canva' ? 'عرض تفاعلي ✨' : 'حصة فيديو 🎬',
        sourceType: 'teacher_lesson',
        isFree: !!l.is_free,
        url: `/lesson?id=${l.id}`,
        points: l.points_reward || 0
      })
    })

    // 2. Dynamic Courses added by Teacher in DB
    courses.forEach(c => {
      list.push({
        id: `db-course-${c.id}`,
        title: c.title || 'كورس تعليمي',
        desc: c.description || 'كورس شامل يحتوي على حصص وتطبيقات متعددة',
        category: 'lessons',
        typeBadge: 'كورس تعليمي 📚',
        sourceType: 'teacher_course',
        url: `/course?id=${c.id}`
      })
    })

    // 3. Static Educational Track Lessons for this student's stage + General Tools
    CURRICULUM_INDEX.forEach(item => {
      if (item.stage === 'all' || item.stage === studentStage) {
        list.push({
          ...item,
          sourceType: 'curriculum'
        })
      }
    })

    return list
  }, [lessons, courses, studentStage])

  // Filtered Results
  const results = useMemo(() => {
    const cleanQuery = normalizeArabicText(searchTerm)

    return allSearchableItems.filter(item => {
      // Filter by category
      if (activeCategory === 'lessons' && item.category !== 'lessons') return false
      if (activeCategory === 'tracks' && item.category === 'lessons') return false
      if (activeCategory === 'grammar' && item.category !== 'grammar') return false
      if (activeCategory === 'dictation' && !['dictation', 'rhetoric', 'literature'].includes(item.category)) return false

      if (!cleanQuery) return true

      // Search match
      const normTitle = normalizeArabicText(item.title)
      const normDesc = normalizeArabicText(item.desc)
      const normBadge = normalizeArabicText(item.typeBadge)

      return (
        normTitle.includes(cleanQuery) ||
        normDesc.includes(cleanQuery) ||
        normBadge.includes(cleanQuery)
      )
    })
  }, [allSearchableItems, searchTerm, activeCategory])

  // Stage-based Quick suggestions when input is empty
  const suggestions = useMemo(() => {
    if (studentStage === 'prep_3') {
      return ['اسم الفاعل', 'صيغ المبالغة', 'همزة القطع', 'عناصر تحليل النصوص', 'بنك الامتحانات', 'حصص الفيديو']
    } else if (studentStage === 'prep_1') {
      return ['الفعل اللازم والمتعدي', 'المجرد والمزيد', 'أنواع الفعل الصحيح', 'همزة الألف', 'حصص الفيديو']
    } else if (studentStage === 'prep_2') {
      return ['المعرب والمبني', 'النعت والحال', 'التوكيد والعطف', 'البلاغة', 'حصص الفيديو']
    } else if (studentStage.startsWith('sec')) {
      return ['الوحدات النحوية', 'البلاغة', 'الأدب', 'القراءة المتحررة', 'البابل شيت']
    } else {
      return ['النحو', 'القراءة', 'ألعاب النحو', 'حلقات القرآن', 'الفونكس']
    }
  }, [studentStage])

  const handleItemClick = (item) => {
    onClose()
    if (item.action === 'ai-tutor' && onSwitchTab) {
      onSwitchTab('ai-tutor')
      return
    }
    if (item.url) {
      router.push(item.url)
    }
  }

  if (!isOpen) return null

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '20px',
        paddingTop: 'min(12vh, 80px)',
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div 
        style={{
          width: '100%',
          maxWidth: '750px',
          maxHeight: '85vh',
          background: '#ffffff',
          borderRadius: '24px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          direction: 'rtl',
          fontFamily: 'inherit'
        }}
      >
        {/* Search Header Bar */}
        <div style={{
          padding: '18px 22px',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          background: '#f8fafc'
        }}>
          <div style={{ color: '#059669', display: 'flex', alignItems: 'center' }}>
            <Search size={24} />
          </div>

          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`ابحث في حصص الفيديو، دروس ${STAGE_NAMES[studentStage] || 'مرحلتك'}، أو القواعد النحوية...`}
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              fontSize: '1.05rem',
              fontWeight: '600',
              color: '#1e293b',
              outline: 'none',
              fontFamily: 'inherit'
            }}
          />

          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{
                background: '#e2e8f0',
                border: 'none',
                borderRadius: '50%',
                width: '26px',
                height: '26px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64748b'
              }}
              title="مسح البحث"
            >
              <X size={15} />
            </button>
          )}

          <button
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '12px',
              padding: '6px 12px',
              cursor: 'pointer',
              color: '#475569',
              fontSize: '0.85rem',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span>إغلاق</span>
            <kbd style={{ fontSize: '0.75rem', background: '#e2e8f0', padding: '2px 5px', borderRadius: '4px' }}>ESC</kbd>
          </button>
        </div>

        {/* Categories / Filter Pills */}
        <div style={{
          padding: '12px 20px',
          background: '#ffffff',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none'
        }}>
          {[
            { id: 'all', label: '🌟 الكل' },
            { id: 'lessons', label: '🎬 حصص وفيديوهات المعلم' },
            { id: 'tracks', label: '📖 المسار المقرّر' },
            { id: 'grammar', label: '⚖️ النحو والإعراب' },
            { id: 'dictation', label: '✍️ الإملاء والبلاغة' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                padding: '6px 14px',
                borderRadius: '18px',
                border: 'none',
                background: activeCategory === cat.id ? 'linear-gradient(135deg, #059669, #10b981)' : '#f1f5f9',
                color: activeCategory === cat.id ? '#ffffff' : '#475569',
                fontWeight: activeCategory === cat.id ? '800' : '600',
                fontSize: '0.85rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
                boxShadow: activeCategory === cat.id ? '0 3px 10px rgba(5,150,105,0.25)' : 'none'
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results / List Container */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '18px 20px',
          WebkitOverflowScrolling: 'touch'
        }}>
          {/* Quick Suggestions when empty query */}
          {!searchTerm && (
            <div style={{ marginBottom: '18px' }}>
              <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold', marginBottom: '10px' }}>
                💡 موضوعات شائعة لمرحلتك ({STAGE_NAMES[studentStage] || 'المرحلة'}):
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSearchTerm(s)}
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '6px 12px',
                      fontSize: '0.85rem',
                      color: '#0f172a',
                      cursor: 'pointer',
                      fontWeight: '600',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#10b981'
                      e.currentTarget.style.background = '#ecfdf5'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e2e8f0'
                      e.currentTarget.style.background = '#f8fafc'
                    }}
                  >
                    🔍 {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results count */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold' }}>
              {searchTerm ? `نتائج البحث عن "${searchTerm}":` : 'الدروس والمسارات المتاحة:'}
            </span>
            <span style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 'bold', background: '#ecfdf5', padding: '2px 8px', borderRadius: '10px' }}>
              {results.length} نتيجة
            </span>
          </div>

          {/* No results */}
          {results.length === 0 ? (
            <div style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: '#64748b',
              background: '#f8fafc',
              borderRadius: '16px',
              border: '1px dashed #cbd5e1',
              marginTop: '10px'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🔍</div>
              <h4 style={{ margin: '0 0 6px 0', color: '#1e293b', fontSize: '1.1rem' }}>لم نعثر على نتيجة مطابقة</h4>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>
                جرب البحث بكلمة أخرى مثل (نحو، قراءة، اسم فاعل، همزة، أو اسم الحصة).
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {results.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '16px',
                    border: '1.5px solid #f1f5f9',
                    background: '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '14px',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#10b981'
                    e.currentTarget.style.background = '#f0fdf4'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#f1f5f9'
                    e.currentTarget.style.background = '#ffffff'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: '800',
                        padding: '3px 8px',
                        borderRadius: '8px',
                        background: item.sourceType === 'teacher_lesson' ? '#eff6ff' : '#ecfdf5',
                        color: item.sourceType === 'teacher_lesson' ? '#1d4ed8' : '#047857',
                        border: `1px solid ${item.sourceType === 'teacher_lesson' ? '#bfdbfe' : '#a7f3d0'}`
                      }}>
                        {item.typeBadge}
                      </span>

                      {item.isFree && (
                        <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#16a34a', background: '#dcfce7', padding: '2px 6px', borderRadius: '6px' }}>
                          مجاني
                        </span>
                      )}

                      <h4 style={{
                        margin: 0,
                        fontSize: '1rem',
                        fontWeight: '800',
                        color: '#0f172a',
                        wordBreak: 'break-word'
                      }}>
                        {item.title}
                      </h4>
                    </div>

                    <p style={{
                      margin: 0,
                      fontSize: '0.85rem',
                      color: '#64748b',
                      lineHeight: '1.4',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {item.desc}
                    </p>
                  </div>

                  <div style={{
                    padding: '8px 14px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #059669, #10b981)',
                    color: 'white',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    flexShrink: 0,
                    boxShadow: '0 2px 6px rgba(5,150,105,0.25)'
                  }}>
                    <span>{item.sourceType === 'teacher_lesson' ? 'مشاهدة' : 'انتقال'}</span>
                    <ArrowRight size={14} style={{ transform: 'rotate(180deg)' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid #f1f5f9',
          background: '#f8fafc',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.8rem',
          color: '#64748b'
        }}>
          <span>💡 نصيحة: يمكنك الضغط على أي درس للفتح المباشر</span>
          <span style={{ fontWeight: 'bold' }}>منصة المستر إبراهيم عمار الجندي ✨</span>
        </div>
      </div>
    </div>
  )
}
