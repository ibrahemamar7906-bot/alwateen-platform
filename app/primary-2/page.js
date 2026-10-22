'use client'
import Link from 'next/link'
import { BookOpen, Sparkles, PenTool, Book, Music, ArrowRight, ChevronLeft, Lock } from 'lucide-react'
import styles from './page.module.css'

const PRIMARY2_SUBJECTS = [
  {
    title: 'المنهج التفاعلي للغة العربية (الصف الثاني)',
    path: '/kids-corner/pathway?subject=primary2_arabic',
    icon: <BookOpen size={28} />,
    desc: 'مسار الوحدات الكامل وقصص الاستماع والقراءة والنصوص المقررة للصف الثاني الابتدائي.',
    badge: 'المنهج الأساسي 🌟',
    isLocked: false,
  },
  {
    title: 'الأساليب والتراكيب النحوية',
    path: '/kids-corner/pathway?subject=primary2_arabic&unit=2',
    icon: <Sparkles size={28} />,
    desc: 'ضمائر المتكلم والمخاطب والغائب، أسلوب النهي والأمر، وأسماء الإشارة وحروف الجر والعطف.',
    badge: 'أساليب ونحو ✨',
    isLocked: false,
  },
  {
    title: 'النصوص والأناشيد الجميلة',
    path: '/kids-corner/storybook',
    icon: <Music size={28} />,
    desc: 'استماع وشرح وحفظ الأناشيد المقررة وتذوق المفردات والمعاني الجميلة والقصص المصورة.',
    badge: 'أناشيد ونصوص 🎵',
    isLocked: false,
  },
  {
    title: 'القواعد الإملائية والخط العربي',
    path: '/kids-corner/tracing',
    icon: <PenTool size={28} />,
    desc: 'التاء المربوطة والمفتوحة والهاء، التنوين بأنواعه الثلاثة، وتدريبات الإملاء التفاعلي.',
    badge: 'إملاء وخط ✍️',
    isLocked: false,
  },
  {
    title: 'التعبير الكتابي وتكوين القصة',
    path: '/kids-corner/puzzle',
    icon: <Book size={28} />,
    desc: 'ترتيب أحداث القصة، كتابة لافتة مصورة، ووصف صورة بجمل لغوية صحيحة.',
    badge: 'تعبير وقصة 🎨',
    isLocked: false,
  },
  {
    title: 'المعلم الخصوصي الذكي (AI)',
    path: '/student-ai?stage=primary_2',
    icon: <Sparkles size={28} />,
    desc: 'مساعد ذكي لشرح دروس الصف الثاني الابتدائي وأسئلة المعاني والأساليب فوراً.',
    badge: 'المعلم الذكي 🤖⚡',
    isLocked: false,
  }
]

export default function Primary2Index() {
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
              <h1 className={styles.title}>الصف الثاني الابتدائي (عالم اللغة والقصص)</h1>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContent}>
        <div className={styles.cardsGrid}>
          {PRIMARY2_SUBJECTS.map((subject, idx) => {
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
