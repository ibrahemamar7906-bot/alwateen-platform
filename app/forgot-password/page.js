'use client'
import React, { useState } from 'react'
import { supabase } from '../../utils/supabase'
import Link from 'next/link'
import { Mail, KeyRound, AlertCircle, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react'
import styles from './page.module.css'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      // Create the reset link using the exact current origin (whether localhost or alwateen.com)
      const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/reset-password` : ''

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: redirectUrl
      })

      if (error) throw error
      setSuccess(true)
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء إرسال الرابط. تأكد من صحة البريد الإلكتروني.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.box}>
        <div className={styles.iconBox}>
          <KeyRound size={40} />
        </div>
        
        <h1 className={styles.title}>نسيت كلمة المرور؟</h1>
        
        {!success ? (
          <>
            <p className={styles.desc}>
              أدخل بريدك الإلكتروني المسجل لدينا وسنرسل لك رابطاً لإعادة تعيين كلمة المرور الخاصة بك.
            </p>
            
            {error && (
              <div className={styles.errorBox}>
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.inputGroup}>
                <label>البريد الإلكتروني</label>
                <div className={styles.inputWrapper}>
                  <Mail size={18} className={styles.inputIcon} />
                  <input 
                    type="email" 
                    required 
                    placeholder="student@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    dir="ltr"
                  />
                </div>
              </div>

              <button type="submit" className={styles.submitBtn} disabled={loading || !email}>
                {loading ? <Loader2 size={24} className="animate-spin" /> : 'إرسال رابط الاستعادة'}
              </button>
            </form>
          </>
        ) : (
          <div className={styles.successBox}>
            <CheckCircle2 size={40} />
            <p>تم إرسال طلبك بنجاح!</p>
            <p style={{ fontSize: '0.95rem', color: '#047857', fontWeight: 600, textAlign: 'center', lineHeight: '1.6' }}>
              إذا كان هذا البريد الإلكتروني مسجلاً لدينا، فستصلك رسالة تحتوي على رابط الاستعادة.
              <br />
              (إذا كان هناك خطأ في كتابة الإيميل، فلن تصلك الرسالة).
            </p>
            <p style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 500, marginTop: '5px' }}>
              * يرجى التحقق من صندوق الوارد ومجلد الرسائل المزعجة (Spam).
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
