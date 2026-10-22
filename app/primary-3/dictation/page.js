'use client'
import Link from 'next/link'
import { ArrowRight, PenTool, ChevronLeft, Lock } from 'lucide-react'
import styles from '../page.module.css'

export default function BranchPage() {
  const lessons = [
  {
    "title": "الألف اللينة في آخر الكلمة",
    "desc": "رسم الألف اللينة قائمة أو على شكل ياء غير منقوطة (ى)."
  },
  {
    "title": "همزة القطع وألف الوصل",
    "desc": "التمييز بين الهمزة التي تنطق وتكتب والهمزة التي تسقط في الوصل."
  },
  {
    "title": "الكلمات التي بها حروف تنطق ولا تكتب",
    "desc": "مثل (هذا، هذه، هذان، هؤلاء، ذلك، لكن)."
  },
  {
    "title": "علامات الترقيم الأساسية",
    "desc": "النقطة، الفاصلة، علامة الاستفهام، وعلامة التعجب."
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
                <PenTool size={18} />
                <span>القواعد الإملائية والرسم الكتابي - الصف الثالث الابتدائي</span>
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
