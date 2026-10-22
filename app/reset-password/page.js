'use client'
import React, { useState, useEffect } from 'react'
import { supabase } from '../../utils/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowRight, Loader2, Key } from 'lucide-react'
import styles from '../forgot-password/page.module.css'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // When the user clicks the link in their email, Supabase redirects them here
    // with a hash fragment containing the access token. 
    // Supabase JS library automatically detects this and establishes the session!
    // We just need to verify they are actually logged in via the recovery link.
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setError('رابط غير صالح أو منتهي الصلاحية. يرجى طلب رابط جديد.')
      }
    }
    checkSession()
    
    // Also listen to hash changes just in case
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        // User is ready to reset password
        setError(null)
      }
    })
    
    return () => authListener.subscription.unsubscribe()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      setError('كلمات المرور غير متطابقة!')
      return
    }
    if (password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      // Update the user's password using the active session from the recovery link
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) throw error
      
      setSuccess(true)
      
      // Update saved accounts if it exists in fast login
      const saved = JSON.parse(localStorage.getItem('aljunaidi_fast_logins') || '[]')
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const existingIdx = saved.findIndex(a => a.email === user.email)
        if (existingIdx >= 0) {
          saved[existingIdx].token = btoa(encodeURIComponent(password))
          localStorage.setItem('aljunaidi_fast_logins', JSON.stringify(saved))
        }
      }

      // Sign the user out immediately so the session is killed
      // This forces them to log in with the new password and makes sure the reset link/session cannot be reused.
      await supabase.auth.signOut()

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login')
      }, 3000)
      
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء تغيير كلمة المرور.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.box}>
        <div className={styles.iconBox}>
          <Key size={40} />
        </div>
        
        <h1 className={styles.title}>كلمة مرور جديدة</h1>
        
        {!success ? (
          <>
            <p className={styles.desc}>
              أدخل كلمة المرور الجديدة الخاصة بحسابك. يرجى حفظها في مكان آمن.
            </p>
            
            {error && (
              <div className={styles.errorBox}>
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.inputGroup}>
                <label>كلمة المرور الجديدة</label>
                <div className={styles.inputWrapper}>
                  <Lock size={18} className={styles.inputIcon} />
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    required 
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    dir="ltr"
                    disabled={!!error && error.includes('غير صالح')} // Disable if invalid link
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', left: '15px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label>تأكيد كلمة المرور</label>
                <div className={styles.inputWrapper}>
                  <Lock size={18} className={styles.inputIcon} />
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    required 
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    dir="ltr"
                    disabled={!!error && error.includes('غير صالح')}
                  />
                </div>
              </div>

              <button type="submit" className={styles.submitBtn} disabled={loading || !password || (!!error && error.includes('غير صالح'))}>
                {loading ? <Loader2 size={24} className="animate-spin" /> : 'تحديث كلمة المرور'}
              </button>
            </form>
          </>
        ) : (
          <div className={styles.successBox}>
            <CheckCircle2 size={40} />
            <p>تم تغيير كلمة المرور بنجاح!</p>
            <p style={{ fontSize: '0.9rem', color: '#047857', fontWeight: 500 }}>
              جاري تحويلك لصفحة تسجيل الدخول...
            </p>
          </div>
        )}

        <Link href="/login" className={styles.backLink}>
          <ArrowRight size={18} />
          العودة لتسجيل الدخول
        </Link>
      </div>
    </div>
  )
}
