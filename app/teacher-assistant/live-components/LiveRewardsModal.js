import React from 'react';
import { X, Star, Trophy } from 'lucide-react';

export default function LiveRewardsModal({ isActive, onClose, students, onAward }) {
  if (!isActive) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.8)', zIndex: 100000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Tajawal', direction: 'rtl'
    }}>
      <div style={{
        background: '#fff', padding: '0', borderRadius: '20px', width: '90%', maxWidth: '400px',
        overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', position: 'relative',
        display: 'flex', flexDirection: 'column'
      }}>
        <div style={{
          background: '#f8fafc', padding: '20px', display: 'flex', justifyContent: 'space-between', 
          alignItems: 'center', borderBottom: '1px solid #e2e8f0'
        }}>
          <h2 style={{ margin: 0, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.2rem' }}>
            <Star size={24} color='#f59e0b' /> مكافآت الطلاب
          </h2>
          <button onClick={onClose} style={{
            background: '#fee2e2', border: 'none', cursor: 'pointer', color: '#ef4444', 
            borderRadius: '50%', padding: '8px', display: 'flex'
          }}><X size={20} /></button>
        </div>

        <div style={{ padding: '20px', background: '#fff', maxHeight: '400px', overflowY: 'auto' }}>
          {(!students || students.filter(s => !s.isTeacher).length === 0) ? (
            <p style={{ textAlign: 'center', color: '#64748b' }}>لا يوجد طلاب متصلين حالياً</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {students.filter(s => !s.isTeacher).map(student => (
                <div key={student.id || student.deviceId} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: '#f8fafc', padding: '15px', borderRadius: '15px', border: '1px solid #e2e8f0'
                }}>
                  <span style={{ fontWeight: 'bold', color: '#334155', fontSize: '1.1rem' }}>{student.name || 'طالب مجهول'}</span>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => onAward(student.id || student.deviceId, 'star')} style={{
                      background: '#fef3c7', border: 'none', padding: '8px 12px', borderRadius: '10px',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px',
                      color: '#b45309', fontWeight: 'bold'
                    }} title="إعطاء نجمة">
                      <Star size={18} fill="#f59e0b" color="#f59e0b" /> نجمة
                    </button>
                    <button onClick={() => onAward(student.id || student.deviceId, 'trophy')} style={{
                      background: '#fef3c7', border: 'none', padding: '8px 12px', borderRadius: '10px',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px',
                      color: '#b45309', fontWeight: 'bold'
                    }} title="إعطاء كأس">
                      <Trophy size={18} fill="#f59e0b" color="#f59e0b" /> كأس
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
