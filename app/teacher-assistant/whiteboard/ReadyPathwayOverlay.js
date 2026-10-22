import React from 'react';
import { X, Map } from 'lucide-react';
import LiveReadyPathway from '../live-components/LiveReadyPathway';

export default function ReadyPathwayOverlay({ isActive, onClose, channel = null, isStudent = false }) {
  if (!isActive) return null;
  return (
    <div style={{
      position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.95)', zIndex: 100000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Tajawal', direction: 'rtl'
    }}>
      <div style={{
        background: '#f8fafc', borderRadius: '20px', width: '95%', maxWidth: '1200px',
        height: '90vh', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', position: 'relative',
        display: 'flex', flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          background: 'white', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', 
          alignItems: 'center', borderBottom: '1px solid #e2e8f0', zIndex: 10
        }}>
          <h2 style={{ margin: 0, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem' }}>
            <Map size={28} color="#8b5cf6" /> مسارات المناهج الجاهزة (برو 💎)
          </h2>
          <button onClick={onClose} style={{
            background: '#fee2e2', border: 'none', cursor: 'pointer', color: '#ef4444', 
            borderRadius: '50%', padding: '8px', display: 'flex'
          }} title="إغلاق">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <LiveReadyPathway channel={channel} isTeacher={!isStudent} />
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

