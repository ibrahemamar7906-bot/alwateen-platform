'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { 
  ArrowRight, Sparkles, BookOpen, Calculator, Languages, 
  Gamepad2, Bot, ChevronLeft, Star, Award, Compass, Heart,
  Car, Layers, Trophy, CheckCircle2
} from 'lucide-react'
import styles from './portal.module.css'

const CATEGORIES = [
  {
    id: 'quran',
    title: 'حلقات القرآن الكريم والمصحف الشريف 🌿',
    icon: '🌿',
    iconBg: 'linear-gradient(135deg, #2A52C7 0%, #1A2E86 100%)',
    desc: 'أنشطة حفظ وترتيب كلمات الآيات لجميع سور المصحف (١١٤ سورة) مع تحديد النطاق، ومصحف التجويد التفاعلي.',
    items: [
      {
        title: 'أنشطة حلقات القرآن الكريم 🌿',
        path: '/kids-corner/quran-words',
        icon: '✨',
        glowClass: styles.cardGlowArabic,
        desc: 'رتّب كلمات الآيات الكريمة بالترتيب الصحيح لجميع سور القرآن الكريم مع تحديد نطاق الآيات (من آية كذا لآية كذا) وتلاوة الشيخ مشاري.',
        badge: 'تثبيت وحفظ القرآن • ١١٤ سورة',
        chips: ['📖 كامل المصحف (١١٤ سورة)', '🎯 تحديد من آية كذا لآية كذا', '🎧 تلاوة مشاري العفاسي', '🏆 نقاط فوز ونجوم'],
        actionText: 'رتّب واحفظ 🌿'
      },
      {
        title: 'مصحف التجويد والتظليل 📖',
        path: '/kids-corner/mushaf',
        icon: '📑',
        glowClass: styles.cardGlowArabic,
        desc: 'تصفح صفحات المصحف الشريف بدقة عالية مع أدوات الرسم والتظليل الفسفوري والاستماع للتلاوة العطرة.',
        badge: 'المصحف التفاعلي الملون',
        chips: ['📖 ٦٠٤ صفحة كاملة', '🖍️ تظليل أحكام التجويد', '✏️ رسم وكتابة', '🔊 تلاوة صوتية فورية'],
        actionText: 'تصفح المصحف 📖'
      }
    ]
  },
  {
    id: 'foundation',
    title: 'ركائز التأسيس التعليمي الأساسية 📖',
    icon: '📖',
    iconBg: 'linear-gradient(135deg, #1A2E86 0%, #0d9488 100%)',
    desc: 'بناء المهارات الأساسية في اللغة العربية والحساب واللغة الإنجليزية من الصفر حتى الإتقان.',
    items: [
      {
        title: 'لغتي الجميلة 🇸🇦',
        path: '/kids-corner/arabic',
        icon: '📖',
        glowClass: styles.cardGlowArabic,
        desc: 'تعلم الحروف، كتابة الكلمات على السبورة، وتأسيس شامل ممتع بالصوت والصورة.',
        badge: 'تأسيس اللغة العربية',
        chips: ['✍️ كتابة الحروف', '🎵 الحركات والمدود', '🚂 قطار الكلمات', '🗺️ مسار ذكي'],
        actionText: 'ابدأ التعلم 🇸🇦'
      },
      {
        title: 'عبقري الأرقام 🔢',
        path: '/kids-corner/math',
        icon: '🧮',
        glowClass: styles.cardGlowMath,
        desc: 'الحساب الذهني، الأرقام حتى ١٠٠، الجمع والطرح، وألعاب الرياضيات الشيقة.',
        badge: 'تأسيس الحساب',
        chips: ['🔢 الأرقام من ٠ لـ ١٠٠', '➕ جمع وطرح', '📐 أشكال وألوان', '🎈 بالونات الأرقام'],
        actionText: 'انطلق للحساب 🧮'
      },
      {
        title: 'English Stars 🔠',
        path: '/kids-corner/english',
        icon: '⭐',
        glowClass: styles.cardGlowEnglish,
        desc: 'Alphabet letters, Phonics sounds, Tracing, and exciting vocabulary adventures.',
        badge: 'تأسيس الإنجليزية',
        chips: ['🔤 ABC Alphabet', '🎧 Phonics Sounds', '✍️ Tracing Board', '🎮 Fun Games'],
        actionText: 'Start English ⭐'
      }
    ]
  },
  {
    id: 'games',
    title: 'واحة الألعاب والمهارات والتهجئة التفاعلية 🎮',
    icon: '🎮',
    iconBg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    desc: 'ألعاب ذكاء وترفيه تعليمي لتنمية سرعة التهجئة والدمج الصوتي وحل الألغاز.',
    items: [
      {
        title: 'سباق سيارة دمج الكلمات 🏎️',
        path: '/kids-corner/car-blending',
        icon: '🚗',
        glowClass: styles.cardGlowMath,
        desc: 'حرّك السيارة تحت الحروف لتنطق الفونكس وتدمج الكلمة وتفتح الستار السحري.',
        badge: 'تأسيس قراءة بالسيارة',
        chips: ['♾️ توليد لا نهائي', '🏎️ سيارة سريعة', '🎭 ستار المفاجآت', '🔊 نطق الكلمات'],
        actionText: 'سابق وادمج 🏎️'
      },
      {
        title: 'مخلب صيد الحروف 🕹️',
        path: '/kids-corner/claw-machine',
        icon: '🕹️',
        glowClass: styles.cardGlowEnglish,
        desc: 'اختر الحرف الناقص وشاهد ونش المخلب الكهربائي يسحبه لمكانه في الكلمة!',
        badge: 'لعبة أركيد وتهجئة',
        chips: ['♾️ جولات لا نهائية', '🕹️ ونش المخلب', '🔤 الحرف الناقص', '🎯 صور توضيحية'],
        actionText: 'شغّل المخلب 🕹️'
      },
      {
        title: 'صخور الفونكس والدمج 💥',
        path: '/kids-corner/blending-rocks',
        icon: '🪨',
        glowClass: styles.cardGlowEnglish,
        desc: 'اكسر الصخور واكتشف الأصوات وادمج الكلمات التأسيسية بتأثيرات صوتية شيقة.',
        badge: 'لعبة تفاعلية مبتكرة',
        chips: ['♾️ كلمات لا نهائية', '🪨 تكسير الصخور', '🎧 نطق صوتي', '🧩 دمج الحروف'],
        actionText: 'اكسر الصخور 💥'
      },
      {
        title: 'مملكة الألعاب التفاعلية 🎮',
        path: '/kids-corner/games/mario?subject=arabic',
        icon: '🍄',
        glowClass: styles.cardGlowMath,
        desc: 'مغامرات ماريو، صب واي الحروف، حرب الدبابات، وتحديات الذكاء الممتعة.',
        badge: 'ألعاب الأركيد الذكية',
        chips: ['♾️ أسئلة لا نهائية', '🏃 ماريو الحروف', '🚆 صب واي الكلمات', '🚀 حرب المفردات'],
        actionText: 'ادخل المملكة 🎮'
      }
    ]
  },
  {
    id: 'curriculum',
    title: 'المناهج الدراسية الرسمية 🎒',
    icon: '🎒',
    iconBg: 'linear-gradient(135deg, #1A2E86 0%, #2A52C7 100%)',
    desc: 'مقررات ودروس المنهج التفاعلي بالقصص والأناشيد والتدريبات.',
    items: [
      {
        title: 'منهج الصف الأول الابتدائي 🎒',
        path: '/kids-corner/primary1',
        icon: '🏫',
        glowClass: styles.cardGlowArabic,
        desc: 'المنهج التفاعلي الكامل للصف الأول (أسرتي، حيواناتي، جسمي) مع قصص الاستماع والتقييمات.',
        badge: 'منهج أولى ابتدائي',
        chips: ['🏡 أسرتي', '🦁 حيواناتي', '💪 جسمي', '🏆 تقييمات تفاعلية'],
        actionText: 'تصفح المنهج 🎒'
      }
    ]
  },
  {
    id: 'ai',
    title: 'المعلم الذكي للأطفال 🤖',
    icon: '🤖',
    iconBg: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    desc: 'صديق الطفل الذكي المدعوم بالذكاء الاصطناعي للإجابة عن الأسئلة بأسلوب طفولي مرح.',
    items: [
      {
        title: 'المعلم الذكي للأطفال 🤖',
        path: '/student-ai',
        icon: '✨',
        glowClass: styles.cardGlowArabic,
        desc: 'صديقك الذكي يجيبك على أي سؤال، يشرح لك الكلمات والحساب بأسلوب لطيف ومبسط.',
        badge: 'ذكاء اصطناعي تفاعلي',
        chips: ['💬 محادثة صوتية', '💡 إجابات مبسطة', '🎯 تشجيع مستمر', '⭐ صديق دائم'],
        actionText: 'تحدث مع المعلم 🤖'
      }
    ]
  }
]

