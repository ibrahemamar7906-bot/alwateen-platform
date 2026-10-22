'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, BookOpen, Lock, FileText, LayoutList, Headphones, Sparkles } from 'lucide-react'
import styles from '../page.module.css'

export default function Prep1ReadingAndTextsIndex() {
  const [selectedUnit, setSelectedUnit] = useState('all')

  const lessons = [
    // ════════════════════════════════════════════════════════════
    // الوحدة الأولى: أنا مصري
    // ════════════════════════════════════════════════════════════
    { 
      id: 1,
      unitId: 'unit1',
      unitName: 'الوحدة الأولى: أنا مصري',
      title: 'مصر مهد العلم (د. أحمد زويل)', 
      desc: 'نص استماع: حديث زويل عن فوزه بنوبل ونظام الفمتوثانية وعراقة حضارة مصر', 
      path: '/prep-1/reading-and-texts/lesson-1', 
      status: 'متاح الآن',
      isLocked: false,
      type: 'نص استماع',
      icon: Headphones
    },
    { 
      id: 2,
      unitId: 'unit1',
      unitName: 'الوحدة الأولى: أنا مصري',
      title: 'أسطورة مصرية (البطل أحمد منسي)', 
      desc: 'درس قراءة: سيرة البطل الشهيد وملحمة كمين البرث في سيناء', 
      path: '/prep-1/reading-and-texts/lesson-2', 
      status: 'متاح الآن',
      isLocked: false,
      type: 'درس قراءة',
      icon: FileText
    },
    { 
      id: 3,
      unitId: 'unit1',
      unitName: 'الوحدة الأولى: أنا مصري',
      title: 'رسالة إلى المرأة المصرية (د. نعمات أحمد فؤاد)', 
      desc: 'درس قراءة: مكانة المرأة المصرية عبر التاريخ ودورها في بناء الحضارة', 
      path: '/prep-1/reading-and-texts/lesson-3', 
      status: 'متاح الآن',
      isLocked: false,
      type: 'درس قراءة',
      icon: FileText
    },
    { 
      id: 4,
      unitId: 'unit1',
      unitName: 'الوحدة الأولى: أنا مصري',
      title: 'وجه الوطن (للشاعر فاروق جويدة)', 
      desc: 'نص شعري: التضحية من أجل الوطن وفداؤه بالروح والعمل الصادق', 
      path: '/prep-1/reading-and-texts/lesson-4', 
      status: 'متاح الآن',
      isLocked: false,
      type: 'نص شعري',
      icon: Sparkles
    },

    // ════════════════════════════════════════════════════════════
    // الوحدة الثانية: أصنع مستقبلي
    // ════════════════════════════════════════════════════════════
    { 
      id: 5,
      unitId: 'unit2',
      unitName: 'الوحدة الثانية: أصنع مستقبلي',
      title: 'تاريخنا... أساس لمستقبلنا (المتحف المصري الكبير)', 
      desc: 'نص استماع: صرح حضاري عملاق يربط أمجاد الماضي بآفاق المستقبل', 
      path: '/prep-1/reading-and-texts/lesson-5', 
      status: 'متاح الآن',
      isLocked: false,
      type: 'نص استماع',
      icon: Headphones
    },
    { 
      id: 6,
      unitId: 'unit2',
      unitName: 'الوحدة الثانية: أصنع مستقبلي',
      title: 'أشياء صنعت مني كاتباً (عباس محمود العقاد)', 
      desc: 'درس قراءة: مقومات النجاح وتجربة العقاد مع التشجيع وحب القراءة', 
      path: '/prep-1/reading-and-texts/lesson-6', 
      status: 'متاح الآن',
      isLocked: false,
      type: 'درس قراءة',
      icon: FileText
    },
    { 
      id: 7,
      unitId: 'unit2',
      unitName: 'الوحدة الثانية: أصنع مستقبلي',
      title: 'بطولات مصرية (محمد صلاح، علي فرج، أحمد الجندي)', 
      desc: 'درس قراءة: نماذج مشرفة في الإصرار والتفوق الرياضي والعلمي عالمياً', 
      path: '/prep-1/reading-and-texts/lesson-7', 
      status: 'متاح الآن',
      isLocked: false,
      type: 'درس قراءة',
      icon: FileText
    },
    { 
      id: 8,
      unitId: 'unit2',
      unitName: 'الوحدة الثانية: أصنع مستقبلي',
      title: 'شباب اليوم... صُنّاع المجد (للشاعر د. إبراهيم ناجي)', 
      desc: 'نص شعري: دعوة للشباب للنهوض بالعلم والعمل وبناء المجد لمصر', 
      path: '/prep-1/reading-and-texts/lesson-8', 
      status: 'متاح الآن',
      isLocked: false,
      type: 'نص شعري',
      icon: Sparkles
    },

    // ════════════════════════════════════════════════════════════
    // الوحدة الثالثة: مواقف إنسانية
    // ════════════════════════════════════════════════════════════
    { 
      id: 9,
      unitId: 'unit3',
      unitName: 'الوحدة الثالثة: مواقف إنسانية',
      title: 'دروس من الحياة (حصة الأستاذ عامر)', 
      desc: 'نص استماع: تطبيق عملي ومواقف حية في التسامح والشهامة ومساعدة الآخرين', 
      path: '/prep-1/reading-and-texts/lesson-9', 
      status: 'متاح الآن',
      isLocked: false,
      type: 'نص استماع',
      icon: Headphones
    },
    { 
      id: 10,
      unitId: 'unit3',
      unitName: 'الوحدة الثالثة: مواقف إنسانية',
      title: 'رحمة تداوي وعلم يضيء (ابن النفيس)', 
      desc: 'درس قراءة: إنجازات الطبيب العربي ابن النفيس مكتشف الدورة الدموية الصغرى', 
      path: '/prep-1/reading-and-texts/lesson-10', 
      status: 'متاح الآن',
      isLocked: false,
      type: 'درس قراءة',
      icon: FileText
    },
    { 
      id: 11,
      unitId: 'unit3',
      unitName: 'الوحدة الثالثة: مواقف إنسانية',
      title: 'إنسان في عصر التكنولوجيا', 
      desc: 'درس قراءة: التوازن الإنساني والأخلاقي في ظل الثورة الرقمية الحديثة', 
      path: '/prep-1/reading-and-texts/lesson-11', 
      status: 'متاح الآن',
      isLocked: false,
      type: 'درس قراءة',
      icon: FileText
    },
    { 
      id: 12,
      unitId: 'unit3',
      unitName: 'الوحدة الثالثة: مواقف إنسانية',
      title: 'دعاء شاعرة (للشاعرة جليلة رضا)', 
      desc: 'نص شعري: مناجاة ودعاء بالهداية ونشر السلام والرحمة بين الناس', 
      path: '/prep-1/reading-and-texts/lesson-12', 
      status: 'متاح الآن',
      isLocked: false,
      type: 'نص شعري',
      icon: Sparkles
    }
  ]

  const filteredLessons = lessons.filter(lesson => {
    if (selectedUnit === 'all') return true
    return lesson.unitId === selectedUnit
  })

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
                <BookOpen size={18} />
                <span>فرع القراءة والنصوص</span>
              </div>
              <h1 className={styles.title}>القراءة والنصوص - 1 إعدادي</h1>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContent}>
        
        {/* Unit Filter Tabs */}
        <div style={{
          display: 'flex',
          gap: '10px',
          overflowX: 'auto',
          padding: '20px 0 10px',
          scrollbarWidth: 'none',
          marginBottom: '15px'
        }}>
          {[
            { id: 'all', label: 'كل الدروس (12)' },
            { id: 'unit1', label: 'الوحدة الأولى: أنا مصري' },
            { id: 'unit2', label: 'الوحدة الثانية: أصنع مستقبلي' },
            { id: 'unit3', label: 'الوحدة الثالثة: مواقف إنسانية' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedUnit(tab.id)}
              style={{
                background: selectedUnit === tab.id ? '#059669' : 'rgba(255, 255, 255, 0.9)',
                color: selectedUnit === tab.id ? '#ffffff' : '#4b5563',
                border: selectedUnit === tab.id ? '2px solid #059669' : '1px solid #e5e7eb',
                padding: '10px 18px',
                borderRadius: '14px',
                fontWeight: '700',
                fontSize: '0.95rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
                boxShadow: selectedUnit === tab.id ? '0 4px 12px rgba(5, 150, 105, 0.25)' : 'none'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Lessons Cards Grid */}
        <div className={styles.listGrid}>
          {filteredLessons.map((lesson) => {
            const IconComponent = lesson.icon || FileText
            return (
              <div 
                key={lesson.id} 
                className={`${styles.listCard} ${lesson.isLocked ? styles.lockedCard : ''}`}
                style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'stretch' }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                  <div className={styles.listCardLeft}>
                    <div className={styles.listIconBox} style={{ background: '#ecfdf5', color: '#059669' }}>
                      {lesson.isLocked ? (
                        <Lock size={24} />
                      ) : (
                        <IconComponent size={24} />
                      )}
                    </div>
                    <div className={styles.listCardContent}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: '800', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '6px' }}>
                          {lesson.type}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '600' }}>
                          {lesson.unitName}
                        </span>
                      </div>
                      <h3 className={styles.listCardTitle} style={{ fontSize: '1.15rem' }}>{lesson.title}</h3>
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
                      style={{ 
                        flex: 1, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: '8px', 
                        background: '#ecfdf5', 
                        color: '#059669', 
                        padding: '10px', 
                        borderRadius: '10px', 
                        fontWeight: '700', 
                        textDecoration: 'none', 
                        border: '1px solid #a7f3d0', 
                        transition: 'all 0.2s',
                        fontSize: '0.95rem'
                      }}
                    >
                      <BookOpen size={18} />
                      شرح الدرس
                    </Link>
                    <Link 
                      href={`${lesson.path}#quiz`}
                      style={{ 
                        flex: 1, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: '8px', 
                        background: '#059669', 
                        color: 'white', 
                        padding: '10px', 
                        borderRadius: '10px', 
                        fontWeight: '700', 
                        textDecoration: 'none', 
                        transition: 'all 0.2s', 
                        boxShadow: '0 2px 6px rgba(5,150,105,0.25)',
                        fontSize: '0.95rem'
                      }}
                    >
                      <LayoutList size={18} />
                      تدريبات وأسئلة
                    </Link>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
