'use client'
import Link from 'next/link'
import { BookOpen, Target, PenTool, Book, MessageCircle, FileText, ArrowRight, ChevronLeft, Sparkles, Lock, Shield, Puzzle, FileSignature, Lightbulb } from 'lucide-react'
import styles from './page.module.css'

const PREP2_SUBJECTS = [
  {
    title: 'القراءة والنصوص',
    path: '/prep-2/reading-and-texts',
    icon: <BookOpen size={28} />,
    desc: '١٢ درساً تشمل نصوص الاستماع والقراءة والشعر (آمنة دهشان، حرب أكتوبر، محمد مبروك، أحمد رامي، نهر النيل، الخارجة، محمود غنيم، الخوارزمي، الشافعي...).',
    badge: 'المنهج الجديد 🌟',
    isLocked: false
  },
  {
    title: 'قواعد النحو والإعراب',
    path: '/prep-2/grammar',
    icon: <Target size={28} />,
    desc: 'المعرب والمبني من الأسماء والأفعال، الضمائر البارزة والمستترة، أسلوب الشرط، وبنك أسئلة القواعد والقطع الامتحانية.',
    badge: 'قواعد النحو ⚖️',
    isLocked: false
  },
  {
    title: 'اللمحات البلاغية والأدبية',
    path: '/prep-2/rhetoric',
    icon: <Sparkles size={28} />,
    desc: 'دلالات الكلمات، المعنى المباشر والضمني، أدوات الربط، التجانس اللفظي، وأنواع النصوص بتدريبات تفاعلية.',
    badge: 'بلاغة وأدب ✨',
    isLocked: false
  },
  {
    title: 'قواعد الإملاء والتعبير الكتابي',
    path: '/prep-2/dictation',
    icon: <PenTool size={28} />,
    desc: 'الألف اللينة في الأسماء والأفعال والحروف، التاء المربوطة والمفتوحة والهاء، ومقال الوصف والخطبة الإقناعية.',
    badge: 'إملاء وتعبير ✍️',
    isLocked: false
  },
  {
    title: 'ألعاب نحوية تفاعلية',
    path: '/grammar-games',
    icon: <Puzzle size={28} />,
    desc: 'تدرب على النحو والإعراب وتحدَّ نفسك بطريقة ممتعة ومحفزة.',
    badge: 'لعبة تفاعلية 🎮',
    isLocked: false
  },
  {
    title: 'ركن الأزهر الشريف والعلوم الشرعية',
    path: '/prep-2/grammar?track=azhar',
    icon: <Sparkles size={28} />,
    desc: 'مقررات الصف الثاني الإعدادي الأزهري: أصول الدين، الفقه المذهبي، والمطالعة والنصوص وفنون اللغة العربية الأزهرية.',
    badge: 'قطاع الأزهر الشريف 🕌',
    isLocked: false
  }
]

export default function Prep2Index() {
  return (
    <div className={styles.container}>
      {/* Header */}
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
              <h1 className={styles.title}>الصف الثاني الإعدادي (المنهج الجديد)</h1>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContent}>
        <div className={styles.cardsGrid}>
          {PREP2_SUBJECTS.map((subject, idx) => {
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
                    <span className={styles.footerText}>تصفح المحتوى</span>
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
