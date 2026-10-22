'use client'
import Link from 'next/link'
import { ArrowRight, BookOpen, Lock, PenTool, ChevronLeft, Target } from 'lucide-react'
import styles from '../page.module.css'

export default function Prep3GrammarIndex() {
  const lessons = [
    { 
      title: 'اسم الفاعل', 
      desc: 'صياغة اسم الفاعل من الثلاثي وغير الثلاثي وإعماله، وحالات حذف ياء الاسم المنقوص (قاضٍ، ساعٍ).', 
      path: '/prep-3/grammar/lesson-1', 
      status: 'متاح الآن',
      isLocked: false,
    },
    { 
      title: 'صيغ المبالغة', 
      desc: 'أوزان صيغ المبالغة القياسية الخمسة (مِفْعَال، فَعُول، فَعِيل، فَعِل، فَعَّال) وشفرتها الحفظية.', 
      path: '/prep-3/grammar/lesson-2', 
      status: 'متاح الآن',
      isLocked: false,
    },
    { 
      title: 'اسم المفعول', 
      desc: 'صياغة اسم المفعول من الفعل المبني للمجهول الثلاثي (صحيح ومعتل) وغير الثلاثي بميم مضمومة وفتح ما قبل الآخر.', 
      path: '/prep-3/grammar/lesson-3', 
      status: 'متاح الآن',
      isLocked: false,
    },
    { 
      title: 'اسما الزمان والمكان', 
      desc: 'صياغة اسمي الزمان والمكان على وزني (مَفْعَل ومَفْعِل) من الثلاثي ومن غير الثلاثي كاسم المفعول.', 
      path: '/prep-3/grammar/lesson-4', 
      status: 'متاح الآن',
      isLocked: false,
    },
    { 
      title: 'اسم الآلة', 
      desc: 'التمييز بين اسم الآلة المشتق القياسي (قديم وحديث) والاسم الجامد السماعي مع التدريبات.', 
      path: '/prep-3/grammar/lesson-5', 
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
                <Target size={18} />
                <span>فرع النحو (الصف الثالث الإعدادي)</span>
              </div>
              <h1 className={styles.title}>قواعد النحو والمشتقات (٥ دروس)</h1>
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
