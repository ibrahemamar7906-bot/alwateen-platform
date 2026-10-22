'use client'
import Link from 'next/link'
import { BookOpen, Sparkles, PenTool, Book, Music, ArrowRight, ChevronLeft, Lock, Trophy, FileSignature } from 'lucide-react'
import styles from './page.module.css'

const PRIMARY5_SUBJECTS = [
  {
    title: 'المنهج الدراسي والنصوص والقراءة',
    path: '/primary-5/reading-and-texts',
    icon: <BookOpen size={28} />,
    desc: 'المحاور التعليمية وقصص الاستماع، النصوص الشعرية، والقراءة المتحررة للصف الخامس الابتدائي.',
    badge: 'المنهج الجديد 🌟',
    isLocked: false,
  },
  {
    title: 'القواعد النحوية والإعراب',
    path: '/primary-5/grammar',
    icon: <Sparkles size={28} />,
    desc: 'علامات إعراب الفاعل والمفعول به (المفرد، المثنى، وجموع المذكر والمؤنث والتكسير)، والمضاف إليه.',
    badge: 'نحو وتطبيق ⚖️',
    isLocked: false,
  },
  {
    title: 'القواعد الإملائية والرسم الكتابي',
    path: '/primary-5/dictation',
    icon: <PenTool size={28} />,
    desc: 'الهمزة المتوسطة والهمزة المتطرفة على السطر والواو والياء، وتطبيقات الإملاء التفاعلي.',
    badge: 'إملاء متقدم ✍️',
    isLocked: false,
  },
  {
    title: 'الكتابة السردية والتعبير',
    path: '/primary-5/expression',
    icon: <FileSignature size={28} />,
    desc: 'كتابة سيرة ذاتية، كتابة استقصاء، كتابة قصة قصيرة، غلاف منتج، ومناقشة فكرة بأسلوب متقن.',
    badge: 'كتابة سردية 📝',
    isLocked: false,
  },
  {
    title: 'بنك الأسئلة والاختبارات الشاملة',
    path: '/primary-5/quizzes',
    icon: <Trophy size={28} />,
    desc: 'تدريبات على جميع الفروع واختبارات شهرية ونهائية بنظام الامتحانات المطورة بتصحيح فوري.',
    badge: 'امتحانات وتقييم 🎯',
    isLocked: false,
  },
  {
    title: 'المعلم الخصوصي الذكي (AI)',
    path: '/student-ai?stage=primary_5',
    icon: <Sparkles size={28} />,
    desc: 'اسأل عن أي إعراب أو شرح درس بالذكاء الاصطناعي وفق منهج 5 ابتدائي المطور.',
    badge: 'المعلم الذكي 🤖⚡',
    isLocked: false,
  }
]

export default function Primary5Index() {
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
              <h1 className={styles.title}>الصف الخامس الابتدائي (المنهج المطور)</h1>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContent}>
        <div className={styles.cardsGrid}>
          {PRIMARY5_SUBJECTS.map((subject, idx) => {
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
