'use client'
import Link from 'next/link'
import { BookOpen, Sparkles, PenTool, Volume2, Train, ArrowRight, ChevronLeft, Lock } from 'lucide-react'
import styles from './page.module.css'

const PRIMARY1_SUBJECTS = [
  {
    title: 'المنهج التفاعلي للغة العربية (الصف الأول)',
    path: '/kids-corner/pathway?subject=primary1_arabic',
    icon: <BookOpen size={28} />,
    desc: 'مسار الوحدات الكامل (أسرتي، حيواناتي، جسمي، مدرستي) مع قصص الاستماع والأنشطة والصوتيات التفاعلية.',
    badge: 'المنهج الأساسي 🌟',
    isLocked: false,
  },
  {
    title: 'الأساليب والتراكيب والظواهر اللغوية',
    path: '/kids-corner/blending-rocks',
    icon: <Sparkles size={28} />,
    desc: 'الحركات القصيرة والطويلة (المدود)، اللام الشمسية والقمرية، والتنوين بطريقة تفاعلية بصرية.',
    badge: 'أساليب وتراكيب ✨',
    isLocked: false,
  },
  {
    title: 'البطاقات الناطقة وصوتيات الحروف',
    path: '/kids-corner/flashcards',
    icon: <Volume2 size={28} />,
    desc: 'تعلم نطق الحروف بأصواتها وحركاتها المختلفة مع أمثلة حية بالصوت والصورة.',
    badge: 'صوتيات وفونكس 🔊',
    isLocked: false,
  },
  {
    title: 'قطار الكلمات ودمج الحروف',
    path: '/kids-corner/train',
    icon: <Train size={28} />,
    desc: 'اسحب الحروف وركبها على عربات القطار لتكوين الكلمات والجمل في لعبة تعليمية ذكية وممتعة.',
    badge: 'لعبة ذكية 🚂',
    isLocked: false,
  },
  {
    title: 'الإملاء والخط والسبورة السحرية',
    path: '/kids-corner/tracing',
    icon: <PenTool size={28} />,
    desc: 'تدرب على كتابة الحروف والكلمات بالاتجاه الصحيح وخط النسخ الجميل على السبورة التفاعلية.',
    badge: 'كتابة وخط ✍️',
    isLocked: false,
  },
  {
    title: 'المسار الأزهري وحفظ القرآن الكريم',
    path: '/kids-corner/quran-words',
    icon: <Sparkles size={28} />,
    desc: 'مقررات المعاهد الأزهرية الابتدائية، تحفيظ القرآن الكريم وقصار السور، وتأسيس نور البيان والقيم الإسلامية.',
    badge: 'الابتدائي الأزهري 🕌',
    isLocked: false,
  }
]

export default function Primary1Index() {
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
              <h1 className={styles.title}>الصف الأول الابتدائي (عالم الحروف والألعاب)</h1>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContent}>
        <div className={styles.cardsGrid}>
          {PRIMARY1_SUBJECTS.map((subject, idx) => {
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
                  <span className={styles.footerText}>ابدأ التعلم الآن</span>
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
