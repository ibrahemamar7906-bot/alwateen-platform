'use client'
import Link from 'next/link'
import { ArrowRight, FileSignature, ChevronLeft, Lock } from 'lucide-react'
import styles from '../page.module.css'

export default function BranchPage() {
  const lessons = [
  {
    "title": "كتابة وصف حدث",
    "desc": "الجملة الافتتاحية، مكان الحدث، وقته، ما قبل وأثناء الحدث، والخاتمة."
  },
  {
    "title": "كتابة نص وصفي",
    "desc": "وصف شكل الشيء واستخداماته ومميزاته وعيوبه ورأي الكاتب فيه."
  },
  {
    "title": "كتابة نص إقناعي وسيرة غيرية",
    "desc": "عرض الفكرة مع أدلة مقنعة وتحليل سيرة شخصية رائدة."
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
                <FileSignature size={18} />
                <span>الكتابة السردية (التعبير الكتابي) - الصف الرابع الابتدائي</span>
              </div>
              <h1 className={styles.title}>مسار الكتابة السردية (التعبير الكتابي)</h1>
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
                  <FileSignature size={28} />
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
