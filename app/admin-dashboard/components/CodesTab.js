'use client'

import { useState } from 'react'
import { supabase } from '../../../utils/supabase'

export const PRESET_PACKAGES = [
  // باقات الطلاب
  {
    id: 'student_basic_1m',
    category: 'students',
    plan_type: 'student_basic',
    plan_name: 'طالب - باقة التفوق (شهري)',
    duration: 1,
    ai_credits: 20,
    live_minutes: 0,
    price: 60,
    badge: '🎓 التفوق (شهر)',
    color: '#0284c7',
    prefix: 'STD'
  },
  {
    id: 'student_basic_term',
    category: 'students',
    plan_type: 'student_basic',
    plan_name: 'طالب - باقة التفوق (ترم كامل 3 شهور)',
    duration: 3,
    ai_credits: 20,
    live_minutes: 0,
    price: 250,
    badge: '🎓 التفوق (ترم)',
    color: '#0284c7',
    prefix: 'STD'
  },
  {
    id: 'student_basic_year',
    category: 'students',
    plan_type: 'student_basic',
    plan_name: 'طالب - باقة التفوق (سنة كاملة)',
    duration: 12,
    ai_credits: 50,
    live_minutes: 0,
    price: 450,
    badge: '🎓 التفوق (سنة)',
    color: '#0284c7',
    prefix: 'STD'
  },
  {
    id: 'student_vip_1m',
    category: 'students',
    plan_type: 'student_vip',
    plan_name: 'طالب - باقة VIP مع اللايف (شهري)',
    duration: 1,
    ai_credits: 50,
    live_minutes: 1200,
    price: 100,
    badge: '⭐ VIP (شهر)',
    color: '#d97706',
    prefix: 'VIP'
  },
  {
    id: 'student_vip_term',
    category: 'students',
    plan_type: 'student_vip',
    plan_name: 'طالب - باقة VIP مع اللايف (ترم كامل)',
    duration: 3,
    ai_credits: 50,
    live_minutes: 3600,
    price: 400,
    badge: '⭐ VIP (ترم)',
    color: '#d97706',
    prefix: 'VIP'
  },
  {
    id: 'student_vip_year',
    category: 'students',
    plan_type: 'student_vip',
    plan_name: 'طالب - باقة VIP مع اللايف (سنة كاملة)',
    duration: 12,
    ai_credits: 100,
    live_minutes: 15000,
    price: 700,
    badge: '⭐ VIP (سنة)',
    color: '#d97706',
    prefix: 'VIP'
  },

  // كروت شحن رصيد AI
  {
    id: 'ai_100',
    category: 'ai_credits',
    plan_type: 'ai_credits',
    plan_name: 'كارت شحن رصيد AI (100 كريديت)',
    duration: 0,
    ai_credits: 100,
    live_minutes: 0,
    price: 15,
    badge: '💎 100 كريديت',
    color: '#8b5cf6',
    prefix: 'AI'
  },
  {
    id: 'ai_300',
    category: 'ai_credits',
    plan_type: 'ai_credits',
    plan_name: 'كارت شحن رصيد AI (300 كريديت)',
    duration: 0,
    ai_credits: 300,
    live_minutes: 0,
    price: 35,
    badge: '💎 300 كريديت',
    color: '#8b5cf6',
    prefix: 'AI'
  },
  {
    id: 'ai_1000',
    category: 'ai_credits',
    plan_type: 'ai_credits',
    plan_name: 'كارت شحن رصيد AI (1000 كريديت)',
    duration: 0,
    ai_credits: 1000,
    live_minutes: 0,
    price: 80,
    badge: '💎 1000 كريديت',
    color: '#8b5cf6',
    prefix: 'AI'
  },

  // باقات المعلمين
  {
    id: 'teacher_basic_1m',
    category: 'teachers',
    plan_type: 'teacher_basic',
    plan_name: 'معلم - الباقة التفاعلية (شهري)',
    duration: 1,
    ai_credits: 50,
    live_minutes: 0,
    price: 75,
    badge: '👨‍🏫 تفاعلي (شهر)',
    color: '#4338ca',
    prefix: 'TCH'
  },
  {
    id: 'teacher_basic_term',
    category: 'teachers',
    plan_type: 'teacher_basic',
    plan_name: 'معلم - الباقة التفاعلية (ترم كامل)',
    duration: 3,
    ai_credits: 50,
    live_minutes: 0,
    price: 300,
    badge: '👨‍🏫 تفاعلي (ترم)',
    color: '#4338ca',
    prefix: 'TCH'
  },
  {
    id: 'teacher_basic_year',
    category: 'teachers',
    plan_type: 'teacher_basic',
    plan_name: 'معلم - الباقة التفاعلية (سنة كاملة)',
    duration: 12,
    ai_credits: 100,
    live_minutes: 0,
    price: 550,
    badge: '👨‍🏫 تفاعلي (سنة)',
    color: '#4338ca',
    prefix: 'TCH'
  },
  {
    id: 'teacher_pro_1m',
    category: 'teachers',
    plan_type: 'teacher_pro',
    plan_name: 'معلم - باقة برو مع اللايف (شهري)',
    duration: 1,
    ai_credits: 100,
    live_minutes: 1800,
    price: 150,
    badge: '🚀 معلم برو (شهر)',
    color: '#6d28d9',
    prefix: 'PRO'
  },
  {
    id: 'teacher_pro_year',
    category: 'teachers',
    plan_type: 'teacher_pro',
    plan_name: 'معلم - باقة برو مع اللايف (سنة كاملة)',
    duration: 12,
    ai_credits: 200,
    live_minutes: 20000,
    price: 1000,
    badge: '🚀 معلم برو (سنة)',
    color: '#6d28d9',
    prefix: 'PRO'
  },
  {
    id: 'custom',
    category: 'custom',
    plan_type: 'custom',
    plan_name: 'تخصيص يدوي مخصص',
    duration: 1,
    ai_credits: 20,
    live_minutes: 0,
    price: 50,
    badge: '⚙️ مخصص',
    color: '#475569',
    prefix: 'ALJ'
  }
]

