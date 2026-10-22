'use client'
import Link from 'next/link'
import { ArrowRight, BookOpen, ChevronLeft, Lock } from 'lucide-react'
import styles from '../page.module.css'

export default function BranchPage() {
  const lessons = [
  {
    "title": "قصة الاستماع: أطعمة مميزة",
    "desc": "نص استماع عن الغذاء الصحي وأهميته لبناء الجسم والعقل."
  },
  {
    "title": "درس قراءة: أدواتي الشخصية",
    "desc": "قصة هند وحقيبتها وأهمية الحفاظ على النظافة الشخصية."
  },
  {
    "title": "نشيد: صحتنا سر سعادتنا",
    "desc": "أبيات شعرية جميلة عن الصحة وقيمة النظافة وممارسة الرياضة."
  },
  {
    "title": "قصة الاستماع: فكرة ومعلومة",
    "desc": "تعلم مهارات البحث والاكتشاف وتبادل المعلومات النافعة."
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
                <BookOpen size={18} />
                <span>المنهج الدراسي وقصص الاستماع - الصف الثالث الابتدائي</span>
              </div>
              <h1 className={styles.title}>مسار المنهج الدراسي وقصص الاستماع</h1>
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
