'use client'

import React from 'react'
import { Volume2, VolumeX, Sparkles, BookOpen } from 'lucide-react'
import { usePrep3Audio } from './Prep3AudioContext'
import ClickableWords from './ClickableWords'

export default function GrammarCard({
  id,
  title,
  explanation,
  examples = [],
  examplesTitle = 'أمثلة توضيحية:',
  exampleBoxColor = '#ecfdf5',
  exampleTextColor = '#059669',
  notes = null
}) {
  const { playText, currentId, isSpeaking } = usePrep3Audio()

  const cardSpeechId = `${id}-rule`
  const examplesSpeechId = `${id}-examples`

  const isPlayingRule = currentId === cardSpeechId && isSpeaking
  const isPlayingExamples = currentId === examplesSpeechId && isSpeaking

  const handlePlayRule = () => {
    const fullText = `${title}. ${explanation}`
    playText(cardSpeechId, fullText)
  }

  const handlePlayExamples = () => {
    if (!examples || examples.length === 0) return
    const exText = `${examplesTitle}. ` + examples.join('.. ')
    playText(examplesSpeechId, exText)
  }

  return (
    <div
      style={{
        background: isPlayingRule ? '#f0fdf4' : '#f8fafc',
        padding: '24px',
        borderRadius: '16px',
        border: isPlayingRule ? '2px solid #10b981' : '1px solid #e2e8f0',
        marginBottom: '26px',
        transition: 'all 0.25s ease',
        boxShadow: isPlayingRule ? '0 10px 25px rgba(16, 185, 129, 0.12)' : '0 2px 5px rgba(0,0,0,0.02)'
      }}
    >
      {/* Header with Title and "استمع للشرح" */}
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
        <h3 style={{ color: '#1e293b', margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>
          <ClickableWords text={title} />
        </h3>

        <button
          onClick={handlePlayRule}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: isPlayingRule ? '#dc2626' : '#059669',
            color: '#ffffff',
            border: 'none',
            padding: '7px 16px',
            borderRadius: '10px',
            cursor: 'pointer',
            fontSize: '0.88rem',
            fontWeight: 700,
            fontFamily: 'Tajawal, sans-serif',
            boxShadow: isPlayingRule
              ? '0 4px 12px rgba(220, 38, 38, 0.3)'
              : '0 4px 12px rgba(5, 150, 105, 0.2)',
            transition: 'all 0.2s ease'
          }}
          title="استمع إلى شرح القاعدة"
        >
          {isPlayingRule ? <VolumeX size={17} /> : <Volume2 size={17} />}
          <span>{isPlayingRule ? 'إيقاف الشرح' : 'استمع للشرح'}</span>
        </button>
      </div>

      {/* Explanation Text */}
      <p style={{ lineHeight: '1.9', color: '#334155', fontSize: '1.12rem', margin: '0 0 16px 0' }}>
        <ClickableWords text={explanation} />
      </p>

      {/* Examples Box with its own Audio Button */}
      {examples && examples.length > 0 && (
        <div
          style={{
            background: isPlayingExamples ? '#fef9c3' : exampleBoxColor,
            padding: '16px 20px',
            borderRadius: '12px',
            marginTop: '16px',
            border: isPlayingExamples ? '2px solid #ca8a04' : `1px solid ${exampleTextColor}40`,
            color: isPlayingExamples ? '#713f12' : exampleTextColor,
            transition: 'all 0.2s ease'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '10px'
            }}
          >
            <strong style={{ fontSize: '1.05rem' }}>
              <ClickableWords text={examplesTitle} />
            </strong>

            <button
              onClick={handlePlayExamples}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: isPlayingExamples ? '#dc2626' : '#ffffff',
                color: isPlayingExamples ? '#ffffff' : '#059669',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '4px 10px',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 700,
                fontFamily: 'Tajawal, sans-serif'
              }}
              title="استمع إلى نطق الأمثلة"
            >
              {isPlayingExamples ? <VolumeX size={15} /> : <Volume2 size={15} />}
              <span>{isPlayingExamples ? 'إيقاف الأمثلة' : 'نطق الأمثلة'}</span>
            </button>
          </div>

          <ul style={{ paddingRight: '22px', margin: 0, listStyleType: 'disc', lineHeight: '1.9', color: '#1e293b' }}>
            {examples.map((ex, idx) => (
              <li key={idx} style={{ marginBottom: '6px' }}>
                <ClickableWords text={ex} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Additional Notes */}
      {notes && (
        <div
          style={{
            marginTop: '14px',
            padding: '12px 16px',
            background: '#fffbeb',
            borderRadius: '10px',
            border: '1px solid #fde68a',
            color: '#92400e',
            fontSize: '0.98rem',
            lineHeight: '1.7'
          }}
        >
          <ClickableWords text={notes} />
        </div>
      )}

      {/* Helper Tip */}
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
        <span>اضغط على أي كلمة في الشرح أو الأمثلة لسماع نطقها وضبطها النحوي.</span>
      </div>
    </div>
  )
}

