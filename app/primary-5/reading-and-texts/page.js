'use client'
import Link from 'next/link'
import { ArrowRight, BookOpen, ChevronLeft, Lock } from 'lucide-react'
import styles from '../page.module.css'

export default function BranchPage() {
  const lessons = [
  {
    "title": "نص استماع: أنا أستطيع",
    "desc": "قصة آسر وثقته بنفسه وتجاوز عقبة الإخفاق نحو التفوق والنجاح."
  },
  {
    "title": "نص شعري: المعلم (قم للمعلم وفّهِ التبجيلا)",
    "desc": "شرح وتذوق قصيدة أمير الشعراء أحمد شوقي في فضل المعلم."
  },
  {
    "title": "قصة قصيرة: اكتشف مهاراتك",
    "desc": "التعرف على القدرات الشخصية وتطوير المواهب والهوايات."
  },
  {
    "title": "نص معلوماتي: الاختلاف والتميز",
    "desc": "تنوع الكائنات وأثر التعاون وتكامل الأدوار في الكون."
  }
];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerTop}>
            <Link href="/primary-5" className={styles.backButton} aria-label="العودة">
              <ArrowRight size={24} />
            </Link>
            <div>
              <div className={styles.subtitle}>
                <BookOpen size={18} />
                <span>المنهج الدراسي وقصص القراءة والنصوص - الصف الخامس الابتدائي</span>
              </div>
              <h1 className={styles.title}>مسار المنهج الدراسي وقصص القراءة والنصوص</h1>
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
