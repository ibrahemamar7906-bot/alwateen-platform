'use client'
import Link from 'next/link'
import { ArrowRight, BookOpen, Lock, PenTool, LayoutList } from 'lucide-react'
import styles from '../page.module.css'

export default function Prep1GrammarIndex() {
  const lessons = [
    { 
      title: 'الفعل اللازم والفعل المتعدي', 
      desc: 'التمييز بين الفعل الذي يكتفي بفاعله والفعل الذي يحتاج إلى مفعول به', 
      path: '/prep-1/grammar/lesson-1', 
      status: 'متاح الآن',
      isLocked: false,
    },
    { 
      title: 'الفعل المجرد والفعل المزيد', 
      desc: 'المجرد الثلاثي والرباعي، وأحرف الزيادة في الأفعال', 
      path: '/prep-1/grammar/lesson-2', 
      status: 'متاح الآن',
      isLocked: false,
    },
    { 
      title: 'أنواع الفعل الصحيح', 
      desc: 'الفعل السالم، والمهموز، والمضعف', 
      path: '/prep-1/grammar/lesson-3', 
      status: 'متاح الآن',
      isLocked: false,
    },
    { 
      title: 'أنواع الفعل المعتل', 
      desc: 'الفعل المثال، والأجوف، والناقص', 
      path: '/prep-1/grammar/lesson-4', 
      status: 'متاح الآن',
      isLocked: false,
    },
    { 
      title: 'ظن وأخواتها', 
      desc: 'الأفعال التي تنصب مفعولين أصلهما المبتدأ والخبر', 
      path: '/prep-1/grammar/lesson-5', 
      status: 'متاح الآن',
      isLocked: false,
    }
  ]

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
                <PenTool size={18} />
                <span>فرع النحو</span>
              </div>
              <h1 className={styles.title}>قواعد النحو والإعراب - 1 إعدادي</h1>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContent}>
        {/* Highlight Banner for Grammar Questions Bank */}
        <div
          style={{
            background: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)',
            color: '#ffffff',
            borderRadius: '20px',
            padding: '22px 28px',
            marginBottom: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            boxShadow: '0 10px 25px rgba(5,150,105,0.22)'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '50px', fontSize: '0.82rem', fontWeight: 800 }}>
                تحديث مسار بنك النحو الجديد ⚖️🎯
              </span>
              <span style={{ fontSize: '0.88rem', opacity: 0.95 }}>100 سؤال تثبيت قواعد • 15 قطعة امتحانية</span>
            </div>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '1.35rem', fontWeight: 900 }}>
              أسئلة تثبيت القواعد السريعة والقطع النحوية بتصحيح فوري
            </h3>
            <p style={{ margin: 0, fontSize: '0.92rem', opacity: 0.95, maxWidth: '640px', lineHeight: 1.6 }}>
              كل درس يحتوي الآن على قسمين: أسئلة تثبيت قواعد مركزة ومباشرة، وقطع نحوية امتحانية كاملة مع إعراب واستخراج وتصويب أخطاء مصححة آلياً مع الشرح.
            </p>
          </div>
        </div>

        <div className={styles.listGrid}>
          {lessons.map((lesson, idx) => (
            <div 
              key={idx} 
              className={`${styles.listCard} ${lesson.isLocked ? styles.lockedCard : ''}`}
              style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'stretch' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className={styles.listCardLeft}>
                  <div className={styles.listIconBox}>
                    {lesson.isLocked ? (
                      <Lock size={24} />
                    ) : (
                      <BookOpen size={24} />
                    )}
                  </div>
                  <div className={styles.listCardContent}>
                    <h3 className={styles.listCardTitle}>{lesson.title}</h3>
                    <p className={styles.listCardDesc}>{lesson.desc}</p>
                  </div>
                </div>
                <div className={styles.listCardRight}>
                  <span className={`${styles.badge} ${lesson.isLocked ? styles.lockedBadge : ''}`}>
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
                    href={`${lesson.path}#questions`}
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
