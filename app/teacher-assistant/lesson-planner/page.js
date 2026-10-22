'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../utils/supabase'
import { UNIFIED_AI_MODELS, DEFAULT_AI_MODEL } from '../../utils/aiModels'
import { ChevronRight, Upload, Sparkles, BookOpen, Download, Copy, Loader2, Check, X, Image as ImageIcon, Cpu } from 'lucide-react'

export default function LessonPlanner() {
  const router = useRouter()
  const [topic, setTopic] = useState('')
  const [selectedModel, setSelectedModel] = useState(DEFAULT_AI_MODEL)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [userRole, setUserRole] = useState(null)
  
  const [images, setImages] = useState([])
  const fileInputRef = useRef(null)

  const [credits, setCredits] = useState(50)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      const { data: profile } = await supabase.from('profiles').select('role, is_active, ai_credits_balance').eq('id', user.id).single()
      if (!profile || !['admin', 'teacher', 'teacher_pro', 'assistant'].includes(profile.role)) { 
        alert('هذه الميزة متاحة للمعلمين ومشرفي المنصة فقط.'); 
        router.push('/student-dashboard'); 
        return; 
      }
      setUserRole(profile.role)
      setCredits(profile.ai_credits_balance ?? 50)
    }
    checkUser()
  }, [router])

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64Data = event.target.result.split(',')[1];
          setImages(prev => [...prev, { 
            data: base64Data, 
            mimeType: file.type, 
            name: file.name,
            preview: event.target.result
          }]);
        };
        reader.readAsDataURL(file);
      }
    });
  }

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  }

  const generateLesson = async () => {
    if (!topic.trim() && images.length === 0) {
      alert('يرجى إدخال عنوان الدرس أو رفع صورة للمحتوى.')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const systemPrompt = `أنت الخبير التربوي والمساعد الأكاديمي الذكي المتخصص في أداة [مخطط ومحضر الدروس المتقدم] في منصة الجُنيدي التعليمية (alwateen.com).
وظيفتك الأساسية: تحضير درس تعليمي متكامل وتفاعلي فائق الجودة، بناءً على العنوان أو صور صفحات الكتاب المرفقة.
يجب أن تفهم بدقة أنك تعمل داخل أداة تحضير الدروس، وتنتج خطة درس، وبطاقات تعليمية (Flashcards)، واختباراً تقييمياً دقيقاً.

يجب أن يكون الناتج بصيغة JSON نظيفة فقط بالهيكل التالي بدقة (لا تضف أي نص تمهيدي أو خاتمة أو بلوك Markdown خارج الـ JSON):
{
  "plan": {
    "title": "عنوان الدرس الدقيق والشامل",
    "objectives": ["الهدف التعليمي الأول (سلوكي ومعرفي)", "الهدف الثاني", "الهدف الثالث"],
    "summary": "ملخص شامل وواضح للدرس مقسم لفقرات ونقاط ميسرة يسهل على الطالب استيعابها وفهمها"
  },
  "flashcards": [
    { "front": "المصطلح أو السؤال الأساسي", "back": "التعريف المركز أو الإجابة النموذجية" }
  ],
  "quiz": [
    { "question": "نص السؤال الامتحاني هنا؟", "options": ["الخيار الأول", "الخيار الثاني", "الخيار الثالث", "الخيار الرابع"], "correct": 0 }
  ]
}

قواعد وإرشادات صارمة:
1. اجعل البطاقات التعليمية (flashcards) 5 بطاقات مركزة تغطي أهم مفاهيم الدرس.
2. اجعل الاختبار (quiz) 10 أسئلة اختيار من متعدد متدرجة الصعوبة (تذكر، فهم، تطبيق)، حيث "correct" هو رقم الإندكس الدقيق للإجابة الصحيحة (0، 1، 2، أو 3).
3. اكتب بلغة عربية فصحى تربوية سليمة ومضبوطة تناسب المناهج التعليمية المصرية.`;

      const parts = [
        { text: systemPrompt + '\n\nموضوع وعنوان الدرس المطلوب تحضيره: ' + (topic || 'مستخرج من الصور المرفقة') }
      ];

      if (images.length > 0) {
        images.forEach(img => {
          parts.push({
            inlineData: {
              mimeType: img.mimeType,
              data: img.data
            }
          });
        });
      }

      const contents = [{ role: 'user', parts }];

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('يجب تسجيل الدخول لاستخدام مساعد تحضير الدروس الذكي.');
      }

      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ 
          contents, 
          model: selectedModel, 
          generationConfig: { temperature: 0.3 },
          cost: 3,
          action: 'lesson_planner'
        })
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 402 || data?.insufficient_credits) {
          throw new Error(data?.error?.message || 'رصيد الذكاء الاصطناعي غير كافٍ. المطلوب: 3 كريديت.');
        }
        throw new Error(data.error?.message || data.error || 'خطأ في توليد الدرس');
      }

      if (data.remaining_credits !== undefined) {
        setCredits(data.remaining_credits);
      } else {
        setCredits(prev => Math.max(0, prev - 3));
      }

      let generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!generatedText) throw new Error('لم يتم استلام نص من نموذج الذكاء الاصطناعي');
      
      // تنظيف أي وسوم أو علامات Markdown
      generatedText = generatedText.replace(/```json/gi, '').replace(/```/g, '').trim();
      
      const parsed = JSON.parse(generatedText);
      setResult(parsed);

    } catch (err) {
      console.error('Lesson Planner Error:', err);
      alert('حدث خطأ أثناء التوليد: ' + (err.message || 'تأكد من إدخال بيانات صحيحة أو اختر نموذجاً آخر.'));
    } finally {
      setLoading(false);
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    alert('تم النسخ بنجاح!')
  }

  const handleRechargeClick = async () => {
    if (userRole === 'admin') {
      const input = prompt('أدخل عدد النقاط / الكريديتس التي تريد إضافتها لحسابك كمدير:', '500')
      if (!input) return
      const amount = parseInt(input, 10)
      if (isNaN(amount) || amount <= 0) {
        alert('يرجى إدخال رقم صحيح.')
        return
      }
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const { error } = await supabase.rpc('topup_ai_credits', {
          p_user_id: user.id,
          p_amount: amount,
          p_description: `شحن مباشر للمدير في محضر الدروس (${amount} كريديت)`
        })
        const newCredits = (Number(credits) || 0) + amount
        if (error) {
          await supabase.from('profiles').update({ ai_credits_balance: newCredits }).eq('id', user.id)
        }
        setCredits(newCredits)
        alert(`✅ تم شحن ${amount} كريديت بنجاح! رصيدك الآن: ${newCredits}`)
      } catch (err) {
        alert('خطأ أثناء الشحن: ' + err.message)
      }
    } else {
      router.push('/pricing')
    }
  }

  const exportQuizToCSV = () => {
    if (!result?.quiz) return;
    let csv = '\uFEFF' + 'السؤال,الخيار أ,الخيار ب,الخيار ج,الخيار د,الإجابة الصحيحة\n';
    result.quiz.forEach(q => {
      const correctText = q.options[q.correct];
      csv += `"${q.question}","${q.options[0]}","${q.options[1]}","${q.options[2]}","${q.options[3]}","${correctText}"\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `اختبار_${result.plan.title || 'الدرس'}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div style={{ minHeight: '100dvh', background: '#f8fafc', padding: '20px', fontFamily: 'Tajawal, sans-serif', direction: 'rtl' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px', gap: '15px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button 
              onClick={() => router.push('/teacher-assistant')}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', background: 'white', border: '1px solid #e2e8f0', cursor: 'pointer' }}
              title="رجوع للمساعد الذكي"
            >
              <ChevronRight size={24} color="#64748b" />
            </button>
            <div>
              <h1 style={{ margin: 0, color: '#1e293b', fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                مساعد تحضير الدروس الذكي <Sparkles color="#0ea5e9" size={28} />
              </h1>
              <p style={{ margin: '5px 0 0 0', color: '#64748b' }}>أدخل عنوان الدرس أو ارفع صوراً للمحتوى وسيقوم الذكاء الاصطناعي بتجهيز خطة الدرس والبطاقات واختبار التقييم.</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'linear-gradient(135deg, #f5f3ff, #ede9fe)', border: '1.5px solid #ddd6fe', padding: '8px 16px', borderRadius: '20px' }}>
            <span style={{ color: '#6d28d9', fontWeight: 800, fontSize: '0.95rem' }}>
              💎 رصيدك الحالي: <strong>{credits}</strong> كريديت
            </span>
            <button 
              onClick={handleRechargeClick}
              style={{ background: '#8b5cf6', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '12px', fontSize: '0.82rem', fontWeight: 'bold', cursor: 'pointer' }}
            >
              {userRole === 'admin' ? '⚡ شحن رصيد الأدمن' : '+ شحن'}
            </button>
          </div>
        </div>

        {/* Input Section */}
        <div style={{ background: 'white', padding: '25px', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
          
          {/* AI Model Selector */}
          <div style={{ marginBottom: '20px', padding: '12px 16px', background: '#f0f9ff', borderRadius: '12px', border: '1px solid #bae6fd', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0369a1', fontWeight: 'bold', fontSize: '0.95rem' }}>
              <Cpu size={18} color="#0284c7" />
              <span>نموذج الذكاء الاصطناعي المعتمد:</span>
            </div>
            <select 
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              style={{ 
                padding: '8px 12px', borderRadius: '8px', border: '1px solid #7dd3fc', 
                background: 'white', color: '#0c4a6e', fontSize: '0.9rem', fontWeight: 'bold',
                outline: 'none', cursor: 'pointer'
              }}
            >
              {UNIFIED_AI_MODELS.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#334155' }}>عنوان أو موضوع الدرس:</label>
            <input 
              type="text" 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="مثال: أحكام الميم الساكنة / كان وأخواتها / التكاثر في الكائنات الحية..."
              style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '2px solid #e2e8f0', fontSize: '1.1rem', outline: 'none', boxSizing: 'border-box' }}
              onFocus={(e) => e.target.style.borderColor = '#0ea5e9'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>

          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#334155' }}>صور مساعدة (اختياري - مثلاً صفحات من الكتاب المدرسي أو المذكرة):</label>
            <input 
              type="file" 
              accept="image/*" 
              multiple
              ref={fileInputRef}
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
            
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {images.map((img, index) => (
                <div key={index} style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                  <img src={img.preview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button 
                    onClick={() => removeImage(index)}
                    style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    title="حذف الصورة"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                style={{ width: '100px', height: '100px', borderRadius: '10px', border: '2px dashed #cbd5e1', background: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}
                title="إضافة صورة"
              >
                <ImageIcon size={24} style={{ marginBottom: '5px' }} />
                <span style={{ fontSize: '0.8rem' }}>إضافة صورة</span>
              </button>
            </div>
          </div>

          <button 
            onClick={generateLesson}
            disabled={loading}
            style={{ 
              width: '100%', padding: '16px', background: 'linear-gradient(135deg, #0ea5e9, #3b82f6)', 
              color: 'white', border: 'none', borderRadius: '12px', fontSize: '1.2rem', fontWeight: 'bold', 
              cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              opacity: loading ? 0.7 : 1, transition: '0.2s'
            }}
          >
            {loading ? (
              <><Loader2 className="animate-spin" /> جاري التحليل وصناعة الدرس عبر الذكاء الاصطناعي...</>
            ) : (
              <><Sparkles /> توليد الدرس المتكامل (خطة + بطاقات + اختبار) — 3 كريديت 💎</>
            )}
          </button>
        </div>

        {/* Results Section */}
        {result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            
            {/* Plan */}
            <div style={{ background: 'white', padding: '25px', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}><BookOpen color="#8b5cf6" /> الخطة والملخص</h2>
                <button onClick={() => copyToClipboard(JSON.stringify(result.plan, null, 2))} style={{ background: '#f1f5f9', border: 'none', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', display: 'flex', gap: '5px', color: '#475569' }}><Copy size={16}/> نسخ</button>
              </div>
              <h3 style={{ color: '#0ea5e9' }}>{result.plan.title}</h3>
              
              <h4 style={{ color: '#334155', marginTop: '20px' }}>🎯 أهداف الدرس:</h4>
              <ul style={{ paddingRight: '20px', color: '#475569', lineHeight: '1.8' }}>
                {result.plan.objectives?.map((obj, i) => <li key={i}>{obj}</li>)}
              </ul>

              <h4 style={{ color: '#334155', marginTop: '20px' }}>📑 ملخص الدرس:</h4>
              <p style={{ color: '#475569', lineHeight: '2', whiteSpace: 'pre-wrap' }}>{result.plan.summary}</p>
            </div>

            {/* Flashcards */}
            <div style={{ background: 'white', padding: '25px', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>🃏 البطاقات التعليمية (Flashcards)</h2>
                <button onClick={() => copyToClipboard(JSON.stringify(result.flashcards, null, 2))} style={{ background: '#f1f5f9', border: 'none', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', display: 'flex', gap: '5px', color: '#475569' }}><Copy size={16}/> نسخ JSON</button>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
                {result.flashcards?.map((card, i) => (
                  <div key={i} style={{ border: '2px solid #e2e8f0', borderRadius: '15px', padding: '15px', background: '#f8fafc' }}>
                    <div style={{ fontWeight: 'bold', color: '#0ea5e9', marginBottom: '10px' }}>الوجه الأمامي:</div>
                    <div style={{ color: '#334155', marginBottom: '15px' }}>{card.front}</div>
                    <div style={{ height: '1px', background: '#e2e8f0', margin: '10px 0' }} />
                    <div style={{ fontWeight: 'bold', color: '#f59e0b', marginBottom: '10px' }}>الوجه الخلفي:</div>
                    <div style={{ color: '#475569' }}>{card.back}</div>
                  </div>
                ))}
              </div>
              <p style={{ marginTop: '15px', fontSize: '0.9rem', color: '#64748b' }}>* يمكنك نسخ الـ JSON ولصقه مباشرة في أداة "صانع البطاقات التعليمية".</p>
            </div>

            {/* Quiz */}
            <div style={{ background: 'white', padding: '25px', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>✅ اختبار الدرس (Quiz)</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => copyToClipboard(JSON.stringify(result.quiz, null, 2))} style={{ background: '#f1f5f9', border: 'none', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', display: 'flex', gap: '5px', color: '#475569' }}><Copy size={16}/> نسخ JSON</button>
                  <button onClick={exportQuizToCSV} style={{ background: '#10b981', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', display: 'flex', gap: '5px' }}><Download size={16}/> تصدير CSV لبنك الأسئلة</button>
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {result.quiz?.map((q, i) => (
                  <div key={i} style={{ padding: '15px', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                    <h4 style={{ margin: '0 0 15px 0', color: '#1e293b' }}>{i + 1}. {q.question}</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                      {q.options?.map((opt, optIndex) => (
                        <div key={optIndex} style={{ padding: '10px', borderRadius: '8px', background: optIndex === q.correct ? '#dcfce7' : '#f8fafc', border: `1px solid ${optIndex === q.correct ? '#22c55e' : '#e2e8f0'}`, color: optIndex === q.correct ? '#166534' : '#475569', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {optIndex === q.correct && <Check size={16} color="#22c55e" />}
                          {opt}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>

      <style>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
