'use client'
import Link from 'next/link'
import { BookOpen, Target, PenTool, Book, MessageCircle, FileText, ArrowRight, ChevronLeft, Sparkles, Lock, Trophy, Shield } from 'lucide-react'
import styles from './page.module.css'

const SEC3_SUBJECTS = [
  {
    title: 'النحو العربي الكامل (الوحدات الـ ٧)',
    path: '/sec-3/grammar',
    icon: <Target size={28} />,
    desc: 'من الوحدة الأولى (النطق والإملاء) وحتى الوحدة السابعة (الممنوع من الصرف والأساليب ومكملات المنهج) مع أسئلة امتحانات الوزارة السابقة.',
    badge: 'الوحدات السبع ⚖️',
    isLocked: false,
  },
  {
    title: 'البلاغة والتجربة الشعرية الشاملة',
    path: '/sec-3/rhetoric',
    icon: <Sparkles size={28} />,
    desc: 'عناصر التجربة الشعرية، الوحدة الفنية (العضوية)، الصور البيانية المركبة والممتدة والمبتكرة، والموسيقى الظاهرة والخفية.',
    badge: 'التجربة الشعرية 📜',
    isLocked: false,
  },
  {
    title: 'مدارس الأدب وفنون النثر العربي',
    path: '/sec-3/literature',
    icon: <FileText size={28} />,
    desc: 'مدارس الشعر الست (الإحياء، الوجداني، الديوان، أبوللو، المهاجر، الواقعية) وفنون النثر (المقال، الرواية، القصة، المسرحية).',
    badge: 'مدارس الأدب 🏛️',
    isLocked: false,
  },
  {
    title: 'القراءة والنصوص المتحررة (البابل شيت)',
    path: '/sec-3/reading',
    icon: <BookOpen size={28} />,
    desc: 'مئات القطع المتحررة بنظام البابل شيت الحديث، تدريب مكثف على استنتاج العلاقات، المعاني الضمنية، ونقد الأفكار.',
    badge: 'نظام حديث 🎯',
    isLocked: false,
  },
  {
    title: 'قصة الأيام (لسيرة د. طه حسين)',
    path: '/sec-3/story',
    icon: <Book size={28} />,
    desc: 'دراسة وتحليل فصول الجزء الأول والثاني مع الموازنات الأدبية الدقيقة وأسئلة الامتحانات الوزارية المقالية.',
    badge: 'القصة المقررة 📚',
    isLocked: false,
  },
  {
    title: 'شهادة الثانوية الأزهرية (علمي وأدبي)',
    path: '/sec-3/grammar?track=azhar',
    icon: <Sparkles size={28} />,
    desc: 'اسأل عن أي إعراب شائك، أو استفسار بلاغي في نصوص الثانوية العامة فوراً بالذكاء الاصطناعي.',
    badge: 'شهادة أزهرية 🕌',
    isLocked: false,
  }
]

export default function Sec3Index() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerTop}>
            <Link href="/student-dashboard" className={styles.backButton} aria-label="العودة">
              <ArrowRight size={24} />
            </Link>
            <div>
              <div className={styles.subtitle}>
                <Sparkles size={18} />
                <span>مرحباً بك في بوابة</span>
              </div>
              <h1 className={styles.title}>الثانوية العامة (الصف الثالث الثانوي)</h1>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContent}>
        <div className={styles.cardsGrid}>
          {SEC3_SUBJECTS.map((subject, idx) => {
            return (
              <Link 
                key={idx} 
                href={subject.path}
                className={`${styles.courseCard} ${subject.isLocked ? styles.lockedCard : ''}`}
                onClick={e => subject.isLocked && e.preventDefault()}
              >
                <div className={styles.cardHeader}>
                  <div className={styles.iconBox}>
                    {subject.icon}
                  </div>
                  <span className={`${styles.badge} ${subject.isLocked ? styles.lockedBadge : ''}`}>
                    {subject.badge}
                  </span>
                </div>
                
                <h3 className={styles.cardTitle}>{subject.title}</h3>
                <p className={styles.cardDesc}>{subject.desc}</p>
                
                {!subject.isLocked ? (
                  <div className={styles.cardFooter}>
                    <span className={styles.footerText}>تصفح الفرع</span>
                    <div className={styles.actionBtn}>
                      <ChevronLeft size={18} />
                    </div>
                  </div>
                ) : (
                  <div className={styles.cardFooter}>
                    <span className={`${styles.footerText} ${styles.lockedFooterText}`}>محتوى مغلق</span>
                    <Lock size={18} className={styles.lockedFooterText} />
                  </div>
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
