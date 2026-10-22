'use client'
import Link from 'next/link'
import { ArrowRight, Sparkles, ChevronLeft } from 'lucide-react'
import styles from '../page.module.css'

export default function Sec1RhetoricPage() {
  const lessons = [
    { title: 'التعبير الحقيقي والمجازي', desc: 'التمييز بين الحقيقة والمجاز وبداية التذوق البلاغي الدقيق.', isLocked: false },
    { title: 'التشبيه وأركانه وأنواعه', desc: 'التشبيه المفصل والمجمل والمؤكد والبليغ والتمثيلي والضمني وسر الجمال.', isLocked: false },
    { title: 'الاستعارة المكنية والتصريحية', desc: 'حذف أحد طرفي التشبيه وقرينة الاستعارة وسر جمالها (تشخيص، تجسيم، توضيح).', isLocked: false },
    { title: 'الكناية وأنواعها', desc: 'الكناية عن صفة، والكناية عن موصوف، والكناية عن نسبة، وسر جمالها.', isLocked: false },
    { title: 'المجاز المرسل وعلاقاته', desc: 'الجزئية، الكلية، السببية، المسببية، المحلية، الحالية، واعتبار ما كان وما سيكون.', isLocked: false }
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
                <Sparkles size={18} />
                <span>فرع البلاغة (علم البيان) - الصف الأول الثانوي</span>
              </div>
              <h1 className={styles.title}>البلاغة العربية والتذوق الأدبي</h1>
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
                <span className={styles.badge}>علم البيان 📜</span>
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
