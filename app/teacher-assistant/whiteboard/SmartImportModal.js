import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';

export default function SmartImportModal({ isActive, onClose, onImport }) {
  const [text, setText] = useState('');

  if (!isActive) return null;

  const handleImport = () => {
    if (!text.trim()) return;
    onImport(text);
    setText('');
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', zIndex: 10000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(4px)', fontFamily: 'Tajawal, sans-serif', direction: 'rtl'
    }}>
      <div style={{
        background: 'white', padding: '24px 28px', borderRadius: '20px', width: '90%', maxWidth: '520px',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)', border: '1px solid #e2e8f0'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, color: '#4338ca', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.25rem' }}>
            <Sparkles size={24} />
            <span>توليد كروت تفاعلية ذكية</span>
          </h3>
          <button onClick={onClose} style={{ background: '#fee2e2', border: 'none', cursor: 'pointer', color: '#ef4444', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={18} />
          </button>
        </div>

        <p style={{ color: '#475569', fontSize: '14px', marginBottom: '14px', lineHeight: 1.6 }}>
          قم بلصق قائمة أسئلة أو مفاهيم (سؤال - إجابة) بحيث يفصل بينهما شرطة (-). سيتم تحويلها تلقائياً إلى بطاقات فلاش تعليمية قابلة للقلب.
        </p>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`مثال:\nمن هو مؤلف كتاب البخلاء؟ - الجاحظ\nما هي عاصمة جمهورية مصر العربية؟ - القاهرة\nكم عدد أركان الإسلام؟ - خمسة أركان`}
          style={{
            width: '100%', height: '150px', padding: '12px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1',
            fontFamily: 'Tajawal, sans-serif', fontSize: '14.5px', resize: 'vertical', outline: 'none',
            lineHeight: 1.6, boxSizing: 'border-box'
          }}
        />

        <button onClick={handleImport} style={{
          width: '100%', padding: '12px', marginTop: '18px', background: 'linear-gradient(135deg, #4f46e5, #4338ca)', color: 'white',
          border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '15px', fontWeight: 'bold',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)'
        }}>
          <Sparkles size={18} />
          <span>توليد وإدراج الكروت على السبورة</span>
        </button>
      </div>
    </div>
  );
}