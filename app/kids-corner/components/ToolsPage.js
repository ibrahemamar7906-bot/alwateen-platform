'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from './tools.module.css'
import { ArrowLeft, ArrowRight, Search } from 'lucide-react'

export default function ToolsPage({
  title,
  emoji,
  subtitle,
  tools,
  onBack,
  dir = 'rtl',
  backLabel = 'العودة للخلف',
  startLabel = 'ابدأ الآن',
  arrowLabel = '←',
  categories = [
    { id: 'all', label: 'الكل ✨' },
    { id: 'pathway', label: '🗺️ المسار التعليمي' },
    { id: 'games', label: '🎮 الألعاب والتحديات' },
    { id: 'writing', label: '✍️ الكتابة والرسم' },
    { id: 'audio', label: '🔊 الصوتيات والقصص' },
  ]
}) {
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Categorize tools automatically if not explicitly given
  const categorizedTools = useMemo(() => {
    return tools.map(t => {
      let cat = t.category || 'other'
      if (!t.category) {
        const path = t.path.toLowerCase()
        const tTitle = (t.title || '').toLowerCase()
        if (path.includes('pathway') || tTitle.includes('مسار') || tTitle.includes('pathway')) {
          cat = 'pathway'
        } else if (path.includes('games') || path.includes('mario') || path.includes('subway') || path.includes('tank') || path.includes('memory') || path.includes('balloons') || path.includes('puzzle') || path.includes('train')) {
          cat = 'games'
        } else if (path.includes('tracing') || path.includes('shapes') || tTitle.includes('سبورة') || tTitle.includes('رسم') || tTitle.includes('كتابة')) {
          cat = 'writing'
        } else if (path.includes('storybook') || path.includes('talking') || path.includes('flashcards') || path.includes('alphabet') || path.includes('phonics')) {
          cat = 'audio'
        } else {
          cat = 'games'
        }
      }
      return { ...t, computedCategory: cat }
    })
  }, [tools])

  const filteredTools = useMemo(() => {
    return categorizedTools.filter(t => {
      const matchesTab = activeTab === 'all' || t.computedCategory === activeTab
      const matchesSearch = !searchQuery.trim() || 
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.desc && t.desc.toLowerCase().includes(searchQuery.toLowerCase()))
      return matchesTab && matchesSearch
    })
  }, [categorizedTools, activeTab, searchQuery])

  return (
    <div className={styles.page} style={{ direction: dir }}>
      <div className={styles.bgGlow1} />
      <div className={styles.bgGlow2} />

      <div className={styles.container}>
        
        {/* Header Bar */}
        <header className={styles.header}>
          <div className={styles.headerTitleGroup}>
            <div className={styles.headerEmoji}>{emoji}</div>
            <div>
              <h1 className={styles.title}>{title}</h1>
              <p className={styles.subtitle}>{subtitle}</p>
            </div>
          </div>

          <button className={styles.backBtn} onClick={onBack}>
            {dir === 'ltr' ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
            <span>{backLabel}</span>
          </button>
        </header>

        {/* Controls: Category Tabs & Search Bar */}
        <div className={styles.controlsBar}>
          <div className={styles.filterTabs}>
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`${styles.filterTab} ${activeTab === cat.id ? styles.filterTabActive : ''}`}
                onClick={() => setActiveTab(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className={styles.searchBox}>
            <Search size={16} color="#059669" />
            <input
              type="text"
              className={styles.searchInput}
              placeholder={dir === 'ltr' ? 'Search activities...' : 'ابحث عن أداة أو لعبة...'}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Tools Grid */}
        <main className={styles.grid}>
          {filteredTools.length > 0 ? (
            filteredTools.map((tool, i) => (
              <Link
                key={tool.path + i}
                href={tool.path}
                className={styles.card}
                style={{ animationDelay: `${i * 0.03}s` }}
              >
                <div>
                  <div className={styles.cardTop}>
                    <div className={styles.iconWrap}>{tool.icon}</div>
                    <span className={styles.categoryTag}>
                      {getCategoryLabel(tool.computedCategory, dir)}
                    </span>
                  </div>

                  <div className={styles.cardBody} style={{ marginTop: '12px' }}>
                    <div className={styles.cardTitle}>{tool.title}</div>
                    <div className={styles.cardDesc}>{tool.desc}</div>
                  </div>
                </div>

                <div className={styles.cardFooter}>
                  <div className={styles.cardFooterBtn}>
                    <span>{startLabel}</span>
                    <span>{arrowLabel}</span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className={styles.emptyState}>
              <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🔍</div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#064e3b' }}>
                {dir === 'ltr' ? 'No activities found' : 'لم يتم العثور على ألعاب مطابقة'}
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.88rem' }}>
                {dir === 'ltr' ? 'Try searching for another keyword or change category.' : 'جرب البحث بكلمة أخرى أو اختر تصنيفاً آخر.'}
              </p>
            </div>
          )}
        </main>

      </div>
    </div>
  )
}

function getCategoryLabel(cat, dir) {
  if (dir === 'ltr') {
    switch (cat) {
      case 'pathway': return 'Pathway'
      case 'games': return 'Games'
      case 'writing': return 'Writing'
      case 'audio': return 'Audio & Stories'
      default: return 'Activity'
    }
  }
  switch (cat) {
    case 'pathway': return 'مسار تعليمي'
    case 'games': return 'لعبة تفاعلية'
    case 'writing': return 'كتابة وتدريب'
    case 'audio': return 'صوت وقصص'
    default: return 'نشاط تفاعلي'
  }
}
