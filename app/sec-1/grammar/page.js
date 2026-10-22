'use client'
import Link from 'next/link'
import { ArrowRight, Target, ChevronLeft, Lock } from 'lucide-react'
import styles from '../page.module.css'

export default function Sec1GrammarPage() {
  const lessons = [
    { title: 'كان وأخواتها (الناقصة والتامة)', desc: 'الفرق بين كان الناقصة التي تحتاج لخبر وكان التامة التي تكتفي بفاعلها.', isLocked: false },
    { title: 'كاد وأخواتها (أفعال المقاربة والرجاء والشروع)', desc: 'شروط عمل كاد وأخواتها، وأحكام اقتران خبرها بأن (يجب، يكثر، يقل، يمتنع).', isLocked: false },
    { title: 'إعمال اسم الفاعل وصيغ المبالغة', desc: 'شروط إعمال المشتقات المعرفة بأل والمجردة منها المعمول بها في الجملة.', isLocked: false },
    { title: 'إعمال اسم المفعول', desc: 'صياغة اسم المفعول وعمله في رفع نائب الفاعل ونصب المفعول الثاني.', isLocked: false },
    { title: 'الاسم المقصور والمنقوص والممدود', desc: 'تثنية وجمع المقصور والمنقوص والممدود جمعاً سالماً مع ضبط الحركات.', isLocked: false },
    { title: 'ملحقات المثنى وجمع المذكر والمؤنث السالم', desc: 'كلا وكلتا، اثنان واثنتان، أولو، بنون، سنون، وعالمون وعلامات إعرابها.', isLocked: false }
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
                <Target size={18} />
                <span>فرع النحو (الصف الأول الثانوي)</span>
              </div>
              <h1 className={styles.title}>قواعد النحو العربي والتأسيس الثانوي</h1>
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
                  <Target size={28} />
                </div>
                <span className={styles.badge}>متاح للتدريب 🌟</span>
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
