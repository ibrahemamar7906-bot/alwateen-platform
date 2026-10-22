'use client'
import Link from 'next/link'
import { ArrowRight, Book, ChevronLeft } from 'lucide-react'
import styles from '../page.module.css'

export default function Sec3StoryPage() {
  const parts = [
    { title: 'الجزء الأول: الطفولة في القرية المصرية', desc: 'الرياحين والقناة، وفاة أخته الصغرى، خيبة الأمل في الكُتّاب، والرحيل إلى الأزهر.', isLocked: false },
    { title: 'الجزء الثاني: في أروقة الأزهر الشريف', desc: 'الحياة في الربع، لقاء المشايخ، التمرد الفكري، والتحضير للشهادة العالمية.', isLocked: false },
    { title: 'الموازنات الأدبية المقالية', desc: 'مقارنات نقدية بين سيرة طه حسين وتجارب كبار الأدباء في الطفولة والتحدي.', isLocked: false }
  ]

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerTop}>
            <Link href="/sec-3" className={styles.backButton} aria-label="العودة">
              <ArrowRight size={24} />
            </Link>
            <div>
              <div className={styles.subtitle}>
                <Book size={18} />
                <span>القصة المقررة - الصف الثالث الثانوي</span>
              </div>
              <h1 className={styles.title}>قصة الأيام (سيرة د. طه حسين)</h1>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContent} style={{ marginTop: '30px' }}>
        <div className={styles.cardsGrid}>
          {parts.map((p, idx) => (
            <div key={idx} className={styles.courseCard}>
              <div className={styles.cardHeader}>
                <div className={styles.iconBox}>
                  <Book size={28} />
                </div>
                <span className={styles.badge}>الأيام 📚</span>
              </div>
              <h3 className={styles.cardTitle}>{p.title}</h3>
              <p className={styles.cardDesc}>{p.desc}</p>
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
