'use client'
import Link from 'next/link'
import { ArrowRight, BookOpen, Lock, FileSignature, LayoutList } from 'lucide-react'
import styles from '../page.module.css'

export default function Prep1DictationIndex() {
  const lessons = [
    { 
      title: 'كتابة الهمزة على الألف', 
      desc: 'حالات رسم الهمزة المتوسطة والمتطرفة على الألف', 
      path: '/prep-1/dictation/lesson-1', 
      status: 'متاح الآن',
      isLocked: false,
    },
    { 
      title: 'كتابة الهمزة على الواو', 
      desc: 'قواعد رسم الهمزة المتوسطة والمتطرفة على الواو', 
      path: '/prep-1/dictation/lesson-2', 
      status: 'متاح الآن',
      isLocked: false,
    },
    { 
      title: 'كتابة الهمزة على الياء', 
      desc: 'حالات كتابة الهمزة المتوسطة والمتطرفة على الياء (نبرة)', 
      path: '/prep-1/dictation/lesson-3', 
      status: 'متاح الآن',
      isLocked: false,
    },
    { 
      title: 'التعبير: كتابة السيرة الذاتية', 
      desc: 'كيفية كتابة سيرة ذاتية بشكل صحيح ومميز', 
      path: '/prep-1/dictation/writing-1', 
      status: 'متاح الآن',
      isLocked: false,
    },
    { 
      title: 'التعبير: كتابة السيرة الغيرية', 
      desc: 'خطوات كتابة سيرة شخصية عن شخص آخر', 
      path: '/prep-1/dictation/writing-2', 
      status: 'متاح الآن',
      isLocked: false,
    }
  ]

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
                <FileSignature size={18} />
                <span>فرع الإملاء والتعبير</span>
              </div>
              <h1 className={styles.title}>الإملاء والتعبير الكتابي - 1 إعدادي</h1>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContent}>
        <div className={styles.listGrid}>
          {lessons.map((lesson, idx) => (
            <div 
              key={idx} 
              className={`${styles.listCard} ${lesson.isLocked ? styles.lockedCard : ''}`}
              style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'stretch' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className={styles.listCardLeft}>
                  <div className={styles.listIconBox}>
                    {lesson.isLocked ? (
                      <Lock size={24} />
                    ) : (
                      <FileSignature size={24} />
                    )}
                  </div>
                  <div className={styles.listCardContent}>
                    <h3 className={styles.listCardTitle}>{lesson.title}</h3>
                    <p className={styles.listCardDesc}>{lesson.desc}</p>
                  </div>
                </div>
                <div className={styles.listCardRight}>
                  <span className={`${styles.badge} ${lesson.isLocked ? styles.lockedBadge : ''}`}>
                    {lesson.status}
                  </span>
                </div>
              </div>
              
              {!lesson.isLocked && (
                <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                  <Link 
                    href={lesson.path}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#ecfdf5', color: '#059669', padding: '10px', borderRadius: '8px', fontWeight: 'bold', textDecoration: 'none', border: '1px solid #a7f3d0', transition: 'all 0.2s' }}
                  >
                    <BookOpen size={18} />
                    شرح الدرس
                  </Link>
                  <Link 
                    href={`${lesson.path}#questions`}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#059669', color: 'white', padding: '10px', borderRadius: '8px', fontWeight: 'bold', textDecoration: 'none', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(5,150,105,0.2)' }}
                  >
                    <LayoutList size={18} />
                    تدريبات وأسئلة
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
