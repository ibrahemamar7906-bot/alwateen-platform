'use client'
import { useState } from 'react'
import { Bot, Loader2 } from 'lucide-react'
import { UNIFIED_AI_MODELS, DEFAULT_AI_MODEL } from '../../../utils/aiModels'
import { supabase } from '../../../utils/supabase'

export default function LessonsTab({
  lessons,
  courses,
  lessonForm,
  setLessonForm,
  actionMessage,
  handleAddLesson,
  ALL_STAGES,
  newAttachment,
  setNewAttachment,
  addAttachment,
  removeAttachment,
  downloadCSVTemplate,
  handleCSVUpload,
  newQuestion,
  setNewQuestion,
  updateOption,
  addQuestion,
  removeQuestion,
  setEditingLesson,
  handleDeleteLesson,
  styles
}) {
  const [showAiModal, setShowAiModal] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiModel, setAiModel] = useState(DEFAULT_AI_MODEL)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiNumQuestions, setAiNumQuestions] = useState(5)
  const [aiDifficulty, setAiDifficulty] = useState('متوسط')

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return
    setAiLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('يجب تسجيل الدخول لاستخدام ميزات الذكاء الاصطناعي.');
      }
      
      const systemPrompt = `أنت خبير تربوي ومساعد ذكي متخصص في أداة [صياغة أسئلة التدريب والتقييم للدروس المرئية] في منصة الجُنيدي التعليمية (alwateen.com).
مهمتك: قراءة نص الدرس وصياغة أسئلة تفاعلية ذكية لقياس فهم واستيعاب الطلاب للدرس.
عدد الأسئلة: ` + aiNumQuestions + `
مستوى الصعوبة: ` + aiDifficulty + `

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

      const url = `/api/gemini`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt + '\n\nالنص:\n' + aiPrompt }] }],
          model: aiModel,
          generationConfig: { temperature: 0.2 },
          action: 'lesson_quiz_generator'
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'خطأ في توليد الأسئلة');
      
      let resultText = data.candidates[0].content.parts[0].text;
      resultText = resultText.replace(/```csv/gi, '').replace(/```/g, '').trim();

      // Parse CSV
      const lines = resultText.split('\n');
      const newQuestions = [];
      for(let i=0; i<lines.length; i++) {
        const line = lines[i].trim();
        if(!line) continue;
        
        // Handle quotes properly
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
        alert(`تم توليد وإضافة ${newQuestions.length} سؤال بنجاح!`);
        setShowAiModal(false);
        setAiPrompt('');
      } else {
        alert('لم يتم العثور على أسئلة صحيحة في الرد الذكي.');
      }
    } catch (err) {
      alert('حدث خطأ أثناء التوليد: ' + err.message)
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2>إضافة درس متكامل (فيديو + ملحقات + اختبار)</h2>
      </div>
      <form onSubmit={handleAddLesson} style={{background: 'white', padding: '20px', borderRadius: '15px', marginBottom: '30px', display: 'flex', flexDirection: 'column', gap: '20px'}}>
        {actionMessage && <div style={{padding: '10px', background: '#e9ecef', borderRadius: '5px', textAlign: 'center'}}>{actionMessage}</div>}
        
        {/* 1. Basic Info */}
        <div style={{border: '1px solid #eee', padding: '15px', borderRadius: '10px'}}>
          <h3 style={{marginBottom: '15px', borderBottom: '2px solid #20c997', display: 'inline-block'}}>1. البيانات الأساسية للفيديو</h3>
          <div style={{display: 'flex', gap: '15px', marginBottom: '15px'}}>
            <div style={{flex: 1}}>
              <label>عنوان الدرس</label>
              <input type="text" required value={lessonForm.title} onChange={e => setLessonForm({...lessonForm, title: e.target.value})} style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px'}}/>
            </div>
            <div style={{flex: 1}}>
              <label>الكورس التابع له (اختياري)</label>
              <select value={lessonForm.course_id} onChange={e => setLessonForm({...lessonForm, course_id: e.target.value})} style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px'}}>
                <option value="">-- بدون كورس (درس مستقل) --</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
            {!lessonForm.course_id && (
              <div style={{flex: 1}}>
                <label>المرحلة الدراسية (مطلوب إذا لم تختر كورس)</label>
                <select required={!lessonForm.course_id} value={lessonForm.stage} onChange={e => setLessonForm({...lessonForm, stage: e.target.value})} style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px'}}>
                  <option value="">-- اختر المرحلة --</option>
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
            )}
          </div>

          <div style={{marginBottom: '15px'}}>
            <label>المراحل المسموح لها بمشاهدة الحصة (اختياري، اتركها فارغة لتكون متاحة لكل طلاب الكورس)</label>
            <div style={{display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '5px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', background: '#fafafa'}}>
              {ALL_STAGES.map(stage => (
                <label key={stage.id} style={{display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontSize: '0.9rem', width: '30%', minWidth: '150px'}}>
                  <input 
                    type="checkbox" 
                    checked={(lessonForm.allowed_stages || []).includes(stage.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setLessonForm({...lessonForm, allowed_stages: [...(lessonForm.allowed_stages || []), stage.id]})
                      } else {
                        setLessonForm({...lessonForm, allowed_stages: (lessonForm.allowed_stages || []).filter(s => s !== stage.id)})
                      }
                    }}
                  />
                  {stage.label}
                </label>
              ))}
            </div>
          </div>

          <div style={{marginBottom: '15px'}}>
            <label>وصف قصير</label>
            <input type="text" value={lessonForm.description} onChange={e => setLessonForm({...lessonForm, description: e.target.value})} style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px'}}/>
          </div>

          <div style={{display: 'flex', gap: '15px'}}>
            <div style={{flex: 1}}>
              <label>رابط الفيديو (Google Drive) - اختياري</label>
              <input type="text" value={lessonForm.video_url} onChange={e => setLessonForm({...lessonForm, video_url: e.target.value})} style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px'}} dir="ltr" placeholder="رابط درايف"/>
            </div>
            <div style={{flex: 1}}>
              <label>رابط العرض التفاعلي (Canva) - اختياري</label>
              <input type="text" value={lessonForm.canva_url} onChange={e => setLessonForm({...lessonForm, canva_url: e.target.value})} style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px'}} dir="ltr" placeholder="رابط عرض كانفا"/>
            </div>
            <div style={{flex: 1}}>
              <label>نقاط الإنجاز للطالب 🌟</label>
              <input type="number" required value={lessonForm.points_reward} onChange={e => setLessonForm({...lessonForm, points_reward: e.target.value})} style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px'}}/>
            </div>
          </div>

          <div style={{marginTop: '15px'}}>
            <label style={{display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer'}}>
              <input type="checkbox" checked={lessonForm.is_free} onChange={e => setLessonForm({...lessonForm, is_free: e.target.checked})}/>
              هذا الدرس مجاني (متاح للجميع بدون اشتراك مفعل)
            </label>
          </div>
        </div>

        {/* 2. Attachments */}
        <div style={{border: '1px solid #eee', padding: '15px', borderRadius: '10px'}}>
          <h3 style={{marginBottom: '15px', borderBottom: '2px solid #2563eb', display: 'inline-block'}}>2. روابط الملحقات (مذكرات PDF، واجبات) (اختياري)</h3>
          
          <ul style={{listStyle: 'none', padding: 0, marginBottom: '15px'}}>
            {lessonForm.attachments.map((att, idx) => (
              <li key={idx} style={{display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#f8f9fa', marginBottom: '5px', borderRadius: '5px'}}>
                <span>📄 {att.name}</span>
                <button type="button" onClick={() => removeAttachment(idx)} style={{background: 'none', border: 'none', color: 'red', cursor: 'pointer'}}>حذف 🗑</button>
              </li>
            ))}
          </ul>

          <div style={{display: 'flex', gap: '10px', alignItems: 'flex-end'}}>
            <div style={{flex: 1}}>
              <label>اسم الملف (مثال: مذكرة الدرس)</label>
              <input type="text" value={newAttachment.name} onChange={e => setNewAttachment({...newAttachment, name: e.target.value})} style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '5px'}} />
            </div>
            <div style={{flex: 2}}>
              <label>رابط الملف (رابط درايف للمذكرة)</label>
              <input type="text" value={newAttachment.url} onChange={e => setNewAttachment({...newAttachment, url: e.target.value})} style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '5px'}} dir="ltr" />
            </div>
            <button type="button" onClick={addAttachment} style={{padding: '8px 15px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'}}>إضافة ملف</button>
          </div>
        </div>

        {/* 3. Interactive Quiz */}
        <div style={{border: '1px solid #eee', padding: '15px', borderRadius: '10px'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '2px solid #9333ea', paddingBottom: '10px', flexWrap: 'wrap', gap: '10px'}}>
            <h3 style={{margin: 0}}>3. اختبار إلكتروني تفاعلي للدرس (اختياري)</h3>
            
            <div style={{display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap'}}>
              <select 
                value={lessonForm.quiz_theme} 
                onChange={e => setLessonForm({...lessonForm, quiz_theme: e.target.value})}
                style={{padding: '5px 10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '0.9rem'}}
              >
                <option value="classic">كلاسيكي هادئ</option>
                <option value="gamified">ألعاب وتفاعلي (صغار)</option>
              </select>
              
              <button type="button" onClick={downloadCSVTemplate} style={{background: '#3b82f6', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontSize: '0.9rem'}}>تحميل نموذج CSV 📥</button>
              
              <label style={{background: '#10b981', color: 'white', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontSize: '0.9rem', border: 'none', display: 'flex', alignItems: 'center'}}>
                رفع أسئلة CSV 📤
                <input type="file" accept=".csv" onChange={handleCSVUpload} style={{display: 'none'}} />
              </label>

              <button 
                type="button" 
                style={{display: 'none'}} 
                style={{background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px'}}
              >
                <Bot size={16} /> توليد ذكي 🤖
              </button>
            </div>
          </div>
          
          <ul style={{listStyle: 'none', padding: 0, marginBottom: '15px'}}>
            {lessonForm.quiz_data.map((q, idx) => (
              <li key={idx} style={{padding: '10px', background: '#f8f9fa', marginBottom: '10px', borderRadius: '5px', position: 'relative'}}>
                <strong>س {idx + 1}: {q.text}</strong>
                <ul style={{marginTop: '5px', paddingRight: '20px'}}>
                  {q.options.map((opt, i) => (
                    <li key={i} style={{color: opt === q.correctAnswer ? 'green' : 'black'}}>{opt} {opt === q.correctAnswer && '✅'}</li>
                  ))}
                </ul>
                {q.explanation && <div style={{marginTop: '10px', fontSize: '0.9rem', color: '#666', background: '#e2e8f0', padding: '5px', borderRadius: '5px'}}><strong>التعليل:</strong> {q.explanation}</div>}
                <button type="button" onClick={() => removeQuestion(idx)} style={{position: 'absolute', top: '10px', left: '10px', background: 'none', border: 'none', color: 'red', cursor: 'pointer'}}>حذف السؤال 🗑</button>
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
              <button type="button" onClick={addQuestion} style={{padding: '8px 15px', background: '#9333ea', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', height: 'fit-content'}}>إضافة السؤال</button>
            </div>
          </div>
        </div>

        <button type="submit" style={{padding: '15px', background: '#20c997', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem'}}>
          🚀 نشر الدرس في المنصة
        </button>
      </form>

      <div className={styles.sectionHeader}>
        <h2>الدروس المرفوعة مسبقاً</h2>
      </div>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>العنوان</th>
              <th>المرحلة</th>
              <th>الملحقات/الاختبار</th>
              <th>الحالة</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {lessons.map(l => (
              <tr key={l.id}>
                <td>{l.title}</td>
                <td>{l.stage}</td>
                <td>
                  {l.attachments?.length > 0 ? `📁 ${l.attachments.length}` : ''} 
                  {' '}
                  {l.quiz_data?.length > 0 ? `📝 ${l.quiz_data.length}` : ''}
                </td>
                <td>{l.is_free ? 'مجاني' : 'مدفوع'}</td>
                <td>
                  <div className={styles.actions} style={{display: 'flex', gap: '5px', alignItems: 'center'}}>
                    <button className={`${styles.actionBtn} ${styles.edit}`} onClick={() => setEditingLesson(l)}>تعديل ✏️</button>
                    <button className={`${styles.actionBtn} ${styles.delete}`} onClick={() => handleDeleteLesson(l.id)}>حذف 🗑</button>
                  </div>
                </td>
              </tr>
            ))}
            {lessons.length === 0 && (
              <tr>
                <td colSpan="5" className={styles.emptyState}>لا توجد دروس مرفوعة بعد</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {false && (
        <div style={{position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999}}>
          <div style={{background: 'white', padding: '25px', borderRadius: '15px', width: '90%', maxWidth: '600px'}}>
            <h3 style={{marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#6d28d9'}}>
              <Bot /> توليد الأسئلة بالذكاء الاصطناعي
            </h3>
            <p style={{color: '#666', fontSize: '0.9rem'}}>ألصق قطعة القراءة أو الدرس هنا، وسيقوم الذكاء الاصطناعي بصياغة أسئلة تفاعلية.</p>
            
            <textarea 
              rows={6}
              value={aiPrompt}
              onChange={e => setAiPrompt(e.target.value)}
              placeholder="ألصق النص هنا..."
              style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', marginTop: '10px'}}
            />

            <div style={{display: 'flex', gap: '15px', marginTop: '15px', flexWrap: 'wrap'}}>
              <div style={{flex: 1, minWidth: '110px'}}>
                <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem'}}>عدد الأسئلة</label>
                <select value={aiNumQuestions} onChange={e => setAiNumQuestions(e.target.value)} style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '5px'}}>
                  <option value={3}>3 أسئلة</option>
                  <option value={5}>5 أسئلة</option>
                  <option value={10}>10 أسئلة</option>
                </select>
              </div>
              <div style={{flex: 1, minWidth: '110px'}}>
                <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem'}}>مستوى الصعوبة</label>
                <select value={aiDifficulty} onChange={e => setAiDifficulty(e.target.value)} style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '5px'}}>
                  <option value="سهل">سهل</option>
                  <option value="متوسط">متوسط</option>
                  <option value="صعب">صعب</option>
                </select>
              </div>
              <div style={{flex: 1.5, minWidth: '180px'}}>
                <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem', color: '#6d28d9'}}>نموذج الذكاء الاصطناعي</label>
                <select value={aiModel} onChange={e => setAiModel(e.target.value)} style={{width: '100%', padding: '8px', border: '1px solid #c4b5fd', borderRadius: '5px', background: 'white', fontWeight: 'bold', color: '#6d28d9'}}>
                  {UNIFIED_AI_MODELS.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px'}}>
              <button type="button" onClick={() => setShowAiModal(false)} style={{padding: '8px 15px', border: 'none', background: '#eee', borderRadius: '5px', cursor: 'pointer'}}>إلغاء</button>
              <button 
                type="button" 
                onClick={handleAiGenerate}
                disabled={aiLoading}
                style={{padding: '8px 20px', border: 'none', background: '#6d28d9', color: 'white', borderRadius: '5px', cursor: aiLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px'}}
              >
                {aiLoading ? <><Loader2 size={16} style={{animation: 'spin 1s linear infinite'}} /> جاري التوليد...</> : 'توليد الأسئلة ✨'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
