import { useState, useEffect } from 'react'
import { supabase } from '../../../utils/supabase'
import { Bot, Trash2, CheckCircle, XCircle, RefreshCw, Copy, Check, Sparkles, Coins, X } from 'lucide-react'

export default function AssistantsTab({ teacherId }) {
  const [loading, setLoading] = useState(true)
  const [code, setCode] = useState('')
  const [codeLoading, setCodeLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  
  const [pendingLinks, setPendingLinks] = useState([])
  const [approvedLinks, setApprovedLinks] = useState([])
  
  const [rechargeAssistant, setRechargeAssistant] = useState(null)
  const [rechargeAmt, setRechargeAmt] = useState(100)
  const [rechargeCustom, setRechargeCustom] = useState('')
  const [rechargeLoading, setRechargeLoading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [teacherId])

  const fetchData = async () => {
    setLoading(true)
    try {
      // 1. Fetch Code
      const { data: codeData } = await supabase
        .from('teacher_codes')
        .select('code')
        .eq('teacher_id', teacherId)
        .maybeSingle()
        
      if (codeData) setCode(codeData.code)
      else generateCode()

      // 2. Fetch Links
      const { data: links } = await supabase
        .from('assistant_links')
        .select('id, assistant_id, status, created_at, profiles!assistant_id(id, full_name, phone, ai_credits_balance)')
        .eq('teacher_id', teacherId)
        .order('created_at', { ascending: false })
        
      if (links) {
        setPendingLinks(links.filter(l => l.status === 'pending'))
        setApprovedLinks(links.filter(l => l.status === 'approved'))
      }
    } catch(err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenRecharge = (link) => {
    setRechargeAssistant(link)
    setRechargeAmt(100)
    setRechargeCustom('')
  }

  const handleExecuteRecharge = async (e) => {
    if (e) e.preventDefault()
    if (!rechargeAssistant) return

    const amount = rechargeCustom ? parseInt(rechargeCustom, 10) : parseInt(rechargeAmt, 10)
    if (isNaN(amount) || amount <= 0) {
      alert('يرجى إدخال عدد نقاط صالح أكبر من صفر')
      return
    }

    const assistantProfileId = rechargeAssistant.profiles?.id || rechargeAssistant.assistant_id
    if (!assistantProfileId) {
      alert('لم يتم العثور على حساب المساعد')
      return
    }

    setRechargeLoading(true)
    try {
      const { error: rpcError } = await supabase.rpc('topup_ai_credits', {
        p_user_id: assistantProfileId,
        p_amount: amount,
        p_description: `شحن رصيد AI للمساعد (${rechargeAssistant.profiles?.full_name})`
      })

      if (rpcError) {
        console.warn('RPC topup failed, updating profiles directly:', rpcError)
        const currentBal = Number(rechargeAssistant.profiles?.ai_credits_balance) || 50
        const newBal = currentBal + amount
        const { error: updErr } = await supabase
          .from('profiles')
          .update({ ai_credits_balance: newBal })
          .eq('id', assistantProfileId)
        if (updErr) throw updErr
      }

      alert(`✅ تم شحن ${amount} كريديت بنجاح للمساعد (${rechargeAssistant.profiles?.full_name})!`)
      setRechargeAssistant(null)
      fetchData()
    } catch (err) {
      console.error('Error recharging assistant:', err)
      alert('حدث خطأ أثناء الشحن: ' + (err.message || 'خطأ غير معروف'))
    } finally {
      setRechargeLoading(false)
    }
  }

  const generateCode = async () => {
    setCodeLoading(true)
    try {
      const newCode = 'TCHR-' + Math.random().toString(36).substring(2, 8).toUpperCase()
      const { error } = await supabase
        .from('teacher_codes')
        .upsert([{ teacher_id: teacherId, code: newCode }])
        
      if (!error) setCode(newCode)
    } catch(err) {
      console.error(err)
    } finally {
      setCodeLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleStatus = async (linkId, status) => {
    if (status === 'deleted' && !confirm('هل أنت متأكد من حذف هذا المساعد؟')) return
    
    try {
      if (status === 'deleted') {
        await supabase.from('assistant_links').delete().eq('id', linkId)
      } else {
        await supabase.from('assistant_links').update({ status }).eq('id', linkId)
      }
      fetchData()
    } catch(err) {
      console.error(err)
      alert('حدث خطأ')
    }
  }

  if (loading) return <div>جاري التحميل...</div>

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Code Section */}
      <div style={{ background: 'white', padding: '30px', borderRadius: '16px', marginBottom: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', textAlign: 'center' }}>
        <Bot size={40} color="#3b82f6" style={{ marginBottom: '15px' }} />
        <h2 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>كود ربط المساعدين</h2>
        <p style={{ color: '#64748b', marginBottom: '20px' }}>أعط هذا الكود للمساعد الخاص بك لكي يتمكن من الانضمام إليك وإدارة طلابك.</p>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <div style={{ background: '#f8fafc', border: '2px dashed #cbd5e1', padding: '15px 30px', borderRadius: '12px', fontSize: '1.5rem', fontWeight: 'bold', letterSpacing: '2px', color: '#0f172a' }}>
            {code || 'جاري الإنشاء...'}
          </div>
          <button onClick={handleCopy} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '15px', borderRadius: '12px', cursor: 'pointer' }}>
            {copied ? <Check size={20} /> : <Copy size={20} />}
          </button>
          <button onClick={generateCode} disabled={codeLoading} style={{ background: '#e2e8f0', color: '#475569', border: 'none', padding: '15px', borderRadius: '12px', cursor: 'pointer' }} title="توليد كود جديد">
            <RefreshCw size={20} className={codeLoading ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {/* Pending Section */}
      {pendingLinks.length > 0 && (
        <div style={{ background: 'white', padding: '20px', borderRadius: '16px', marginBottom: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '8px' }}>
            طلبات بانتظار الموافقة ({pendingLinks.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {pendingLinks.map(link => (
              <div key={link.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div>
                  <div style={{ fontWeight: 'bold', color: '#1e293b' }}>{link.profiles?.full_name}</div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{link.profiles?.phone || 'بدون رقم'}</div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => handleStatus(link.id, 'approved')} style={{ background: '#10b981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold' }}>
                    <CheckCircle size={16} /> قبول
                  </button>
                  <button onClick={() => handleStatus(link.id, 'deleted')} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold' }}>
                    <XCircle size={16} /> رفض
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Approved Section */}
      <div style={{ background: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px' }}>
          المساعدين الحاليين ({approvedLinks.length})
        </h3>
        {approvedLinks.length === 0 ? (
          <p style={{ color: '#64748b', textAlign: 'center', padding: '20px 0' }}>لا يوجد مساعدين حالياً.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {approvedLinks.map(link => (
              <div key={link.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ background: '#d1fae5', color: '#059669', padding: '10px', borderRadius: '50%' }}>
                    <Bot size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#1e293b' }}>{link.profiles?.full_name}</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>تم الانضمام: {new Date(link.created_at).toLocaleDateString('ar-EG')}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                      <span style={{ fontSize: '0.8rem', color: '#6d28d9', background: '#ede9fe', padding: '2px 8px', borderRadius: '6px', fontWeight: 'bold' }}>
                        💎 رصيد الـ AI: {link.profiles?.ai_credits_balance ?? 50} كريديت
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button 
                    onClick={() => handleOpenRecharge(link)}
                    style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold', fontSize: '0.85rem' }}
                  >
                    <Sparkles size={14} /> شحن نقاط AI
                  </button>
                  <button onClick={() => handleStatus(link.id, 'deleted')} style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fee2e2', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold', fontSize: '0.85rem' }}>
                    <Trash2 size={14} /> حذف الصلاحية
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assistant Recharge Modal */}
      {rechargeAssistant && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '15px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            maxWidth: '460px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            position: 'relative'
          }}>
            <button 
              onClick={() => setRechargeAssistant(null)}
              style={{ position: 'absolute', top: '16px', left: '16px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
            >
              <X size={20} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '18px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '6px' }}>⚡ 💎</div>
              <h3 style={{ margin: '0 0 6px 0', color: '#1e293b' }}>
                شحن رصيد AI للمساعد
              </h3>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                {rechargeAssistant.profiles?.full_name} (الرصيد الحالي: {rechargeAssistant.profiles?.ai_credits_balance ?? 50} 💎)
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '15px' }}>
              {[50, 100, 200, 500].map(amt => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => { setRechargeAmt(amt); setRechargeCustom(''); }}
                  style={{
                    background: rechargeAmt === amt && !rechargeCustom ? '#ede9fe' : '#f8fafc',
                    border: rechargeAmt === amt && !rechargeCustom ? '1.5px solid #8b5cf6' : '1px solid #cbd5e1',
                    color: rechargeAmt === amt && !rechargeCustom ? '#7c3aed' : '#475569',
                    padding: '8px 4px',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    fontSize: '0.88rem',
                    cursor: 'pointer'
                  }}
                >
                  +{amt} 💎
                </button>
              ))}
            </div>

            <form onSubmit={handleExecuteRecharge}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: '#475569', marginBottom: '6px' }}>
                  أو أدخل عدد نقاط مخصص:
                </label>
                <input
                  type="number"
                  min="1"
                  value={rechargeCustom}
                  onChange={(e) => setRechargeCustom(e.target.value)}
                  placeholder="مثال: 150 أو 300"
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    outline: 'none',
                    fontWeight: 'bold',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={rechargeLoading}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                  color: 'white',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '10px',
                  fontWeight: 'bold',
                  fontSize: '0.95rem',
                  cursor: rechargeLoading ? 'not-allowed' : 'pointer'
                }}
              >
                {rechargeLoading ? 'جاري الشحن...' : `تأكيد شحن ${rechargeCustom || rechargeAmt} كريديت ⚡`}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}