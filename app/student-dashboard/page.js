'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../utils/supabase'
import { Menu, X, Gamepad2, MonitorPlay, Presentation, BrainCircuit, Sparkles, Bot, Zap, Search } from 'lucide-react'
import StudentSearchModal from './components/StudentSearchModal'
import styles from './page.module.css'
import StudentCommunityTab from './components/StudentCommunityTab'
// AI Tutor removed

export default function StudentDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [student, setStudent] = useState(null)
  const [courses, setCourses] = useState([])
  const [lessons, setLessons] = useState([])
  const [recentGrades, setRecentGrades] = useState([])
  const [activeTab, setActiveTab] = useState('home') // home, courses, grades, settings
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  // Settings state
  const [settingsForm, setSettingsForm] = useState({ full_name: '', phone: '' })
  const [settingsMessage, setSettingsMessage] = useState('')

  // Notifications state
  const [notifications, setNotifications] = useState([])
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false)

  // Activation state
  const [showActivationModal, setShowActivationModal] = useState(false)
  const [activationCode, setActivationCode] = useState('')
  const [activationMessage, setActivationMessage] = useState('')
  const [activationLoading, setActivationLoading] = useState(false)

  const formatCredits = (c) => Number(c ?? 20).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })

  // Keyboard shortcut Ctrl+K / Cmd+K to open search
  useEffect(() => {
    const handleSearchShortcut = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault()
        setIsSearchOpen(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleSearchShortcut)
    return () => window.removeEventListener('keydown', handleSearchShortcut)
  }, [])

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user) {
          router.push('/login')
          return
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileError) {
          console.error("Error fetching profile:", profileError)
          setStudent({
            id: user.id,
            name: user.user_metadata?.full_name || 'طالب',
            phone: user.user_metadata?.phone || '',
            stage: user.user_metadata?.stage || 'غير محدد',
            isPremium: false
          })
          setSettingsForm({ full_name: user.user_metadata?.full_name || '', phone: user.user_metadata?.phone || '' })
        } else {
          const now = new Date()
          const subEndDate = profile.subscription_end_date ? new Date(profile.subscription_end_date) : null
          const isStillPremium = profile.status === 'approved' && subEndDate && subEndDate > now

          let daysLeft = null;
          if (subEndDate) {
            daysLeft = Math.ceil((subEndDate - now) / (1000 * 60 * 60 * 24));
          }

          setStudent({
            id: user.id,
            name: profile.full_name,
            phone: profile.phone,
            stage: profile.stage,
            status: profile.status,
            isPremium: isStillPremium,
            planType: profile.plan_type || (isStillPremium ? 'student_basic' : 'free'),
            hasLive: !!profile.has_live || profile.plan_type === 'student_vip',
            subscriptionEndDate: profile.subscription_end_date,
            aiCredits: profile.ai_credits_balance ?? 20,
            daysLeft: daysLeft,
            points: profile.points || 0,
            level: profile.level || 'مبتدئ',
            badges: profile.badges || [],
            studentCode: profile.student_code || 'لم يتم التوليد بعد'
          })
          setSettingsForm({ full_name: profile.full_name, phone: profile.phone })
        }

        let stageToFetch = profile?.stage || user.user_metadata?.stage
        
        // TAB & ADMIN PREVIEW MODE OVERRIDE
        const searchParams = new URLSearchParams(window.location.search)
        const tabParam = searchParams.get('tab')
        if (tabParam && ['home', 'courses', 'community', 'grades', 'settings'].includes(tabParam)) {
          setActiveTab(tabParam)
        }

        const previewStage = searchParams.get('preview_stage')
        if (profile?.role === 'admin' && previewStage) {
          stageToFetch = previewStage
          setStudent({
            id: user.id,
            name: "المعلم (وضع المعاينة)",
            phone: profile.phone,
            stage: previewStage,
            status: 'approved',
            isPremium: true,
            subscriptionEndDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
            daysLeft: 365,
            points: 1000,
            level: 'خبير',
            badges: [],
            studentCode: 'PREVIEW',
            aiCredits: 9999
          })
        }

        if (stageToFetch) {
          // Fetch Courses for this stage
          const { data: coursesData } = await supabase
            .from('courses')
            .select('*')
            .or(`stage.eq.${stageToFetch},stage.eq.all`)
            .order('created_at', { ascending: false })
          
          if (coursesData) setCourses(coursesData)

          // Fetch Lessons for this stage (standalone or generally)
          const { data: lessonsData } = await supabase
            .from('lessons')
            .select('*')
            .or(`stage.eq.${stageToFetch},stage.eq.all`)
            .order('created_at', { ascending: false })

          if (lessonsData) {
            const filteredLessons = lessonsData.filter(l => {
              if (!l.allowed_stages || l.allowed_stages.length === 0) return true;
              return l.allowed_stages.includes(stageToFetch);
            })
            setLessons(filteredLessons)
          }
        }

        // Fetch Notifications
        const { data: notifs } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10)
        
        if (notifs) {
          setNotifications(notifs)
        }

      } catch (error) {
        console.error("Dashboard error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [router])

  const toggleNotifications = async () => {
    const newStatus = !showNotificationsDropdown;
    setShowNotificationsDropdown(newStatus);
    
    // Mark as read when opening
    if (newStatus && notifications.some(n => !n.is_read)) {
      try {
        await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('user_id', student.id)
          .eq('is_read', false)
        
        setNotifications(prev => prev.map(n => ({...n, is_read: true})))
      } catch (err) {
        console.error("Error marking notifications as read", err)
      }
    }
  }

  const handleLogout = async (e) => {
    e.preventDefault()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleUpdateSettings = async (e) => {
    e.preventDefault()
    setSettingsMessage('جاري التحديث...')
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: settingsForm.full_name, phone: settingsForm.phone })
        .eq('id', student.id)

      if (error) throw error

      setStudent(prev => ({ ...prev, name: settingsForm.full_name, phone: settingsForm.phone }))
      setSettingsMessage('تم تحديث البيانات بنجاح ✅')
      setTimeout(() => setSettingsMessage(''), 3000)
    } catch (err) {
      console.error(err)
      setSettingsMessage('حدث خطأ أثناء التحديث ❌')
    }
  }

  const handleActivateCode = async (e) => {
    e.preventDefault()
    if (!activationCode.trim()) return
    setActivationLoading(true)
    setActivationMessage('')

    try {
      const { data, error } = await supabase.rpc('redeem_activation_code', {
        p_code: activationCode.trim()
      })

      if (error) throw error

      if (!data || !data.success) {
        setActivationMessage(`❌ ${data?.message || 'الكود غير صحيح أو مستخدم من قبل.'}`)
        setActivationLoading(false)
        return
      }

      const isCreditOnly = data.is_credit_only || !data.subscription_end_date
      const now = new Date()
      const newEndDate = data.subscription_end_date ? new Date(data.subscription_end_date) : null

      setActivationMessage(`✅ ${data.message}`)
      
      // Update local state
      setStudent(prev => ({
        ...prev,
        status: isCreditOnly ? prev.status : 'approved',
        isPremium: isCreditOnly ? prev.isPremium : true,
        planType: data.plan_type || (data.is_credit_only ? prev.planType : (data.has_live ? 'student_vip' : 'student_basic')),
        hasLive: data.has_live !== undefined ? data.has_live : (data.plan_type === 'student_vip' || prev.hasLive),
        subscriptionEndDate: data.subscription_end_date || prev.subscriptionEndDate,
        daysLeft: newEndDate ? Math.ceil((newEndDate - now) / (1000 * 60 * 60 * 24)) : prev.daysLeft,
        aiCredits: data.new_credits_balance !== undefined ? data.new_credits_balance : ((prev.aiCredits || 20) + (data.added_credits || 0))
      }))
      
      setTimeout(() => {
        setShowActivationModal(false)
        setActivationCode('')
        setActivationMessage('')
      }, 2500)

    } catch (err) {
      console.error('Activation error:', err)
      setActivationMessage('❌ حدث خطأ أثناء التفعيل. يرجى المحاولة لاحقاً.')
    } finally {
      setActivationLoading(false)
    }
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

  if (!student) return null;

  return (
    <div className={styles.dashboard}>
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className={styles.mobileOverlay} 
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${isMobileMenuOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <button className={styles.closeMenuBtn} onClick={() => setIsMobileMenuOpen(false)}>
            <X size={28} />
          </button>
        </div>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>{student.name.charAt(0)}</div>
          <h3>{student.name}</h3>
          <p>
            {student.stage === 'foundation' && 'مرحلة التأسيس ورياض الأطفال'}
            {student.stage === 'primary_1' && 'الصف الأول الابتدائي'}
            {student.stage === 'primary_2' && 'الصف الثاني الابتدائي'}
            {student.stage === 'primary_3' && 'الصف الثالث الابتدائي'}
            {student.stage === 'primary_4' && 'الصف الرابع الابتدائي'}
            {student.stage === 'primary_5' && 'الصف الخامس الابتدائي'}
            {student.stage === 'primary_6' && 'الصف السادس الابتدائي'}
            {student.stage === 'prep_1' && 'الصف الأول الإعدادي'}
            {student.stage === 'prep_2' && 'الصف الثاني الإعدادي'}
            {student.stage === 'prep_3' && 'الصف الثالث الإعدادي'}
            {student.stage === 'sec_1' && 'الصف الأول الثانوي'}
            {student.stage === 'sec_2' && 'الصف الثاني الثانوي'}
            {student.stage === 'sec_3' && 'الصف الثالث الثانوي'}
            {![
              'foundation',
              'primary_1','primary_2','primary_3','primary_4','primary_5','primary_6',
              'prep_1','prep_2','prep_3',
              'sec_1','sec_2','sec_3'
            ].includes(student.stage) && student.stage}
          </p>
          <div style={{marginTop: '10px', fontSize: '0.8rem', padding: '5px 10px', background: student.isPremium ? '#198754' : '#6c757d', color: 'white', borderRadius: '5px', textAlign: 'center'}}>
            {student.isPremium ? (
              <>
                حساب مفعل ✅
                {student.subscriptionEndDate && <div style={{marginTop: '5px', fontSize: '0.75rem', opacity: 0.9}}>ينتهي في: {new Date(student.subscriptionEndDate).toLocaleDateString('ar-EG')}</div>}
              </>
            ) : student.status === 'pending' ? 'في انتظار التفعيل ⏳' : 'الاشتراك منتهي ❌'}
          </div>

          <button 
            onClick={() => setShowActivationModal(true)}
            style={{width: '100%', marginTop: '10px', padding: '10px', background: 'linear-gradient(135deg, #059669, #10b981)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 2px 8px rgba(5,150,105,0.2)'}}
          >
            شحن وتفعيل الاشتراك 💳
          </button>

          {/* Gamification Level & Points */}
          <div style={{marginTop: '16px', padding: '20px 18px', background: 'rgba(255, 255, 255, 0.5)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', borderRadius: '20px', textAlign: 'center', boxShadow: '0 8px 20px rgba(0,0,0,0.05)', border: '1px solid rgba(255, 255, 255, 0.8)', position: 'relative', overflow: 'hidden'}}>
            <div style={{position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'radial-gradient(circle, rgba(16,185,129,0.2) 0%, transparent 70%)'}}></div>
            
            <div style={{fontSize: '1.1rem', fontWeight: '900', color: '#059669', marginBottom: '8px'}}>
              مستوى: {student.level}
            </div>
            
            <div style={{fontSize: '2.5rem', margin: '12px 0', fontWeight: 'bold', color: '#064e3b', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px'}}>
              <span>🌟</span>
              {student.points}
            </div>
            
            {/* Progress Bar */}
            <div style={{background: 'rgba(5,150,105,0.15)', height: '10px', borderRadius: '10px', overflow: 'hidden', marginTop: '12px'}}>
              <div style={{
                height: '100%',
                background: 'linear-gradient(90deg, #059669, #10b981, #34d399)',
                width: `${Math.min(100, (student.points / (student.points < 500 ? 500 : student.points < 1000 ? 1000 : student.points < 2000 ? 2000 : student.points)) * 100)}%`,
                transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
                borderRadius: '10px'
              }}></div>
            </div>
            <div style={{fontSize: '0.78rem', color: '#047857', marginTop: '6px', fontWeight: 'bold'}}>
              {student.points < 500 ? `باقي ${500 - student.points} نقطة للمستوى التالي 🚀` :
               student.points < 1000 ? `باقي ${1000 - student.points} نقطة للمستوى التالي 🚀` :
               student.points < 2000 ? `باقي ${2000 - student.points} نقطة للمستوى التالي 🚀` : 'لقد وصلت لأعلى مستوى! 🎉'}
            </div>

            {/* Badges */}
            {student.badges && student.badges.length > 0 && (
              <div style={{marginTop: '15px', display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', background: 'rgba(5,150,105,0.08)', padding: '10px', borderRadius: '12px'}}>
                {student.badges.map((badge, idx) => (
                  <span key={idx} title={badge} style={{fontSize: '1.6rem', cursor: 'help', transition: 'transform 0.2s'}} onMouseOver={e => e.target.style.transform = 'scale(1.2)'} onMouseOut={e => e.target.style.transform = 'scale(1)'}>{badge}</span>
                ))}
              </div>
            )}

            <button onClick={() => router.push('/leaderboard')} style={{marginTop: '12px', background: 'white', color: '#059669', border: '1.5px solid #a7f3d0', padding: '10px 16px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 2px 8px rgba(5,150,105,0.1)', transition: 'all 0.2s'}}>
              🏆 مشاهدة لوحة الشرف
            </button>


            <a href="/student-dashboard/battle" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '8px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', padding: '10px', borderRadius: '12px', textDecoration: 'none', fontWeight: 'bold', boxShadow: '0 2px 8px rgba(245,158,11,0.25)', transition: 'all 0.2s'}}>
              ⚔️ ادخل ساحة التحدي ⚔️
            </a>

            {!['foundation', 'foundation_azhar', 'primary_1', 'primary_1_azhar', 'primary_2', 'primary_2_azhar', 'primary_3', 'primary_3_azhar'].includes(student.stage) && (
              <a href="/grammar-games" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '8px', background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: 'white', padding: '10px', borderRadius: '12px', textDecoration: 'none', fontWeight: 'bold', boxShadow: '0 2px 8px rgba(139,92,246,0.25)', transition: 'all 0.2s'}}>
                🎯 صائد الإعراب (ألعاب نحوية) 🎯
              </a>
            )}

            {/* Premium Features */}
            {['foundation', 'foundation_azhar', 'primary_1', 'primary_1_azhar', 'primary_2', 'primary_2_azhar', 'primary_3', 'primary_3_azhar'].includes(student.stage) && (
              student.isPremium ? (
                <a href="/kids-corner" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '8px', background: 'linear-gradient(135deg, #ec4899, #db2777)', color: 'white', padding: '10px', borderRadius: '12px', textDecoration: 'none', fontWeight: 'bold', boxShadow: '0 2px 8px rgba(236,72,153,0.25)'}}>
                  🧸 ركن التأسيس والأطفال 🧸
                </a>
              ) : (
                <button onClick={() => alert('هذا الركن خاص بالمشتركين فقط. يرجى تفعيل اشتراكك للوصول إليه!')} style={{display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', marginTop: '8px', background: '#fdf2f8', color: '#be185d', padding: '10px', borderRadius: '12px', fontWeight: 'bold', border: '1.5px dashed #fbcfe8', cursor: 'pointer'}}>
                  🧸 ركن التأسيس والأطفال 🔒
                </button>
              )
            )}

          </div>
        </div>
        <nav className={styles.nav}>
          <button onClick={() => {setActiveTab('home'); setIsMobileMenuOpen(false)}} className={activeTab === 'home' ? styles.active : ''} style={{width:'100%', padding:'10px', textAlign:'right', background:'none', border:'none', color:'inherit', cursor:'pointer', fontSize:'1rem'}}>الرئيسية</button>
          
          <button onClick={() => {setActiveTab('courses'); setIsMobileMenuOpen(false)}} className={activeTab === 'courses' ? styles.active : ''} style={{width:'100%', padding:'10px', textAlign:'right', background:'none', border:'none', color:'inherit', cursor:'pointer', fontSize:'1rem'}}>كورساتي</button>
          <button onClick={() => {setActiveTab('community'); setIsMobileMenuOpen(false)}} className={activeTab === 'community' ? styles.active : ''} style={{width:'100%', padding:'10px', textAlign:'right', background:'none', border:'none', color:'inherit', cursor:'pointer', fontSize:'1rem'}}>مجتمع الطلاب 👥</button>
          <button onClick={() => {setActiveTab('grades'); setIsMobileMenuOpen(false)}} className={activeTab === 'grades' ? styles.active : ''} style={{width:'100%', padding:'10px', textAlign:'right', background:'none', border:'none', color:'inherit', cursor:'pointer', fontSize:'1rem'}}>نتائج الاختبارات</button>
          <button onClick={() => {setActiveTab('settings'); setIsMobileMenuOpen(false)}} className={activeTab === 'settings' ? styles.active : ''} style={{width:'100%', padding:'10px', textAlign:'right', background:'none', border:'none', color:'inherit', cursor:'pointer', fontSize:'1rem'}}>الإعدادات</button>
          
          <Link href="/azkar" style={{display: 'block', width:'100%', padding:'10px', textAlign:'right', color:'inherit', textDecoration: 'none', fontSize:'1rem', fontWeight: 'bold'}}>الأذكار 📖</Link>

          <button onClick={handleLogout} className={styles.logoutBtn} style={{width:'100%', padding:'10px', textAlign:'right', border:'none', cursor:'pointer', fontSize:'1rem'}}>تسجيل الخروج</button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        <header className={styles.header} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div>
            <div style={{display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px'}}>
              <button 
                className={styles.hamburgerBtn} 
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu size={24} />
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h1 style={{marginBottom: 0}}>مرحباً بك يا {student.name.split(' ')[0]} 👋</h1>
                <span style={{
                  fontSize: '0.75rem',
                  padding: '3px 10px',
                  borderRadius: '12px',
                  fontWeight: '900',
                  background: student.hasLive ? '#fef3c7' : student.isPremium ? '#e0f2fe' : '#f1f5f9',
                  color: student.hasLive ? '#92400e' : student.isPremium ? '#0369a1' : '#475569',
                  border: `1px solid ${student.hasLive ? '#fcd34d' : student.isPremium ? '#bae6fd' : '#e2e8f0'}`,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  {student.hasLive ? '⭐ باقة VIP (مع البث المباشر 🔴)' : student.isPremium ? '🎓 باقة التفوق (بدون لايف)' : '🆓 حساب مجاني'}
                </span>
              </div>
            </div>
            <p>{activeTab === 'settings' ? 'قم بتحديث بياناتك الشخصية من هنا.' : 'تابع تقدمك واستكمل دروسك من هنا.'}</p>
          </div>

          <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
            <div style={{position: 'relative'}}>
              <button 
                onClick={toggleNotifications}
                style={{background: 'white', border: '1px solid #ddd', padding: '10px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.2rem', position: 'relative'}}
              >
              🔔
              {notifications.some(n => !n.is_read) && (
                <span style={{position: 'absolute', top: 0, right: 0, background: 'red', color: 'white', width: '15px', height: '15px', borderRadius: '50%', fontSize: '0.6rem', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                  {notifications.filter(n => !n.is_read).length}
                </span>
              )}
            </button>
            
            {showNotificationsDropdown && (
              <div className="notifications-dropdown">
                <div style={{padding: '15px', borderBottom: '1px solid #eee', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between'}}>
                  <span>الإشعارات 🔔</span>
                  {notifications.length > 0 && <span style={{fontSize: '0.8rem', color: '#888', fontWeight: 'normal', cursor: 'pointer'}} onClick={() => setNotifications([])}>مسح الكل</span>}
                </div>
                {notifications.length === 0 ? (
                  <div style={{padding: '20px', textAlign: 'center', color: '#888'}}>لا توجد إشعارات حالياً</div>
                ) : (
                  notifications.map(notif => (
                    <div key={notif.id} className={`notification-item ${!notif.is_read ? 'unread' : ''}`}>
                      <h4 style={{margin: '0 0 5px 0', fontSize: '0.95rem', color: '#333'}}>{notif.title}</h4>
                      <p style={{margin: '0', fontSize: '0.85rem', color: '#666'}}>{notif.message}</p>
                      <small style={{display: 'block', marginTop: '5px', color: '#999', fontSize: '0.75rem'}}>
                        {new Date(notif.created_at).toLocaleDateString('ar-EG')}
                      </small>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          </div>
        </header>

        {/* Subscription Warning Banner */}
        {(student.daysLeft !== null && student.daysLeft <= 3 && student.daysLeft > 0) && (
          <div style={{background: '#fff3cd', color: '#856404', padding: '15px 20px', borderRadius: '10px', border: '1px solid #ffeeba', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold'}}>
            <span>⚠️</span>
            <span>عزيزي الطالب، اشتراكك سينتهي خلال {student.daysLeft} أيام! يرجى التواصل مع الإدارة للتجديد لتجنب توقف الحساب.</span>
          </div>
        )}
        
        {(student.daysLeft !== null && student.daysLeft <= 0) && (
          <div style={{background: '#f8d7da', color: '#721c24', padding: '15px 20px', borderRadius: '10px', border: '1px solid #f5c6cb', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold'}}>
            <span>🚫</span>
            <span>لقد انتهى اشتراكك! تواصل مع الإدارة لتجديد الاشتراك واستعادة صلاحياتك.</span>
          </div>
        )}

        {student.status === 'pending' && !student.isPremium && (
          <div style={{background: '#fff3cd', color: '#856404', padding: '15px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #ffeeba'}}>
            <strong>ملاحظة هامة:</strong> طلب اشتراكك قيد المراجعة ⏳ يرجى التواصل مع الأستاذ عبر الواتساب لتأكيد الدفع وتفعيل حسابك.
          </div>
        )}

        {student.status === 'approved' && !student.isPremium && (
          <div style={{background: '#f8d7da', color: '#721c24', padding: '15px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #f5c6cb'}}>
            <strong>تنبيه:</strong> لقد انتهت فترة اشتراكك ❌ يرجى التواصل مع الأستاذ لتجديد الاشتراك لتتمكن من الوصول للدروس.
          </div>
        )}

        {student.isPremium && student.daysLeft !== null && student.daysLeft <= 3 && student.daysLeft >= 0 && (
          <div style={{background: '#cce5ff', color: '#004085', padding: '15px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #b8daff'}}>
            <strong>تنبيه:</strong> سينتهي اشتراكك بعد {student.daysLeft} أيام ⚠️ يرجى التواصل مع الأستاذ لتجديد الاشتراك قريباً.
          </div>
        )}

        {student.status !== 'approved' && activeTab !== 'settings' ? (
          <div style={{
            background: 'white',
            borderRadius: '25px',
            padding: '50px 30px',
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
            border: '2px dashed #fca5a5',
            marginTop: '20px',
            maxWidth: '600px',
            margin: '40px auto'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>⏳</div>
            <h2 style={{ color: '#b91c1c', marginBottom: '15px' }}>حسابك قيد المراجعة ولم يتم تفعيله بعد!</h2>
            <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '30px', lineHeight: '1.6' }}>
              لا يمكنك تصفح المنصة حالياً. يجب تفعيل حسابك من قبل الإدارة أولاً. يرجى التواصل معنا لتأكيد التفعيل.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center' }}>
              <a 
                href="https://wa.me/201507952002" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  background: '#25D366',
                  color: 'white',
                  textDecoration: 'none',
                  padding: '12px 30px',
                  borderRadius: '12px',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 15px rgba(37, 211, 102, 0.4)',
                  width: '100%',
                  maxWidth: '300px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxSizing: 'border-box'
                }}
              >
                التواصل مع الدعم لتفعيل الحساب 💬
              </a>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'community' && <StudentCommunityTab student={student} />}
            {activeTab !== 'community' && (
            <div className={styles.contentGrid}>
          
          {(activeTab === 'home' || activeTab === 'courses') && (
            <>
              {/* Smart Tools Grid */}
              <section style={{ marginBottom: '40px' }}>
                <h2 style={{ color: 'var(--text-dark)', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Sparkles size={24} color="var(--primary-color)" />
                  الأدوات الذكية التفاعلية
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                  
                  {/* Live Class */}
                  <a 
                    href="/live" 
                    style={{ 
                      background: student.hasLive ? 'linear-gradient(135deg, #fef3c7, #fde68a)' : 'linear-gradient(135deg, #eff6ff, #dbeafe)', 
                      border: `1.5px solid ${student.hasLive ? '#fcd34d' : '#bfdbfe'}`, 
                      borderRadius: '20px', 
                      padding: '20px', 
                      textDecoration: 'none', 
                      color: student.hasLive ? '#92400e' : '#1e3a8a', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      gap: '15px', 
                      boxShadow: '0 10px 20px rgba(37, 99, 235, 0.1)', 
                      transition: 'all 0.3s ease',
                      position: 'relative'
                    }} 
                    className={styles.toolCard}
                  >
                    <div style={{ position: 'absolute', top: '10px', left: '10px', background: student.hasLive ? '#dc2626' : '#f59e0b', color: 'white', padding: '3px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      {student.hasLive ? '🔴 البث المباشر متاح' : '⭐ مخصص لباقة VIP'}
                    </div>
                    <div style={{ background: student.hasLive ? 'linear-gradient(135deg, #f59e0b, #d97706)' : '#3b82f6', color: 'white', padding: '15px', borderRadius: '15px' }}>
                      <MonitorPlay size={32} />
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold' }}>البث المباشر</h3>
                    <p style={{ margin: 0, fontSize: '0.9rem', textAlign: 'center', opacity: 0.85 }}>
                      {student.hasLive ? 'احضر حصتك كأنك في السنتر' : 'متاح لمشتركي باقة VIP مع اللايف'}
                    </p>
                  </a>

                  {/* Games / Activities */}
                  {['foundation', 'foundation_azhar'].includes(student.stage) ? (
                    <a href="/kids-corner/quran-words" style={{ background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)', border: '1.5px solid #a7f3d0', borderRadius: '20px', padding: '20px', textDecoration: 'none', color: '#065f46', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', boxShadow: '0 10px 20px rgba(5, 150, 105, 0.1)', transition: 'all 0.3s ease' }} className={styles.toolCard}>
                      <div style={{ background: 'linear-gradient(135deg, #059669, #10b981)', color: 'white', padding: '15px', borderRadius: '15px' }}>
                        <Sparkles size={32} />
                      </div>
                      <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold' }}>حلقات القرآن الكريم</h3>
                      <p style={{ margin: 0, fontSize: '0.9rem', textAlign: 'center', opacity: 0.85 }}>رتّب الآيات واحفظ مع التلاوة</p>
                    </a>
                  ) : (
                    <a href="/grammar-games" style={{ background: 'linear-gradient(135deg, #fdf4ff, #fae8ff)', border: '1px solid #f5d0fe', borderRadius: '20px', padding: '20px', textDecoration: 'none', color: '#701a75', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', boxShadow: '0 10px 20px rgba(192, 38, 211, 0.1)', transition: 'all 0.3s ease' }} className={styles.toolCard}>
                      <div style={{ background: '#d946ef', color: 'white', padding: '15px', borderRadius: '15px' }}>
                        <Gamepad2 size={32} />
                      </div>
                      <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold' }}>ألعاب تعليمية</h3>
                      <p style={{ margin: 0, fontSize: '0.9rem', textAlign: 'center', opacity: 0.8 }}>العب، استمتع، وتعلم النحو</p>
                    </a>
                  )}

                  {/* Smart Whiteboard */}
                  <a href="/free-whiteboard" style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', border: '1px solid #bbf7d0', borderRadius: '20px', padding: '20px', textDecoration: 'none', color: '#14532d', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', boxShadow: '0 10px 20px rgba(22, 163, 74, 0.1)', transition: 'all 0.3s ease' }} className={styles.toolCard}>
                    <div style={{ background: '#22c55e', color: 'white', padding: '15px', borderRadius: '15px' }}>
                      <Presentation size={32} />
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold' }}>السبورة الذكية</h3>
                    <p style={{ margin: 0, fontSize: '0.9rem', textAlign: 'center', opacity: 0.8 }}>مساحتك الحرة للشرح والمذاكرة</p>
                  </a>

                </div>
              </section>

            <section className={styles.coursesSection}>
              {['foundation', 'foundation_azhar'].includes(student.stage) ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
                    <div>
                      <h2 style={{color: '#059669', margin: 0, fontSize: '1.8rem', fontWeight: 900}}>عالم التأسيس والقرآن الكريم 🎈</h2>
                      <p style={{margin: '6px 0 0 0', color: '#4b5563', fontSize: '0.95rem'}}>أقسامك التعليمية مرتبة ومصنفة بعناية لتتعلم وتلعب بسهولة:</p>
                    </div>
                    <a 
                      href="/kids-corner"
                      style={{
                        padding: '10px 18px',
                        background: 'linear-gradient(135deg, #059669, #10b981)',
                        color: 'white',
                        borderRadius: '14px',
                        textDecoration: 'none',
                        fontWeight: 800,
                        fontSize: '0.9rem',
                        boxShadow: '0 4px 12px rgba(5,150,105,0.25)'
                      }}
                    >
                      🌟 استكشف ركن التأسيس الشامل
                    </a>
                  </div>

                  {/* 1. قسم حلقات القرآن والمصحف الشريف */}
                  <div style={{ marginBottom: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                      <span style={{ fontSize: '1.4rem' }}>🌿</span>
                      <h3 style={{ margin: 0, color: '#065f46', fontSize: '1.3rem', fontWeight: 900 }}>حلقات القرآن الكريم والمصحف الشريف</h3>
                    </div>

                    <div className={styles.cards}>
                      <a href="/kids-corner/quran-words" className={styles.courseCard} style={{background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)', border: '2px solid #6ee7b7', textDecoration: 'none', boxShadow: '0 10px 25px rgba(5,150,105,0.12)'}}>
                        <div className={styles.cardHeader} style={{borderBottom: 'none', justifyContent: 'center'}}>
                          <h3 style={{color: '#064e3b', fontSize: '1.45rem', margin: '0', fontWeight: '900', textAlign: 'center'}}>أنشطة حلقات القرآن الكريم 🌿</h3>
                        </div>
                        <p style={{textAlign: 'center', color: '#047857', marginTop: '10px', fontSize: '0.95rem', fontWeight: 'bold'}}>رتّب كلمات الآيات لجميع سور المصحف (١١٤ سورة) وتحديد النطاق مع التلاوة</p>
                        <div style={{marginTop: '16px', background: 'linear-gradient(135deg, #059669, #10b981)', color: 'white', padding: '12px', borderRadius: '15px', textAlign: 'center', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(5,150,105,0.3)'}}>رتّب واحفظ 🚀</div>
                      </a>

                      <a href="/kids-corner/mushaf" className={styles.courseCard} style={{background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', border: '2px solid #86efac', textDecoration: 'none', boxShadow: '0 10px 25px rgba(34,197,94,0.12)'}}>
                        <div className={styles.cardHeader} style={{borderBottom: 'none', justifyContent: 'center'}}>
                          <h3 style={{color: '#15803d', fontSize: '1.45rem', margin: '0', fontWeight: '900', textAlign: 'center'}}>مصحف التجويد والتظليل 📖</h3>
                        </div>
                        <p style={{textAlign: 'center', color: '#166534', marginTop: '10px', fontSize: '0.95rem', fontWeight: 'bold'}}>تصفح ٦٠٤ صفحة بدقة عالية مع التظليل الفسفوري والاستماع المباشر</p>
                        <div style={{marginTop: '16px', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', padding: '12px', borderRadius: '15px', textAlign: 'center', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(16,185,129,0.3)'}}>افتح المصحف 📖</div>
                      </a>
                    </div>
                  </div>

                  {/* 2. قسم ركائز التأسيس التعليمي */}
                  <div style={{ marginBottom: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                      <span style={{ fontSize: '1.4rem' }}>📖</span>
                      <h3 style={{ margin: 0, color: '#1e3a8a', fontSize: '1.3rem', fontWeight: 900 }}>مواد التأسيس التعليمية الأساسية</h3>
                    </div>

                    <div className={styles.cards}>
                      <a href="/kids-corner/arabic" className={styles.courseCard} style={{background: 'linear-gradient(135deg, #fef2f2, #fee2e2)', border: '2px solid #fca5a5', textDecoration: 'none', boxShadow: '0 10px 25px rgba(239,68,68,0.12)'}}>
                        <div className={styles.cardHeader} style={{borderBottom: 'none', justifyContent: 'center'}}>
                          <h3 style={{color: '#b91c1c', fontSize: '1.5rem', margin: '0', fontWeight: '900', textAlign: 'center'}}>اللغة العربية 🆎</h3>
                        </div>
                        <p style={{textAlign: 'center', color: '#991b1b', marginTop: '8px', fontSize: '0.92rem', fontWeight: 'bold'}}>الحروف، الكلمات، والسبورة الذكية</p>
                        <div style={{marginTop: '14px', background: 'linear-gradient(to right, #ef4444, #f87171)', color: 'white', padding: '10px', borderRadius: '12px', textAlign: 'center', fontWeight: 'bold', boxShadow: '0 4px 0 #b91c1c'}}>ابدأ التعلم 🚀</div>
                      </a>

                      <a href="/kids-corner/math" className={styles.courseCard} style={{background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', border: '2px solid #86efac', textDecoration: 'none', boxShadow: '0 10px 25px rgba(34,197,94,0.12)'}}>
                        <div className={styles.cardHeader} style={{borderBottom: 'none', justifyContent: 'center'}}>
                          <h3 style={{color: '#15803d', fontSize: '1.5rem', margin: '0', fontWeight: '900', textAlign: 'center'}}>الحساب والرياضيات 🔢</h3>
                        </div>
                        <p style={{textAlign: 'center', color: '#166534', marginTop: '8px', fontSize: '0.92rem', fontWeight: 'bold'}}>أرقام حتى ١٠٠ والجمع والطرح</p>
                        <div style={{marginTop: '14px', background: 'linear-gradient(to right, #22c55e, #4ade80)', color: 'white', padding: '10px', borderRadius: '12px', textAlign: 'center', fontWeight: 'bold', boxShadow: '0 4px 0 #15803d'}}>ابدأ اللعب 🧮</div>
                      </a>

                      <a href="/kids-corner/english" className={styles.courseCard} style={{background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', border: '2px solid #93c5fd', textDecoration: 'none', boxShadow: '0 10px 25px rgba(59,130,246,0.12)'}}>
                        <div className={styles.cardHeader} style={{borderBottom: 'none', justifyContent: 'center'}}>
                          <h3 style={{color: '#1d4ed8', fontSize: '1.5rem', margin: '0', fontWeight: '900', textAlign: 'center'}}>English Stars 🔤</h3>
                        </div>
                        <p style={{textAlign: 'center', color: '#1e3a8a', marginTop: '8px', fontSize: '0.92rem', fontWeight: 'bold'}}>Letters, Phonics, and Tracing</p>
                        <div style={{marginTop: '14px', background: 'linear-gradient(to right, #3b82f6, #60a5fa)', color: 'white', padding: '10px', borderRadius: '12px', textAlign: 'center', fontWeight: 'bold', boxShadow: '0 4px 0 #1d4ed8'}}>Start Now ⭐</div>
                      </a>
                    </div>
                  </div>

                  {/* 3. قسم ألعاب التأسيس والتهجئة الذكية */}
                  <div style={{ marginBottom: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                      <span style={{ fontSize: '1.4rem' }}>🎮</span>
                      <h3 style={{ margin: 0, color: '#b45309', fontSize: '1.3rem', fontWeight: 900 }}>واحة ألعاب التهجئة التفاعلية</h3>
                    </div>

                    <div className={styles.cards}>
                      <a href="/kids-corner/car-blending" className={styles.courseCard} style={{background: 'linear-gradient(135deg, #fffbeb, #fef3c7)', border: '2px solid #fde68a', textDecoration: 'none', boxShadow: '0 8px 20px rgba(245,158,11,0.1)'}}>
                        <h4 style={{color: '#b45309', fontSize: '1.25rem', margin: '0 0 6px 0', fontWeight: '900', textAlign: 'center'}}>🏎️ سباق سيارة الكلمات</h4>
                        <p style={{textAlign: 'center', color: '#92400e', margin: 0, fontSize: '0.85rem'}}>حرّك السيارة تحت الحروف لتدمج الكلمة</p>
                      </a>

                      <a href="/kids-corner/claw-machine" className={styles.courseCard} style={{background: 'linear-gradient(135deg, #faf5ff, #f3e8ff)', border: '2px solid #e9d5ff', textDecoration: 'none', boxShadow: '0 8px 20px rgba(168,85,247,0.1)'}}>
                        <h4 style={{color: '#7e22ce', fontSize: '1.25rem', margin: '0 0 6px 0', fontWeight: '900', textAlign: 'center'}}>🕹️ مخلب صيد الحروف</h4>
                        <p style={{textAlign: 'center', color: '#6b21a8', margin: 0, fontSize: '0.85rem'}}>اختر الحرف الناقص واسحبه بالونش</p>
                      </a>

                      <a href="/kids-corner/blending-rocks" className={styles.courseCard} style={{background: 'linear-gradient(135deg, #f0fdfa, #ccfbf1)', border: '2px solid #99f6e4', textDecoration: 'none', boxShadow: '0 8px 20px rgba(20,184,166,0.1)'}}>
                        <h4 style={{color: '#0f766e', fontSize: '1.25rem', margin: '0 0 6px 0', fontWeight: '900', textAlign: 'center'}}>💥 صخور الفونكس والدمج</h4>
                        <p style={{textAlign: 'center', color: '#115e59', margin: 0, fontSize: '0.85rem'}}>اكسر الصخور واكتشف أصوات الحروف</p>
                      </a>
                    </div>
                  </div>
                  
                  {(courses.length > 0 || lessons.filter(l => !l.course_id).length > 0) && (
                    <h3 style={{marginTop: '30px', marginBottom: '15px', color: '#4b5563'}}>الكورسات الإضافية 📚</h3>
                  )}
                </>
              ) : (
                <>
                  <h2>الكورسات والمناهج التفاعلية لمرحلتك 📚</h2>
                  {student.stage === 'primary_1' && (
                    <div className={styles.cards} style={{marginBottom: '40px'}}>
                      {/* Master Primary 1 Hub */}
                      <a href="/primary-1" className={styles.courseCard} style={{background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)', border: '2px solid #6ee7b7', textDecoration: 'none', boxShadow: '0 10px 25px rgba(5,150,105,0.12)'}}>
                        <div className={styles.cardHeader} style={{borderBottom: 'none', justifyContent: 'center'}}>
                          <h3 style={{color: '#064e3b', fontSize: '1.4rem', margin: '0', fontWeight: '900', textAlign: 'center'}}>بوابة الصف الأول الابتدائي 🎒</h3>
                        </div>
                        <p style={{textAlign: 'center', color: '#047857', marginTop: '8px', fontSize: '0.92rem', fontWeight: 'bold'}}>كل المناهج والمسارات والألعاب والفونكس في مكان واحد</p>
                        <div style={{marginTop: '16px', background: 'linear-gradient(135deg, #059669, #0d9488)', color: 'white', padding: '10px', borderRadius: '12px', textAlign: 'center', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(5,150,105,0.3)'}}>دخول البوابة 🚀</div>
                      </a>

                      {/* Interactive Arabic Pathway */}
                      <a href="/kids-corner/pathway?subject=primary1_arabic" className={styles.courseCard} style={{background: 'linear-gradient(135deg, #fef2f2, #fee2e2)', border: '2px solid #fca5a5', textDecoration: 'none', boxShadow: '0 10px 25px rgba(239,68,68,0.12)'}}>
                        <div className={styles.cardHeader} style={{borderBottom: 'none', justifyContent: 'center'}}>
                          <h3 style={{color: '#b91c1c', fontSize: '1.4rem', margin: '0', fontWeight: '900', textAlign: 'center'}}>المنهج التفاعلي (لغة عربية) 🗺️</h3>
                        </div>
                        <p style={{textAlign: 'center', color: '#991b1b', marginTop: '8px', fontSize: '0.92rem', fontWeight: 'bold'}}>الوحدات الدراسية، القصص، والأناشيد التفاعلية</p>
                        <div style={{marginTop: '16px', background: 'linear-gradient(135deg, #ef4444, #f87171)', color: 'white', padding: '10px', borderRadius: '12px', textAlign: 'center', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(239,68,68,0.3)'}}>ابدأ المسار 🇸🇦</div>
                      </a>

                      {/* Math Pathway */}
                      <a href="/kids-corner/pathway?subject=math" className={styles.courseCard} style={{background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', border: '2px solid #86efac', textDecoration: 'none', boxShadow: '0 10px 25px rgba(34,197,94,0.12)'}}>
                        <div className={styles.cardHeader} style={{borderBottom: 'none', justifyContent: 'center'}}>
                          <h3 style={{color: '#15803d', fontSize: '1.4rem', margin: '0', fontWeight: '900', textAlign: 'center'}}>مسار الحساب والرياضيات 🔢</h3>
                        </div>
                        <p style={{textAlign: 'center', color: '#166534', marginTop: '8px', fontSize: '0.92rem', fontWeight: 'bold'}}>الأرقام، الجمع، الطرح، والأشكال الهندسية</p>
                        <div style={{marginTop: '16px', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', padding: '10px', borderRadius: '12px', textAlign: 'center', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(16,185,129,0.3)'}}>ابدأ الحساب 🧮</div>
                      </a>
                    </div>
                  )}

                  {student.stage === 'primary_2' && (
                    <div className={styles.cards} style={{marginBottom: '40px'}}>
                      <a href="/primary-2" className={styles.courseCard} style={{background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)', border: '2px solid #6ee7b7', textDecoration: 'none', boxShadow: '0 10px 25px rgba(5,150,105,0.12)'}}>
                        <div className={styles.cardHeader} style={{borderBottom: 'none', justifyContent: 'center'}}>
                          <h3 style={{color: '#064e3b', fontSize: '1.4rem', margin: '0', fontWeight: '900', textAlign: 'center'}}>بوابة الصف الثاني الابتدائي 🎒</h3>
                        </div>
                        <p style={{textAlign: 'center', color: '#047857', marginTop: '8px', fontSize: '0.92rem', fontWeight: 'bold'}}>بوابة شاملة: القراءة، النصوص، الأساليب، والخط</p>
                        <div style={{marginTop: '16px', background: 'linear-gradient(135deg, #059669, #0d9488)', color: 'white', padding: '10px', borderRadius: '12px', textAlign: 'center', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(5,150,105,0.3)'}}>دخول البوابة 🚀</div>
                      </a>

                      <a href="/kids-corner/pathway?subject=primary2_arabic" className={styles.courseCard} style={{background: 'linear-gradient(135deg, #fef2f2, #fee2e2)', border: '2px solid #fca5a5', textDecoration: 'none', boxShadow: '0 10px 25px rgba(239,68,68,0.15)'}}>
                        <div className={styles.cardHeader} style={{borderBottom: 'none', justifyContent: 'center'}}>
                          <h3 style={{color: '#b91c1c', fontSize: '1.4rem', margin: '0', fontWeight: '900', textAlign: 'center'}}>المنهج التفاعلي (الصف الثاني) 🗺️</h3>
                        </div>
                        <p style={{textAlign: 'center', color: '#991b1b', marginTop: '8px', fontSize: '0.92rem', fontWeight: 'bold'}}>مسار التعلم الذكي والقصص التفاعلية</p>
                        <div style={{marginTop: '16px', background: 'linear-gradient(to right, #ef4444, #f87171)', color: 'white', padding: '10px', borderRadius: '12px', textAlign: 'center', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(239,68,68,0.3)'}}>ابدأ المنهج 🚀</div>
                      </a>
                    </div>
                  )}

                  {student.stage === 'primary_3' && (
                    <div className={styles.cards} style={{marginBottom: '40px'}}>
                      <a href="/primary-3" className={styles.courseCard} style={{background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)', border: '2px solid #6ee7b7', textDecoration: 'none', boxShadow: '0 10px 25px rgba(5,150,105,0.12)'}}>
                        <div className={styles.cardHeader} style={{borderBottom: 'none', justifyContent: 'center'}}>
                          <h3 style={{color: '#064e3b', fontSize: '1.4rem', margin: '0', fontWeight: '900', textAlign: 'center'}}>بوابة الصف الثالث الابتدائي 🎒</h3>
                        </div>
                        <p style={{textAlign: 'center', color: '#047857', marginTop: '8px', fontSize: '0.92rem', fontWeight: 'bold'}}>الاستماع، القراءة، الأساليب والتراكيب، والإملاء</p>
                        <div style={{marginTop: '16px', background: 'linear-gradient(135deg, #059669, #0d9488)', color: 'white', padding: '10px', borderRadius: '12px', textAlign: 'center', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(5,150,105,0.3)'}}>دخول البوابة 🚀</div>
                      </a>

                      <a href="/primary-3/reading-and-texts" className={styles.courseCard} style={{background: 'linear-gradient(135deg, #fef2f2, #fee2e2)', border: '2px solid #fca5a5', textDecoration: 'none', boxShadow: '0 10px 25px rgba(239,68,68,0.12)'}}>
                        <div className={styles.cardHeader} style={{borderBottom: 'none', justifyContent: 'center'}}>
                          <h3 style={{color: '#b91c1c', fontSize: '1.4rem', margin: '0', fontWeight: '900', textAlign: 'center'}}>مسار القراءة والاستماع 📖</h3>
                        </div>
                        <p style={{textAlign: 'center', color: '#991b1b', marginTop: '8px', fontSize: '0.92rem', fontWeight: 'bold'}}>موضوعات القراءة ونصوص الاستماع والأنشطة</p>
                        <div style={{marginTop: '16px', background: 'linear-gradient(135deg, #ef4444, #f87171)', color: 'white', padding: '10px', borderRadius: '12px', textAlign: 'center', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(239,68,68,0.3)'}}>ابدأ القراءة 📚</div>
                      </a>

                      <a href="/grammar-games" className={styles.courseCard} style={{background: 'linear-gradient(135deg, #f5f3ff, #ede9fe)', border: '2px solid #c4b5fd', textDecoration: 'none', boxShadow: '0 10px 25px rgba(139,92,246,0.12)'}}>
                        <div className={styles.cardHeader} style={{borderBottom: 'none', justifyContent: 'center'}}>
                          <h3 style={{color: '#6d28d9', fontSize: '1.4rem', margin: '0', fontWeight: '900', textAlign: 'center'}}>ألعاب النحو التفاعلية 🎮</h3>
                        </div>
                        <p style={{textAlign: 'center', color: '#7c3aed', marginTop: '8px', fontSize: '0.92rem', fontWeight: 'bold'}}>تحديات الجملة الاسمية والفعلية وظرفي الزمان والمكان</p>
                        <div style={{marginTop: '16px', background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: 'white', padding: '10px', borderRadius: '12px', textAlign: 'center', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(139,92,246,0.3)'}}>العب النحو 🎯</div>
                      </a>
                    </div>
                  )}

                  {student.stage === 'primary_4' && (
                    <div className={styles.cards} style={{marginBottom: '40px'}}>
                      <a href="/primary-4" className={styles.courseCard} style={{background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)', border: '2px solid #6ee7b7', textDecoration: 'none', boxShadow: '0 10px 25px rgba(5,150,105,0.12)'}}>
                        <div className={styles.cardHeader} style={{borderBottom: 'none', justifyContent: 'center'}}>
                          <h3 style={{color: '#064e3b', fontSize: '1.4rem', margin: '0', fontWeight: '900', textAlign: 'center'}}>بوابة الصف الرابع الابتدائي 🏫</h3>
                        </div>
                        <p style={{textAlign: 'center', color: '#047857', marginTop: '8px', fontSize: '0.92rem', fontWeight: 'bold'}}>المنهج المطور: القراءة والنصوص، النحو، والكتابة السردية</p>
                        <div style={{marginTop: '16px', background: 'linear-gradient(135deg, #059669, #0d9488)', color: 'white', padding: '10px', borderRadius: '12px', textAlign: 'center', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(5,150,105,0.3)'}}>دخول البوابة 🚀</div>
                      </a>

                      <a href="/primary-4/grammar" className={styles.courseCard} style={{background: 'linear-gradient(135deg, #fef2f2, #fee2e2)', border: '2px solid #fca5a5', textDecoration: 'none', boxShadow: '0 10px 25px rgba(239,68,68,0.12)'}}>
                        <div className={styles.cardHeader} style={{borderBottom: 'none', justifyContent: 'center'}}>
                          <h3 style={{color: '#b91c1c', fontSize: '1.4rem', margin: '0', fontWeight: '900', textAlign: 'center'}}>مسار النحو والإعراب ⚖️</h3>
                        </div>
                        <p style={{textAlign: 'center', color: '#991b1b', marginTop: '8px', fontSize: '0.92rem', fontWeight: 'bold'}}>المبتدأ والخبر، الفاعل وعلامات رفعه، والضمائر</p>
                        <div style={{marginTop: '16px', background: 'linear-gradient(135deg, #ef4444, #f87171)', color: 'white', padding: '10px', borderRadius: '12px', textAlign: 'center', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(239,68,68,0.3)'}}>ابدأ النحو 📖</div>
                      </a>

                      <a href="/grammar-games" className={styles.courseCard} style={{background: 'linear-gradient(135deg, #f5f3ff, #ede9fe)', border: '2px solid #c4b5fd', textDecoration: 'none', boxShadow: '0 10px 25px rgba(139,92,246,0.12)'}}>
                        <div className={styles.cardHeader} style={{borderBottom: 'none', justifyContent: 'center'}}>
                          <h3 style={{color: '#6d28d9', fontSize: '1.4rem', margin: '0', fontWeight: '900', textAlign: 'center'}}>صائد الإعراب والألعاب 🎯</h3>
                        </div>
                        <p style={{textAlign: 'center', color: '#7c3aed', marginTop: '8px', fontSize: '0.92rem', fontWeight: 'bold'}}>تحديات تفاعلية ممتعة لإتقان قواعد النحو والإملاء</p>
                        <div style={{marginTop: '16px', background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: 'white', padding: '10px', borderRadius: '12px', textAlign: 'center', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(139,92,246,0.3)'}}>العب النحو 🎮</div>
                      </a>
                    </div>
                  )}

                  {student.stage === 'primary_5' && (
                    <div className={styles.cards} style={{marginBottom: '40px'}}>
                      <a href="/primary-5" className={styles.courseCard} style={{background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)', border: '2px solid #6ee7b7', textDecoration: 'none', boxShadow: '0 10px 25px rgba(5,150,105,0.12)'}}>
                        <div className={styles.cardHeader} style={{borderBottom: 'none', justifyContent: 'center'}}>
                          <h3 style={{color: '#064e3b', fontSize: '1.4rem', margin: '0', fontWeight: '900', textAlign: 'center'}}>بوابة الصف الخامس الابتدائي 🏫</h3>
                        </div>
                        <p style={{textAlign: 'center', color: '#047857', marginTop: '8px', fontSize: '0.92rem', fontWeight: 'bold'}}>المحاور الميدانية، علامات الإعراب، والمضاف إليه</p>
                        <div style={{marginTop: '16px', background: 'linear-gradient(135deg, #059669, #0d9488)', color: 'white', padding: '10px', borderRadius: '12px', textAlign: 'center', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(5,150,105,0.3)'}}>دخول البوابة 🚀</div>
                      </a>

                      <a href="/primary-5/grammar" className={styles.courseCard} style={{background: 'linear-gradient(135deg, #fef2f2, #fee2e2)', border: '2px solid #fca5a5', textDecoration: 'none', boxShadow: '0 10px 25px rgba(239,68,68,0.12)'}}>
                        <div className={styles.cardHeader} style={{borderBottom: 'none', justifyContent: 'center'}}>
                          <h3 style={{color: '#b91c1c', fontSize: '1.4rem', margin: '0', fontWeight: '900', textAlign: 'center'}}>مسار النحو والإعراب ⚖️</h3>
                        </div>
                        <p style={{textAlign: 'center', color: '#991b1b', marginTop: '8px', fontSize: '0.92rem', fontWeight: 'bold'}}>المفعول به وعلامات نصبه، والمضاف إليه وجره</p>
                        <div style={{marginTop: '16px', background: 'linear-gradient(135deg, #ef4444, #f87171)', color: 'white', padding: '10px', borderRadius: '12px', textAlign: 'center', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(239,68,68,0.3)'}}>ابدأ النحو 📖</div>
                      </a>

                      <a href="/grammar-games" className={styles.courseCard} style={{background: 'linear-gradient(135deg, #f5f3ff, #ede9fe)', border: '2px solid #c4b5fd', textDecoration: 'none', boxShadow: '0 10px 25px rgba(139,92,246,0.12)'}}>
                        <div className={styles.cardHeader} style={{borderBottom: 'none', justifyContent: 'center'}}>
                          <h3 style={{color: '#6d28d9', fontSize: '1.4rem', margin: '0', fontWeight: '900', textAlign: 'center'}}>صائد الإعراب والألعاب 🎯</h3>
                        </div>
                        <p style={{textAlign: 'center', color: '#7c3aed', marginTop: '8px', fontSize: '0.92rem', fontWeight: 'bold'}}>تحديات تفاعلية لعلامات الإعراب الأصلية والفرعية</p>
                        <div style={{marginTop: '16px', background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: 'white', padding: '10px', borderRadius: '12px', textAlign: 'center', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(139,92,246,0.3)'}}>العب النحو 🎮</div>
                      </a>
                    </div>
                  )}

                  {student.stage === 'primary_6' && (
                    <div className={styles.cards} style={{marginBottom: '40px'}}>
                      <a href="/primary-6" className={styles.courseCard} style={{background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)', border: '2px solid #6ee7b7', textDecoration: 'none', boxShadow: '0 10px 25px rgba(5,150,105,0.12)'}}>
                        <div className={styles.cardHeader} style={{borderBottom: 'none', justifyContent: 'center'}}>
                          <h3 style={{color: '#064e3b', fontSize: '1.4rem', margin: '0', fontWeight: '900', textAlign: 'center'}}>بوابة الشهادة الابتدائية (الصف السادس) 🎓</h3>
                        </div>
                        <p style={{textAlign: 'center', color: '#047857', marginTop: '8px', fontSize: '0.92rem', fontWeight: 'bold'}}>كان وأخواتها، إن وأخواتها، الأسماء الخمسة، والنعت</p>
                        <div style={{marginTop: '16px', background: 'linear-gradient(135deg, #059669, #0d9488)', color: 'white', padding: '10px', borderRadius: '12px', textAlign: 'center', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(5,150,105,0.3)'}}>دخول البوابة 🚀</div>
                      </a>

                      <a href="/primary-6/grammar" className={styles.courseCard} style={{background: 'linear-gradient(135deg, #fef2f2, #fee2e2)', border: '2px solid #fca5a5', textDecoration: 'none', boxShadow: '0 10px 25px rgba(239,68,68,0.12)'}}>
                        <div className={styles.cardHeader} style={{borderBottom: 'none', justifyContent: 'center'}}>
                          <h3 style={{color: '#b91c1c', fontSize: '1.4rem', margin: '0', fontWeight: '900', textAlign: 'center'}}>مسار النحو والنواسخ ⚖️</h3>
                        </div>
                        <p style={{textAlign: 'center', color: '#991b1b', marginTop: '8px', fontSize: '0.92rem', fontWeight: 'bold'}}>أنواع الخبر، الأفعال الناسخة والحروف الناسخة والضمائر</p>
                        <div style={{marginTop: '16px', background: 'linear-gradient(135deg, #ef4444, #f87171)', color: 'white', padding: '10px', borderRadius: '12px', textAlign: 'center', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(239,68,68,0.3)'}}>ابدأ النحو 📖</div>
                      </a>

                      <a href="/primary-6/quizzes" className={styles.courseCard} style={{background: 'linear-gradient(135deg, #f5f3ff, #ede9fe)', border: '2px solid #c4b5fd', textDecoration: 'none', boxShadow: '0 10px 25px rgba(139,92,246,0.12)'}}>
                        <div className={styles.cardHeader} style={{borderBottom: 'none', justifyContent: 'center'}}>
                          <h3 style={{color: '#6d28d9', fontSize: '1.4rem', margin: '0', fontWeight: '900', textAlign: 'center'}}>امتحانات المحافظات التفاعلية 🏆</h3>
                        </div>
                        <p style={{textAlign: 'center', color: '#7c3aed', marginTop: '8px', fontSize: '0.92rem', fontWeight: 'bold'}}>نماذج امتحانات الشهادة الابتدائية بتصحيح فوري</p>
                        <div style={{marginTop: '16px', background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: 'white', padding: '10px', borderRadius: '12px', textAlign: 'center', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(139,92,246,0.3)'}}>ابدأ الامتحانات 📝</div>
                      </a>
                    </div>
                  )}

                  {student.stage === 'prep_1' && (
                    <div className={styles.cards} style={{marginBottom: '40px'}}>
                      {/* Master Prep 1 Hub */}
                      <a href="/prep-1" className={styles.courseCard} style={{background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)', border: '2px solid #6ee7b7', textDecoration: 'none', boxShadow: '0 10px 25px rgba(5,150,105,0.12)'}}>
                        <div className={styles.cardHeader} style={{borderBottom: 'none', justifyContent: 'center'}}>
                          <h3 style={{color: '#064e3b', fontSize: '1.4rem', margin: '0', fontWeight: '900', textAlign: 'center'}}>بوابة الصف الأول الإعدادي 🏫</h3>
                        </div>
                        <p style={{textAlign: 'center', color: '#047857', marginTop: '8px', fontSize: '0.92rem', fontWeight: 'bold'}}>البلاغة، القراءة، النصوص، القواعد النحوية والإملاء</p>
                        <div style={{marginTop: '16px', background: 'linear-gradient(135deg, #059669, #0d9488)', color: 'white', padding: '10px', borderRadius: '12px', textAlign: 'center', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(5,150,105,0.3)'}}>دخول البوابة 🚀</div>
                      </a>

                      {/* Interactive Arabic Pathway Prep 1 */}
                      <a href="/prep-1/reading-and-texts" className={styles.courseCard} style={{background: 'linear-gradient(135deg, #fef2f2, #fee2e2)', border: '2px solid #fca5a5', textDecoration: 'none', boxShadow: '0 10px 25px rgba(239,68,68,0.12)'}}>
                        <div className={styles.cardHeader} style={{borderBottom: 'none', justifyContent: 'center'}}>
                          <h3 style={{color: '#b91c1c', fontSize: '1.4rem', margin: '0', fontWeight: '900', textAlign: 'center'}}>القراءة والنصوص (١٢ درساً) 🗺️</h3>
                        </div>
                        <p style={{textAlign: 'center', color: '#991b1b', marginTop: '8px', fontSize: '0.92rem', fontWeight: 'bold'}}>نصوص الاستماع، القراءة، والشعر بتلاوة صوتية تفاعلية</p>
                        <div style={{marginTop: '16px', background: 'linear-gradient(135deg, #ef4444, #f87171)', color: 'white', padding: '10px', borderRadius: '12px', textAlign: 'center', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(239,68,68,0.3)'}}>تصفح الدروس 📖</div>
                      </a>

                      {/* Grammar Games */}
                      <a href="/grammar-games" className={styles.courseCard} style={{background: 'linear-gradient(135deg, #f5f3ff, #ede9fe)', border: '2px solid #c4b5fd', textDecoration: 'none', boxShadow: '0 10px 25px rgba(139,92,246,0.12)'}}>
                        <div className={styles.cardHeader} style={{borderBottom: 'none', justifyContent: 'center'}}>
                          <h3 style={{color: '#6d28d9', fontSize: '1.4rem', margin: '0', fontWeight: '900', textAlign: 'center'}}>صائد الإعراب وتحديات النحو 🎯</h3>
                        </div>
                        <p style={{textAlign: 'center', color: '#7c3aed', marginTop: '8px', fontSize: '0.92rem', fontWeight: 'bold'}}>ألعاب تفاعلية لضبط الإعراب والأفعال الصحيحة والمعتلة</p>
                        <div style={{marginTop: '16px', background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: 'white', padding: '10px', borderRadius: '12px', textAlign: 'center', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(139,92,246,0.3)'}}>العب النحو 🎮</div>
                      </a>
                    </div>
                  )}

                  {student.stage === 'prep_2' && (
                    <div className={styles.cards} style={{marginBottom: '40px'}}>
                      {/* Master Prep 2 Hub */}
                      <a href="/prep-2" className={styles.courseCard} style={{background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)', border: '2px solid #6ee7b7', textDecoration: 'none', boxShadow: '0 10px 25px rgba(5,150,105,0.12)'}}>
                        <div className={styles.cardHeader} style={{borderBottom: 'none', justifyContent: 'center'}}>
                          <h3 style={{color: '#064e3b', fontSize: '1.4rem', margin: '0', fontWeight: '900', textAlign: 'center'}}>بوابة الصف الثاني الإعدادي 🏫</h3>
                        </div>
                        <p style={{textAlign: 'center', color: '#047857', marginTop: '8px', fontSize: '0.92rem', fontWeight: 'bold'}}>النصوص، القراءة، القواعد النحوية (المعرب والمبني، النعت، العطف) والقصة</p>
                        <div style={{marginTop: '16px', background: 'linear-gradient(135deg, #059669, #0d9488)', color: 'white', padding: '10px', borderRadius: '12px', textAlign: 'center', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(5,150,105,0.3)'}}>دخول البوابة 🚀</div>
                      </a>

                      {/* Interactive Arabic Pathway Prep 2 */}
                      <a href="/prep-2/reading-and-texts" className={styles.courseCard} style={{background: 'linear-gradient(135deg, #fef2f2, #fee2e2)', border: '2px solid #fca5a5', textDecoration: 'none', boxShadow: '0 10px 25px rgba(239,68,68,0.12)'}}>
                        <div className={styles.cardHeader} style={{borderBottom: 'none', justifyContent: 'center'}}>
                          <h3 style={{color: '#b91c1c', fontSize: '1.4rem', margin: '0', fontWeight: '900', textAlign: 'center'}}>القراءة والنصوص (١٢ درساً) 🗺️</h3>
                        </div>
                        <p style={{textAlign: 'center', color: '#991b1b', marginTop: '8px', fontSize: '0.92rem', fontWeight: 'bold'}}>مسار متكامل: شروحات، معاني، وتدريبات دسمة جداً ومكافآت</p>
                        <div style={{marginTop: '16px', background: 'linear-gradient(135deg, #ef4444, #f87171)', color: 'white', padding: '10px', borderRadius: '12px', textAlign: 'center', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(239,68,68,0.3)'}}>تصفح الدروس 📖</div>
                      </a>

                      {/* Grammar Games */}
                      <a href="/grammar-games" className={styles.courseCard} style={{background: 'linear-gradient(135deg, #f5f3ff, #ede9fe)', border: '2px solid #c4b5fd', textDecoration: 'none', boxShadow: '0 10px 25px rgba(139,92,246,0.12)'}}>
                        <div className={styles.cardHeader} style={{borderBottom: 'none', justifyContent: 'center'}}>
                          <h3 style={{color: '#6d28d9', fontSize: '1.4rem', margin: '0', fontWeight: '900', textAlign: 'center'}}>صائد الإعراب وتحديات النحو 🎯</h3>
                        </div>
                        <p style={{textAlign: 'center', color: '#7c3aed', marginTop: '8px', fontSize: '0.92rem', fontWeight: 'bold'}}>ألعاب تفاعلية لضبط الإعراب وتحديات النحو لجميع الصفوف</p>
                        <div style={{marginTop: '16px', background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: 'white', padding: '10px', borderRadius: '12px', textAlign: 'center', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(139,92,246,0.3)'}}>العب النحو 🎮</div>
                      </a>
                    </div>
                  )}

                  {student.stage === 'prep_3' && (
                    <div className={styles.cards} style={{marginBottom: '40px'}}>
                      <a href="/prep-3" className={styles.courseCard} style={{background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)', border: '2px solid #6ee7b7', textDecoration: 'none', boxShadow: '0 10px 25px rgba(5,150,105,0.12)'}}>
                        <div className={styles.cardHeader} style={{borderBottom: 'none', justifyContent: 'center'}}>
                          <h3 style={{color: '#064e3b', fontSize: '1.4rem', margin: '0', fontWeight: '900', textAlign: 'center'}}>بوابة الشهادة الإعدادية (الصف الثالث) 🏫</h3>
                        </div>
                        <p style={{textAlign: 'center', color: '#047857', marginTop: '8px', fontSize: '0.92rem', fontWeight: 'bold'}}>المشتقات، القراءة والنصوص، الإملاء، وبنك الامتحانات</p>
                        <div style={{marginTop: '16px', background: 'linear-gradient(135deg, #059669, #0d9488)', color: 'white', padding: '10px', borderRadius: '12px', textAlign: 'center', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(5,150,105,0.3)'}}>دخول البوابة 🚀</div>
                      </a>

                      <a href="/prep-3/reading-and-texts" className={styles.courseCard} style={{background: 'linear-gradient(135deg, #fef2f2, #fee2e2)', border: '2px solid #fca5a5', textDecoration: 'none', boxShadow: '0 10px 25px rgba(239,68,68,0.12)'}}>
                        <div className={styles.cardHeader} style={{borderBottom: 'none', justifyContent: 'center'}}>
                          <h3 style={{color: '#b91c1c', fontSize: '1.4rem', margin: '0', fontWeight: '900', textAlign: 'center'}}>القراءة والنصوص (١٢ درساً) 📖</h3>
                        </div>
                        <p style={{textAlign: 'center', color: '#991b1b', marginTop: '8px', fontSize: '0.92rem', fontWeight: 'bold'}}>الوحدات الثلاث كاملة بتلاوة صوتية وتصحيح تفاعلي</p>
                        <div style={{marginTop: '16px', background: 'linear-gradient(135deg, #ef4444, #f87171)', color: 'white', padding: '10px', borderRadius: '12px', textAlign: 'center', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(239,68,68,0.3)'}}>تصفح الدروس 📚</div>
                      </a>

                      <a href="/prep-3/grammar" className={styles.courseCard} style={{background: 'linear-gradient(135deg, #f5f3ff, #ede9fe)', border: '2px solid #c4b5fd', textDecoration: 'none', boxShadow: '0 10px 25px rgba(139,92,246,0.12)'}}>
                        <div className={styles.cardHeader} style={{borderBottom: 'none', justifyContent: 'center'}}>
                          <h3 style={{color: '#6d28d9', fontSize: '1.4rem', margin: '0', fontWeight: '900', textAlign: 'center'}}>قواعد النحو والمشتقات ⚖️</h3>
                        </div>
                        <p style={{textAlign: 'center', color: '#7c3aed', marginTop: '8px', fontSize: '0.92rem', fontWeight: 'bold'}}>اسم الفاعل، المبالغة، المفعول، الزمان والمكان، والآلة</p>
                        <div style={{marginTop: '16px', background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: 'white', padding: '10px', borderRadius: '12px', textAlign: 'center', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(139,92,246,0.3)'}}>ابدأ المشتقات 🎯</div>
                      </a>
                    </div>
                  )}

                  {student.stage === 'sec_1' && (
                    <div className={styles.cards} style={{marginBottom: '40px'}}>
                      <a href="/sec-1" className={styles.courseCard} style={{background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)', border: '2px solid #6ee7b7', textDecoration: 'none', boxShadow: '0 10px 25px rgba(5,150,105,0.12)'}}>
                        <div className={styles.cardHeader} style={{borderBottom: 'none', justifyContent: 'center'}}>
                          <h3 style={{color: '#064e3b', fontSize: '1.4rem', margin: '0', fontWeight: '900', textAlign: 'center'}}>بوابة الصف الأول الثانوي 🎓</h3>
                        </div>
                        <p style={{textAlign: 'center', color: '#047857', marginTop: '8px', fontSize: '0.92rem', fontWeight: 'bold'}}>النظام الحديث: النحو، البلاغة، الأدب، القراءة، وقصة عنترة</p>
                        <div style={{marginTop: '16px', background: 'linear-gradient(135deg, #059669, #0d9488)', color: 'white', padding: '10px', borderRadius: '12px', textAlign: 'center', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(5,150,105,0.3)'}}>دخول البوابة 🚀</div>
                      </a>

                      <a href="/sec-1/grammar" className={styles.courseCard} style={{background: 'linear-gradient(135deg, #fef2f2, #fee2e2)', border: '2px solid #fca5a5', textDecoration: 'none', boxShadow: '0 10px 25px rgba(239,68,68,0.12)'}}>
                        <div className={styles.cardHeader} style={{borderBottom: 'none', justifyContent: 'center'}}>
                          <h3 style={{color: '#b91c1c', fontSize: '1.4rem', margin: '0', fontWeight: '900', textAlign: 'center'}}>مسار النحو الثانوي ⚖️</h3>
                        </div>
                        <p style={{textAlign: 'center', color: '#991b1b', marginTop: '8px', fontSize: '0.92rem', fontWeight: 'bold'}}>كان وكاد التامة والناقصة، إعمال المشتقات، والمقصور والمنقوص</p>
                        <div style={{marginTop: '16px', background: 'linear-gradient(135deg, #ef4444, #f87171)', color: 'white', padding: '10px', borderRadius: '12px', textAlign: 'center', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(239,68,68,0.3)'}}>ابدأ النحو 📖</div>
                      </a>

                      <a href="/sec-1/rhetoric" className={styles.courseCard} style={{background: 'linear-gradient(135deg, #f5f3ff, #ede9fe)', border: '2px solid #c4b5fd', textDecoration: 'none', boxShadow: '0 10px 25px rgba(139,92,246,0.12)'}}>
                        <div className={styles.cardHeader} style={{borderBottom: 'none', justifyContent: 'center'}}>
                          <h3 style={{color: '#6d28d9', fontSize: '1.4rem', margin: '0', fontWeight: '900', textAlign: 'center'}}>مسار علم البيان (البلاغة) ✨</h3>
                        </div>
                        <p style={{textAlign: 'center', color: '#7c3aed', marginTop: '8px', fontSize: '0.92rem', fontWeight: 'bold'}}>التشبيه، الاستعارة، الكناية، والمجاز المرسل</p>
                        <div style={{marginTop: '16px', background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: 'white', padding: '10px', borderRadius: '12px', textAlign: 'center', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(139,92,246,0.3)'}}>ابدأ البلاغة 📜</div>
                      </a>
                    </div>
                  )}

                  {student.stage === 'sec_2' && (
                    <div className={styles.cards} style={{marginBottom: '40px'}}>
                      <a href="/sec-2" className={styles.courseCard} style={{background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)', border: '2px solid #6ee7b7', textDecoration: 'none', boxShadow: '0 10px 25px rgba(5,150,105,0.12)'}}>
                        <div className={styles.cardHeader} style={{borderBottom: 'none', justifyContent: 'center'}}>
                          <h3 style={{color: '#064e3b', fontSize: '1.4rem', margin: '0', fontWeight: '900', textAlign: 'center'}}>بوابة الصف الثاني الثانوي 🏫</h3>
                        </div>
                        <p style={{textAlign: 'center', color: '#047857', marginTop: '8px', fontSize: '0.92rem', fontWeight: 'bold'}}>القراءة الحرة والمتحررة، ونحو ٢ بكالوريا والبلاغة</p>
                        <div style={{marginTop: '16px', background: 'linear-gradient(135deg, #059669, #0d9488)', color: 'white', padding: '10px', borderRadius: '12px', textAlign: 'center', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(5,150,105,0.3)'}}>دخول البوابة 🚀</div>
                      </a>

                      <a href="/sec-2/unseen-reading" className={styles.courseCard} style={{background: 'linear-gradient(135deg, #fef2f2, #fee2e2)', border: '2px solid #fca5a5', textDecoration: 'none', boxShadow: '0 10px 25px rgba(239,68,68,0.12)'}}>
                        <div className={styles.cardHeader} style={{borderBottom: 'none', justifyContent: 'center'}}>
                          <h3 style={{color: '#b91c1c', fontSize: '1.4rem', margin: '0', fontWeight: '900', textAlign: 'center'}}>القراءة المتحررة (٢٠ اختباراً) 🎯</h3>
                        </div>
                        <p style={{textAlign: 'center', color: '#991b1b', marginTop: '8px', fontSize: '0.92rem', fontWeight: 'bold'}}>تدريبات متحررة تفاعلية كاملة مع معلم ذكي مرافق</p>
                        <div style={{marginTop: '16px', background: 'linear-gradient(135deg, #ef4444, #f87171)', color: 'white', padding: '10px', borderRadius: '12px', textAlign: 'center', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(239,68,68,0.3)'}}>ابدأ التدريبات 📝</div>
                      </a>

                      <a href="/sec-2/grammar" className={styles.courseCard} style={{background: 'linear-gradient(135deg, #f5f3ff, #ede9fe)', border: '2px solid #c4b5fd', textDecoration: 'none', boxShadow: '0 10px 25px rgba(139,92,246,0.12)'}}>
                        <div className={styles.cardHeader} style={{borderBottom: 'none', justifyContent: 'center'}}>
                          <h3 style={{color: '#6d28d9', fontSize: '1.4rem', margin: '0', fontWeight: '900', textAlign: 'center'}}>نحو ٢ بكالوريا والتأسيس ⚖️</h3>
                        </div>
                        <p style={{textAlign: 'center', color: '#7c3aed', marginTop: '8px', fontSize: '0.92rem', fontWeight: 'bold'}}>الأسماء الخمسة، الممنوع من الصرف، والنعت</p>
                        <div style={{marginTop: '16px', background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: 'white', padding: '10px', borderRadius: '12px', textAlign: 'center', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(139,92,246,0.3)'}}>ابدأ النحو 📖</div>
                      </a>
                    </div>
                  )}

                  {student.stage === 'sec_3' && (
                    <div className={styles.cards} style={{marginBottom: '40px'}}>
                      <a href="/sec-3" className={styles.courseCard} style={{background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)', border: '2px solid #6ee7b7', textDecoration: 'none', boxShadow: '0 10px 25px rgba(5,150,105,0.12)'}}>
                        <div className={styles.cardHeader} style={{borderBottom: 'none', justifyContent: 'center'}}>
                          <h3 style={{color: '#064e3b', fontSize: '1.4rem', margin: '0', fontWeight: '900', textAlign: 'center'}}>بوابة الشهادة الثانوية العامة 🎓</h3>
                        </div>
                        <p style={{textAlign: 'center', color: '#047857', marginTop: '8px', fontSize: '0.92rem', fontWeight: 'bold'}}>الوحدات السبع، مدارس الأدب، التجربة الشعرية، والبابل شيت</p>
                        <div style={{marginTop: '16px', background: 'linear-gradient(135deg, #059669, #0d9488)', color: 'white', padding: '10px', borderRadius: '12px', textAlign: 'center', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(5,150,105,0.3)'}}>دخول البوابة 🚀</div>
                      </a>

                      <a href="/sec-3/grammar" className={styles.courseCard} style={{background: 'linear-gradient(135deg, #fef2f2, #fee2e2)', border: '2px solid #fca5a5', textDecoration: 'none', boxShadow: '0 10px 25px rgba(239,68,68,0.12)'}}>
                        <div className={styles.cardHeader} style={{borderBottom: 'none', justifyContent: 'center'}}>
                          <h3 style={{color: '#b91c1c', fontSize: '1.4rem', margin: '0', fontWeight: '900', textAlign: 'center'}}>الوحدات النحوية الـ ٧ ⚖️</h3>
                        </div>
                        <p style={{textAlign: 'center', color: '#991b1b', marginTop: '8px', fontSize: '0.92rem', fontWeight: 'bold'}}>من الإملاء وحتى الممنوع من الصرف مع أسئلة الوزارة</p>
                        <div style={{marginTop: '16px', background: 'linear-gradient(135deg, #ef4444, #f87171)', color: 'white', padding: '10px', borderRadius: '12px', textAlign: 'center', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(239,68,68,0.3)'}}>ابدأ النحو 📖</div>
                      </a>

                      <a href="/sec-3/reading" className={styles.courseCard} style={{background: 'linear-gradient(135deg, #f5f3ff, #ede9fe)', border: '2px solid #c4b5fd', textDecoration: 'none', boxShadow: '0 10px 25px rgba(139,92,246,0.12)'}}>
                        <div className={styles.cardHeader} style={{borderBottom: 'none', justifyContent: 'center'}}>
                          <h3 style={{color: '#6d28d9', fontSize: '1.4rem', margin: '0', fontWeight: '900', textAlign: 'center'}}>البابل شيت وامتحانات الثانوية 🏆</h3>
                        </div>
                        <p style={{textAlign: 'center', color: '#7c3aed', marginTop: '8px', fontSize: '0.92rem', fontWeight: 'bold'}}>تطبيقات متحررة وامتحانات الوزارة السابقة بتصحيح فوري</p>
                        <div style={{marginTop: '16px', background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: 'white', padding: '10px', borderRadius: '12px', textAlign: 'center', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(139,92,246,0.3)'}}>ابدأ التدريب 🎯</div>
                      </a>
                    </div>
                  )}
                </>
              )}
              
              {courses.length === 0 && lessons.filter(l => !l.course_id).length === 0 && student.stage !== 'foundation' ? (
                <div style={{padding: '30px', textAlign: 'center', background: 'white', borderRadius: '15px', color: '#666', border: '1px dashed #ccc'}}>
                  <span style={{fontSize: '3rem', display: 'block', marginBottom: '10px'}}>📚</span>
                  <p>لا توجد كورسات متاحة حالياً. يرجى الانتظار حتى يقوم المعلم بإضافتها.</p>
                </div>
              ) : (
                <>
                  {/* Render Courses */}
                  {courses.length > 0 && (
                    <div style={{ marginBottom: '35px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>📚</span> الكورسات التعليمية
                          </h3>
                          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.88rem' }}>
                            سلاسل تعليمية متكاملة تشمل الشرح والتطبيقات
                          </p>
                        </div>
                        <span style={{ fontSize: '0.85rem', color: '#6d28d9', background: '#f5f3ff', padding: '4px 12px', borderRadius: '12px', fontWeight: 'bold' }}>
                          {courses.length} كورس
                        </span>
                      </div>
                      <div className={styles.cards}>
                        {courses.map(course => (
                          <div key={course.id} className={`${styles.courseCard} ${!student.isPremium ? styles.lockedCard : ''}`} style={{display: 'flex', flexDirection: 'column'}}>
                            <div className={styles.cardHeader}>
                              <h3 style={{fontSize: '1.2rem', fontWeight: 800}}>{course.title}</h3>
                            </div>
                            <p style={{fontSize: '0.9rem', color: '#64748b', marginBottom: '16px', flex: 1}}>{course.description}</p>
                            <a href={`/course?id=${course.id}`} className={styles.resumeBtn} style={{background: student.isPremium ? '#9333ea' : '#2563eb', marginTop: 'auto'}}>
                              تصفح الكورس 📚
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Render Standalone Lessons */}
                  {lessons.filter(l => !l.course_id).length > 0 && (
                    <div style={{ marginTop: '25px', marginBottom: '35px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>🎬</span> الحصص والدروس المستقلة
                          </h3>
                          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.88rem' }}>
                            شاهد حصص الشرح المصورة والتطبيقات العملية المضافة من المعلم
                          </p>
                        </div>
                        <span style={{ fontSize: '0.85rem', color: '#059669', background: '#ecfdf5', padding: '4px 12px', borderRadius: '12px', fontWeight: 'bold' }}>
                          {lessons.filter(l => !l.course_id).length} حصة متاحة
                        </span>
                      </div>
                      <div className={styles.cards}>
                        {lessons.filter(l => !l.course_id).map(lesson => (
                          <div key={lesson.id} className={`${styles.courseCard} ${!lesson.is_free && !student.isPremium ? styles.lockedCard : ''}`} style={{display: 'flex', flexDirection: 'column'}}>
                            <div className={styles.cardHeader}>
                              <h3 style={{fontSize: '1.2rem', fontWeight: 800}}>{lesson.title}</h3>
                              {lesson.is_free ? (
                                <span className={styles.freeBadge}>مجاني</span>
                              ) : (
                                <span className={styles.premiumBadge}>مدفوع 🔒</span>
                              )}
                            </div>
                            <p style={{fontSize: '0.9rem', color: '#64748b', marginBottom: '12px', flex: 1}}>
                              {lesson.description || 'شرح وتطبيقات تفاعلية على الدرس'}
                            </p>
                            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', fontSize: '0.82rem', color: '#475569', background: 'rgba(241, 245, 249, 0.7)', padding: '6px 10px', borderRadius: '10px'}}>
                              <span>النوع: {lesson.video_type === 'canva' ? 'عرض تفاعلي ✨' : 'فيديو درايف 🎬'}</span>
                              {lesson.points_reward ? <span style={{color: '#d97706', fontWeight: 'bold'}}>+{lesson.points_reward} نقطة 🌟</span> : null}
                            </div>
                            
                            {(lesson.is_free || student.isPremium) ? (
                              <a href={`/lesson?id=${lesson.id}`} className={styles.resumeBtn} style={{marginTop: 'auto'}}>مشاهدة الحصة ▶️</a>
                            ) : (
                              <button className={styles.subscribeBtn} onClick={() => alert('يرجى التواصل لتفعيل اشتراكك وفتح هذا الدرس')} style={{marginTop: 'auto'}}>
                                اشترك للفتح 🔓
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </section>
            </>
          )}

          {(activeTab === 'home' || activeTab === 'grades') && (
            <section className={styles.gradesSection}>
              <h2>أحدث النتائج</h2>
                {recentGrades.length === 0 ? (
                  <p style={{color: '#666', textAlign: 'center', padding: '20px', background: 'rgba(255, 255, 255, 0.5)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.8)', borderRadius: '15px'}}>لا توجد اختبارات سابقة.</p>
                ) : (
                <ul className={styles.gradesList}>
                  {recentGrades.map((grade, idx) => (
                    <li key={idx}>
                      <span className={styles.quizName}>{grade.quiz}</span>
                      <span className={styles.score}>{grade.score}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}
            </div>
            )}
          </>
        )}

        {activeTab === 'settings' && (
            <section className={styles.coursesSection} style={{maxWidth: '600px'}}>
              <h2>إعدادات الحساب ⚙️</h2>
              <form onSubmit={handleUpdateSettings} style={{display: 'flex', flexDirection: 'column', gap: '20px', background: 'rgba(255,255,255,0.95)', padding: '30px', borderRadius: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '1px solid rgba(255,255,255,0.5)', backdropFilter: 'blur(10px)'}}>
                {settingsMessage && <div style={{padding: '15px', background: '#ecfdf5', color: '#059669', borderRadius: '15px', textAlign: 'center', fontWeight: 'bold', border: '1px solid #a7f3d0'}}>{settingsMessage}</div>}
                
                <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                  <label style={{fontWeight: 'bold', color: '#334155'}}>الاسم الكامل</label>
                  <input 
                    type="text" 
                    value={settingsForm.full_name} 
                    onChange={e => setSettingsForm({...settingsForm, full_name: e.target.value})}
                    style={{padding: '15px', borderRadius: '15px', border: '2px solid #e2e8f0', outline: 'none', transition: 'border 0.3s', fontSize: '1rem', background: '#f8fafc'}}
                    onFocus={e => e.target.style.borderColor = '#10b981'}
                    onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                    required
                  />
                </div>
                
                <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                  <label style={{fontWeight: 'bold', color: '#334155'}}>رقم الواتساب</label>
                  <input 
                    type="tel" 
                    value={settingsForm.phone} 
                    onChange={e => setSettingsForm({...settingsForm, phone: e.target.value})}
                    style={{padding: '15px', borderRadius: '15px', border: '2px solid #e2e8f0', outline: 'none', transition: 'border 0.3s', fontSize: '1rem', background: '#f8fafc'}}
                    onFocus={e => e.target.style.borderColor = '#10b981'}
                    onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                    required
                  />
                </div>
                
                <div style={{display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px', background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)', padding: '20px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.02)'}}>
                  <label style={{fontWeight: '900', color: '#1e293b', fontSize: '1.1rem'}}>🔑 كود الطالب (لربط حساب ولي الأمر)</label>
                  <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
                    <input 
                      type="text" 
                      value={student.studentCode} 
                      readOnly
                      style={{padding: '15px', borderRadius: '15px', border: '2px dashed #a7f3d0', background: 'white', color: '#059669', fontWeight: '900', letterSpacing: '3px', width: '100%', fontSize: '1.2rem', textAlign: 'center'}}
                    />
                    <button 
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(student.studentCode);
                        alert('تم نسخ الكود بنجاح!');
                      }}
                      style={{padding: '15px 25px', background: 'linear-gradient(135deg, #059669, #10b981)', color: 'white', border: 'none', borderRadius: '15px', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: 'bold', boxShadow: '0 4px 0 #047857', transition: 'all 0.2s'}}
                      onMouseDown={e => {e.currentTarget.style.transform = 'translateY(4px)'; e.currentTarget.style.boxShadow = 'none'}}
                      onMouseUp={e => {e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 0 #047857'}}
                    >
                      نسخ الكود
                    </button>
                  </div>
                  <small style={{color: '#64748b', marginTop: '5px', fontWeight: 'bold'}}>أعط هذا الكود لولي أمرك ليتمكن من متابعة مستواك وتقاريرك بكل سهولة.</small>
                </div>

                <button type="submit" style={{padding: '15px', background: 'linear-gradient(to right, #10b981, #34d399)', color: 'white', border: 'none', borderRadius: '15px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem', marginTop: '20px', boxShadow: '0 4px 0 #059669', transition: 'all 0.2s'}}
                  onMouseDown={e => {e.currentTarget.style.transform = 'translateY(4px)'; e.currentTarget.style.boxShadow = 'none'}}
                  onMouseUp={e => {e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 0 #059669'}}
                >
                  حفظ التعديلات ✅
                </button>
              </form>
            </section>
          )}

      </main>

      {/* Activation Modal */}
      {showActivationModal && (
        <div style={{position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
          <div style={{background: 'rgba(255,255,255,0.95)', padding: '25px 20px', borderRadius: '24px', width: '92%', maxWidth: '450px', maxHeight: '90dvh', overflowY: 'auto', boxShadow: '0 20px 50px rgba(0,0,0,0.3)', border: '2px solid rgba(255,255,255,0.5)', position: 'relative', overflow: 'hidden'}}>
            
            <div style={{position: 'absolute', top: '-50px', right: '-50px', maxWidth: '', width: '100%', height: '150px', background: 'radial-gradient(circle, rgba(16,185,129,0.2) 0%, transparent 70%)'}}></div>

            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', position: 'relative'}}>
              <h2 style={{margin: 0, color: '#1e293b', fontWeight: '900', fontSize: '1.8rem'}}>تفعيل الاشتراك 💳</h2>
              <button onClick={() => setShowActivationModal(false)} style={{background: '#f1f5f9', border: 'none', width: '40px', height: '40px', borderRadius: '50%', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b', display: 'flex', justifyContent: 'center', alignItems: 'center', transition: 'background 0.2s'}} onMouseOver={e => e.currentTarget.style.background = '#e2e8f0'} onMouseOut={e => e.currentTarget.style.background = '#f1f5f9'}>×</button>
            </div>
            
            <div style={{marginBottom: '30px', paddingBottom: '30px', borderBottom: '2px dashed #e2e8f0', textAlign: 'center', position: 'relative'}}>
              <p style={{color: '#475569', marginBottom: '20px', fontSize: '1.1rem', fontWeight: 'bold'}}>اشترك الآن للوصول الكامل للمناهج والألعاب الذكية!</p>
              <button 
                onClick={() => router.push('/pricing')}
                style={{width: '100%', padding: '15px', background: 'linear-gradient(135deg, #059669, #0d9488)', color: 'white', border: 'none', borderRadius: '15px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 8px 20px rgba(5,150,105,0.3), 0 4px 0 #047857', transition: 'all 0.2s'}}
                onMouseDown={e => {e.currentTarget.style.transform = 'translateY(4px)'; e.currentTarget.style.boxShadow = 'none'}}
                onMouseUp={e => {e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.4), 0 4px 0 #2563eb'}}
              >
                الاشتراك والتفعيل المباشر (فودافون كاش / إنستاباي) 💳
              </button>
            </div>

            <form onSubmit={handleActivateCode}>
              <p style={{color: '#64748b', marginBottom: '15px', fontSize: '0.9rem', fontWeight: 'bold', textAlign: 'center'}}>أو استخدم كود التفعيل المطبوع:</p>
              
              <input 
                type="text" 
                placeholder="ALJ-XXXX-XXXX أو AI-XXXX-XXXX" 
                value={activationCode}
                onChange={(e) => setActivationCode(e.target.value.toUpperCase())}
                required
                dir="ltr"
                style={{width: '100%', padding: '15px', borderRadius: '8px', border: '2px dashed #cbd5e1', fontSize: '1.2rem', textAlign: 'center', letterSpacing: '2px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '20px', outline: 'none'}}
              />
              
              {activationMessage && (
                <div style={{padding: '10px', marginBottom: '20px', borderRadius: '5px', background: activationMessage.includes('✅') ? '#d1fae5' : '#fee2e2', color: activationMessage.includes('✅') ? '#065f46' : '#b91c1c', textAlign: 'center'}}>
                  {activationMessage}
                </div>
              )}

              <button 
                type="submit" 
                disabled={activationLoading || !activationCode}
                style={{width: '100%', padding: '15px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: activationLoading ? 'not-allowed' : 'pointer', opacity: (activationLoading || !activationCode) ? 0.7 : 1}}
              >
                {activationLoading ? 'جاري التفعيل...' : 'تأكيد وتفعيل'}
              </button>
            </form>
          </div>
        </div>
      )}
          {/* Interactive Unified Search Modal */}
      <StudentSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        lessons={lessons}
        courses={courses}
        studentStage={student?.stage || ''}
        student={student}
        onSwitchTab={(tab) => {
          setActiveTab(tab)
          setIsSearchOpen(false)
        }}
      />
    </div>
  )
}
