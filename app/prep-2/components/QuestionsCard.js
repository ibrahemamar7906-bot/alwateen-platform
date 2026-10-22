'use client'

import React from 'react'
import { CheckCircle, Volume2, VolumeX, Sparkles } from 'lucide-react'
import { usePrep1Audio } from './Prep2AudioContext'
import ClickableWords from './ClickableWords'

export default function QuestionsCard({
  title = 'تدريبات وأسئلة الفهم القرائي',
  questions = [],
  id = 'questions'
}) {
  const { playText, currentId, isSpeaking } = usePrep1Audio()

  if (!questions || questions.length === 0) return null

  const handlePlayQ = (q, a, idx) => {
    const qId = `${id}-q-${idx}`
    const fullText = `السؤال: ${q}. الإجابة: ${a}`
    playText(qId, fullText)
  }

  return (
    <div
      id="questions"
      style={{
        marginTop: '35px',
        padding: '26px',
        background: '#ecfdf5',
        borderRadius: '18px',
        border: '1px solid #a7f3d0'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '20px'
        }}
      >
        <h3
          style={{
            color: '#065f46',
            margin: 0,
            fontSize: '1.3rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 800
          }}
        >
          <CheckCircle size={22} color="#059669" />
          <span>{title}</span>
        </h3>
        <span style={{ fontSize: '0.85rem', color: '#047857' }}>
          💡 اضغط على زر الاستماع بجانب السؤال أو اضغط على أي كلمة لسماع نطقها.
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {questions.map((item, idx) => {
          const qId = `${id}-q-${idx}`
          const isPlayingThisQ = currentId === qId && isSpeaking

          return (
            <div
              key={idx}
              style={{
                background: isPlayingThisQ ? '#f0fdf4' : '#ffffff',
                padding: '18px',
                borderRadius: '14px',
                border: isPlayingThisQ ? '2px solid #059669' : '1px solid #e2e8f0',
                boxShadow: isPlayingThisQ
                  ? '0 4px 15px rgba(5,150,105,0.15)'
                  : '0 2px 4px rgba(0,0,0,0.02)',
                transition: 'all 0.2s ease'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px',
                  marginBottom: '10px'
                }}
              >
                <strong style={{ color: '#0f172a', fontSize: '1.12rem', lineHeight: '1.7' }}>
                  <ClickableWords text={item.q} />
                </strong>

                <button
                  onClick={() => handlePlayQ(item.q, item.a, idx)}
                  style={{
                    background: isPlayingThisQ ? '#dc2626' : '#ecfdf5',
                    color: isPlayingThisQ ? '#ffffff' : '#059669',
                    border: '1px solid #a7f3d0',
                    borderRadius: '8px',
                    padding: '5px 12px',
                    cursor: 'pointer',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontFamily: 'Tajawal, sans-serif',
                    whiteSpace: 'nowrap'
                  }}
                  title="استمع إلى السؤال وإجابته"
                >
                  {isPlayingThisQ ? <VolumeX size={15} /> : <Volume2 size={15} />}
                  <span>{isPlayingThisQ ? 'إيقاف' : 'استمع'}</span>
                </button>
              </div>

              <p style={{ margin: 0, color: '#334155', lineHeight: '1.8', fontSize: '1.05rem' }}>
                <ClickableWords text={item.a} />
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
