'use client'
import Link from 'next/link'
import { BookOpen, Target, PenTool, Book, MessageCircle, FileText, ArrowRight, ChevronLeft, Sparkles, Lock } from 'lucide-react'
import styles from './page.module.css'

const SEC2_SUBJECTS = [
  {
    title: 'القراءة الحرة',
    path: '/sec-2/reading',
    icon: <BookOpen size={28} />,
    desc: 'تنمية المهارات اللغوية من خلال نصوص متنوعة (أسئلة فهم واستيعاب وتفكير ناقد).',
    badge: 'محتوى متجدد',
  },
  {
    title: 'القراءة المتحررة',
    path: '/sec-2/unseen-reading',
    icon: <Target size={28} />,
    desc: 'تدريبات مكثفة على نصوص متحررة مطابقة لأحدث مواصفات الثانوية العامة.',
    badge: 'أسئلة النظام الجديد',
  },
  {
    title: 'النحو 2 بكالوريا',
    path: '/sec-2/grammar',
    icon: <PenTool size={28} />,
    desc: 'مسار تأسيس النحو: الأسماء الخمسة، الممنوع من الصرف، والنعت.',
    badge: 'متاح الآن',
    isLocked: false
  },
  {
    title: 'البلاغة',
    path: '#',
    icon: <MessageCircle size={28} />,
    desc: 'علم البيان والبديع والمعاني (تدريبات متحررة شاملة) مع إجابات نموذجية.',
    badge: 'قريباً',
    isLocked: true
  },
  {
    title: 'فرع النصوص المتحررة',
    path: '#',
    icon: <Book size={28} />,
    desc: 'نصوص شعرية ونثرية متحررة تواكب مخرجات التعلم.',
    badge: 'قريباً',
    isLocked: true
  },
  {
    title: 'الأدب العربي',
    path: '#',
    icon: <FileText size={28} />,
    desc: 'دراسة العصور الأدبية وخصائصها الفنية مع تدريبات استنتاجية.',
    badge: 'قريباً',
    isLocked: true
  },
  {
    title: 'مسار الثانوية الأزهرية (علمي وأدبي)',
    path: '/sec-2/grammar?track=azhar',
    icon: <Sparkles size={28} />,
    desc: 'اسأل عن أي إعراب أو بلاغة أو نصوص متحررة بالذكاء الاصطناعي.',
    badge: 'ثانوية أزهرية 🕌',
    isLocked: false
  }
]

export default function Sec2Index() {
  return (
    <div className={styles.container}>
      {/* Premium Header */}
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
              <h1 className={styles.title}>الصف الثاني الثانوي</h1>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContent}>
        <div className={styles.cardsGrid}>
          {SEC2_SUBJECTS.map((subject, idx) => {
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
