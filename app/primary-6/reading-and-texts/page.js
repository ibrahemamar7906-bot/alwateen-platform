'use client'
import Link from 'next/link'
import { ArrowRight, BookOpen, ChevronLeft, Lock } from 'lucide-react'
import styles from '../page.module.css'

export default function BranchPage() {
  const lessons = [
  {
    "title": "نص استماع: كن ولا تكن",
    "desc": "نصائح غالية: كن متفائلاً، ولا تكن متهاوناً، كن حكيماً ولا تكن عنيداً."
  },
  {
    "title": "نص شعري: في يوم الشباب (لإبراهيم ناجي)",
    "desc": "أبيات وطنية تدعو الشباب للبناء والعمل ومواكبة العصر."
  },
  {
    "title": "نص معلوماتي: التفكير ومهارات العقل",
    "desc": "العقلية الثابتة والعقلية النامية واستراتيجيات تطوير الذات."
  }
];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerTop}>
            <Link href="/primary-6" className={styles.backButton} aria-label="العودة">
              <ArrowRight size={24} />
            </Link>
            <div>
              <div className={styles.subtitle}>
                <BookOpen size={18} />
                <span>المنهج الدراسي والقراءة والنصوص - الصف السادس الابتدائي</span>
              </div>
              <h1 className={styles.title}>مسار المنهج الدراسي والقراءة والنصوص</h1>
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
                  <BookOpen size={28} />
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
