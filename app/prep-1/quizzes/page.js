'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, BookOpen, PenTool, FileSignature, Trophy, Sparkles, CheckCircle2, Play, ChevronLeft, Target, RotateCcw } from 'lucide-react'
import styles from '../page.module.css'
import { PREP1_QUIZZES } from '../data/prep1_quizzes'
import InteractiveQuiz from '../components/InteractiveQuiz'

export default function Prep1QuizzesIndex() {
  const [selectedFilter, setSelectedFilter] = useState('all') // 'all', 'reading', 'poetry', 'grammar', 'dictation'
  const [activeQuizKey, setActiveQuizKey] = useState(null)

  const quizKeys = Object.keys(PREP1_QUIZZES)

  // Filter quizzes
  const filteredKeys = quizKeys.filter(key => {
    const q = PREP1_QUIZZES[key]
    if (selectedFilter === 'all') return true
    if (selectedFilter === 'reading') return q.category === 'قراءة' || q.category === 'استماع'
    if (selectedFilter === 'poetry') return q.category === 'نصوص'
    if (selectedFilter === 'grammar') return q.category === 'نحو'
    if (selectedFilter === 'dictation') return q.category === 'إملاء' || q.category === 'تعبير'
    return true
  })

  // Get lesson link
  const getLessonPath = (key) => {
    if (key.startsWith('reading-')) return `/prep-1/reading-and-texts/lesson-${key.split('-')[1]}#quiz`
    if (key.startsWith('grammar-')) return `/prep-1/grammar/lesson-${key.split('-')[1]}#quiz`
    if (key.startsWith('dictation-')) return `/prep-1/dictation/lesson-${key.split('-')[1]}#quiz`
    if (key.startsWith('writing-')) return `/prep-1/dictation/writing-${key.split('-')[1]}#quiz`
    return '/prep-1'
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerTop}>
            <Link href="/prep-1" className={styles.backButton} aria-label="العودة">
              <ArrowRight size={24} />
            </Link>
            <div>
              <div className={styles.subtitle}>
                <Trophy size={18} />
                <span>مسار الأسئلة والاختبارات التفاعلية 🎯</span>
              </div>
              <h1 className={styles.title}>بنك أسئلة أولى إعدادي (تصحيح تلقائي)</h1>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContent} style={{ marginTop: '30px' }}>
        
        {/* If an active quiz is selected, render it at the top */}
        {activeQuizKey && PREP1_QUIZZES[activeQuizKey] && (
          <div style={{ marginBottom: '35px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <button
                onClick={() => setActiveQuizKey(null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  color: '#334155',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'Tajawal, sans-serif'
                }}
              >
                <ArrowRight size={18} />
                <span>العودة لقائمة الاختبارات</span>
              </button>

              <Link
                href={getLessonPath(activeQuizKey)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#059669',
                  fontWeight: 700,
                  textDecoration: 'none',
                  fontSize: '0.92rem'
                }}
              >
                <span>الانتقال لصفحة شرح الدرس</span>
                <ChevronLeft size={16} />
              </Link>
            </div>

            <InteractiveQuiz
              quizData={PREP1_QUIZZES[activeQuizKey]}
              id={`quiz-runner-${activeQuizKey}`}
            />
          </div>
        )}


        {/* Filter Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            flexWrap: 'wrap',
            marginBottom: '25px',
            background: '#ffffff',
            padding: '12px 18px',
            borderRadius: '16px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
          }}
        >
          <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>تصنيف الفروع:</span>

          {[
            { id: 'all', label: 'جميع الاختبارات (22 درساً)' },
            { id: 'reading', label: '📖 القراءة والاستماع (9 دروس)' },
            { id: 'poetry', label: '📜 النصوص الشعرية (3 نصوص)' },
            { id: 'grammar', label: '⚖️ النحو والإعراب (5 دروس)' },
            { id: 'dictation', label: '✍️ الإملاء والتعبير (5 دروس)' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setSelectedFilter(tab.id)
                setActiveQuizKey(null)
              }}
              style={{
                background: selectedFilter === tab.id ? '#059669' : '#f1f5f9',
                color: selectedFilter === tab.id ? '#ffffff' : '#475569',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                fontFamily: 'Tajawal, sans-serif',
                transition: 'all 0.2s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Grid of Quizzes */}
        <div className={styles.listGrid}>
          {filteredKeys.map((key) => {
            const quiz = PREP1_QUIZZES[key]
            const isCurrentActive = activeQuizKey === key

            return (
              <div
                key={key}
                className={styles.listCard}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '14px',
                  border: isCurrentActive ? '2px solid #059669' : '1px solid #e2e8f0',
                  background: isCurrentActive ? '#f0fdf4' : '#ffffff'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: quiz.category === 'نحو' ? '#eff6ff' : quiz.category === 'نصوص' ? '#fef3c7' : '#ecfdf5',
                        color: quiz.category === 'نحو' ? '#1d4ed8' : quiz.category === 'نصوص' ? '#b45309' : '#059669'
                      }}
                    >
                      {quiz.category}
                    </span>

                    <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                      {quiz.questions.length} أسئلة MCQ
                    </span>
                  </div>

                  <h3 style={{ color: '#0f172a', margin: '0 0 6px 0', fontSize: '1.18rem', fontWeight: 800 }}>
                    {quiz.title}
                  </h3>

                  <p style={{ color: '#64748b', margin: 0, fontSize: '0.88rem' }}>
                    {quiz.unit}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                  <button
                    onClick={() => {
                      setActiveQuizKey(key)
                      window.scrollTo({ top: 120, behavior: 'smooth' })
                    }}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      background: '#059669',
                      color: '#ffffff',
                      border: 'none',
                      padding: '10px',
                      borderRadius: '8px',
                      fontWeight: 800,
                      fontSize: '0.88rem',
                      cursor: 'pointer',
                      fontFamily: 'Tajawal, sans-serif',
                      boxShadow: '0 2px 6px rgba(5,150,105,0.2)'
                    }}
                  >
                    <Target size={16} />
                    <span>بدء الاختبار التفاعلي</span>
                  </button>

                  <Link
                    href={getLessonPath(key)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: '#f1f5f9',
                      color: '#334155',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      textDecoration: 'none'
                    }}
                    title="الذهاب لدرس الشرح"
                  >
                    <BookOpen size={16} />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}
