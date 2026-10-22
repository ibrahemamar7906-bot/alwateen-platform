'use client'
import Link from 'next/link'
import { ArrowRight, ChevronLeft, Lightbulb, Target, Sparkles, Trophy, Gamepad2, Compass } from 'lucide-react'
import styles from '../page.module.css'

const EXERCISE_MODULES = [
  {
    title: 'بنك الأسئلة والاختبارات الإلكترونية',
    path: '/prep-1/quizzes',
    icon: <Trophy size={28} />,
    desc: 'اختبارات إلكترونية بتصحيح تلقائي فوري وشرح تفصيلي لجميع دروس القراءة والنصوص والنحو والإملاء.',
    badge: 'مسار الاختبارات 🏆',
    actionText: 'دخول مسار الأسئلة'
  },
  {
    title: 'استنتاج المعاني والقرائية الذكية',
    path: '/prep-1/inference-training',
    icon: <Compass size={28} />,
    desc: 'تدريبات تفاعلية متقدمة على فك شفرات النصوص واستنتاج معاني الكلمات من السياق القرائي.',
    badge: 'القرائية الذكية 💡',
    actionText: 'ابدأ تدريب القرائية'
  },
  {
    title: 'صائد الإعراب والتطبيقات النحوية',
    path: '/prep-1/grammar-training',
    icon: <Target size={28} />,
    desc: 'خريطة تدريبية متكاملة لضبط الإعراب وتحديد الموقع الإعرابي للكلمات بدقة مع الشرح الفوري.',
    badge: 'بنك النحو الشامل ⚖️',
    actionText: 'دخول صائد الإعراب'
  },
  {
    title: 'تحديات النحو السريعة (ألعاب تفاعلية)',
    path: '/grammar-games',
    icon: <Gamepad2 size={28} />,
    desc: 'ألعاب سريعة وتحديات نحوية تنافسية لجمع النقاط واختبار سرعتك في تمييز الإعراب الصحيح.',
    badge: 'لعبة تفاعلية 🎮',
    actionText: 'ابدأ التحدي'
  }
]

export default function Prep1ExercisesIndex() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerTop}>
            <Link href="/prep-1" className={styles.backButton} aria-label="العودة">
              <ArrowRight size={24} />
            </Link>
            <div>
              <div className={styles.subtitle}>
                <Sparkles size={18} />
                <span>الصف الأول الإعدادي</span>
              </div>
              <h1 className={styles.title}>التدريبات والتطبيقات الشاملة 🎯</h1>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContent}>
        <div className={styles.cardsGrid}>
          {EXERCISE_MODULES.map((item, idx) => (
            <Link 
              key={idx} 
              href={item.path}
              className={styles.courseCard}
            >
              <div className={styles.cardHeader}>
                <div className={styles.iconBox}>
                  {item.icon}
                </div>
                <span className={styles.badge}>
                  {item.badge}
                </span>
              </div>
              
              <h3 className={styles.cardTitle}>{item.title}</h3>
              <p className={styles.cardDesc}>{item.desc}</p>
              
              <div className={styles.cardFooter}>
                <span className={styles.footerText}>{item.actionText}</span>
                <div className={styles.actionBtn}>
                  <ChevronLeft size={18} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
