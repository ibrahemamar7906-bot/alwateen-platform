'use client'
import React, { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle2, ShieldAlert, Sparkles, X } from 'lucide-react'

const ToastContext = createContext(null)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within ToastProvider')
  return context
}

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type }])
    
    // Auto remove after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, duration)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Container */}
      <div style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 999999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        pointerEvents: 'none'
      }}>
        {toasts.map(toast => (
          <div key={toast.id} style={{
            pointerEvents: 'auto',
            backgroundColor: toast.type === 'success' ? '#10b981' : toast.type === 'warning' ? '#f59e0b' : toast.type === 'error' ? '#ef4444' : '#3b82f6',
            color: '#ffffff',
            padding: '12px 24px',
            borderRadius: '50px',
            fontWeight: 700,
            fontSize: '0.95rem',
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            animation: 'toastSlideDown 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
          }}>
            {toast.type === 'success' && <CheckCircle2 size={20} />}
            {toast.type === 'warning' && <ShieldAlert size={20} />}
            {toast.type === 'error' && <ShieldAlert size={20} />}
            {toast.type === 'info' && <Sparkles size={20} />}
            
            <span>{toast.message}</span>

            <button 
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                padding: 0,
                marginLeft: '8px',
                display: 'flex',
                alignItems: 'center',
                opacity: 0.8
              }}
            >
              <X size={16} />
            </button>
          </div>
        ))}
        
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes toastSlideDown {
            0% { transform: translateY(-100%); opacity: 0; }
            60% { transform: translateY(15px); opacity: 1; }
            100% { transform: translateY(0); opacity: 1; }
          }
        `}} />
      </div>
    </ToastContext.Provider>
  )
}
