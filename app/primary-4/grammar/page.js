'use client'
import Link from 'next/link'
import { ArrowRight, Sparkles, ChevronLeft, Lock } from 'lucide-react'
import styles from '../page.module.css'

export default function BranchPage() {
  const lessons = [
  {
    "title": "أقسام الكلام (اسم، فعل، حرف)",
    "desc": "علامات الاسم وأنواع الأفعال والحروف في اللغة العربية."
  },
  {
    "title": "الجملة الاسمية (المبتدأ والخبر)",
    "desc": "ركنا الجملة الاسمية وعلامات رفعهما (الضمة، الألف، الواو)."
  },
  {
    "title": "الجملة الفعلية (الفعل والفاعل)",
    "desc": "تحديد الفاعل وعلامات رفعه في المفرد وجمع التكسير والمؤنث والمذكر."
  },
  {
    "title": "الضمائر وأسماء الإشارة",
    "desc": "ضمائر المتكلم والمخاطب والغائب، والإشارة للقريب والبعيد."
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
                <Sparkles size={18} />
                <span>القواعد النحوية (النحو العربي) - الصف الرابع الابتدائي</span>
              </div>
              <h1 className={styles.title}>مسار القواعد النحوية (النحو العربي)</h1>
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
