'use client'
import Link from 'next/link'
import { ArrowRight, Sparkles, ChevronLeft, Lock } from 'lucide-react'
import styles from '../page.module.css'

export default function BranchPage() {
  const lessons = [
  {
    "title": "الجملة الاسمية والجملة الفعلية",
    "desc": "التمييز بين الجملة التي تبدأ باسم والتي تبدأ بفعل."
  },
  {
    "title": "الفعل الماضي والمضارع والأمر",
    "desc": "دلالات الأفعال وعلامات كل فعل وطرق تصريفه."
  },
  {
    "title": "ظرفا الزمان والمكان",
    "desc": "الكلمات الدالة على وقت حدوث الفعل ومكانه (صباحاً، مساءً، فوق، تحت)."
  },
  {
    "title": "أسلوب التعجب وأسلوب النهي",
    "desc": "صيغة ما أفعل! واستخدام لا الناهية لمنع السلوكيات الخاطئة."
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
                <Sparkles size={18} />
                <span>الأساليب والتراكيب والقواعد النحوية - الصف الثالث الابتدائي</span>
              </div>
              <h1 className={styles.title}>مسار الأساليب والتراكيب والقواعد النحوية</h1>
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
