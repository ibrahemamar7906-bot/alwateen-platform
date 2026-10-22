'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from '../portal.module.css'
import { 
  ArrowLeft, Sparkles, BookOpen, Compass, Gamepad2, Award, 
  Search, PlayCircle, Star, PenTool, Volume2, Flame, Layers, CheckCircle2
} from 'lucide-react'

const PRIMARY1_ACTIVITIES = [
  // ── 1. المناهج والمسارات الرئيسية ──
  {
    title: 'المنهج التفاعلي للغة العربية (الصف الأول)',
    path: '/kids-corner/pathway?subject=primary1_arabic',
    icon: '🇸🇦',
    desc: 'مسار الوحدات الكامل (أسرتي، حيواناتي، جسمي، مدرستي) مع قصص الاستماع والأناشيد والاختبارات.',
    badge: 'المنهج الأساسي 🌟',
    badgeType: 'arabic',
    category: 'arabic',
    glowClass: styles.cardGlowArabic,
    previewChips: ['🏡 أسرتي', '🦁 حيواناتي', '💪 أجزاء جسمي', '🏫 مدرستي'],
    isFeatured: true,
  },
  {
    title: 'مسار حساب ورياضيات الصف الأول',
    path: '/kids-corner/pathway?subject=math',
    icon: '🔢',
    desc: 'تعلم الأرقام حتى ١٠٠، المقارنة، والجمع والطرح البسيط عبر مسار تعليمي شيق ومحفز.',
    badge: 'عبقري الحساب 🧮',
    badgeType: 'math',
    category: 'math',
    glowClass: styles.cardGlowMath,
    previewChips: ['🔢 الأرقام من ١ إلى ١٠٠', '➕ الجمع البسيط', '➖ الطرح', '📐 الأشكال'],
    isFeatured: true,
  },
  {
    title: 'مسار اللغة الإنجليزية (Connect 1)',
    path: '/kids-corner/pathway?subject=english',
    icon: '🔠',
    desc: 'Phonics Sounds, Alphabet Letters, Vocabulary & Interactive Stories for Grade 1.',
    badge: 'English Stars ⭐',
    badgeType: 'english',
    category: 'english',
    glowClass: styles.cardGlowEnglish,
    previewChips: ['🔤 Phonics', '🍎 Vocabulary', '📖 Stories', '🎮 Mini Quizzes'],
    isFeatured: true,
  },

  // ── 2. مهارات القراءة والكتابة ──
  {
    title: 'السبورة السحرية وتتبع الحروف',
    path: '/kids-corner/tracing',
    icon: '✍️',
    desc: 'تدرب على كتابة الحروف والأرقام بطريقة تفاعلية وممتعة باللمس والقلم.',
    badge: 'كتابة ورسم',
    category: 'writing',
    previewChips: ['✍️ رسم الحروف', '🎨 ألوان مبهجة', '⭐ تقييم الرسم'],
  },
  {
    title: 'القصص التفاعلية والناطقة',
    path: '/kids-corner/storybook',
    icon: '📖',
    desc: 'قصص ناطقة بأصوات واضحة تناسب سن الصف الأول لتعزيز الفهم والاستماع.',
    badge: 'استماع وقراءة',
    category: 'reading',
    previewChips: ['🔊 نطق الكلمات', '🖼️ رسوم متحركة', '❓ أسئلة فهم'],
  },
  {
    title: 'البطاقات الناطقة والحركات',
    path: '/kids-corner/flashcards',
    icon: '🔊',
    desc: 'تعلم الحروف مع الحركات الثلاث (فتحة، ضمة، كسرة) والسكون ونطق الكلمات.',
    badge: 'صوتيات وحركات',
    category: 'arabic',
    previewChips: ['َ الفتحة', 'ُ الضمة', 'ِ الكسرة', 'ْ السكون'],
  },
  {
    title: 'قطار الكلمات وتركيب الحروف',
    path: '/kids-corner/train',
    icon: '🚂',
    desc: 'اسحب الحروف وركبها على عربات القطار لتكوين الكلمات بطريقة تفاعلية.',
    badge: 'لعبة تركيب',
    category: 'games',
    previewChips: ['🚂 قطار تفاعلي', '🧩 دمج الحروف', '🌟 نقاط فورية'],
  },
  {
    title: 'مختبر الرياضيات والأشكال',
    path: '/kids-corner/math-lab',
    icon: '📐',
    desc: 'اكتشف الأشكال الهندسية، الألوان، والمقارنات والأحجام بأسلوب بصري ساحر.',
    badge: 'أشكال وحساب',
    category: 'math',
    previewChips: ['🔺 أشكال هندسية', '🎨 ألوان', '⚖️ أكبر وأصغر'],
  },
  {
    title: 'الأرقام الناطقة التفاعلية',
    path: '/kids-corner/talking-numbers',
    icon: '🧮',
    desc: 'استمع لنطق الأرقام بالعربية والإنجليزية مع عد الأشياء والعناصر البصرية.',
    badge: 'نطق وعد',
    category: 'math',
    previewChips: ['🔊 نطق عربي', '🔊 نطق إنجليزي', '🍎 عد تفاعلي'],
  },

  // ── 3. الألعاب والتحديات ──
  {
    title: 'ماريو البطل وتحدي الحروف والكلمات',
    path: '/kids-corner/games/mario?subject=arabic',
    icon: '🍄',
    desc: 'اقفز بالبطل ماريو وافتح الصناديق السحرية بالإجابة على أسئلة الحروف والكلمات.',
    badge: 'لعبة المغامرة',
    category: 'games',
    previewChips: ['🎮 تحكم سلس', '🪙 جمع النقاط', '❓ أسئلة ذكية'],
  },
  {
    title: 'صب واي الحروف والكلمات المسرعة',
    path: '/kids-corner/games/subway?subject=arabic',
    icon: '🚆',
    desc: 'اركض وتفادى القطارات بالإجابة السريعة والدقيقة على أسئلة الصف الأول.',
    badge: 'سرعة وتركيز',
    category: 'games',
    previewChips: ['🏃 ركض ومطاردة', '⚡ سرعة بديهة', '🏆 أرقام قياسية'],
  },
  {
    title: 'حرب الكلمات ومعركة الدبابات',
    path: '/kids-corner/games/tank-battle?subject=arabic',
    icon: '🚀',
    desc: 'أطلق القذائف بالإجابة الصحيحة وتحدى الروبوت الذكي أو زميلك.',
    badge: 'تحدي وذكاء',
    category: 'games',
    previewChips: ['🤖 ضد الكمبيوتر', '👥 لاعبين اثنين', '💥 معركة شيقة'],
  },
  {
    title: 'فرقعة بالونات الحروف',
    path: '/kids-corner/balloons',
    icon: '🎈',
    desc: 'استمع للحرف المطلوب وفرقع البالون الصحيح قبل أن يطير إلى السماء!',
    badge: 'سرعة ودقة',
    category: 'games',
    previewChips: ['🎈 بالونات ملونة', '🔊 استماع فوري', '⏱️ وقت ممتع'],
  },
  {
    title: 'تحدي الذاكرة ومطابقة الحروف',
    path: '/kids-corner/memory',
    icon: '🧠',
    desc: 'اقلب البطاقات وطابق الحرف مع صورته لتقوية الذاكرة البصرية.',
    badge: 'ذكاء وذاكرة',
    category: 'games',
    previewChips: ['🃏 بطاقات مقلوبة', '🧠 قوة الملاحظة', '⭐ مراحل متدرجة'],
  },
  {
    title: 'تركيب الصور والكلمات (Puzzle)',
    path: '/kids-corner/puzzle',
    icon: '🧩',
    desc: 'رتب قطع الصورة والحروف لاكتشاف الكلمة المخفية والفوز بالجوائز.',
    badge: 'تركيب وبازل',
    category: 'games',
    previewChips: ['🧩 بازل ذكي', '🖼️ صور مبهجة', '🎉 احتفال بالفوز'],
  },
]

