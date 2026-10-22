'use client'
import Link from 'next/link'
import { BookOpen, Sparkles, PenTool, Book, Music, ArrowRight, ChevronLeft, Lock, Trophy, FileSignature } from 'lucide-react'
import styles from './page.module.css'

const PRIMARY4_SUBJECTS = [
  {
    title: 'المنهج الدراسي والنصوص والقراءة',
    path: '/primary-4/reading-and-texts',
    icon: <BookOpen size={28} />,
    desc: 'المحاور التعليمية الجديدة، نصوص الاستماع، القراءة المتحررة، والنصوص الشعرية المقررة.',
    badge: 'المنهج الجديد 🌟',
    isLocked: false,
  },
  {
    title: 'القواعد النحوية (النحو العربي)',
    path: '/primary-4/grammar',
    icon: <Sparkles size={28} />,
    desc: 'أقسام الكلام، الجملة الاسمية وركناها (المبتدأ والخبر)، الفاعل، الضمائر، وحروف الجر.',
    badge: 'نحو وإعراب ⚖️',
    isLocked: false,
  },
  {
    title: 'القواعد الإملائية والرسم الصحيح',
    path: '/primary-4/dictation',
    icon: <PenTool size={28} />,
    desc: 'همزة القطع وألف الوصل، علامات الترقيم، وتصويب الأخطاء الإملائية الشائعة.',
    badge: 'إملاء وتطبيق ✍️',
    isLocked: false,
  },
  {
    title: 'الكتابة السردية (التعبير الكتابي)',
    path: '/primary-4/expression',
    icon: <FileSignature size={28} />,
    desc: 'كتابة وصف حدث، نص وصفي، سيرة غيرية، نص إقناعي، قصة قصيرة، ورسالة.',
    badge: 'كتابة سردية 📝',
    isLocked: false,
  },
  {
    title: 'بنك الأسئلة والاختبارات الشهرية',
    path: '/primary-4/quizzes',
    icon: <Trophy size={28} />,
    desc: 'نماذج امتحانات شهرية واختبارات شاملة على النظام الحديث بنظام التقييم المستمر.',
    badge: 'امتحانات وتقييم 🎯',
    isLocked: false,
  },
  {
    title: 'المعلم الخصوصي الذكي (AI)',
    path: '/student-ai?stage=primary_4',
    icon: <Sparkles size={28} />,
    desc: 'اسأل عن أي إعراب أو شرح درس بالذكاء الاصطناعي وفق منهج 4 ابتدائي المطور.',
    badge: 'المعلم الذكي 🤖⚡',
    isLocked: false,
  }
]

export default function Primary4Index() {
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
              <h1 className={styles.title}>الصف الرابع الابتدائي (المنهج المطور)</h1>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContent}>
        <div className={styles.cardsGrid}>
          {PRIMARY4_SUBJECTS.map((subject, idx) => {
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
