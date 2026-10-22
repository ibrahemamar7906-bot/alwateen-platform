'use client'
import Link from 'next/link'
import { ArrowRight, FileSignature, ChevronLeft, Lock } from 'lucide-react'
import styles from '../page.module.css'

export default function BranchPage() {
  const lessons = [
  {
    "title": "كتابة لافتة مصورة",
    "desc": "كيفية صياغة جملة إرشادية موجزة ومؤثرة داخل إطار منظم."
  },
  {
    "title": "كتابة مطوية توعوية",
    "desc": "تصميم مطوية بأربع صفحات: الغلاف، المعلومات، ماذا لو، والنصيحة."
  },
  {
    "title": "كتابة فقرة معلوماتية",
    "desc": "الفكرة الرئيسة، الجمل الافتتاحية والختامية، والحقائق العلمية."
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
                <FileSignature size={18} />
                <span>الكتابة السردية والتعبير الكتابي - الصف الثالث الابتدائي</span>
              </div>
              <h1 className={styles.title}>مسار الكتابة السردية والتعبير الكتابي</h1>
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
