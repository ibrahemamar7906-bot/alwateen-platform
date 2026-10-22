'use client'
import Link from 'next/link'
import { BookOpen, Sparkles, PenTool, Book, Music, ArrowRight, ChevronLeft, Lock, Trophy, FileSignature } from 'lucide-react'
import styles from './page.module.css'

const PRIMARY3_SUBJECTS = [
  {
    title: 'المنهج الدراسي وقصص الاستماع',
    path: '/primary-3/reading-and-texts',
    icon: <BookOpen size={28} />,
    desc: 'موضوعات القراءة ونصوص الاستماع وقصص القارئ الصغير والمفردات والمعاني المقررة للصف الثالث.',
    badge: 'المنهج الدراسي 🌟',
    isLocked: false,
  },
  {
    title: 'الأساليب والتراكيب والقواعد النحوية',
    path: '/primary-3/grammar',
    icon: <Sparkles size={28} />,
    desc: 'الجملة الاسمية والفعلية، الفعل الماضي والمضارع والأمر، وظرفي الزمان والمكان.',
    badge: 'قواعد وأساليب ⚖️',
    isLocked: false,
  },
  {
    title: 'القواعد الإملائية والرسم الكتابي',
    path: '/primary-3/dictation',
    icon: <PenTool size={28} />,
    desc: 'الألف اللينة، همزة الوصل والقطع، الكلمات التي بها حروف تنطق ولا تكتب، وعلامات الترقيم.',
    badge: 'إملاء وترقيم ✍️',
    isLocked: false,
  },
  {
    title: 'التعبير الكتابي (الكتابة السردية)',
    path: '/primary-3/expression',
    icon: <FileSignature size={28} />,
    desc: 'كتابة فقرة معلوماتية، لافتة مصورة، مطوية توعوية، وقصة مصورة متكاملة العناصر.',
    badge: 'كتابة سردية 📝',
    isLocked: false,
  },
  {
    title: 'بنك الأسئلة والاختبارات التفاعلية',
    path: '/primary-3/quizzes',
    icon: <Trophy size={28} />,
    desc: 'تدريبات شاملة وتقييمات أسبوعية تفاعلية على كل دروس ووحدات الصف الثالث الابتدائي.',
    badge: 'اختبارات وتقييم 🎯',
    isLocked: false,
  },
  {
    title: 'المعلم الخصوصي الذكي (AI)',
    path: '/student-ai?stage=primary_3',
    icon: <Sparkles size={28} />,
    desc: 'اسأل عن أي معنى كلمة أو إعراب أو شرح درس بالذكاء الاصطناعي وفق منهج 3 ابتدائي.',
    badge: 'المعلم الذكي 🤖⚡',
    isLocked: false,
  }
]

export default function Primary3Index() {
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
              <h1 className={styles.title}>الصف الثالث الابتدائي (إتقان القراءة والنحو)</h1>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContent}>
        <div className={styles.cardsGrid}>
          {PRIMARY3_SUBJECTS.map((subject, idx) => {
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
