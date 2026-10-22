'use client';
import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('تم التقاط خطأ بواسطة ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div style={{
          padding: '20px',
          margin: '10px',
          background: '#fef2f2',
          border: '1px solid #f87171',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '15px',
          color: '#991b1b',
          fontFamily: 'Tajawal, sans-serif',
          textAlign: 'center',
          minHeight: '200px'
        }}>
          <AlertTriangle size={48} color="#ef4444" />
          <div>
            <h3 style={{ margin: '0 0 5px 0', fontSize: '1.2rem' }}>عذراً، حدث خطأ في هذا الجزء!</h3>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#b91c1c' }}>
              تم منع انهيار الغرفة بالكامل. يمكنك إعادة تشغيل هذه الأداة بأمان.
            </p>
            {this.state.error && (
               <div style={{ background: '#fee2e2', padding: '8px', borderRadius: '6px', fontSize: '0.75rem', marginTop: '10px', textAlign: 'left', direction: 'ltr', wordBreak: 'break-all' }}>
                 {this.state.error.message}
               </div>
            )}
          </div>
          <button 
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              background: '#ef4444',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 'bold',
              transition: 'background 0.2s'
            }}
          >
            <RefreshCcw size={16} /> إعادة المحاولة
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}