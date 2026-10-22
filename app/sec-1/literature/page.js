'use client'
import Link from 'next/link'
import { ArrowRight, FileText, ChevronLeft } from 'lucide-react'
import styles from '../page.module.css'

export default function Sec1LiteraturePage() {
  const lessons = [
    { title: 'الأدب في العصر الجاهلي (الشعر والنثر)', desc: 'المعلقات، بناء القصيدة الجاهلية، والوصايا والأمثال والحكم.', isLocked: false },
    { title: 'أدب عصر صدر الإسلام', desc: 'أثر الإسلام في لغة العرب وأغراض الشعر والخطابة والرسائل.', isLocked: false },
    { title: 'أدب العصر الأموي', desc: 'النقائض والغزل الصريح والعذري والشعر السياسي وتطور الخطابة.', isLocked: false }
  ]

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerTop}>
            <Link href="/sec-1" className={styles.backButton} aria-label="العودة">
              <ArrowRight size={24} />
            </Link>
            <div>
              <div className={styles.subtitle}>
                <FileText size={18} />
                <span>تاريخ الأدب العربي - الصف الأول الثانوي</span>
              </div>
              <h1 className={styles.title}>عصور الأدب العربي وخصائصها</h1>
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
                  <FileText size={28} />
                </div>
                <span className={styles.badge}>تاريخ الأدب 🏛️</span>
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
