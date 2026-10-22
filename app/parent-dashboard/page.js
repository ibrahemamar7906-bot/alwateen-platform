'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../utils/supabase'
import styles from '../student-dashboard/page.module.css'
import { BarChart2, Award, MessageCircle, AlertTriangle, CheckCircle2, X, Star } from 'lucide-react'
import CertificateModal from '../kids-corner/components/CertificateModal'

const ARABIC_ALPHABET = ['أ', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'هـ', 'و', 'ي']

export default function ParentDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [parent, setParent] = useState(null)
  const [children, setChildren] = useState([])
  
  // Link student state
  const [studentCode, setStudentCode] = useState('')
  const [linkError, setLinkError] = useState('')
  const [linkSuccess, setLinkSuccess] = useState('')

  // Skills radar & certificate modal states
  const [activeSkillChild, setActiveSkillChild] = useState(null)
  const [childMistakes, setChildMistakes] = useState([])
  const [loadingMistakes, setLoadingMistakes] = useState(false)
  const [activeCertChild, setActiveCertChild] = useState(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile?.role !== 'parent') {
        router.push('/')
        return
      }

      setParent({
        id: user.id,
        name: profile.full_name,
      })

      await fetchChildren(user.id)

    } catch (error) {
      console.error("Dashboard error:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchChildren = async (parentId) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('parent_id', parentId)
    
    if (data) {
      setChildren(data)
    }
  }

  const handleLinkStudent = async (e) => {
    e.preventDefault()
    setLinkError('')
    setLinkSuccess('')
    
    if (!studentCode.trim()) return

    try {
      const { data: student, error: searchError } = await supabase
        .from('profiles')
        .select('id, full_name, parent_id')
        .eq('student_code', studentCode.trim())
        .single()

      if (searchError || !student) {
        setLinkError('كود الطالب غير صحيح. يرجى التأكد منه.')
        return
      }

      if (student.parent_id) {
        if (student.parent_id === parent.id) {
          setLinkError('هذا الطالب مربوط بحسابك بالفعل!')
        } else {
          setLinkError('هذا الطالب مربوط بحساب ولي أمر آخر.')
        }
        return
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ parent_id: parent.id })
        .eq('id', student.id)

      if (updateError) throw updateError

      setLinkSuccess(`تم ربط حساب الطالب (${student.full_name}) بنجاح!`)
      setStudentCode('')
      
      await fetchChildren(parent.id)
      
    } catch (err) {
      console.error(err)
      setLinkError('حدث خطأ أثناء محاولة ربط الحساب.')
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const openSkillModal = async (child) => {
    setActiveSkillChild(child)
    setLoadingMistakes(true)
    try {
      const { data, error } = await supabase
        .from('student_performance')
        .select('*')
        .eq('user_id', child.id)
        .order('created_at', { ascending: false })
        .limit(6)
      if (!error && data) {
        setChildMistakes(data)
      } else {
        setChildMistakes([])
      }
    } catch(err) {
      console.warn('Error fetching mistakes:', err)
      setChildMistakes([])
    } finally {
      setLoadingMistakes(false)
    }
  }

  const sendWhatsAppReport = (child) => {
    const points = child.points || 0
    const masteredCount = Math.min(28, Math.floor(points / 25))
    const percentage = Math.min(100, Math.round((masteredCount / 28) * 100))
    const text = `🌟 *تقرير متابعة الطالب من منصة المستر إبراهيم عمار*
👤 *الاسم:* ${child.full_name}
📚 *المرحلة:* ${child.stage === 'primary_1' ? 'الصف الأول الابتدائي' : child.stage === 'primary_2' ? 'الصف الثاني الابتدائي' : child.stage || 'مرحلة التأسيس'}
⚡ *نقاط الخبرة:* ${points} XP
🔥 *الحماس اليومي:* ${child.streak_count || 1} أيام متتالية
🔤 *الحروف المتقنة:* ${masteredCount} من ٢٨ حرفاً (${percentage}%)
🏆 *حالة التأسيس:* ${points > 100 ? 'متقدم ومتميز 🌟' : 'قيد التدريب 🚀'}
مع خالص تحيات المستر إبراهيم عمار 👨‍🏫`
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  if (loading) {
    return (
      <div className={styles.dashboard}>
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100dvh', width: '100%'}}>
          <h2>جاري تحميل بياناتك...</h2>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.dashboard}>
      {/* Sidebar - Inherits Glassmorphism from student dashboard */}
      <aside className={styles.sidebar}>
        <div className={styles.userInfo}>
          <div className={styles.avatar} style={{background: 'var(--primary-gradient)'}}>👨‍👩‍👦</div>
          <h3 style={{color: 'white'}}>{parent?.name}</h3>
          <p style={{color: 'rgba(255,255,255,0.8)'}}>بوابة ولي الأمر</p>
        </div>
        <nav className={styles.nav}>
          <button className={styles.active} style={{width:'100%', padding:'15px', textAlign:'right', background:'none', border:'none', color:'white', cursor:'pointer', fontSize:'1.1rem', fontWeight:'bold', borderRight: '4px solid var(--primary-light)'}}>الرئيسية</button>
          <button onClick={handleLogout} className={styles.logoutBtn} style={{width:'100%', padding:'15px', textAlign:'right', border:'none', background:'none', cursor:'pointer', fontSize:'1.1rem', fontWeight:'bold', color:'#fca5a5'}}>تسجيل الخروج</button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        <header className={styles.header}>
          <h1>مرحباً بك في بوابة ولي الأمر 👋</h1>
          <p>تابع مستوى أبنائك الأكاديمي، درجاتهم، ومدى التزامهم بالمقررات بكل سهولة.</p>
        </header>

        {/* Link New Student Section */}
        <section className={styles.gradesSection} style={{marginBottom: '30px'}}>
          <h2 style={{color: 'var(--primary-dark)', marginBottom: '15px'}}>🔗 ربط حساب طالب جديد</h2>
          <p style={{color: 'var(--text-muted)', marginBottom: '15px'}}>يرجى إدخال "كود الطالب" الموجود في إعدادات حساب ابنك لربطه بحسابك.</p>
          
          <form onSubmit={handleLinkStudent} style={{display: 'flex', gap: '15px', flexWrap: 'wrap'}}>
            <input 
              type="text" 
              placeholder="مثال: JND-XXXXX" 
              value={studentCode}
              onChange={(e) => setStudentCode(e.target.value.toUpperCase())}
              style={{flex: 1, minWidth: '250px', padding: '15px', border: 'var(--glass-border)', borderRadius: 'var(--radius-md)', fontSize: '1rem', letterSpacing: '1px', background: 'rgba(255,255,255,0.5)', outline: 'none'}}
              required
            />
            <button type="submit" className="btn-primary" style={{padding: '12px 30px', fontSize: '1rem', whiteSpace: 'nowrap'}}>
              ربط الحساب
            </button>
          </form>
          {linkError && <p style={{color: '#ef4444', marginTop: '15px', fontWeight: 'bold'}}>{linkError}</p>}
          {linkSuccess && <p style={{color: '#10b981', marginTop: '15px', fontWeight: 'bold'}}>{linkSuccess}</p>}
        </section>

        {/* Children Progress Grid */}
        <section>
          <h2 style={{color: 'var(--primary-dark)', marginBottom: '25px', fontSize: '1.8rem'}}>👥 الأبناء المربوطين بحسابك</h2>
          
          {children.length === 0 ? (
            <div className={styles.courseCard} style={{textAlign: 'center', padding: '60px'}}>
              <div style={{fontSize: '4rem', marginBottom: '15px'}}>👤</div>
              <p style={{fontSize: '1.2rem', color: 'var(--text-muted)'}}>لم تقم بربط أي طالب بعد. استخدم النموذج أعلاه لربط حساب ابنك.</p>
            </div>
          ) : (
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '30px'}}>
              {children.map(child => {
                const now = new Date();
                const subEnd = child.subscription_end_date ? new Date(child.subscription_end_date) : null;
                const isPremium = child.status === 'approved' && subEnd && subEnd > now;
                const daysLeft = subEnd ? Math.ceil((subEnd - now) / (1000 * 60 * 60 * 24)) : null;
                const points = child.points || 0;
                
                // Calculate progress for level
                const nextLevelThreshold = points < 500 ? 500 : points < 1000 ? 1000 : points < 2000 ? 2000 : points;
                const progressPercentage = Math.min(100, (points / nextLevelThreshold) * 100);

                return (
                  <div key={child.id} className={styles.courseCard} style={{padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column'}}>
                    <div style={{background: 'var(--primary-gradient)', color: 'white', padding: '25px', textAlign: 'center', position: 'relative'}}>
                      <h3 style={{margin: '0 0 5px 0', fontSize: '1.5rem', color: 'white'}}>{child.full_name}</h3>
                      <p style={{margin: 0, opacity: 0.9, fontSize: '1rem'}}>
                        {child.stage === 'primary_1' ? 'الصف الأول الابتدائي' :
                         child.stage === 'primary_2' ? 'الصف الثاني الابتدائي' :
                         child.stage === 'prep_1' ? 'الصف الأول الإعدادي' :
                         child.stage === 'sec_1' ? 'الصف الأول الثانوي' :
                         child.stage === 'sec_3' ? 'الثانوية العامة' : child.stage}
                      </p>
                    </div>
                    
                    <div style={{padding: '25px', flex: 1, display: 'flex', flexDirection: 'column'}}>
                      
                      {/* Points & Level */}
                      <div style={{background: 'rgba(255,255,255,0.5)', padding: '15px', borderRadius: 'var(--radius-md)', marginBottom: '20px', border: 'var(--glass-border)'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
                          <span style={{fontWeight: 'bold', color: 'var(--primary-dark)'}}>المستوى: {child.level || 'مبتدئ'}</span>
                          <span style={{fontWeight: 'bold', color: '#d97706'}}>🌟 {points}</span>
                        </div>
                        <div style={{background: 'rgba(5, 150, 105, 0.1)', height: '8px', borderRadius: '4px', overflow: 'hidden'}}>
                          <div style={{
                            height: '100%', 
                            background: 'var(--primary-gradient)', 
                            width: `${progressPercentage}%`,
                            transition: 'width 0.5s ease'
                          }}></div>
                        </div>
                      </div>

                      {/* Gamification Stats: Streak & XP */}
                      <div style={{display: 'flex', gap: '10px', marginBottom: '15px'}}>
                        <div style={{flex: 1, background: '#fff7ed', border: '1px solid #fdba74', padding: '10px', borderRadius: '12px', textAlign: 'center'}}>
                          <div style={{fontSize: '0.8rem', color: '#c2410c', fontWeight: 'bold'}}>🔥 الحماس اليومي</div>
                          <div style={{fontSize: '1.1rem', fontWeight: 900, color: '#ea580c'}}>{child.streak_count || 1} أيام</div>
                        </div>
                        <div style={{flex: 1, background: '#f0fdf4', border: '1px solid #86efac', padding: '10px', borderRadius: '12px', textAlign: 'center'}}>
                          <div style={{fontSize: '0.8rem', color: '#15803d', fontWeight: 'bold'}}>⚡ نقاط الخبرة</div>
                          <div style={{fontSize: '1.1rem', fontWeight: 900, color: '#16a34a'}}>{points} XP</div>
                        </div>
                      </div>

                      {/* Details */}
                      <div style={{display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', marginBottom: '12px', borderBottom: '1px solid rgba(5,150,105,0.1)'}}>
                        <span style={{color: 'var(--text-muted)'}}>حالة الاشتراك</span>
                        <strong style={{color: isPremium ? '#059669' : '#dc2626'}}>
                          {isPremium ? 'مفعل ✅' : 'غير مفعل ❌'}
                        </strong>
                      </div>
                      
                      {isPremium && daysLeft !== null && (
                        <div style={{display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', marginBottom: '12px', borderBottom: '1px solid rgba(5,150,105,0.1)'}}>
                          <span style={{color: 'var(--text-muted)'}}>ينتهي بعد</span>
                          <strong style={{color: daysLeft <= 3 ? '#dc2626' : 'var(--primary-dark)'}}>{daysLeft} يوم</strong>
                        </div>
                      )}

                      <div style={{display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', marginBottom: '15px'}}>
                        <span style={{color: 'var(--text-muted)'}}>التفاعل مع المسار</span>
                        <strong style={{color: '#059669'}}>
                          {points > 0 ? 'نشط ومستمر 🚀' : 'في انتظار البدء ⏳'}
                        </strong>
                      </div>

                      {/* Action Buttons */}
                      <div style={{marginTop: 'auto', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px'}}>
                        {/* Skills Radar & Certificate Row */}
                        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px'}}>
                          <button
                            onClick={() => openSkillModal(child)}
                            style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                              padding: '10px 8px', background: 'rgba(5, 150, 105, 0.08)', border: '1.5px solid #059669',
                              borderRadius: '12px', color: '#064e3b', fontWeight: 800, fontSize: '0.84rem', cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <BarChart2 size={16} />
                            <span>رادار المهارات</span>
                          </button>

                          <button
                            onClick={() => setActiveCertChild(child)}
                            style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                              padding: '10px 8px', background: 'linear-gradient(135deg, #fefce8, #fef08a)', border: '1.5px solid #facc15',
                              borderRadius: '12px', color: '#854d0e', fontWeight: 800, fontSize: '0.84rem', cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <Award size={16} />
                            <span>شهادة التميز</span>
                          </button>
                        </div>

                        {/* WhatsApp Instant Report */}
                        <button
                          onClick={() => sendWhatsAppReport(child)}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%',
                            padding: '10px 14px', background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)', border: 'none',
                            borderRadius: '12px', color: 'white', fontWeight: 800, fontSize: '0.88rem', cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(37, 211, 102, 0.25)', boxSizing: 'border-box'
                          }}
                        >
                          <MessageCircle size={16} />
                          <span>مشاركة تقرير المتابعة على واتساب 📲</span>
                        </button>

                        {/* Contact Teacher */}
                        <a 
                          href={`https://wa.me/201507952002?text=مرحباً أ. إبراهيم عمار، أنا ولي أمر الطالب (${child.full_name}) وأود الاستفسار عن مستواه في المنصة.`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%',
                            padding: '10px 14px', background: 'rgba(255, 255, 255, 0.85)', border: '1px solid #cbd5e1',
                            borderRadius: '12px', color: '#475569', textDecoration: 'none', fontWeight: 700, fontSize: '0.84rem',
                            boxSizing: 'border-box'
                          }}
                        >
                          💬 استفسار مباشر من المعلم
                        </a>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </main>

      {/* ══════════════════════════════
          SKILLS MASTERY RADAR MODAL
      ══════════════════════════════ */}
      {activeSkillChild && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'clamp(12px, 3vw, 24px)',
          zIndex: 1000,
          animation: 'fadeIn 0.25s ease'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            maxWidth: '580px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: 'clamp(20px, 4vw, 32px)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            border: '2px solid rgba(5, 150, 105, 0.2)',
            position: 'relative'
          }}>
            {/* Close Button */}
            <button
              onClick={() => setActiveSkillChild(null)}
              style={{
                position: 'absolute', top: '16px', left: '16px',
                background: 'rgba(0,0,0,0.06)', border: 'none', borderRadius: '50%',
                width: '36px', height: '36px', display: 'flex', alignItems: 'center',
                justifyContent: 'center', cursor: 'pointer'
              }}
            >
              <X size={18} color="#475569" />
            </button>

            {/* Modal Header */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '6px' }}>📊</div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#064e3b', margin: '0 0 4px 0' }}>
                رادار إتقان المهارات والأبجدية
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0, fontWeight: 600 }}>
                تقرير الطالب: <strong style={{ color: '#059669' }}>{activeSkillChild.full_name}</strong>
              </p>
            </div>

            {/* Mastery Progress Bar */}
            {(() => {
              const points = activeSkillChild.points || 0
              const masteredCount = Math.min(28, Math.floor(points / 25))
              const percentage = Math.min(100, Math.round((masteredCount / 28) * 100))
              return (
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '16px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 800, color: '#1e293b', fontSize: '0.9rem' }}>نسبة إتقان الحروف الأبجدية:</span>
                    <strong style={{ color: '#059669', fontSize: '1.1rem' }}>{masteredCount} من ٢٨ ({percentage}%)</strong>
                  </div>
                  <div style={{ background: '#e2e8f0', height: '10px', borderRadius: '6px', overflow: 'hidden' }}>
                    <div style={{ width: `${percentage}%`, height: '100%', background: 'linear-gradient(90deg, #10b981, #059669)', transition: 'width 0.6s ease' }} />
                  </div>
                </div>
              )
            })()}

            {/* 28 Letters Matrix */}
            <div style={{ marginBottom: '22px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🔤 شبكة الحروف الهجائية (٢٨ حرفاً):</span>
              </h3>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '8px',
                textAlign: 'center'
              }}>
                {ARABIC_ALPHABET.map((letter, idx) => {
                  const points = activeSkillChild.points || 0
                  const isMastered = points >= (idx + 1) * 25
                  const isInProgress = !isMastered && points >= idx * 25

                  let bg = '#f1f5f9'
                  let border = '#cbd5e1'
                  let color = '#94a3b8'

                  if (isMastered) {
                    bg = '#dcfce7'
                    border = '#86efac'
                    color = '#15803d'
                  } else if (isInProgress) {
                    bg = '#fef3c7'
                    border = '#fde047'
                    color = '#854d0e'
                  }

                  return (
                    <div
                      key={idx}
                      style={{
                        background: bg,
                        border: `1.5px solid ${border}`,
                        borderRadius: '10px',
                        padding: '8px 4px',
                        fontWeight: 900,
                        fontSize: '1.1rem',
                        color,
                        boxShadow: isMastered ? '0 2px 6px rgba(22, 163, 74, 0.15)' : 'none'
                      }}
                    >
                      {letter}
                    </div>
                  )
                })}
              </div>

              {/* Legend */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '12px', fontSize: '0.78rem', fontWeight: 700 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#166534' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} /> متقن
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#854d0e' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#eab308', display: 'inline-block' }} /> قيد التدريب
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#cbd5e1', display: 'inline-block' }} /> لم يبدأ
                </span>
              </div>
            </div>

            {/* Weak Spots & Remediation Alert */}
            <div style={{
              background: '#fffbeb',
              border: '1.5px solid #fde68a',
              borderRadius: '16px',
              padding: '14px 16px',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b45309', fontWeight: 800, fontSize: '0.92rem', marginBottom: '8px' }}>
                <AlertTriangle size={18} />
                <span>التدريب العلاجي والمتابعة الذكية:</span>
              </div>
              
              {loadingMistakes ? (
                <p style={{ fontSize: '0.84rem', color: '#78350f', margin: 0 }}>جاري فحص سجل أداء الطالب...</p>
              ) : childMistakes.length > 0 ? (
                <div>
                  <p style={{ fontSize: '0.84rem', color: '#78350f', margin: '0 0 10px 0' }}>
                    سجل النظام بعض المحاولات التي تحتاج تثبيتاً في:
                  </p>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                    {childMistakes.map((m, mIdx) => (
                      <span key={mIdx} style={{ background: '#fef3c7', border: '1px solid #f59e0b', padding: '3px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 800, color: '#92400e' }}>
                        {m.mistake_item || m.game_name}
                      </span>
                    ))}
                  </div>
                  <a
                    href={`/kids-corner/tracing`}
                    style={{
                      display: 'inline-block',
                      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                      color: 'white',
                      textDecoration: 'none',
                      padding: '8px 16px',
                      borderRadius: '10px',
                      fontSize: '0.84rem',
                      fontWeight: 800
                    }}
                  >
                    🎯 فتح السبورة التفاعلية للتدريب
                  </a>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#15803d', fontSize: '0.86rem', fontWeight: 700 }}>
                  <CheckCircle2 size={16} />
                  <span>ممتاز! لا توجد أخطاء مسجلة، استيعاب الطالب عالي ومستمر.</span>
                </div>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={() => setActiveSkillChild(null)}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                color: 'white',
                border: 'none',
                padding: '12px',
                borderRadius: '14px',
                fontWeight: 800,
                fontSize: '0.95rem',
                cursor: 'pointer'
              }}
            >
              إغلاق التقرير ✅
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════
          CHILD CERTIFICATE PREVIEW
      ══════════════════════════════ */}
      {activeCertChild && (
        <CertificateModal
          isOpen={!!activeCertChild}
          onClose={() => setActiveCertChild(null)}
          studentName={activeCertChild.full_name}
          subjectTitle={activeCertChild.stage === 'primary_1' ? 'الصف الأول الابتدائي' : activeCertChild.stage === 'primary_2' ? 'الصف الثاني الابتدائي' : 'تأسيس اللغة العربية'}
          scoreOrXp={activeCertChild.points || 150}
          badgeName="بطل التأسيس والقراءة 🌟"
        />
      )}
    </div>
  )
}
