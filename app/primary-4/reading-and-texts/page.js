'use client'
import Link from 'next/link'
import { ArrowRight, BookOpen, ChevronLeft, Lock } from 'lucide-react'
import styles from '../page.module.css'

export default function BranchPage() {
  const lessons = [
  {
    "title": "قصة الاستماع: حوار مع د. مجدي يعقوب",
    "desc": "لقاء مع جراح القلوب العالمي، ودوره في خدمة وطنه مصر وأخلاقيات الطب."
  },
  {
    "title": "نص شعري: يا مصر (للشاعر محمد إبراهيم)",
    "desc": "حب الوطن والتضحية من أجله والفخر بحضارته العريقة."
  },
  {
    "title": "نص معلوماتي: موطني (هجرة الطيور)",
    "desc": "موقع مصر الجغرافي المتميز ومسارات الطيور المهاجرة عالمياً."
  },
  {
    "title": "قصة الاستماع: خبر عن معلم للقراءة",
    "desc": "قيمة المعلم ودور التعليم في بناء شخصية التلميذ."
  }
];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerTop}>
            <Link href="/primary-4" className={styles.backButton} aria-label="العودة">
              <ArrowRight size={24} />
            </Link>
            <div>
              <div className={styles.subtitle}>
                <BookOpen size={18} />
                <span>المنهج الدراسي وقصص القراءة والنصوص - الصف الرابع الابتدائي</span>
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
