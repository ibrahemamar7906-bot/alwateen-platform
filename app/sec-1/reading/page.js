'use client'
import Link from 'next/link'
import { ArrowRight, BookOpen, ChevronLeft } from 'lucide-react'
import styles from '../page.module.css'

export default function Sec1ReadingPage() {
  const lessons = [
    { title: 'نصوص متحررة: شعر ونثر تحليلي', desc: 'تطبيقات على العصور الأدبية بأسئلة بابل شيت تقيس مخرجات التعلم.', isLocked: false },
    { title: 'قراءة متحررة: مقالات علمية وفلسفية', desc: 'استنتاج الفكرة العامة والضمنية، العلاقات بين الجمل، ونقد الأفكار.', isLocked: false },
    { title: 'بنك تطبيقات النظام الحديث', desc: 'نماذج امتحانات إلكترونية متحررة بتصحيح فوري وتوجيه تعليمي.', isLocked: false }
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
                <BookOpen size={18} />
                <span>القراءة والنصوص المتحررة - الصف الأول الثانوي</span>
              </div>
              <h1 className={styles.title}>تدريبات النظام الحديث والبابل شيت</h1>
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
                <span className={styles.badge}>نظام حديث 🎯</span>
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
