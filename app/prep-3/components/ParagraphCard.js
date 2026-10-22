'use client'

import React from 'react'
import { Volume2, VolumeX, Sparkles, BookOpen } from 'lucide-react'
import { usePrep3Audio } from './Prep3AudioContext'
import ClickableWords from './ClickableWords'

export default function ParagraphCard({
  id,
  title,
  text,
  notes = null,
  badge = null,
  icon = null
}) {
  const { playText, currentId, isSpeaking } = usePrep3Audio()
  const isPlayingThis = currentId === id && isSpeaking

  // Combine title and text for full paragraph reading
  const fullSpeechText = title ? `${title}. ${text}` : text

  return (
    <div
      style={{
        background: isPlayingThis ? '#f0fdf4' : '#f8fafc',
        padding: '24px',
        borderRadius: '16px',
        border: isPlayingThis ? '2px solid #10b981' : '1px solid #e2e8f0',
        marginBottom: '28px',
        transition: 'all 0.25s ease',
        boxShadow: isPlayingThis ? '0 10px 25px rgba(16, 185, 129, 0.12)' : '0 2px 4px rgba(0,0,0,0.02)',
        position: 'relative'
      }}
    >
      {/* Header with Title and Read Paragraph Button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '16px',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {icon || <BookOpen size={22} color="#059669" />}
          <h3 style={{ color: '#1e293b', margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>
            <ClickableWords text={title} />
          </h3>
          {badge && (
            <span
              style={{
                fontSize: '0.8rem',
                background: '#ecfdf5',
                color: '#059669',
                padding: '3px 10px',
                borderRadius: '999px',
                fontWeight: 600,
                border: '1px solid #a7f3d0'
              }}
            >
              {badge}
            </span>
          )}
        </div>

        {/* Action Button: Read Paragraph */}
        <button
          onClick={() => playText(id, fullSpeechText)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: isPlayingThis ? '#dc2626' : '#059669',
            color: '#ffffff',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '10px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 700,
            fontFamily: 'Tajawal, sans-serif',
            boxShadow: isPlayingThis
              ? '0 4px 12px rgba(220, 38, 38, 0.3)'
              : '0 4px 12px rgba(5, 150, 105, 0.25)',
            transition: 'all 0.2s ease'
          }}
          title={isPlayingThis ? 'إيقاف الاستماع' : 'استمع إلى قراءة الفقرة كاملة'}
        >
          {isPlayingThis ? <VolumeX size={18} /> : <Volume2 size={18} />}
          <span>{isPlayingThis ? 'إيقاف القراءة' : 'قراءة الفقرة'}</span>
        </button>
      </div>

      {/* Paragraph Text with Clickable Words */}
      <p
        style={{
          lineHeight: '2',
          color: '#334155',
          fontSize: '1.18rem',
          margin: '0 0 16px 0',
          whiteSpace: 'pre-wrap'
        }}
      >
        <ClickableWords text={text} />
      </p>

      {/* Optional Notes/Examples */}
      {notes && (
        <div
          style={{
            background: '#ecfdf5',
            padding: '14px 18px',
            borderRadius: '12px',
            marginTop: '14px',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            fontSize: '1.05rem',
            lineHeight: '1.8'
          }}
        >
          {typeof notes === 'string' ? <ClickableWords text={notes} /> : notes}
        </div>
      )}

      {/* Subtle Hint for the Student */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginTop: '12px',
          fontSize: '0.82rem',
          color: '#64748b'
        }}
      >
        <Sparkles size={14} color="#059669" />
        <span>اضغط على أي كلمة في الفقرة لسماع نطقها فوراً بصوت واضح.</span>
      </div>
    </div>
  )
}

