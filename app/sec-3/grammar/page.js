'use client'
import Link from 'next/link'
import { ArrowRight, Target, ChevronLeft } from 'lucide-react'
import styles from '../page.module.css'

export default function Sec3GrammarPage() {
  const units = [
    { title: 'الوحدة الأولى: النطق والإملاء', desc: 'همزة القطع وألف الوصل، ال الشمسية والقمرية، رسم الهمزات، والتاء المربوطة والمفتوحة والهاء.', isLocked: false },
    { title: 'الوحدة الثانية: الأبنية (المشتقات والمصادر)', desc: 'اسم الفاعل والمفعول والمبالغة والزمان والمكان والآلة والتفضيل، والمصادر الصريحة والميمية والصناعية والمرة والهيئة.', isLocked: false },
    { title: 'الوحدة الثالثة: النواسخ (الجملة الاسمية)', desc: 'المبتدأ والخبر وأحكام تقديمه وحذفه، كان وأخواتها، كاد وأخواتها، إن وأخواتها، ولا سيما، ولا النافية للجنس.', isLocked: false },
    { title: 'الوحدة الرابعة: المنصوبات في اللغة العربية', desc: 'المفاعيل الخمسة، الحال، التمييز بأنواعه، الاستثناء، المنادى وأحكامه، وأحكام العدد وتمييزه.', isLocked: false },
    { title: 'الوحدة الخامسة: إعراب وبناء الأفعال', desc: 'بناء الماضي والمضارع والأمر، إعراب المضارع ونصبه وجزمه، واقتران جواب الشرط بالفاء، وتوكيد الفعل بالنون.', isLocked: false },
    { title: 'الوحدة السادسة: الأدوات والحروف', desc: 'أنواع (ما، من، لا، اللام)، حروف الجر الأصلية والزائدة والشبيهة بالزائدة وإعراب ما بعدها.', isLocked: false },
    { title: 'الوحدة السابعة: الممنوع من الصرف ومكملات المنهج', desc: 'الممنوع لعلة ولعلتين وإعرابه، أسلوب الاختصاص، الإغراء والتحذير، والمدح والذم، وأسماء الأفعال.', isLocked: false }
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
                <Target size={18} />
                <span>قواعد النحو العربي - الصف الثالث الثانوي</span>
              </div>
              <h1 className={styles.title}>الوحدات النحوية الـ ٧ للثانوية العامة</h1>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContent} style={{ marginTop: '30px' }}>
        <div className={styles.cardsGrid}>
          {units.map((unit, idx) => (
            <div key={idx} className={styles.courseCard}>
              <div className={styles.cardHeader}>
                <div className={styles.iconBox}>
                  <Target size={28} />
                </div>
                <span className={styles.badge}>الوحدة {idx + 1} ⚖️</span>
              </div>
              <h3 className={styles.cardTitle}>{unit.title}</h3>
              <p className={styles.cardDesc}>{unit.desc}</p>
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
