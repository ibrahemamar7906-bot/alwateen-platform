'use client'
import Link from 'next/link'
import { ArrowRight, Book, ChevronLeft, FileSignature, PenTool } from 'lucide-react'
import styles from '../page.module.css'

export default function Prep3DictationIndex() {
  const lessons = [
    { 
      title: 'كتابة الهمزة في بداية الكلمة (همزة القطع وألف الوصل)', 
      desc: 'قاعدة الواو والفاء للتفريق السريع، ومواضع القطع والوصل في الأسماء والأفعال والحروف.', 
      path: '/prep-3/dictation/lesson-1', 
      status: 'متاح الآن',
      isLocked: false,
    },
    { 
      title: 'كتابة الهمزة المتوسطة', 
      desc: 'قاعدة سلم قوة الحركات (الكسرة > الضمة > الفتحة > السكون) لكتابة الهمزة على نبرة أو واو أو ألف.', 
      path: '/prep-3/dictation/lesson-2', 
      status: 'متاح الآن',
      isLocked: false,
    },
    { 
      title: 'كتابة الهمزة المتطرفة', 
      desc: 'رسم الهمزة في نهاية الكلمة حسب حركة الحرف الذي قبلها فقط، وحالات (شَيْء، دِفْء، بَرِيء).', 
      path: '/prep-3/dictation/lesson-3', 
      status: 'متاح الآن',
      isLocked: false,
    },
    { 
      title: 'التعبير الكتابي: فن كتابة التقرير الصحفي', 
      desc: 'كيفية صياغة تقرير صحفي متكامل العناصر (العنوان، الزمان، المكان، الأحداث، والتوصيات).', 
      path: '/prep-3/dictation/writing-1', 
      status: 'متاح الآن',
      isLocked: false,
    }
  ]

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
                <FileSignature size={18} />
                <span>فرع الإملاء والتعبير (الصف الثالث الإعدادي)</span>
              </div>
              <h1 className={styles.title}>قواعد الإملاء والتعبير الكتابي</h1>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContent} style={{ marginTop: '30px' }}>
        <div className={styles.cardsGrid}>
          {lessons.map((lesson, idx) => (
            <Link 
              key={idx} 
              href={lesson.path}
              className={`${styles.courseCard} ${lesson.isLocked ? styles.lockedCard : ''}`}
            >
              <div className={styles.cardHeader}>
                <div className={styles.iconBox}>
                  <PenTool size={28} />
                </div>
                <span className={styles.badge}>
                  {lesson.status}
                </span>
              </div>
              
              <h3 className={styles.cardTitle}>{lesson.title}</h3>
              <p className={styles.cardDesc}>{lesson.desc}</p>
              
              <div className={styles.cardFooter}>
                <span className={styles.footerText}>ابدأ الدرس الآن</span>
                <div className={styles.actionBtn}>
                  <ChevronLeft size={18} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
