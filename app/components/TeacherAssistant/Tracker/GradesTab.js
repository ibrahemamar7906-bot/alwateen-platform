'use client'

import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../../../../utils/supabase'
import { 
  FileEdit, Save, Plus, Trash2, Maximize2, X, 
  MessageCircle, Award, Printer, TrendingUp, CheckCircle, AlertTriangle 
} from 'lucide-react'

export default function GradesTab({ teacherId, teacherName = 'المستر إبراهيم عمار الجندي' }) {
  const [groups, setGroups] = useState([])
  const [selectedGroup, setSelectedGroup] = useState('')
  
  const [exams, setExams] = useState([])
  const [selectedExam, setSelectedExam] = useState('')
  
  const [students, setStudents] = useState([])
  const [scoresData, setScoresData] = useState({}) // student_id -> { score, notes }
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  
  // Note Modal States
  const [noteModalOpen, setNoteModalOpen] = useState(false)
  const [activeNoteStudent, setActiveNoteStudent] = useState(null)
  
  // Exam Modal
  const [showExamModal, setShowExamModal] = useState(false)
  const [newExam, setNewExam] = useState({ name: '', max_score: '20', exam_date: new Date().toISOString().split('T')[0] })

  // Leaderboard Modal
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false)

  useEffect(() => {
    fetchGroups()
  }, [])

  useEffect(() => {
    if (selectedGroup) {
      fetchExamsForGroup()
    } else {
      setExams([])
      setSelectedExam('')
      setStudents([])
    }
  }, [selectedGroup])

  useEffect(() => {
    if (selectedGroup && selectedExam) {
      fetchScores()
    } else {
      setStudents([])
    }
  }, [selectedExam, selectedGroup])

  const fetchGroups = async () => {
    const { data } = await supabase.from('teacher_groups').select('*').eq('teacher_id', teacherId).order('name')
    if (data) setGroups(data)
    setLoading(false)
  }

  const fetchExamsForGroup = async () => {
    const { data } = await supabase.from('teacher_exams').select('*').eq('group_id', selectedGroup).order('exam_date', { ascending: false })
    if (data) {
      setExams(data)
      if (data.length > 0 && !selectedExam) {
        setSelectedExam(data[0].id)
      }
    }
  }

  const fetchScores = async () => {
    setLoading(true)
    
    // Fetch students with safety filter
    const { data: links } = await supabase
      .from('teacher_group_students')
      .select('student_id, teacher_students(id, name, phone, parent_phone, grade)')
      .eq('group_id', selectedGroup)

    if (links) {
      const mappedStudents = links
        .map(l => l.teacher_students)
        .filter(Boolean)
        .sort((a, b) => (a.name || '').localeCompare(b.name || '', 'ar'))
      
      setStudents(mappedStudents)

      // Fetch scores
      const { data: scores } = await supabase
        .from('teacher_exam_scores')
        .select('student_id, score, notes')
        .eq('exam_id', selectedExam)

      const sMap = {}
      mappedStudents.forEach(s => sMap[s.id] = { score: '', notes: '' })
      if (scores) {
        scores.forEach(sc => {
          if (sc.student_id) {
            sMap[sc.student_id] = { score: sc.score !== null ? sc.score : '', notes: sc.notes || '' }
          }
        })
      }
      setScoresData(sMap)
    }
    setLoading(false)
  }

  const handleCreateExam = async (e) => {
    e.preventDefault()
    if (!selectedGroup || !newExam.name) return
    
    try {
      const { data, error } = await supabase.from('teacher_exams').insert([{
        group_id: selectedGroup,
        exam_name: newExam.name,
        max_score: Number(newExam.max_score),
        exam_date: newExam.exam_date
      }]).select().single()
      
      if (error) throw error
      
      setShowExamModal(false)
      setNewExam({ name: '', max_score: '20', exam_date: new Date().toISOString().split('T')[0] })
      
      const { data: updatedExams } = await supabase.from('teacher_exams').select('*').eq('group_id', selectedGroup).order('exam_date', { ascending: false })
      if (updatedExams) {
        setExams(updatedExams)
        setSelectedExam(data.id)
      }
    } catch (e) {
      alert('❌ خطأ في إنشاء الامتحان')
    }
  }

  const handleDeleteExam = async () => {
    if (!selectedExam) return
    if (!confirm('هل أنت متأكد من حذف هذا الامتحان وكل درجاته؟')) return
    
    try {
      await supabase.from('teacher_exams').delete().eq('id', selectedExam)
      setSelectedExam('')
      fetchExamsForGroup()
    } catch (e) {
      alert('❌ خطأ في الحذف')
    }
  }

  const handleScoreChange = (studentId, field, value) => {
    setScoresData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }))
    setSaveSuccess(false)
  }

  const handleSaveScores = async () => {
    if (!selectedExam || students.length === 0) return
    setSaving(true)
    setSaveSuccess(false)
    try {
      // Delete old scores
      await supabase.from('teacher_exam_scores').delete().eq('exam_id', selectedExam)
      
      // Insert new
      const payload = students.map(s => ({
        exam_id: selectedExam,
        student_id: s.id,
        score: scoresData[s.id]?.score === '' ? null : Number(scoresData[s.id]?.score),
        notes: scoresData[s.id]?.notes || ''
      }))

      const { error } = await supabase.from('teacher_exam_scores').insert(payload)
      if (error) throw error

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 4000)
    } catch (e) {
      alert('❌ حدث خطأ أثناء حفظ الدرجات')
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const activeExamObj = exams.find(e => e.id === selectedExam)
  const maxScore = Number(activeExamObj?.max_score) || 20
  const selectedGroupObj = groups.find(g => g.id === selectedGroup)

  // Calculate Rating Badge helper
  const getRating = (score) => {
    if (score === '' || score === null || score === undefined) return null
    const val = Number(score)
    const ratio = val / maxScore
    if (ratio >= 0.85) return { label: 'ممتاز ⭐', color: '#15803d', bg: '#dcfce7', border: '#86efac' }
    if (ratio >= 0.75) return { label: 'جيد جداً 🟢', color: '#0369a1', bg: '#e0f2fe', border: '#7dd3fc' }
    if (ratio >= 0.60) return { label: 'جيد 🟡', color: '#b45309', bg: '#fef3c7', border: '#fcd34d' }
    return { label: 'يحتاج متابعة 🔴', color: '#b91c1c', bg: '#fee2e2', border: '#fca5a5' }
  }

  // Live Exam Statistics
  const examStats = useMemo(() => {
    const scoredList = []
    students.forEach(s => {
      const raw = scoresData[s.id]?.score
      if (raw !== '' && raw !== null && raw !== undefined) {
        scoredList.push(Number(raw))
      }
    })

    if (scoredList.length === 0) {
      return { totalStudents: students.length, gradedCount: 0, highest: 0, lowest: 0, average: 0, passRate: 0 }
    }

    const highest = Math.max(...scoredList)
    const lowest = Math.min(...scoredList)
    const sum = scoredList.reduce((acc, curr) => acc + curr, 0)
    const average = (sum / scoredList.length).toFixed(1)
    const passCount = scoredList.filter(sc => (sc / maxScore) >= 0.5).length
    const passRate = Math.round((passCount / scoredList.length) * 100)

    return {
      totalStudents: students.length,
      gradedCount: scoredList.length,
      highest,
      lowest,
      average,
      passRate
    }
  }, [students, scoresData, maxScore])

  // Ranked students for Leaderboard
  const rankedStudents = useMemo(() => {
    const list = []
    students.forEach(s => {
      const raw = scoresData[s.id]?.score
      if (raw !== '' && raw !== null && raw !== undefined) {
        list.push({
          ...s,
          numericScore: Number(raw),
          notes: scoresData[s.id]?.notes || '',
          rating: getRating(raw)
        })
      }
    })
    return list.sort((a, b) => b.numericScore - a.numericScore)
  }, [students, scoresData, maxScore])

  // WhatsApp Single Result Sender
  const handleSendResultWhatsApp = (student) => {
    const phone = student.parent_phone || student.phone
    if (!phone) {
      alert(`لا يوجد رقم مسجل لولي أمر الطالب: ${student.name}`)
      return
    }

    const studentScore = scoresData[student.id]?.score
    if (studentScore === '' || studentScore === null || studentScore === undefined) {
      alert('يرجى رصد درجة الطالب أولاً قبل إرسال الرسالة!')
      return
    }

    const ratingObj = getRating(studentScore)
    const percent = Math.round((Number(studentScore) / maxScore) * 100)
    const notes = scoresData[student.id]?.notes

    let msg = `السلام عليكم ورحمة الله وبركاته،\nولي أمر الطالب/ة: *${student.name}* 🌸\n`
    msg += `نحيطكم علماً بنتيجة اختبار: *${activeExamObj?.exam_name || 'الاختبار'}*\n`
    msg += `📌 الدرجة: *${studentScore}* من *${maxScore}* (النسبة: ${percent}%)\n`
    msg += `⭐ التقدير: *${ratingObj?.label || 'ناجح'}*\n`
    if (notes) {
      msg += `💡 ملاحظات المعلم: ${notes}\n`
    }
    msg += `\nمع تحيات: *${teacherName}* 👨‍🏫`

    const cleanPhone = phone.replace(/\D/g, '')
    const finalPhone = cleanPhone.startsWith('0') ? '2' + cleanPhone : cleanPhone
    window.open(`https://wa.me/${finalPhone}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  // Print Sheet
  const handlePrint = () => {
    window.print()
  }

  return (
    <div>
      {/* Printable Header */}
      <div className="print-only" style={{ display: 'none', textAlign: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>كشف رصد درجات الامتحان - {teacherName}</h2>
        <p style={{ margin: '5px 0' }}>المجموعة: {selectedGroupObj?.name || ''} | الامتحان: {activeExamObj?.exam_name} ({maxScore} درجة) | التاريخ: {activeExamObj?.exam_date}</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#1e293b', fontSize: '1.4rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📝</span> سجل درجات الامتحانات والتقييمات
          </h2>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.88rem' }}>
            رصد فوري للدرجات، إحصائيات ونسب النجاح، وإرسال النتيجة لواتساب ولي الأمر بنقرة واحدة
          </p>
        </div>

        {students.length > 0 && activeExamObj && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowLeaderboardModal(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: 'white',
                border: 'none',
                padding: '9px 16px',
                borderRadius: '12px',
                fontWeight: 'bold',
                fontSize: '0.88rem',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(245,158,11,0.25)'
              }}
            >
              <Award size={16} /> لوحة شرف الأوائل 🏆
            </button>

            <button
              onClick={handlePrint}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#f1f5f9',
                color: '#475569',
                border: '1px solid #cbd5e1',
                padding: '9px 16px',
                borderRadius: '12px',
                fontWeight: 'bold',
                fontSize: '0.88rem',
                cursor: 'pointer'
              }}
            >
              <Printer size={16} /> طباعة الكشف
            </button>
          </div>
        )}
      </div>

      {/* Selectors Bar */}
      <div style={{ background: '#f8fafc', padding: '16px 20px', borderRadius: '18px', border: '1.5px solid #e2e8f0', marginBottom: '20px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: '1 1 220px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', color: '#334155', fontSize: '0.9rem' }}>
            اختر المجموعة الدراسية
          </label>
          <select 
            value={selectedGroup} 
            onChange={e => setSelectedGroup(e.target.value)}
            style={{ width: '100%', padding: '11px 14px', borderRadius: '12px', border: '1.5px solid #cbd5e1', outline: 'none', background: 'white', fontWeight: '600', fontSize: '0.95rem', color: '#1e293b' }}
          >
            <option value="">-- اختر مجموعة --</option>
            {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </div>

        {selectedGroup && (
          <div style={{ flex: '1 1 240px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', color: '#334155', fontSize: '0.9rem' }}>
              اختر الامتحان أو الاختبار
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <select 
                value={selectedExam} 
                onChange={e => setSelectedExam(e.target.value)}
                style={{ flex: 1, padding: '11px 14px', borderRadius: '12px', border: '1.5px solid #cbd5e1', outline: 'none', background: 'white', fontWeight: '600', fontSize: '0.95rem', color: '#1e293b' }}
              >
                <option value="">-- اختر امتحان --</option>
                {exams.map(ex => <option key={ex.id} value={ex.id}>{ex.exam_name} ({ex.max_score} درجة - {ex.exam_date})</option>)}
              </select>
              <button 
                onClick={() => setShowExamModal(true)}
                style={{
                  background: 'linear-gradient(135deg, #059669, #10b981)',
                  color: 'white',
                  border: 'none',
                  padding: '0 16px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  boxShadow: '0 2px 8px rgba(5,150,105,0.25)'
                }}
                title="إنشاء امتحان جديد"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      {!selectedGroup ? (
        <div style={{ textAlign: 'center', padding: '50px 20px', color: '#64748b', background: '#f8fafc', borderRadius: '20px', border: '1px dashed #cbd5e1' }}>
          <FileEdit size={48} opacity={0.3} style={{ marginBottom: '12px' }} />
          <h3 style={{ margin: '0 0 6px 0', color: '#1e293b' }}>اختر المجموعة لعرض وإدارة الامتحانات</h3>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>حدد المجموعة من القائمة بالأعلى للبدء في رصد درجات الطلاب.</p>
        </div>
      ) : selectedGroup && !selectedExam ? (
        <div style={{ textAlign: 'center', padding: '50px 20px', color: '#64748b', background: '#f8fafc', borderRadius: '20px', border: '1px dashed #cbd5e1' }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#1e293b' }}>لا يوجد امتحانات مضافة لهذه المجموعة</h3>
          <p style={{ margin: '0 0 16px 0', fontSize: '0.9rem' }}>اضغط على زر (+) الأخضر بالأعلى لإنشاء امتحان جديد لهذه المجموعة.</p>
          <button
            onClick={() => setShowExamModal(true)}
            style={{
              background: 'linear-gradient(135deg, #059669, #10b981)',
              color: 'white',
              border: 'none',
              padding: '10px 24px',
              borderRadius: '12px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            + إضافة أول امتحان الآن
          </button>
        </div>
      ) : loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#2563eb', fontWeight: 'bold' }}>
          جاري تحميل الطلاب والدرجات...
        </div>
      ) : (
        <>
          {/* Live Exam Statistics Bar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '12px',
            marginBottom: '18px'
          }}>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px', borderRadius: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 'bold' }}>المصحح / الإجمالي</div>
              <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#0f172a' }}>{examStats.gradedCount} / {examStats.totalStudents}</div>
            </div>

            <div style={{ background: '#fef3c7', border: '1px solid #fde68a', padding: '12px', borderRadius: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.78rem', color: '#92400e', fontWeight: 'bold' }}>أعلى درجة 🏆</div>
              <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#b45309' }}>{examStats.highest} <span style={{ fontSize: '0.8rem' }}>/ {maxScore}</span></div>
            </div>

            <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '12px', borderRadius: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.78rem', color: '#047857', fontWeight: 'bold' }}>متوسط الدرجات</div>
              <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#059669' }}>{examStats.average}</div>
            </div>

            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '12px', borderRadius: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.78rem', color: '#1d4ed8', fontWeight: 'bold' }}>نسبة النجاح</div>
              <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#2563eb' }}>{examStats.passRate}%</div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
            <span style={{ fontWeight: '800', color: '#0f172a', fontSize: '0.95rem' }}>
              الدرجة النهائية للامتحان: <span style={{ color: '#059669', fontSize: '1.1rem' }}>{maxScore}</span> درجة
            </span>

            <button 
              onClick={handleDeleteExam} 
              style={{ color: '#ef4444', background: '#fef2f2', border: '1px solid #fecaca', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', fontWeight: 'bold' }}
            >
              <Trash2 size={14} /> حذف الامتحان
            </button>
          </div>

          {/* Grades Table */}
          <div style={{ overflowX: 'auto', marginBottom: '20px', background: 'white', borderRadius: '18px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', minWidth: '550px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', color: '#475569', borderBottom: '1.5px solid #e2e8f0' }}>
                  <th style={{ padding: '14px 16px', fontWeight: '800' }}>اسم الطالب</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center', width: '110px' }}>الدرجة</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center', width: '140px' }}>التقدير ⭐</th>
                  <th style={{ padding: '14px 16px' }}>ملاحظات المعلم</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center', width: '130px' }}>واتساب 📲</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, index) => {
                  const data = scoresData[student.id] || { score: '', notes: '' }
                  const ratingObj = getRating(data.score)

                  return (
                    <tr 
                      key={student.id} 
                      style={{ 
                        borderBottom: index === students.length - 1 ? 'none' : '1px solid #f1f5f9',
                        transition: 'background 0.2s'
                      }}
                    >
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: '800', color: '#0f172a' }}>{student.name}</div>
                        {student.phone && (
                          <div style={{ fontSize: '0.78rem', color: '#64748b', direction: 'ltr', textAlign: 'right' }}>
                            {student.phone}
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        <input 
                          type="number" 
                          min="0"
                          max={maxScore}
                          placeholder={`/${maxScore}`}
                          value={data.score}
                          onChange={e => handleScoreChange(student.id, 'score', e.target.value)}
                          style={{
                            width: '80px',
                            padding: '9px 6px',
                            borderRadius: '10px',
                            border: '1.5px solid #cbd5e1',
                            outline: 'none',
                            textAlign: 'center',
                            fontWeight: '800',
                            fontSize: '1rem',
                            color: '#0f172a',
                            background: data.score !== '' ? '#f0fdf4' : 'white'
                          }}
                        />
                      </td>

                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        {ratingObj ? (
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '0.8rem',
                            fontWeight: '800',
                            color: ratingObj.color,
                            background: ratingObj.bg,
                            border: `1px solid ${ratingObj.border}`
                          }}>
                            {ratingObj.label}
                          </span>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>--</span>
                        )}
                      </td>

                      <td style={{ padding: '10px' }}>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <input 
                            type="text" 
                            placeholder="ملاحظة للطالب (اختياري)..."
                            value={data.notes}
                            onChange={e => handleScoreChange(student.id, 'notes', e.target.value)}
                            style={{
                              flex: 1,
                              padding: '8px 12px',
                              borderRadius: '10px',
                              border: '1px solid #cbd5e1',
                              outline: 'none',
                              fontSize: '0.85rem'
                            }}
                          />
                          <button 
                            type="button"
                            onClick={() => { setActiveNoteStudent(student); setNoteModalOpen(true); }}
                            style={{
                              background: '#f1f5f9',
                              border: '1px solid #cbd5e1',
                              borderRadius: '8px',
                              padding: '8px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              color: '#64748b'
                            }}
                            title="توسيع الملاحظة"
                          >
                            <Maximize2 size={15} />
                          </button>
                        </div>
                      </td>

                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleSendResultWhatsApp(student)}
                          style={{
                            background: '#25D366',
                            color: 'white',
                            border: 'none',
                            padding: '7px 12px',
                            borderRadius: '10px',
                            fontWeight: 'bold',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            boxShadow: '0 2px 6px rgba(37,211,102,0.3)'
                          }}
                          title="إرسال النتيجة لواتساب ولي الأمر"
                        >
                          <MessageCircle size={14} /> إرسال
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Save Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              {saveSuccess && (
                <span style={{ color: '#059669', fontWeight: 'bold', background: '#ecfdf5', padding: '8px 14px', borderRadius: '12px', border: '1px solid #a7f3d0' }}>
                  ✅ تم حفظ درجات الامتحان بنجاح!
                </span>
              )}
            </div>

            <button 
              onClick={handleSaveScores} 
              disabled={saving}
              style={{
                background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                color: 'white',
                border: 'none',
                padding: '14px 32px',
                borderRadius: '14px',
                fontWeight: '800',
                fontSize: '1.05rem',
                cursor: saving ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 15px rgba(37,99,235,0.3)'
              }}
            >
              <Save size={20} />
              <span>{saving ? 'جاري الحفظ...' : 'حفظ درجات الامتحان'}</span>
            </button>
          </div>
        </>
      )}

      {/* Leaderboard Modal */}
      {showLeaderboardModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15,23,42,0.65)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '16px'
        }}>
          <div style={{
            background: 'white',
            width: '100%',
            maxWidth: '550px',
            maxHeight: '90vh',
            borderRadius: '24px',
            padding: '26px',
            position: 'relative',
            overflowY: 'auto',
            direction: 'rtl',
            boxShadow: '0 25px 60px rgba(0,0,0,0.3)'
          }}>
            <button
              onClick={() => setShowLeaderboardModal(false)}
              style={{
                position: 'absolute',
                top: '18px',
                left: '18px',
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={18} />
            </button>

            <h3 style={{ margin: '0 0 6px 0', fontSize: '1.35rem', fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={24} color="#f59e0b" /> لوحة شرف أوائل الامتحان 🏆
            </h3>
            <p style={{ margin: '0 0 18px 0', color: '#64748b', fontSize: '0.88rem' }}>
              امتحان: {activeExamObj?.exam_name} ({maxScore} درجة) - مجموعة {selectedGroupObj?.name}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '400px', overflowY: 'auto', marginBottom: '20px' }}>
              {rankedStudents.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>لم يتم رصد درجات بعد لعرض لوحة الشرف.</p>
              ) : (
                rankedStudents.map((st, idx) => {
                  const isGold = idx === 0
                  const isSilver = idx === 1
                  const isBronze = idx === 2

                  return (
                    <div
                      key={st.id}
                      style={{
                        padding: '12px 16px',
                        borderRadius: '16px',
                        border: isGold ? '2px solid #fcd34d' : isSilver ? '2px solid #cbd5e1' : isBronze ? '2px solid #fdba74' : '1px solid #e2e8f0',
                        background: isGold ? 'linear-gradient(135deg, #fffbeb, #fef3c7)' : isSilver ? '#f8fafc' : isBronze ? '#fff7ed' : '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: isGold ? '#f59e0b' : isSilver ? '#64748b' : isBronze ? '#ea580c' : '#f1f5f9',
                          color: (isGold || isSilver || isBronze) ? 'white' : '#475569',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '900',
                          fontSize: '0.9rem'
                        }}>
                          {idx + 1}
                        </span>
                        <div>
                          <div style={{ fontWeight: '800', color: '#0f172a' }}>{st.name}</div>
                          {st.notes && <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{st.notes}</div>}
                        </div>
                      </div>

                      <div style={{ textAlign: 'left' }}>
                        <span style={{ fontSize: '1.25rem', fontWeight: '900', color: '#059669' }}>
                          {st.numericScore}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}> / {maxScore}</span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
              <button
                onClick={() => {
                  let text = `🏆 *لوحة شرف أوائل اختبار (${activeExamObj?.exam_name})* 🏆\n`
                  text += `المجموعة: ${selectedGroupObj?.name}\n\n`
                  rankedStudents.slice(0, 10).forEach((st, i) => {
                    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '⭐'
                    text += `${medal} المركز ${i + 1}: ${st.name} (${st.numericScore} / ${maxScore})\n`
                  })
                  text += `\nألف مبروك لجميع المتميزين! 👏\nمع تحيات: ${teacherName} 👨‍🏫`
                  navigator.clipboard.writeText(text)
                  alert('✅ تم نسخ لوحة الشرف للمشاركة على واتساب!')
                }}
                style={{
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: 'white',
                  border: 'none',
                  padding: '10px 18px',
                  borderRadius: '12px',
                  fontWeight: 'bold',
                  fontSize: '0.88rem',
                  cursor: 'pointer'
                }}
              >
                📋 نسخ لوحة الشرف لواتساب
              </button>

              <button
                onClick={() => setShowLeaderboardModal(false)}
                style={{
                  background: '#1e293b',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '12px',
                  fontWeight: 'bold',
                  fontSize: '0.88rem',
                  cursor: 'pointer'
                }}
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Exam Modal */}
      {showExamModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '16px' }}>
          <div style={{ background: 'white', width: '100%', maxWidth: '440px', borderRadius: '24px', padding: '26px', position: 'relative', direction: 'rtl' }}>
            <button onClick={() => setShowExamModal(false)} style={{ position: 'absolute', top: '18px', left: '18px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '1.2rem' }}>✕</button>
            <h3 style={{ margin: '0 0 18px 0', fontSize: '1.3rem', fontWeight: 900, color: '#0f172a' }}>إضافة امتحان جديد</h3>
            
            <form onSubmit={handleCreateExam} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', fontSize: '0.88rem' }}>اسم الامتحان</label>
                <input required type="text" value={newExam.name} onChange={e => setNewExam({...newExam, name: e.target.value})} style={{ width: '100%', padding: '11px', borderRadius: '12px', border: '1.5px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }} placeholder="مثال: اختبار شهر أكتوبر (نحو ونصوص)" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', fontSize: '0.88rem' }}>الدرجة النهائية</label>
                <input required type="number" min="1" value={newExam.max_score} onChange={e => setNewExam({...newExam, max_score: e.target.value})} style={{ width: '100%', padding: '11px', borderRadius: '12px', border: '1.5px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', fontSize: '0.88rem' }}>تاريخ الامتحان</label>
                <input required type="date" value={newExam.exam_date} onChange={e => setNewExam({...newExam, exam_date: e.target.value})} style={{ width: '100%', padding: '11px', borderRadius: '12px', border: '1.5px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <button type="submit" style={{ background: 'linear-gradient(135deg, #059669, #10b981)', color: 'white', border: 'none', padding: '13px', borderRadius: '12px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', marginTop: '10px' }}>
                إنشاء الامتحان
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Note Expansion Modal */}
      {noteModalOpen && activeNoteStudent && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '16px' }}>
          <div style={{ background: 'white', width: '100%', maxWidth: '500px', borderRadius: '24px', padding: '26px', position: 'relative', direction: 'rtl' }}>
            <button onClick={() => setNoteModalOpen(false)} style={{ position: 'absolute', top: '18px', left: '18px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={20} /></button>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>ملاحظات: {activeNoteStudent.name}</h3>
            <textarea 
              rows="6"
              placeholder="اكتب ملاحظات تفصيلية عن أداء الطالب ونقاط القوة والضعف..."
              value={scoresData[activeNoteStudent.id]?.notes || ''}
              onChange={e => handleScoreChange(activeNoteStudent.id, 'notes', e.target.value)}
              style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1.5px solid #cbd5e1', outline: 'none', resize: 'vertical', fontSize: '0.95rem', fontFamily: 'inherit', boxSizing: 'border-box' }}
            />
            <button 
              onClick={() => setNoteModalOpen(false)} 
              style={{ width: '100%', background: 'linear-gradient(135deg, #059669, #10b981)', color: 'white', border: 'none', padding: '13px', borderRadius: '12px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', marginTop: '15px' }}
            >
              تم الحفظ في الجدول
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
