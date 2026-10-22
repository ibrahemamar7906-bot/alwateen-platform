'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Head from 'next/head'
import { supabase } from '../../../utils/supabase'
import styles from './page.module.css'
import { Plus, Save, Play, Trash2, Edit2, Layers } from 'lucide-react'

export default function InteractiveFlashcardsBuilder() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [teacher, setTeacher] = useState(null)
  const [isPremium, setIsPremium] = useState(false)
  
  // Builder State
  const [deckTitle, setDeckTitle] = useState('')
  const [cards, setCards] = useState([])
  const [frontInput, setFrontInput] = useState('')
  const [backInput, setBackInput] = useState('')
  
  // Saved Decks
  const [savedDecks, setSavedDecks] = useState([])
  const [editingDeckId, setEditingDeckId] = useState(null)
  const [saving, setSaving] = useState(false)

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

      const now = new Date()
      const subEndDate = profile.subscription_end_date ? new Date(profile.subscription_end_date) : null
      const isSubscribed = profile.status === 'approved' && (!subEndDate || subEndDate > now)
      
      if (profile?.role !== 'admin' && profile?.role !== 'assistant' && !isSubscribed) {
        setIsPremium(false)
      } else {
        setIsPremium(true)
      }
      let finalId = user.id;
                                    if (profile?.role === 'assistant') {
        const { data: link } = await supabase
          .from('assistant_links')
          .select('teacher_id')
          .eq('assistant_id', user.id)
          .eq('status', 'approved')
          .maybeSingle();
          
        if (link) {
          finalId = link.teacher_id;
        } else {
          router.push('/assistant-link');
          return;
        }
      } 
      setTeacher({
        id: finalId,
        name: profile.full_name
      })
      await fetchSavedDecks(user.id)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchSavedDecks = async (teacherId) => {
    try {
      const { data, error } = await supabase
        .from('flashcard_decks')
        .select('*')
        .eq('teacher_id', teacherId)
        .order('updated_at', { ascending: false })
      
      if (!error && data) {
        setSavedDecks(data)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleAddCard = () => {
    if (!frontInput.trim() || !backInput.trim()) {
      alert('الرجاء كتابة السؤال والإجابة!')
      return
    }
    const newCard = {
      id: Date.now().toString(),
      front: frontInput.trim(),
      back: backInput.trim()
    }
    setCards([...cards, newCard])
    setFrontInput('')
    setBackInput('')
  }

  const handleRemoveCard = (id) => {
    setCards(cards.filter(c => c.id !== id))
  }

  const handleSaveDeck = async () => {
    if (!deckTitle.trim()) {
      alert('الرجاء إدخال اسم للرزمة!')
      return
    }
    if (cards.length === 0) {
      alert('الرجاء إضافة بطاقة واحدة على الأقل!')
      return
    }

    setSaving(true)
    try {
      const payload = {
        teacher_id: teacher.id,
        title: deckTitle.trim(),
        cards: cards,
        updated_at: new Date().toISOString()
      }

      let error;
      if (editingDeckId) {
        const res = await supabase.from('flashcard_decks').update(payload).eq('id', editingDeckId)
        error = res.error
      } else {
        const res = await supabase.from('flashcard_decks').insert([payload])
        error = res.error
      }

      if (error) throw error

      alert('✅ تم الحفظ بنجاح!')
      fetchSavedDecks(teacher.id)
      
      // Reset form
      setDeckTitle('')
      setCards([])
      setEditingDeckId(null)
    } catch (e) {
      console.error(e)
      alert('❌ حدث خطأ أثناء الحفظ')
    } finally {
      setSaving(false)
    }
  }

  const handleLoadDeck = (deck) => {
    setEditingDeckId(deck.id)
    setDeckTitle(deck.title)
    setCards(deck.cards)
  }

  const handleDeleteDeck = async (id, e) => {
    e.stopPropagation()
    if (!confirm('هل أنت متأكد من حذف هذه الرزمة؟')) return
    try {
      await supabase.from('flashcard_decks').delete().eq('id', id)
      setSavedDecks(savedDecks.filter(d => d.id !== id))
      if (editingDeckId === id) {
        setEditingDeckId(null)
        setDeckTitle('')
        setCards([])
      }
    } catch (e) {
      alert('❌ حدث خطأ')
    }
  }

  const handleStartLive = (deckId) => {
    router.push(`/teacher-assistant/live-presentation?deckId=${deckId}`)
  }

  if (loading) return <div style={{padding: '50px', textAlign: 'center'}}>جاري التحميل...</div>

  return (
    <>
      <Head>
        <title>صانع البطاقات التفاعلية | مساعد المعلم</title>
      </Head>

      <div className={styles.container}>
        <header className={styles.header}>
          <h1>🗂️ صانع البطاقات التفاعلية (Flashcards)</h1>
          <p>قم ببناء رزم البطاقات لتعرضها لطلابك في البث المباشر (Live Mode)</p>
        </header>

        {!isPremium ? (
          <div style={{ textAlign: 'center', padding: '50px', background: 'var(--bg-card)', borderRadius: '15px', border: '1px solid rgba(0,0,0,0.1)', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <h2 style={{ color: '#dc2626', marginBottom: '15px' }}>🔒 أداة مدفوعة</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '25px', fontSize: '1.1rem' }}>هذه الأداة متاحة فقط في النسخة المدفوعة (البريميوم). قم بترقية حسابك للوصول إليها.</p>
            <Link href="/pricing" style={{ background: '#059669', color: 'white', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', display: 'inline-block' }}>
              الترقية للنسخة المدفوعة 💎
            </Link>
          </div>
        ) : (
          <div className={styles.grid}>
            
            {/* Deck Builder Area */}
          <div>
            <div className={styles.panel}>
              <h2 style={{ margin: '0 0 20px 0', color: '#1e293b', fontSize: '1.4rem' }}>
                {editingDeckId ? 'تعديل الرزمة' : 'إنشاء رزمة جديدة'}
              </h2>

              <div className={styles.formGroup}>
                <label>اسم الرزمة (مثال: مراجعة الباب الأول - تاريخ)</label>
                <input 
                  type="text" 
                  className={styles.input}
                  value={deckTitle}
                  onChange={e => setDeckTitle(e.target.value)}
                  placeholder="أدخل اسم الرزمة..."
                />
              </div>

              <div className={styles.cardBuilder}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', color: '#334155' }}>إضافة بطاقة جديدة</h3>
                <div className={styles.formGroup}>
                  <label style={{ color: '#0ea5e9' }}>الوجه الأمامي (السؤال / المصطلح)</label>
                  <textarea 
                    className={styles.textarea}
                    value={frontInput}
                    onChange={e => setFrontInput(e.target.value)}
                    placeholder="ما هو قانون الجاذبية؟"
                    style={{ minHeight: '60px' }}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label style={{ color: '#10b981' }}>الوجه الخلفي (الإجابة / التعريف)</label>
                  <textarea 
                    className={styles.textarea}
                    value={backInput}
                    onChange={e => setBackInput(e.target.value)}
                    placeholder="هو قوة الجذب بين الأجسام..."
                    style={{ minHeight: '60px' }}
                  />
                </div>
                <button className={styles.btnSecondary} style={{ width: '100%', background: '#f8fafc', color: '#0ea5e9', borderColor: '#bae6fd' }} onClick={handleAddCard}>
                  <Plus size={18} style={{ verticalAlign: 'middle', marginLeft: '5px' }} />
                  أضف البطاقة للرزمة
                </button>
              </div>

              {cards.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#64748b' }}>البطاقات المضافة ({cards.length}):</h4>
                  {cards.map((c, i) => (
                    <div key={c.id} className={styles.cardPreview}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'bold', color: '#0ea5e9', marginBottom: '4px' }}>س: {c.front}</div>
                        <div style={{ color: '#10b981', fontSize: '0.9rem' }}>ج: {c.back}</div>
                      </div>
                      <button onClick={() => handleRemoveCard(c.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '5px' }}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button className={styles.btnPrimary} onClick={handleSaveDeck} disabled={saving}>
                <Save size={20} />
                {saving ? 'جاري الحفظ...' : 'حفظ الرزمة السحابية'}
              </button>
            </div>
          </div>

          {/* Saved Decks Sidebar */}
          <aside>
            <div className={styles.panel}>
              <h3 style={{ margin: '0 0 15px 0', color: '#1e293b', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={20} color="#8b5cf6" />
                رزم البطاقات المحفوظة
              </h3>
              
              {savedDecks.length === 0 ? (
                <p style={{ color: '#94a3b8', fontSize: '0.95rem', textAlign: 'center' }}>لم تقم بإنشاء أي رزم بعد.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {savedDecks.map(deck => (
                    <div key={deck.id} className={styles.deckItem} onClick={() => handleLoadDeck(deck)}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <strong style={{ display: 'block', color: '#1e293b', marginBottom: '5px' }}>{deck.title}</strong>
                          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{deck.cards.length} بطاقات • {new Date(deck.updated_at).toLocaleDateString('ar-EG')}</span>
                        </div>
                        <button onClick={(e) => handleDeleteDeck(deck.id, e)} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer' }} title="حذف">
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'flex-end' }}>
                        <button 
                          className={styles.liveBtn}
                          onClick={(e) => { e.stopPropagation(); handleStartLive(deck.id); }}
                        >
                          <Play size={16} fill="white" />
                          بدء البث (Live)
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              </div>
            </aside>
          </div>
        )}
      </div>
    </>
  )
}
