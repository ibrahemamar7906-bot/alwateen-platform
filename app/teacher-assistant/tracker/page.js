'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../utils/supabase'
import { Users, LayoutGrid, CalendarCheck, DollarSign, ArrowRight, FileText, FileEdit, Home } from 'lucide-react'
import StudentsTab from '../../components/TeacherAssistant/Tracker/StudentsTab'
import GroupsTab from '../../components/TeacherAssistant/Tracker/GroupsTab'
import AttendanceTab from '../../components/TeacherAssistant/Tracker/AttendanceTab'
import PaymentsTab from '../../components/TeacherAssistant/Tracker/PaymentsTab'
import ReportsTab from '../../components/TeacherAssistant/Tracker/ReportsTab'
import GradesTab from '../../components/TeacherAssistant/Tracker/GradesTab'
import OverviewTab from '../../components/TeacherAssistant/Tracker/OverviewTab'
import styles from './tracker.module.css'

export default function TrackerDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [teacher, setTeacher] = useState(null)
  const [activeTab, setActiveTab] = useState('overview') // overview | students | groups | attendance | grades | payments | reports

  useEffect(() => {
    fetchTeacherData()
  }, [])

  const fetchTeacherData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (!['teacher', 'teacher_pro', 'admin', 'assistant'].includes(profile?.role)) {
        router.push('/student-dashboard')
        return
      }

      let finalId = user.id
      
      // If user is an assistant, they should see the Admin's data
      if (profile?.role === 'assistant') {
        const { data: link } = await supabase
          .from('assistant_links')
          .select('teacher_id')
          .eq('assistant_id', user.id)
          .eq('status', 'approved')
          .maybeSingle()
          
        if (link) {
          finalId = link.teacher_id
        } else {
          router.push('/assistant-link')
          return
        }
      } 
      setTeacher({
        id: finalId,
        name: profile.full_name || 'المستر إبراهيم عمار الجندي'
      })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.3rem', fontWeight: 'bold', color: '#059669', direction: 'rtl' }}>
        <span>جاري تحميل المتابع الذكي... 📊</span>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', label: 'نظرة عامة', icon: <Home size={18} /> },
    { id: 'attendance', label: 'الحضور والغياب', icon: <CalendarCheck size={18} /> },
    { id: 'grades', label: 'الامتحانات والدرجات', icon: <FileEdit size={18} /> },
    { id: 'students', label: 'قائمة الطلاب', icon: <Users size={18} /> },
    { id: 'groups', label: 'المجموعات', icon: <LayoutGrid size={18} /> },
    { id: 'payments', label: 'الماليات والاشتراكات', icon: <DollarSign size={18} /> },
    { id: 'reports', label: 'التقارير وشهادات المتابعة', icon: <FileText size={18} /> },
  ]

  const teacherName = teacher?.name || 'المستر إبراهيم عمار الجندي'

  return (
    <div className={styles.container}>
      
      {/* Header */}
      <header className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button 
            onClick={() => router.push('/teacher-assistant')}
            className={styles.backBtn}
            title="العودة لأدوات المعلم"
          >
            <ArrowRight size={20} />
          </button>
          <div>
            <h1 className={styles.headerTitle}>المتابع الذكي 📊</h1>
            <p className={styles.headerSubtitle}>إدارة شاملة لطلابك، الحضور والغياب، رصد الامتحانات، ورسائل أولياء الأمور</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontSize: '0.82rem',
            fontWeight: 'bold',
            padding: '6px 12px',
            borderRadius: '12px',
            background: '#ecfdf5',
            color: '#047857',
            border: '1px solid #a7f3d0'
          }}>
            👨‍🏫 {teacherName}
          </span>
        </div>
      </header>

      {/* Tabs */}
      <div className={styles.tabsContainer}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`${styles.tabBtn} ${activeTab === tab.id ? styles.tabBtnActive : ''}`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <main className={styles.mainCard}>
        {activeTab === 'overview' && (
          <OverviewTab 
            teacherId={teacher.id} 
            teacherName={teacherName} 
            onSwitchTab={setActiveTab} 
          />
        )}
        {activeTab === 'attendance' && (
          <AttendanceTab 
            teacherId={teacher.id} 
            teacherName={teacherName} 
          />
        )}
        {activeTab === 'grades' && (
          <GradesTab 
            teacherId={teacher.id} 
            teacherName={teacherName} 
          />
        )}
        {activeTab === 'students' && (
          <StudentsTab 
            teacherId={teacher.id} 
            teacherName={teacherName} 
          />
        )}
        {activeTab === 'groups' && (
          <GroupsTab 
            teacherId={teacher.id} 
            teacherName={teacherName} 
          />
        )}
        {activeTab === 'payments' && (
          <PaymentsTab 
            teacherId={teacher.id} 
            teacherName={teacherName} 
          />
        )}
        {activeTab === 'reports' && (
          <ReportsTab 
            teacherId={teacher.id} 
            teacherName={teacherName} 
          />
        )}
      </main>

    </div>
  )
}
