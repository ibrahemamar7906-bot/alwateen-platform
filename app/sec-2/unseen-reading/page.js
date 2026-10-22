'use client'
import Link from 'next/link'
import { ArrowRight, BookOpen, Lock, ChevronLeft, Target } from 'lucide-react'
import styles from '../page.module.css'

export default function UnseenReadingIndex() {
  // Generate 20 lessons
  const lessons = Array.from({ length: 20 }, (_, i) => ({
    title: `تدريب متحرر (${i + 1})`,
    desc: 'قراءة متحررة - مستوى متدرج',
    path: `/sec-2/unseen-reading/test-${i + 1}`,
    status: 'متاح الآن',
    isLocked: false,
  }))

  // Add some future locked ones
  lessons.push({
    title: 'تدريب متحرر (21)',
    desc: 'قراءة متحررة (مستويات عليا)',
    path: '#',
    status: 'قريباً جداً',
    isLocked: true,
  })

  return (
    <div className={styles.container}>
      
      {/* Premium Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerTop}>
            <Link href="/sec-2" className={styles.backButton} aria-label="العودة">
              <ArrowRight size={24} />
            </Link>
            <div>
              <div className={styles.subtitle}>
                <Target size={18} />
                <span>فرع القراءة المتحررة</span>
              </div>
              <h1 className={styles.title}>تدريبات القراءة المتحررة</h1>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContent}>
        <div className={styles.listGrid}>
          {lessons.map((lesson, idx) => (
            <Link 
              key={idx} 
              href={lesson.path}
              className={`${styles.listCard} ${lesson.isLocked ? styles.lockedCard : ''}`}
              onClick={e => lesson.isLocked && e.preventDefault()}
            >
              <div className={styles.listCardLeft}>
                <div className={styles.listIconBox}>
                  {lesson.isLocked ? (
                    <Lock size={24} />
                  ) : (
                    <BookOpen size={24} />
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
                {!lesson.isLocked && (
                  <div className={styles.actionBtn}>
                    <ChevronLeft size={18} />
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
