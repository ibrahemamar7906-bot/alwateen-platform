'use client'
import Link from 'next/link'
import { BookOpen, Target, PenTool, Book, MessageCircle, FileText, ArrowRight, ChevronLeft, Sparkles, Lock, Trophy, Compass, Shield } from 'lucide-react'
import styles from './page.module.css'

const SEC1_SUBJECTS = [
  {
    title: 'النحو العربي الشامل',
    path: '/sec-1/grammar',
    icon: <Target size={28} />,
    desc: 'الأفعال الناقصة والتامة (كان وكاد وأخواتهما)، إعمال المشتقات، الاسم المقصور والمنقوص والممدود، وملحقات المثنى وجمع المذكر والمؤنث.',
    badge: 'النحو ⚖️',
    isLocked: false,
  },
  {
    title: 'البلاغة العربية (علم البيان)',
    path: '/sec-1/rhetoric',
    icon: <Sparkles size={28} />,
    desc: 'التشبيه بأنواعه (المفرد والتمثيلي والضمني)، الاستعارة (المكنية والتصريحية)، الكناية بأنواعها، والمجاز المرسل وعلاقاته.',
    badge: 'علم البيان 📜',
    isLocked: false,
  },
  {
    title: 'تاريخ الأدب العربي',
    path: '/sec-1/literature',
    icon: <FileText size={28} />,
    desc: 'الأدب في العصر الجاهلي (الشعر والنثر والمعلقات)، أدب عصر صدر الإسلام، وأدب العصر الأموي مع ملامح البيئة والعصر.',
    badge: 'تاريخ الأدب 🏛️',
    isLocked: false,
  },
  {
    title: 'القراءة والنصوص المتحررة',
    path: '/sec-1/reading',
    icon: <BookOpen size={28} />,
    desc: 'تطبيقات مكثفة على نصوص وقراءات متحررة مطابقة لنظام التقييم الحديث ومهارات الفهم والاستنتاج ونقد الأفكار.',
    badge: 'نظام حديث 🎯',
    isLocked: false,
  },
  {
    title: 'قصة عنترة بن شداد (أبو الفوارس)',
    path: '/sec-1/story',
    icon: <Shield size={28} />,
    desc: 'شخصية عنترة، الفروسية والحرية، ملخصات الفصول وتحليل الإسقاطات البلاغية والأدبية وبنك الأسئلة.',
    badge: 'القصة المقررة ⚔️',
    isLocked: false,
  },
  {
    title: 'مسار الثانوية الأزهرية',
    path: '/sec-1/grammar?track=azhar',
    icon: <Sparkles size={28} />,
    desc: 'مناهج الصف الأول الثانوي الأزهري: شرح العلوم العربية والشرعية المقررة بالمعاهد الأزهرية (ألفية ابن مالك، البلاغة، التوحيد، الفقه).',
    badge: 'ثانوية أزهرية 🕌',
    isLocked: false,
  }
]

export default function Sec1Index() {
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
                <span>مرحباً بك في</span>
              </div>
              <h1 className={styles.title}>الصف الأول الثانوي (النظام الحديث)</h1>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContent}>
        <div className={styles.cardsGrid}>
          {SEC1_SUBJECTS.map((subject, idx) => {
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
