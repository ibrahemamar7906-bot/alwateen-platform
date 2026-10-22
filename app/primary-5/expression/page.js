'use client'
import Link from 'next/link'
import { ArrowRight, FileSignature, ChevronLeft, Lock } from 'lucide-react'
import styles from '../page.module.css'

export default function BranchPage() {
  const lessons = [
  {
    "title": "كتابة سيرة ذاتية",
    "desc": "من أنا؟ رحلتي الدراسية، يوم لا أنساه، وطموحي في المستقبل."
  },
  {
    "title": "كتابة استقصاء لجمع المعلومات",
    "desc": "المقدمة والأسئلة والبنود والاستنتاج النهائي لنموذج الاستقصاء."
  },
  {
    "title": "كتابة غلاف منتج ومناقشة فكرة",
    "desc": "اسم المنتج، المكونات، بلد المنشأ، وطريقة الاستخدام."
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
                <FileSignature size={18} />
                <span>الكتابة السردية والتعبير - الصف الخامس الابتدائي</span>
              </div>
              <h1 className={styles.title}>مسار الكتابة السردية والتعبير</h1>
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
                  <FileSignature size={28} />
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
