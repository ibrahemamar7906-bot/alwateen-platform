import React, { useState, useRef, useEffect } from 'react';
import { X, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List, Sparkles, Save, FileText, CheckCheck, Edit3, Mic, Type, Highlighter, Cloud, CloudOff } from 'lucide-react';
import { supabase } from '../../../utils/supabase';
import { UNIFIED_AI_MODELS, DEFAULT_AI_MODEL } from '../../utils/aiModels';

export default function SmartDocumentEditorModal({ isActive, onClose }) {
  const [docId, setDocId] = useState(null);
  const [docTitle, setDocTitle] = useState('ملزمة جديدة');
  const [geminiModel, setGeminiModel] = useState(DEFAULT_AI_MODEL);
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved', 'saving', 'error'
  
  const editorRef = useRef(null);
  const recognitionRef = useRef(null);
  const saveTimeoutRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'ar-EG';

        recognitionRef.current.onresult = (event) => {
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript + ' ';
            }
          }
          if (finalTranscript) {
            document.execCommand('insertText', false, finalTranscript);
            handleAutoSave();
          }
        };

        recognitionRef.current.onerror = (event) => {
          console.error("Speech Recognition Error:", event.error);
          setIsRecording(false);
        };
      }
    }
  }, []);

  // Load existing documents or create new (simulated for now, fallback to localStorage if no DB)
  useEffect(() => {
    if (isActive) {
      const savedDoc = localStorage.getItem('smart_handout_draft');
      if (savedDoc && editorRef.current) {
        editorRef.current.innerHTML = savedDoc;
      }
    }
  }, [isActive]);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsRecording(true);
      } else {
        alert("متصفحك لا يدعم خاصية الكتابة بالصوت.");
      }
    }
  };

  const handleFormat = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleAutoSave();
  };

  const handleAutoSave = () => {
    setSaveStatus('saving');
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    saveTimeoutRef.current = setTimeout(async () => {
      const content = editorRef.current.innerHTML;
      localStorage.setItem('smart_handout_draft', content);
      
      // Attempt to save to Supabase if table exists
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
           // We silently fail if 'handouts' table doesn't exist yet, keeping localStorage as primary
           await supabase.from('handouts').upsert({ 
             id: docId || undefined,
             user_id: user.id, 
             title: docTitle, 
             content: content,
             updated_at: new Date()
           }).select();
        }
      } catch (e) {
        console.warn("Supabase save skipped/failed. Saved to LocalStorage.");
      }
      setSaveStatus('saved');
    }, 2000);
  };

  const getSmartContext = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return { selectedText: '', context: '' };
    
    const selectedText = selection.toString();
    const node = selection.anchorNode;
    
    // Get text before and after selection for Context (Token Optimization)
    let contextText = editorRef.current.innerText;
    if (contextText.length > 1000) {
      // Just a simple approximation to get 500 chars before and after
      const textContent = editorRef.current.innerText;
      const index = textContent.indexOf(selectedText);
      if (index !== -1) {
        const start = Math.max(0, index - 500);
        const end = Math.min(textContent.length, index + selectedText.length + 500);
        contextText = textContent.substring(start, end);
      }
    }
    
    return { selectedText, contextText };
  };

  const callAI = async (promptType) => {
    const { selectedText, contextText } = getSmartContext();
    
    if (!selectedText && promptType !== 'continue') {
      alert("الرجاء تحديد النص الذي تريد تطبيق الذكاء الاصطناعي عليه أولاً.");
      return;
    }

    const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
    if (!GEMINI_API_KEY) {
      alert("مفتاح API غير موجود.");
      return;
    }

    setLoading(true);
    let systemPrompt = "";
    
    // Advanced Context-Aware Prompts
    if (promptType === 'correct') {
      systemPrompt = "أنت المساعد اللغوي والتربوي الذكي في أداة [المحرر والمساعد السريع داخل السبورة الذكية] في منصة الجُنيدي التعليمية. مهمتك: تصحيح الأخطاء الإملائية والنحوية وصياغة النص بدقة لغوية فائقة بناءً على سياق الدرس. أعد النص المصحح فقط بدون أي مقدمات.";
    } else if (promptType === 'continue') {
      systemPrompt = "أنت المساعد الأكاديمي والتربوي الذكي في أداة [المحرر والمساعد السريع داخل السبورة الذكية] في منصة الجُنيدي التعليمية. مهمتك: إكمال شرح الفكرة الحالية بأسلوب تربوي مبسط ومترابط مع سياق الدرس. أضف فقرة تعليمية واضحة تكمل المعنى مباشرة بدون مقدمات.";
    } else if (promptType === 'summarize') {
      systemPrompt = "أنت المساعد الأكاديمي والتربوي الذكي في أداة [المحرر والمساعد السريع داخل السبورة الذكية] في منصة الجُنيدي التعليمية. مهمتك: تلخيص النص المحدد في نقاط رئيسية مركزة وسهلة الفهم والحفظ للطلاب. أعد التلخيص فقط كقائمة نقطية.";
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        throw new Error('يرجى تسجيل الدخول لحسابك لاستخدام ميزات الذكاء الاصطناعي.');
      }

      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          contents: [{ 
            role: 'user', 
            parts: [{ 
              text: systemPrompt + '\n\nعنوان الملزمة: ' + docTitle + '\n\nالسياق العام للدرس:\n' + contextText + '\n\nالنص المحدد للعمل عليه:\n' + (selectedText || "لا يوجد نص محدد، أكمل من نهاية السياق.")
            }] 
          }], 
          model: geminiModel,
          generationConfig: { temperature: 0.3 },
          action: 'whiteboard_document_editor'
        })
      });

      const data = await res.json().catch(()=>({}));
      if (!res.ok) throw new Error(data.error?.message || "خطأ في الاتصال بالذكاء الاصطناعي");

      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        let resultText = data.candidates[0].content.parts[0].text.trim();
        
        // Convert Markdown bold to HTML for the editor
        resultText = resultText.replace(/\*\*(.*?)\*\*/g, '<b></b>');
        resultText = resultText.replace(/\*(.*?)\*/g, '<i></i>');
        resultText = resultText.replace(/\n/g, '<br>');

        if (promptType === 'continue' && !selectedText) {
          // Append to end of document using range
          const selection = window.getSelection();
          if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.collapse(false);
            const el = document.createElement('span');
            el.innerHTML = '<br><br>' + resultText;
            range.insertNode(el);
            
            // Move cursor to end
            range.setStartAfter(el);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
          } else {
             editorRef.current.innerHTML += '<br><br>' + resultText;
          }
        } else {
          document.execCommand('insertHTML', false, resultText);
        }
        handleAutoSave();
      }
    } catch (err) {
      alert("حدث خطأ: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isActive) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 10000, background: '#f8fafc', display: 'flex', flexDirection: 'column', fontFamily: 'Tajawal' }}>
      
      {/* Header & AI Toolbar */}
      <div style={{ background: 'white', padding: '15px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', padding: '8px', cursor: 'pointer' }}>
            <X size={24} color="#334155" />
          </button>
          
          <input 
            type="text" 
            value={docTitle} 
            onChange={(e) => { setDocTitle(e.target.value); handleAutoSave(); }}
            style={{ fontSize: '20px', fontWeight: 'bold', border: 'none', color: '#1e293b', outline: 'none', background: 'transparent' }}
          />
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: saveStatus === 'saved' ? '#10b981' : '#f59e0b', fontSize: '14px' }}>
            {saveStatus === 'saved' ? <><Cloud size={16} /> تم الحفظ</> : <><Loader2 size={16} className="spin" /> جاري الحفظ...</>}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select value={geminiModel} onChange={(e) => setGeminiModel(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: '#f8fafc', fontWeight: 'bold', color: '#1e293b' }}>
            {UNIFIED_AI_MODELS.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>

          <button disabled={loading} onClick={() => callAI('correct')} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#ecfdf5', color: '#059669', border: '1px solid #10b981', padding: '10px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            <CheckCheck size={18} /> تصحيح أخطاء
          </button>
          <button disabled={loading} onClick={() => callAI('continue')} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#eff6ff', color: '#2563eb', border: '1px solid #3b82f6', padding: '10px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            <Edit3 size={18} /> أكمل الشرح
          </button>
          <button disabled={loading} onClick={() => callAI('summarize')} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#fef2f2', color: '#dc2626', border: '1px solid #ef4444', padding: '10px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            <Sparkles size={18} /> لخص النص
          </button>
        </div>
      </div>

      {/* Main Editor Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '30px', overflowY: 'auto' }}>
        
        {/* Formatting Toolbar */}
        <div style={{ display: 'flex', gap: '15px', background: 'white', padding: '15px 25px', borderRadius: '12px', marginBottom: '30px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', flexWrap: 'wrap', justifyContent: 'center' }}>
          
          {/* Voice Typing */}
          <button onClick={toggleRecording} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: isRecording ? '#fee2e2' : '#f1f5f9', color: isRecording ? '#dc2626' : '#475569', border: 'none', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s' }}>
            <Mic size={20} className={isRecording ? "pulse" : ""} /> {isRecording ? "جاري الاستماع..." : "إملاء صوتي"}
          </button>
          
          <div style={{ width: '1px', background: '#e2e8f0', margin: '0 5px' }}></div>
          
          {/* Fonts */}
          <select onChange={(e) => handleFormat('fontName', e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
            <option value="Tajawal">Tajawal</option>
            <option value="Cairo">Cairo</option>
            <option value="Arial">Arial</option>
            <option value="Times New Roman">Times New Roman</option>
          </select>
          
          <select onChange={(e) => handleFormat('fontSize', e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
            <option value="3">عادي (16px)</option>
            <option value="4">كبير (18px)</option>
            <option value="5">عنوان 2 (24px)</option>
            <option value="6">عنوان 1 (32px)</option>
          </select>

          <div style={{ width: '1px', background: '#e2e8f0', margin: '0 5px' }}></div>

          <button onClick={() => handleFormat('bold')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#334155' }}><Bold size={22} /></button>
          <button onClick={() => handleFormat('italic')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#334155' }}><Italic size={22} /></button>
          <button onClick={() => handleFormat('underline')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#334155' }}><Underline size={22} /></button>
          
          {/* Colors */}
          <input type="color" onChange={(e) => handleFormat('foreColor', e.target.value)} title="لون الخط" style={{ cursor: 'pointer', width: '30px', height: '30px', padding: 0, border: 'none' }} />
          <input type="color" onChange={(e) => handleFormat('hiliteColor', e.target.value)} title="لون التمييز (Highlight)" style={{ cursor: 'pointer', width: '30px', height: '30px', padding: 0, border: 'none' }} />
          
          <div style={{ width: '1px', background: '#e2e8f0', margin: '0 5px' }}></div>
          
          <button onClick={() => handleFormat('justifyRight')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#334155' }}><AlignRight size={22} /></button>
          <button onClick={() => handleFormat('justifyCenter')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#334155' }}><AlignCenter size={22} /></button>
          <button onClick={() => handleFormat('justifyLeft')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#334155' }}><AlignLeft size={22} /></button>
          
          <div style={{ width: '1px', background: '#e2e8f0', margin: '0 5px' }}></div>
          
          <button onClick={() => handleFormat('insertUnorderedList')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#334155' }}><List size={22} /></button>
        </div>

        {/* A4 Paper */}
        <div 
          ref={editorRef}
          contentEditable 
          suppressContentEditableWarning
          onInput={handleAutoSave}
          style={{
            background: 'white', width: '210mm', minHeight: '297mm', padding: '25mm',
            boxShadow: '0 10px 40px rgba(0,0,0,0.08)', borderRadius: '4px',
            fontSize: '18px', lineHeight: '2', color: '#0f172a', outline: 'none',
            direction: 'rtl'
          }}
          placeholder="ابدأ بكتابة ملزمتك هنا، وسيتم الحفظ تلقائياً..."
        >
        </div>

        {loading && (
          <div style={{ position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)', background: '#1A2E86', color: 'white', padding: '12px 25px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 25px rgba(26, 46, 134, 0.4)', fontSize: '18px', fontWeight: 'bold', zIndex: 99999 }}>
            <Loader2 size={24} className="spin" /> جاري تجهيز المستند وتنسيقه...
          </div>
        )}
      </div>

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        .pulse { animation: pulse 2s infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.1); opacity: 0.7; } 100% { transform: scale(1); opacity: 1; } }
        [contenteditable]:empty:before { content: attr(placeholder); color: #94a3b8; pointer-events: none; display: block; }
      `}</style>
    </div>
  );
}
