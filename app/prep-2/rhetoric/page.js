'use client'
import Link from 'next/link'
import { ArrowRight, Sparkles, BookOpen, LayoutList } from 'lucide-react'
import styles from '../page.module.css'

export default function RhetoricIndex() {
  const lessons = [
    { 
      title: 'الدرس الأول: دلالات الكلمات والجو العام', 
      desc: 'المعاني المباشرة والضمنية ودلالات الألفاظ والعاطفة المسيطرة', 
      path: '/prep-2/rhetoric/lesson-1', 
      status: 'متاح الآن',
      isLocked: false,
    },
    { 
      title: 'الدرس الثاني: المعنى المباشر والمعنى الضمني', 
      desc: 'فهم الإيحاءات والتعبيرات غير المباشرة واستخراج الفكرة الضمنية', 
      path: '/prep-2/rhetoric/lesson-2', 
      status: 'متاح الآن',
      isLocked: false,
    },
    { 
      title: 'الدرس الثالث: بعض أدوات الربط', 
      desc: 'أدوات الربط اللفظية والدلالية ودورها في تماسك النص', 
      path: '/prep-2/rhetoric/lesson-3', 
      status: 'متاح الآن',
      isLocked: false,
    },
    { 
      title: 'الدرس الرابع: التجانس اللفظي', 
      desc: 'الجرس الموسيقي والتشابه اللفظي بين الكلمات وأثره البلاغي', 
      path: '/prep-2/rhetoric/lesson-4', 
      status: 'متاح الآن',
      isLocked: false,
    },
    { 
      title: 'الدرس الخامس: أنواع النصوص', 
      desc: 'النصوص المعلوماتية والأدبية والإقناعية وخصائص كل نوع', 
      path: '/prep-2/rhetoric/lesson-5', 
      status: 'متاح الآن',
      isLocked: false,
    }
  ]

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerTop}>
            <Link href="/prep-2" className={styles.backButton} aria-label="العودة">
              <ArrowRight size={24} />
            </Link>
            <div>
              <div className={styles.subtitle}>
                <Sparkles size={18} />
                <span>فرع اللمحات البلاغية والأدبية</span>
              </div>
              <h1 className={styles.title}>اللمحات البلاغية والأدبية (المنهج الجديد)</h1>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContent}>
        <div className={styles.listGrid}>
          {lessons.map((lesson, idx) => (
            <div 
              key={idx} 
              className={styles.listCard}
              style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'stretch' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className={styles.listCardLeft}>
                  <div className={styles.listIconBox}>
                    <Sparkles size={24} />
                  </div>
                  <div className={styles.listCardContent}>
                    <h3 className={styles.listCardTitle}>{lesson.title}</h3>
                    <p className={styles.listCardDesc}>{lesson.desc}</p>
                  </div>
                </div>
                
                <div className={styles.listCardRight}>
                  <span className={styles.badge}>
                    {lesson.status}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '5px', flexWrap: 'wrap' }}>
                <Link 
                  href={lesson.path}
                  style={{ flex: 1, minWidth: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#ecfdf5', color: '#059669', padding: '10px', borderRadius: '8px', fontWeight: 'bold', textDecoration: 'none', border: '1px solid #a7f3d0', transition: 'all 0.2s' }}
                >
                  <BookOpen size={18} />
                  شرح الدرس
                </Link>
                <Link 
                  href={`${lesson.path}#questions`}
                  style={{ flex: 1, minWidth: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#059669', color: 'white', padding: '10px', borderRadius: '8px', fontWeight: 'bold', textDecoration: 'none', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(5,150,105,0.2)' }}
                >
                  <LayoutList size={18} />
                  تدريبات وأسئلة
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
