'use client'
import Link from 'next/link'
import { ArrowRight, Trophy, ChevronLeft, Lock } from 'lucide-react'
import styles from '../page.module.css'

export default function BranchPage() {
  const lessons = [
  {
    "title": "امتحان شهر أكتوبر التفاعلي",
    "desc": "نموذج مطور على مقرر الشهر الأول مع تقييم فوري."
  },
  {
    "title": "امتحان شهر نوفمبر التفاعلي",
    "desc": "تدريبات على نصوص وقواعد المحور الثاني."
  },
  {
    "title": "الاختبار الشامل لنهاية الفصل الدراسي",
    "desc": "نموذج شامل لجميع الفروع مطابق لمواصفات الوزارة."
  }
];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerTop}>
            <Link href="/primary-4" className={styles.backButton} aria-label="العودة">
              <ArrowRight size={24} />
            </Link>
            <div>
              <div className={styles.subtitle}>
                <Trophy size={18} />
                <span>بنك الأسئلة والاختبارات الشهرية - الصف الرابع الابتدائي</span>
              </div>
              <h1 className={styles.title}>مسار بنك الأسئلة والاختبارات الشهرية</h1>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContent} style={{ marginTop: '30px' }}>
        <div className={styles.cardsGrid}>
          {lessons.map((lesson, idx) => (
            <div key={idx} className={styles.courseCard}>
              <div className={styles.cardHeader}>
                <div className={styles.iconBox}>
                  <Trophy size={28} />
                </div>
                <span className={styles.badge}>الدرس ${idx + 1} 🌟</span>
              </div>
              <h3 className={styles.cardTitle}>{lesson.title}</h3>
              <p className={styles.cardDesc}>{lesson.desc}</p>
              <div className={styles.cardFooter}>
                <span className={styles.footerText}>جاهز للمحتوى والشرح</span>
                <div className={styles.actionBtn}>
                  <ChevronLeft size={18} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
