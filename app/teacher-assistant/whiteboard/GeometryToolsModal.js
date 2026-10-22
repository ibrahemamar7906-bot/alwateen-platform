import React from 'react';
import { X, Ruler, Triangle } from 'lucide-react';

const TOOLS = [
  { id: 'ruler', name: 'مسطرة (Ruler)', icon: <Ruler size={32} /> },
  { id: 'protractor', name: 'منقلة (Protractor)', icon: <div style={{ fontSize: '32px', transform: 'rotate(180deg)', lineHeight: 1 }}>📐</div> },
  { id: 'triangle', name: 'مثلث (Set Square)', icon: <Triangle size={32} /> }
];

export default function GeometryToolsModal({ isActive, onClose, onSelectTool, isPremium, setShowPremiumAlert }) {
  if (!isActive) return null;

  const handleSelect = (toolId) => {
    if (!isPremium) {
      setShowPremiumAlert(true);
      return;
    }
    onSelectTool(toolId);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', zIndex: 100000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Tajawal, sans-serif', direction: 'rtl',
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        background: '#fff', padding: '0', borderRadius: '20px', width: '90%', maxWidth: '560px',
        overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', position: 'relative',
        display: 'flex', flexDirection: 'column', border: '1px solid #e2e8f0'
      }}>
        {/* Header */}
        <div style={{
          background: '#f8fafc', padding: '18px 24px', display: 'flex', justifyContent: 'space-between', 
          alignItems: 'center', borderBottom: '1px solid #e2e8f0'
        }}>
          <h2 style={{ margin: 0, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.25rem' }}>
            <Ruler size={26} color='#0ea5e9' />
            <span>الأدوات الهندسية (Pro)</span>
          </h2>
          <button 
            onClick={onClose} 
            style={{
              background: '#fee2e2', border: 'none', cursor: 'pointer', color: '#ef4444', 
              borderRadius: '50%', width: '34px', height: '34px', display: 'flex',
              alignItems: 'center', justifyContent: 'center'
            }}
            title="إغلاق"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px 28px', background: '#fff' }}>
          <p style={{ color: '#64748b', marginBottom: '22px', fontSize: '1rem', textAlign: 'center', lineHeight: 1.6 }}>
            اختر أداة هندسية تفاعلية لإضافتها على السبورة واستخدامها في الرسم والقياس والشرح بدقة.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {TOOLS.map(tool => (
              <div 
                key={tool.id}
                onClick={() => handleSelect(tool.id)}
                style={{
                  background: '#f8fafc', borderRadius: '14px', padding: '18px 12px', cursor: 'pointer',
                  border: '2px solid #e2e8f0', transition: 'all 0.2s',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
                  userSelect: 'none'
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = '#0ea5e9'; e.currentTarget.style.background = '#f0f9ff'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f8fafc'; }}
              >
                <div style={{ color: '#0ea5e9', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '48px' }}>
                  {tool.icon}
                </div>
                <span style={{ fontWeight: 'bold', color: '#334155', fontSize: '0.95rem', textAlign: 'center' }}>
                  {tool.name}
                </span>
                {!isPremium && (
                  <span style={{ background: '#fef3c7', color: '#b45309', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '8px', fontWeight: 'bold' }}>
                    PRO
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
