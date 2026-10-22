'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from './StageHub.module.css'
import { ArrowLeft, Sparkles, BookOpen, Compass, Gamepad2, Award } from 'lucide-react'

export default function StageHubTemplate({
  title,
  highlightedWord,
  subtitle,
  stageBadge,
  stageIcon = '🌟',
  subjects = [],
  shortcuts = []
}) {
  const router = useRouter()

  const getGlowClass = (badgeType) => {
    switch(badgeType) {
      case 'arabic': return styles.cardGlowArabic;
      case 'math': return styles.cardGlowMath;
      case 'english': return styles.cardGlowEnglish;
      case 'science': return styles.cardGlowMath; // Reusing math glow (orange/yellow)
      case 'social': return styles.cardGlowArabic; // Reusing arabic glow (green)
      default: return styles.cardGlowEnglish;
    }
  }

  const getBadgeClass = (badgeType) => {
    switch(badgeType) {
      case 'math': return styles.badgeMath;
      case 'english': return styles.badgeEnglish;
      default: return '';
    }
  }

  return (
    <div className={styles.page}>
      {/* Ambient background glows */}
      <div className={styles.bgDecoration1} />
      <div className={styles.bgDecoration2} />

      <div className={styles.container}>
        
        {/* Top Header Nav */}
        <nav className={styles.topNav}>
          <div className={styles.navBrand}>
            <span className={styles.navBrandIcon}>✨</span>
            <span>منصة الوتين • {title} {highlightedWord}</span>
          </div>
          <button 
            className={styles.navBackBtn} 
            onClick={() => {
              if (window.history.length > 1) {
                router.back()
              } else {
                router.push('/')
              }
            }}
            aria-label="العودة للصفحة السابقة"
          >
            <span>رجوع</span>
            <ArrowLeft size={16} />
          </button>
        </nav>

        {/* Hero Section */}
        <header className={styles.heroWrap}>
          <div className={styles.heroBadge}>
            <Sparkles size={14} color="#1A2E86" />
            <span>{stageBadge}</span>
          </div>

          <div className={styles.heroIconContainer}>
            <div className={styles.heroIcon}>{stageIcon}</div>
          </div>

          <h1 className={styles.heroTitle}>
            {title} <span className={styles.heroHighlight}>{highlightedWord}</span> 🚀
          </h1>
          
          <p className={styles.heroSub}>
            {subtitle}
          </p>

          {/* Quick highlights stats bar */}
          <div className={styles.statsBar}>
            <div className={styles.statItem}>
              <span>🗺️</span>
              <span>مسارات ذكية</span>
            </div>
            <div className={styles.statItem}>
              <span>🎮</span>
              <span>ألعاب تفاعلية</span>
            </div>
            <div className={styles.statItem}>
              <span>🏆</span>
              <span>أوسمة ونقاط</span>
            </div>
          </div>
        </header>

        {/* Subjects Grid */}
        <div className={styles.grid}>
          {subjects.map((subj, idx) => (
            <Link key={idx} href={subj.path} className={styles.card}>
              <div className={getGlowClass(subj.badgeType)} />
              
              <div className={styles.cardBody}>
                <div className={styles.cardTop}>
                  <div className={styles.iconWrap}>
                    {subj.icon}
                  </div>
                  <div className={`${styles.badge} ${getBadgeClass(subj.badgeType)}`}>
                    {subj.badge}
                  </div>
                </div>

                <div style={{ marginTop: '10px' }}>
                  <h2 className={styles.cardTitle}>{subj.title}</h2>
                  <p className={styles.cardDesc}>{subj.desc}</p>
                </div>
                
                <div className={styles.featuresWrap}>
                  {subj.previewChips?.map((chip, i) => (
                    <span key={i} className={styles.featureChip}>{chip}</span>
                  ))}
                </div>
              </div>

              <div className={styles.cardFooter}>
                <div className={styles.cardActionBtn}>
                  <span>{subj.isFeatured ? 'ابدأ المسار الآن' : 'اكتشف المزيد'}</span>
                  <ArrowLeft size={18} />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Shortcuts Ribbon */}
        {shortcuts && shortcuts.length > 0 && (
          <div className={styles.quickRibbon}>
            <h3 className={styles.quickRibbonTitle}>
              <Compass size={20} color="#1A2E86" />
              اختصارات سريعة
            </h3>
            <div className={styles.quickRibbonGrid}>
              {shortcuts.map((shortcut, idx) => (
                <Link key={idx} href={shortcut.path} className={styles.quickShortcut}>
                  <span className={styles.quickShortcutIcon}>{shortcut.icon}</span>
                  <div>
                    <div style={{ fontWeight: 800 }}>{shortcut.title}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{shortcut.desc}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
