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
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 10000,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        background: 'white', padding: '25px', borderRadius: '15px', width: '90%', maxWidth: '500px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)', fontFamily: 'Tajawal', direction: 'rtl'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, color: '#4338ca', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={24} />
            ��������� ����� ��������
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={24} />
          </button>
        </div>

        <p style={{ color: '#475569', fontSize: '14px', marginBottom: '15px' }}>
          �� ���� �� �� ����� ���. ���� ��� (�����) � (�����) ������� ������ (-). ����� ��� �� ����� ����� ������ ���.
        </p>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="����:
�� �� ����� ��ѿ - �������
�� ��� ����� ������ - ��� �����"
          style={{
            width: '100%', height: '150px', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1',
            fontFamily: 'Tajawal', fontSize: '16px', resize: 'vertical', outline: 'none'
          }}
        />

        <button onClick={handleImport} style={{
          width: '100%', padding: '12px', marginTop: '20px', background: '#4338ca', color: 'white',
          border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold'
        }}>
          ����� �������� ����
        </button>
      </div>
    </div>
  );
}