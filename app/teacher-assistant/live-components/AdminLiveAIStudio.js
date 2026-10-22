'use client'
import React, { useState, useRef, useEffect } from 'react'
import { Bot, X, Send, Paperclip, Code, Download, Copy, Check, Loader2, Sparkles, Image as ImageIcon } from 'lucide-react'
import { UNIFIED_AI_MODELS, DEFAULT_AI_MODEL } from '../../utils/aiModels'
import { supabase } from '../../../utils/supabase'

export default function AdminLiveAIStudio({ channel }) {
  const [isOpen, setIsOpen] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedCode, setGeneratedCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [selectedModel, setSelectedModel] = useState(DEFAULT_AI_MODEL)
  const [uploadedImages, setUploadedImages] = useState([])
  
  const [codeType, setCodeType] = useState('html')
  
  const fileInputRef = useRef(null)
  
  // Handle image upload and convert to base64
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64Data = event.target.result.split(',')[1];
          setUploadedImages(prev => [...prev, {
            data: base64Data,
            mimeType: file.type,
            name: file.name
          }]);
        };
        reader.readAsDataURL(file);
      }
    });
  }

  const removeImage = (index) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  }

  const generateCode = async () => {
    if (!prompt.trim() && uploadedImages.length === 0) return;
    
    setIsGenerating(true);
    setGeneratedCode('');
    
    try {
      const systemPrompt = codeType === 'html' 
      ? `You are an elite AI Coding Assistant for "Al-Junaidi" educational platform.
Your ONLY job is to write single-file HTML/JS/CSS interactive components (games, tools, exercises) that will be rendered inside the platform's Live HTML Sandbox.

CRITICAL ARCHITECTURE RULES FOR HTML SANDBOX:
1. The Sandbox AUTOMATICALLY synchronizes all DOM events (clicks, drags, inputs, scrolling) between the teacher and students using a built-in DOM mirroring script.
2. YOU DO NOT NEED TO WRITE ANY NETWORKING OR SYNC CODE.
3. Write standard, purely client-side HTML, CSS, and Vanilla JavaScript.
4. Output ONLY the raw HTML code starting with <!DOCTYPE html> (no markdown wrappers like \`\`\`html).
5. All styling should be in a <style> tag. All logic in a <script> tag. 
6. Ensure the design is responsive and uses Arabic text (RTL direction).` 
      : `You are an elite AI Coding Assistant for "Al-Junaidi" educational platform.
Your ONLY job is to write single-file React components for the Live Virtual Classroom (Whiteboard Overlays / Games).

CRITICAL ARCHITECTURE RULES FOR REACT COMPONENTS:
1. The component receives these props: { channel, isStudent, isMobile }
2. TEACHER SENDS DATA like this:
   channel.send({ type: 'broadcast', event: 'game_update', payload: { ... } })
3. EVERYONE RECEIVES DATA like this:
   useEffect(() => {
     if (!channel) return;
     const handleSync = (payload) => { if (payload.event === 'game_update') { /* update state */ } };
     channel.on('broadcast', handleSync);
     return () => channel.off('broadcast', handleSync);
   }, [channel]);
4. STUDENTS MUST NEVER send data (view only). 
5. NO DEFAULT EXPORTS with dynamic imports needed inside the file, just export default function MyComponent({ channel, isStudent }) { ... }
6. Do NOT return markdown formatting (\`\`\`javascript). Return ONLY the raw code string.`;

      const contents = [
        {
          role: "user",
          parts: [
            { text: systemPrompt + "\n\nUser Request: " + prompt },
            ...uploadedImages.map(img => ({
              inlineData: {
                mimeType: img.mimeType,
                data: img.data
              }
            }))
          ]
        }
      ];

      const { data: { session } } = await supabase.auth.getSession();
      const authHeaders = {
        'Content-Type': 'application/json',
        ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {})
      };

      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ 
          contents, 
          model: selectedModel,
          cost: 3,
          action: 'live_ai_studio'
        })
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }
      
      let aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      // Strip markdown code blocks if the AI stubbornly adds them
      if (aiText.startsWith('```')) {
        aiText = aiText.replace(/^```(javascript|jsx|js)?\n/g, '').replace(/```$/g, '');
      }
      
      setGeneratedCode(aiText.trim());
      
    } catch (err) {
      console.error(err);
      setGeneratedCode(`// Error generating code:\n// ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const handleDownload = () => {
    const blob = new Blob([generatedCode], { type: 'text/javascript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'LiveGeneratedComponent.js';
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!isOpen) {
    return (
      <>
        <style>{`
          .admin-ai-studio-btn {
            position: fixed;
            bottom: 80px;
            left: 20px;
            z-index: 99999;
            background: linear-gradient(135deg, #4f46e5, #9333ea);
            color: white;
            border: none;
            border-radius: 50%;
            width: 54px;
            height: 54px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 15px rgba(147, 51, 234, 0.4);
            cursor: pointer;
            transition: all 0.2s ease;
          }
          @media (max-width: 768px) {
            .admin-ai-studio-btn {
              bottom: auto !important;
              top: 68px !important;
              left: 10px !important;
              width: 38px !important;
              height: 38px !important;
              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3) !important;
              z-index: 60 !important;
            }
            .admin-ai-studio-btn svg {
              width: 20px !important;
              height: 20px !important;
            }
          }
        `}</style>
        <button 
          onClick={() => setIsOpen(true)}
          className="admin-ai-studio-btn"
          title="Admin AI Code Studio"
        >
          <Bot size={26} />
        </button>
      </>
    )
  }

  return (
    <>
      <style>{`
        .admin-ai-studio-modal {
          position: fixed;
          bottom: 80px;
          left: 20px;
          width: 450px;
          max-width: 90vw;
          height: 600px;
          max-height: 80vh;
          background: white;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
          z-index: 99999;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          direction: rtl;
          font-family: Tajawal, sans-serif;
        }
        @media (max-width: 768px) {
          .admin-ai-studio-modal {
            top: 55px !important;
            bottom: 10px !important;
            left: 10px !important;
            right: 10px !important;
            width: calc(100vw - 20px) !important;
            max-width: calc(100vw - 20px) !important;
            height: auto !important;
            max-height: calc(100vh - 70px) !important;
            z-index: 99999 !important;
          }
        }
      `}</style>
      <div className="admin-ai-studio-modal">
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
        color: 'white',
        padding: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={20} color="#a5b4fc" />
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>المبرمج الذكي (للمسؤولين)</h3>
        </div>
        <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
          <X size={20} />
        </button>
      </div>

      {/* Code Display Area */}
      <div style={{ flex: 1, background: '#f8fafc', padding: '12px', overflowY: 'auto' }}>
        {generatedCode ? (
          <div style={{ position: 'relative', height: '100%' }}>
            <div style={{ position: 'absolute', top: '8px', left: '8px', display: 'flex', gap: '8px' }}>
              <button onClick={handleCopy} style={{ background: '#334155', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'تم النسخ' : 'نسخ'}
              </button>
              <button onClick={handleDownload} style={{ background: '#059669', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                <Download size={14} /> حفظ كملف
              </button>
            </div>
            <pre style={{ 
              background: '#1e293b', 
              color: '#e2e8f0', 
              padding: '40px 16px 16px 16px', 
              borderRadius: '12px',
              margin: 0,
              fontSize: '13px',
              direction: 'ltr',
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              minHeight: '100%'
            }}>
              {generatedCode}
            </pre>
          </div>
        ) : (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64748b', opacity: 0.7 }}>
            <Code size={48} style={{ marginBottom: '16px' }} />
            <p style={{ textAlign: 'center', margin: 0, fontSize: '0.95rem' }}>
              اكتب فكرة الكود (لعبة، أداة، تفاعل) وسيقوم المبرمج الذكي بكتابته مع التوافق التام مع نظام البث اللحظي Supabase.
            </p>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div style={{ padding: '12px', borderTop: '1px solid #e2e8f0', background: 'white' }}>
        {/* Uploaded Images Preview */}
        {uploadedImages.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            {uploadedImages.map((img, idx) => (
              <div key={idx} style={{ position: 'relative', flexShrink: 0 }}>
                <img src={`data:${img.mimeType};base64,${img.data}`} alt="upload" style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e2e8f0' }} />
                <button 
                  onClick={() => removeImage(idx)}
                  style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px' }}>
          <input 
            type="file" 
            accept="image/*" 
            multiple 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            onChange={handleImageUpload} 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', padding: '0 12px', cursor: 'pointer', color: '#475569' }}
            title="إرفاق صورة (لتصميم اللعبة أو الواجهة)"
          >
            <ImageIcon size={20} />
          </button>
          
          <textarea 
            placeholder="مثال: قم ببرمجة لعبة ترتيب كلمات للغة العربية، مع بث مباشر بين المعلم والطالب..."
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            style={{
              flex: 1,
              resize: 'none',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '8px 12px',
              height: '50px',
              fontFamily: 'inherit',
              outline: 'none',
              fontSize: '0.9rem'
            }}
          />
          
          <button 
            onClick={generateCode}
            disabled={isGenerating || (!prompt.trim() && uploadedImages.length === 0)}
            style={{
              background: isGenerating ? '#94a3b8' : 'linear-gradient(135deg, #4f46e5, #9333ea)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '0 16px',
              cursor: (isGenerating || (!prompt.trim() && uploadedImages.length === 0)) ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {isGenerating ? <Loader2 size={20} className="spin-anim" /> : <Send size={20} />}
          </button>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <select 
              value={selectedModel} 
              onChange={e => setSelectedModel(e.target.value)}
              style={{ fontSize: '0.75rem', padding: '4px 6px', border: '1px solid #cbd5e1', borderRadius: '4px', background: 'white', color: '#312e81', fontWeight: 'bold', outline: 'none', cursor: 'pointer' }}
            >
              {UNIFIED_AI_MODELS.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>

            <select 
              value={codeType} 
              onChange={e => setCodeType(e.target.value)}
              style={{ fontSize: '0.75rem', padding: '4px 6px', border: '1px solid #e2e8f0', borderRadius: '4px', background: 'transparent', color: '#475569', outline: 'none', cursor: 'pointer' }}
            >
              <option value="html">أكواد Sandbox (HTML/JS)</option>
              <option value="react">مكونات النظام (React)</option>
            </select>
          </div>
          
          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>للأدمن فقط</span>
        </div>
        <style>{`
          .spin-anim { animation: spin 1s linear infinite; }
          @keyframes spin { 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    </div>
  </>
)
}
