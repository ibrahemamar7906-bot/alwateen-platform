'use client'
import Link from 'next/link'
import { ArrowRight, Trophy, ChevronLeft, Lock } from 'lucide-react'
import styles from '../page.module.css'

export default function BranchPage() {
  const lessons = [
  {
    "title": "تقييم شامل على المحور الأول",
    "desc": "اختبار إلكتروني سريع يغطي القراءة والأساليب والإملاء."
  },
  {
    "title": "تقييم شامل على المحور الثاني",
    "desc": "اختبار إلكتروني على موضوعات ونصوص المحور الثاني."
  },
  {
    "title": "تحدي الأساليب والنحو السريع",
    "desc": "أسئلة تفاعلية فورية لضبط الإعراب والظواهر اللغوية."
  }
];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerTop}>
            <Link href="/primary-3" className={styles.backButton} aria-label="العودة">
              <ArrowRight size={24} />
            </Link>
            <div>
              <div className={styles.subtitle}>
                <Trophy size={18} />
                <span>بنك الأسئلة والاختبارات التفاعلية - الصف الثالث الابتدائي</span>
              </div>
              <h1 className={styles.title}>مسار بنك الأسئلة والاختبارات التفاعلية</h1>
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
