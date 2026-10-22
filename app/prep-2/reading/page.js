'use client'
import Link from 'next/link'
import { ArrowRight, BookOpen, Lock, LayoutList } from 'lucide-react'
import styles from '../page.module.css'

export default function ReadingIndex() {
  const lessons = [
    { 
      title: 'سيدة المقاومة المصرية (آمنة دهشان)', 
      desc: 'الوحدة الأولى: انتمائي قوتي (نص استماع)', 
      path: '/prep-2/reading-and-texts/lesson-1', 
      status: 'متاح الآن',
      isLocked: false,
    },
    { 
      title: 'العبور إلى المستقبل (حرب أكتوبر)', 
      desc: 'الوحدة الأولى: انتمائي قوتي (درس قراءة)', 
      path: '/prep-2/reading-and-texts/lesson-2', 
      status: 'متاح الآن',
      isLocked: false,
    },
    { 
      title: 'من صقور الوطنية «محمد مبروك»', 
      desc: 'الوحدة الأولى: انتمائي قوتي (درس قراءة)', 
      path: '/prep-2/reading-and-texts/lesson-3', 
      status: 'متاح الآن',
      isLocked: false,
    },
    { 
      title: 'أقدم وديعة في يد المصري (نهر النيل)', 
      desc: 'الوحدة الثانية: بيئتي مسئوليتي (نص استماع)', 
      path: '/prep-2/reading-and-texts/lesson-5', 
      status: 'متاح الآن',
      isLocked: false,
    },
    { 
      title: 'من أجل غد', 
      desc: 'الوحدة الثانية: بيئتي مسئوليتي (درس قراءة)', 
      path: '/prep-2/reading-and-texts/lesson-6', 
      status: 'متاح الآن',
      isLocked: false,
    },
    { 
      title: 'واحة مصرية صديقة للبيئة (مدينة الخارجة)', 
      desc: 'الوحدة الثانية: بيئتي مسئوليتي (درس قراءة)', 
      path: '/prep-2/reading-and-texts/lesson-7', 
      status: 'متاح الآن',
      isLocked: false,
    },
    { 
      title: 'إنسانٌ أم ظلُّ إنسان؟ (لـ د. هانم أحمد)', 
      desc: 'الوحدة الثالثة: علم وقيم (نص استماع)', 
      path: '/prep-2/reading-and-texts/lesson-9', 
      status: 'متاح الآن',
      isLocked: false,
    },
    { 
      title: 'عندما يصبح العلم رسالة (الخوارزمي)', 
      desc: 'الوحدة الثالثة: علم وقيم (درس قراءة)', 
      path: '/prep-2/reading-and-texts/lesson-10', 
      status: 'متاح الآن',
      isLocked: false,
    },
    { 
      title: 'القراءة حياة (أحمد أمين)', 
      desc: 'الوحدة الثالثة: علم وقيم (درس قراءة)', 
      path: '/prep-2/reading-and-texts/lesson-11', 
      status: 'متاح الآن',
      isLocked: false,
    }
  ]

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerTop}>
            <Link href="/prep-2" className={styles.backButton} aria-label="عودة">
              <ArrowRight size={24} />
            </Link>
            <div>
              <div className={styles.subtitle}>
                <BookOpen size={18} />
                <span>فرع القراءة المتعددة ونصوص الاستماع</span>
              </div>
              <h1 className={styles.title}>القراءة والاستماع - 2 إعدادي (المنهج الجديد)</h1>
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
                    {lesson.isLocked ? <Lock size={24} /> : <BookOpen size={24} />}
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

              {!lesson.isLocked && (
                <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                  <Link 
                    href={lesson.path}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#ecfdf5', color: '#059669', padding: '10px', borderRadius: '8px', fontWeight: 'bold', textDecoration: 'none', border: '1px solid #a7f3d0', transition: 'all 0.2s' }}
                  >
                    <BookOpen size={18} />
                    شرح الدرس
                  </Link>
                  <Link 
                    href={`${lesson.path}#quiz`}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#059669', color: 'white', padding: '10px', borderRadius: '8px', fontWeight: 'bold', textDecoration: 'none', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(5,150,105,0.2)' }}
                  >
                    <LayoutList size={18} />
                    تدريبات وأسئلة
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
