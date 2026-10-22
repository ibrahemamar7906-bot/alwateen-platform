'use client'
import Link from 'next/link'
import { BookOpen, Sparkles, PenTool, Book, Music, ArrowRight, ChevronLeft, Lock, Trophy, FileSignature } from 'lucide-react'
import styles from './page.module.css'

const PRIMARY6_SUBJECTS = [
  {
    title: 'المنهج الدراسي والقراءة والنصوص',
    path: '/primary-6/reading-and-texts',
    icon: <BookOpen size={28} />,
    desc: 'المحاور التعليمية وقصص الاستماع، النصوص الشعرية، والقراءة المتعمقة والمتحررة للصف السادس.',
    badge: 'الشهادة الابتدائية 🌟',
    isLocked: false,
  },
  {
    title: 'القواعد النحوية المتقدمة',
    path: '/primary-6/grammar',
    icon: <Sparkles size={28} />,
    desc: 'كان وأخواتها، إن وأخواتها، الأسماء الخمسة، الأفعال الخمسة، والضمائر البارزة والمستترة، والنعت.',
    badge: 'نحو وإعراب شامل ⚖️',
    isLocked: false,
  },
  {
    title: 'القواعد الإملائية الدقيقة',
    path: '/primary-6/dictation',
    icon: <PenTool size={28} />,
    desc: 'قواعد كتابة الهمزات في مختلف المواضع، الألف اللينة المتطرفة، وقواعد ترقيم النصوص.',
    badge: 'إملاء متقن ✍️',
    isLocked: false,
  },
  {
    title: 'الكتابة السردية والتعبير الإبداعي',
    path: '/primary-6/expression',
    icon: <FileSignature size={28} />,
    desc: 'كتابة مذكرات يومية، خطبة، رسالة للرد على القراء، قصة خيالية، ومقال رأي.',
    badge: 'فنون التعبير 📝',
    isLocked: false,
  },
  {
    title: 'امتحانات المحافظات والتقييمات الشاملة',
    path: '/primary-6/quizzes',
    icon: <Trophy size={28} />,
    desc: 'نماذج امتحانات المحافظات للسنوات السابقة وتدريبات شاملة على نمط الامتحانات النهائية.',
    badge: 'امتحانات المحافظات 🏆',
    isLocked: false,
  },
  {
    title: 'المسار الأزهري والشهادة الابتدائية الأزهرية',
    path: '/primary-6/grammar?track=azhar',
    icon: <Sparkles size={28} />,
    desc: 'مقررات الشهادة الابتدائية الأزهرية: حفظ القرآن وتجويده، التربية الإسلامية الموسعة، والنحو الأزهري الميسر.',
    badge: 'الابتدائية الأزهرية 🕌',
    isLocked: false,
  }
]

export default function Primary6Index() {
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
              <h1 className={styles.title}>الصف السادس الابتدائي (الشهادة الابتدائية)</h1>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContent}>
        <div className={styles.cardsGrid}>
          {PRIMARY6_SUBJECTS.map((subject, idx) => {
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
                
                <div className={styles.cardFooter}>
                  <span className={styles.footerText}>تصفح المحتوى</span>
                  <div className={styles.actionBtn}>
                    <ChevronLeft size={18} />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
