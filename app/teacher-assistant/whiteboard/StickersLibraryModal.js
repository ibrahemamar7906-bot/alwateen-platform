import React from 'react';
import { Sticker, X } from 'lucide-react';

const STICKERS = [
  // إيجابي / تشجيع
  { id: 'star',     name: 'نجمة ذهبية',  url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f31f/512.gif' },
  { id: '100',      name: '100% ممتاز',       url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f4af/512.gif' },
  { id: 'fire',     name: 'نار',          url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f525/512.gif' },
  { id: 'party',    name: 'احتفال',        url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f389/512.gif' },
  { id: 'confetti', name: 'كونفيتي',       url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f38a/512.gif' },
  { id: 'rocket',   name: 'صاروخ',         url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f680/512.gif' },
  { id: 'trophy',   name: 'كأس',           url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f3c6/512.gif' },
  { id: 'medal',    name: 'ميدالية ذهبية',       url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f947/512.gif' },
  { id: 'crown',    name: 'تاج',           url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f451/512.gif' },
  { id: 'clap',     name: 'تصفيق',         url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f44f/512.gif' },
  { id: 'thumbsup', name: 'ممتاز',         url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f44d/512.gif' },
  { id: 'heart',    name: 'قلب',           url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/2764_fe0f/512.gif' },
  // تفكير / تعليم
  { id: 'brain',    name: 'تفكير عميق',     url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f9e0/512.gif' },
  { id: 'bulb',     name: 'فكرة',          url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f4a1/512.gif' },
  { id: 'target',   name: 'هدف',           url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f3af/512.gif' },
  { id: 'books',    name: 'كتب',           url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f4da/512.gif' },
  { id: 'pencil',   name: 'قلم',           url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/270f_fe0f/512.gif' },
  { id: 'computer', name: 'كمبيوتر',       url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f4bb/512.gif' },
  // حيوانات وشخصيات
  { id: 'cat',      name: 'قطة',           url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f431/512.gif' },
  { id: 'lion',     name: 'أسد',           url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f981/512.gif' },
  { id: 'dino',     name: 'ديناصور',       url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f996/512.gif' },
  { id: 'uni',      name: 'يونيكورن',      url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f984/512.gif' },
  { id: 'robot',    name: 'روبوت',         url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f916/512.gif' },
  { id: 'alien',    name: 'فضائي',         url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f47e/512.gif' },
  // غاضب / سلبي (للتنبيه)
  { id: 'angry',    name: 'غاضب',          url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f621/512.gif' },
  { id: 'thumbsdown',name: 'غير جيد',    url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f44e/512.gif' },
  { id: 'cross',    name: 'خطأ',           url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/274c/512.gif' },
  { id: 'mindblown',name: 'عقلي انفجر',      url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f92f/512.gif' },
  { id: 'bomb',     name: 'قنبلة',         url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f4a3/512.gif' },
  { id: 'devil',    name: 'شيطان',         url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f47f/512.gif' },
  { id: 'poop',     name: 'مخلفات',         url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f4a9/512.gif' },
  { id: 'siren',    name: 'إنذار',         url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f6a8/512.gif' },
];

export default function StickersLibraryModal({ isActive, onClose, onSelectSticker }) {
  if (!isActive) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.8)', zIndex: 100000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Tajawal', direction: 'rtl'
    }}>
      <div style={{
        background: '#f8fafc', padding: '0', borderRadius: '20px', width: '90%', maxWidth: '800px',
        maxHeight: '85vh', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', position: 'relative',
        display: 'flex', flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          background: 'white', padding: '20px', display: 'flex', justifyContent: 'space-between', 
          alignItems: 'center', borderBottom: '1px solid #e2e8f0'
        }}>
          <h2 style={{ margin: 0, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sticker size={28} color="#f59e0b" /> مكتبة الملصقات المتحركة (GIF)
          </h2>
          <button onClick={onClose} style={{
            background: '#fee2e2', border: 'none', cursor: 'pointer', color: '#ef4444', 
            borderRadius: '50%', padding: '8px', display: 'flex'
          }}><X size={24} /></button>
        </div>

        {/* Grid Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '30px', background: '#f1f5f9' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '20px' }}>
            {STICKERS.map(sticker => (
              <div 
                key={sticker.id}
                onClick={() => { onSelectSticker(sticker.url); onClose(); }}
                style={{
                  background: 'white', borderRadius: '15px', padding: '15px', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
                  border: '2px solid transparent', transition: 'all 0.2s', boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.borderColor = '#f59e0b'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'transparent'; }}
              >
                <img src={sticker.url} alt={sticker.name} style={{ width: '64px', height: '64px', objectFit: 'contain' }} />
                <span style={{ fontWeight: 'bold', color: '#475569', fontSize: '0.9rem', textAlign: 'center' }}>{sticker.name}</span>
              </div>
            ))}
          </div>

        </div>

        {/* Footer */}
        <div style={{ background: 'white', padding: '15px 20px', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
           <span style={{ color: '#64748b', fontSize: '0.9rem' }}>
             اختر الملصق لإضافته للسبورة. يمكنك تكبيره وتصغيره وتحريكه.
           </span>
        </div>

      </div>
    </div>
  );
}
