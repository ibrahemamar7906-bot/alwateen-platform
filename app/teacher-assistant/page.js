'use client'
import AssistantsTab from '../components/TeacherAssistant/AssistantsTab'
import TeacherGameManagerModal from '../components/TeacherGameManagerModal'
import ExamBuilderTab from '../admin-dashboard/components/ExamBuilderTab'

import { useState, useEffect, useMemo } from 'react'
import {
  Menu, X, Wrench, Settings, CreditCard, LogOut,
  Lock, Zap, Video, Users, Star, ChevronLeft,
  Sparkles, Coins, Printer, Bot, Search, SlidersHorizontal, CheckCircle2
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../utils/supabase'
import styles from './page.module.css'

/* ══════════════════════════════
   TOOLS DATA — Free vs Premium
   
   STRATEGY:
   ► Free tools: Fully usable but with limits that teachers will naturally hit.
     The frustration of hitting the wall = best conversion moment.
   ► Premium tools: The high-value, time-saving features a real teacher needs daily.
   ► Live Classroom: Free to try (max 5 students) → Premium for unlimited.
══════════════════════════════ */
const FOUNDATION_GAMES = [
  {
    id: 'car-blending',
    title: 'سيارة دمج الحروف والفونكس',
    desc: 'سباق دمج أصوات الحروف وقراءة الكلمة مع فتح ستارة المفاجأة.',
    icon: '🏎️',
    href: '/kids-corner/car-blending',
    color: '#0284c7',
    badge: 'توليد AI + لانهائي'
  },
  {
    id: 'claw-machine',
    title: 'مخلب صيد الحروف الناقصة',
    desc: 'مخلب أركيد حركي لصيد الحرف الناقص وتثبيته في مكانه الصحيح.',
    icon: '🕹️',
    href: '/kids-corner/claw-machine',
    color: '#ec4899',
    badge: 'توليد AI + لانهائي'
  },
  {
    id: 'blending-rocks',
    title: 'تكسير صخور الفونكس',
    desc: 'تكسير الصخور الحركية ودمج أصوات الحروف لتكوين الكلمات.',
    icon: '🪨',
    href: '/kids-corner/blending-rocks',
    color: '#f97316',
    badge: 'توليد AI + لانهائي'
  },
  {
    id: 'word-train',
    title: 'قطار الكلمات الذكي',
    desc: 'تركيب عربات القطار واختيار الحرف المفقود للمرور بين المحطات.',
    icon: '🚂',
    href: '/kids-corner/train',
    color: '#2A52C7',
    badge: 'توليد AI + لانهائي'
  },
  {
    id: 'word-puzzle',
    title: 'تركيب وبازل الكلمات',
    desc: 'ترتيب الحروف المبعثرة وتركيب الكلمة الصحيحة مع التلميحات.',
    icon: '🧩',
    href: '/kids-corner/puzzle',
    color: '#8b5cf6',
    badge: 'توليد AI + لانهائي'
  },
  {
    id: 'quran-words',
    title: 'أنشطة وحلقات القرآن الكريم',
    desc: '114 سورة كاملة مع تحديد من آية كذا لآية كذا وتحدي ترتيب الكلمات والتلاوة.',
    icon: '🌿',
    href: '/kids-corner/quran-words',
    color: '#1A2E86',
    badge: 'المصحف كاملاً + تلاوة'
  },
  {
    id: 'arcade-mario',
    title: 'ماريو المعرفة والقفز',
    desc: 'مغامرات تفاعلية والقفز فوق العقبات بحل أسئلة الدرس واختباراتك.',
    icon: '🍄',
    href: '/kids-corner/games/mario',
    color: '#ef4444',
    badge: 'أسئلة المعلم + AI'
  },
  {
    id: 'arcade-subway',
    title: 'جري شوارع المعرفة (Subway)',
    desc: 'تفادي القطارات بسرعة والإجابة على أسئلة الاختبار.',
    icon: '🏃',
    href: '/kids-corner/games/subway',
    color: '#eab308',
    badge: 'أسئلة المعلم + AI'
  }
]

const ALL_TOOLS = [
  // ─── FREE (fully open, no sub needed) ───────────────────────
  {
    id: 'quizzes',
    tier: 'premium',
    category: 'exams',
    icon: '📝',
    title: 'الاختبارات التفاعلية',
    desc: 'صمم اختبارات ذكية وشاركها مع طلابك بخطوة واحدة.',
    href: '/teacher-assistant/quizzes',
    color: '#8b5cf6',
    accent: 'colorPurple',
    badge: null,
  },
  {
    id: 'whiteboard',
    tier: 'free',
    category: 'free',
    icon: '🎨',
    title: 'السبورة التفاعلية',
    desc: 'سبورة إلكترونية احترافية للرسم والشرح والكتابة — مجانية للأبد.',
    href: '/teacher-assistant/whiteboard',
    color: '#20c997',
    accent: 'colorTeal',
    badge: null,
  },
  {
    id: 'wheel',
    tier: 'free',
    category: 'free',
    icon: '🎡',
    title: 'عجلة الأسماء العشوائية',
    desc: 'اختر طالباً عشوائياً بعجلة حظ تفاعلية وممتعة للفصل.',
    href: '/teacher-assistant/wheel',
    color: '#2A52C7',
    accent: 'colorGreen',
    badge: null,
  },
  {
    id: 'question-bank',
    tier: 'free',
    category: 'exams',
    icon: '📦',
    title: 'بنك الأسئلة',
    desc: 'رفع أسئلة Excel وتشغيلها في الألعاب. مجاناً حتى 30 سؤال.',
    href: '/teacher-assistant/question-bank',
    color: '#3b82f6',
    accent: 'colorBlue',
    badge: 'حتى 30 سؤال',
  },
  {
    id: 'azkar',
    tier: 'free',
    category: 'free',
    icon: '📿',
    title: 'الأذكار الشاملة',
    desc: 'الدليل الشامل لأذكار الصباح والمساء بأدلتها الشرعية.',
    href: '/azkar',
    color: '#2A52C7',
    accent: 'colorTeal',
    badge: null,
  },
  {
    id: 'grammar-games',
    tier: 'free',
    category: 'games',
    icon: '🎮',
    title: 'ألعاب القواعد التفاعلية',
    desc: 'أسئلة نحوية تفاعلية يمكن مشاركتها مع الطلاب بشكل ممتع.',
    href: '/grammar-games',
    color: '#f59e0b',
    accent: 'colorAmber',
    badge: null,
  },
  {
    id: 'flashcards',
    tier: 'free',
    category: 'free',
    icon: '🃏',
    title: 'صانع البطاقات النحوية',
    desc: 'حول قواعد اللغة لصور تعليمية جذابة. مجاناً حتى 10 بطاقات.',
    href: '/teacher-assistant/flashcards',
    color: '#9333ea',
    accent: 'colorPurple',
    badge: 'حتى 10 بطاقات',
  },

  // ─── LIVE CLASSROOM — Free with strict limit ─────────────────
  {
    id: 'live-classroom',
    tier: 'freemium',
    category: 'live',
    icon: '🎥',
    title: 'الفصل الافتراضي المباشر',
    desc: 'فصل تفاعلي بالصوت والسبورة والألعاب. مجاناً حتى 5 طلاب — بلا حدود مع الاشتراك.',
    href: '/teacher-assistant/virtual-classroom',
    color: '#1A2E86',
    accent: 'colorGreen',
    badge: 'حتى 5 طلاب مجاناً',
    premiumBadge: 'طلاب غير محدودين 💎',
  },

  // ─── PREMIUM (locked without subscription) ───────────────────
  {
    id: 'kids-corner',
    tier: 'premium',
    category: 'games',
    icon: '🧸',
    title: 'ركن الأطفال والتأسيس',
    desc: 'سبورة الحروف، ألعاب، تلوين وقصص ناطقة للصفوف الأولى.',
    href: '/kids-corner',
    color: '#ec4899',
    whyPremium: 'محتوى متكامل ومتجدد شهرياً',
  },
  {
    id: 'certificates',
    tier: 'premium',
    category: 'management',
    icon: '🎓',
    title: 'صانع الشهادات الجماعي',
    desc: 'شهادات تقدير احترافية لعشرات الطلاب دفعة واحدة بتصدير PDF.',
    href: '/teacher-assistant/certificates',
    color: '#2563eb',
    whyPremium: 'يوفر ساعات من العمل اليدوي',
  },
  {
    id: 'leaderboard',
    tier: 'premium',
    category: 'management',
    icon: '🏆',
    title: 'لوحة الشرف التلقائية',
    desc: 'صورة لوحة شرف احترافية للطلاب المتميزين جاهزة للمشاركة فوراً.',
    href: '/teacher-assistant/leaderboard',
    color: '#d97706',
    whyPremium: 'يرفع تحفيز الطلاب بشكل مثبت',
  },
  {
    id: 'report',
    tier: 'premium',
    category: 'management',
    icon: '📊',
    title: 'تقارير أولياء الأمور',
    desc: 'تقارير أداء تُرسل على واتساب بصورة احترافية وجاهزة في ثوانٍ.',
    href: '/teacher-assistant/report',
    color: '#0ea5e9',
    whyPremium: 'احترافية تفرقك عن غيرك',
  },
  {
    id: 'tracker',
    tier: 'premium',
    category: 'management',
    icon: '📊',
    title: 'المتابع الذكي',
    desc: 'نظام إدارة شامل: تسجيل طلابك، المجموعات، الحضور والغياب، وحسابات الدفع.',
    href: '/teacher-assistant/tracker',
    color: '#1A2E86',
    whyPremium: 'الدفتر الوحيد الذي ستحتاجه كمعلم',
  },
  {
    id: 'interactive-flashcards',
    tier: 'premium',
    category: 'live',
    icon: '🗂️',
    title: 'البطاقات التعليمية التفاعلية',
    desc: 'اصنع رزم بطاقات وابثها مباشرة لطلابك في حصة تفاعلية (Live).',
    href: '/teacher-assistant/interactive-flashcards',
    color: '#ef4444',
    whyPremium: 'حول حصتك لتجربة تفاعلية مبهرة',
  },
  {
    id: 'quick-quizzes',
    tier: 'premium',
    category: 'exams',
    icon: '⚡',
    title: 'الاختبارات السريعة (QR)',
    desc: 'صمم اختباراً سريعاً واعرض باركود ليحله الطلاب وتظهر النتائج لحظياً.',
    href: '/teacher-assistant/quick-quizzes',
    color: '#f59e0b',
    whyPremium: 'تقييم فوري وحماسي للطلاب',
  },
  {
    id: 'schedule',
    tier: 'premium',
    category: 'management',
    icon: '🗓️',
    title: 'مصمم الجداول الدراسية',
    desc: 'جداول وخطط أسبوعية تُصدَّر كصور أنيقة جاهزة للنشر فوراً.',
    href: '/teacher-assistant/schedule',
    color: '#7c3aed',
    whyPremium: 'توفر 30 دقيقة أسبوعياً',
  },
  {
    id: 'lesson-planner',
    tier: 'premium',
    category: 'ai',
    icon: '🧠',
    title: 'مساعد تحضير الدروس الذكي',
    desc: 'ولّد خطة درس، ملخص، بطاقات، واختبارات بضغطة زر واحدة.',
    href: '/teacher-assistant/lesson-planner',
    color: '#2A52C7',
    whyPremium: 'يوفر لك 45 دقيقة في تحضير كل درس',
  },
  {
    id: 'document-editor',
    tier: 'premium',
    category: 'ai',
    icon: '📄✨',
    title: 'محرر المستندات والمذكرات الذكي (AI)',
    desc: 'محرر مذكرات وكتب A4 متكامل بإمكانيات الذكاء الاصطناعي لإعادة الصياغة والتوليد.',
    href: '/teacher-assistant/document-editor',
    color: '#2563eb',
    whyPremium: 'صياغة المذكرات بنقرة زر',
  },
  {
    id: 'writing-checker',
    tier: 'premium',
    category: 'ai',
    icon: '📝',
    title: 'المصحح الذكي للإملاء',
    desc: 'صحح التعبير والإملاء فورياً بالذكاء الاصطناعي بدقة عالية.',
    href: '/writing-checker',
    color: '#0ea5e9',
    whyPremium: 'AI يصحح بدلاً منك',
  },
  {
    id: 'pdf-to-images',
    tier: 'free',
    category: 'free',
    icon: '📑',
    title: 'محول PDF إلى صور (ZIP)',
    desc: 'حوّل مذكراتك وامتحاناتك لصور عالية النقاء وحمّلها دفعة واحدة بملف مضغوط بنفس الترتيب.',
    href: '/teacher-assistant/pdf-to-images',
    color: '#dc2626',
    accent: 'colorRed',
    badge: 'جديد ⚡',
  },
]

const AI_TOOLS = []; const OLD_AI_TOOLS = [
  {
    id: 'exam-builder',
    tier: 'ai',
    category: 'ai',
    icon: '🖨️',
    title: 'منشئ ومصمم الامتحانات الذكي (AI)',
    desc: 'صمم امتحانات A4 احترافية متكاملة للطباعة بنماذج الإجابة والعلامة المائية.',
    href: '/teacher-assistant/exam-builder',
    color: '#1A2E86',
    accent: 'colorGreen',
    costBadge: '5 كريديت 💎',
  },
  {
    id: 'lesson-planner',
    tier: 'ai',
    category: 'ai',
    icon: '🧠',
    title: 'مساعد تحضير الدروس الذكي',
    desc: 'ولّد خطة درس متكاملة، أهداف تعليمية، ملخص، بطاقات واختبار بضغطة زر واحدة.',
    href: '/teacher-assistant/lesson-planner',
    color: '#2A52C7',
    accent: 'colorGreen',
    costBadge: '3 كريديت 💎',
  },
  {
    id: 'document-editor',
    tier: 'ai',
    category: 'ai',
    icon: '📄✨',
    title: 'محرر المستندات والتحضير الذكي (AI)',
    desc: 'محرر مذكرات وكتب A4 متكامل مدعوم بالذكاء الاصطناعي لإعادة الصياغة والتوليد والطباعة.',
    href: '/teacher-assistant/document-editor',
    color: '#2563eb',
    accent: 'colorBlue',
    costBadge: '2 كريديت 💎',
  },
  {
    id: 'writing-checker',
    tier: 'ai',
    category: 'ai',
    icon: '📝🤖',
    title: 'المصحح الذكي للإملاء والتعبير',
    desc: 'صحح التعبير والإملاء فورياً بالذكاء الاصطناعي بدقة عالية وتغذية راجعة للطالب.',
    href: '/writing-checker',
    color: '#0ea5e9',
    accent: 'colorBlue',
    costBadge: '1 كريديت 💎',
  },
  {
    id: 'quizzes',
    tier: 'ai',
    category: 'ai',
    icon: '⚡🤖',
    title: 'إدارة وتوليد الاختبارات بالـ AI',
    desc: 'إنشاء وتعديل الاختبارات، واستخدام الذكاء الاصطناعي لتوليد بنوك الأسئلة فوراً.',
    href: '/teacher-assistant/quizzes',
    color: '#8b5cf6',
    accent: 'colorPurple',
    costBadge: 'توليد ذكي ⚡',
  },
]

const FREE_TOOLS     = ALL_TOOLS.filter(t => t.tier === 'free')
const FREEMIUM_TOOLS = ALL_TOOLS.filter(t => t.tier === 'freemium')
const PREMIUM_TOOLS  = ALL_TOOLS.filter(t => t.tier === 'premium')

/* ─── Search & Catalog Configuration ─── */
const CATEGORY_FILTERS = [
  { id: 'all', label: 'الكل' },
  { id: 'ai', label: '🤖 ذكاء اصطناعي (AI)' },
  { id: 'exams', label: '📝 اختبارات وتقييم' },
  { id: 'games', label: '🎮 ألعاب وتأسيس' },
  { id: 'live', label: '🎥 فصول تفاعلية ومباشرة' },
  { id: 'management', label: '📊 إدارة ومتابعة' },
  { id: 'free', label: '✨ أدوات مجانية' },
]

// Deduplicated unified catalog for comprehensive searching across all tools, games, and AI assistants
const COMBINED_CATALOG = [
  ...AI_TOOLS.map(t => ({ ...t, catalogId: `ai-${t.id}`, source: 'ai', category: 'ai' })),
  ...ALL_TOOLS.filter(t => !AI_TOOLS.some(ai => ai.id === t.id)).map(t => ({ ...t, catalogId: `tool-${t.id}`, source: 'tools' })),
  ...FOUNDATION_GAMES.map(g => ({ ...g, catalogId: `game-${g.id}`, tier: 'free', category: 'games', source: 'games', accent: 'colorBlue' }))
]

/* ══════════════════════════════
   MAIN COMPONENT
══════════════════════════════ */
export default function TeacherDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('tools')
  const [loading, setLoading] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const [teacher, setTeacher] = useState({
    id: '', role: '', linkedRole: '', name: '', phone: '', status: '', subscription_end_date: null, trial_status: 'none'
  })

  const [showActivationModal, setShowActivationModal] = useState(false)
  const [activationCodeInput, setActivationCodeInput] = useState('')
  const [activationMessage, setActivationMessage] = useState('')
  const [activationLoading, setActivationLoading] = useState(false)

  const [settingsForm, setSettingsForm] = useState({ full_name: '', phone: '' })
  const [settingsMessage, setSettingsMessage] = useState('')

  const [passwordForm, setPasswordForm] = useState({ password: '', confirmPassword: '' })
  const [passwordMessage, setPasswordMessage] = useState('')

  const [adminCustomCredits, setAdminCustomCredits] = useState('')
  const [adminRechargeLoading, setAdminRechargeLoading] = useState(false)
  const [adminRechargeMsg, setAdminRechargeMsg] = useState('')
  const [showGameManagerModal, setShowGameManagerModal] = useState(false)

  useEffect(() => { fetchTeacherData() }, [])

  const fetchTeacherData = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: profile, error } = await supabase
        .from('profiles').select('*').eq('id', user.id).single()

      if (error) throw error
      if (!['teacher', 'teacher_pro', 'admin', 'assistant'].includes(profile?.role)) {
        router.push('/student-dashboard'); return
      }
      let finalId = user.id;
        let subStatus = profile.status;
        let subEnd = profile.subscription_end_date;
        let trialStat = profile.trial_status || 'none';
        let linkedRole = '';

        if (profile?.role === 'assistant') {
          const { data: link } = await supabase
            .from('assistant_links')
            .select('teacher_id')
            .eq('assistant_id', user.id)
            .eq('status', 'approved')
            .maybeSingle();
            
          if (link) {
            finalId = link.teacher_id;
            // Fetch the linked teacher subscription details
            const { data: tProfile } = await supabase.from('profiles').select('status, subscription_end_date, trial_status, role').eq('id', finalId).single();
            if (tProfile) {
               subStatus = tProfile.status;
               subEnd = tProfile.subscription_end_date;
               trialStat = tProfile.trial_status || 'none';
               linkedRole = tProfile.role;
            }
          } else {
            router.push('/assistant-link');
            return;
          }
        } 
        setTeacher({
          id: finalId,
          role: profile.role,
          linkedRole: linkedRole,
          name: profile.full_name,
          phone: profile.phone || '',
          status: subStatus,
          subscription_end_date: subEnd,
          trial_status: trialStat,
          ai_credits_balance: profile.ai_credits_balance ?? 50
        })
      setSettingsForm({ full_name: profile.full_name, phone: profile.phone || '' })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleActivateCode = async (e) => {
    e.preventDefault()
    setActivationLoading(true)
    setActivationMessage('')
    try {
      const codeClean = activationCodeInput.trim()
      let res = null
      let error = null

      // Try modern redeem_activation_code first (handles AI credits cards & subscriptions)
      const { data: redeemData, error: redeemErr } = await supabase.rpc('redeem_activation_code', {
        p_code: codeClean
      })

      if (!redeemErr && redeemData && redeemData.success) {
        res = redeemData
      } else {
        // Fallback to legacy activate_subscription_code
        const { data: legacyData, error: legacyErr } = await supabase.rpc('activate_subscription_code', {
          p_user_id: teacher.id,
          p_code: codeClean
        })
        if (legacyErr || !legacyData?.success) {
          error = legacyErr || new Error(redeemData?.message || legacyData?.error || 'الكود غير صحيح أو مستخدم من قبل.')
        } else {
          res = legacyData
        }
      }

      if (error || !res?.success) {
        setActivationMessage(`❌ ${res?.message || res?.error || error?.message || 'الكود غير صحيح أو مستخدم من قبل.'}`)
        return
      }

      const isCreditOnly = res.is_credit_only || !res.subscription_end_date
      setActivationMessage(`✅ ${res.message || 'تم التفعيل بنجاح!'}`)
      setTeacher(prev => ({ 
        ...prev, 
        status: isCreditOnly ? prev.status : 'approved', 
        subscription_end_date: res.subscription_end_date || res.newEnd || prev.subscription_end_date,
        ai_credits_balance: res.new_credits_balance !== undefined ? res.new_credits_balance : ((prev.ai_credits_balance || 50) + (res.added_credits || 0))
      }))

      setTimeout(() => {
        setShowActivationModal(false)
        setActivationCodeInput('')
        setActivationMessage('')
      }, 3000)
    } catch (err) {
      setActivationMessage('❌ حدث خطأ أثناء التفعيل.')
    } finally {
      setActivationLoading(false)
    }
  }

  const handleAdminTopup = async (amount) => {
    if (!amount || isNaN(amount) || amount <= 0) {
      alert('يرجى تحديد عدد نقاط صحيح')
      return
    }
    setAdminRechargeLoading(true)
    setAdminRechargeMsg('')
    try {
      const { data, error } = await supabase.rpc('topup_ai_credits', {
        p_user_id: teacher.id,
        p_amount: amount,
        p_description: `شحن مباشر لحساب المدير (${amount} كريديت)`
      })

      let newBal = (Number(teacher.ai_credits_balance) || 0) + amount
      if (error) {
        console.warn('RPC topup failed, falling back to direct profiles update:', error)
        const { error: updErr } = await supabase
          .from('profiles')
          .update({ ai_credits_balance: newBal })
          .eq('id', teacher.id)
        if (updErr) throw updErr
      } else if (data && data.new_balance !== undefined) {
        newBal = Number(data.new_balance)
      }

      setTeacher(prev => ({ ...prev, ai_credits_balance: newBal }))
      setAdminRechargeMsg(`✅ تم شحن ${amount} كريديت بنجاح! الرصيد الجديد: ${newBal}`)
      setAdminCustomCredits('')
      setTimeout(() => {
        setAdminRechargeMsg('')
        setShowActivationModal(false)
      }, 1500)
    } catch (err) {
      console.error('Error in admin topup:', err)
      setAdminRechargeMsg(`❌ حدث خطأ: ${err.message || 'خطأ غير معروف'}`)
    } finally {
      setAdminRechargeLoading(false)
    }
  }

  const handleAdminSetBalance = async (targetBalance) => {
    setAdminRechargeLoading(true)
    setAdminRechargeMsg('')
    try {
      const { error: updErr } = await supabase
        .from('profiles')
        .update({ ai_credits_balance: targetBalance })
        .eq('id', teacher.id)
      if (updErr) throw updErr

      setTeacher(prev => ({ ...prev, ai_credits_balance: targetBalance }))
      setAdminRechargeMsg(`✅ تم تعيين رصيد المدير بنجاح إلى: ${targetBalance} كريديت!`)
      setTimeout(() => {
        setAdminRechargeMsg('')
        setShowActivationModal(false)
      }, 1500)
    } catch (err) {
      console.error('Error setting admin balance:', err)
      setAdminRechargeMsg(`❌ حدث خطأ: ${err.message || 'خطأ غير معروف'}`)
    } finally {
      setAdminRechargeLoading(false)
    }
  }

  const handleUpdateSettings = async (e) => {
    e.preventDefault()
    setSettingsMessage('جاري الحفظ...')
    try {
      await supabase.from('profiles')
        .update({ full_name: settingsForm.full_name, phone: settingsForm.phone })
        .eq('id', teacher.id)
      setTeacher(prev => ({ ...prev, name: settingsForm.full_name, phone: settingsForm.phone }))
      setSettingsMessage('✅ تم تحديث البيانات بنجاح')
      setTimeout(() => setSettingsMessage(''), 3000)
    } catch (err) {
      setSettingsMessage('❌ حدث خطأ أثناء الحفظ')
    }
  }

  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    if (passwordForm.password !== passwordForm.confirmPassword) {
      setPasswordMessage('❌ كلمتا المرور غير متطابقتين')
      return
    }
    setPasswordMessage('جاري التحديث...')
    try {
      const { error } = await supabase.auth.updateUser({ password: passwordForm.password })
      if (error) throw error
      setPasswordMessage('✅ تم تغيير كلمة المرور بنجاح')
      setPasswordForm({ password: '', confirmPassword: '' })
      setTimeout(() => setPasswordMessage(''), 3000)
    } catch (err) {
      setPasswordMessage('❌ حدث خطأ، يرجى المحاولة لاحقاً')
    }
  }

  const handleRequestTrial = async () => {
    try {
      const { error } = await supabase.from('profiles')
        .update({ trial_status: 'pending' })
        .eq('id', teacher.id)
      if (error) throw error
      setTeacher(prev => ({ ...prev, trial_status: 'pending' }))
      alert('تم إرسال الطلب بنجاح! سيقوم الأدمن بمراجعته قريباً.')
    } catch (err) {
      alert('حدث خطأ أثناء إرسال الطلب.')
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const isSubscribed = Boolean(
    teacher.role === 'admin' ||
    teacher.role === 'teacher_pro' ||
    (teacher.role === 'assistant' && (teacher.linkedRole === 'admin' || teacher.linkedRole === 'teacher_pro')) ||
    (teacher.status === 'approved' &&
      teacher.subscription_end_date &&
      new Date(teacher.subscription_end_date) > new Date())
  )

  const isActive = isSubscribed

  const daysLeft = teacher.subscription_end_date
    ? Math.max(0, Math.ceil((new Date(teacher.subscription_end_date) - new Date()) / (1000 * 60 * 60 * 24)))
    : 0

  const endDate = teacher.subscription_end_date
    ? new Date(teacher.subscription_end_date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })
    : null

  const firstName = teacher.name?.split(' ')[0] || 'أستاذ'

  // Filtered tools for instant search & category filtering
  const filteredCatalog = useMemo(() => {
    let list = COMBINED_CATALOG

    if (selectedCategory !== 'all') {
      if (selectedCategory === 'free') {
        list = list.filter(item => item.tier === 'free' || item.category === 'free')
      } else if (selectedCategory === 'ai') {
        list = list.filter(item => item.tier === 'ai' || item.category === 'ai')
      } else {
        list = list.filter(item => item.category === selectedCategory)
      }
    }

    const q = searchQuery.trim().toLowerCase()
    if (q) {
      list = list.filter(item => {
        const title = (item.title || '').toLowerCase()
        const desc = (item.desc || '').toLowerCase()
        const badge = (item.badge || item.costBadge || item.whyPremium || '').toLowerCase()
        return title.includes(q) || desc.includes(q) || badge.includes(q)
      })
    }

    return list
  }, [searchQuery, selectedCategory])

  /* ── LOADING ── */
  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.loadingContent}>
          <div className={styles.spinner}></div>
          <h2>منصة المعلم</h2>
          <p>جاري تحميل أدواتك...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.dashboard}>
      {isMobileMenuOpen && (
        <div className={styles.mobileOverlay} onClick={() => setIsMobileMenuOpen(false)} />
      )}

      

        

        {/* ═══════════ SIDEBAR ═══════════ */}
      <aside className={`${styles.sidebar} ${isMobileMenuOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <button className={styles.closeMenuBtn} onClick={() => setIsMobileMenuOpen(false)}>
            <X size={22} />
          </button>
        </div>

        {/* Logo */}
        <div className={styles.logo}>
          <span className={styles.logoIcon}>🎓</span>
          <h2>منصة المعلم</h2>
          <p>الوتين</p>
        </div>

        {/* User profile */}
        <div className={styles.userProfile}>
          <div className={styles.avatar}>{teacher.name?.charAt(0) || 'م'}</div>
          <div className={styles.userInfo}>
            <h4>أ. {firstName}</h4>
            <span className={styles.roleBadge}>{teacher.role === "admin" ? "👑 مدير المنصة" : teacher.role === "assistant" ? (teacher.linkedRole === "admin" ? "👨‍💻 مساعد إدمن" : "👨‍🏫 مساعد معلم") : "👨‍🏫 معلم"}</span>
          </div>
                </div>

        {(teacher.role === 'admin' || (teacher.role === 'assistant' && teacher.linkedRole === 'admin')) && (
          <div style={{ padding: '0 20px', marginBottom: '15px', marginTop: '-5px' }}>
            <a href="/admin-dashboard" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', background: 'linear-gradient(135deg, #1e293b, #0f172a)', color: '#f8fafc', borderRadius: '12px', textDecoration: 'none', fontWeight: 'bold', width: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', border: '1px solid #334155' }}>
               لوحة تحكم الإدارة 🛡️
            </a>
            <a href="/admin-live-ar" target="_blank" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', marginTop: '8px', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', color: '#ffffff', borderRadius: '12px', textDecoration: 'none', fontWeight: 'bold', width: '100%', boxShadow: '0 4px 12px rgba(139, 92, 246, 0.35)', border: '1px solid #a78bfa', fontSize: '0.88rem' }}>
               🖐️ لايف الواقع المعزز (AR Studio)
            </a>
          </div>
        )}

        {/* Subscription card */}
        <div className={styles.subCard}>
          {isActive ? (
            <div className={styles.subActive}>
              <div className={styles.subActiveDot}></div>
              <div>
                <div className={styles.subActiveLabel}>اشتراك مفعل 💎</div>
                <div className={styles.subExpiry}>
                  {daysLeft <= 7
                    ? <span style={{ color: '#f59e0b', fontWeight: 800 }}>⚠️ ينتهي بعد {daysLeft} يوم</span>
                    : `ينتهي ${endDate}`
                  }
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.subInactive}>
              <span>🔒 النسخة المجانية</span>
              <span className={styles.subInactiveHint}>جرّب — ثم اشترك</span>
            </div>
          )}
          <button className={styles.chargeBtn} onClick={() => setShowActivationModal(true)}>
            <CreditCard size={14} />
            {isActive ? 'تجديد الاشتراك' : 'ترقية الحساب'}
          </button>

          {/* AI Credits Card */}
          <div style={{
            marginTop: '10px',
            padding: '10px 14px',
            background: 'linear-gradient(135deg, #f5f3ff, #ede9fe)',
            borderRadius: '12px',
            border: '1px solid #ddd6fe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 6px rgba(124,58,237,0.06)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.2rem' }}>⚡</span>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.7rem', color: '#6d28d9', fontWeight: 'bold' }}>
                  {teacher.role === 'admin' ? '👑 رصيد الإدارة (المدير)' : 'رصيد الذكاء الاصطناعي'}
                </div>
                <div style={{ fontSize: '0.98rem', fontWeight: '900', color: '#3b0764' }}>
                  {teacher.ai_credits_balance ?? 50} <span style={{ fontSize: '0.7rem', fontWeight: 'bold' }}>كريديت</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowActivationModal(true)}
              style={{
                background: '#7c3aed',
                color: 'white',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '8px',
                fontSize: '0.72rem',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              {teacher.role === 'admin' ? '⚡ شحن مباشر' : '+ شحن'}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className={styles.nav}>
          <button
            className={`${styles.navItem} ${activeTab === 'tools' ? styles.navItemActive : ''}`}
            onClick={() => { setActiveTab('tools'); setIsMobileMenuOpen(false); }}
          >
            <Wrench size={16} />
            <span>أدواتي الذكية</span>
          </button>

          <button
            className={`${styles.navItem} ${activeTab === 'exam-builder' ? styles.navItemActive : ''}`}
            onClick={() => { setActiveTab('exam-builder'); setIsMobileMenuOpen(false); }}
          >
            <Printer size={16} />
            <span>منشئ الامتحانات AI 🖨️</span>
          </button>
          
          <button
            className={`${styles.navItem} ${activeTab === 'settings' ? styles.navItemActive : ''}`}
            onClick={() => { setActiveTab('settings'); setIsMobileMenuOpen(false); }}
          >
            <Settings size={16} />
            <span>إعدادات الحساب</span>
          </button>
          <button onClick={handleLogout} className={styles.navLogout}>
            <LogOut size={16} />
            <span>تسجيل الخروج</span>
          </button>
        </nav>
      </aside>

      {/* ═══════════ MAIN CONTENT ═══════════ */}
      <main className={styles.mainContent}>

        {/* Mobile top bar */}
        <header className={styles.header}>
          <div className={styles.headerTop} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button className={styles.hamburgerBtn} onClick={() => setIsMobileMenuOpen(true)}>
                <Menu size={20} />
                <span>القائمة</span>
              </button>
              <div>
                <h1 style={{ margin: 0 }}>
                  {activeTab === 'tools' ? `أهلاً، أ. ${firstName} 👋` : activeTab === 'exam-builder' ? 'منشئ ومصمم الامتحانات الذكي 🖨️' : 'إعدادات الحساب ⚙️'}
                </h1>
                <p style={{ margin: '4px 0 0 0' }}>
                  {activeTab === 'tools'
                    ? `${ALL_TOOLS.length} أداة ذكية + ميزات الذكاء الاصطناعي لمساعدتك في التدريس`
                    : activeTab === 'exam-builder'
                    ? 'صمم واطبع اختبارات A4 احترافية بنماذج الإجابة والعلامة المائية'
                    : 'قم بتحديث بياناتك الشخصية من هنا.'}
                </p>
              </div>
            </div>

          </div>
        </header>

        {/* ──── TOOLS TAB ──── */}
        {activeTab === 'tools' && (
          <div className={styles.toolsContent}>

            {/* ─── TEACHER SEARCH & CATEGORY FILTER ─── */}
            <div className={styles.teacherSearchContainer}>
              <div className={styles.searchBarWrapper}>
                <div className={styles.searchInputGroup}>
                  <Search className={styles.searchIcon} size={20} />
                  <input
                    type="text"
                    className={styles.teacherSearchInput}
                    placeholder="ابحث عن أي أداة، لعبة، اختبار، محرر، أو سبورة..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      className={styles.searchClearBtn}
                      onClick={() => setSearchQuery('')}
                      title="مسح البحث"
                      type="button"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                {/* Subscription Status Indicator */}
                <div className={styles.teacherStatusIndicator}>
                  {isSubscribed ? (
                    <span className={styles.statusBadgePro}>
                      <CheckCircle2 size={16} />
                      <span>{teacher.role === 'admin' ? 'مدير المنصة 👑 (مفتوح بالكامل)' : 'حساب مفعل 💎 (كامل الميزات مفتوحة)'}</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      className={styles.statusBadgeFree}
                      onClick={() => setShowActivationModal(true)}
                      title="اضغط للتفعيل أو الترقية"
                    >
                      <Lock size={14} />
                      <span>حساب مجاني (الميزات المتقدمة مقفلة)</span>
                      <span className={styles.upgradeInlineBtn}>ترقية ⚡</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Category Filter Chips */}
              <div className={styles.categoryChipsWrapper}>
                {CATEGORY_FILTERS.map((cat) => {
                  const isSelected = selectedCategory === cat.id
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      className={`${styles.categoryChip} ${isSelected ? styles.categoryChipActive : ''}`}
                      onClick={() => setSelectedCategory(cat.id)}
                    >
                      {cat.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* If search or category filter is active, show the unified search results view */}
            {(searchQuery.trim() !== '' || selectedCategory !== 'all') ? (
              <div className={styles.searchResultsSection}>
                <div className={styles.searchResultsHeader}>
                  <div className={styles.searchResultsCount}>
                    <SlidersHorizontal size={18} />
                    <span>نتائج التصفية والبحث: <strong>({filteredCatalog.length})</strong> أداة متوفرة</span>
                  </div>
                  <button
                    type="button"
                    className={styles.searchResetBtn}
                    onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                  >
                    إلغاء التصفية وعرض الكل ↺
                  </button>
                </div>

                {filteredCatalog.length === 0 ? (
                  <div className={styles.searchEmptyState}>
                    <div className={styles.emptyIcon}>🔍</div>
                    <h3>لم يتم العثور على أداة تطابق "{searchQuery}"</h3>
                    <p>جرّب البحث بكلمات أخرى أو اختر تصنيفاً آخر من القائمة أعلاه.</p>
                    <button
                      type="button"
                      className={styles.resetSearchBtn}
                      onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                    >
                      عرض جميع الأدوات
                    </button>
                  </div>
                ) : (
                  <div className={styles.toolsGrid}>
                    {filteredCatalog.map((item) => {
                      const isToolPremium = item.tier === 'premium'
                      const isLocked = isToolPremium && !isSubscribed

                      return (
                        <div
                          key={item.catalogId || item.id}
                          className={`${styles.toolCard} ${isLocked ? styles.toolCardLocked : ''} ${styles[item.accent] || ''}`}
                        >
                          <span className={styles.toolIcon}>{item.icon}</span>

                          {/* Top Badges */}
                          {isToolPremium ? (
                            isSubscribed ? (
                              <span className={styles.premiumPillUnlocked}>
                                ✓ مفعل باشتراكك 💎
                              </span>
                            ) : (
                              <span className={styles.premiumPill}>
                                🔒 بريميوم
                              </span>
                            )
                          ) : item.tier === 'ai' ? (
                            <span className={styles.aiBadgePill}>
                              {item.costBadge || 'AI ⚡'}
                            </span>
                          ) : item.badge ? (
                            <span className={styles.limitBadgePill}>
                              {item.badge}
                            </span>
                          ) : (
                            <span className={styles.freePill}>
                              مجاني ✓
                            </span>
                          )}

                          <h3>{item.title}</h3>
                          <p>{item.desc}</p>

                          {isLocked && item.whyPremium && (
                            <div className={styles.whyPremium}>✨ {item.whyPremium}</div>
                          )}

                          {/* Action Link / Locked Button */}
                          {isLocked ? (
                            <button
                              type="button"
                              className={styles.lockBtn}
                              onClick={() => setShowActivationModal(true)}
                            >
                              <Lock size={14} />
                              اشترك لفتح الأداة
                            </button>
                          ) : (
                            <a
                              href={item.href}
                              className={styles.toolArrow}
                              style={{ background: item.color || '#1A2E86' }}
                            >
                              {item.source === 'games' ? 'تشغيل اللعبة الآن' : 'فتح الأداة'} <ChevronLeft size={14} />
                            </a>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* ─── UPSELL BANNER (for non-subscribers) ─── */}
                {!isActive && (
                  <div className={styles.upsellBanner}>
                <div className={styles.upsellLeft}>
                  <div className={styles.upsellIcon}>💎</div>
                  <div>
                    <h3>افتح كامل الأدوات بأقل من وجبة!</h3>
                    <p>اشتراك شهري يوفر عليك ساعات من العمل ويرفع مستوى تدريسك 🚀</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button className={styles.upsellBtn} onClick={() => setShowActivationModal(true)}>
                    <Zap size={15} />
                    اشترك الآن
                  </button>
                  {teacher.trial_status === 'none' && (
                    <button onClick={handleRequestTrial} style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)', color: 'white', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold' }}>
                      🎁 طلب 7 أيام مجاناً
                    </button>
                  )}
                  {teacher.trial_status === 'pending' && (
                    <div style={{ color: 'rgba(255,255,255,0.9)', padding: '8px 16px', border: '1px dashed rgba(255,255,255,0.5)', borderRadius: '8px', fontSize: '0.9rem' }}>
                      ⏳ جاري مراجعة طلب التجربة
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ─── SECTION 1: الفصل الافتراضي (freemium) ─── */}
            <div className={styles.sectionHeader}>
              <span className={styles.sectionPillFreemium}>
                <Video size={13} />
                مباشر
              </span>
              <span className={styles.sectionTitle}>الفصل الافتراضي المباشر</span>
            </div>
            <div className={styles.liveClassCard}>
              <div className={styles.liveClassLeft}>
                <div className={styles.liveClassIcon}>🎥</div>
                <div>
                  <h3>الفصل الافتراضي التفاعلي</h3>
                  <p>سبورة ذكية + ألعاب + صوت + مشاركة الشاشة — كل شيء في مكان واحد.</p>
                  <div className={styles.liveFeatures}>
                    <span className={(isActive || teacher.role === 'admin') ? styles.liveFeatureOn : styles.liveFeatureLimited}>
                      <Users size={12} />
                      {(isActive || teacher.role === 'admin') ? 'مفتوح (باقة شاملة) 💎' : 'مغلق (للباقة الشاملة فقط)'}
                    </span>
                    <span className={styles.liveFeatureOn}>🎨 سبورة تفاعلية</span>
                    <span className={styles.liveFeatureOn}>🎮 ألعاب تنافسية</span>
                    <span className={(isActive || teacher.role === 'admin') ? styles.liveFeatureOn : styles.liveFeatureLimited}>
                      {(isActive || teacher.role === 'admin') ? '⭐ شهادات تلقائية 💎' : '🔒 شهادات (بريميوم)'}
                    </span>
                  </div>
                </div>
              </div>
              <div className={styles.liveClassActions} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {(isActive || teacher.role === 'admin') ? (
                  <>
                    <a href="/teacher-assistant/virtual-classroom" className={styles.liveEnterBtn}>
                      ابدأ الفصل الآن ←
                    </a>
                    {teacher.role === 'admin' && (
                      <a
                        href="/admin-live-ar"
                        target="_blank"
                        className={styles.liveEnterBtn}
                        style={{
                          background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                          boxShadow: '0 4px 14px rgba(139, 92, 246, 0.4)'
                        }}
                      >
                        🖐️ لايف الواقع المعزز (AR)
                      </a>
                    )}
                  </>
                ) : (
                  <button className={styles.liveUpgradeBtn} onClick={() => router.push('/pricing')}>
                    <Star size={13} />
                    ترقية للباقة الشاملة
                  </button>
                )}
              </div>
            </div>

            {/* ─── SECTION: ألعاب التأسيس والتحديات التفاعلية ─── */}
            <div className={styles.sectionHeader} style={{ marginTop: '36px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Sparkles size={12} />
                  توليد ذكي + يدوي
                </span>
                <span className={styles.sectionTitle}>ألعاب التأسيس والتحديات التفاعلية 🎮</span>
              </div>

              <button
                onClick={() => setShowGameManagerModal(true)}
                style={{
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '8px 18px',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(2, 132, 199, 0.35)'
                }}
              >
                <Sparkles size={16} />
                <span>إدارة الكلمات والأسئلة وتوليد AI 🤖</span>
              </button>
            </div>

            <div className={styles.toolsGrid}>
              {FOUNDATION_GAMES.map(game => (
                <a
                  key={game.id}
                  href={game.href}
                  className={styles.toolCard}
                  style={{
                    border: '1.5px solid #e0f2fe',
                    background: 'linear-gradient(180deg, #ffffff 0%, #f0f9ff 100%)'
                  }}
                >
                  <span className={styles.toolIcon}>{game.icon}</span>
                  <span
                    style={{
                      position: 'absolute',
                      top: '14px',
                      left: '14px',
                      background: '#e0f2fe',
                      color: '#0369a1',
                      padding: '3px 10px',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 800
                    }}
                  >
                    {game.badge}
                  </span>
                  <h3>{game.title}</h3>
                  <p>{game.desc}</p>
                  <div className={styles.toolArrow} style={{ background: game.color }}>
                    تشغيل اللعبة الآن <ChevronLeft size={14} />
                  </div>
                </a>
              ))}
            </div>

            {/* ─── SECTION 2: الأدوات المجانية ─── */}
            <div className={styles.sectionHeader} style={{ marginTop: '32px' }}>
              <span className={styles.sectionPillFree}>مجاني ✓</span>
              <span className={styles.sectionTitle}>أدوات مجانية — بلا قيود</span>
            </div>
            <div className={styles.toolsGrid}>
              {FREE_TOOLS.map(tool => (
                <a key={tool.id} href={tool.href} className={`${styles.toolCard} ${styles[tool.accent]}`}>
                  <span className={styles.toolIcon}>{tool.icon}</span>
                  <span className={styles.freePill}>مجاني ✓</span>
                  <h3>{tool.title}</h3>
                  <p>{tool.desc}</p>
                  {tool.badge && <div className={styles.limitBadge}>{tool.badge}</div>}
                  <div className={styles.toolArrow} style={{ background: tool.color }}>
                    فتح الأداة <ChevronLeft size={14} />
                  </div>
                </a>
              ))}
            </div>

            {/* ─── SECTION 3: الأدوات المميزة (Premium) ─── */}
            <div className={styles.sectionHeader} style={{ marginTop: '32px' }}>
              <span className={styles.sectionPillPremium}>بريميوم 💎</span>
              <span className={styles.sectionTitle}>أدوات توفر وقتك وترفع مستواك</span>
              {!isActive && (
                <button className={styles.subscribeNowBtn} onClick={() => setShowActivationModal(true)}>
                  <Zap size={14} />
                  اشترك لفتحها
                </button>
              )}
            </div>
            <div className={styles.toolsGrid}>
              {PREMIUM_TOOLS.map(tool => (
                <div key={tool.id} className={`${styles.toolCard} ${!isActive ? styles.toolCardLocked : ''}`}>
                  <span className={styles.toolIcon}>{tool.icon}</span>
                  {isActive ? (
                    <span className={styles.premiumPillUnlocked}>✓ بريميوم مفعل 💎</span>
                  ) : (
                    <span className={styles.premiumPill}>💎 بريميوم</span>
                  )}
                  <h3>{tool.title}</h3>
                  <p>{tool.desc}</p>
                  {!isActive && tool.whyPremium && (
                    <div className={styles.whyPremium}>✨ {tool.whyPremium}</div>
                  )}
                  {isActive ? (
                    <a href={tool.href} className={styles.toolArrow} style={{ background: tool.color }}>
                      فتح الأداة <ChevronLeft size={14} />
                    </a>
                  ) : (
                    <button className={styles.lockBtn} onClick={() => setShowActivationModal(true)}>
                      <Lock size={14} />
                      اشترك لفتح الأداة
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* ─── VALUE PROPOSITION (bottom upsell) ─── */}
            {!isActive && (
              <div className={styles.valueSection}>
                <h3>💡 ماذا يحصل المشتركون؟</h3>
                <div className={styles.valueGrid}>
                  {[
                    { icon: '⏱️', title: 'يوفر 2+ ساعة أسبوعياً', desc: 'الشهادات والتقارير تتعمل وحدها' },
                    { icon: '🏆', title: 'يرفع مستوى الطلاب', desc: 'لوحات الشرف والألعاب تحفز التنافس' },
                    { icon: '👨‍👩‍👧', title: 'يقوي علاقتك بالأهل', desc: 'تقارير واتساب احترافية تبني الثقة' },
                    { icon: '🎥', title: 'فصل بلا حدود', desc: 'طلاب غير محدودين في البث المباشر' },
                  ].map(v => (
                    <div key={v.title} className={styles.valueCard}>
                      <span className={styles.valueIcon}>{v.icon}</span>
                      <strong>{v.title}</strong>
                      <span>{v.desc}</span>
                    </div>
                  ))}
                </div>
                <button className={styles.valueCta} onClick={() => setShowActivationModal(true)}>
                  <Zap size={16} />
                  ابدأ اشتراكك الآن
                </button>
              </div>
            )}
              </>
            )}

          </div>
        )}

        {/* ──── EXAM BUILDER TAB ──── */}
        {activeTab === 'exam-builder' && (
          <div style={{ background: 'white', borderRadius: '20px', padding: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0' }}>
            <ExamBuilderTab 
              userCredits={teacher.ai_credits_balance ?? 50}
              onCreditDeducted={(newBal) => setTeacher(prev => ({ ...prev, ai_credits_balance: newBal }))}
            />
          </div>
        )}

        {/* ──── SETTINGS TAB ──── */}
        {activeTab === 'settings' && (
          <div className={styles.settingsContent}>
            <div className={styles.settingsCard}>
              <h3 style={{ marginBottom: '15px', color: '#1e293b' }}>تحديث البيانات الشخصية</h3>
              <form onSubmit={handleUpdateSettings} className={styles.settingsForm}>
                {settingsMessage && (
                  <div className={`${styles.settingsAlert} ${settingsMessage.includes('✅') ? styles.alertSuccess : styles.alertInfo}`}>
                    {settingsMessage}
                  </div>
                )}
                <div className={styles.formGroup}>
                  <label>الاسم الكامل</label>
                  <input
                    type="text"
                    value={settingsForm.full_name}
                    onChange={e => setSettingsForm({ ...settingsForm, full_name: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>رقم الواتساب</label>
                  <input
                    type="tel"
                    value={settingsForm.phone}
                    onChange={e => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                    required
                    dir="ltr"
                  />
                </div>
                <button type="submit" className={styles.saveBtn}>حفظ التعديلات</button>
              </form>
            </div>

            <div className={styles.settingsCard} style={{ marginTop: '20px' }}>
              <h3 style={{ marginBottom: '15px', color: '#1e293b' }}>تغيير كلمة المرور</h3>
              <form onSubmit={handleUpdatePassword} className={styles.settingsForm}>
                {passwordMessage && (
                  <div className={`${styles.settingsAlert} ${passwordMessage.includes('✅') ? styles.alertSuccess : styles.alertInfo}`}>
                    {passwordMessage}
                  </div>
                )}
                <div className={styles.formGroup}>
                  <label>كلمة المرور الجديدة</label>
                  <input
                    type="password"
                    value={passwordForm.password}
                    onChange={e => setPasswordForm({ ...passwordForm, password: e.target.value })}
                    required
                    minLength="6"
                    dir="ltr"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>تأكيد كلمة المرور</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    required
                    minLength="6"
                    dir="ltr"
                  />
                </div>
                <button type="submit" className={styles.saveBtn} style={{ background: '#3b82f6', boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)' }}>
                  تحديث كلمة المرور
                </button>
              </form>
            </div>

              {/* Assistant Management inside Settings */}
              {teacher.role !== 'assistant' && (
                <div style={{ marginTop: '20px' }}>
                  <AssistantsTab teacherId={teacher.id} />
                </div>
              )}
          </div>
        )}
      </main>

      {/* ═══════════ TEACHER GAME MANAGER & AI MODAL ═══════════ */}
      <TeacherGameManagerModal
        isOpen={showGameManagerModal}
        onClose={() => setShowGameManagerModal(false)}
        initialMode="words"
      />

      {/* ═══════════ ACTIVATION MODAL ═══════════ */}
      {showActivationModal && (
        <div
          className={styles.modalOverlay}
          onClick={e => e.target === e.currentTarget && setShowActivationModal(false)}
        >
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>{teacher.role === 'admin' ? '👑 لوحة شحن رصيد الإدارة المباشر' : 'ترقية حساب المعلم 💳'}</h2>
              <button onClick={() => setShowActivationModal(false)} className={styles.modalClose}>
                <X size={20} />
              </button>
            </div>

            {teacher.role === 'admin' ? (
              <div>
                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                  <div style={{ fontSize: '2.2rem', marginBottom: '4px' }}>👑 💎</div>
                  <h3 style={{ margin: '0 0 4px 0', color: '#581c87', fontWeight: 900, fontSize: '1.15rem' }}>
                    إدارة نقاط وكريديتس الذكاء الاصطناعي
                  </h3>
                  <p style={{ margin: 0, color: '#6b21a8', fontSize: '0.85rem' }}>
                    بصفتك مدير المنصة، يمكنك إضافة وتعديل رصيدك في أدوات المساعد الذكي وصانع الامتحانات فوراً.
                  </p>
                </div>

                {/* Current Balance */}
                <div style={{
                  background: 'linear-gradient(135deg, #f5f3ff, #ede9fe)',
                  border: '1.5px solid #ddd6fe',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '15px'
                }}>
                  <span style={{ fontWeight: 800, color: '#6d28d9', fontSize: '0.92rem' }}>رصيدك الحالي:</span>
                  <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#3b0764' }}>
                    {teacher.ai_credits_balance ?? 50} <span style={{ fontSize: '0.8rem' }}>💎 كريديت</span>
                  </span>
                </div>

                {adminRechargeMsg && (
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: '10px',
                    marginBottom: '14px',
                    fontSize: '0.88rem',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    background: adminRechargeMsg.includes('✅') ? '#ecfdf5' : '#fef2f2',
                    color: adminRechargeMsg.includes('✅') ? '#1A2E86' : '#dc2626',
                    border: `1px solid ${adminRechargeMsg.includes('✅') ? '#a7f3d0' : '#fecaca'}`
                  }}>
                    {adminRechargeMsg}
                  </div>
                )}

                {/* Quick Presets */}
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontWeight: 800, color: '#475569', fontSize: '0.86rem', marginBottom: '8px' }}>
                    ⚡ شحن سريع بضغطة زر واحدة:
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                    {[100, 500, 1000, 5000].map(amt => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => handleAdminTopup(amt)}
                        disabled={adminRechargeLoading}
                        style={{
                          background: 'white',
                          border: '1.5px solid #8b5cf6',
                          color: '#7c3aed',
                          padding: '10px 4px',
                          borderRadius: '10px',
                          fontWeight: 900,
                          fontSize: '0.9rem',
                          cursor: adminRechargeLoading ? 'not-allowed' : 'pointer',
                          transition: 'all 0.15s'
                        }}
                      >
                        +{amt} 💎
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Amount Form */}
                <form onSubmit={(e) => { e.preventDefault(); handleAdminTopup(parseInt(adminCustomCredits, 10)); }} style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontWeight: 800, color: '#475569', fontSize: '0.86rem', marginBottom: '6px' }}>
                    أو اكتب أي عدد مخصص تريده من النقاط:
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="number"
                      min="1"
                      value={adminCustomCredits}
                      onChange={(e) => setAdminCustomCredits(e.target.value)}
                      placeholder="مثال: 250 أو 2000"
                      style={{
                        flex: 1,
                        padding: '10px 12px',
                        borderRadius: '10px',
                        border: '1.5px solid #cbd5e1',
                        outline: 'none',
                        fontWeight: 'bold',
                        fontFamily: 'inherit',
                        fontSize: '0.95rem'
                      }}
                    />
                    <button
                      type="submit"
                      disabled={adminRechargeLoading || !adminCustomCredits}
                      style={{
                        background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                        color: 'white',
                        border: 'none',
                        padding: '10px 16px',
                        borderRadius: '10px',
                        fontWeight: 900,
                        cursor: (adminRechargeLoading || !adminCustomCredits) ? 'not-allowed' : 'pointer',
                        fontSize: '0.9rem',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {adminRechargeLoading ? 'جاري الشحن...' : '⚡ إضافة النقاط'}
                    </button>
                  </div>
                </form>

                {/* Unlimited / 99,999 Button */}
                <button
                  type="button"
                  onClick={() => handleAdminSetBalance(99999)}
                  disabled={adminRechargeLoading}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #2A52C7, #1A2E86)',
                    color: 'white',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '12px',
                    fontWeight: 900,
                    fontSize: '0.95rem',
                    cursor: adminRechargeLoading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginBottom: '15px'
                  }}
                >
                  <span>🚀 تفعيل رصيد غير محدود للأدمن (99,999 💎)</span>
                </button>

                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px', textAlign: 'center' }}>
                  <a
                    href="/admin-dashboard"
                    style={{
                      color: '#64748b',
                      fontSize: '0.85rem',
                      textDecoration: 'underline',
                      fontWeight: 'bold'
                    }}
                  >
                    الانتقال إلى لوحة تحكم المنصة الرئيسية ⚙️
                  </a>
                </div>
              </div>
            ) : (
              <div>
                {/* What they get */}
                <div className={styles.modalPerks}>
                  {['🎥 فصل بلا حدود من الطلاب', '🎓 صانع شهادات جماعي', '📊 تقارير واتساب تلقائية', '🧸 ركن الأطفال الكامل', '📝 مصحح ذكاء اصطناعي'].map(p => (
                    <div key={p} className={styles.modalPerk}><span>✓</span>{p}</div>
                  ))}
                </div>

                <button onClick={() => router.push('/pricing')} className={styles.onlinePayBtn}>
                  💳 الاشتراك والتفعيل المباشر (فودافون كاش / إنستاباي)
                </button>

                <div className={styles.modalDivider}>أو استخدم كود التفعيل</div>

                <form onSubmit={handleActivateCode}>
                  <input
                    type="text"
                    placeholder="كود الاشتراك أو شحن الكريديتس (AI-XXXX / TCH-XXXX / ALJ-XXXX)"
                    value={activationCodeInput}
                    onChange={e => setActivationCodeInput(e.target.value.toUpperCase())}
                    required
                    dir="ltr"
                    className={styles.codeInput}
                  />
                  {activationMessage && (
                    <div className={`${styles.activationMsg} ${activationMessage.includes('✅') ? styles.msgSuccess : styles.msgError}`}>
                      {activationMessage}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={activationLoading || !activationCodeInput}
                    className={styles.activateBtn}
                  >
                    {activationLoading ? 'جاري التفعيل...' : 'تأكيد وتفعيل'}
                  </button>
                </form>

                <div style={{
                  marginTop: '16px',
                  padding: '14px',
                  background: '#f5f3ff',
                  border: '1.5px solid #ddd6fe',
                  borderRadius: '14px',
                  textAlign: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#6d28d9', fontWeight: 900, fontSize: '0.92rem', marginBottom: '6px' }}>
                    <Sparkles size={16} />
                    <span>شحن باقات رصيد الذكاء الاصطناعي (AI Credits)</span>
                  </div>
                  <p style={{ margin: '0 0 10px 0', fontSize: '0.8rem', color: '#64748b' }}>
                    رصيد دائم لا تنتهي صلاحيته: باقة 100 كريديت (15 ج) • باقة 300 كريديت (35 ج)
                  </p>
                  <a
                    href={`https://wa.me/201010407906?text=${encodeURIComponent(`مرحباً، أرغب في شحن باقة رصيد ذكاء اصطناعي (AI Credits) لحسابي كمعلم:\nالاسم: ${teacher.name}\nرقم الهاتف: ${teacher.phone}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                      color: 'white',
                      textDecoration: 'none',
                      padding: '9px 18px',
                      borderRadius: '10px',
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      boxShadow: '0 2px 8px rgba(139, 92, 246, 0.25)'
                    }}
                  >
                    <span>طلب شحن رصيد AI فوري عبر واتساب ⚡</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

