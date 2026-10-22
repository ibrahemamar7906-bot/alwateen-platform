'use client'

import { useState, useEffect } from 'react'
import {
  Menu, X, ClipboardList, Users, BookOpen, GraduationCap,
  FileText, MessageCircle, Bot, Wrench, CreditCard, Bell, Globe,
  Eye, LogOut, Video, Layers, UserCheck, Printer, Loader2, Sparkles, Mic
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../utils/supabase'
import { UNIFIED_AI_MODELS, DEFAULT_AI_MODEL } from '../../utils/aiModels'
import Link from 'next/link'
import styles from './page.module.css'
import RequestsTab from './components/RequestsTab'
import StudentsTab from './components/StudentsTab'
import TeachersTab from './components/TeachersTab'
import CoursesTab from './components/CoursesTab'
import CodesTab from './components/CodesTab'
import HomeworkTab from './components/HomeworkTab'
import QATab from './components/QATab'
import LessonsTab from './components/LessonsTab'
import AssistantTab from './components/AssistantTab'
import NotificationsTab from './components/NotificationsTab'
import PreviewTab from './components/PreviewTab'
import AdminCommunityTab from './components/AdminCommunityTab'
import QuizManagerTab from './components/QuizManagerTab'
import ExamBuilderTab from './components/ExamBuilderTab'
import AudioRecorderTab from './components/AudioRecorderTab'
import AssistantsTab from '../components/TeacherAssistant/AssistantsTab'



const ALL_STAGES = [
  // المرحلة الابتدائية (عام وأزهر)
  {id: 'primary_1', label: 'الصف الأول الابتدائي (عام)'},
  {id: 'primary_1_azhar', label: 'الصف الأول الابتدائي (أزهري)'},
  {id: 'primary_2', label: 'الصف الثاني الابتدائي (عام)'},
  {id: 'primary_2_azhar', label: 'الصف الثاني الابتدائي (أزهري)'},
  {id: 'primary_3', label: 'الصف الثالث الابتدائي (عام)'},
  {id: 'primary_3_azhar', label: 'الصف الثالث الابتدائي (أزهري)'},
  {id: 'primary_4', label: 'الصف الرابع الابتدائي (عام)'},
  {id: 'primary_4_azhar', label: 'الصف الرابع الابتدائي (أزهري)'},
  {id: 'primary_5', label: 'الصف الخامس الابتدائي (عام)'},
  {id: 'primary_5_azhar', label: 'الصف الخامس الابتدائي (أزهري)'},
  {id: 'primary_6', label: 'الصف السادس الابتدائي (عام)'},
  {id: 'primary_6_azhar', label: 'الصف السادس الابتدائي (أزهري)'},

  // المرحلة الإعدادية (عام وأزهر)
  {id: 'prep_1', label: 'الصف الأول الإعدادي (عام)'},
  {id: 'prep_1_azhar', label: 'الصف الأول الإعدادي (أزهري)'},
  {id: 'prep_2', label: 'الصف الثاني الإعدادي (عام)'},
  {id: 'prep_2_azhar', label: 'الصف الثاني الإعدادي (أزهري)'},
  {id: 'prep_3', label: 'الصف الثالث الإعدادي (عام)'},
  {id: 'prep_3_azhar', label: 'الصف الثالث الإعدادي (أزهري)'},

  // المرحلة الثانوية (عام وأزهر)
  {id: 'sec_1', label: 'الصف الأول الثانوي (عام)'},
  {id: 'sec_1_azhar', label: 'الصف الأول الثانوي (أزهري)'},
  {id: 'sec_2', label: 'الصف الثاني الثانوي (عام)'},
  {id: 'sec_2_azhar_sci', label: 'الصف الثاني الثانوي (أزهري - علمي)'},
  {id: 'sec_2_azhar_art', label: 'الصف الثاني الثانوي (أزهري - أدبي)'},
  {id: 'sec_3', label: 'الصف الثالث الثانوي (عام)'},
  {id: 'sec_3_azhar_sci', label: 'الصف الثالث الثانوي (أزهري - علمي)'},
  {id: 'sec_3_azhar_art', label: 'الصف الثالث الثانوي (أزهري - أدبي)'},
];

const NAV_GROUPS = [
  {
    label: 'مختبر الواقع المعزز والأدوات التفاعلية 🖐️',
    items: [
      { id: 'ar-live-studio', label: 'اللايف بالواقع المعزز (AR Studio 🖐️)', icon: Sparkles, href: '/admin-live-ar', badge: 'جديد / تجريبي 👑' },
    ]
  },
  {
    label: 'إدارة النظام',
    items: [
      { id: 'requests', label: 'طلبات الاشتراك', icon: ClipboardList },
      { id: 'students', label: 'إدارة الطلاب', icon: Users },
      { id: 'teachers', label: 'صلاحيات المعلمين', icon: UserCheck },
      { id: 'my-assistants', label: 'مساعديني', icon: Users },
    ]
  },
  {
    label: 'المحتوى التعليمي',
    items: [
      { id: 'courses', label: 'المناهج', icon: BookOpen },
      { id: 'lessons', label: 'الدروس والشروحات', icon: GraduationCap },
      { id: 'homework', label: 'الواجبات المنزلية', icon: FileText },
      { id: 'qa', label: 'أسئلة الطلاب (Q&A)', icon: MessageCircle },
    ]
  },
  {
    label: 'أدوات الإدارة والمنصة',
    items: [
      { id: 'quiz', label: 'إدارة الاختبارات', icon: FileText },
      { id: 'exam-builder', label: 'منشئ الامتحانات AI', icon: Printer },
      { id: 'audio-recorder', label: 'مسجل الصوت واختيار الميكروفون 🎙️', icon: Mic, badge: 'جديد ⚡' },
      { id: 'assistant', label: 'مساعد الذكاء AI', icon: Bot },
      { id: 'codes', label: 'رموز التفعيل', icon: CreditCard },
      { id: 'notifications', label: 'إرسال الإشعارات', icon: Bell },
      { id: 'community', label: 'مجتمع الطلاب', icon: Globe },
      { id: 'preview', label: 'معاينة المنصة / النظام', icon: Eye },
    ]
  },
    {
    label: 'أدوات المعلم التفاعلية',
    items: [
      { id: 'whiteboard', label: 'السبورة الذكية', icon: BookOpen, href: '/teacher-assistant/whiteboard' },
      { id: 'live-classroom', label: 'الفصل الافتراضي (اللايف العادي)', icon: Video, href: '/teacher-assistant/virtual-classroom' },
      { id: 'ar-live-studio', label: 'اللايف بالواقع المعزز (AR Studio 🖐️)', icon: Sparkles, href: '/admin-live-ar', badge: 'جديد / تجريبي' },
      { id: 'quick-quizzes', label: 'الاختبارات السريعة', icon: FileText, href: '/teacher-assistant/quick-quizzes' },
      { id: 'wheel', label: 'عجلة الحظ التفاعلية', icon: Layers, href: '/teacher-assistant/wheel' },
      { id: 'question-bank', label: 'بنك الأسئلة', icon: FileText, href: '/teacher-assistant/question-bank' },
      { id: 'grammar-games', label: 'ألعاب النحو', icon: Bot, href: '/grammar-games' },
      { id: 'flashcards', label: 'البطاقات الذكية', icon: Layers, href: '/teacher-assistant/flashcards' },
      { id: 'interactive-flashcards', label: 'البطاقات التفاعلية', icon: Layers, href: '/teacher-assistant/interactive-flashcards' },
      { id: 'tracker', label: 'المتابع الذكي', icon: Users, href: '/teacher-assistant/tracker' },
      { id: 'report', label: 'تقرير ولي الأمر', icon: FileText, href: '/teacher-assistant/report' },
      { id: 'leaderboard', label: 'لوحة الشرف', icon: Globe, href: '/teacher-assistant/leaderboard' },
      { id: 'schedule', label: 'جدول الحصص', icon: BookOpen, href: '/teacher-assistant/schedule' },
      { id: 'writing-checker', label: 'المصحح الذكي', icon: Bot, href: '/writing-checker' },
      { id: 'kids-corner', label: 'ركن الأطفال', icon: Users, href: '/kids-corner' },
      { id: 'certificates', label: 'الشهادات', icon: FileText, href: '/teacher-assistant/certificates' },
      { id: 'pdf-to-images', label: 'محول PDF لصور ZIP 📦', icon: FileText, href: '/teacher-assistant/pdf-to-images' },
    ]
  }
];

export default function AdminDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('requests')
  const [loading, setLoading] = useState(true)
  
  const assistantRestricted = () => alert('عذراً، هذا الإجراء متاح لمدير المنصة فقط.');
  const [accessDenied, setAccessDenied] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  
  // Activation state for teachers
  const [showActivationModal, setShowActivationModal] = useState(false)
  const [activationCodeInput, setActivationCodeInput] = useState('')
  const [activationMessage, setActivationMessage] = useState('')
  const [activationLoading, setActivationLoading] = useState(false)

  // Data states
  const [requests, setRequests] = useState([])
  const [trialRequests, setTrialRequests] = useState([])
  const [allStudents, setAllStudents] = useState([])
  const [durations, setDurations] = useState({})
  
  // Homework & Q&A
  const [homeworks, setHomeworks] = useState([])
  const [studentQuestions, setStudentQuestions] = useState([])
  const [answeringQuestion, setAnsweringQuestion] = useState(null)
  const [gradingHomework, setGradingHomework] = useState(null)
  const [lessons, setLessons] = useState([])
  const [courses, setCourses] = useState([])
  const [activationCodes, setActivationCodes] = useState([])
  const [totalStudentsCount, setTotalStudentsCount] = useState(0)
  const [codeForm, setCodeForm] = useState({ count: 10, duration: 1 })
  
  // Preview states
  const [previewGrade, setPreviewGrade] = useState('primary_1')
  const [previewPortal, setPreviewPortal] = useState('/kids-corner')
  
  // Form states
  const [courseForm, setCourseForm] = useState({ title: '', description: '', stage: '', image_url: '' })
  const [editingCourse, setEditingCourse] = useState(null)
  
  const [lessonForm, setLessonForm] = useState({ 
    title: '', description: '', stage: '', course_id: '', video_url: '', canva_url: '', pdf_url: '', points_reward: 50, is_free: false,
    attachments: [], quiz_data: [], quiz_theme: 'classic' 
  })
  const [editingLesson, setEditingLesson] = useState(null)
  
  const [editingStudent, setEditingStudent] = useState(null)

  // Dynamic form temp states
  const [newAttachment, setNewAttachment] = useState({ name: '', url: '' })
  const [newEditAttachment, setNewEditAttachment] = useState({ name: '', url: '' })
  const [newQuestion, setNewQuestion] = useState({ text: '', options: ['', '', '', ''], correctAnswer: '', explanation: '' })

  // AI Quiz Generation during Lesson Edit
  const [showEditAiModal, setShowEditAiModal] = useState(false)
  const [aiEditPrompt, setAiEditPrompt] = useState('')
  const [aiEditModel, setAiEditModel] = useState(DEFAULT_AI_MODEL)
  const [aiEditLoading, setAiEditLoading] = useState(false)
  const [aiEditNumQuestions, setAiEditNumQuestions] = useState(5)
  const [aiEditDifficulty, setAiEditDifficulty] = useState('متوسط')

  const [notificationForm, setNotificationForm] = useState({ title: '', message: '', target: 'all' })
  const [sendCourseNotification, setSendCourseNotification] = useState(true)

  const [actionMessage, setActionMessage] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // 0. Verify Access - جلب الصلاحية من Supabase مباشرة
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (profileError) {
        console.warn('⚠️ فشل جلب الملف الشخصي:', profileError.message)
      }

      // تحديد الصلاحية من profiles أو عبر get_my_role كاحتياطي
      let userRole = profile?.role || null

      if (!userRole) {
        try {
          const { data: rpcRole, error: rpcError } = await supabase.rpc('get_my_role')
          if (!rpcError && rpcRole) {
            userRole = rpcRole
            console.log('✅ تم جلب الصلاحية من get_my_role:', userRole)
          }
        } catch (e) {}
      }

      console.log('📋 Admin Dashboard - الصلاحية:', { profileRole: profile?.role, userRole })

      if (['teacher', 'teacher_pro'].includes(userRole)) {
        router.push('/teacher-assistant')
        return
      }

      if (userRole !== 'admin' && userRole !== 'assistant') {
        setAccessDenied(true)
        setTimeout(() => router.push('/student-dashboard'), 2000)
        return
      }
      
      setCurrentUser(profile || { role: userRole })

      // 1. Fetch pending requests
      const { data: profiles, error: profError } = await supabase
        .from('profiles')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
      if (!profError && profiles) {
        setRequests(profiles)
      }

      // 1.5 Fetch trial requests
      const { data: trials, error: trialError } = await supabase
        .from('profiles')
        .select('*')
        .eq('trial_status', 'pending')
        .order('created_at', { ascending: false })
      if (!trialError && trials) {
        setTrialRequests(trials)
      }

      // 1.6 Fetch students count ONLY (to save performance instead of loading 5000 rows)
      const { count: studentCount, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'student')
      
      if (!countError) {
        setTotalStudentsCount(studentCount || 0)
      }

      // 2. Fetch existing lessons
      const { data: lessonData, error: lessError } = await supabase
        .from('lessons')
        .select('*')
        .order('created_at', { ascending: false })
      if (!lessError && lessonData) {
        setLessons(lessonData)
      }

      // 3. Fetch courses
      const { data: courseData } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false })
      if (courseData) {
        setCourses(courseData)
      }

      // 4. Fetch activation codes
      const { data: codesData, error: codesError } = await supabase
        .from('activation_codes')
        .select(`*, profiles(full_name)`)
        .order('created_at', { ascending: false })
      if (!codesError && codesData) {
        setActivationCodes(codesData)
      }

      // 5. Fetch Homeworks
      const { data: hwData } = await supabase
        .from('homework_submissions')
        .select('*, profiles(full_name, phone), lessons(title)')
        .order('created_at', { ascending: false })
      if (hwData) setHomeworks(hwData)

      // 6. Fetch Questions
      const { data: qData } = await supabase
        .from('lesson_questions')
        .select('*, profiles(full_name, phone), lessons(title)')
        .order('created_at', { ascending: false })
      if (qData) setStudentQuestions(qData)

    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleActivateOnly = async (id) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'approved' })
        .eq('id', id)
      
      if (!error) {
        setRequests(prev => prev.filter(r => r.id !== id))
        alert('تم قبول الحساب وتفعيله على الباقة المجانية بنجاح!')
        fetchData()
      } else {
        throw error
      }
    } catch (err) {
      console.error(err)
      alert('حدث خطأ أثناء تفعيل الحساب')
    }
  }

  const handleApprove = async (id, durationArg, planTypeArg) => {
    const months = parseInt(durationArg || durations[id] || '1', 10)
    const planType = planTypeArg || 'student_basic'
    const isVip = planType === 'student_vip'
    const bonusCredits = isVip ? 50 : 20
    const endDate = new Date()
    endDate.setMonth(endDate.getMonth() + months)
    
    try {
      // 1. Try RPC admin_set_student_package
      const { error: rpcError } = await supabase.rpc('admin_set_student_package', {
        p_student_id: id,
        p_plan_type: planType,
        p_has_live: isVip,
        p_duration_months: months,
        p_bonus_credits: bonusCredits
      })

      if (rpcError) {
        console.warn('RPC admin_set_student_package failed, falling back to direct update:', rpcError)
        
        // Fetch current credits to increment
        const { data: currentProfile } = await supabase.from('profiles').select('ai_credits_balance').eq('id', id).single()
        const newCredits = (Number(currentProfile?.ai_credits_balance) || 20) + bonusCredits

        const updateData = {
          status: 'approved',
          subscription_end_date: endDate.toISOString(),
          plan_type: planType,
          has_live: isVip,
          ai_credits_balance: newCredits
        }

        const { error: directError } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', id)

        if (directError) {
          // If columns don't exist yet, update core fields
          const { error: basicError } = await supabase
            .from('profiles')
            .update({ status: 'approved', subscription_end_date: endDate.toISOString() })
            .eq('id', id)
          if (basicError) throw basicError
        }
      }

      setRequests(prev => prev.filter(r => r.id !== id))
      alert(`✅ تم تفعيل (${isVip ? 'باقة VIP مع البث المباشر ⭐' : 'باقة التفوق بدون لايف 🎓'}) لمدة ${months} شهر بنجاح!`)
      fetchData() // Refresh data immediately
    } catch (err) {
      console.error(err)
      alert('حدث خطأ أثناء إضافة الاشتراك: ' + (err.message || ''))
    }
  }

  const handleApproveTrial = async (id) => {
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + 7)
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          trial_status: 'active',
          status: 'approved',
          subscription_end_date: endDate.toISOString()
        })
        .eq('id', id)
      
      if (!error) {
        setTrialRequests(prev => prev.filter(r => r.id !== id))
        alert('تم تفعيل التجربة المجانية لمدة 7 أيام بنجاح!')
        fetchData()
      } else {
        throw error
      }
    } catch (err) {
      console.error(err)
      alert('حدث خطأ أثناء تفعيل التجربة')
    }
  }

  const handleDurationChange = (id, val) => {
    setDurations(prev => ({...prev, [id]: val}))
  }

  const addAttachment = () => {
    if(newAttachment.name && newAttachment.url) {
      setLessonForm({
        ...lessonForm,
        attachments: [...lessonForm.attachments, newAttachment]
      })
      setNewAttachment({ name: '', url: '' })
    }
  }

  const removeAttachment = (index) => {
    const arr = [...lessonForm.attachments]
    arr.splice(index, 1)
    setLessonForm({...lessonForm, attachments: arr})
  }

  const updateOption = (idx, value) => {
    const opts = [...newQuestion.options]
    opts[idx] = value
    setNewQuestion({...newQuestion, options: opts})
  }

  const addQuestion = () => {
    if(newQuestion.text && newQuestion.correctAnswer && newQuestion.options.every(o => o.trim() !== '')) {
      if(!newQuestion.options.includes(newQuestion.correctAnswer)) {
        alert('يجب أن تكون الإجابة الصحيحة متطابقة تماماً مع أحد الخيارات!')
        return;
      }
      setLessonForm({
        ...lessonForm,
        quiz_data: [...lessonForm.quiz_data, newQuestion]
      })
      setNewQuestion({ text: '', options: ['', '', '', ''], correctAnswer: '', explanation: '' })
    } else {
      alert('يرجى تعبئة نص السؤال، وجميع الخيارات الأربعة، وتحديد الإجابة الصحيحة')
    }
  }

  const removeQuestion = (index) => {
    const arr = [...lessonForm.quiz_data]
    arr.splice(index, 1)
    setLessonForm({...lessonForm, quiz_data: arr})
  }

  const downloadCSVTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,\uFEFFالسؤال,الخيار 1,الخيار 2,الخيار 3,الخيار 4,الإجابة الصحيحة,التعليل\nمثال على سؤال?,خيار أ,خيار ب,خيار ج,خيار د,خيار أ,لأن هذه هي الإجابة الصحيحة\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "quiz_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target.result;
      const lines = text.split('\n');
      const newQuestions = [];
      for(let i=1; i<lines.length; i++) {
        const line = lines[i].trim();
        if(!line) continue;
        
        const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(s => s.replace(/^"|"$/g, '').trim());
        if (parts.length >= 6) {
           const q = {
             text: parts[0],
             options: [parts[1], parts[2], parts[3], parts[4]],
             correctAnswer: parts[5],
             explanation: parts[6] || ''
           };
           newQuestions.push(q);
        }
      }
      if(newQuestions.length > 0) {
        setLessonForm(prev => ({...prev, quiz_data: [...prev.quiz_data, ...newQuestions]}));
        alert(`تم إضافة ${newQuestions.length} سؤال بنجاح!`);
      } else {
        alert('لم يتم العثور على أسئلة صحيحة في الملف.');
      }
    };
    reader.readAsText(file, 'utf-8');
    e.target.value = null;
  }

  const handleEditCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target.result;
      const lines = text.split('\n');
      const newQuestions = [];
      for(let i=1; i<lines.length; i++) {
        const line = lines[i].trim();
        if(!line) continue;
        
        const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(s => s.replace(/^"|"$/g, '').trim());
        if (parts.length >= 6) {
           const q = {
             text: parts[0],
             options: [parts[1], parts[2], parts[3], parts[4]],
             correctAnswer: parts[5],
             explanation: parts[6] || ''
           };
           newQuestions.push(q);
        }
      }
      if(newQuestions.length > 0) {
        setEditingLesson(prev => ({...prev, quiz_data: [...(prev.quiz_data || []), ...newQuestions]}));
        alert(`تم إضافة ${newQuestions.length} سؤال بنجاح!`);
      } else {
        alert('لم يتم العثور على أسئلة صحيحة في الملف.');
      }
    };
    reader.readAsText(file, 'utf-8');
    e.target.value = null;
  }

  const addEditQuestion = () => {
    if(newQuestion.text && newQuestion.correctAnswer && newQuestion.options.every(o => o.trim() !== '')) {
      if(!newQuestion.options.includes(newQuestion.correctAnswer)) {
        alert('يجب أن تكون الإجابة الصحيحة متطابقة تماماً مع أحد الخيارات!')
        return;
      }
      setEditingLesson({
        ...editingLesson,
        quiz_data: [...(editingLesson.quiz_data || []), newQuestion]
      })
      setNewQuestion({ text: '', options: ['', '', '', ''], correctAnswer: '', explanation: '' })
    } else {
      alert('يرجى تعبئة نص السؤال، وجميع الخيارات الأربعة، وتحديد الإجابة الصحيحة')
    }
  }

  const removeEditQuestion = (index) => {
    const arr = [...(editingLesson.quiz_data || [])]
    arr.splice(index, 1)
    setEditingLesson({...editingLesson, quiz_data: arr})
  }

  const addEditAttachment = () => {
    if (newEditAttachment.name && newEditAttachment.url) {
      setEditingLesson(prev => ({
        ...prev,
        attachments: [...(prev.attachments || []), newEditAttachment]
      }))
      setNewEditAttachment({ name: '', url: '' })
    } else {
      alert('يرجى كتابة اسم الملف ورابط الملف لإضافته')
    }
  }

  const removeEditAttachment = (index) => {
    setEditingLesson(prev => {
      const arr = [...(prev.attachments || [])]
      arr.splice(index, 1)
      return { ...prev, attachments: arr }
    })
  }

  const handleEditAiGenerate = async () => {
    if (!aiEditPrompt.trim()) return
    setAiEditLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('يجب تسجيل الدخول لاستخدام ميزات الذكاء الاصطناعي.');
      }

      const systemPrompt = `أنت خبير تربوي ومساعد ذكي متخصص في أداة [صياغة أسئلة التدريب والتقييم للدروس المرئية] في منصة الجُنيدي التعليمية (alwateen.com).
مهمتك: قراءة نص الدرس وصياغة أسئلة تفاعلية ذكية لقياس فهم واستيعاب الطلاب للدرس.
عدد الأسئلة: ` + aiEditNumQuestions + `
مستوى الصعوبة: ` + aiEditDifficulty + `

قم بإرجاع الأسئلة بصيغة CSV فقط (بدون أي ترويسة Header وبدون أي نصوص تمهيدية أو خاتمة). لا تضف أي نص آخر.
الأعمدة:
العمود 1: نص السؤال
العمود 2: الخيار الأول
العمود 3: الخيار الثاني
العمود 4: الخيار الثالث
العمود 5: الخيار الرابع
العمود 6: الإجابة الصحيحة (يجب أن تطابق أحد الخيارات تماماً)
العمود 7: التعليل (شرح الإجابة)

مثال للرد:
"ما هي عاصمة مصر؟","القاهرة","الإسكندرية","أسوان","الأقصر","القاهرة","لأن القاهرة هي العاصمة الحالية لمصر"

الرجاء إرجاع الرد ككود CSV فقط داخل Markdown block.`;

      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt + '\n\nالنص:\n' + aiEditPrompt }] }],
          model: aiEditModel,
          generationConfig: { temperature: 0.2 },
          action: 'lesson_edit_quiz_generator'
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'خطأ في توليد الأسئلة');
      
      let resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      resultText = resultText.replace(/```csv/gi, '').replace(/```/g, '').trim();

      const lines = resultText.split('\n');
      const newQuestions = [];
      for(let i=0; i<lines.length; i++) {
        const line = lines[i].trim();
        if(!line) continue;
        
        const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(s => s.replace(/^"|"$/g, '').trim());
        if (parts.length >= 6) {
           const q = {
             text: parts[0],
             options: [parts[1], parts[2], parts[3], parts[4]],
             correctAnswer: parts[5],
             explanation: parts[6] || ''
           };
           newQuestions.push(q);
        }
      }

      if(newQuestions.length > 0) {
        setEditingLesson(prev => ({...prev, quiz_data: [...(prev.quiz_data || []), ...newQuestions]}));
        alert(`تم توليد وإضافة ${newQuestions.length} سؤال بنجاح!`);
        setShowEditAiModal(false);
        setAiEditPrompt('');
      } else {
        alert('لم يتم العثور على أسئلة صحيحة في الرد الذكي.');
      }
    } catch (err) {
      alert('حدث خطأ أثناء التوليد: ' + err.message)
    } finally {
      setAiEditLoading(false)
    }
  }

  const handleAddCourse = async (e) => {
    e.preventDefault()
    try {
      const { data, error } = await supabase
        .from('courses')
        .insert([courseForm])
        .select()
      
      if (error) throw error
      
      alert('تم إضافة الكورس بنجاح!')
      
      // Send notification if requested
      if (sendCourseNotification && data && data.length > 0) {
        const course = data[0]
        
        // Fetch students in this stage
        const { data: students } = await supabase
          .from('profiles')
          .select('id')
          .eq('role', 'student')
          .eq('stage', course.stage)
        
        if (students && students.length > 0) {
          const notificationsToInsert = students.map(s => ({
            user_id: s.id,
            title: 'كورس جديد متاح 📚',
            message: `تم إضافة كورس جديد لمنهجك: ${course.title}. تصفحه الآن!`
          }))
          
          await supabase.from('notifications').insert(notificationsToInsert)
        }
      }

      setCourseForm({ title: '', description: '', stage: '', image_url: '' })
      fetchData()
    } catch (err) {
      console.error(err)
      alert('حدث خطأ أثناء إضافة الكورس')
    }
  }

  const generateRandomCode = (prefix = 'ALJ') => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = (prefix ? `${prefix}-` : 'ALJ-')
    for (let i = 0; i < 4; i++) result += chars.charAt(Math.floor(Math.random() * chars.length))
    result += '-'
    for (let i = 0; i < 4; i++) result += chars.charAt(Math.floor(Math.random() * chars.length))
    return result
  }

  const handleGenerateCodes = async (e, customData) => {
    if (e && e.preventDefault) e.preventDefault()
    try {
      setActionMessage('جاري توليد الأكواد...')
      const config = customData || codeForm
      const count = parseInt(config.count, 10) || 10
      const duration = config.duration !== undefined ? parseInt(config.duration, 10) : 1
      const planType = config.plan_type || 'student_basic'
      const planName = config.plan_name || 'باقة التفوق'
      const aiCredits = config.ai_credits !== undefined ? parseInt(config.ai_credits, 10) : 20
      const liveMinutes = config.live_minutes !== undefined ? parseInt(config.live_minutes, 10) : 0
      const price = config.price !== undefined ? parseFloat(config.price) : 60
      const targetRole = config.target_role || 'student'
      const prefix = config.prefix || (planType === 'ai_credits' ? 'AI' : planType === 'student_vip' ? 'VIP' : 'ALJ')

      const newCodes = []
      for (let i = 0; i < count; i++) {
        newCodes.push({
          code: generateRandomCode(prefix),
          duration_months: duration,
          plan_type: planType,
          plan_name: planName,
          ai_credits: aiCredits,
          live_minutes: liveMinutes,
          price: price,
          target_role: targetRole,
          is_used: false
        })
      }

      const { error } = await supabase.from('activation_codes').insert(newCodes)
      if (error) {
        console.warn('Full insert failed, attempting fallback insert:', error)
        const fallbackCodes = newCodes.map(c => ({
          code: c.code,
          duration_months: c.duration_months,
          is_used: false
        }))
        const { error: fallbackError } = await supabase.from('activation_codes').insert(fallbackCodes)
        if (fallbackError) throw fallbackError
      }

      alert(`✅ تم توليد ${count} كود (${planName}) بنجاح!`)
      fetchData()
    } catch (err) {
      console.error(err)
      alert('حدث خطأ أثناء توليد الأكواد: ' + (err.message || 'خطأ غير معروف'))
    } finally {
      setActionMessage('')
    }
  }

  const handleDeleteCode = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الكود؟')) return
    try {
      const { error } = await supabase.from('activation_codes').delete().eq('id', id)
      if (error) throw error
      alert('تم حذف الكود بنجاح!')
      fetchData()
    } catch (err) {
      console.error(err)
      alert('حدث خطأ أثناء حذف الكود')
    }
  }

  const handleActivateTeacherCode = async (e) => {
    e.preventDefault()
    if (!activationCodeInput.trim()) return
    setActivationLoading(true)
    setActivationMessage('')

    try {
      const { data, error } = await supabase.rpc('redeem_activation_code', {
        p_code: activationCodeInput.trim()
      })

      if (error) throw error

      if (!data || !data.success) {
        setActivationMessage(`❌ ${data?.message || 'الكود غير صحيح أو مستخدم من قبل.'}`)
        setActivationLoading(false)
        return
      }

      setActivationMessage(`✅ ${data.message}`)
      
      setCurrentUser(prev => ({
        ...prev,
        status: 'approved',
        subscription_end_date: data.subscription_end_date
      }))
      
      setTimeout(() => {
        setShowActivationModal(false)
        setActivationCodeInput('')
        setActivationMessage('')
      }, 2500)

    } catch (err) {
      console.error('Teacher activation error:', err)
      setActivationMessage('❌ حدث خطأ أثناء التفعيل. يرجى المحاولة لاحقاً.')
    } finally {
      setActivationLoading(false)
    }
  }

  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('courses')
        .update({
          title: editingCourse.title,
          description: editingCourse.description,
          stage: editingCourse.stage,
          image_url: editingCourse.image_url
        })
        .eq('id', editingCourse.id);
      
      if (error) throw error;
      
      alert('تم تحديث الكورس بنجاح!');
      setEditingCourse(null);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء التحديث');
    }
  }

  const handleDeleteCourse = async (id) => {
    const confirmDelete = window.confirm('هل أنت متأكد من حذف هذا الكورس نهائياً؟');
    if (!confirmDelete) return;

    const confirmLessons = window.confirm('هل تريد حذف جميع الدروس المرتبطة بهذا الكورس أيضاً؟\n(موافق = نعم أحذف الدروس) (إلغاء الأمر = لا، احتفظ بها كمسودة/مستقلة)');
    
    try {
      if (confirmLessons) {
        await supabase.from('lessons').delete().eq('course_id', id);
      } else {
        await supabase.from('lessons').update({ course_id: null }).eq('course_id', id);
      }
      
      const { error } = await supabase.from('courses').delete().eq('id', id);
      if (error) throw error;
      
      alert('تم الحذف بنجاح!');
      fetchData();
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء الحذف');
    }
  }

  const handleSendNotification = async (e) => {
    e.preventDefault()
    try {
      setActionMessage('جاري إرسال الإشعارات...')
      
      let query = supabase.from('profiles').select('id').eq('role', 'student')
      if (notificationForm.target !== 'all') {
        query = query.eq('stage', notificationForm.target)
      }

      const { data: targetStudents, error: fetchError } = await query
      
      if (fetchError || !targetStudents || targetStudents.length === 0) {
        alert('لا يوجد طلاب في هذه الفئة المحددة.')
        setActionMessage('')
        return
      }

      const notificationsToInsert = targetStudents.map(s => ({
        user_id: s.id,
        title: notificationForm.title,
        message: notificationForm.message
      }))

      const { error } = await supabase.from('notifications').insert(notificationsToInsert)
      
      if (error) throw error
      
      alert(`تم إرسال الإشعار بنجاح لـ ${targetStudents.length} طالب!`)
      setNotificationForm({ title: '', message: '', target: 'all' })
    } catch (err) {
      console.error(err)
      alert('حدث خطأ أثناء إرسال الإشعارات')
    } finally {
      setActionMessage('')
    }
  }

  const handleAddLesson = async (e) => {
    e.preventDefault()
    setActionMessage('جاري الإضافة...')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const insertData = {
        title: lessonForm.title,
        description: lessonForm.description,
        stage: lessonForm.course_id ? (courses || []).find(c => c.id === lessonForm.course_id)?.stage || lessonForm.stage : lessonForm.stage,
        video_url: lessonForm.video_url,
        canva_url: lessonForm.canva_url,
        pdf_url: lessonForm.pdf_url,
        points_reward: lessonForm.points_reward,
        is_free: lessonForm.is_free,
        teacher_id: user?.id,
        attachments: lessonForm.attachments,
        quiz_data: lessonForm.quiz_data,
        quiz_theme: lessonForm.quiz_theme,
        allowed_stages: lessonForm.allowed_stages || []
      }
      
      if (lessonForm.course_id) {
        insertData.course_id = lessonForm.course_id;
      }

      const { error } = await supabase
        .from('lessons')
        .insert([insertData])
      
      if (error) throw error
      
      setActionMessage('تمت إضافة الدرس بنجاح ✅')
      setLessonForm({ title: '', description: '', stage: '', course_id: '', video_url: '', canva_url: '', pdf_url: '', points_reward: 50, is_free: false, attachments: [], quiz_data: [], quiz_theme: 'classic', allowed_stages: [] })
      fetchData() // Refresh list
      setTimeout(() => setActionMessage(''), 3000)
    } catch (err) {
      console.error(err)
      setActionMessage('حدث خطأ أثناء إضافة الدرس (هل أضفت الأعمدة الجديدة في قاعدة البيانات؟) ❌')
    }
  }

  const handleUpdateLesson = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('lessons')
        .update({
          title: editingLesson.title,
          description: editingLesson.description,
          stage: editingLesson.course_id ? (courses || []).find(c => c.id === editingLesson.course_id)?.stage || editingLesson.stage : editingLesson.stage,
          course_id: editingLesson.course_id || null,
          video_url: editingLesson.video_url,
          canva_url: editingLesson.canva_url,
          pdf_url: editingLesson.pdf_url,
          points_reward: editingLesson.points_reward,
          is_free: editingLesson.is_free,
          attachments: editingLesson.attachments || [],
          quiz_data: editingLesson.quiz_data || [],
          quiz_theme: editingLesson.quiz_theme || 'classic',
          allowed_stages: editingLesson.allowed_stages || []
        })
        .eq('id', editingLesson.id);
      
      if (error) throw error;
      
      alert('تم تحديث الدرس بنجاح!');
      setEditingLesson(null);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء التحديث');
    }
  }

  const handleDeleteLesson = async (id) => {
    const confirmDelete = window.confirm('هل أنت متأكد من حذف هذا الدرس؟ سيتم مسحه ومسح ملحقاته واختباراته بالكامل.');
    if (!confirmDelete) return;

    try {
      const { error } = await supabase.from('lessons').delete().eq('id', id);
      if (error) throw error;
      
      alert('تم حذف الدرس بنجاح!');
      fetchData();
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء الحذف');
    }
  }

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    try {
      const isVip = editingStudent.plan_type === 'student_vip'
      const updateData = {
        full_name: editingStudent.full_name,
        stage: editingStudent.stage,
        phone: editingStudent.phone,
        badges: editingStudent.badges || [],
        points: editingStudent.points || 0,
        ai_credits_balance: editingStudent.ai_credits_balance !== undefined ? Number(editingStudent.ai_credits_balance) : 20,
        plan_type: editingStudent.plan_type || 'free',
        has_live: editingStudent.has_live !== undefined ? editingStudent.has_live : isVip,
        status: editingStudent.status || 'approved'
      };

      if (editingStudent.subscription_end_date) {
        updateData.subscription_end_date = editingStudent.subscription_end_date;
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', editingStudent.id);
      
      if (error) {
        console.warn('Update with package columns failed, falling back to basic fields:', error);
        const { error: basicErr } = await supabase
          .from('profiles')
          .update({
            full_name: editingStudent.full_name,
            stage: editingStudent.stage,
            phone: editingStudent.phone,
            points: editingStudent.points || 0,
            ai_credits_balance: editingStudent.ai_credits_balance !== undefined ? Number(editingStudent.ai_credits_balance) : 20
          })
          .eq('id', editingStudent.id);
        if (basicErr) throw basicErr;
      }
      
      alert('تم تحديث بيانات وباقة الطالب بنجاح! ✅');
      setEditingStudent(null);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء تحديث بيانات الطالب: ' + (err.message || ''));
    }
  }

  const handleDeleteStudent = async (id) => {
    if(!confirm('هل أنت متأكد من حذف هذا الطالب؟ سيتم حذف جميع بياناته واشتراكاته!')) return;
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if(error) throw error;
      alert('تم الحذف بنجاح!');
      fetchData();
    } catch(err) {
      console.error(err);
      alert('حدث خطأ أثناء الحذف');
    }
  }

  const handleGradeHomework = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('homework_submissions').update({
        status: 'graded',
        grade: gradingHomework.grade,
        feedback: gradingHomework.feedback
      }).eq('id', gradingHomework.id);
      
      if(error) throw error;
      alert('تم تقييم الواجب بنجاح!');
      setGradingHomework(null);
      fetchData();
    } catch(err) {
      console.error(err);
      alert('حدث خطأ أثناء التقييم');
    }
  }

  const handleAnswerQuestion = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('lesson_questions').update({
        answer: answeringQuestion.answer
      }).eq('id', answeringQuestion.id);
      
      if(error) throw error;
      alert('تم الرد على السؤال بنجاح!');
      setAnsweringQuestion(null);
      fetchData();
    } catch(err) {
      console.error(err);
      alert('حدث خطأ أثناء الرد');
    }
  }

  const handleDeleteQuestion = async (id) => {
    if(!window.confirm('هل أنت متأكد من حذف هذا السؤال؟')) return;
    try {
      const { error } = await supabase.from('lesson_questions').delete().eq('id', id);
      if(error) throw error;
      alert('تم الحذف بنجاح!');
      fetchData();
    } catch(err) {
      console.error(err);
      alert('حدث خطأ أثناء الحذف');
    }
  }

  const handleDeleteHomework = async (id) => {
    if(!window.confirm('هل أنت متأكد من حذف هذا الواجب؟')) return;
    try {
      const { error } = await supabase.from('homework_submissions').delete().eq('id', id);
      if(error) throw error;
      alert('تم الحذف بنجاح!');
      fetchData();
    } catch(err) {
      console.error(err);
      alert('حدث خطأ أثناء الحذف');
    }
  }

  const handleLogout = async (e) => {
    e.preventDefault()
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.loadingContent}>
          <div className={styles.spinner}></div>
          <h2>لوحة الإدارة</h2>
          <p>جاري تحميل منصة الوتين...</p>
        </div>
      </div>
    )
  }

  if (accessDenied) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.loadingContent}>
          <div style={{fontSize: '4rem', marginBottom: '16px'}}>⛔</div>
          <h2 style={{color: '#dc2626'}}>غير مصرح بالدخول</h2>
          <p>لا تملك صلاحية الوصول لهذه الصفحة.</p>
          <p style={{fontSize: '0.85rem', opacity: 0.6, marginTop: '8px'}}>جاري تحويلك لوحة تحكم الطالب...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.dashboard}>
      {/* 0. SPECIALTY SELECTION OVERLAY */}
      {currentUser && !currentUser.specialty && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.95)', zIndex: 99999,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '20px', backdropFilter: 'blur(10px)', direction: 'rtl'
        }}>
          <h1 style={{ color: 'white', marginBottom: '10px', fontSize: '2rem', textAlign: 'center' }}>مرحباً بك في لوحة تحكم المعلم 🎛️</h1>
          <p style={{ color: '#94a3b8', marginBottom: '30px', fontSize: '1.2rem', textAlign: 'center' }}>يرجى تحديد تخصصك لتخصيص أدوات المنصة لتناسبك:</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', width: '100%', maxWidth: '900px' }}>
            <button onClick={async () => {
              await supabase.from('profiles').update({ specialty: 'arabic' }).eq('id', currentUser.id)
              setCurrentUser({...currentUser, specialty: 'arabic'})
            }} style={{ background: '#059669', color: 'white', border: 'none', padding: '25px', borderRadius: '16px', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', transition: '0.2s', boxShadow: '0 10px 25px rgba(5,150,105,0.3)' }}>
              <span style={{ fontSize: '3rem' }}>🇸🇦</span>
              <strong>عربي</strong>
              <span style={{ fontSize: '0.9rem', color: '#d1fae5' }}>يظهر أدوات وسبورة الحروف</span>
            </button>
            <button onClick={async () => {
              await supabase.from('profiles').update({ specialty: 'math' }).eq('id', currentUser.id)
              setCurrentUser({...currentUser, specialty: 'math'})
            }} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '25px', borderRadius: '16px', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', transition: '0.2s', boxShadow: '0 10px 25px rgba(59,130,246,0.3)' }}>
              <span style={{ fontSize: '3rem' }}>🔢</span>
              <strong>حساب</strong>
              <span style={{ fontSize: '0.9rem', color: '#dbeafe' }}>يظهر أدوات الأرقام والهندسة</span>
            </button>
            <button onClick={async () => {
              await supabase.from('profiles').update({ specialty: 'english' }).eq('id', currentUser.id)
              setCurrentUser({...currentUser, specialty: 'english'})
            }} style={{ background: '#8b5cf6', color: 'white', border: 'none', padding: '25px', borderRadius: '16px', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', transition: '0.2s', boxShadow: '0 10px 25px rgba(139,92,246,0.3)' }}>
              <span style={{ fontSize: '3rem' }}>🔠</span>
              <strong>إنجليزي</strong>
              <span style={{ fontSize: '0.9rem', color: '#ede9fe' }}>يظهر أدوات الحروف الإنجليزية</span>
            </button>
            <button onClick={async () => {
              await supabase.from('profiles').update({ specialty: 'general' }).eq('id', currentUser.id)
              setCurrentUser({...currentUser, specialty: 'general'})
            }} style={{ background: '#475569', color: 'white', border: 'none', padding: '25px', borderRadius: '16px', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', transition: '0.2s', boxShadow: '0 10px 25px rgba(71,85,105,0.3)' }}>
              <span style={{ fontSize: '3rem' }}>📚</span>
              <strong>ماث</strong>
              <span style={{ fontSize: '0.9rem', color: '#e2e8f0' }}>يظهر الأدوات المشتركة فقط</span>
            </button>
          </div>
        </div>
      )}

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
          <button className={styles.closeMenuBtn} onClick={() => setIsMobileMenuOpen(false)}><X size={24} /></button>
        </div>

        {/* Logo */}
        <div className={styles.logo}>
          <span className={styles.logoIcon}>🎓</span>
          <h2>لوحة الإدارة</h2>
          <p>منصة الوتين</p>
        </div>

        {/* User Profile */}
        {currentUser && (
          <div className={styles.userProfile}>
            <div className={styles.avatar}>
              {currentUser.full_name?.charAt(0) || 'أ'}
            </div>
            <div className={styles.userInfo}>
              <h4>{currentUser.full_name}</h4>
              <span className={styles.roleBadgeAdmin}>مدير النظام</span>
            </div>
          </div>
        )}

        {/* Navigation */}
          <nav className={styles.nav}>
            {NAV_GROUPS.map(group => {
              // Filter out items the assistant shouldn't see
              const filteredItems = group.items.filter(item => {
                if (currentUser?.role === 'assistant') {
                  if (['teachers', 'codes'].includes(item.id)) return false;
                }
                return true;
              });

              if (filteredItems.length === 0) return null;

              return (
                <div key={group.label} className={styles.navGroup}>
                  <span className={styles.navGroupLabel}>{group.label}</span>
                  {filteredItems.map(item => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    
                    if (item.href) {
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        target="_blank"
                        className={styles.navItem}
                        style={{ textDecoration: 'none' }}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Icon size={16} />
                        <span>{item.label}</span>
                        {item.badge && (
                          <span style={{
                            marginRight: 'auto',
                            background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                            color: 'white',
                            fontSize: '0.66rem',
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: '10px',
                            boxShadow: '0 2px 6px rgba(139, 92, 246, 0.35)'
                          }}>
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    )
                  }

                  return (
                    <button
                      key={item.id}
                      className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                      onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                    >
                      <Icon size={16} />
                      <span>{item.label}</span>
                      {item.id === 'requests' && requests.length > 0 && (
                        <span className={styles.badge}>{requests.length}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )
          })}

          {/* Logout */}
          <button onClick={handleLogout} className={styles.navLogout}>
            <LogOut size={16} />
            <span>تسجيل الخروج</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        <header className={styles.header}>
          <div className={styles.headerTop} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <button className={styles.hamburgerBtn} onClick={() => setIsMobileMenuOpen(true)}>
                <Menu size={20} />
                <span>القائمة</span>
              </button>
              <div>
                <h1>مرحباً، {currentUser?.full_name?.split(' ')[0] || 'أستاذ'} 👋</h1>
                <p>أدر منصتك وطلابك بكل سهولة من مكان واحد.</p>
              </div>
            </div>

            {/* Direct AR Live Studio & Audio Recorder Buttons in Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setActiveTab('audio-recorder')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: activeTab === 'audio-recorder' ? 'linear-gradient(135deg, #047857 0%, #064e3b 100%)' : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  color: '#ffffff',
                  padding: '10px 18px',
                  borderRadius: '12px',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(5, 150, 105, 0.3)',
                  transition: 'transform 0.2s'
                }}
              >
                <Mic size={18} />
                <span>مسجل الصوت والاستوديو 🎙️</span>
              </button>
              <Link
                href="/admin-live-ar"
                target="_blank"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                  color: '#ffffff',
                  padding: '10px 18px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  boxShadow: '0 4px 15px rgba(139, 92, 246, 0.35)',
                  transition: 'transform 0.2s'
                }}
              >
                <Sparkles size={18} />
                <span>اللايف بالواقع المعزز (AR Live 🖐️)</span>
                <span style={{
                  background: 'rgba(255,255,255,0.25)',
                  color: 'white',
                  fontSize: '0.68rem',
                  padding: '2px 6px',
                  borderRadius: '6px'
                }}>
                  تجريبي
                </span>
              </Link>
            </div>
          </div>
        </header>

        {/* Quick Stats */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{background: 'rgba(220,38,38,0.1)', color: '#dc2626'}}>
              <ClipboardList size={20} />
            </div>
            <div>
              <div className={styles.statValue}>{requests.length}</div>
              <div className={styles.statLabel}>طلب معلق</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{background: 'rgba(5,150,105,0.1)', color: '#059669'}}>
              <Users size={20} />
            </div>
            <div>
              <div className={styles.statValue}>{totalStudentsCount}</div>
              <div className={styles.statLabel}>طالب مسجل</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{background: 'rgba(37,99,235,0.1)', color: '#2563eb'}}>
              <BookOpen size={20} />
            </div>
            <div>
              <div className={styles.statValue}>{courses.length}</div>
              <div className={styles.statLabel}>كورس</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{background: 'rgba(147,51,234,0.1)', color: '#9333ea'}}>
              <GraduationCap size={20} />
            </div>
            <div>
              <div className={styles.statValue}>{lessons.length}</div>
              <div className={styles.statLabel}>درس</div>
            </div>
          </div>
        </div>

        {/* AR Live Studio Quick Launch Banner for Admin */}
        <div style={{
          margin: '0 0 24px',
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(59, 130, 246, 0.08) 100%)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          borderRadius: '16px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: '0 4px 20px rgba(139, 92, 246, 0.06)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              boxShadow: '0 4px 12px rgba(139, 92, 246, 0.35)',
              flexShrink: 0
            }}>
              🖐️
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: '#1e1b4b' }}>
                  مختبر اللايف التفاعلي بالواقع المعزز (AR Live Studio 🖐️)
                </h3>
                <span style={{
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                  color: 'white',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '10px'
                }}>
                  تجريبي خاص بالإدارة 👑
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.84rem', color: '#64748b', lineHeight: 1.4 }}>
                نظام اللايف الجديد بتتبع اليد (MediaPipe) والتحكم بالقرص 🤏 — متاح لك هنا لتجربته مع الحفاظ على اللايف القديم للمعلمين دون أي تغيير.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link
              href="/teacher-assistant/virtual-classroom"
              target="_blank"
              style={{
                padding: '8px 14px',
                borderRadius: '10px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#475569',
                fontSize: '0.82rem',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Video size={15} />
              <span>اللايف القديم</span>
            </Link>
            <Link
              href="/admin-live-ar"
              target="_blank"
              style={{
                padding: '9px 18px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                color: '#ffffff',
                fontSize: '0.85rem',
                fontWeight: 800,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(139, 92, 246, 0.35)'
              }}
            >
              <Sparkles size={16} />
              <span>تجربة لايف الواقع المعزز (AR) 🚀</span>
            </Link>
          </div>
        </div>

        {activeTab === 'requests' && (
          <RequestsTab 
            requests={requests} 
            trialRequests={trialRequests}
            durations={durations} 
            handleDurationChange={handleDurationChange} 
            handleApprove={handleApprove}
            handleActivateOnly={handleActivateOnly}
            handleApproveTrial={handleApproveTrial}
            styles={styles} 
          />
        )}

        {activeTab === 'students' && (
          <StudentsTab 
            allStudents={allStudents} 
            durations={durations} 
            handleDurationChange={handleDurationChange} 
            handleApprove={handleApprove} 
            fetchData={fetchData} 
            setEditingStudent={setEditingStudent} 
            handleDeleteStudent={currentUser?.role === 'assistant' ? assistantRestricted : handleDeleteStudent} 
            styles={styles} 
          />
        )}

        {activeTab === 'teachers' && (
          <TeachersTab 
            styles={styles} 
          />
        )}

        {activeTab === 'my-assistants' && (
          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px' }}>
            <AssistantsTab teacherId={currentUser?.id} />
          </div>
        )}

        {activeTab === 'courses' && (
          <CoursesTab 
            courses={courses} 
            courseForm={courseForm} 
            setCourseForm={setCourseForm} 
            sendCourseNotification={sendCourseNotification} 
            setSendCourseNotification={setSendCourseNotification} 
            handleAddCourse={handleAddCourse} 
            setEditingCourse={setEditingCourse} 
            handleDeleteCourse={currentUser?.role === 'assistant' ? assistantRestricted : handleDeleteCourse} 
            styles={styles} 
          />
        )}

        {activeTab === 'codes' && (
          <CodesTab 
            activationCodes={activationCodes} 
            codeForm={codeForm} 
            setCodeForm={setCodeForm} 
            handleGenerateCodes={handleGenerateCodes} 
            handleDeleteCode={handleDeleteCode}
            fetchData={fetchData}
            styles={styles} 
          />
        )}

        {activeTab === 'homework' && (
          <HomeworkTab 
            homeworks={homeworks} 
            gradingHomework={gradingHomework} 
            setGradingHomework={setGradingHomework} 
            handleGradeHomework={handleGradeHomework} 
            handleDeleteHomework={handleDeleteHomework} 
            styles={styles} 
          />
        )}

        {activeTab === 'qa' && (
          <QATab 
            studentQuestions={studentQuestions} 
            answeringQuestion={answeringQuestion} 
            setAnsweringQuestion={setAnsweringQuestion} 
            handleAnswerQuestion={handleAnswerQuestion} 
            handleDeleteQuestion={handleDeleteQuestion} 
            styles={styles} 
          />
        )}

        {activeTab === 'lessons' && (
          <LessonsTab 
            lessons={lessons} 
            courses={courses} 
            lessonForm={lessonForm} 
            setLessonForm={setLessonForm} 
            actionMessage={actionMessage} 
            handleAddLesson={handleAddLesson} 
            ALL_STAGES={ALL_STAGES} 
            newAttachment={newAttachment} 
            setNewAttachment={setNewAttachment} 
            addAttachment={addAttachment} 
            removeAttachment={removeAttachment} 
            downloadCSVTemplate={downloadCSVTemplate} 
            handleCSVUpload={handleCSVUpload} 
            newQuestion={newQuestion} 
            setNewQuestion={setNewQuestion} 
            updateOption={updateOption} 
            addQuestion={addQuestion} 
            removeQuestion={removeQuestion} 
            setEditingLesson={setEditingLesson} 
            handleDeleteLesson={currentUser?.role === 'assistant' ? assistantRestricted : handleDeleteLesson} 
            styles={styles} 
          />
        )}

        {activeTab === 'assistant' && (
          <AssistantTab styles={styles} currentUser={currentUser} />
        )}

        {activeTab === 'community' && (
          <AdminCommunityTab ALL_STAGES={ALL_STAGES} styles={styles} />
        )}

        {activeTab === 'notifications' && (
          <NotificationsTab 
            notificationForm={notificationForm} 
            setNotificationForm={setNotificationForm} 
            handleSendNotification={handleSendNotification} 
            actionMessage={actionMessage} 
            styles={styles} 
          />
        )}

        {activeTab === 'preview' && (
          <PreviewTab 
            ALL_STAGES={ALL_STAGES} 
            styles={styles} 
          />
        )}

        {activeTab === 'quiz' && (
          <QuizManagerTab styles={styles} role="admin" isPremium={true} />
        )}

        {activeTab === 'exam-builder' && (
          <ExamBuilderTab styles={styles} />
        )}

        {activeTab === 'audio-recorder' && (
          <AudioRecorderTab styles={styles} />
        )}

        

        

      </main>
      {/* Modal for Editing Course */}
      {editingCourse && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>تعديل الكورس ✏️</h3>
            <form onSubmit={handleUpdateCourse} style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
              <div>
                <label>اسم الكورس</label>
                <input type="text" required value={editingCourse.title} onChange={e => setEditingCourse({...editingCourse, title: e.target.value})} style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px'}}/>
              </div>
              
              <div>
                <label>المرحلة الدراسية</label>
                <select value={editingCourse.stage} onChange={e => setEditingCourse({...editingCourse, stage: e.target.value})} style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px'}}>
                  <option value="all">عام لجميع المراحل</option>
                  <option value="primary_1">الصف الأول الابتدائي</option>
                  <option value="primary_2">الصف الثاني الابتدائي</option>
                  <option value="primary_3">الصف الثالث الابتدائي</option>
                  <option value="primary_4">الصف الرابع الابتدائي</option>
                  <option value="primary_5">الصف الخامس الابتدائي</option>
                  <option value="primary_6">الصف السادس الابتدائي</option>
                  <option value="prep_1">الصف الأول الإعدادي</option>
                  <option value="prep_2">الصف الثاني الإعدادي</option>
                  <option value="prep_3">الصف الثالث الإعدادي</option>
                  <option value="sec_1">الصف الأول الثانوي</option>
                  <option value="sec_2">الصف الثاني الثانوي</option>
                  <option value="sec_3">الصف الثالث الثانوي</option>
                </select>
              </div>

              <div>
                <label>وصف الكورس</label>
                <input type="text" value={editingCourse.description} onChange={e => setEditingCourse({...editingCourse, description: e.target.value})} style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px'}}/>
              </div>
              
              <div>
                <label>رابط صورة الغلاف (اختياري)</label>
                <input type="text" value={editingCourse.image_url} onChange={e => setEditingCourse({...editingCourse, image_url: e.target.value})} style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px'}} dir="ltr"/>
              </div>

              <div className={styles.modalButtons}>
                <button type="submit" className={`${styles.modalBtn} ${styles.btnPrimary}`}>حفظ التعديلات</button>
                <button type="button" onClick={() => setEditingCourse(null)} className={`${styles.modalBtn} ${styles.btnSecondary}`}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Editing Lesson */}
      {editingLesson && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal} style={{maxWidth: '800px'}}>
            <h3>تعديل الدرس ✏️</h3>
            <form onSubmit={handleUpdateLesson} style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
              <div style={{display: 'flex', gap: '15px'}}>
                <div style={{flex: 1}}>
                  <label>عنوان الدرس</label>
                  <input type="text" required value={editingLesson.title} onChange={e => setEditingLesson({...editingLesson, title: e.target.value})} style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px'}}/>
                </div>
                <div style={{flex: 1}}>
                  <label>الكورس التابع له</label>
                  <select value={editingLesson.course_id || ''} onChange={e => setEditingLesson({...editingLesson, course_id: e.target.value})} style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px'}}>
                    <option value="">-- بدون كورس (مستقل) --</option>
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label>وصف الدرس (اختياري)</label>
                <textarea 
                  value={editingLesson.description || ''} 
                  onChange={e => setEditingLesson({...editingLesson, description: e.target.value})} 
                  style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', resize: 'vertical'}}
                  rows={2}
                  placeholder="اكتب وصفاً مختصراً للدرس..."
                />
              </div>

              <div style={{display: 'flex', gap: '15px', flexWrap: 'wrap'}}>
                <div style={{flex: 1, minWidth: '220px'}}>
                  <label>رابط الفيديو (Google Drive) - اختياري</label>
                  <input type="text" value={editingLesson.video_url || ''} onChange={e => setEditingLesson({...editingLesson, video_url: e.target.value})} style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px'}} dir="ltr" placeholder="رابط درايف"/>
                </div>
                <div style={{flex: 1, minWidth: '220px'}}>
                  <label>رابط العرض (Canva) - اختياري</label>
                  <input type="text" value={editingLesson.canva_url || ''} onChange={e => setEditingLesson({...editingLesson, canva_url: e.target.value})} style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px'}} dir="ltr" placeholder="رابط عرض كانفا"/>
                </div>
              </div>

              {/* Direct PDF / File Link */}
              <div>
                <label style={{fontWeight: 'bold', color: '#1e293b'}}>رابط ملف/مذكرة الدرس المباشر (PDF Drive Link) - اختياري</label>
                <input 
                  type="text" 
                  value={editingLesson.pdf_url || ''} 
                  onChange={e => setEditingLesson({...editingLesson, pdf_url: e.target.value})} 
                  placeholder="https://drive.google.com/... رابط مباشر لمذكرة الدرس أو ملف PDF" 
                  style={{width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '5px', marginTop: '4px'}} 
                  dir="ltr"
                />
              </div>

              <div style={{display: 'flex', gap: '15px', alignItems: 'center'}}>
                <div style={{flex: 1}}>
                  <label>نقاط الدرس 🌟</label>
                  <input type="number" required value={editingLesson.points_reward} onChange={e => setEditingLesson({...editingLesson, points_reward: e.target.value})} style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px'}}/>
                </div>
                <label style={{display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flex: 1}}>
                  <input type="checkbox" checked={editingLesson.is_free} onChange={e => setEditingLesson({...editingLesson, is_free: e.target.checked})}/>
                  درس مجاني (متاح للجميع)
                </label>
              </div>

              {/* 2. Attachments Section */}
              <div style={{border: '1px solid #e2e8f0', padding: '15px', borderRadius: '10px', background: '#f8fafc'}}>
                <h4 style={{margin: '0 0 12px 0', borderBottom: '2px solid #2563eb', display: 'inline-block', paddingBottom: '4px', color: '#1e40af'}}>
                  📁 ملفات ومذكرات الدرس الملحقة (Attachments)
                </h4>
                
                <ul style={{listStyle: 'none', padding: 0, margin: '0 0 15px 0'}}>
                  {(editingLesson.attachments || []).map((att, idx) => (
                    <li key={idx} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'white', border: '1px solid #e2e8f0', marginBottom: '8px', borderRadius: '6px'}}>
                      <span style={{fontWeight: 500}}>📄 {att.name}</span>
                      <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
                        {att.url && (
                          <a href={att.url} target="_blank" rel="noopener noreferrer" style={{color: '#2563eb', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 'bold'}}>
                            معاينة 🔗
                          </a>
                        )}
                        <button type="button" onClick={() => removeEditAttachment(idx)} style={{background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.9rem'}}>
                          حذف 🗑
                        </button>
                      </div>
                    </li>
                  ))}
                  {(!editingLesson.attachments || editingLesson.attachments.length === 0) && (
                    <p style={{color: '#94a3b8', fontSize: '0.9rem', margin: '5px 0'}}>لا توجد ملفات مرفقة مضافة حالياً.</p>
                  )}
                </ul>

                <div style={{display: 'flex', gap: '10px', alignItems: 'flex-end', flexWrap: 'wrap', background: 'white', padding: '12px', borderRadius: '8px', border: '1px dashed #cbd5e1'}}>
                  <div style={{flex: 1, minWidth: '160px'}}>
                    <label style={{fontSize: '0.85rem', display: 'block', marginBottom: '4px'}}>اسم الملف (مثال: مذكرة شرح الدرس)</label>
                    <input 
                      type="text" 
                      value={newEditAttachment.name} 
                      onChange={e => setNewEditAttachment({...newEditAttachment, name: e.target.value})} 
                      placeholder="اسم المذكرة..." 
                      style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '5px'}} 
                    />
                  </div>
                  <div style={{flex: 2, minWidth: '220px'}}>
                    <label style={{fontSize: '0.85rem', display: 'block', marginBottom: '4px'}}>رابط الملف (رابط Google Drive للملف)</label>
                    <input 
                      type="text" 
                      value={newEditAttachment.url} 
                      onChange={e => setNewEditAttachment({...newEditAttachment, url: e.target.value})} 
                      placeholder="https://drive.google.com/..." 
                      style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '5px'}} 
                      dir="ltr" 
                    />
                  </div>
                  <button 
                    type="button" 
                    onClick={addEditAttachment} 
                    style={{padding: '8px 16px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold'}}
                  >
                    إضافة ملف ➕
                  </button>
                </div>
              </div>

              {/* Interactive Quiz Edit */}
              <div style={{border: '1px solid #eee', padding: '15px', borderRadius: '10px'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '2px solid #9333ea', paddingBottom: '10px', flexWrap: 'wrap', gap: '10px'}}>
                  <h3 style={{margin: 0}}>تعديل الاختبار الإلكتروني</h3>
                  
                  <div style={{display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap'}}>
                    <select 
                      value={editingLesson.quiz_theme || 'classic'} 
                      onChange={e => setEditingLesson({...editingLesson, quiz_theme: e.target.value})}
                      style={{padding: '5px 10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '0.9rem'}}
                    >
                      <option value="classic">كلاسيكي هادئ</option>
                      <option value="gamified">ألعاب وتفاعلي (صغار)</option>
                    </select>
                    
                    <button type="button" onClick={downloadCSVTemplate} style={{background: '#3b82f6', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontSize: '0.9rem'}}>تحميل نموذج CSV 📥</button>
                    
                    <label style={{background: '#10b981', color: 'white', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontSize: '0.9rem', border: 'none', display: 'flex', alignItems: 'center'}}>
                      رفع أسئلة CSV 📤
                      <input type="file" accept=".csv" onChange={handleEditCSVUpload} style={{display: 'none'}} />
                    </label>

                    <button 
                      type="button" 
                      onClick={() => setShowEditAiModal(true)} 
                      style={{background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px'}}
                    >
                      <Bot size={16} /> توليد ذكي 🤖
                    </button>
                  </div>
                </div>
                
                <ul style={{listStyle: 'none', padding: 0, marginBottom: '15px'}}>
                  {(editingLesson.quiz_data || []).map((q, idx) => (
                    <li key={idx} style={{padding: '10px', background: '#f8f9fa', marginBottom: '10px', borderRadius: '5px', position: 'relative'}}>
                      <strong>س {idx + 1}: {q.text}</strong>
                      <ul style={{marginTop: '5px', paddingRight: '20px'}}>
                        {q.options.map((opt, i) => (
                          <li key={i} style={{color: opt === q.correctAnswer ? 'green' : 'black'}}>{opt} {opt === q.correctAnswer && '✅'}</li>
                        ))}
                      </ul>
                      {q.explanation && <div style={{marginTop: '10px', fontSize: '0.9rem', color: '#666', background: '#e2e8f0', padding: '5px', borderRadius: '5px'}}><strong>التعليل:</strong> {q.explanation}</div>}
                      <button type="button" onClick={() => removeEditQuestion(idx)} style={{position: 'absolute', top: '10px', left: '10px', background: 'none', border: 'none', color: 'red', cursor: 'pointer'}}>حذف السؤال 🗑</button>
                    </li>
                  ))}
                </ul>

                <div style={{background: '#fafafa', padding: '15px', border: '1px dashed #ccc', borderRadius: '5px'}}>
                  <h4 style={{marginBottom: '10px'}}>إضافة سؤال جديد:</h4>
                  <div style={{marginBottom: '10px'}}>
                    <label>نص السؤال</label>
                    <input type="text" value={newQuestion.text} onChange={e => setNewQuestion({...newQuestion, text: e.target.value})} style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '5px'}} />
                  </div>
                  
                  <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px'}}>
                    {[0, 1, 2, 3].map(i => (
                      <div key={i} style={{flex: '1 1 45%'}}>
                        <label>خيار {i + 1}</label>
                        <input type="text" value={newQuestion.options[i]} onChange={e => updateOption(i, e.target.value)} style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '5px'}} />
                      </div>
                    ))}
                  </div>

                  <div style={{display: 'flex', gap: '10px', alignItems: 'flex-end', flexWrap: 'wrap'}}>
                    <div style={{flex: 1, minWidth: '200px'}}>
                      <label style={{color: 'green', fontWeight: 'bold'}}>الإجابة الصحيحة</label>
                      <select value={newQuestion.correctAnswer} onChange={e => setNewQuestion({...newQuestion, correctAnswer: e.target.value})} style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '5px'}}>
                        <option value="">-- اختر الإجابة --</option>
                        {newQuestion.options.filter(o => o.trim() !== '').map((o, i) => (
                          <option key={i} value={o}>{o}</option>
                        ))}
                      </select>
                    </div>
                    <div style={{flex: 2, minWidth: '200px'}}>
                      <label>التعليل (يظهر للطالب) - اختياري</label>
                      <input type="text" value={newQuestion.explanation} onChange={e => setNewQuestion({...newQuestion, explanation: e.target.value})} style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '5px'}} placeholder="السبب..." />
                    </div>
                    <button type="button" onClick={addEditQuestion} style={{padding: '8px 15px', background: '#9333ea', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', height: 'fit-content'}}>إضافة السؤال</button>
                  </div>
                </div>
              </div>

              <div className={styles.modalButtons}>
                <button type="submit" className={`${styles.modalBtn} ${styles.btnPrimary}`}>حفظ التعديلات</button>
                <button type="button" onClick={() => setEditingLesson(null)} className={`${styles.modalBtn} ${styles.btnSecondary}`}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Editing Lesson AI Question Generation */}
      {showEditAiModal && (
        <div style={{position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100000}}>
          <div style={{background: 'white', padding: '25px', borderRadius: '15px', width: '90%', maxWidth: '600px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)'}}>
            <h3 style={{marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#6d28d9'}}>
              <Bot /> توليد الأسئلة بالذكاء الاصطناعي (أثناء التعديل)
            </h3>
            <p style={{color: '#666', fontSize: '0.9rem'}}>ألصق قطعة القراءة أو الدرس هنا، وسيقوم الذكاء الاصطناعي بصياغة أسئلة تفاعلية وإضافتها لاختبار هذا الدرس.</p>
            
            <textarea 
              rows={6}
              value={aiEditPrompt}
              onChange={e => setAiEditPrompt(e.target.value)}
              placeholder="ألصق النص أو موضوع الدرس هنا..."
              style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', marginTop: '10px', resize: 'vertical'}}
            />

            <div style={{display: 'flex', gap: '15px', marginTop: '15px', flexWrap: 'wrap'}}>
              <div style={{flex: 1, minWidth: '110px'}}>
                <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem'}}>عدد الأسئلة</label>
                <select value={aiEditNumQuestions} onChange={e => setAiEditNumQuestions(e.target.value)} style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '5px'}}>
                  <option value={3}>3 أسئلة</option>
                  <option value={5}>5 أسئلة</option>
                  <option value={10}>10 أسئلة</option>
                </select>
              </div>
              <div style={{flex: 1, minWidth: '110px'}}>
                <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem'}}>مستوى الصعوبة</label>
                <select value={aiEditDifficulty} onChange={e => setAiEditDifficulty(e.target.value)} style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '5px'}}>
                  <option value="سهل">سهل</option>
                  <option value="متوسط">متوسط</option>
                  <option value="صعب">صعب</option>
                </select>
              </div>
              <div style={{flex: 1.5, minWidth: '180px'}}>
                <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem', color: '#6d28d9'}}>نموذج الذكاء الاصطناعي</label>
                <select value={aiEditModel} onChange={e => setAiEditModel(e.target.value)} style={{width: '100%', padding: '8px', border: '1px solid #c4b5fd', borderRadius: '5px', background: 'white', fontWeight: 'bold', color: '#6d28d9'}}>
                  {UNIFIED_AI_MODELS.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px'}}>
              <button type="button" onClick={() => setShowEditAiModal(false)} style={{padding: '8px 15px', border: 'none', background: '#eee', borderRadius: '5px', cursor: 'pointer'}}>إلغاء</button>
              <button 
                type="button" 
                onClick={handleEditAiGenerate}
                disabled={aiEditLoading}
                style={{padding: '8px 20px', border: 'none', background: '#6d28d9', color: 'white', borderRadius: '5px', cursor: aiEditLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold'}}
              >
                {aiEditLoading ? <><Loader2 size={16} style={{animation: 'spin 1s linear infinite'}} /> جاري التوليد...</> : 'توليد الأسئلة ✨'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Editing Student */}
      {editingStudent && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>تعديل بيانات الطالب ✏️</h3>
            <form onSubmit={handleUpdateStudent} style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
              <div>
                <label>اسم الطالب</label>
                <input type="text" required value={editingStudent.full_name || ''} onChange={e => setEditingStudent({...editingStudent, full_name: e.target.value})} style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px'}}/>
              </div>
              
              <div>
                <label>المرحلة الدراسية</label>
                <select value={editingStudent.stage || ''} onChange={e => setEditingStudent({...editingStudent, stage: e.target.value})} style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px'}}>
                  <option value="primary_1">الصف الأول الابتدائي</option>
                  <option value="primary_2">الصف الثاني الابتدائي</option>
                  <option value="primary_3">الصف الثالث الابتدائي</option>
                  <option value="primary_4">الصف الرابع الابتدائي</option>
                  <option value="primary_5">الصف الخامس الابتدائي</option>
                  <option value="primary_6">الصف السادس الابتدائي</option>
                  <option value="prep_1">الصف الأول الإعدادي</option>
                  <option value="prep_2">الصف الثاني الإعدادي</option>
                  <option value="prep_3">الصف الثالث الإعدادي</option>
                  <option value="sec_1">الصف الأول الثانوي</option>
                  <option value="sec_2">الصف الثاني الثانوي</option>
                  <option value="sec_3">الصف الثالث الثانوي</option>
                </select>
              </div>

              <div>
                <label>رقم الهاتف / الواتساب</label>
                <input type="text" value={editingStudent.phone || ''} onChange={e => setEditingStudent({...editingStudent, phone: e.target.value})} style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px'}} dir="ltr"/>
              </div>

              <div>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>رصيد الذكاء الاصطناعي (AI Credits 💎)</span>
                  <span style={{ fontSize: '0.85rem', color: '#7c3aed', fontWeight: 'bold' }}>
                    {editingStudent.ai_credits_balance ?? 20} كريديت حالياً
                  </span>
                </label>
                <input 
                  type="number" 
                  min="0"
                  value={editingStudent.ai_credits_balance !== undefined ? editingStudent.ai_credits_balance : 20} 
                  onChange={e => setEditingStudent({...editingStudent, ai_credits_balance: parseInt(e.target.value, 10) || 0})} 
                  style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px'}}
                />
                <small style={{color: '#64748b', marginTop: '4px', display: 'block', fontSize: '0.82rem'}}>
                  الرصيد الافتراضي للطلاب 20 كريديت. يمكنك تعديل الرصيد مباشرة هنا.
                </small>
              </div>

              {/* Package Type */}
              <div>
                <label style={{ fontWeight: 'bold' }}>نوع الباقة والاشتراك 📦</label>
                <select 
                  value={editingStudent.plan_type || 'student_basic'} 
                  onChange={e => {
                    const newPlan = e.target.value
                    const isVip = newPlan === 'student_vip'
                    setEditingStudent({
                      ...editingStudent, 
                      plan_type: newPlan,
                      has_live: isVip
                    })
                  }} 
                  style={{width: '100%', padding: '10px', border: '1.5px solid #cbd5e1', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 'bold'}}
                >
                  <option value="student_basic">🎓 باقة التفوق (بدون لايف) - دروس + امتحانات</option>
                  <option value="student_vip">⭐ باقة VIP الشاملة (مع البث المباشر 🔴)</option>
                  <option value="free">🆓 حساب مجاني (المحتوى العام فقط)</option>
                </select>
              </div>

              {/* Live Access Switch */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: editingStudent.has_live ? '#fef3c7' : '#f8fafc', borderRadius: '10px', border: `1.5px solid ${editingStudent.has_live ? '#fcd34d' : '#e2e8f0'}` }}>
                <div>
                  <div style={{ fontWeight: 'bold', color: editingStudent.has_live ? '#92400e' : '#334155', fontSize: '0.92rem' }}>
                    🔴 صلاحية البث المباشر (Live Classroom)
                  </div>
                  <small style={{ color: '#64748b', fontSize: '0.8rem' }}>
                    {editingStudent.has_live ? 'مسموح له بدخول حصص البث المباشر' : 'غير مسموح له بدخول البث المباشر'}
                  </small>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.88rem' }}>
                  <input 
                    type="checkbox" 
                    checked={!!editingStudent.has_live} 
                    onChange={e => setEditingStudent({ ...editingStudent, has_live: e.target.checked })}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span>{editingStudent.has_live ? 'مفعل ✅' : 'معطل ❌'}</span>
                </label>
              </div>

              {/* Subscription End Date */}
              <div>
                <label style={{ fontWeight: 'bold' }}>تاريخ نهاية الاشتراك 📅</label>
                <input 
                  type="date" 
                  value={editingStudent.subscription_end_date ? new Date(editingStudent.subscription_end_date).toISOString().split('T')[0] : ''} 
                  onChange={e => {
                    const val = e.target.value ? new Date(e.target.value).toISOString() : null
                    setEditingStudent({ ...editingStudent, subscription_end_date: val })
                  }} 
                  style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px'}}
                />
              </div>

              <div className={styles.modalButtons}>
                <button type="submit" className={`${styles.modalBtn} ${styles.btnPrimary}`}>حفظ التعديلات</button>
                <button type="button" onClick={() => setEditingStudent(null)} className={`${styles.modalBtn} ${styles.btnSecondary}`}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}



















