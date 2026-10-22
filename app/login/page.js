'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../utils/supabase'
import styles from './page.module.css'
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle, ArrowRight, UserCircle, X, Check } from 'lucide-react'
import { useToast } from '../components/ToastProvider'

export default function Login() {
  const router = useRouter()
  const { showToast } = useToast()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [savedAccounts, setSavedAccounts] = useState([])
  const [isRememberMe, setIsRememberMe] = useState(true)

  useEffect(() => {
    
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
        if (profile) {
          const r = profile.role;
          if (r === 'admin') router.push('/admin-dashboard');
          else if (r === 'teacher' || r === 'teacher_pro' || r === 'assistant') router.push('/teacher-assistant');
          else if (r === 'parent') router.push('/parent-dashboard');
          else router.push('/student-dashboard');
        }
      }
    };
    checkSession();

    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search)
      if (searchParams.get('error') === 'session_conflict') {
        setError('تم تسجيل الخروج لأن حسابك تم فتحه من جهاز آخر. يرجى تسجيل الدخول مجدداً إذا أردت استخدام هذا الجهاز.')
      }
      try {
        const saved = JSON.parse(localStorage.getItem('aljunaidi_fast_logins') || '[]')
        setSavedAccounts(saved)
      } catch(e) {}
    }
  }, [])

  const executeLogin = async (email, password) => {
    setLoading(true)
    setError(null)
    try {
      // 1. تسجيل الدخول مع Supabase Auth
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      })
      if (signInError) throw signInError

      // 2. جلب الملف الشخصي من Supabase (الصلاحية، الاشتراك، المرحلة)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, role, status, subscription_end_date, stage')
        .eq('id', data.user.id)
        .single()

      if (profileError) {
        console.warn('⚠️ فشل جلب الملف الشخصي من profiles:', profileError.message)
      }

      // 3. تحديد الصلاحية من Supabase فقط
      let userRole = profile?.role || null

      // إذا فشل جلب الصلاحية من profiles، نستخدم دالة get_my_role (تتخطى RLS)
      if (!userRole) {
        console.warn('⚠️ الصلاحية فارغة من profiles، جاري المحاولة عبر get_my_role...')
        try {
          const { data: rpcRole, error: rpcError } = await supabase.rpc('get_my_role')
          if (!rpcError && rpcRole) {
            userRole = rpcRole
            console.log('✅ تم جلب الصلاحية من get_my_role:', userRole)
          } else {
            console.error('❌ فشل get_my_role أيضاً:', rpcError?.message)
          }
        } catch (rpcErr) {
          console.error('❌ خطأ في استدعاء get_my_role:', rpcErr)
        }
      }

      console.log('📋 نتيجة تسجيل الدخول:', { email: data.user.email, profileRole: profile?.role, userRole })

      // 4. إنشاء معرف جلسة فريد وتحديثه (بدون حجب التنفيذ)
      let sessionId = ''
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        sessionId = crypto.randomUUID()
      } else {
        sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2)
      }
      localStorage.setItem('active_session_id', sessionId)
      await supabase.from('profiles').update({ active_session_id: sessionId }).eq('id', data.user.id)

      // 5. حفظ بيانات الدخول السريع (بيانات العرض فقط)
      if (isRememberMe) {
        try {
          let saved = JSON.parse(localStorage.getItem('aljunaidi_fast_logins') || '[]')
          const existingIdx = saved.findIndex(a => a.email === data.user.email)
          const newAccount = {
            email: data.user.email,
            name: profile?.full_name || data.user.email.split('@')[0],
            role: userRole,
            token: btoa(encodeURIComponent(password))
          }
          if (existingIdx >= 0) saved[existingIdx] = newAccount
          else saved.push(newAccount)
          localStorage.setItem('aljunaidi_fast_logins', JSON.stringify(saved))
        } catch(e) {}
      }

      // 6. عرض رسالة النجاح
      showToast('تم تسجيل الدخول بنجاح، نرجوا منكم التواصل معنا في حالة وجود مشاكل', 'success', 5000)

      // 7. التوجيه بناءً على الصلاحية من Supabase فقط
      const searchParams = new URLSearchParams(window.location.search)
      const redirectUrl = searchParams.get('redirect')

      if (redirectUrl) router.push(redirectUrl)
      else if (userRole === 'admin') router.push('/admin-dashboard')
      else if (['teacher', 'teacher_pro', 'assistant'].includes(userRole)) router.push('/teacher-assistant')
      else if (userRole === 'parent') router.push('/parent-dashboard')
      else router.push('/student-dashboard')

    } catch (err) {
      console.error('❌ خطأ تسجيل الدخول:', err)
      setError('البريد الإلكتروني أو كلمة المرور غير صحيحة')
      showToast('البريد الإلكتروني أو كلمة المرور غير صحيحة', 'error')
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    await executeLogin(formData.email, formData.password)
  }

  const handleFastLogin = async (account) => {
    try {
      const password = decodeURIComponent(atob(account.token))
      await executeLogin(account.email, password)
    } catch (e) {
      setError('حدث خطأ في الدخول السريع، يرجى تسجيل الدخول يدوياً.')
      showToast('حدث خطأ في الدخول السريع، يرجى إدخال كلمة المرور يدوياً', 'warning')
    }
  }

  const removeSavedAccount = (email) => {
    const updated = savedAccounts.filter(a => a.email !== email)
    setSavedAccounts(updated)
    localStorage.setItem('aljunaidi_fast_logins', JSON.stringify(updated))
  }

  return (
    <div className={styles.container}>
      <div className={styles.glow1}></div>
      <div className={styles.glow2}></div>

      <div className={styles.formCard}>
        <Link href="/" className={styles.backHome}>
          <ArrowRight size={16} /> العودة للرئيسية
        </Link>

        <div className={styles.logoContainer}>
          <div className={styles.logoWrapper}>
            <img src="/logo.png?v=2" alt="منصة الوتين" width="60" height="60" />
          </div>
        </div>
        
        <h1 className={styles.title}>تسجيل الدخول</h1>
        <p className={styles.subtitle}>أهلاً بك مجدداً في منصة الوتين</p>

        {error && (
          <div className={styles.errorAlert}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {savedAccounts.length > 0 && (
          <div className={styles.fastLoginSection}>
            <h3 className={styles.fastLoginTitle}>الدخول السريع:</h3>
            <div className={styles.accountsList}>
              {savedAccounts.map((acc, idx) => (
                <div key={idx} className={styles.savedAccountCard}>
                  <button type="button" onClick={() => handleFastLogin(acc)} className={styles.accountBtn}>
                    {acc.avatar ? (
                      <img src={acc.avatar} alt={acc.name} className={styles.accountAvatar} />
                    ) : (
                      <div className={styles.accountAvatarPlaceholder}>
                        <UserCircle size={32} />
                      </div>
                    )}
                    <div className={styles.accountInfo}>
                      <span className={styles.accountName}>{acc.name}</span>
                      <span className={styles.accountEmail}>{acc.email}</span>
                    </div>
                  </button>
                  <button type="button" onClick={() => removeSavedAccount(acc.email)} className={styles.removeAccountBtn} title="إزالة الحساب">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
            <div className={styles.divider}>
              <span>أو باستخدام حساب آخر</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label>البريد الإلكتروني</label>
            <div className={styles.inputWrapper}>
              <Mail size={18} className={styles.inputIcon} />
              <input 
                type="email" 
                required 
                placeholder="example@gmail.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                dir="ltr"
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label>كلمة المرور</label>
            <div className={styles.inputWrapper}>
              <Lock size={18} className={styles.inputIcon} />
              <input 
                type={showPassword ? 'text' : 'password'} 
                required 
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                dir="ltr"
              />
              <button 
                type="button" 
                className={styles.togglePassBtn}
                onClick={() => setShowPassword(!showPassword)}
                aria-label="إظهار/إخفاء كلمة المرور"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className={styles.rememberMeGroup} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <label className={styles.checkboxLabel}>
                <div className={`${styles.checkbox} ${isRememberMe ? styles.checked : ''}`}>
                  {isRememberMe && <Check size={14} />}
                </div>
              <input 
                type="checkbox" 
                checked={isRememberMe}
                onChange={(e) => setIsRememberMe(e.target.checked)}
                className={styles.hiddenCheckbox}
              />
              <span>تذكر حسابي للدخول السريع</span>
            </label>
            <Link href="/forgot-password" style={{ color: '#10b981', fontSize: '0.85rem', textDecoration: 'none', fontWeight: '700' }}>
              نسيت كلمة المرور؟
            </Link>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            <LogIn size={20} />
            <span>{loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}</span>
          </button>
        </form>

        <p className={styles.footerText}>
          ليس لديك حساب؟ <Link href="/register">سجل الآن مجاناً</Link>
        </p>
      </div>
    </div>
  )
}

