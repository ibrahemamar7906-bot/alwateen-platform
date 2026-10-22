import React, { useState } from 'react';
import { X, Network, Bot, Sparkles, Loader2, FileDown, Upload, FileText, Image as ImageIcon, Trash2 } from 'lucide-react';
import { UNIFIED_AI_MODELS, DEFAULT_AI_MODEL } from '../../utils/aiModels';
import { supabase } from '../../../utils/supabase';

const THEMES = [
  { value: 'blue', label: '🔵 أزرق' },
  { value: 'green', label: '🟢 أخضر' },
  { value: 'red', label: '🔴 أحمر' },
  { value: 'orange', label: '🟠 برتقالي' },
  { value: 'purple', label: '🟣 بنفسجي' },
  { value: 'dark', label: '⚫ داكن' },
  { value: 'sunset', label: '🌅 غروب' },
  { value: 'ocean', label: '🌊 محيط' }
];

const MindMapImportModal = ({ isAdmin, isActive, onClose, onImport }) => {
  const [text, setText] = useState('');
  const [theme, setTheme] = useState('blue');
  const [isAiMode, setIsAiMode] = useState(true);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiModel, setAiModel] = useState(DEFAULT_AI_MODEL);
  const [uploadedImages, setUploadedImages] = useState([]);

  if (!isActive) return null;

  const insertTab = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      setText(text.substring(0, start) + '\t' + text.substring(end));
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 1;
      }, 0);
    }
  };

  const handleImport = () => {
    if (text.trim()) {
      onImport(text, theme);
      onClose();
    }
  };

  const processImageFile = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new window.Image();
        img.onload = () => {
          const maxDim = 2000;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            const mime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
            const compressedDataUrl = canvas.toDataURL(mime, 0.88);
            const base64Data = compressedDataUrl.split(',')[1];
            resolve({
              data: base64Data,
              mimeType: mime,
              preview: compressedDataUrl,
              name: file.name
            });
          } else {
            const fullDataUrl = ev.target.result;
            const base64Data = fullDataUrl.split(',')[1];
            resolve({
              data: base64Data,
              mimeType: file.type || 'image/jpeg',
              preview: fullDataUrl,
              name: file.name
            });
          }
        };
        img.onerror = () => {
          const fullDataUrl = ev.target.result;
          const base64Data = fullDataUrl.split(',')[1];
          resolve({
            data: base64Data,
            mimeType: file.type || 'image/jpeg',
            preview: fullDataUrl,
            name: file.name
          });
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handlePaste = async (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    const imgFiles = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].type && items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) imgFiles.push(file);
      }
    }
    if (imgFiles.length > 0) {
      e.preventDefault();
      const processed = await Promise.all(imgFiles.map(processImageFile));
      setUploadedImages(prev => [...prev, ...processed]);
    }
  };

  const handleFileUpload = async (e) => {
    const fileList = Array.from(e.target.files || []);
    if (fileList.length === 0) return;

    const imageFiles = fileList.filter(f => f.type && f.type.startsWith('image/'));
    const docFiles = fileList.filter(f => !f.type || !f.type.startsWith('image/'));

    if (imageFiles.length > 0) {
      setIsAiMode(true);
      const processed = await Promise.all(imageFiles.map(processImageFile));
      setUploadedImages(prev => [...prev, ...processed]);
    }

    if (docFiles.length > 0) {
      const file = docFiles[0];
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        if (typeof window !== 'undefined' && !window.pdfjsLib) {
          alert('مكتبة معالجة PDF جاري تحميلها، يرجى إعادة المحاولة بعد ثوانٍ معدودة.');
          e.target.value = '';
          return;
        }
        setAiLoading(true);
        try {
          const reader = new FileReader();
          reader.onload = async (ev) => {
            try {
              const typedarray = new Uint8Array(ev.target.result);
              const pdf = await window.pdfjsLib.getDocument(typedarray).promise;
              let extractedText = '';
              const maxPages = Math.min(pdf.numPages, 10);
              for (let i = 1; i <= maxPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageStr = textContent.items.map(item => item.str).join(' ');
                extractedText += pageStr + '\n';
              }
              const clean = extractedText.trim();
              if (clean) {
                setAiPrompt(prev => prev ? prev + '\n\n' + clean.slice(0, 6000) : clean.slice(0, 6000));
                setText(clean.slice(0, 6000));
              } else {
                alert('لم نتمكن من استخراج نصوص واضحة من هذا الـ PDF (ربما ملف ممسوح ضوئياً كصور).');
              }
            } catch (err) {
              alert('حدث خطأ أثناء استخراج النص من ملف PDF: ' + err.message);
            } finally {
              setAiLoading(false);
            }
          };
          reader.readAsArrayBuffer(file);
        } catch (err) {
          setAiLoading(false);
          alert('تعذر فتح الملف.');
        }
      } else {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const content = (ev.target.result || '').toString();
          setAiPrompt(prev => prev ? prev + '\n\n' + content.slice(0, 6000) : content.slice(0, 6000));
          setText(content.slice(0, 6000));
        };
        reader.readAsText(file, 'utf-8');
      }
    }
    e.target.value = '';
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim() && uploadedImages.length === 0) return;
    setAiLoading(true);
    try {
      const systemPrompt = `أنت خبير تعليمي ومصمم خرائط ذهنية في أداة [مصمم الخرائط الذهنية التفاعلية للسبورة الذكية] في منصة الجُنيدي التعليمية.
مهمتك: تلخيص وتنظيم الموضوع المعطى في هيكل شجري وخريطة ذهنية واضحة ومترابطة منطقياً تسهل الاستيعاب والحفظ وتساعد المعلم في الشرح على السبورة.
يجب أن يكون الناتج نصياً فقط ومنسقاً باستخدام مسافات بادئة (Tabs).
لا تستخدم رموز مثل (*) أو شرطات (-). استخدم فقط Tabs لتوضيح التدرج والتفرعات.

مثال للناتج المطلوب:
الفكرة الرئيسية
\tفرع رئيسي 1
\t\tنقطة فرعية 1
\t\tنقطة فرعية 2
\tفرع رئيسي 2
\t\tنقطة فرعية 3

لا تكتب أي مقدمات أو شروحات إضافية وبدون أي علامات markdown. أعد النص مباشرة.`;

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
        throw new Error('يرجى التأكد من تسجيل الدخول لحسابك لتفعيل التوليد بالذكاء الاصطناعي (أو تحديث الصفحة إذا انتهت الجلسة).');
      }

      const parts = [];

      let promptWithContext = systemPrompt;
      if (uploadedImages.length > 0) {
        promptWithContext += `\n\n[إرشاد إضافي مهم لقراءة الصور والمخططات]:
تم إرفاق عدد (${uploadedImages.length}) من الصور (صفحات كتاب مدرسي، ملخصات، مذكرات، رسومات توضيحية، أو أسئلة).
قم بفحص وقراءة كل ما تحتويه الصور بدقة بالغة واستخراج جميع المفاهيم الأساسية والتفريعات الهامة، ثم صياغتها بالكامل في هيكل الخريطة الذهنية المطلوب بنظام الـ Tabs دون مقدمات أو لواحق.`;
      }

      if (aiPrompt.trim()) {
        promptWithContext += '\n\nالموضوع أو توجيهات المعلم الإضافية:\n' + aiPrompt.trim();
      } else if (uploadedImages.length > 0) {
        promptWithContext += '\n\nالموضوع: استخرج ولخص محتوى الصور المرفقة بالكامل في هيكل شجري وخريطة ذهنية واضحة ومترابطة.';
      }

      parts.push({ text: promptWithContext });

      if (uploadedImages.length > 0) {
        uploadedImages.forEach(img => {
          parts.push({
            inlineData: {
              mimeType: img.mimeType,
              data: img.data
            }
          });
        });
      }

      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          contents: [{ parts }],
          model: aiModel,
          generationConfig: { temperature: 0.2 },
          action: 'whiteboard_mindmap'
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        if (res.status === 401) {
          throw new Error('انتهت جلسة تسجيل الدخول. يرجى تحديث الصفحة أو تسجيل الدخول من جديد.');
        }
        throw new Error(errorData.error?.message || 'فشل الاتصال بخوادم الذكاء الاصطناعي.');
      }
      
      const data = await res.json();
      let resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      resultText = resultText.replace(/```text/g, '').replace(/```/g, '').trim();

      setText(resultText);
      setIsAiMode(false);
    } catch (error) {
      alert('خطأ أثناء توليد الخريطة: ' + error.message);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 10000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(4px)', fontFamily: 'Tajawal', direction: 'rtl', padding: '16px'
    }}>
      <div style={{
        background: 'white', padding: '24px', borderRadius: '20px', width: '100%', maxWidth: '650px',
        maxHeight: '92vh', overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)', position: 'relative'
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: '15px', left: '15px', background: '#fee2e2', border: 'none',
          cursor: 'pointer', color: '#ef4444', borderRadius: '8px', padding: '6px'
        }}><X size={20} /></button>

        <h3 style={{
          color: '#3b82f6', marginBottom: '12px', fontSize: '1.4rem', textAlign: 'center',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
        }}>
          <Network size={26} /> مصمم الخرائط الذهنية
        </h3>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '16px' }}>
          <button 
            type="button"
            onClick={() => setIsAiMode(false)}
            style={{ padding: '8px 18px', borderRadius: '12px', border: 'none', fontWeight: 'bold', cursor: 'pointer', background: !isAiMode ? '#eff6ff' : '#f1f5f9', color: !isAiMode ? '#3b82f6' : '#64748b' }}
          >
            إدخال يدوي
          </button>
          <button 
            type="button"
            onClick={() => setIsAiMode(true)}
            style={{ padding: '8px 18px', borderRadius: '12px', border: 'none', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', background: isAiMode ? '#f5f3ff' : '#f1f5f9', color: isAiMode ? '#8b5cf6' : '#64748b' }}
          >
            <Bot size={18} /> توليد بالذكاء الاصطناعي
          </button>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontWeight: 'bold', fontSize: '0.95rem', color: '#374151', display: 'block', marginBottom: '8px' }}>
            شكل الخريطة ({THEMES.length} أنماط):
          </label>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', maxHeight: '160px', overflowY: 'auto',
            padding: '6px', border: '2px solid #e2e8f0', borderRadius: '12px'
          }}>
            {THEMES.map(t => (
              <button key={t.value} onClick={() => setTheme(t.value)} style={{
                padding: '8px 4px', borderRadius: '10px', border: '2px solid',
                borderColor: theme === t.value ? '#3b82f6' : '#e2e8f0',
                background: theme === t.value ? '#eff6ff' : '#f8fafc',
                cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s',
                transform: theme === t.value ? 'scale(1.04)' : 'scale(1)'
              }}>
                <div style={{ fontSize: '1.2rem', marginBottom: '2px' }}>{t.label.split(' ')[0]}</div>
                <div style={{ fontSize: '0.65rem', fontWeight: 'bold', color: theme === t.value ? '#3b82f6' : '#374151', lineHeight: 1.2 }}>
                  {t.label.slice(t.label.indexOf(' ') + 1)}
                </div>
              </button>
            ))}
          </div>
        </div>

        {isAiMode ? (
          <div style={{ background: '#f5f3ff', padding: '15px', borderRadius: '12px', border: '2px solid #ede9fe' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
              <p style={{ color: '#6d28d9', fontSize: '0.9rem', margin: 0, fontWeight: 'bold' }}>
                اكتب اسم الدرس أو ارفع ملفه / صوره لتلخيصه:
              </p>
              <label style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                background: '#ede9fe', color: '#7c3aed', padding: '5px 12px',
                borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold',
                border: '1px solid #c4b5fd', transition: 'all 0.2s'
              }} title="رفع ملف PDF أو صور أو مستند نصي لتلخيصه بالذكاء الاصطناعي">
                <Upload size={15} />
                <span>رفع ملف أو صور (PDF / صور / نص)</span>
                <input 
                  type="file" 
                  accept=".pdf,.txt,image/*,image/png,image/jpeg,image/webp,image/jpg" 
                  multiple 
                  style={{ display: 'none' }} 
                  onChange={handleFileUpload} 
                />
              </label>
            </div>

            {uploadedImages.length > 0 && (
              <div style={{
                marginBottom: '10px',
                padding: '8px 10px',
                background: '#ede9fe',
                borderRadius: '10px',
                border: '1px dashed #a78bfa'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#6d28d9', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <ImageIcon size={14} /> الصور المرفقة ({uploadedImages.length}):
                  </span>
                  <button 
                    type="button" 
                    onClick={() => setUploadedImages([])} 
                    style={{ fontSize: '0.75rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 'bold' }}>
                    <Trash2 size={12} /> حذف الكل
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                  {uploadedImages.map((img, idx) => (
                    <div key={idx} style={{
                      position: 'relative', width: '56px', height: '56px', flexShrink: 0,
                      borderRadius: '8px', overflow: 'hidden', border: '2px solid #8b5cf6',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                    }}>
                      <img src={img.preview} alt={img.name || `صورة ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button 
                        type="button"
                        onClick={() => removeImage(idx)}
                        title="حذف الصورة"
                        style={{
                          position: 'absolute', top: '2px', left: '2px',
                          background: 'rgba(239, 68, 68, 0.9)', color: 'white',
                          border: 'none', borderRadius: '50%', width: '18px', height: '18px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', padding: 0
                        }}>
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>النموذج المستخدم:</span>
              <select value={aiModel} onChange={(e) => setAiModel(e.target.value)} style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #c4b5fd', background: 'white', fontFamily: 'Tajawal', fontSize: '0.85rem', outline: 'none', fontWeight: 'bold', color: '#6d28d9' }}>
                {UNIFIED_AI_MODELS.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              onPaste={handlePaste}
              placeholder={uploadedImages.length > 0
                ? "تم إرفاق الصور! يمكنك كتابة ملاحظات أو توجيهات إضافية هنا (اختياري)، أو الضغط فوراً على زر التوليد بالأسفل..."
                : "مثال: خصائص الكائنات الحية، أو اضغط زر 'رفع ملف أو صور' أعلاه لتحميل صفحات من كتاب مدرسي أو ملخص..."
              }
              style={{
                width: '100%', height: '80px', padding: '12px', borderRadius: '8px',
                border: '1px solid #c4b5fd', fontFamily: 'inherit', fontSize: '15px',
                resize: 'none', direction: 'rtl', outline: 'none', boxSizing: 'border-box'
              }}
            />
            <button 
              onClick={handleAiGenerate} 
              disabled={aiLoading || (!aiPrompt.trim() && uploadedImages.length === 0)}
              style={{
                width: '100%', padding: '12px', background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold',
                marginTop: '10px',
                cursor: (aiLoading || (!aiPrompt.trim() && uploadedImages.length === 0)) ? 'not-allowed' : 'pointer',
                display: 'flex', justifyContent: 'center', gap: '8px',
                opacity: (aiLoading || (!aiPrompt.trim() && uploadedImages.length === 0)) ? 0.6 : 1
              }}>
              {aiLoading ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
              {aiLoading 
                ? 'جاري تحليل المحتوى وتوليد الخريطة...' 
                : (uploadedImages.length > 0 
                    ? `توليد الخريطة من الصور (${uploadedImages.length}) بالذكاء الاصطناعي` 
                    : 'توليد الخريطة الذهنية بالذكاء الاصطناعي')
              }
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
              <p style={{ color: '#64748b', margin: 0, fontSize: '0.85rem' }}>
                اكتب محتوى الخريطة هنا (استخدم Tab للتفرعات) أو ارفع ملفاً:
              </p>
              <label style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                background: '#f1f5f9', color: '#475569', padding: '4px 10px',
                borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold',
                border: '1px solid #cbd5e1'
              }} title="رفع ملف نصي أو PDF أو صور">
                <Upload size={14} />
                <span>رفع ملف</span>
                <input 
                  type="file" 
                  accept=".pdf,.txt,image/*,image/png,image/jpeg,image/webp,image/jpg" 
                  multiple
                  style={{ display: 'none' }} 
                  onChange={handleFileUpload} 
                />
              </label>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={insertTab}
              placeholder={'الفكرة الرئيسية\n\tفرع 1\n\t\tنقطة\n\t\tنقطة\n\tفرع 2'}
              style={{
                width: '100%', height: '140px', padding: '15px', borderRadius: '10px',
                border: '2px solid #e2e8f0', fontFamily: 'monospace', fontSize: '15px',
                resize: 'vertical', direction: 'rtl', whiteSpace: 'pre', boxSizing: 'border-box',
                outline: 'none'
              }}
              onFocus={e => e.target.style.borderColor = '#3b82f6'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
          </>
        )}

        <button onClick={handleImport} style={{
          width: '100%', padding: '14px', background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
          color: 'white', border: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 'bold',
          marginTop: '16px', cursor: 'pointer', display: 'flex', justifyContent: 'center', gap: '10px',
          boxShadow: '0 4px 15px rgba(59,130,246,0.4)', fontFamily: 'Tajawal'
        }}>
          <FileDown size={24} /> إدراج الخريطة على السبورة
        </button>
      </div>
    </div>
  );
};

export default MindMapImportModal;
