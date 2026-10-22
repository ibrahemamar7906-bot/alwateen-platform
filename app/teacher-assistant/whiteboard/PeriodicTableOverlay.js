import React, { useState } from 'react';
import { X, Beaker } from 'lucide-react';
import { elementsData } from './elementsData';

export default function PeriodicTableOverlay({ isActive, onClose, isStudent = false }) {
  if (!isActive) return null;

  const [selectedElement, setSelectedElement] = useState(null);

  if (isStudent) return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 1000, background: 'rgba(15, 23, 42, 0.95)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Tajawal' }}>
      <h2 style={{ color: 'white' }}>🎮 نشاط تفاعلي جاري...</h2>
      <p style={{ color: '#cbd5e1' }}>يرجى متابعة شاشة المعلم للمشاركة في النشاط!</p>
    </div>
  );

  // تصميم شبكة الجدول (18 عمود x 10 صفوف) لاستيعاب اللانثانيدات والأكتينيدات
  const gridCells = Array.from({ length: 10 * 18 }, (_, i) => {
    const row = Math.floor(i / 18) + 1;
    const col = (i % 18) + 1;
    return { row, col };
  });
  return (
    <div style={{
      position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.9)', zIndex: 100000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Tajawal', direction: 'rtl'
    }}>
      <div style={{
        background: '#fff', padding: '30px', borderRadius: '20px', width: '95%', maxWidth: '1400px',
        maxHeight: '95vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', position: 'relative'
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: '20px', left: '20px', background: '#fee2e2', border: 'none', 
          cursor: 'pointer', color: '#ef4444', borderRadius: '50%', padding: '8px', display: 'flex'
        }}><X size={24} /></button>

        <h2 style={{ margin: '0 0 20px 0', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Beaker size={28} color="#8b5cf6" /> الجدول الدوري الحديث (برو 💎)
        </h2>

        <div style={{ display: 'flex', gap: '30px', flexDirection: 'row-reverse' }}>
          
          {/* شبكة الجدول الدوري */}
          <div style={{ flex: 2 }}>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(18, minmax(40px, 1fr))', gap: '4px',
              direction: 'ltr' // الجدول عادة يعرض من اليسار لليمين حتى بالعربي
            }}>
              {gridCells.map(cell => {
                const element = elementsData.find(e => e.row === cell.row && e.col === cell.col);
                if (!element) return <div key={`${cell.row}-${cell.col}`} style={{ minHeight: '55px' }} />;
                
                const isSelected = selectedElement?.num === element.num;
                return (
                  <div
                    key={element.num}
                    onClick={() => setSelectedElement(element)}
                    style={{
                      background: element.color,
                      border: isSelected ? '3px solid #000' : '1px solid rgba(0,0,0,0.1)',
                      borderRadius: '6px',
                      padding: '4px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: isSelected ? '0 0 15px rgba(0,0,0,0.3)' : 'none',
                      transform: isSelected ? 'scale(1.1)' : 'none',
                      transition: 'all 0.2s',
                      position: isSelected ? 'relative' : 'static',
                      zIndex: isSelected ? 10 : 1
                    }}
                  >
                    <span style={{ fontSize: '10px', alignSelf: 'flex-start', fontWeight: 'bold' }}>{element.num}</span>
                    <span style={{ fontSize: '18px', fontWeight: '900', color: '#1e293b' }}>{element.sym}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* بطاقة تفاصيل العنصر */}
          <div style={{ flex: 1 }}>
            {selectedElement ? (
              <div style={{
                background: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '15px', padding: '25px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', animation: 'fadeIn 0.3s'
              }}>
                <div style={{
                  background: selectedElement.color, width: '120px', height: '120px', borderRadius: '15px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid rgba(0,0,0,0.1)', marginBottom: '20px', position: 'relative'
                }}>
                  <span style={{ position: 'absolute', top: '10px', left: '10px', fontWeight: 'bold', fontSize: '16px' }}>{selectedElement.num}</span>
                  <span style={{ fontSize: '48px', fontWeight: '900', color: '#1e293b' }}>{selectedElement.sym}</span>
                  <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#334155' }}>{selectedElement.mass}</span>
                </div>

                <h3 style={{ margin: '0 0 5px 0', fontSize: '28px', color: '#0f172a' }}>{selectedElement.name}</h3>
                <span style={{ background: '#e0e7ff', color: '#4338ca', padding: '5px 15px', borderRadius: '20px', fontWeight: 'bold', marginBottom: '20px' }}>
                  {selectedElement.cat}
                </span>

                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px' }}>
                    <span style={{ color: '#64748b' }}>العدد الذري (البروتونات):</span>
                    <span style={{ fontWeight: 'bold', color: '#0f172a' }}>{selectedElement.num}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px' }}>
                    <span style={{ color: '#64748b' }}>الكتلة الذرية:</span>
                    <span style={{ fontWeight: 'bold', color: '#0f172a' }}>{selectedElement.mass} u</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px' }}>
                    <span style={{ color: '#64748b' }}>الحالة (في الغرفة):</span>
                    <span style={{ fontWeight: 'bold', color: '#0f172a' }}>{selectedElement.state}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px' }}>
                    <span style={{ color: '#64748b' }}>التوزيع الإلكتروني:</span>
                    <span style={{ fontWeight: 'bold', color: '#0f172a', direction: 'ltr' }}>{selectedElement.config}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>المجموعة / الدورة:</span>
                    <span style={{ fontWeight: 'bold', color: '#0f172a' }}>{selectedElement.col} / {selectedElement.row}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{
                background: '#f8fafc', border: '2px dashed #cbd5e1', borderRadius: '15px', padding: '40px 20px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', color: '#94a3b8'
              }}>
                <Beaker size={60} style={{ marginBottom: '20px', opacity: 0.5 }} />
                <p style={{ fontSize: '18px', margin: 0 }}>انقر على أي عنصر في الجدول الدوري لعرض كافة تفاصيله العلمية.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

