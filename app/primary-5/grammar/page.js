'use client'
import Link from 'next/link'
import { ArrowRight, Sparkles, ChevronLeft, Lock } from 'lucide-react'
import styles from '../page.module.css'

export default function BranchPage() {
  const lessons = [
  {
    "title": "المفعول به وعلامات نصبه",
    "desc": "نصب المفعول به بالفتحة، الكسرة، والياء مع جمع المذكر والمثنى."
  },
  {
    "title": "إعراب الفاعل والمفعول في الجملة الفعلية",
    "desc": "تقديم المفعول به على الفاعل وضبط أواخر الكلمات بحسب المعنى."
  },
  {
    "title": "المضاف إليه وعلامات جره",
    "desc": "معرفة النكرة والمعرفة، وحالات جر المضاف إليه بالكسرة والياء."
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
                <Sparkles size={18} />
                <span>القواعد النحوية والإعراب - الصف الخامس الابتدائي</span>
              </div>
              <h1 className={styles.title}>مسار القواعد النحوية والإعراب</h1>
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
                  <Sparkles size={28} />
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
