'use client'
import Link from 'next/link'
import { BookOpen, Target, PenTool, Book, MessageCircle, FileText, ArrowRight, ChevronLeft, Sparkles, Lock, Trophy, FileSignature } from 'lucide-react'
import styles from './page.module.css'

const PREP3_SUBJECTS = [
  {
    title: 'القراءة والنصوص الأدبية',
    path: '/prep-3/reading-and-texts',
    icon: <BookOpen size={28} />,
    desc: '١٢ درساً تشمل نصوص الاستماع والقراءة والشعر (بر الوالدين، محمد رشوان، الصداقة، أحمد شوقي، ثمرة القراءة، تاج الفضائل، بناء المستقبل، اصنع بيدك مجدك...).',
    badge: 'المنهج الجديد 🌟',
    isLocked: false,
  },
  {
    title: 'قواعد النحو والإعراب (المشتقات)',
    path: '/prep-3/grammar',
    icon: <Target size={28} />,
    desc: 'دراسة المشتقات وصياغتها وإعمالها: اسم الفاعل، صيغ المبالغة، اسم المفعول، اسما الزمان والمكان، واسم الآلة مع تدريبات مكثفة.',
    badge: 'قواعد النحو ⚖️',
    isLocked: false,
  },
  {
    title: 'قواعد الإملاء والتعبير الكتابي',
    path: '/prep-3/dictation',
    icon: <FileSignature size={28} />,
    desc: 'رسم الهمزات (الوصل والقطع، المتوسطة، المتطرفة) وفن كتابة التقرير الصحفي والتعبير الإبداعي.',
    badge: 'إملاء وتعبير ✍️',
    isLocked: false,
  },
  {
    title: 'بنك الاختبارات والامتحانات الشاملة',
    path: '/prep-3/exams',
    icon: <Trophy size={28} />,
    desc: 'اختبارات إلكترونية شاملة وتطبيقات تفاعلية على نمط امتحانات الشهادة الإعدادية بتصحيح فوري.',
    badge: 'اختبارات الفروع 📝',
    isLocked: false,
  },
  {
    title: 'الشهادة الإعدادية الأزهرية',
    path: '/prep-3/grammar?track=azhar',
    icon: <Sparkles size={28} />,
    desc: 'اسأل عن أي إعراب للمشتقات أو تحليل بلاغي أو شرح درس فوراً بالذكاء الاصطناعي وفق منهج 3 إعدادي.',
    badge: 'إعدادية أزهرية 🕌',
    isLocked: false,
  }
]

export default function Prep3Index() {
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
              <h1 className={styles.title}>الصف الثالث الإعدادي (الشهادة الإعدادية)</h1>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContent}>
        <div className={styles.cardsGrid}>
          {PREP3_SUBJECTS.map((subject, idx) => {
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
