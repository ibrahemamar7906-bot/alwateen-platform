import { useState, useEffect } from 'react'
import { supabase } from '../../../../utils/supabase'
import { 
  FileText, Search, User, Calendar, DollarSign, MessageCircle, 
  Printer, ArrowRight, Award, CheckCircle2, XCircle, Clock, AlertTriangle, Users 
} from 'lucide-react'

export default function ReportsTab({ teacherId, teacherName = 'المستر إبراهيم عمار الجندي' }) {
  const [students, setStudents] = useState([])
  const [groups, setGroups] = useState([])
  const [selectedGroup, setSelectedGroup] = useState('')
  const [selectedStudent, setSelectedStudent] = useState(null)
  
  const [reportData, setReportData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingReport, setLoadingReport] = useState(false)
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState('student') // 'student' | 'group'
  const [groupReportData, setGroupReportData] = useState([])
  const [loadingGroupReport, setLoadingGroupReport] = useState(false)

  useEffect(() => {
    fetchInitialData()
  }, [teacherId])

  useEffect(() => {
    if (selectedStudent) {
      generateStudentReport(selectedStudent)
    } else {
      setReportData(null)
    }
  }, [selectedStudent])

  useEffect(() => {
    if (viewMode === 'group' && selectedGroup) {
      generateGroupReport(selectedGroup)
    }
  }, [viewMode, selectedGroup])

  const fetchInitialData = async () => {
    setLoading(true)
    try {
      const [studentsRes, groupsRes] = await Promise.all([
        supabase
          .from('teacher_students')
          .select('id, name, phone, parent_phone, grade')
          .eq('teacher_id', teacherId)
          .order('name'),
        supabase
          .from('teacher_groups')
          .select('id, name')
          .eq('teacher_id', teacherId)
          .order('name')
      ])

      if (studentsRes.data) setStudents(studentsRes.data)
      if (groupsRes.data) {
        setGroups(groupsRes.data)
        if (groupsRes.data.length > 0) setSelectedGroup(groupsRes.data[0].id)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const generateStudentReport = async (student) => {
    setLoadingReport(true)
    try {
      // 1. Fetch attendance
      const { data: attendance } = await supabase
        .from('teacher_attendance')
        .select('session_date, status')
        .eq('student_id', student.id)
        .order('session_date', { ascending: false })

      // 2. Fetch payments
      const { data: payments } = await supabase
        .from('teacher_payments')
        .select('amount_paid, payment_type, payment_reference, status, created_at')
        .eq('student_id', student.id)
        .order('created_at', { ascending: false })

      // 3. Fetch exams
      const { data: exams } = await supabase
        .from('teacher_exam_scores')
        .select('score, notes, teacher_exams(id, exam_name, max_score, exam_date)')
        .eq('student_id', student.id)

      // Calculate stats
      const totalSessions = attendance?.length || 0
      const present = attendance?.filter(a => a.status === 'present').length || 0
      const absent = attendance?.filter(a => a.status === 'absent').length || 0
      const late = attendance?.filter(a => a.status === 'late').length || 0
      const attendanceRate = totalSessions > 0 ? Math.round((present / totalSessions) * 100) : 100

      // Calculate exam averages
      const validExams = exams ? exams.filter(e => e.teacher_exams && e.score !== null) : []
      let totalScorePercent = 0
      if (validExams.length > 0) {
        const sumPct = validExams.reduce((sum, e) => {
          const max = Number(e.teacher_exams.max_score) || 100
          return sum + ((Number(e.score) / max) * 100)
        }, 0)
        totalScorePercent = Math.round(sumPct / validExams.length)
      }

      const stats = {
        totalSessions,
        present,
        absent,
        late,
        attendanceRate,
        examCount: validExams.length,
        avgScorePercent: totalScorePercent
      }

      setReportData({ 
        student, 
        attendance: attendance || [], 
        payments: payments || [], 
        exams: validExams, 
        stats 
      })
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingReport(false)
    }
  }

  const generateGroupReport = async (groupId) => {
    setLoadingGroupReport(true)
    try {
      const { data: links } = await supabase
        .from('teacher_group_students')
        .select('student_id, teacher_students(id, name, phone, parent_phone, grade)')
        .eq('group_id', groupId)

      if (links) {
        const groupStudents = links.map(l => l.teacher_students).filter(Boolean)
        const studentIds = groupStudents.map(s => s.id)

        // Fetch attendance for all in this group
        const { data: attData } = await supabase
          .from('teacher_attendance')
          .select('student_id, status')
          .eq('group_id', groupId)

        // Fetch scores
        const { data: scoreData } = await supabase
          .from('teacher_exam_scores')
          .select('student_id, score, teacher_exams(max_score)')
          .in('student_id', studentIds)

        // Aggregate
        const compiled = groupStudents.map(s => {
          const sAtt = attData ? attData.filter(a => a.student_id === s.id) : []
          const totalAtt = sAtt.length
          const presentCount = sAtt.filter(a => a.status === 'present').length
          const absentCount = sAtt.filter(a => a.status === 'absent').length
          const rate = totalAtt > 0 ? Math.round((presentCount / totalAtt) * 100) : 100

          const sScores = scoreData ? scoreData.filter(sc => sc.student_id === s.id && sc.teacher_exams) : []
          let avgExam = 0
          if (sScores.length > 0) {
            const sumPct = sScores.reduce((acc, curr) => acc + ((Number(curr.score) / Number(curr.teacher_exams.max_score || 100)) * 100), 0)
            avgExam = Math.round(sumPct / sScores.length)
          }

          return {
            ...s,
            totalAtt,
            presentCount,
            absentCount,
            attendanceRate: rate,
            avgExam: sScores.length > 0 ? `${avgExam}%` : 'لا يوجد'
          }
        })

        setGroupReportData(compiled)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingGroupReport(false)
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

  const sendWhatsApp = () => {
    if (!reportData) return
    const { student, stats, payments, exams } = reportData
    
    let msg = `*تقرير أداء الطالب/ة: ${student.name}* 📊\n`
    if (student.grade) msg += `المرحلة: ${student.grade}\n`
    msg += `التاريخ: ${new Date().toLocaleDateString('ar-EG')}\n`
    msg += `-------------------------\n`

    msg += `\n*سجل الحضور والالتزام:* 📅\n`
    msg += `• إجمالي الحصص: ${stats.totalSessions}\n`
    msg += `• حضور: ${stats.present} حصة (${stats.attendanceRate}%) ✅\n`
    msg += `• غياب: ${stats.absent} حصة ❌\n`
    if (stats.late > 0) msg += `• تأخير: ${stats.late} حصة ⏰\n`

    if (exams && exams.length > 0) {
      msg += `\n*الامتحانات الأخيرة:* 📝\n`
      const recentExams = exams.slice(0, 4)
      recentExams.forEach(ex => {
        const exName = ex.teacher_exams?.exam_name || 'امتحان'
        const max = ex.teacher_exams?.max_score || 100
        msg += `• ${exName}: (${ex.score} / ${max})\n`
      })
      if (stats.avgScorePercent > 0) {
        msg += `• متوسط درجات الطالب: ${stats.avgScorePercent}%\n`
      }
    }

    if (payments && payments.length > 0) {
      msg += `\n*الموقف المالي:* 💰\n`
      const lastPay = payments[0]
      const statusText = lastPay.status === 'paid' ? 'تم السداد بالكامل ✅' : lastPay.status === 'partial' ? 'سداد جزئي ⚠️' : 'لم يسدد ❌'
      msg += `• ${lastPay.payment_reference}: ${statusText} (${lastPay.amount_paid} ج.م)\n`
    }

    msg += `\nمع خالص تمنياتنا بدوام التفوق والنجاح 🌟\nالأستاذ: ${teacherName} 👨‍🏫`
    
    const phone = formatEgyptPhone(student.parent_phone || student.phone)
    if (!phone) {
      alert('لا يوجد رقم هاتف مسجل للطالب أو لولي الأمر!')
      return
    }

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
    window.open(url, '_blank')
  }

  const handlePrint = () => {
    window.print()
  }

  const filteredStudents = students.filter(s => s.name.includes(search))

  return (
    <div>
      {/* ── Top Bar ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.4rem', fontWeight: 900 }}>
            التقارير وشهادات المتابعة 📑
          </h2>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
            توليد كشوفات درجات شاملة، تقارير الحضور والغياب، وإرسالها مباشرة لأولياء الأمور
          </p>
        </div>

        {/* Mode Switcher */}
        <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '12px', gap: '4px' }}>
          <button
            onClick={() => setViewMode('student')}
            style={{
              border: 'none',
              padding: '8px 16px',
              borderRadius: '10px',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer',
              background: viewMode === 'student' ? '#ffffff' : 'transparent',
              color: viewMode === 'student' ? '#0f172a' : '#64748b',
              boxShadow: viewMode === 'student' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            تقرير طالب فردي 👤
          </button>
          <button
            onClick={() => setViewMode('group')}
            style={{
              border: 'none',
              padding: '8px 16px',
              borderRadius: '10px',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer',
              background: viewMode === 'group' ? '#ffffff' : 'transparent',
              color: viewMode === 'group' ? '#0f172a' : '#64748b',
              boxShadow: viewMode === 'group' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            كشف المجموعة الشامل 👥
          </button>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════
          MODE 1: INDIVIDUAL STUDENT REPORT
          ═════════════════════════════════════════════════════════════════ */}
      {viewMode === 'student' && (
        <div style={{ display: 'flex', gap: '20px', flexDirection: 'row', flexWrap: 'wrap' }}>
          
          {/* Sidebar: Student Picker */}
          <div style={{ flex: '1 1 280px', background: '#f8fafc', padding: '20px', borderRadius: '18px', border: '1.5px solid #e2e8f0', minHeight: '400px' }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#1e293b', fontSize: '1rem' }}>اختر الطالب لعرض تقريره</h3>
            
            <div style={{ position: 'relative', marginBottom: '14px' }}>
              <input 
                type="text" 
                placeholder="بحث عن طالب بالاسم..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box', fontWeight: 600 }}
              />
              <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            </div>

            {loading ? (
              <p style={{ color: '#059669', fontWeight: 'bold' }}>جاري تحميل الطلاب...</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '450px', overflowY: 'auto' }}>
                {filteredStudents.map(student => (
                  <button
                    key={student.id}
                    onClick={() => setSelectedStudent(student)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: '1.5px solid',
                      cursor: 'pointer',
                      textAlign: 'right',
                      fontWeight: 800,
                      transition: 'all 0.15s ease',
                      background: selectedStudent?.id === student.id ? '#ecfdf5' : '#ffffff',
                      borderColor: selectedStudent?.id === student.id ? '#10b981' : '#e2e8f0',
                      color: selectedStudent?.id === student.id ? '#047857' : '#334155',
                      boxShadow: selectedStudent?.id === student.id ? '0 4px 10px rgba(16,185,129,0.15)' : 'none'
                    }}
                  >
                    <div>{student.name}</div>
                    {student.grade && <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px', fontWeight: 'normal' }}>{student.grade}</div>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Main Area: Student Report Details */}
          <div style={{ flex: '2 1 450px', background: 'white', padding: '24px', borderRadius: '20px', border: '1.5px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
            {!selectedStudent ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '380px', color: '#94a3b8' }}>
                <FileText size={56} opacity={0.3} style={{ marginBottom: '15px' }} />
                <h3 style={{ margin: '0 0 6px 0', color: '#475569' }}>لم يتم اختيار أي طالب</h3>
                <p style={{ margin: 0 }}>اختر طالباً من القائمة الجانبية لتوليد التقرير الأكاديمي والمالي الشامل.</p>
              </div>
            ) : loadingReport ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '380px' }}>
                <p style={{ color: '#059669', fontWeight: 'bold' }}>جاري إعداد تقرير الطالب الشامل...</p>
              </div>
            ) : reportData ? (
              <div>
                
                {/* Header Controls */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', borderBottom: '2px solid #f1f5f9', paddingBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <span style={{ background: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 800 }}>
                      بطاقة متابعة دورية
                    </span>
                    <h2 style={{ margin: '6px 0 4px 0', color: '#0f172a', fontSize: '1.4rem', fontWeight: 900 }}>
                      {reportData.student.name}
                    </h2>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.88rem' }}>
                      {reportData.student.grade || 'مرحلة غير محددة'} • هاتف ولي الأمر: {reportData.student.parent_phone || reportData.student.phone || 'غير مسجل'}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={handlePrint}
                      style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '10px 16px', borderRadius: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                    >
                      <Printer size={16} /> طباعة
                    </button>
                    <button 
                      onClick={sendWhatsApp}
                      style={{ background: '#25D366', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                    >
                      <MessageCircle size={16} /> إرسال لولي الأمر
                    </button>
                  </div>
                </div>

                {/* 4 Summary Stat Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', marginBottom: '24px' }}>
                  
                  <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '14px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                    <Calendar size={20} color="#3b82f6" style={{ marginBottom: '4px' }} />
                    <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>نسبة الحضور</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: reportData.stats.attendanceRate >= 80 ? '#059669' : '#dc2626' }}>
                      {reportData.stats.attendanceRate}%
                    </div>
                  </div>

                  <div style={{ background: '#ecfdf5', padding: '14px', borderRadius: '14px', textAlign: 'center', border: '1px solid #a7f3d0' }}>
                    <CheckCircle2 size={20} color="#10b981" style={{ marginBottom: '4px' }} />
                    <div style={{ fontSize: '0.8rem', color: '#047857', fontWeight: 700 }}>حصص الحضور</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#065f46' }}>
                      {reportData.stats.present} / {reportData.stats.totalSessions}
                    </div>
                  </div>

                  <div style={{ background: '#fef2f2', padding: '14px', borderRadius: '14px', textAlign: 'center', border: '1px solid #fecaca' }}>
                    <XCircle size={20} color="#ef4444" style={{ marginBottom: '4px' }} />
                    <div style={{ fontSize: '0.8rem', color: '#b91c1c', fontWeight: 700 }}>مرات الغياب</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#991b1b' }}>
                      {reportData.stats.absent}
                    </div>
                  </div>

                  <div style={{ background: '#f5f3ff', padding: '14px', borderRadius: '14px', textAlign: 'center', border: '1px solid #ddd6fe' }}>
                    <Award size={20} color="#7c3aed" style={{ marginBottom: '4px' }} />
                    <div style={{ fontSize: '0.8rem', color: '#6d28d9', fontWeight: 700 }}>متوسط الامتحانات</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#5b21b6' }}>
                      {reportData.stats.examCount > 0 ? `${reportData.stats.avgScorePercent}%` : 'لا يوجد'}
                    </div>
                  </div>

                </div>

                {/* 3 Detail Tables */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                  
                  {/* Attendance Details */}
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '14px', padding: '14px' }}>
                    <h3 style={{ margin: '0 0 10px 0', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px', color: '#1e293b' }}>
                      <Calendar size={16} color="#3b82f6" /> آخر سجلات الحضور
                    </h3>
                    <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                      {reportData.attendance.length === 0 ? (
                        <p style={{ padding: '10px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>لا توجد سجلات</p>
                      ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '0.85rem' }}>
                          <tbody>
                            {reportData.attendance.slice(0, 10).map((att, i) => (
                              <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '8px 4px' }}>{att.session_date}</td>
                                <td style={{ padding: '8px 4px', fontWeight: 'bold', color: att.status === 'present' ? '#059669' : att.status === 'absent' ? '#dc2626' : '#d97706' }}>
                                  {att.status === 'present' ? 'حاضر ✅' : att.status === 'absent' ? 'غائب ❌' : 'متأخر ⏰'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>

                  {/* Exams Details */}
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '14px', padding: '14px' }}>
                    <h3 style={{ margin: '0 0 10px 0', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px', color: '#1e293b' }}>
                      <Award size={16} color="#7c3aed" /> سجل درجات الاختبارات
                    </h3>
                    <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                      {reportData.exams.length === 0 ? (
                        <p style={{ padding: '10px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>لا توجد درجات مرصودة</p>
                      ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '0.85rem' }}>
                          <tbody>
                            {reportData.exams.map((ex, i) => (
                              <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '8px 4px', fontWeight: 600 }}>{ex.teacher_exams?.exam_name || 'امتحان'}</td>
                                <td style={{ padding: '8px 4px', fontWeight: 'bold', color: '#2563eb', direction: 'ltr', textAlign: 'left' }}>
                                  {ex.score} / {ex.teacher_exams?.max_score || 100}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>

                  {/* Payments Details */}
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '14px', padding: '14px' }}>
                    <h3 style={{ margin: '0 0 10px 0', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px', color: '#1e293b' }}>
                      <DollarSign size={16} color="#059669" /> السجل المالي
                    </h3>
                    <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                      {reportData.payments.length === 0 ? (
                        <p style={{ padding: '10px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>لا توجد مدفوعات مسجلة</p>
                      ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '0.85rem' }}>
                          <tbody>
                            {reportData.payments.map((pay, i) => (
                              <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '8px 4px' }}>{pay.payment_reference}</td>
                                <td style={{ padding: '8px 4px', fontWeight: 'bold', color: pay.status === 'paid' ? '#059669' : pay.status === 'partial' ? '#d97706' : '#dc2626' }}>
                                  {pay.status === 'paid' ? `خالص (${pay.amount_paid} ج)` : pay.status === 'partial' ? `جزء (${pay.amount_paid} ج)` : 'لم يسدد'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>

                </div>

                {/* Printable Footer Stamp */}
                <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px dashed #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                  <span>منصة الأستاذ: <strong>{teacherName}</strong></span>
                  <span>توقيع المعلم: ....................</span>
                </div>

              </div>
            ) : null}
          </div>

        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════
          MODE 2: GROUP OVERALL REPORT
          ═════════════════════════════════════════════════════════════════ */}
      {viewMode === 'group' && (
        <div>
          {/* Controls */}
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1.5px solid #e2e8f0', marginBottom: '20px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 240px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', fontSize: '0.9rem', color: '#334155' }}>اختر المجموعة لعرض كشفها الشامل:</label>
              <select
                value={selectedGroup}
                onChange={e => setSelectedGroup(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', background: 'white', fontWeight: 600 }}
              >
                {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>

            <button
              onClick={handlePrint}
              style={{
                background: '#059669',
                color: 'white',
                border: 'none',
                padding: '11px 20px',
                borderRadius: '12px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '22px'
              }}
            >
              <Printer size={18} /> طباعة كشف المجموعة بالكامل
            </button>
          </div>

          {loadingGroupReport ? (
            <p style={{ textAlign: 'center', padding: '40px 0', color: '#059669', fontWeight: 'bold' }}>جاري تجميع كشف المجموعة...</p>
          ) : groupReportData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
              <Users size={48} opacity={0.3} style={{ marginBottom: '10px' }} />
              <h3>لا يوجد طلاب في هذه المجموعة</h3>
            </div>
          ) : (
            <div style={{ overflowX: 'auto', background: 'white', borderRadius: '18px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', color: '#475569', borderBottom: '1.5px solid #e2e8f0' }}>
                    <th style={{ padding: '14px 16px', width: '50px' }}>#</th>
                    <th style={{ padding: '14px 16px' }}>اسم الطالب</th>
                    <th style={{ padding: '14px 16px' }}>المرحلة</th>
                    <th style={{ padding: '14px 16px' }}>رقم الهاتف</th>
                    <th style={{ padding: '14px 16px' }}>نسبة الحضور</th>
                    <th style={{ padding: '14px 16px' }}>عدد الغياب</th>
                    <th style={{ padding: '14px 16px' }}>متوسط الاختبارات</th>
                  </tr>
                </thead>
                <tbody>
                  {groupReportData.map((st, i) => (
                    <tr key={st.id} style={{ borderBottom: i === groupReportData.length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 16px', color: '#94a3b8' }}>{i + 1}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 800, color: '#0f172a' }}>{st.name}</td>
                      <td style={{ padding: '14px 16px', color: '#64748b' }}>{st.grade || '-'}</td>
                      <td style={{ padding: '14px 16px', color: '#334155' }}>{st.parent_phone || st.phone || '-'}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ 
                          padding: '4px 10px', 
                          borderRadius: '8px', 
                          fontWeight: 800, 
                          fontSize: '0.85rem',
                          background: st.attendanceRate >= 80 ? '#ecfdf5' : '#fef2f2',
                          color: st.attendanceRate >= 80 ? '#047857' : '#b91c1c'
                        }}>
                          {st.attendanceRate}% ({st.presentCount}/{st.totalAtt})
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: st.absentCount > 1 ? '#dc2626' : '#64748b' }}>
                        {st.absentCount}
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 800, color: '#2563eb' }}>
                        {st.avgExam}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  )
}