const CATEGORIES = [
  { id: 'all', label: 'الكل ✨' },
  { id: 'arabic', label: '🇸🇦 لغة عربية' },
  { id: 'math', label: '🔢 حساب ورياضيات' },
  { id: 'english', label: '🔠 إنجليزي Connect' },
  { id: 'writing', label: '✍️ كتابة وتتبع' },
  { id: 'reading', label: '📖 قصص واستماع' },
  { id: 'games', label: '🎮 ألعاب وتحديات' },
]

export default function Primary1HubPage() {
  const router = useRouter()
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredActivities = useMemo(() => {
    return PRIMARY1_ACTIVITIES.filter(item => {
      const matchCat = activeCategory === 'all' || item.category === activeCategory
      const matchSearch = !searchQuery.trim() ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.desc.toLowerCase().includes(searchQuery.toLowerCase())
      return matchCat && matchSearch
    })
  }, [activeCategory, searchQuery])

  return (
    <div className={styles.page}>
      {/* Background decorations */}
      <div className={styles.bgDecoration1} />
      <div className={styles.bgDecoration2} />

      <div className={styles.container}>
        
        {/* Top Nav Bar */}
        <nav className={styles.topNav}>
          <div className={styles.navBrand}>
            <span className={styles.navBrandIcon}>🎒</span>
            <span>منصة الوتين • بوابة الصف الأول الابتدائي</span>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button 
              className={styles.navBackBtn} 
              onClick={() => router.push('/student-dashboard')}
              aria-label="لوحة الطالب"
            >
              <span>لوحة الطالب</span>
              <ArrowLeft size={16} />
            </button>
          </div>
        </nav>

        {/* Hero Section */}
        <header className={styles.heroWrap}>
          <div className={styles.heroBadge}>
            <Sparkles size={14} color="#059669" />
            <span>المنهج التفاعلي المطور • الصف الأول الابتدائي 🌟</span>
          </div>

          <div className={styles.heroIconContainer}>
            <div className={styles.heroIcon}>🎒</div>
          </div>

          <h1 className={styles.heroTitle}>
            أهلاً بأبطال <span className={styles.heroHighlight}>الصف الأول الابتدائي</span> 🚀
          </h1>
          
          <p className={styles.heroSub}>
            رحلة تعلم شيقة ومتكاملة للمنهج الجديد! اختر المادة أو المسار التعليمي أو انطلق في الألعاب الذكية المصممة خصيصاً لمستواك.
          </p>

          {/* Quick Stats Banner */}
          <div className={styles.statsBar}>
            <div className={styles.statItem}>
              <span>📚</span>
              <span>٤ وحدات دراسية متكاملة</span>
            </div>
            <div className={styles.statItem}>
              <span>🗺️</span>
              <span>٣ مسارات تفاعلية متدرجة</span>
            </div>
            <div className={styles.statItem}>
              <span>🎮</span>
              <span>١٥ لعبة ونشاط تفاعلي ناطق</span>
            </div>
            <div className={styles.statItem}>
              <span>🌟</span>
              <span>نقاط وأوسمة فورية</span>
            </div>
          </div>
        </header>

        {/* Units Quick Highway Banner */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.08), rgba(13, 148, 136, 0.12))',
          border: '1.5px solid rgba(5, 150, 105, 0.25)',
          borderRadius: '24px',
          padding: 'clamp(16px, 3vw, 24px)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          boxShadow: '0 10px 25px rgba(5, 150, 105, 0.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.8rem' }}>🗺️</span>
              <div>
                <h3 style={{ margin: 0, color: '#064e3b', fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', fontWeight: 900 }}>
                  المسار الذكي لمنهج اللغة العربية (أولى ابتدائي)
                </h3>
                <p style={{ margin: 0, color: '#047857', fontSize: '0.85rem', fontWeight: 600 }}>
                  تدرج خطوة بخطوة في وحدات المنهج واجمع النجوم والأوسمة!
                </p>
              </div>
            </div>
            <Link
              href="/kids-corner/pathway?subject=primary1_arabic"
              style={{
                background: 'linear-gradient(135deg, #059669, #0d9488)',
                color: 'white',
                padding: '10px 24px',
                borderRadius: '50px',
                fontWeight: 800,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(5, 150, 105, 0.35)',
                transition: 'transform 0.2s',
              }}
            >
              <span>فتح خريطة المنهج</span>
              <span>←</span>
            </Link>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '10px',
            marginTop: '6px',
          }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.85)', padding: '12px 16px', borderRadius: '16px', border: '1px solid rgba(5, 150, 105, 0.15)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.5rem' }}>🏡</span>
              <div>
                <strong style={{ display: 'block', color: '#064e3b', fontSize: '0.92rem' }}>الوحدة ١: أسرتي</strong>
                <small style={{ color: '#64748b' }}>أميرة، النشيد، ٨ حروف، والدمج</small>
              </div>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.85)', padding: '12px 16px', borderRadius: '16px', border: '1px solid rgba(5, 150, 105, 0.15)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.5rem' }}>🦁</span>
              <div>
                <strong style={{ display: 'block', color: '#064e3b', fontSize: '0.92rem' }}>الوحدة ٢: حيواناتي</strong>
                <small style={{ color: '#64748b' }}>عالم الحيوان، النشيد، ٧ حروف</small>
              </div>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.85)', padding: '12px 16px', borderRadius: '16px', border: '1px solid rgba(5, 150, 105, 0.15)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.5rem' }}>💪</span>
              <div>
                <strong style={{ display: 'block', color: '#064e3b', fontSize: '0.92rem' }}>الوحدة ٣: أجزاء جسمي</strong>
                <small style={{ color: '#64748b' }}>صندوق جدتي، النشيد، ٧ حروف</small>
              </div>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.85)', padding: '12px 16px', borderRadius: '16px', border: '1px solid rgba(5, 150, 105, 0.15)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.5rem' }}>🏫</span>
              <div>
                <strong style={{ display: 'block', color: '#064e3b', fontSize: '0.92rem' }}>الوحدة ٤: مدرستي</strong>
                <small style={{ color: '#64748b' }}>يوم في المدرسة، نشاطات، ومراجعة</small>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Controls & Search Bar */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          marginTop: '10px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}>
            {/* Category Tabs */}
            <div style={{
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap',
              background: 'rgba(255, 255, 255, 0.8)',
              padding: '6px',
              borderRadius: '50px',
              border: '1px solid rgba(5, 150, 105, 0.15)',
              backdropFilter: 'blur(10px)',
            }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '50px',
                    border: 'none',
                    background: activeCategory === cat.id ? 'linear-gradient(135deg, #059669, #0d9488)' : 'transparent',
                    color: activeCategory === cat.id ? 'white' : '#065f46',
                    fontWeight: 800,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: activeCategory === cat.id ? '0 4px 12px rgba(5, 150, 105, 0.25)' : 'none',
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255, 255, 255, 0.9)',
              padding: '8px 16px',
              borderRadius: '50px',
              border: '1.5px solid rgba(5, 150, 105, 0.2)',
              minWidth: '240px',
            }}>
              <Search size={16} color="#059669" />
              <input
                type="text"
                placeholder="ابحث عن درس أو لعبة..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  fontFamily: 'inherit',
                  fontSize: '0.9rem',
                  color: '#064e3b',
                  width: '100%',
                }}
              />
            </div>
          </div>
        </div>

        {/* Activities Grid */}
        <main className={styles.grid}>
          {filteredActivities.map((act, i) => (
            <Link
              key={act.path + i}
              href={act.path}
              className={styles.card}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              {act.glowClass && <div className={act.glowClass} />}

              <div>
                <div className={styles.cardTop}>
                  <div className={styles.iconWrap}>{act.icon}</div>
                  <span className={`${styles.badge} ${act.badgeType === 'math' ? styles.badgeMath : act.badgeType === 'english' ? styles.badgeEnglish : ''}`}>
                    {act.badge}
                  </span>
                </div>

                <div className={styles.cardBody} style={{ marginTop: '14px' }}>
                  <h2 className={styles.cardTitle}>{act.title}</h2>
                  <p className={styles.cardDesc}>{act.desc}</p>
                </div>

                {act.previewChips && (
                  <div className={styles.featuresWrap}>
                    {act.previewChips.map((chip, idx) => (
                      <span key={idx} className={styles.featureChip}>{chip}</span>
                    ))}
                  </div>
                )}
              </div>

              <div className={styles.cardFooter}>
                <div className={styles.cardActionBtn}>
                  <span>ابدأ النشاط الآن</span>
                  <span>←</span>
                </div>
              </div>
            </Link>
          ))}
        </main>

        {/* Interactive Quick Advice Box */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(20px)',
          border: '1.5px solid rgba(255, 255, 255, 0.9)',
          borderRadius: '24px',
          padding: 'clamp(20px, 4vw, 32px)',
          boxShadow: '0 8px 30px rgba(5, 150, 105, 0.08)',
          textAlign: 'center',
          marginTop: '10px',
        }}>
          <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '8px' }}>💡</span>
          <h3 style={{ color: '#064e3b', fontSize: '1.3rem', fontWeight: 900, margin: '0 0 8px 0' }}>
            نصيحة المعلم لبطل الصف الأول:
          </h3>
          <p style={{ color: '#475569', maxWidth: '650px', margin: '0 auto', fontSize: '1rem', lineHeight: 1.7 }}>
            خصص كل يوم ١٥ دقيقة للمسار التفاعلي لحفظ الكلمات وممارسة القراءة، ثم استمتع بلعبة ماريو أو صب واي لاختبار سرعتك وذكائك!
          </p>
        </div>

      </div>
    </div>
  )
}
