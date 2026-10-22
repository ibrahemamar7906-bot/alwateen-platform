'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../utils/supabase'
import styles from './page.module.css'
import { Bot, Key, CheckCircle, Clock, ArrowRight, LogOut, Trash2 } from 'lucide-react'
import { useToast } from '../components/ToastProvider'

export default function AssistantLinkPage() {
  const router = useRouter()
  const { showToast } = useToast()
  
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  
  const [linkStatus, setLinkStatus] = useState(null) // null, 'pending', 'approved'
  const [teacherName, setTeacherName] = useState('')
  
  const [code, setCode] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    checkStatus()
  }, [])

  const checkStatus = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)

      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (!prof || prof.role !== 'assistant') {
        router.push('/student-dashboard')
        return
      }
      setProfile(prof)

      // Check for existing link
      const { data: link, error } = await supabase
        .from('assistant_links')
        .select('status, teacher_id, profiles!teacher_id(full_name)')
        .eq('assistant_id', user.id)
        .maybeSingle()

      if (link) {
        setLinkStatus(link.status)
        setTeacherName(link.profiles?.full_name || 'المعلم')
        
        // If already approved, redirect to dashboard
        if (link.status === 'approved') {
          router.push('/teacher-assistant')
        }
      } else {
        setLinkStatus(null)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleLink = async (e) => {
    e.preventDefault()
    if (!code.trim()) return
    setSubmitting(true)

    try {
      // 1. Find teacher by code
      const { data: teacherCode } = await supabase
        .from('teacher_codes')
        .select('teacher_id')
        .eq('code', code.trim())
        .maybeSingle()

      if (!teacherCode) {
        showToast('الكود غير صحيح أو غير موجود', 'error')
        setSubmitting(false)
        return
      }

      // 2. Create pending link
      const { error } = await supabase
        .from('assistant_links')
        .insert([{
          assistant_id: user.id,
          teacher_id: teacherCode.teacher_id,
          status: 'pending'
        }])

      if (error) {
        if (error.code === '23505') { // Unique violation
          showToast('لديك طلب ربط مسبق بالفعل', 'error')
        } else {
          throw error
        }
      } else {
        showToast('تم إرسال الطلب للمعلم بنجاح!', 'success')
        checkStatus()
      }
    } catch (err) {
      console.error(err)
      showToast('حدث خطأ أثناء الربط', 'error')
    } finally {
      setSubmitting(false)
    }
  }
  
  const handleCancelLink = async () => {
    if (!confirm('هل أنت متأكد من إلغاء طلب الربط الحالي؟')) return
    try {
      await supabase.from('assistant_links').delete().eq('assistant_id', user.id)
      setLinkStatus(null)
      setCode('')
    } catch(err) {
      console.error(err)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) return <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'100vh' }}>جاري التحميل...</div>

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <Bot size={48} className={styles.icon} />
          <h1>بوابة المساعد الذكي</h1>
          <p>أهلاً بك يا {profile?.full_name}</p>
        </div>

        {linkStatus === 'pending' && (
          <div className={styles.statusBox}>
            <Clock size={32} color="#f59e0b" />
            <h2>طلبك قيد المراجعة</h2>
            <p>لقد قمت بإرسال طلب انضمام كـ مساعد للمعلم: <strong>{teacherName}</strong></p>
            <p className={styles.hint}>الرجاء الانتظار حتى يقوم المعلم بقبول طلبك من لوحة التحكم الخاصة به.</p>
            
            <button onClick={checkStatus} className={styles.refreshBtn}>
              تحديث الحالة
            </button>
            <button onClick={handleCancelLink} className={styles.cancelBtn}>
              <Trash2 size={16} /> إلغاء الطلب
            </button>
          </div>
        )}

        {linkStatus === 'approved' && (
          <div className={styles.statusBox}>
            <CheckCircle size={32} color="#10b981" />
            <h2>تم الربط بنجاح!</h2>
            <p>أنت الآن تعمل كمساعد للمعلم: <strong>{teacherName}</strong></p>
            <button onClick={() => router.push('/teacher-assistant')} className={styles.enterBtn}>
              الدخول للوحة المساعد <ArrowRight size={18} />
            </button>
          </div>
        )}

        {!linkStatus && (
          <form onSubmit={handleLink} className={styles.form}>
            <div className={styles.inputGroup}>
              <label>كود ربط المعلم</label>
              <div className={styles.inputWrapper}>
                <Key size={18} />
                <input 
                  type="text" 
                  placeholder="أدخل الكود (مثال: TCHR-XXXX)" 
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
              </div>
              <p className={styles.inputHint}>اطلب هذا الكود من المعلم الذي ستعمل معه</p>
            </div>
            
            <button type="submit" disabled={submitting} className={styles.submitBtn}>
              {submitting ? 'جاري التحقق...' : 'تأكيد وطلب الانضمام'}
            </button>
          </form>
        )}
        
        <button onClick={handleLogout} className={styles.logoutBtn}>
          <LogOut size={16} /> تسجيل الخروج
        </button>
      </div>
    </div>
  )
}