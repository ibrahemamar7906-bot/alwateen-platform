import React, { useState } from 'react';
import { X, Layers, Upload, Plus, Sparkles, Loader2, Cpu } from 'lucide-react';
import { UNIFIED_AI_MODELS, DEFAULT_AI_MODEL } from '../../utils/aiModels';
import { supabase } from '../../../utils/supabase';

export default function FlashcardModal({ isActive, onClose, onAdd, isAdmin = false }) {
  const [frontText, setFrontText] = useState('');
  const [backText, setBackText] = useState('');
  
  const [activeTab, setActiveTab] = useState('single'); // 'single', 'bulk', 'ai'
  const [bulkText, setBulkText] = useState('');
  
  const [aiTopic, setAiTopic] = useState('');
  const [aiCount, setAiCount] = useState(5);
  const [aiModel, setAiModel] = useState(DEFAULT_AI_MODEL);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isActive) return null;

  const handleAddSingle = () => {
    if (frontText.trim() && backText.trim()) {
      onAdd(frontText, backText);
      setFrontText('');
      setBackText('');
      onClose();
    } else {
      alert("يرجى كتابة الوجه الأمامي والخلفي");
    }
  };

  const handleGenerateAI = async () => {
    if (!aiTopic.trim()) return;
    setIsGenerating(true);
    try {
      const prompt = `أنت مساعد تعليمي ذكي وخبير في أداة [صانع البطاقات التعليمية التفاعلية Flashcards داخل السبورة الذكية] في منصة الجُنيدي التعليمية.
مهمتك: صياغة ${aiCount} بطاقات تعليمية تفاعلية دقيقة ومفيدة حول موضوع: "${aiTopic}".
يجب أن ترجع النتيجة كقائمة CSV فقط بدون أي ترويسة وبدون أي مقدمات أو شروحات وبدون كود markdown.
الصيغة: الوجه الأمامي (السؤال أو المصطلح), الوجه الخلفي (الإجابة أو الشرح)
مثال:
ما هي عاصمة مصر؟,القاهرة
تأكد من عدم استخدام فواصل داخل نص السؤال أو الإجابة نفسها.`;

      let { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        const { data: refreshed } = await supabase.auth.refreshSession().catch(() => ({ data: {} }));
        session = refreshed?.session;
      }
      let token = session?.access_token;
      if (!token) {
        const { data: userData } = await supabase.auth.getUser().catch(() => ({ data: {} }));
        if (userData?.user) {
          const { data: refreshed } = await supabase.auth.refreshSession().catch(() => ({ data: {} }));
          token = refreshed?.session?.access_token;
        }
      }
      if (!token) {
        throw new Error('يرجى تسجيل الدخول لحسابك لاستخدام ميزات الذكاء الاصطناعي (أو تحديث الصفحة).');
      }

      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          model: aiModel,
          generationConfig: { temperature: 0.3 },
          action: 'whiteboard_flashcards'
        })
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('انتهت جلسة تسجيل الدخول. يرجى تحديث الصفحة أو إعادة تسجيل الدخول.');
        }
        throw new Error(data.error?.message || 'فشل التوليد');
      }
      
      let aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      aiText = aiText.replace(/```(csv)?/gi, '').replace(/```/g, '').trim();
      setBulkText(aiText);
      setActiveTab('bulk');
    } catch (err) {
      alert("خطأ في التوليد: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddBulk = () => {
    if (!bulkText.trim()) return;
    const lines = bulkText.split('\n');
    let addedCount = 0;
    
    lines.forEach(line => {
      const parts = line.split(',');
      if (parts.length >= 2) {
        const fText = parts[0].trim();
        const bText = parts.slice(1).join(',').trim();
        if (fText && bText) {
          setTimeout(() => {
            onAdd(fText, bText);
          }, addedCount * 100);
          addedCount++;
        }
      }
    });

    if (addedCount > 0) {
      setBulkText('');
      onClose();
    } else {
      alert("لم يتم العثور على بطاقات صحيحة. استخدم صيغة (الوجه الأمامي, الوجه الخلفي)");
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.8)', zIndex: 100000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Tajawal, sans-serif', direction: 'rtl'
    }}>
      <div style={{
        background: '#fff', padding: '0', borderRadius: '20px', width: '90%', maxWidth: '540px',
        overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', position: 'relative',
        display: 'flex', flexDirection: 'column'
      }}>
        <div style={{
          background: '#f8fafc', padding: '18px 22px', display: 'flex', justifyContent: 'space-between', 
          alignItems: 'center', borderBottom: '1px solid #e2e8f0'
        }}>
          <h2 style={{ margin: 0, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.2rem' }}>
            <Layers size={24} color='#8b5cf6' /> إضافة بطاقات تعليمية (Flashcards)
          </h2>
          <button onClick={onClose} style={{
            background: '#fee2e2', border: 'none', cursor: 'pointer', color: '#ef4444', 
            borderRadius: '50%', padding: '8px', display: 'flex'
          }} title="إغلاق"><X size={20} /></button>
        </div>
        
        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0' }}>
          <button 
             onClick={() => setActiveTab('single')} 
             style={{ flex: 1, padding: '14px', background: activeTab === 'single' ? '#fff' : '#f8fafc', border: 'none', borderBottom: activeTab === 'single' ? '3px solid #8b5cf6' : '3px solid transparent', fontWeight: 'bold', color: activeTab === 'single' ? '#8b5cf6' : '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
             <Plus size={18} /> بطاقة مفردة
          </button>
          <button 
             onClick={() => setActiveTab('bulk')} 
             style={{ flex: 1, padding: '14px', background: activeTab === 'bulk' ? '#fff' : '#f8fafc', border: 'none', borderBottom: activeTab === 'bulk' ? '3px solid #10b981' : '3px solid transparent', fontWeight: 'bold', color: activeTab === 'bulk' ? '#10b981' : '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
             <Upload size={18} /> استيراد جماعي
          </button>
          <button 
             onClick={() => setActiveTab('ai')} 
             style={{ flex: 1, padding: '14px', background: activeTab === 'ai' ? '#fff' : '#f8fafc', border: 'none', borderBottom: activeTab === 'ai' ? '3px solid #0284c7' : '3px solid transparent', fontWeight: 'bold', color: activeTab === 'ai' ? '#0284c7' : '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
             <Sparkles size={18} color="#0284c7" /> توليد بالذكاء
          </button>
        </div>

        <div style={{ padding: '24px', background: '#fff' }}>
          
          {activeTab === 'single' && (
             <>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontWeight: 'bold' }}>الوجه الأمامي (مثال: المصطلح أو السؤال)</label>
                  <input 
                    type="text" 
                    value={frontText} 
                    onChange={e => setFrontText(e.target.value)} 
                    placeholder="مثال: الفاعل في اللغة العربية"
                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '1rem', boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontWeight: 'bold' }}>الوجه الخلفي (مثال: التعريف أو الإجابة)</label>
                  <input 
                    type="text" 
                    value={backText} 
                    onChange={e => setBackText(e.target.value)} 
                    placeholder="مثال: اسم مرفوع يدل على من قام بالفعل"
                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '1rem', boxSizing: 'border-box' }}
                  />
                </div>
                <button 
                  onClick={handleAddSingle}
                  style={{ width: '100%', padding: '14px', background: '#8b5cf6', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '1.05rem', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  إضافة للسبورة
                </button>
             </>
          )}

          {activeTab === 'bulk' && (
             <>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontWeight: 'bold' }}>استيراد سريع عبر النصوص / CSV</label>
                  <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '10px', marginTop: 0 }}>الصق قائمة الكلمات هنا، بحيث تكون كل بطاقة في سطر، ويفصل بين الوجه الأمامي والخلفي بفاصلة ( , ).</p>
                  <textarea 
                    value={bulkText} 
                    onChange={e => setBulkText(e.target.value)} 
                    placeholder="Apple, تفاحة&#10;Car, سيارة&#10;Book, كتاب"
                    style={{ width: '100%', height: '140px', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem', fontFamily: 'monospace', boxSizing: 'border-box' }}
                  />
                </div>
                <button 
                  onClick={handleAddBulk}
                  style={{ width: '100%', padding: '14px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '1.05rem', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  إنشاء كل البطاقات دفعة واحدة
                </button>
             </>
          )}

          {activeTab === 'ai' && (
            <>
              <div style={{ marginBottom: '16px', padding: '10px 14px', background: '#f0f9ff', borderRadius: '10px', border: '1px solid #bae6fd', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0369a1', fontWeight: 'bold', fontSize: '0.9rem' }}>
                  <Cpu size={16} />
                  <span>نموذج الذكاء:</span>
                </div>
                <select 
                  value={aiModel} 
                  onChange={e => setAiModel(e.target.value)}
                  style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #7dd3fc', background: 'white', color: '#0369a1', fontSize: '0.85rem', fontWeight: 'bold', outline: 'none' }}
                >
                  {UNIFIED_AI_MODELS.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontWeight: 'bold' }}>موضوع أو درس البطاقات:</label>
                <input 
                  type="text" 
                  value={aiTopic} 
                  onChange={e => setAiTopic(e.target.value)} 
                  placeholder="مثال: أحكام الميم الساكنة / أهم أفعال اللغة الإنجليزية / العناصر الكيميائية"
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '1rem', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontWeight: 'bold' }}>عدد البطاقات المطلوبة:</label>
                <select 
                  value={aiCount} 
                  onChange={e => setAiCount(parseInt(e.target.value) || 5)}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem', background: 'white' }}
                >
                  <option value={3}>3 بطاقات</option>
                  <option value={5}>5 بطاقات (موصى به)</option>
                  <option value={8}>8 بطاقات</option>
                  <option value={10}>10 بطاقات</option>
                </select>
              </div>

              <button 
                onClick={handleGenerateAI}
                disabled={isGenerating || !aiTopic.trim()}
                style={{ 
                  width: '100%', padding: '14px', background: 'linear-gradient(135deg, #0284c7, #2563eb)', 
                  color: '#fff', border: 'none', borderRadius: '10px', fontSize: '1.05rem', fontWeight: 'bold', 
                  cursor: (isGenerating || !aiTopic.trim()) ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  opacity: (isGenerating || !aiTopic.trim()) ? 0.7 : 1
                }}
              >
                {isGenerating ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> جاري التوليد بالذكاء الاصطناعي...</> : <><Sparkles size={18} /> توليد البطاقات واستيرادها</>}
              </button>
            </>
          )}

        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
