import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';

const DEFAULT_PHRASES = [
  'ممتاز يا بطل! 🌟',
  'بارك الله فيك 👏',
  'إجابة ممتازة 🎯',
  'خطك جميل جداً ✨',
  'ذكي ومبدع 💡',
  'شكراً لمشاركتك الرائعة 🏆',
  'تفكير سليم 🧠',
  'من الأوائل دائماً 🥇',
  'محاولة رائعة 💪',
  'أحسنت صنعاً ⭐',
  'نجم الحصة اليوم 👑',
  'عمل متميز 🚀',
  'رائع ومبهر 🌈',
  'شعلة نشاط 🔥',
  'دمت متألقاً دائماً 🎉'
].join('\n');

export default function MotivationalCardsModal({ isActive, onClose, onGenerate }) {
  const [phrasesText, setPhrasesText] = useState(DEFAULT_PHRASES);

  if (!isActive) return null;

  const handleGenerate = () => {
    const lines = phrasesText.split('\n').map(l => l.trim()).filter(l => l !== '');
    if (lines.length > 0) {
      onGenerate(lines);
      onClose();
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999,
      fontFamily: 'Tajawal, sans-serif', direction: 'rtl', backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        background: '#ffffff', borderRadius: '24px', width: '90%', maxWidth: '500px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden',
        border: '1px solid #e2e8f0'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #10b981, #059669)',
          padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <h2 style={{ margin: 0, color: 'white', fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={24} />
            <span>بطاقات التعزيز والتشجيع</span>
          </h2>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%',
            width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', cursor: 'pointer', transition: 'background 0.2s'
          }} title="إغلاق">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          <p style={{ margin: '0 0 16px', color: '#475569', fontSize: '0.95rem', lineHeight: '1.6' }}>
            أدخل العبارات التحفيزية (عبارة واحدة في كل سطر). سيتم إنشاء كروت ملونة تفاعلية يمكن للمعلم سحبها وتوزيعها على الطلاب على السبورة.
          </p>
          
          <textarea
            value={phrasesText}
            onChange={(e) => setPhrasesText(e.target.value)}
            style={{
              width: '100%', height: '180px', padding: '14px',
              border: '2px solid #e2e8f0', borderRadius: '12px',
              fontSize: '1rem', fontFamily: 'inherit', resize: 'vertical',
              outline: 'none', boxSizing: 'border-box', lineHeight: 1.6
            }}
          />

          <button
            onClick={handleGenerate}
            style={{
              width: '100%', marginTop: '20px', padding: '14px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white', border: 'none', borderRadius: '12px',
              fontSize: '1.05rem', fontWeight: 'bold', cursor: 'pointer',
              boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
            }}
          >
            <Sparkles size={20} />
            <span>توليد كروت التشجيع الآن</span>
          </button>
        </div>
      </div>
    </div>
  );
}