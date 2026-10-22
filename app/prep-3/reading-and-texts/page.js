'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, BookOpen, Lock, FileText, LayoutList, Headphones, Sparkles } from 'lucide-react'
import styles from '../page.module.css'

export default function Prep3ReadingAndTextsIndex() {
  const [selectedUnit, setSelectedUnit] = useState('all')

  const lessons = [
    // ════════════════════════════════════════════════════════════
    // الوحدة الأولى: قضايا أسرية ومجتمعية
    // ════════════════════════════════════════════════════════════
    { 
      id: 1,
      unitId: 'unit1',
      unitName: 'الوحدة الأولى: قضايا أسرية ومجتمعية',
      title: 'عناصر تحليل وتذوق النصوص', 
      desc: 'دليل منهجي شامل: نوع النص، بنيته، الفكرة الرئيسة والفرعية، والفرق بين الفكرة المباشرة والضمنية', 
      path: '/prep-3/reading-and-texts/lesson-1', 
      status: 'متاح الآن',
      isLocked: false,
      type: 'تحليل نصوص',
      icon: BookOpen
    },
    { 
      id: 2,
      unitId: 'unit1',
      unitName: 'الوحدة الأولى: قضايا أسرية ومجتمعية',
      title: 'عناصر التذوق البلاغي', 
      desc: 'التعبير الحقيقي والمجازي، التشبيه وأركانه، العلاقات بين الكلمات والجمل، والأساليب الخبرية والإنشائية', 
      path: '/prep-3/reading-and-texts/lesson-2', 
      status: 'متاح الآن',
      isLocked: false,
      type: 'تذوق بلاغي',
      icon: Sparkles
    },
    { 
      id: 3,
      unitId: 'unit1',
      unitName: 'الوحدة الأولى: قضايا أسرية ومجتمعية',
      title: 'آداب التعامل مع الوالدين والإنصات لهما', 
      desc: 'نص استماع: حسن الاستماع، تفهم عاطفة الآباء، وبناء بيئة أسرية يسودها التفاهم والسكينة', 
      path: '/prep-3/reading-and-texts/lesson-3', 
      status: 'متاح الآن',
      isLocked: false,
      type: 'نص استماع',
      icon: Headphones
    },
    { 
      id: 4,
      unitId: 'unit1',
      unitName: 'الوحدة الأولى: قضايا أسرية ومجتمعية',
      title: 'أغلى من الذهب (البطل محمد رشوان)', 
      desc: 'درس قراءة: الروح الرياضية، الأخلاق النبيلة في أولمبياد لوس أنجلوس، وقيمة الفوز بشرف', 
      path: '/prep-3/reading-and-texts/lesson-4', 
      status: 'متاح الآن',
      isLocked: false,
      type: 'درس قراءة',
      icon: FileText
    },
    { 
      id: 5,
      unitId: 'unit1',
      unitName: 'الوحدة الأولى: قضايا أسرية ومجتمعية',
      title: 'الصداقة واختيار الأصدقاء (د. شوقي ضيف)', 
      desc: 'درس قراءة: معايير الصداقة الحقيقية، أثر الصديق الصالح في الحياة، ومحاذير رفقاء السوء', 
      path: '/prep-3/reading-and-texts/lesson-5', 
      status: 'متاح الآن',
      isLocked: false,
      type: 'درس قراءة',
      icon: FileText
    },
    { 
      id: 6,
      unitId: 'unit1',
      unitName: 'الوحدة الأولى: قضايا أسرية ومجتمعية',
      title: 'نص تحية للشباب (شعر - أحمد شوقي)', 
      desc: 'نص شعري: دور الشباب في نهضة الأمة، عزة النفس، وبناء المستقبل بالعزيمة والإقدام', 
      path: '/prep-3/reading-and-texts/lesson-6', 
      status: 'متاح الآن',
      isLocked: false,
      type: 'نص شعري',
      icon: Sparkles
    },

    // ════════════════════════════════════════════════════════════
    // الوحدة الثانية: العلم والعمل وبناء الشخصية
    // ════════════════════════════════════════════════════════════
    { 
      id: 7,
      unitId: 'unit2',
      unitName: 'الوحدة الثانية: العلم والعمل وبناء الشخصية',
      title: 'ثمرة القراءة وأثرها في العقل', 
      desc: 'نص استماع: كيف تبني القراءة الواعية عقلية ناضجة قادرة على النقد والابتكار وحل المشكلات', 
      path: '/prep-3/reading-and-texts/lesson-7', 
      status: 'متاح الآن',
      isLocked: false,
      type: 'نص استماع',
      icon: Headphones
    },
    { 
      id: 8,
      unitId: 'unit2',
      unitName: 'الوحدة الثانية: العلم والعمل وبناء الشخصية',
      title: 'أفضل النعم (نعمة العقل والتفكير)', 
      desc: 'درس قراءة: إعمال العقل واستثمار الفكر للتطور وصناعة الفارق في المجتمع والوطن', 
      path: '/prep-3/reading-and-texts/lesson-8', 
      status: 'متاح الآن',
      isLocked: false,
      type: 'درس قراءة',
      icon: FileText
    },
    { 
      id: 9,
      unitId: 'unit2',
      unitName: 'الوحدة الثانية: العلم والعمل وبناء الشخصية',
      title: 'خير جليس في الزمان كتاب', 
      desc: 'درس قراءة: قيمة الكتاب صديقاً وفياً لا يملك فيك عيباً ولا يخدعك أبداً', 
      path: '/prep-3/reading-and-texts/lesson-9', 
      status: 'متاح الآن',
      isLocked: false,
      type: 'درس قراءة',
      icon: FileText
    },
    { 
      id: 10,
      unitId: 'unit2',
      unitName: 'الوحدة الثانية: العلم والعمل وبناء الشخصية',
      title: 'نص تاج الفضائل (شعر)', 
      desc: 'نص شعري: منظومة الأخلاق الفاضلة، الحياء، الصدق، والمروءة تيجان تزين صاحبها', 
      path: '/prep-3/reading-and-texts/lesson-10', 
      status: 'متاح الآن',
      isLocked: false,
      type: 'نص شعري',
      icon: Sparkles
    },

    // ════════════════════════════════════════════════════════════
    // الوحدة الثالثة: مصر وبناء المستقبل
    // ════════════════════════════════════════════════════════════
    { 
      id: 11,
      unitId: 'unit3',
      unitName: 'الوحدة الثالثة: مصر وبناء المستقبل',
      title: 'بناء المستقبل وحرفتك بين يديك', 
      desc: 'نص استماع وقراءة: قيمة العمل المهني والتقني، وريادة الأعمال في بناء اقتصاد قوي', 
      path: '/prep-3/reading-and-texts/lesson-11', 
      status: 'متاح الآن',
      isLocked: false,
      type: 'نص استماع وقراءة',
      icon: Headphones
    },
    { 
      id: 12,
      unitId: 'unit3',
      unitName: 'الوحدة الثالثة: مصر وبناء المستقبل',
      title: 'مستقبل مصر الزراعي ونص اصنع بيدك مجدك', 
      desc: 'درس قراءة وشعر: المشروعات الزراعية القومية والدعوة الصادقة للجد والاجتهاد لبناء مجد الوطن', 
      path: '/prep-3/reading-and-texts/lesson-12', 
      status: 'متاح الآن',
      isLocked: false,
      type: 'قراءة ونصوص',
      icon: Sparkles
    }
  ]

  const filteredLessons = selectedUnit === 'all' 
    ? lessons 
    : lessons.filter(l => l.unitId === selectedUnit)

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerTop}>
            <Link href="/prep-3" className={styles.backButton} aria-label="العودة">
              <ArrowRight size={24} />
            </Link>
            <div>
              <div className={styles.subtitle}>
                <BookOpen size={18} />
                <span>فرع القراءة والنصوص الأدبية</span>
              </div>
              <h1 className={styles.title}>منهج الصف الثالث الإعدادي (١٢ درساً)</h1>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContent}>
        {/* Unit Filters */}
        <div style={{ display: 'flex', gap: '10px', margin: '30px 0 20px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setSelectedUnit('all')}
            style={{
              padding: '10px 20px',
              borderRadius: '12px',
              border: 'none',
              background: selectedUnit === 'all' ? '#059669' : 'white',
              color: selectedUnit === 'all' ? 'white' : '#475569',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              transition: 'all 0.2s'
            }}
          >
            جميع الوحدات (١٢)
          </button>
          <button 
            onClick={() => setSelectedUnit('unit1')}
            style={{
              padding: '10px 20px',
              borderRadius: '12px',
              border: 'none',
              background: selectedUnit === 'unit1' ? '#059669' : 'white',
              color: selectedUnit === 'unit1' ? 'white' : '#475569',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              transition: 'all 0.2s'
            }}
          >
            الوحدة الأولى: قضايا أسرية
          </button>
          <button 
            onClick={() => setSelectedUnit('unit2')}
            style={{
              padding: '10px 20px',
              borderRadius: '12px',
              border: 'none',
              background: selectedUnit === 'unit2' ? '#059669' : 'white',
              color: selectedUnit === 'unit2' ? 'white' : '#475569',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              transition: 'all 0.2s'
            }}
          >
            الوحدة الثانية: العلم والعمل
          </button>
          <button 
            onClick={() => setSelectedUnit('unit3')}
            style={{
              padding: '10px 20px',
              borderRadius: '12px',
              border: 'none',
              background: selectedUnit === 'unit3' ? '#059669' : 'white',
              color: selectedUnit === 'unit3' ? 'white' : '#475569',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              transition: 'all 0.2s'
            }}
          >
            الوحدة الثالثة: بناء المستقبل
          </button>
        </div>

        {/* Cards Grid */}
        <div className={styles.cardsGrid}>
          {filteredLessons.map((lesson) => {
            const IconComp = lesson.icon
            return (
              <Link 
                key={lesson.id} 
                href={lesson.path}
                className={`${styles.courseCard} ${lesson.isLocked ? styles.lockedCard : ''}`}
              >
                <div className={styles.cardHeader}>
                  <div className={styles.iconBox}>
                    <IconComp size={28} />
                  </div>
                  <span className={styles.badge}>
                    {lesson.type}
                  </span>
                </div>
                
                <h3 className={styles.cardTitle}>{lesson.title}</h3>
                <p className={styles.cardDesc}>{lesson.desc}</p>
                
                <div className={styles.cardFooter}>
                  <span className={styles.footerText}>ابدأ الدرس الآن</span>
                  <div className={styles.actionBtn}>
                    <ArrowRight size={18} style={{ transform: 'rotate(180deg)' }} />
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
