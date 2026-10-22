'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../utils/supabase'
import styles from './page.module.css'
import { 
  User, 
  Phone, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  GraduationCap,
  Bot,
  AlertCircle,
  MessageCircle,
  Presentation,
  Users
} from 'lucide-react'

export default function Register() {
  const router = useRouter()
  const [step, setStep] = useState(1) // 1: Select Role, 2: Fill Form
  const [role, setRole] = useState('student') // student, parent, teacher
  const [stage, setStage] = useState('')
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  // Options for stages
  const stageGroups = [
    { label: 'مرحلة التأسيس', options: [
      { value: 'foundation', label: 'تأسيس ورياض أطفال (KG)' },
    ]},
    { label: 'المرحلة الابتدائية', options: [
      { value: 'primary_1', label: 'الصف الأول الابتدائي' },
      { value: 'primary_2', label: 'الصف الثاني الابتدائي' },
      { value: 'primary_3', label: 'الصف الثالث الابتدائي' },
      { value: 'primary_4', label: 'الصف الرابع الابتدائي' },
      { value: 'primary_5', label: 'الصف الخامس الابتدائي' },
      { value: 'primary_6', label: 'الصف السادس الابتدائي' },
    ]},
    { label: 'المرحلة الإعدادية', options: [
      { value: 'prep_1', label: 'الصف الأول الإعدادي' },
      { value: 'prep_2', label: 'الصف الثاني الإعدادي' },
      { value: 'prep_3', label: 'الصف الثالث الإعدادي' },
    ]},
    { label: 'المرحلة الثانوية', options: [
      { value: 'sec_1', label: 'الصف الأول الثانوي' },
      { value: 'sec_2', label: 'الصف الثاني الثانوي' },
      { value: 'sec_3', label: 'الصف الثالث الثانوي' },
    ]}
  ]

  const handleRoleSelection = (selectedRole) => {
    setRole(selectedRole)
    setStep(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (role === 'student' && !stage) {
      setError('يرجى اختيار المرحلة الدراسية')
      setLoading(false)
      return
    }

    try {
      // Security: Strictly enforce role to prevent "admin" forgery
      const safeRole = ['student', 'teacher', 'parent', 'assistant'].includes(role) ? role : 'student'

      const metaData = {
        full_name: formData.fullName.trim(),
        phone: formData.phone.trim(),
        role: safeRole
      }
      
      if (safeRole === 'student') {
        metaData.stage = stage
      }

      // 1. Sign up with Supabase
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          data: metaData
        }
      })

      if (signUpError) {
        console.error('Supabase Auth Error:', signUpError)
        throw signUpError
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/login')
      }, 3500)

    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء إرسال الطلب، يرجى المحاولة لاحقاً')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className={styles.container}>
        <div className={styles.glow1}></div>
        <div className={styles.glow2}></div>
        <div className={styles.successCard}>
          <div className={styles.successIcon}>
            <CheckCircle2 size={44} />
          </div>
          <h2>تم إرسال طلب الاشتراك بنجاح!</h2>
          <p>أهلاً بك في منصة الوتين التعليمية. سيتم تحويلك لصفحة تسجيل الدخول تلقائياً.</p>
          <div className={styles.whatsappNote}>
            <p style={{margin: 0, fontWeight: 700, color: '#064e3b'}}>
              لتأكيد الحساب وتفعيل الباقات المدفوعة فوراً، يرجى التواصل معنا عبر الواتساب:
            </p>
            <a href="https://wa.me/201507952002" target="_blank" rel="noopener noreferrer" className={styles.whatsappBtn}>
              <MessageCircle size={20} />
              <span>تواصل عبر الواتساب مباشرة</span>
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.glow1}></div>
      <div className={styles.glow2}></div>

      <div className={styles.formCard}>
        {step === 1 ? (
          <Link href="/" className={styles.backHome}>
            <ArrowRight size={16} /> العودة للرئيسية
          </Link>
        ) : (
          <button type="button" onClick={() => setStep(1)} className={styles.backStepBtn}>
            <ArrowRight size={16} /> رجوع
          </button>
        )}

        <div className={styles.logoContainer}>
          <div className={styles.logoWrapper}>
            <img src="/logo.png?v=2" alt="لوجو منصة الوتين" width="60" height="60" />
          </div>
        </div>
        
        <h1 className={styles.title}>طلب اشتراك جديد</h1>
        <p className={styles.subtitle}>سجل بياناتك الآن وانضم لمنظومة التعليم التفاعلي</p>

        {error && (
          <div className={styles.errorAlert}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {step === 1 && (
          <div className={styles.roleSelectionWrapper}>
            <button 
              className={styles.roleCardBig} 
              onClick={() => handleRoleSelection('student')}
            >
              <div className={styles.roleCardIcon}>
                <GraduationCap size={28} />
              </div>
              <div className={styles.roleCardContent}>
                <h3 className={styles.roleCardTitle}>حساب طالب</h3>
                <p className={styles.roleCardDesc}>
                  تعلم وتفاعل! احضر حصصك، تدرب، والعب ألعاب تعليمية.
                </p>
              </div>
            </button>

            <button 
              className={styles.roleCardBig} 
              onClick={() => handleRoleSelection('parent')}
            >
              <div className={styles.roleCardIcon}>
                <Users size={28} />
              </div>
              <div className={styles.roleCardContent}>
                <h3 className={styles.roleCardTitle}>ولي أمر</h3>
                <p className={styles.roleCardDesc}>
                  تابع أداء وتطور أبنائك الأكاديمي أولاً بأول.
                </p>
              </div>
            </button>

            <button 
              className={styles.roleCardBig} 
              onClick={() => handleRoleSelection('teacher')}
            >
              <div className={styles.roleCardIcon}>
                <Presentation size={28} />
              </div>
              <div className={styles.roleCardContent}>
                <h3 className={styles.roleCardTitle}>حساب معلم</h3>
                <p className={styles.roleCardDesc}>
                  اشتراكك كمعلم يتيح لك استخدام أدوات المنصة (السبورة الذكية، البث المباشر) كمنصتك الخاصة مع طلابك بكل استقلالية، ولا نتدخل فيهم. (نحن لا نوظف معلمين).
                </p>
              </div>
            </button>
            <button className={styles.roleCardBig} onClick={() => handleRoleSelection('assistant')}>
              <div className={styles.roleCardIcon}><Bot size={28} /></div>
              <div className={styles.roleCardContent}>
                <h3 className={styles.roleCardTitle}>حساب مساعد معلم</h3>
                <p className={styles.roleCardDesc}>سجل كمساعد لمعلمك، وسيُطلب منك كود الربط الخاص به فور دخولك.</p>
              </div>
            </button>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label>الاسم الكامل</label>
              <div className={styles.inputWrapper}>
                <User size={18} className={styles.inputIcon} />
                <input 
                  type="text" 
                  required 
                  placeholder="اكتب اسمك بالكامل"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label>رقم الهاتف (واتساب)</label>
              <div className={styles.inputWrapper}>
                <Phone size={18} className={styles.inputIcon} />
                <input 
                  type="tel" 
                  required 
                  placeholder="مثال: 01012345678"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  dir="ltr"
                />
              </div>
            </div>

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
                  placeholder="6 أحرف على الأقل"
                  minLength={6}
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

            {role === 'student' && (
              <div className={styles.inputGroup}>
                <label>المرحلة الدراسية</label>
                <select 
                  className={styles.gradeSelect}
                  required 
                  value={stage} 
                  onChange={(e) => setStage(e.target.value)}
                >
                  <option value="" disabled>-- اختر مرحلتك الدراسية --</option>
                  {stageGroups.map((group) => (
                    <optgroup key={group.label} label={group.label}>
                      {group.options.map(opt => (
                         <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            )}

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              <Sparkles size={20} />
              <span>{loading ? 'جاري إرسال الطلب...' : 'إرسال طلب الاشتراك'}</span>
            </button>
          </form>
        )}

        <p className={styles.footerText}>
          لديك حساب بالفعل؟ <Link href="/login">تسجيل الدخول</Link>
        </p>
      </div>
    </div>
  )
}
