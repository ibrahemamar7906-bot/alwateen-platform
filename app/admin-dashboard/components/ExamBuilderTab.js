'use client'
import React, { useState } from 'react';
import { Printer, Eye, EyeOff, RotateCcw, Type, Palette, AlignRight, AlignCenter, AlignLeft, Bot, Loader2, Droplets, FileText, Plus, Minus, Edit3, Code2, Bold, Italic, Underline, Eraser, List, ListOrdered, Undo, Redo, Sparkles, Image as ImageIcon, XCircle } from 'lucide-react';
import { UNIFIED_AI_MODELS, DEFAULT_AI_MODEL } from '../../utils/aiModels';
import { supabase } from '../../../utils/supabase';

export default function ExamBuilderTab({ styles, userCredits, onCreditDeducted }) {
  const [topic, setTopic] = useState('');
  const [questionCount, setQuestionCount] = useState(10);
  const [examDuration, setExamDuration] = useState('');
  const [difficulty, setDifficulty] = useState('متوسط');
  const [examTitle, setExamTitle] = useState('اختبار تقييمي');
  const [studentName, setStudentName] = useState('');
  const [uploadedImages, setUploadedImages] = useState([]);
  const [selectedModel, setSelectedModel] = useState(DEFAULT_AI_MODEL);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedHtml, setGeneratedHtml] = useState(null);
  const [showRawHtml, setShowRawHtml] = useState(false);
  
  const [isGrayscale, setIsGrayscale] = useState(false);
  const [direction, setDirection] = useState('rtl');
  const [showWatermark, setShowWatermark] = useState(true);
  const [watermarkText, setWatermarkText] = useState('منصة الوتين التعليمية');
  const [fontSize, setFontSize] = useState(15); 

  const handleImagesUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const newImages = [];
    let loadedCount = 0;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newImages.push(reader.result);
        loadedCount++;
        if (loadedCount === files.length) {
          setUploadedImages((prev) => [...prev, ...newImages]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (indexToRemove) => {
    setUploadedImages((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleGenerateExam = async () => {
    if (!topic.trim() && uploadedImages.length === 0) return;
    setIsGenerating(true);
    
    try {
      const systemPrompt = `أنت خبير تعليمي ومصمم امتحانات محترف ومساعد ذكي في أداة [صانع ومصمم الاختبارات والامتحانات الاحترافية] في منصة الجُنيدي التعليمية (alwateen.com).
وظيفتك الأساسية: صياغة اختبار تعليمي متكامل فائق الجودة، دقيق تربوياً ولغوياً، ومطابق تماماً لنظام الامتحانات والتقييم، وجاهز للطباعة A4 بأناقة عالية.
التعليمات والمحتوى المطلوب من المستخدم:
"""
${topic || 'قم بإنشاء اختبار بناءً على الصور المرفقة'}
"""
- مستوى الصعوبة المطلوب: ${difficulty}
- زمن الاختبار المخصص: ${examDuration ? examDuration : 'غير محدد'}
- عدد الأسئلة المطلوب بدقة: ${questionCount} سؤال (مهم جداً: التزم بصياغة ${questionCount} أسئلة تماماً دون زيادة أو نقصان إلا إذا طلب المستخدم صراحة غير ذلك في تعليماته).

المطلوب:
بناءً على تعليمات المستخدم السابقة، قم بإنشاء الاختبار المطلوب. إذا طلب المستخدم أسئلة مقالية أو استخراج أو قطع قراءة (براجراف)، فقم بتنفيذ طلبه بدقة. لا تقتصر على الاختيار من متعدد إلا إذا لم يحدد المستخدم نوع الأسئلة أو طلب ذلك صراحة.

شروط الإخراج (مهم جداً):
1. قم بإرجاع كود HTML نقي فقط للاختبار (بدون ترويسة الصفحة، وبدون علامات html أو body، وبدون أي Markdown blocks).
2. اجعل اتجاه النص من اليمين لليسار (RTL) واستخدم تنسيقاً احترافياً وجذاباً للطباعة.
3. لتجنب انقسام الأسئلة في الطباعة: يجب وضع كل سؤال مستقل داخل عنصر <div class="question-block">. (ملاحظة هامة: إذا كان هناك قطعة قراءة، لا تضع القطعة والأسئلة التابعة لها في نفس الكتلة! بل ضع القطعة منفصلة بدون الكلاس، ثم ضع كل سؤال تابع لها في <div class="question-block"> مستقل لتجنب ترك مساحة بيضاء كبيرة في الطباعة).
4. الأسئلة يجب أن تكون مرقمة بخط بارز (Bold).
5. في حال وجود أسئلة اختيار من متعدد: يجب وضع الخيارات داخل قائمة <ul class="options-grid"> لكي تترتب بجانب بعضها أفقياً، مع وضع دائرة فارغة (○) بجانب كل خيار.
6. في حال وجود أسئلة مقالية أو استخراج: اترك سطوراً فارغة واضحة ليكتب الطالب عليها. (استخدم <div style={{borderBottom: '1.5px dotted #555', height: '26px', marginBottom: '8px'}}></div>). ضع سطراً واحداً فقط للإجابات القصيرة (مثل الإعراب أو الاستخراج)، وسطرتين للإجابات الطويلة.
7. في النهاية، قم بإضافة "نموذج الإجابة" النموذجي لجميع الأسئلة داخل عنصر <div class="page-break"> ليكون في صفحة مستقلة عند الطباعة.`;

      const parts = [{ text: systemPrompt }];
      
      if (uploadedImages.length > 0) {
        uploadedImages.forEach((imgBase64) => {
          const base64Data = imgBase64.split(',')[1];
          const mimeType = imgBase64.split(';')[0].split(':')[1];
          parts.push({
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          });
        });
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('يجب تسجيل الدخول لاستخدام منشئ الامتحانات الذكي.');
      }

      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          contents: [{ parts: parts }],
          generationConfig: { temperature: 0.6 },
          cost: 5,
          action: 'exam_builder'
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error?.message || 'حدث خطأ أثناء توليد الاختبار. يرجى مراجعة رصيد الكريديتس.');
      }

      if (!data || !data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
        throw new Error('تعذر قراءة محتوى الاختبار المولد.');
      }

      if (data.candidates && data.candidates[0].content.parts[0].text) {
        let aiHtmlContent = data.candidates[0].content.parts[0].text;
        aiHtmlContent = aiHtmlContent.replace(/```html\n?/g, '').replace(/```\n?/g, '');
        
        const headerHtml = `
          <div style="text-align: center; margin-bottom: 15px; border-bottom: 2px solid #1A2E86; padding-bottom: 8px; font-family: 'Tajawal', sans-serif;">
            <h1 style="color: #1A2E86; font-size: 22px; margin: 0 0 10px 0;">${examTitle || 'اختبار تقييمي'}</h1>
            <div style="display: flex; justify-content: space-between; font-size: 15px; font-weight: bold; color: #333; flex-wrap: wrap; gap: 10px;">
              <span>اسم الطالب: ${studentName ? studentName : '.........................................'}</span>
              ${examDuration ? `<span>⏱️ زمن الاختبار: ${examDuration}</span>` : ''}
              <span>الدرجة: ........ / ........</span>
            </div>
          </div>
        `;
        
        setGeneratedHtml(headerHtml + aiHtmlContent);
        if (data.remaining_credits !== undefined && onCreditDeducted) {
          onCreditDeducted(data.remaining_credits);
        }
      } else {
        throw new Error('لم يتم إرجاع أي نص من الذكاء الاصطناعي.');
      }
    } catch (error) {
      console.error("Exam generation error:", error);
      alert('خطأ أثناء إنشاء الاختبار:\n' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    if (!generatedHtml) return;
    
    // Instead of window.open (which triggers an external browser on mobile),
    // create a hidden iframe to print directly from within the app.
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);
    
    const doc = iframe.contentWindow || iframe.contentDocument;
    const documentToWrite = doc.document || doc;
    
    documentToWrite.open();
    documentToWrite.write(`
      <!DOCTYPE html>
      <html dir="${direction}">
      <head>
        <title>${examTitle}</title>
        <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap" rel="stylesheet">
        <style>
          @page { size: A4; margin: 10mm; }
          body { 
            font-family: 'Tajawal', sans-serif; 
            font-size: ${fontSize}px;
            color: black;
            ${isGrayscale ? 'filter: grayscale(100%);' : ''}
            position: relative;
            line-height: 1.35;
          }
          ${showWatermark ? `
          body::before {
            content: '${watermarkText}';
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 6rem;
            color: rgba(0, 0, 0, 0.05);
            z-index: -1;
            white-space: nowrap;
            pointer-events: none;
          }
          ` : ''}
          h1, h2, h3, h4, h5, p { margin: 4px 0; }
          .page-break { page-break-before: always; }
          .question-block, .options-grid li, .question { 
            page-break-inside: avoid; 
            display: block; 
            width: 100%; 
            margin-bottom: 6px; 
          }
          .question-block p { margin: 2px 0; font-weight: 600; font-size: 1.05em; }
          
          /* CSS Grid for side-by-side options */
          .options-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 4px 15px;
            margin-top: 4px;
            margin-bottom: 4px;
            padding-right: 10px;
            list-style-type: none;
          }
          .options-grid li { 
            margin-bottom: 0; 
            padding: 4px;
            border-radius: 4px;
          }
          
          ul:not(.options-grid) { margin-top: 2px; padding-right: 20px; margin-bottom: 2px; }
          ul:not(.options-grid) li { margin-bottom: 2px; }
          
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        ${generatedHtml}
      </body>
      </html>
    `);
    documentToWrite.close();
    
    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      
      // Clean up iframe after printing
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 5000);
    }, 500);
  };

  const handleReset = () => {
    if (confirm('هل أنت متأكد من مسح الاختبار والبدء من جديد؟')) {
      setGeneratedHtml(null);
      setTopic('');
      setUploadedImages([]);
    }
  };

  return (
    <div style={{ fontFamily: 'Tajawal', direction: 'rtl', padding: '15px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <h2 style={{ color: '#1A2E86', margin: 0, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.4rem' }}>
          <FileText size={24} /> منشئ وتنسيق الامتحانات التفاعلية
        </h2>
        {false && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f5f3ff', border: '1.5px solid #ddd6fe', color: '#6d28d9', padding: '6px 14px', borderRadius: '20px', fontWeight: 800, fontSize: '0.9rem' }}>
            <Sparkles size={16} color="#8b5cf6" />
            <span>رصيدك: <strong>{userCredits}</strong> كريديت 💎</span>
          </div>
        )}
      </div>

      {!generatedHtml ? (
        <div style={{ background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', maxWidth: '800px', margin: '0 auto' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', marginBottom: '10px', color: '#1e293b' }}>
                <Bot size={20} color="#1A2E86" /> موضوع الاختبار أو المحتوى والتعليمات:
              </label>
              
              <textarea 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="اكتب الدرس أو الموضوع هنا، أو اطلب نوعاً مخصصاً (مثال: قم بإنشاء قطعة قراءة عن الحملة الفرنسية وضع عليها 3 أسئلة استخراج و سؤالين مقاليين)..."
                style={{
                  width: '100%', height: '120px', padding: '15px', borderRadius: '8px', border: '1px solid #cbd5e1',
                  fontFamily: 'inherit', fontSize: '15px', resize: 'vertical', outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#1A2E86'}
                onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
              />

              <div style={{ marginTop: '15px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', marginBottom: '10px', color: '#1e293b' }}>
                  <ImageIcon size={18} color="#3b82f6" /> إضافة صور من الدرس (اختياري):
                </label>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                  <div style={{ position: 'relative', overflow: 'hidden', display: 'inline-block' }}>
                    <button style={{ background: '#eff6ff', color: '#3b82f6', border: '1px dashed #3b82f6', padding: '10px 15px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Plus size={16} /> رفع صور
                    </button>
                    <input 
                      type="file" 
                      accept="image/*" 
                      multiple
                      onChange={handleImagesUpload} 
                      style={{ position: 'absolute', top: 0, left: 0, opacity: 0, cursor: 'pointer', height: '100%', width: '100%' }}
                    />
                  </div>

                  {uploadedImages.map((img, idx) => (
                    <div key={idx} style={{ position: 'relative', display: 'inline-block', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '2px', background: 'white' }}>
                      <img src={img} alt="Uploaded" style={{ height: '40px', width: 'auto', borderRadius: '4px', display: 'block' }} />
                      <button 
                        onClick={() => removeImage(idx)} 
                        style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'white', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0, borderRadius: '50%', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                      >
                        <XCircle size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#475569', fontSize: '0.9rem' }}>عنوان الاختبار:</label>
                <input 
                  type="text" value={examTitle} onChange={(e) => setExamTitle(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontFamily: 'inherit', outline: 'none' }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#475569', fontSize: '0.9rem' }}>اسم الطالب (اختياري):</label>
                <input 
                  type="text" value={studentName} onChange={(e) => setStudentName(e.target.value)}
                  placeholder="اتركه فارغاً لتركه للطالب"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontFamily: 'inherit', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#475569', fontSize: '0.9rem' }}>⏱️ زمن الاختبار (اختياري):</label>
                <input 
                  type="text" 
                  value={examDuration} 
                  onChange={(e) => setExamDuration(e.target.value)}
                  placeholder="مثال: 30 دقيقة / ساعة ونصف"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontFamily: 'inherit', outline: 'none' }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#475569', fontSize: '0.9rem' }}>مستوى الصعوبة:</label>
                <select 
                  value={difficulty} onChange={(e) => setDifficulty(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontFamily: 'inherit', outline: 'none' }}
                >
                  <option value="سهل">سهل</option>
                  <option value="متوسط">متوسط</option>
                  <option value="صعب">صعب</option>
                  <option value="متدرج">متدرج (من السهل للصعب)</option>
                </select>
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontWeight: 'bold', color: '#334155', fontSize: '0.9rem' }}>عدد الأسئلة المطلوب:</label>
                <span style={{ fontSize: '0.85rem', color: '#1A2E86', fontWeight: 'bold', background: '#ecfdf5', padding: '2px 8px', borderRadius: '6px' }}>{questionCount} سؤال</span>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <input 
                  type="number" 
                  min="1" 
                  max="100" 
                  value={questionCount} 
                  onChange={(e) => setQuestionCount(Math.max(1, parseInt(e.target.value) || 1))}
                  style={{ width: '90px', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #1A2E86', fontFamily: 'inherit', outline: 'none', fontWeight: 'bold', fontSize: '1rem', textAlign: 'center', background: 'white' }}
                />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {[5, 10, 15, 20, 25, 30, 40, 50].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setQuestionCount(num)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '7px',
                        fontSize: '0.82rem',
                        fontWeight: 'bold',
                        border: questionCount === num ? '1.5px solid #1A2E86' : '1px solid #cbd5e1',
                        background: questionCount === num ? '#1A2E86' : 'white',
                        color: questionCount === num ? 'white' : '#475569',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      {num} أسئلة
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button 
              onClick={handleGenerateExam} disabled={isGenerating || (!topic.trim() && uploadedImages.length === 0)}
              style={{
                background: '#1A2E86', color: 'white', padding: '15px', borderRadius: '8px', border: 'none',
                fontWeight: 'bold', fontSize: '1rem', cursor: (isGenerating || (!topic.trim() && uploadedImages.length === 0)) ? 'not-allowed' : 'pointer',
                display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '10px',
                opacity: (isGenerating || (!topic.trim() && uploadedImages.length === 0)) ? 0.7 : 1
              }}
            >
              {isGenerating ? <Loader2 size={22} className="animate-spin" /> : <Sparkles size={22} />}
              {isGenerating ? 'جاري بناء الاختبار...' : 'توليد الاختبار الآن (5 كريديت 💎)'}
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ 
            background: 'white', padding: '15px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', zIndex: 100
          }}>
            
            <button onClick={handlePrint} style={{ background: '#1A2E86', color: 'white', padding: '10px 15px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
              <Printer size={16} /> طباعة / تصدير PDF
            </button>
            
            <button onClick={handleReset} style={{ background: '#fee2e2', color: '#ef4444', padding: '10px 15px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
              <RotateCcw size={16} /> اختبار جديد
            </button>

            <div style={{ width: '1px', height: '30px', background: '#e2e8f0', display: 'none' /* hidden on mobile mostly */ }}></div>

            {!showRawHtml && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#f8fafc', padding: '5px 8px', borderRadius: '8px', border: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
                <button onClick={() => document.execCommand('bold', false, null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }} title="عريض"><Bold size={16} /></button>
                <button onClick={() => document.execCommand('italic', false, null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }} title="مائل"><Italic size={16} /></button>
                <button onClick={() => document.execCommand('underline', false, null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }} title="سطر"><Underline size={16} /></button>
                <div style={{ width: '1px', height: '15px', background: '#cbd5e1' }}></div>
                <button onClick={() => document.execCommand('justifyRight', false, null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }} title="يمين"><AlignRight size={16} /></button>
                <button onClick={() => document.execCommand('justifyCenter', false, null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }} title="وسط"><AlignCenter size={16} /></button>
                <button onClick={() => document.execCommand('justifyLeft', false, null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }} title="يسار"><AlignLeft size={16} /></button>
                <div style={{ width: '1px', height: '15px', background: '#cbd5e1' }}></div>
                <button onClick={() => setFontSize(f => Math.min(f + 1, 24))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }} title="تكبير الخط"><Plus size={16} /></button>
                <button onClick={() => setFontSize(f => Math.max(f - 1, 12))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }} title="تصغير الخط"><Minus size={16} /></button>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', width: '100%' }}>
              <div style={{ display: 'flex', border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden', flex: '1 1 auto' }}>
                <button onClick={() => setShowWatermark(!showWatermark)} style={{ padding: '8px 10px', background: showWatermark ? '#eff6ff' : '#f1f5f9', color: showWatermark ? '#3b82f6' : '#64748b', border: 'none', cursor: 'pointer', display: 'flex', gap: '5px', alignItems: 'center', fontSize: '0.85rem', flexShrink: 0 }}>
                  <Droplets size={14} /> علامة مائية
                </button>
                {showWatermark && (
                  <input 
                    type="text" 
                    value={watermarkText} 
                    onChange={(e) => setWatermarkText(e.target.value)} 
                    placeholder="نص العلامة..."
                    style={{ border: 'none', outline: 'none', padding: '0 10px', width: '100%', minWidth: '100px', background: '#eff6ff', color: '#1e293b', fontSize: '13px' }}
                  />
                )}
              </div>
              
              <button onClick={() => setIsGrayscale(!isGrayscale)} style={{ padding: '8px 10px', background: isGrayscale ? '#f1f5f9' : '#fff', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', display: 'flex', gap: '5px', alignItems: 'center', fontSize: '0.85rem' }}>
                <Palette size={14} /> {isGrayscale ? 'ملون' : 'أبيض وأسود'}
              </button>
              <button onClick={() => setShowRawHtml(!showRawHtml)} style={{ padding: '8px 10px', background: showRawHtml ? '#1e293b' : '#fff', color: showRawHtml ? 'white' : '#475569', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', display: 'flex', gap: '5px', alignItems: 'center', fontSize: '0.85rem' }}>
                <Code2 size={14} /> {showRawHtml ? 'المرئي' : 'HTML'}
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'center', background: '#f1f5f9', padding: '15px 5px', borderRadius: '12px', overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' }}>
            {showRawHtml ? (
              <textarea
                value={generatedHtml}
                onChange={(e) => setGeneratedHtml(e.target.value)}
                style={{
                  width: '100%', minWidth: '300px', maxWidth: '900px', minHeight: '600px', padding: '20px', fontFamily: 'monospace',
                  direction: 'ltr', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#1e293b', color: '#e2e8f0', outline: 'none'
                }}
              />
            ) : (
              <div 
                style={{ 
                  display: 'inline-block', textAlign: direction === 'rtl' ? 'right' : 'left',
                  width: '210mm', minWidth: '210mm', minHeight: '297mm', background: 'white',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', padding: '10mm',
                  direction: direction, fontSize: `${fontSize}px`, position: 'relative', overflow: 'hidden',
                  filter: isGrayscale ? 'grayscale(100%)' : 'none',
                  lineHeight: '1.35'
                }}
              >
                <style dangerouslySetInnerHTML={{__html: `
                  .options-grid {
                    display: grid !important;
                    grid-template-columns: 1fr 1fr !important;
                    gap: 4px 15px !important;
                    margin-top: 4px !important;
                    margin-bottom: 4px !important;
                    padding-right: 10px !important;
                    list-style-type: none !important;
                  }
                  .options-grid li { 
                    margin-bottom: 0 !important; 
                  }
                  .question-block p { margin: 2px 0 !important; font-weight: 600 !important; font-size: 1.05em !important; }
                  h1, h2, h3, h4, h5, p { margin: 4px 0 !important; }
                  ul:not(.options-grid) { margin-top: 2px !important; margin-bottom: 2px !important; }
                  ul:not(.options-grid) li { margin-bottom: 2px !important; }
                `}} />
                
                {showWatermark && (
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-45deg)', fontSize: '5rem', color: 'rgba(0, 0, 0, 0.05)', zIndex: 0, whiteSpace: 'nowrap', pointerEvents: 'none', userSelect: 'none' }}>
                    {watermarkText}
                  </div>
                )}
                <div 
                  contentEditable={true}
                  dangerouslySetInnerHTML={{ __html: generatedHtml }}
                  onBlur={(e) => setGeneratedHtml(e.currentTarget.innerHTML)}
                  style={{ position: 'relative', zIndex: 1, outline: 'none', minHeight: '100%' }}
                />
              </div>
            )}
          </div>
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            .animate-spin { animation: spin 1s linear infinite; }
          `}} />
        </div>
      )}
    </div>
  );
}

