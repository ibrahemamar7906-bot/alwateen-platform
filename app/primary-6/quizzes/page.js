'use client'
import Link from 'next/link'
import { ArrowRight, Trophy, ChevronLeft, Lock } from 'lucide-react'
import styles from '../page.module.css'

export default function BranchPage() {
  const lessons = [
  {
    "title": "امتحان محافظة القاهرة (نموذج 1)",
    "desc": "اختبار إلكتروني كامل على نمط الشهادة الابتدائية."
  },
  {
    "title": "امتحان محافظة الجيزة (نموذج 2)",
    "desc": "اختبار شامل بتصحيح فوري ودرجة تقييمية."
  },
  {
    "title": "تحدي الإعراب الشامل للشهادة الابتدائية",
    "desc": "تدريبات مكثفة على إعراب النواسخ والأسماء الخمسة."
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
                <Trophy size={18} />
                <span>امتحانات المحافظات والتقييمات الشاملة - الصف السادس الابتدائي</span>
              </div>
              <h1 className={styles.title}>مسار امتحانات المحافظات والتقييمات الشاملة</h1>
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
                  <Trophy size={28} />
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
