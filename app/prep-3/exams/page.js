'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, BookOpen, PenTool, FileSignature, Trophy, Sparkles, CheckCircle2, Play, ChevronLeft, Target, RotateCcw } from 'lucide-react'
import styles from '../page.module.css'
import { PREP3_QUIZZES } from '../data/prep3_quizzes'
import InteractiveQuiz from '../components/InteractiveQuiz'

export default function Prep3ExamsIndex() {
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [activeQuizKey, setActiveQuizKey] = useState(null)

  const quizKeys = Object.keys(PREP3_QUIZZES || {}).filter(k => PREP3_QUIZZES[k] && PREP3_QUIZZES[k].length > 0)

  const getQuizMetadata = (key) => {
    if (key.startsWith('reading_lesson-1')) return { title: 'عناصر تحليل وتذوق النصوص', category: 'قراءة', color: '#059669' }
    if (key.startsWith('reading_lesson-2')) return { title: 'عناصر التذوق البلاغي', category: 'بلاغة', color: '#7c3aed' }
    if (key.startsWith('reading_lesson-3')) return { title: 'آداب التعامل مع الوالدين', category: 'قراءة', color: '#059669' }
    if (key.startsWith('reading_lesson-4')) return { title: 'أغلى من الذهب (محمد رشوان)', category: 'قراءة', color: '#059669' }
    if (key.startsWith('reading_lesson-5')) return { title: 'الصداقة (د. شوقي ضيف)', category: 'قراءة', color: '#059669' }
    if (key.startsWith('reading_lesson-6')) return { title: 'نص تحية للشباب (أحمد شوقي)', category: 'نصوص', color: '#2563eb' }
    if (key.startsWith('reading_lesson-7')) return { title: 'ثمرة القراءة', category: 'قراءة', color: '#059669' }
    if (key.startsWith('reading_lesson-8')) return { title: 'أفضل النعم', category: 'قراءة', color: '#059669' }
    if (key.startsWith('reading_lesson-9')) return { title: 'خير جليس في الزمان كتاب', category: 'قراءة', color: '#059669' }
    if (key.startsWith('reading_lesson-10')) return { title: 'نص تاج الفضائل', category: 'نصوص', color: '#2563eb' }
    if (key.startsWith('reading_lesson-11')) return { title: 'بناء المستقبل وحرفتك بين يديك', category: 'قراءة', color: '#059669' }
    if (key.startsWith('reading_lesson-12')) return { title: 'مستقبل مصر الزراعي ونص اصنع بيدك مجدك', category: 'قراءة', color: '#059669' }
    if (key.startsWith('grammar_lesson-1')) return { title: 'اسم الفاعل', category: 'نحو', color: '#d97706' }
    if (key.startsWith('grammar_lesson-2')) return { title: 'صيغ المبالغة', category: 'نحو', color: '#d97706' }
    if (key.startsWith('grammar_lesson-3')) return { title: 'اسم المفعول', category: 'نحو', color: '#d97706' }
    if (key.startsWith('grammar_lesson-4')) return { title: 'اسما الزمان والمكان', category: 'نحو', color: '#d97706' }
    if (key.startsWith('grammar_lesson-5')) return { title: 'اسم الآلة', category: 'نحو', color: '#d97706' }
    if (key.startsWith('dictation_lesson-1')) return { title: 'همزة القطع وألف الوصل', category: 'إملاء', color: '#dc2626' }
    if (key.startsWith('dictation_lesson-2')) return { title: 'كتابة الهمزة المتوسطة', category: 'إملاء', color: '#dc2626' }
    if (key.startsWith('dictation_lesson-3')) return { title: 'كتابة الهمزة المتطرفة', category: 'إملاء', color: '#dc2626' }
    if (key.startsWith('dictation_writing-1')) return { title: 'فن كتابة التقرير الصحفي', category: 'تعبير', color: '#dc2626' }
    return { title: key, category: 'عام', color: '#059669' }
  }

  const filteredKeys = quizKeys.filter(key => {
    const meta = getQuizMetadata(key)
    if (selectedFilter === 'all') return true
    if (selectedFilter === 'reading') return meta.category === 'قراءة'
    if (selectedFilter === 'poetry') return meta.category === 'نصوص'
    if (selectedFilter === 'grammar') return meta.category === 'نحو'
    if (selectedFilter === 'dictation') return meta.category === 'إملاء' || meta.category === 'تعبير'
    return true
  })

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerTop}>
            <Link href="/prep-3" className={styles.backButton} aria-label="العودة">
              <ArrowRight size={24} />
            </Link>
            <div>
              <div className={styles.subtitle}>
                <Trophy size={18} />
                <span>مسار الاختبارات وبنك الأسئلة 🎯</span>
              </div>
              <h1 className={styles.title}>بنك أسئلة الشهادة الإعدادية (تصحيح فوري)</h1>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContent} style={{ marginTop: '30px' }}>
        {activeQuizKey && PREP3_QUIZZES[activeQuizKey] && (
          <div style={{ marginBottom: '35px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <button
                onClick={() => setActiveQuizKey(null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
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
            </div>
            <InteractiveQuiz 
              questions={PREP3_QUIZZES[activeQuizKey]} 
              lessonTitle={getQuizMetadata(activeQuizKey).title} 
            />
          </div>
        )}

        {/* Filter buttons */}
        <div style={{ display: 'flex', gap: '10px', margin: '20px 0', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'جميع فروع المنهج 🌟' },
            { id: 'grammar', label: 'قواعد النحو والمشتقات ⚖️' },
            { id: 'reading', label: 'القراءة ونصوص الاستماع 📖' },
            { id: 'poetry', label: 'النصوص الشعرية 🎵' },
            { id: 'dictation', label: 'الإملاء والتعبير ✍️' },
          ].map(btn => (
            <button
              key={btn.id}
              onClick={() => setSelectedFilter(btn.id)}
              style={{
                padding: '10px 18px',
                borderRadius: '12px',
                border: 'none',
                background: selectedFilter === btn.id ? '#059669' : 'white',
                color: selectedFilter === btn.id ? 'white' : '#475569',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                transition: 'all 0.2s',
                fontFamily: 'Tajawal, sans-serif'
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Cards Grid */}
        <div className={styles.cardsGrid}>
          {filteredKeys.map(key => {
            const meta = getQuizMetadata(key)
            const count = PREP3_QUIZZES[key]?.length || 0
            return (
              <div 
                key={key}
                onClick={() => {
                  setActiveQuizKey(key)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className={styles.courseCard}
                style={{ cursor: 'pointer' }}
              >
                <div className={styles.cardHeader}>
                  <div className={styles.iconBox} style={{ color: meta.color }}>
                    <Target size={28} />
                  </div>
                  <span className={styles.badge} style={{ background: '#ecfdf5', color: '#059669' }}>
                    {meta.category}
                  </span>
                </div>

                <h3 className={styles.cardTitle}>{meta.title}</h3>
                <p className={styles.cardDesc}>
                  اختبار إلكتروني تدريبي يحتوي على {count} أسئلة بنظام الاختيار من متعدد مع تصحيح ذكي فوري.
                </p>

                <div className={styles.cardFooter}>
                  <span className={styles.footerText}>ابدأ الاختبار الإلكتروني</span>
                  <div className={styles.actionBtn}>
                    <Play size={16} fill="currentColor" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
