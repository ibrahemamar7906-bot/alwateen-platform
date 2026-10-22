'use client'
import { useState } from 'react'
import { Monitor, RefreshCw, ExternalLink } from 'lucide-react'

const ROLES = [
  {
    id: 'student',
    icon: '🎓',
    label: 'طالب عادي',
    desc: 'واجهة الطالب المشترك بكل مراحله الدراسية',
    color: '#2563eb',
    bg: '#eff6ff',
    border: '#bfdbfe',
  },
  {
    id: 'kids',
    icon: '🧸',
    label: 'طالب تأسيس',
    desc: 'ركن الأطفال، الحروف، الألعاب والقصص',
    color: '#db2777',
    bg: '#fdf2f8',
    border: '#fbcfe8',
  },
  {
    id: 'teacher',
    icon: '👨‍🏫',
    label: 'معلم',
    desc: 'لوحة أدوات المعلم الذكية كاملة',
    color: '#059669',
    bg: '#f0fdf4',
    border: '#bbf7d0',
  },
]

const STAGE_GROUPS = [
  {
    group: 'ابتدائي',
    stages: [
      { id: 'primary_1', label: 'الأول الابتدائي' },
      { id: 'primary_2', label: 'الثاني الابتدائي' },
      { id: 'primary_3', label: 'الثالث الابتدائي' },
      { id: 'primary_4', label: 'الرابع الابتدائي' },
      { id: 'primary_5', label: 'الخامس الابتدائي' },
      { id: 'primary_6', label: 'السادس الابتدائي' },
    ]
  },
  {
    group: 'إعدادي',
    stages: [
      { id: 'prep_1', label: 'الأول الإعدادي' },
      { id: 'prep_2', label: 'الثاني الإعدادي' },
      { id: 'prep_3', label: 'الثالث الإعدادي' },
    ]
  },
  {
    group: 'ثانوي',
    stages: [
      { id: 'sec_1', label: 'الأول الثانوي' },
      { id: 'sec_2', label: 'الثاني الثانوي' },
      { id: 'sec_3', label: 'الثالث الثانوي' },
    ]
  },
]

export default function PreviewTab({ styles }) {
  const [activeRole, setActiveRole] = useState('student')
  const [selectedStage, setSelectedStage] = useState('primary_1')
  const [iframeKey, setIframeKey] = useState(0)

  const getPreviewUrl = () => {
    if (activeRole === 'student') return `/student-dashboard?preview_stage=${selectedStage}`
    if (activeRole === 'kids')    return `/kids-corner`
    if (activeRole === 'teacher') return `/teacher-assistant`
    return '/'
  }

  const currentRole = ROLES.find(r => r.id === activeRole)
  const previewUrl = getPreviewUrl()

  const refresh = () => setIframeKey(k => k + 1)

  return (
    <section className={styles.section}>

      {/* ── Header ── */}
      <div className={styles.sectionHeader}>
        <h2>معاينة المنصة 👁️ — وضع التجربة</h2>
        <p>شاهد المنصة من عيون أي مستخدم دون الحاجة لإنشاء حسابات تجريبية.</p>
      </div>

      {/* ── Role Selector ── */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {ROLES.map(role => (
          <button
            key={role.id}
            onClick={() => { setActiveRole(role.id); setIframeKey(k => k + 1); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 20px',
              borderRadius: '12px',
              border: `2px solid ${activeRole === role.id ? role.color : role.border}`,
              background: activeRole === role.id ? role.bg : 'white',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontWeight: 700,
              fontSize: '0.9rem',
              color: activeRole === role.id ? role.color : '#64748b',
              transition: 'all 0.18s',
              boxShadow: activeRole === role.id ? `0 4px 12px ${role.color}22` : 'none',
              flex: '1',
              minWidth: '160px',
            }}
          >
            <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>{role.icon}</span>
            <div style={{ textAlign: 'right' }}>
              <div>{role.label}</div>
              <div style={{ fontSize: '0.72rem', fontWeight: 500, color: '#94a3b8', marginTop: '2px' }}>
                {role.desc}
              </div>
            </div>
            {activeRole === role.id && (
              <div style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: role.color, marginRight: 'auto', flexShrink: 0
              }} />
            )}
          </button>
        ))}
      </div>

      {/* ── Stage selector (Student only) ── */}
      {activeRole === 'student' && (
        <div style={{
          display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap',
          background: 'white', padding: '14px 16px', borderRadius: '12px',
          border: '1px solid #e2e8f0', marginBottom: '16px'
        }}>
          <label style={{ fontWeight: 700, color: '#374151', fontSize: '0.88rem', whiteSpace: 'nowrap' }}>
            🎓 المرحلة الدراسية:
          </label>
          <select
            value={selectedStage}
            onChange={e => { setSelectedStage(e.target.value); setIframeKey(k => k + 1); }}
            style={{
              padding: '9px 14px', borderRadius: '8px', border: '1.5px solid #e2e8f0',
              fontSize: '0.9rem', fontFamily: 'inherit', background: '#fafafa',
              color: '#0f172a', outline: 'none', cursor: 'pointer', flex: 1, minWidth: '200px'
            }}
          >
            {STAGE_GROUPS.map(group => (
              <optgroup key={group.group} label={`── ${group.group} ──`}>
                {group.stages.map(s => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      )}

      {/* ── Info bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: '12px', flexWrap: 'wrap',
        background: currentRole.bg, border: `1px solid ${currentRole.border}`,
        borderRadius: '10px', padding: '10px 16px', marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Monitor size={16} color={currentRole.color} />
          <span style={{ fontSize: '0.84rem', fontWeight: 600, color: currentRole.color }}>
            تعرض الآن: {currentRole.icon} {currentRole.label}
            {activeRole === 'student' && ` — ${STAGE_GROUPS.flatMap(g => g.stages).find(s => s.id === selectedStage)?.label}`}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={refresh}
            title="تحديث"
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '6px 12px', borderRadius: '7px',
              background: 'white', border: `1px solid ${currentRole.border}`,
              color: currentRole.color, cursor: 'pointer', fontSize: '0.8rem',
              fontWeight: 700, fontFamily: 'inherit'
            }}
          >
            <RefreshCw size={13} />
            تحديث
          </button>
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '6px 12px', borderRadius: '7px',
              background: currentRole.color, color: 'white',
              fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none'
            }}
          >
            <ExternalLink size={13} />
            فتح كاملاً
          </a>
        </div>
      </div>

      {/* ── Browser Frame + iFrame ── */}
      <div style={{
        border: '6px solid #1e293b',
        borderRadius: '16px',
        overflow: 'hidden',
        height: '680px',
        width: '100%',
        boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
      }}>
        {/* Fake browser bar */}
        <div style={{
          background: '#1e293b',
          padding: '8px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <div style={{ display: 'flex', gap: '5px' }}>
            {['#ef4444','#eab308','#22c55e'].map(c => (
              <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
            ))}
          </div>
          <div style={{
            flex: 1, background: '#334155', borderRadius: '5px',
            padding: '4px 12px', fontSize: '0.72rem', color: '#94a3b8',
            textAlign: 'center', fontFamily: 'monospace', letterSpacing: '0.02em'
          }}>
            {`منصة الوتين — ${currentRole.icon} ${currentRole.label}`}
          </div>
        </div>
        {/* iFrame */}
        <iframe
          key={iframeKey}
          src={previewUrl}
          style={{ width: '100%', height: 'calc(100% - 34px)', border: 'none', background: '#f8fafc' }}
          title={`Preview: ${currentRole.label}`}
        />
      </div>

    </section>
  )
}
