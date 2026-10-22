'use client'
import Link from 'next/link'
import { ArrowRight, BookOpen, Lock, ChevronLeft, BookType } from 'lucide-react'
import styles from '../page.module.css'

export default function ReadingIndex() {
  const lessons = [
    { 
      title: 'إعمال العقل في التفكير العلمي', 
      desc: 'تدريب تفاعلي - مستوى أول', 
      path: '/sec-2/reading/lesson-1', 
      status: 'متاح الآن',
      isLocked: false,
    },
    { 
      title: 'إرادة التغيير وأثرها الإيجابي', 
      desc: 'تدريب تطبيقي - مستوى متقدم', 
      path: '/sec-2/reading/lesson-2', 
      status: 'متاح الآن',
      isLocked: false,
    },
    { 
      title: 'آداب في عصر التكنولوجيا', 
      desc: 'قطعة حرة (قريباً)', 
      path: '#', 
      status: 'مغلق',
      isLocked: true,
    }
  ]

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
                <BookType size={18} />
                <span>فرع اللغة العربية</span>
              </div>
              <h1 className={styles.title}>القراءة الحرة</h1>
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
