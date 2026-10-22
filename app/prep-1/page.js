'use client'
import Link from 'next/link'
import { BookOpen, Target, PenTool, Book, MessageCircle, FileText, ArrowRight, ChevronLeft, Sparkles, Lock, Lightbulb, Puzzle, FileSignature, Presentation, Trophy } from 'lucide-react'
import styles from './page.module.css'

const PREP1_SUBJECTS = [
  {
    title: 'القراءة والنصوص',
    path: '/prep-1/reading-and-texts',
    icon: <BookOpen size={28} />,
    desc: '١٢ درساً تشمل نصوص الاستماع والقراءة والشعر (زويل، منسي، المرأة المصرية، فاروق جويدة، العقاد...).',
    badge: 'المنهج الجديد 🌟',
    isLocked: false,
  },
  {
    title: 'قواعد النحو والإعراب',
    path: '/prep-1/grammar',
    icon: <Target size={28} />,
    desc: 'الفعل اللازم والمتعدي، المجرد والمزيد، الصحيح والمعتل، وظن وأخواتها مع تدريبات مكثفة.',
    badge: 'قواعد النحو ⚖️',
    isLocked: false,
  },
  {
    title: 'قواعد الإملاء والتعبير',
    path: '/prep-1/dictation',
    icon: <FileSignature size={28} />,
    desc: 'كتابة الهمزة على (الألف، الواو، الياء) وكتابة السيرة الذاتية والغيرية.',
    badge: 'إملاء وتعبير ✍️',
    isLocked: false,
  },
  {
    title: 'بنك الاختبارات والأسئلة للفروع',
    path: '/prep-1/quizzes',
    icon: <Sparkles size={28} />,
    desc: 'اختبارات إلكترونية سريعة ومصنفة لجميع فروع المنهج (قراءة، نصوص، نحو، إملاء) بتصحيح فوري.',
    badge: 'اختبارات الفروع 📝',
    isLocked: false,
  },
  {
    title: 'تدريبات وتطبيقات شاملة',
    path: '/prep-1/exercises',
    icon: <Lightbulb size={28} />,
    desc: 'تطبيقات الأضواء المتحررة واختبارات شاملة على جميع الفروع.',
    badge: 'تدريبات مكثفة 📖',
    isLocked: false,
  },
  {
    title: 'ركن الأزهر الشريف والعلوم الشرعية',
    path: '/prep-1/grammar?track=azhar',
    icon: <Sparkles size={28} />,
    desc: 'مقررات قطاع المعاهد الأزهرية: أصول الدين (التوحيد، التفسير، الحديث، السيرة)، الفقه المذهبي، والنحو والصرف الأزهري.',
    badge: 'قطاع الأزهر الشريف 🕌',
    isLocked: false,
  }
]

export default function Prep1Index() {
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
              <h1 className={styles.title}>الصف الأول الإعدادي (المنهج الجديد)</h1>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContent}>
        <div className={styles.cardsGrid}>
          {PREP1_SUBJECTS.map((subject, idx) => {
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
