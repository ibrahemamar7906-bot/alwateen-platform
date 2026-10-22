'use client'
import Link from 'next/link'
import { ArrowRight, Sparkles, ChevronLeft } from 'lucide-react'
import styles from '../page.module.css'

export default function Sec3RhetoricPage() {
  const topics = [
    { title: 'التجربة الشعرية وعناصرها', desc: 'مفهوم التجربة الشعرية، الوجدان (العاطفة)، الفكر، والصورة التعبيرية (الألفاظ والعبارات، الموسيقى، والصور والأخيلة).', isLocked: false },
    { title: 'الوحدة الفنية (الوحدة العضوية)', desc: 'وحدة الموضوع، وحدة الجو النفسي، وترابط الأفكار وتسلسلها في القصيدة.', isLocked: false },
    { title: 'الصور والأخيلة المركبة والممتدة والمبتكرة', desc: 'التمييز بين الصورة الجزئية، الكلية (الصوت واللون والحركة)، المركبة المتداخلة، الممتدة، والمرشحة والمجردة.', isLocked: false },
    { title: 'الموسيقى في النص الشعري', desc: 'الموسيقى الظاهرة الخارجية (الوزن والقافية والمحسنات) والموسيقى الخفية الداخلية (الصدق وحسن انتقاء الألفاظ).', isLocked: false }
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
                <Sparkles size={18} />
                <span>البلاغة العربية - الصف الثالث الثانوي</span>
              </div>
              <h1 className={styles.title}>البلاغة والتجربة الشعرية الشاملة</h1>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContent} style={{ marginTop: '30px' }}>
        <div className={styles.cardsGrid}>
          {topics.map((topic, idx) => (
            <div key={idx} className={styles.courseCard}>
              <div className={styles.cardHeader}>
                <div className={styles.iconBox}>
                  <Sparkles size={28} />
                </div>
                <span className={styles.badge}>بلاغة شاملة 📜</span>
              </div>
              <h3 className={styles.cardTitle}>{topic.title}</h3>
              <p className={styles.cardDesc}>{topic.desc}</p>
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