export default function KidsCornerPortal() {
  const [activeCategory, setActiveCategory] = useState('all')

  // Total items count
  const totalItems = CATEGORIES.reduce((acc, cat) => acc + cat.items.length, 0)

  // Filtered categories according to tab
  const displayedCategories = activeCategory === 'all'
    ? CATEGORIES
    : CATEGORIES.filter(cat => cat.id === activeCategory)

  return (
    <div className={styles.page}>
      <div className={styles.bgDecoration1} />
      <div className={styles.bgDecoration2} />

      <div className={styles.container}>
        {/* Top Navigation Bar */}
        <header className={styles.topNav}>
          <div className={styles.navBrand}>
            <span className={styles.navBrandIcon}>🌟</span>
            <span>ركن التأسيس الذكي للأطفال</span>
          </div>
          <Link href="/" className={styles.navBackBtn} aria-label="الرئيسية">
            <ArrowRight size={18} />
            <span>الرئيسية</span>
          </Link>
        </header>

        {/* Hero Section */}
        <div className={styles.heroWrap}>
          <div className={styles.heroBadge}>
            <Sparkles size={16} />
            <span>بوابة التعلم والمرح • مرتبة ومصنفة خطوة بخطوة</span>
          </div>

          <div className={styles.heroIconContainer}>
            <div className={styles.heroIcon}>🎒</div>
          </div>

          <h1 className={styles.heroTitle}>
            أهلاً بك في <span className={styles.heroHighlight}>عالم التأسيس السحري</span> 🚀
          </h1>

          <p className={styles.heroSub}>
            رحلة تعليمية منظمة تؤسس طفلك في القرآن الكريم والقراءة والكتابة والحساب والإنجليزية بأحدث أساليب اللعب التفاعلي.
          </p>

          <div className={styles.statsBar}>
            <div className={styles.statItem}>
              <Award size={16} color="#1A2E86" />
              <span>أقسام منظمة ومرتبة</span>
            </div>
            <div className={styles.statItem}>
              <Heart size={16} color="#e11d48" />
              <span>حلقات القرآن وتحديد الآيات</span>
            </div>
            <div className={styles.statItem}>
              <Compass size={16} color="#2563eb" />
              <span>ألعاب تفاعلية آمنة للأطفال</span>
            </div>
          </div>
        </div>

        {/* Interactive Category Filter Tabs */}
        <nav className={styles.categoryTabs} aria-label="أقسام التأسيس">
          <button
            onClick={() => setActiveCategory('all')}
            className={`${styles.categoryTab} ${activeCategory === 'all' ? styles.categoryTabActive : ''}`}
          >
            <span>🌟 عرض الكل</span>
            <span className={styles.tabBadge}>{totalItems}</span>
          </button>

          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`${styles.categoryTab} ${activeCategory === cat.id ? styles.categoryTabActive : ''}`}
            >
              <span>{cat.title.split(' ')[0]} {cat.title.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim()}</span>
              <span className={styles.tabBadge}>{cat.items.length}</span>
            </button>
          ))}
        </nav>

        {/* Categorized Content Sections */}
        <main style={{ display: 'flex', flexDirection: 'column', gap: '38px', width: '100%' }}>
          {displayedCategories.map((category) => (
            <section key={category.id} className={styles.categorySection}>
              {/* Category Header */}
              <div className={styles.categoryHeader}>
                <div className={styles.categoryHeaderLeft}>
                  <div className={styles.categoryHeaderIcon} style={{ background: category.iconBg, color: 'white' }}>
                    <span>{category.icon}</span>
                  </div>
                  <div>
                    <h2 className={styles.categoryHeaderTitle}>
                      {category.title}
                    </h2>
                    <p className={styles.categoryHeaderDesc}>
                      {category.desc}
                    </p>
                  </div>
                </div>
                <span className={styles.categoryCountBadge}>
                  {category.items.length} {category.items.length === 1 ? 'نشاط' : category.items.length === 2 ? 'نشاطان' : 'أنشطة'}
                </span>
              </div>

              {/* Cards Grid for this Category */}
              <div className={styles.grid}>
                {category.items.map((item, idx) => (
                  <Link 
                    key={idx} 
                    href={item.path}
                    className={styles.card}
                  >
                    <div className={item.glowClass} />

                    <div>
                      <div className={styles.cardTop}>
                        <div className={styles.iconWrap}>
                          <span>{item.icon}</span>
                        </div>
                        <span className={styles.badge}>
                          {item.badge}
                        </span>
                      </div>

                      <h3 className={styles.cardTitle} style={{ margin: '14px 0 8px 0', fontSize: '1.3rem', fontWeight: 900, color: '#064e3b' }}>
                        {item.title}
                      </h3>
                      <p className={styles.cardDesc} style={{ margin: 0, fontSize: '0.92rem', color: '#475569', lineHeight: 1.6 }}>
                        {item.desc}
                      </p>

                      {/* Preview Chips */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '14px' }}>
                        {item.chips.map((chip, cIdx) => (
                          <span 
                            key={cIdx}
                            style={{
                              fontSize: '0.75rem',
                              background: 'rgba(5, 150, 105, 0.08)',
                              color: '#065f46',
                              padding: '3px 9px',
                              borderRadius: '20px',
                              fontWeight: 700
                            }}
                          >
                            {chip}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className={styles.cardFooter} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid rgba(5, 150, 105, 0.1)' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1A2E86' }}>
                        {item.actionText || 'انطلق للمغامرة 🚀'}
                      </span>
                      <div className={styles.cardActionBtn} style={{ width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ecfdf5', color: '#1A2E86' }}>
                        <ChevronLeft size={20} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </main>
      </div>
    </div>
  )
}
