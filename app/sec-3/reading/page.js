'use client'
import Link from 'next/link'
import { ArrowRight, BookOpen, ChevronLeft } from 'lucide-react'
import styles from '../page.module.css'

export default function Sec3ReadingPage() {
  const topics = [
    { title: 'نصوص متحررة: شعر ونثر وزاري', desc: 'تطبيقات مكثفة على مخرجات التعلم في المدارس الشعرية وفنون النثر بنظام البابل شيت الحديث.', isLocked: false },
    { title: 'قراءة متحررة: مقالات فكرية وعلمية وفلسفية', desc: 'تحليل دقيق للعلاقات الضمنية، استنتاج المغزى والهدف غير المباشر، وتفنيد الأفكار.', isLocked: false },
    { title: 'بنك أسئلة امتحانات الثانوية العامة السابقة', desc: 'تطبيقات تفاعلية على امتحانات الدور الأول والثاني من 2021 وحتى 2025 مع تصحيح فوري.', isLocked: false }
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
                <BookOpen size={18} />
                <span>النظام الحديث - الصف الثالث الثانوي</span>
              </div>
              <h1 className={styles.title}>القراءة والنصوص المتحررة (البابل شيت)</h1>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContent} style={{ marginTop: '30px' }}>
        <div className={styles.cardsGrid}>
          {topics.map((t, idx) => (
            <div key={idx} className={styles.courseCard}>
              <div className={styles.cardHeader}>
                <div className={styles.iconBox}>
                  <BookOpen size={28} />
                </div>
                <span className={styles.badge}>بابل شيت 🎯</span>
              </div>
              <h3 className={styles.cardTitle}>{t.title}</h3>
              <p className={styles.cardDesc}>{t.desc}</p>
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