export default function CodesTab({ 
  activationCodes = [], 
  codeForm, 
  setCodeForm, 
  handleGenerateCodes, 
  handleDeleteCode,
  fetchData,
  styles 
}) {
  const [selectedPresetId, setSelectedPresetId] = useState('student_basic_1m')
  const [count, setCount] = useState(10)
  const [filterTab, setFilterTab] = useState('all') // all | unused | used | ai_credits | students | teachers
  const [searchQuery, setSearchQuery] = useState('')
  const [customForm, setCustomForm] = useState({
    duration: 1,
    ai_credits: 20,
    live_minutes: 0,
    price: 60,
    plan_name: 'باقة مخصصة',
    plan_type: 'student_basic',
    target_role: 'student',
    prefix: 'ALJ'
  })
  const [generating, setGenerating] = useState(false)
  const [printMode, setPrintMode] = useState(false)

  const selectedPreset = PRESET_PACKAGES.find(p => p.id === selectedPresetId) || PRESET_PACKAGES[0]
  const isCustom = selectedPresetId === 'custom'

  const handlePresetChange = (e) => {
    const pId = e.target.value
    setSelectedPresetId(pId)
    const p = PRESET_PACKAGES.find(pkg => pkg.id === pId)
    if (p && p.id !== 'custom') {
      setCustomForm({
        duration: p.duration,
        ai_credits: p.ai_credits,
        live_minutes: p.live_minutes,
        price: p.price,
        plan_name: p.plan_name,
        plan_type: p.plan_type,
        target_role: p.category === 'teachers' ? 'teacher' : 'student',
        prefix: p.prefix
      })
    }
  }

  const onGenerateSubmit = async (e) => {
    e.preventDefault()
    setGenerating(true)
    const pkg = isCustom ? customForm : selectedPreset
    const payload = {
      count: parseInt(count, 10) || 10,
      duration: isCustom ? parseInt(customForm.duration, 10) : pkg.duration,
      ai_credits: isCustom ? parseInt(customForm.ai_credits, 10) : pkg.ai_credits,
      live_minutes: isCustom ? parseInt(customForm.live_minutes, 10) : pkg.live_minutes,
      price: isCustom ? parseFloat(customForm.price) : pkg.price,
      plan_name: isCustom ? customForm.plan_name : pkg.plan_name,
      plan_type: isCustom ? customForm.plan_type : pkg.plan_type,
      target_role: isCustom ? customForm.target_role : (pkg.category === 'teachers' ? 'teacher' : 'student'),
      prefix: isCustom ? (customForm.prefix || 'ALJ') : pkg.prefix
    }

    try {
      if (handleGenerateCodes) {
        await handleGenerateCodes(e, payload)
      }
    } finally {
      setGenerating(false)
    }
  }

  // Filter codes
  const filteredCodes = activationCodes.filter(c => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      const matchCode = c.code?.toLowerCase().includes(q)
      const matchUser = c.profiles?.full_name?.toLowerCase().includes(q)
      const matchPlan = c.plan_name?.toLowerCase().includes(q)
      if (!matchCode && !matchUser && !matchPlan) return false
    }

    if (filterTab === 'unused') return !c.is_used
    if (filterTab === 'used') return c.is_used
    if (filterTab === 'ai_credits') return c.plan_type === 'ai_credits' || (c.duration_months === 0 && (c.ai_credits > 0))
    if (filterTab === 'students') return c.target_role === 'student' || c.plan_type?.startsWith('student')
    if (filterTab === 'teachers') return c.target_role === 'teacher' || c.plan_type?.startsWith('teacher')
    return true
  })

  // Statistics
  const unusedCount = activationCodes.filter(c => !c.is_used).length
  const usedCount = activationCodes.filter(c => c.is_used).length
  const totalAICreditsIssued = activationCodes.reduce((sum, c) => sum + (c.ai_credits || 0), 0)

  // Copy unused codes
  const handleCopyUnused = () => {
    const list = filteredCodes.filter(c => !c.is_used)
    if (list.length === 0) {
      alert('لا توجد أكواد غير مستخدمة في القائمة الحالية للنسخ!')
      return
    }
    const text = list.map(c => {
      const plan = c.plan_name || `${c.duration_months} شهر`
      const credits = c.ai_credits ? ` (+${c.ai_credits} 💎)` : ''
      const price = c.price ? ` [${c.price} ج]` : ''
      return `${c.code}  |  ${plan}${credits}${price}`
    }).join('\n')

    navigator.clipboard.writeText(text)
    alert(`✅ تم نسخ ${list.length} كود بنجاح إلى الحافظة!`)
  }

  const handleDelete = async (id) => {
    if (handleDeleteCode) {
      handleDeleteCode(id)
      return
    }
    if (!confirm('هل أنت متأكد من حذف هذا الكود؟')) return
    try {
      const { error } = await supabase.from('activation_codes').delete().eq('id', id)
      if (error) throw error
      alert('تم حذف الكود بنجاح!')
      if (fetchData) fetchData()
    } catch (err) {
      console.error(err)
      alert('حدث خطأ أثناء حذف الكود')
    }
  }

  return (
    <section className={styles.section} style={{ position: 'relative' }}>
      {/* Header */}
      <div className={styles.sectionHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>كروت الشحن وأكواد التفعيل</span>
            <span style={{ fontSize: '0.8rem', background: '#ecfdf5', color: '#059669', padding: '3px 8px', borderRadius: '6px', fontWeight: 'bold' }}>النظام المالي المحدث 2026</span>
          </h2>
          <p>توليد وطباعة كروت اشتراكات الطلاب، كروت المعلمين، وكروت شحن رصيد الذكاء الاصطناعي (AI Credits 💎).</p>
        </div>

        {/* Quick Stats Cards */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ background: '#ffffff', padding: '8px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>جاهزة للبيع والتوزيع</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#16a34a' }}>{unusedCount} كارت</div>
          </div>
          <div style={{ background: '#ffffff', padding: '8px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>مستخدمة ومفعلة</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#dc2626' }}>{usedCount}</div>
          </div>
          <div style={{ background: '#ffffff', padding: '8px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>رصيد AI صادر</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#7c3aed' }}>💎 {totalAICreditsIssued}</div>
          </div>
        </div>
      </div>

      {/* Code Generation Form */}
      <form onSubmit={onGenerateSubmit} style={{
        background: '#ffffff',
        padding: '24px',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        marginBottom: '30px'
      }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>⚡ توليد كروت تفعيل جديدة</span>
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', alignItems: 'flex-start' }}>
          {/* Preset Selector */}
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', color: '#334155', fontSize: '0.9rem' }}>
              نوع الباقة أو الكارت:
            </label>
            <select 
              value={selectedPresetId} 
              onChange={handlePresetChange}
              style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.95rem', fontWeight: 'bold', color: '#0f172a', background: '#f8fafc', outline: 'none' }}
            >
              <optgroup label="🎓 باقات الطلاب (الأسعار الرسمية)">
                <option value="student_basic_1m">طالب - التفوق شهري (60 ج) + 20 كريديت AI</option>
                <option value="student_basic_term">طالب - التفوق ترم 3 شهور (250 ج) + 20 كريديت AI</option>
                <option value="student_basic_year">طالب - التفوق سنة كاملة (450 ج) + 50 كريديت AI</option>
                <option value="student_vip_1m">طالب - VIP مع اللايف شهري (100 ج) + 50 كريديت AI</option>
                <option value="student_vip_term">طالب - VIP مع اللايف ترم (400 ج) + 50 كريديت AI</option>
                <option value="student_vip_year">طالب - VIP مع اللايف سنة (700 ج) + 100 كريديت AI</option>
              </optgroup>
              <optgroup label="💎 كروت شحن رصيد AI فقط">
                <option value="ai_100">كارت شحن 100 كريديت AI (15 ج)</option>
                <option value="ai_300">كارت شحن 300 كريديت AI (35 ج)</option>
                <option value="ai_1000">كارت شحن 1000 كريديت AI (80 ج)</option>
              </optgroup>
              <optgroup label="👨‍🏫 باقات المعلمين">
                <option value="teacher_basic_1m">معلم - التفاعلي شهري (75 ج) + 50 كريديت AI</option>
                <option value="teacher_basic_term">معلم - التفاعلي ترم (300 ج) + 50 كريديت AI</option>
                <option value="teacher_basic_year">معلم - التفاعلي سنة (550 ج) + 100 كريديت AI</option>
                <option value="teacher_pro_1m">معلم - برو لايف شهري (150 ج) + 100 كريديت AI</option>
                <option value="teacher_pro_year">معلم - برو لايف سنة (1,000 ج) + 200 كريديت AI</option>
              </optgroup>
              <optgroup label="⚙️ تخصيص حر">
                <option value="custom">⚙️ إعداد مخصص حر (مدة / كريديتس / سعر يدوياً)</option>
              </optgroup>
            </select>
          </div>

          {/* Count Input */}
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', color: '#334155', fontSize: '0.9rem' }}>
              العدد المطلوب (كم كارت؟):
            </label>
            <input 
              type="number" 
              min="1" 
              max="500" 
              required 
              value={count} 
              onChange={e => setCount(e.target.value)} 
              style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.95rem', outline: 'none' }}
            />
          </div>

          {/* Custom Fields if 'custom' selected */}
          {isCustom && (
            <>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', color: '#334155', fontSize: '0.9rem' }}>
                  مدة الاشتراك (شهور):
                </label>
                <input 
                  type="number" 
                  min="0"
                  value={customForm.duration} 
                  onChange={e => setCustomForm({...customForm, duration: e.target.value})} 
                  style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.95rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', color: '#334155', fontSize: '0.9rem' }}>
                  رصيد AI الإضافي (كريديت):
                </label>
                <input 
                  type="number" 
                  min="0"
                  value={customForm.ai_credits} 
                  onChange={e => setCustomForm({...customForm, ai_credits: e.target.value})} 
                  style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.95rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', color: '#334155', fontSize: '0.9rem' }}>
                  السعر المقترح (ج.م):
                </label>
                <input 
                  type="number" 
                  min="0"
                  value={customForm.price} 
                  onChange={e => setCustomForm({...customForm, price: e.target.value})} 
                  style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.95rem' }}
                />
              </div>
            </>
          )}

          {/* Live Card Preview Banner */}
          <div style={{
            background: isCustom ? '#f1f5f9' : `${selectedPreset.color}15`,
            border: `1.5px dashed ${isCustom ? '#94a3b8' : selectedPreset.color}`,
            borderRadius: '10px',
            padding: '12px 16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>معاينة مميزات الكارت:</div>
            <div style={{ fontWeight: 'bold', color: isCustom ? '#334155' : selectedPreset.color, fontSize: '0.95rem' }}>
              {isCustom ? customForm.plan_name : selectedPreset.plan_name}
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '6px', fontSize: '0.85rem', flexWrap: 'wrap' }}>
              <span style={{ color: '#0f172a' }}>⏳ {isCustom ? customForm.duration : selectedPreset.duration} شهر</span>
              <span style={{ color: '#7c3aed', fontWeight: 'bold' }}>💎 +{isCustom ? customForm.ai_credits : selectedPreset.ai_credits} AI</span>
              <span style={{ color: '#16a34a', fontWeight: 'bold' }}>💰 {isCustom ? customForm.price : selectedPreset.price} ج.م</span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button 
            type="submit" 
            disabled={generating}
            style={{
              padding: '12px 28px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: generating ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              fontSize: '1rem',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
              opacity: generating ? 0.7 : 1
            }}
          >
            {generating ? 'جاري التوليد... ⏳' : `توليد ${count} كود الآن ⚡`}
          </button>
        </div>
      </form>

      {/* Control Bar: Filters & Actions */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '15px',
        marginBottom: '20px'
      }}>
        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: `الكل (${activationCodes.length})` },
            { id: 'unused', label: `جديد ✅ (${unusedCount})` },
            { id: 'used', label: `مستخدم ❌ (${usedCount})` },
            { id: 'students', label: 'أكواد الطلاب 🎓' },
            { id: 'ai_credits', label: 'كروت رصيد AI 💎' },
            { id: 'teachers', label: 'أكواد المعلمين 👨‍🏫' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id)}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: filterTab === tab.id ? '2px solid #3b82f6' : '1px solid #cbd5e1',
                background: filterTab === tab.id ? '#eff6ff' : '#ffffff',
                color: filterTab === tab.id ? '#1d4ed8' : '#475569',
                fontWeight: filterTab === tab.id ? 'bold' : 'normal',
                cursor: 'pointer',
                fontSize: '0.85rem'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="بحث بالكود أو الطالب أو الباقة..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.85rem',
              outline: 'none',
              width: '200px'
            }}
          />

          <button 
            onClick={handleCopyUnused}
            style={{
              padding: '8px 14px',
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              color: '#334155',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '0.85rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
            title="نسخ جميع الأكواد غير المستخدمة لمشاركتها عبر الواتساب"
          >
            📋 نسخ الجاهزة
          </button>

          <button 
            onClick={() => setPrintMode(!printMode)}
            style={{
              padding: '8px 16px',
              background: printMode ? '#ef4444' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '0.85rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            {printMode ? 'إلغاء وضع الطباعة ✖' : 'طباعة كروت الشحن 🖨️'}
          </button>
        </div>
      </div>

      {/* PRINT VIEW: Cards Grid for Physical Print */}
      {printMode && (
        <div style={{
          background: '#ffffff',
          padding: '24px',
          borderRadius: '16px',
          border: '2px dashed #3b82f6',
          marginBottom: '30px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ margin: 0, color: '#1e293b' }}>معاينة كروت الشحن للطباعة ({filteredCodes.filter(c => !c.is_used).length} كارت جاهز)</h3>
              <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>اضغط على "طباعة الآن" لطباعة كروت مقطعة وجاهزة للبيع والتوزيع على الطلاب والمكتبات.</p>
            </div>
            <button 
              onClick={() => window.print()}
              style={{
                padding: '10px 20px',
                background: '#16a34a',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '0.95rem'
              }}
            >
              طباعة الآن فوراً 🖨️
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '16px'
          }}>
            {filteredCodes.filter(c => !c.is_used).map(c => {
              const isAICard = c.plan_type === 'ai_credits' || (c.duration_months === 0 && (c.ai_credits > 0))
              const isVIP = c.plan_type === 'student_vip'
              return (
                <div key={c.id} style={{
                  border: '2px solid #0f172a',
                  borderRadius: '12px',
                  padding: '16px',
                  background: isAICard ? '#f5f3ff' : isVIP ? '#fffbeb' : '#f0fdf4',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px', marginBottom: '10px' }}>
                    <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>منصة الجُنيدي التعليمية</strong>
                    <span style={{ fontSize: '0.8rem', background: '#0f172a', color: '#fff', padding: '2px 8px', borderRadius: '4px' }}>
                      {c.price ? `${c.price} ج.م` : 'اشتراك رسمي'}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '6px' }}>
                    نوع الكارت: <strong>{c.plan_name || (c.duration_months ? `اشتراك ${c.duration_months} شهر` : 'رصيد ذكاء اصطناعي')}</strong>
                  </div>

                  {c.ai_credits > 0 && (
                    <div style={{ fontSize: '0.85rem', color: '#7c3aed', fontWeight: 'bold', marginBottom: '8px' }}>
                      💎 رصيد الذكاء المرفق: +{c.ai_credits} كريديت
                    </div>
                  )}

                  <div style={{
                    background: '#ffffff',
                    border: '1.5px dashed #0f172a',
                    padding: '8px',
                    borderRadius: '8px',
                    textAlign: 'center',
                    fontFamily: 'monospace',
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                    letterSpacing: '2px',
                    color: '#0f172a',
                    margin: '10px 0'
                  }}>
                    {c.code}
                  </div>

                  <div style={{ fontSize: '0.7rem', color: '#64748b', textAlign: 'center' }}>
                    ادخل هذا الكود في خانة "تفعيل الاشتراك" في حسابك على المنصة
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Main Codes Table */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>الكود</th>
              <th>نوع الباقة / الكارت</th>
              <th>المدة</th>
              <th>رصيد AI 💎</th>
              <th>السعر</th>
              <th>الحالة</th>
              <th>مُستخدم بواسطة</th>
              <th>تاريخ الاستخدام</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredCodes.map(c => {
              const isAICard = c.plan_type === 'ai_credits' || (c.duration_months === 0 && (c.ai_credits > 0))
              const isVIP = c.plan_type === 'student_vip'
              const isTeacher = c.target_role === 'teacher' || c.plan_type?.startsWith('teacher')

              return (
                <tr key={c.id}>
                  <td dir="ltr" style={{fontFamily: 'monospace', fontSize: '1.1rem', letterSpacing: '1px', fontWeight: 'bold', color: c.is_used ? '#94a3b8' : '#0f172a'}}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>{c.code}</span>
                      {!c.is_used && (
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(c.code)
                            alert(`تم نسخ الكود: ${c.code}`)
                          }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}
                          title="نسخ الكود"
                        >
                          📋
                        </button>
                      )}
                    </div>
                  </td>
                  <td>
                    {isAICard ? (
                      <span style={{ color: '#7c3aed', fontWeight: 'bold', background: '#f5f3ff', padding: '3px 8px', borderRadius: '6px', fontSize: '0.85rem' }}>
                        💎 كارت رصيد ذكاء
                      </span>
                    ) : isVIP ? (
                      <span style={{ color: '#b45309', fontWeight: 'bold', background: '#fef3c7', padding: '3px 8px', borderRadius: '6px', fontSize: '0.85rem' }}>
                        ⭐ VIP مع اللايف
                      </span>
                    ) : isTeacher ? (
                      <span style={{ color: '#4338ca', fontWeight: 'bold', background: '#e0e7ff', padding: '3px 8px', borderRadius: '6px', fontSize: '0.85rem' }}>
                        👨‍🏫 {c.plan_name || 'معلم'}
                      </span>
                    ) : (
                      <span style={{ color: '#0369a1', fontWeight: 'bold', background: '#e0f2fe', padding: '3px 8px', borderRadius: '6px', fontSize: '0.85rem' }}>
                        🎓 {c.plan_name || 'طالب التفوق'}
                      </span>
                    )}
                  </td>
                  <td>
                    {c.duration_months ? `${c.duration_months} شهر` : <span style={{ color: '#64748b' }}>رصيد فوري</span>}
                  </td>
                  <td>
                    {c.ai_credits > 0 ? (
                      <strong style={{ color: '#7c3aed' }}>+{c.ai_credits} 💎</strong>
                    ) : (
                      <span style={{ color: '#94a3b8' }}>-</span>
                    )}
                  </td>
                  <td>
                    {c.price ? <strong>{c.price} ج</strong> : <span style={{ color: '#94a3b8' }}>-</span>}
                  </td>
                  <td>
                    {c.is_used ? (
                      <span style={{color: '#ef4444', fontWeight: 'bold', background: '#fee2e2', padding: '2px 8px', borderRadius: '6px', fontSize: '0.8rem'}}>
                        مُستخدم ❌
                      </span>
                    ) : (
                      <span style={{color: '#16a34a', fontWeight: 'bold', background: '#dcfce7', padding: '2px 8px', borderRadius: '6px', fontSize: '0.8rem'}}>
                        جديد متاح ✅
                      </span>
                    )}
                  </td>
                  <td>{c.is_used ? (c.profiles?.full_name || 'مستخدم مسجل') : '-'}</td>
                  <td dir="ltr" style={{ fontSize: '0.8rem' }}>
                    {c.is_used && c.used_at ? new Date(c.used_at).toLocaleDateString('ar-EG') : '-'}
                  </td>
                  <td>
                    {!c.is_used && (
                      <button 
                        onClick={() => handleDelete(c.id)}
                        style={{
                          background: '#fef2f2',
                          color: '#dc2626',
                          border: '1px solid #fecaca',
                          borderRadius: '6px',
                          padding: '4px 8px',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                        title="حذف هذا الكود"
                      >
                        حذف 🗑
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
            {filteredCodes.length === 0 && (
              <tr>
                <td colSpan="9" className={styles.emptyState}>لا توجد أكواد مطابقة للتصفية الحالية</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
