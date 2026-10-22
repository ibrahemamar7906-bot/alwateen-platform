import { useState, useEffect } from 'react'
import { supabase } from '../../../../utils/supabase'
import { 
  Users, LayoutGrid, CalendarCheck, DollarSign, TrendingUp, AlertTriangle, 
  MessageCircle, FileEdit, FileText, ArrowLeft, CheckCircle2, ShieldAlert, Sparkles, RefreshCw
} from 'lucide-react'

export default function OverviewTab({ teacherId, teacherName = 'المستر إبراهيم عمار الجندي', onSwitchTab }) {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalGroups: 0,
    totalRevenue: 0,
    unpaidCount: 0,
    totalExams: 0
  })
  const [atRiskStudents, setAtRiskStudents] = useState([])
  const [unpaidList, setUnpaidList] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [teacherId])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      // 1. Total Students
      const { count: studentsCount } = await supabase
        .from('teacher_students')
        .select('*', { count: 'exact', head: true })
        .eq('teacher_id', teacherId)

      // 2. Total Groups
      const { data: groups } = await supabase
        .from('teacher_groups')
        .select('id, name')
        .eq('teacher_id', teacherId)

      const groupsCount = groups?.length || 0

      // 3. Exams count
      const { count: examsCount } = await supabase
        .from('teacher_exams')
        .select('*', { count: 'exact', head: true })
        .eq('teacher_id', teacherId)

      // 4. Revenue & Unpaid from Payments
      let totalRevenue = 0
      let unpaidItems = []
      let unpaidCount = 0

      if (groups && groups.length > 0) {
        const groupIds = groups.map(g => g.id)

        const { data: payments } = await supabase
          .from('teacher_payments')
          .select('id, student_id, amount_paid, payment_reference, status, group_id, teacher_students(id, name, phone, parent_phone)')
          .in('group_id', groupIds)

        if (payments) {
          payments.forEach(p => {
            const amount = Number(p.amount_paid) || 0
            totalRevenue += amount
            if (p.status !== 'paid') {
              unpaidCount++
              if (p.teacher_students) {
                unpaidItems.push({
                  id: p.id,
                  studentName: p.teacher_students.name,
                  phone: p.teacher_students.parent_phone || p.teacher_students.phone,
                  reference: p.payment_reference || 'غير محدد',
                  status: p.status,
                  amountPaid: amount
                })
              }
            }
          })
        }
      }

      // 5. At-Risk Attendance (Students with 2 or more absences)
      // Get all students for this teacher
      const { data: teacherStudents } = await supabase
        .from('teacher_students')
        .select('id, name, grade, phone, parent_phone')
        .eq('teacher_id', teacherId)

      let riskList = []
      if (teacherStudents && teacherStudents.length > 0) {
        const studentIds = teacherStudents.map(s => s.id)
        
        // Fetch absences
        const { data: absences } = await supabase
          .from('teacher_attendance')
          .select('student_id, session_date, status')
          .in('student_id', studentIds)
          .eq('status', 'absent')

        if (absences && absences.length > 0) {
          const absenceCounts = absences.reduce((acc, curr) => {
            acc[curr.student_id] = (acc[curr.student_id] || 0) + 1
            return acc
          }, {})

          teacherStudents.forEach(st => {
            const count = absenceCounts[st.id] || 0
            if (count >= 2) {
              riskList.push({
                ...st,
                absenceCount: count
              })
            }
          })

          // Sort by absence count descending
          riskList.sort((a, b) => b.absenceCount - a.absenceCount)
        }
      }

      setStats({
        totalStudents: studentsCount || 0,
        totalGroups: groupsCount,
        totalRevenue,
        unpaidCount,
        totalExams: examsCount || 0
      })
      setAtRiskStudents(riskList.slice(0, 8)) // top 8
      setUnpaidList(unpaidItems.slice(0, 8))   // top 8
    } catch (e) {
      console.error('Error fetching dashboard stats:', e)
    } finally {
      setLoading(false)
    }
  }

  const formatEgyptPhone = (raw) => {
    if (!raw) return ''
    let cleaned = raw.replace(/\D/g, '')
    if (cleaned.startsWith('0')) {
      cleaned = '2' + cleaned
    } else if (!cleaned.startsWith('2') && cleaned.length === 10) {
      cleaned = '20' + cleaned
    }
    return cleaned
  }

  const sendAbsenceAlert = (student) => {
    const phone = formatEgyptPhone(student.parent_phone || student.phone)
    if (!phone) {
      alert('لا يوجد رقم هاتف مسجل لولي الأمر!')
      return
    }
    const msg = `السلام عليكم ورحمة الله وبركاته،\nولي أمر الطالب المحترم: ${student.name}\n\nنود إحاطة علم سيادتكم بأن الطالب تغيب عن (${student.absenceCount}) حصص.\nيرجى التواصل معنا للمتابعة والاطمئنان على مستواه والالتزام بالحضور.\n\nمع تحيات: ${teacherName} 👨‍🏫`
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const sendPaymentReminder = (item) => {
    const phone = formatEgyptPhone(item.phone)
    if (!phone) {
      alert('لا يوجد رقم هاتف مسجل لولي الأمر!')
      return
    }
    const msg = `السلام عليكم ورحمة الله وبركاته،\nولي أمر الطالب المحترم: ${item.studentName}\n\nنود تذكير سيادتكم بلطف بسداد اشتراك (${item.reference}).\nشاكرين لسيادتكم حسن التعاون والاهتمام بمستقبل أبنائنا.\n\nمع تحيات: ${teacherName} 👨‍🏫`
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: '#059669' }}>
        <RefreshCw size={36} className="spin" style={{ animation: 'spin 1s linear infinite', marginBottom: '12px' }} />
        <h3 style={{ margin: 0, fontSize: '1.2rem' }}>جاري تجهيز لوحة القيادة الذكية...</h3>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* ── Welcome & Status Banner ── */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        borderRadius: '20px',
        padding: '24px 28px',
        color: '#ffffff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.25)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{
              background: 'rgba(16, 185, 129, 0.2)',
              color: '#34d399',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 'bold',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Sparkles size={14} /> المتابع الذكي نشط
            </span>
            <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>• {new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          <h2 style={{ margin: '0 0 6px 0', fontSize: '1.6rem', fontWeight: 900, color: '#f8fafc' }}>
            أهلاً بك، {teacherName} 👨‍🏫
          </h2>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.95rem' }}>
            إليك ملخص شامل ومباشر لطلابك ومجموعاتك والتنبيهات العاجلة اليوم.
          </p>
        </div>

        <button
          onClick={fetchDashboardData}
          style={{
            zIndex: 1,
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: '#ffffff',
            padding: '10px 18px',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s',
            fontSize: '0.9rem'
          }}
          title="تحديث البيانات"
        >
          <RefreshCw size={16} /> تحديث
        </button>
      </div>

      {/* ── 4 Main Stat Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px' }}>
        
        {/* Total Students */}
        <div 
          onClick={() => onSwitchTab && onSwitchTab('students')}
          style={{ 
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', 
            padding: '22px', 
            borderRadius: '20px', 
            color: 'white', 
            boxShadow: '0 10px 20px -5px rgba(37,99,235,0.35)',
            cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1rem', opacity: 0.9 }}>إجمالي الطلاب</h3>
            <div style={{ background: 'rgba(255,255,255,0.18)', padding: '10px', borderRadius: '12px' }}>
              <Users size={24} />
            </div>
          </div>
          <p style={{ fontSize: '2.4rem', fontWeight: 900, margin: '14px 0 0 0', letterSpacing: '-1px' }}>
            {stats.totalStudents}
          </p>
          <span style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '4px', display: 'block' }}>انقر لعرض قائمة الطلاب ⬅</span>
        </div>

        {/* Total Groups */}
        <div 
          onClick={() => onSwitchTab && onSwitchTab('groups')}
          style={{ 
            background: 'linear-gradient(135deg, #059669, #047857)', 
            padding: '22px', 
            borderRadius: '20px', 
            color: 'white', 
            boxShadow: '0 10px 20px -5px rgba(5,150,105,0.35)',
            cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1rem', opacity: 0.9 }}>المجموعات</h3>
            <div style={{ background: 'rgba(255,255,255,0.18)', padding: '10px', borderRadius: '12px' }}>
              <LayoutGrid size={24} />
            </div>
          </div>
          <p style={{ fontSize: '2.4rem', fontWeight: 900, margin: '14px 0 0 0', letterSpacing: '-1px' }}>
            {stats.totalGroups}
          </p>
          <span style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '4px', display: 'block' }}>انقر لإدارة المجموعات ⬅</span>
        </div>

        {/* Total Revenue */}
        <div 
          onClick={() => onSwitchTab && onSwitchTab('payments')}
          style={{ 
            background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', 
            padding: '22px', 
            borderRadius: '20px', 
            color: 'white', 
            boxShadow: '0 10px 20px -5px rgba(124,58,237,0.35)',
            cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1rem', opacity: 0.9 }}>إجمالي التحصيل</h3>
            <div style={{ background: 'rgba(255,255,255,0.18)', padding: '10px', borderRadius: '12px' }}>
              <DollarSign size={24} />
            </div>
          </div>
          <p style={{ fontSize: '2.4rem', fontWeight: 900, margin: '14px 0 0 0', letterSpacing: '-1px' }}>
            {stats.totalRevenue.toLocaleString()} <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>ج.م</span>
          </p>
          <span style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '4px', display: 'block' }}>انقر لمتابعة الاشتراكات ⬅</span>
        </div>

        {/* Unpaid Alert Card */}
        <div 
          onClick={() => onSwitchTab && onSwitchTab('payments')}
          style={{ 
            background: stats.unpaidCount > 0 ? 'linear-gradient(135deg, #ea580c, #c2410c)' : 'linear-gradient(135deg, #64748b, #475569)', 
            padding: '22px', 
            borderRadius: '20px', 
            color: 'white', 
            boxShadow: '0 10px 20px -5px rgba(234,88,12,0.35)',
            cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1rem', opacity: 0.9 }}>اشتراكات معلقة</h3>
            <div style={{ background: 'rgba(255,255,255,0.18)', padding: '10px', borderRadius: '12px' }}>
              <AlertTriangle size={24} />
            </div>
          </div>
          <p style={{ fontSize: '2.4rem', fontWeight: 900, margin: '14px 0 0 0', letterSpacing: '-1px' }}>
            {stats.unpaidCount}
          </p>
          <span style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '4px', display: 'block' }}>
            {stats.unpaidCount > 0 ? 'تحتاج لمتابعة السداد ⬅' : 'تم سداد جميع الاشتراكات ✅'}
          </span>
        </div>

      </div>

      {/* ── Quick Actions Bar ── */}
      <div style={{
        background: '#ffffff',
        border: '1.5px solid #e2e8f0',
        borderRadius: '20px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
      }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
          ⚡ إجراءات سريعة ومباشرة
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          
          <button
            onClick={() => onSwitchTab && onSwitchTab('attendance')}
            style={{
              padding: '14px 16px',
              borderRadius: '14px',
              border: '1.5px solid #a7f3d0',
              background: '#ecfdf5',
              color: '#047857',
              fontWeight: 800,
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <CalendarCheck size={20} />
            <span>تسجيل حضور حصة</span>
          </button>

          <button
            onClick={() => onSwitchTab && onSwitchTab('grades')}
            style={{
              padding: '14px 16px',
              borderRadius: '14px',
              border: '1.5px solid #bfdbfe',
              background: '#eff6ff',
              color: '#1d4ed8',
              fontWeight: 800,
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <FileEdit size={20} />
            <span>رصد درجات امتحان</span>
          </button>

          <button
            onClick={() => onSwitchTab && onSwitchTab('students')}
            style={{
              padding: '14px 16px',
              borderRadius: '14px',
              border: '1.5px solid #ddd6fe',
              background: '#f5f3ff',
              color: '#6d28d9',
              fontWeight: 800,
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <Users size={20} />
            <span>إضافة / استيراد طلاب</span>
          </button>

          <button
            onClick={() => onSwitchTab && onSwitchTab('payments')}
            style={{
              padding: '14px 16px',
              borderRadius: '14px',
              border: '1.5px solid #fed7aa',
              background: '#fff7ed',
              color: '#c2410c',
              fontWeight: 800,
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <DollarSign size={20} />
            <span>تسجيل اشتراكات شهرية</span>
          </button>

          <button
            onClick={() => onSwitchTab && onSwitchTab('reports')}
            style={{
              padding: '14px 16px',
              borderRadius: '14px',
              border: '1.5px solid #e2e8f0',
              background: '#f8fafc',
              color: '#334155',
              fontWeight: 800,
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <FileText size={20} />
            <span>تقارير وشهادات متابعة</span>
          </button>

        </div>
      </div>

      {/* ── Two Smart Alert Columns (Absences & Payments) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        
        {/* At-Risk Absences */}
        <div style={{
          background: '#ffffff',
          borderRadius: '20px',
          border: '1.5px solid #fecaca',
          padding: '20px',
          boxShadow: '0 4px 15px -3px rgba(239, 68, 68, 0.08)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#991b1b', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={22} color="#dc2626" />
              <span>تنبيهات الغياب المتكرر ({atRiskStudents.length})</span>
            </h3>
            {atRiskStudents.length > 0 && (
              <span style={{ fontSize: '0.75rem', background: '#fee2e2', color: '#b91c1c', padding: '3px 8px', borderRadius: '10px', fontWeight: 'bold' }}>
                غياب مرتين أو أكثر
              </span>
            )}
          </div>

          {atRiskStudents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: '#059669' }}>
              <CheckCircle2 size={36} style={{ marginBottom: '8px' }} />
              <p style={{ margin: 0, fontWeight: 700 }}>ممتاز! لا يوجد طلاب تجاوزوا حد الغياب المقلق.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {atRiskStudents.map((st) => (
                <div 
                  key={st.id} 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '14px',
                    background: '#fef2f2',
                    border: '1px solid #fee2e2',
                    gap: '10px'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>{st.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#dc2626', fontWeight: 600, marginTop: '2px' }}>
                      تغيب {st.absenceCount} مرات {st.grade ? `• ${st.grade}` : ''}
                    </div>
                  </div>

                  <button
                    onClick={() => sendAbsenceAlert(st)}
                    style={{
                      background: '#25D366',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '8px 12px',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      flexShrink: 0
                    }}
                    title="مراسلة ولي الأمر عبر واتساب"
                  >
                    <MessageCircle size={15} /> تنبيه
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending / Unpaid Payments */}
        <div style={{
          background: '#ffffff',
          borderRadius: '20px',
          border: '1.5px solid #fed7aa',
          padding: '20px',
          boxShadow: '0 4px 15px -3px rgba(249, 115, 22, 0.08)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#9a3412', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={22} color="#ea580c" />
              <span>تنبيهات المصروفات المتأخرة ({unpaidList.length})</span>
            </h3>
            {unpaidList.length > 0 && (
              <span style={{ fontSize: '0.75rem', background: '#ffedd5', color: '#c2410c', padding: '3px 8px', borderRadius: '10px', fontWeight: 'bold' }}>
                اشتراكات لم تكتمل
              </span>
            )}
          </div>

          {unpaidList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: '#059669' }}>
              <CheckCircle2 size={36} style={{ marginBottom: '8px' }} />
              <p style={{ margin: 0, fontWeight: 700 }}>رائع! لا توجد اشتراكات معلقة حالياً.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {unpaidList.map((item) => (
                <div 
                  key={item.id} 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '14px',
                    background: '#fff7ed',
                    border: '1px solid #ffedd5',
                    gap: '10px'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>{item.studentName}</div>
                    <div style={{ fontSize: '0.8rem', color: '#c2410c', fontWeight: 600, marginTop: '2px' }}>
                      {item.reference} • {item.status === 'partial' ? `دفع جزئي (${item.amountPaid} ج.م)` : 'لم يسدد'}
                    </div>
                  </div>

                  <button
                    onClick={() => sendPaymentReminder(item)}
                    style={{
                      background: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '8px 12px',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      flexShrink: 0
                    }}
                    title="إرسال تذكير بالسداد لواتساب ولي الأمر"
                  >
                    <MessageCircle size={15} /> تذكير
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  )
}
