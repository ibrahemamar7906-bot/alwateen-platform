'use client'
import Link from 'next/link'
import { ArrowRight, PenTool, ChevronLeft, Lock } from 'lucide-react'
import styles from '../page.module.css'

export default function BranchPage() {
  const lessons = [
  {
    "title": "الهمزة المتوسطة على نبرة وواو وألف",
    "desc": "تطبيق قاعدة سلم الحركات لمعرفة الحرف الذي يناسب الهمزة."
  },
  {
    "title": "الهمزة المتطرفة على السطر وعلى الحرف",
    "desc": "ضبط حركة ما قبل الهمزة في نهاية الكلمات المختلفة."
  }
];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerTop}>
            <Link href="/primary-5" className={styles.backButton} aria-label="العودة">
              <ArrowRight size={24} />
            </Link>
            <div>
              <div className={styles.subtitle}>
                <PenTool size={18} />
                <span>القواعد الإملائية والرسم الكتابي - الصف الخامس الابتدائي</span>
              </div>
              <h1 className={styles.title}>مسار القواعد الإملائية والرسم الكتابي</h1>
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
                  <PenTool size={28} />
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
