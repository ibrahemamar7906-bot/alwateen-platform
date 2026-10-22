import { useState, useEffect } from 'react'
import { supabase } from '../../../utils/supabase'
import { Users, Save, Trash2, Download, X } from 'lucide-react'

export default function RosterManager({ teacherId, currentList, onImport, onClose }) {
  const [rosters, setRosters] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newRosterName, setNewRosterName] = useState('')

  useEffect(() => {
    if (teacherId) {
      fetchRosters()
    }
  }, [teacherId])

  const fetchRosters = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('teacher_rosters')
        .select('*')
        .eq('teacher_id', teacherId)
        .order('updated_at', { ascending: false })
      
      if (!error && data) {
        setRosters(data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveCurrent = async () => {
    if (!newRosterName.trim()) {
      alert('الرجاء إدخال اسم للقائمة!')
      return
    }
    if (!currentList || !currentList.trim()) {
      alert('لا توجد أسماء لحفظها!')
      return
    }

    setSaving(true)
    try {
      const payload = {
        teacher_id: teacherId,
        roster_name: newRosterName.trim(),
        students_list: currentList,
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('teacher_rosters')
        .insert([payload])
        .select()
        .single()
        
      if (error) throw error
      
      alert('✅ تم حفظ القائمة بنجاح!')
      setNewRosterName('')
      await fetchRosters()
    } catch (e) {
      console.error(e)
      alert('❌ حدث خطأ أثناء الحفظ')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذه القائمة نهائياً؟')) return
    
    try {
      const { error } = await supabase
        .from('teacher_rosters')
        .delete()
        .eq('id', id)
        
      if (error) throw error
      setRosters(prev => prev.filter(r => r.id !== id))
    } catch (e) {
      alert('❌ خطأ في الحذف')
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: 'white', borderRadius: '24px', width: '100%', maxWidth: '500px', padding: '30px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', position: 'relative' }}>
        
        <button onClick={onClose} style={{ position: 'absolute', top: '20px', left: '20px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
          <X size={24} />
        </button>

        <h3 style={{ margin: '0 0 20px 0', fontSize: '1.3rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={24} color="#059669" /> إدارة قوائم الطلاب
        </h3>

        {/* Save Current List Form */}
        <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: '#334155', marginBottom: '8px' }}>
            حفظ الأسماء الحالية كقائمة جديدة:
          </label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              placeholder="مثال: مجموعة السبت 4 عصراً" 
              value={newRosterName}
              onChange={e => setNewRosterName(e.target.value)}
              style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
            />
            <button 
              onClick={handleSaveCurrent}
              disabled={saving}
              style={{ background: '#059669', color: 'white', border: 'none', padding: '0 15px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Save size={16} /> {saving ? '...' : 'حفظ'}
            </button>
          </div>
        </div>

        {/* Saved Lists */}
        <div>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '1rem', color: '#334155' }}>القوائم المحفوظة في حقيبتك ({rosters.length})</h4>
          
          {loading ? (
            <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>جاري التحميل...</p>
          ) : rosters.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem', padding: '20px 0' }}>لم تحفظ أي قوائم بعد.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '250px', overflowY: 'auto', paddingRight: '5px' }}>
              {rosters.map(r => (
                <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '12px' }}>
                  <div>
                    <strong style={{ color: '#0f172a', display: 'block', marginBottom: '4px', fontSize: '1rem' }}>{r.roster_name}</strong>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      آخر تعديل: {new Date(r.updated_at).toLocaleDateString('ar-EG')}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => {
                        onImport(r.students_list)
                        onClose()
                      }}
                      style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Download size={14} /> استيراد
                    </button>
                    <button 
                      onClick={() => handleDelete(r.id)}
                      style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fca5a5', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer' }}
                      title="حذف"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
