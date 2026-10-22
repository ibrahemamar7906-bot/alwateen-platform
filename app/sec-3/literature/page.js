'use client'
import Link from 'next/link'
import { ArrowRight, FileText, ChevronLeft } from 'lucide-react'
import styles from '../page.module.css'

export default function Sec3LiteraturePage() {
  const schools = [
    { title: 'مدرسة الإحياء والبعث وجيل التطوير', desc: 'محمود سامي البارودي، شوقي، حافظ إبراهيم، وسمات الكلاسيكية الجديدة.', isLocked: false },
    { title: 'الاتجاه الوجداني (خليل مطران)', desc: 'نشأة الاتجاه الوجداني وتطوره ومقوماته وسمات شعر مطران.', isLocked: false },
    { title: 'مدرسة الديوان (العقاد، المازني، شكري)', desc: 'ظروف النشأة، طغيان الجانب الفكري والذهنية الجافة، ومفهوم القصيدة كائن حي.', isLocked: false },
    { title: 'مدرسة أبوللو (أحمد زكي أبو شادي)', desc: 'التأثر بالرومانتيكية، التشاؤم والاستسلام للآلام، واستعمال اللغة استعمالاً جديداً.', isLocked: false },
    { title: 'مدرسة المهاجر (شعر المهجر)', desc: 'الرابطة القلمية والعصبة الأندلسية، الحنين إلى الوطن، النزعة الروحية، والتساهل اللغوي.', isLocked: false },
    { title: 'المدرسة الواقعية (الشعر الجديد / شعر التفعيلة)', desc: 'الشعر الحر، التعبير عن الواقع وتناقضات الحياة، وتطور الشكل والموسيقى.', isLocked: false },
    { title: 'فنون النثر العربي الحديث', desc: 'المقال، الرواية والقصة القصيرة، والمسرحية (أنواعها وهيكلها وبناؤها الفني).', isLocked: false }
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
                <FileText size={18} />
                <span>تاريخ الأدب العربي - الصف الثالث الثانوي</span>
              </div>
              <h1 className={styles.title}>مدارس الشعر العربي وفنون النثر</h1>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContent} style={{ marginTop: '30px' }}>
        <div className={styles.cardsGrid}>
          {schools.map((school, idx) => (
            <div key={idx} className={styles.courseCard}>
              <div className={styles.cardHeader}>
                <div className={styles.iconBox}>
                  <FileText size={28} />
                </div>
                <span className={styles.badge}>مدرسة أدبية 🏛️</span>
              </div>
              <h3 className={styles.cardTitle}>{school.title}</h3>
              <p className={styles.cardDesc}>{school.desc}</p>
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
