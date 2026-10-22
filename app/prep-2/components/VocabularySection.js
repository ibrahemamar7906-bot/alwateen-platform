'use client'

import React from 'react'
import { BookA, Volume2, VolumeX, Sparkles } from 'lucide-react'
import { usePrep1Audio } from './Prep2AudioContext'
import ClickableWords from './ClickableWords'

export default function VocabularySection({
  title = 'معاني المفردات واللغويات',
  vocabList = [],
  id = 'vocab'
}) {
  const { playText, currentId, isSpeaking } = usePrep1Audio()

  if (!vocabList || vocabList.length === 0) return null

  const handlePlayRow = (item, idx) => {
    const rowId = `${id}-row-${idx}`
    let speechParts = [`الكلمة: ${item.word}، معناها: ${item.meaning}`]
    if (item.opposite) speechParts.push(`مضادها: ${item.opposite}`)
    if (item.plural) speechParts.push(`جمعها: ${item.plural}`)
    if (item.singular) speechParts.push(`مفردها: ${item.singular}`)
    playText(rowId, speechParts.join('، '))
  }

  return (
    <div
      style={{
        background: '#ffffff',
        padding: '28px',
        borderRadius: '20px',
        border: '1px solid #e2e8f0',
        marginBottom: '35px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.03)'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '20px',
          paddingBottom: '14px',
          borderBottom: '2px solid #ecfdf5'
        }}
      >
        <h2
          style={{
            color: '#059669',
            margin: 0,
            fontSize: '1.4rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <BookA size={24} color="#059669" />
          <span>{title}</span>
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#64748b' }}>
          <Sparkles size={16} color="#059669" />
          <span>اضغط على زر الاستماع للصف كاملاً، أو اضغط على أي كلمة مفردة لسماعها.</span>
        </div>
      </div>

      {/* Grid or Table of Vocabulary */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '14px'
        }}
      >
        {vocabList.map((item, idx) => {
          const rowId = `${id}-row-${idx}`
          const isPlayingRow = currentId === rowId && isSpeaking

          return (
            <div
              key={idx}
              style={{
                background: isPlayingRow ? '#f0fdf4' : '#f8fafc',
                border: isPlayingRow ? '2px solid #059669' : '1px solid #e2e8f0',
                borderRadius: '14px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                transition: 'all 0.2s ease',
                boxShadow: isPlayingRow ? '0 4px 15px rgba(5,150,105,0.15)' : 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '1.18rem', fontWeight: 800, color: '#0f172a' }}>
                  <ClickableWords text={item.word} />
                </span>

                <button
                  onClick={() => handlePlayRow(item, idx)}
                  style={{
                    background: isPlayingRow ? '#dc2626' : '#ecfdf5',
                    color: isPlayingRow ? '#ffffff' : '#059669',
                    border: '1px solid #a7f3d0',
                    borderRadius: '8px',
                    padding: '5px 10px',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontFamily: 'Tajawal, sans-serif'
                  }}
                  title="استمع إلى نطق الكلمة ومعناها"
                >
                  {isPlayingRow ? <VolumeX size={15} /> : <Volume2 size={15} />}
                  <span>{isPlayingRow ? 'إيقاف' : 'استمع'}</span>
                </button>
              </div>

              <div style={{ color: '#334155', fontSize: '1rem', lineHeight: '1.6' }}>
                <strong style={{ color: '#059669' }}>المعنى: </strong>
                <ClickableWords text={item.meaning} />
              </div>

              {item.opposite && (
                <div style={{ color: '#64748b', fontSize: '0.92rem' }}>
                  <strong style={{ color: '#b91c1c' }}>المضاد: </strong>
                  <ClickableWords text={item.opposite} />
                </div>
              )}

              {item.plural && (
                <div style={{ color: '#64748b', fontSize: '0.92rem' }}>
                  <strong style={{ color: '#2563eb' }}>الجمع: </strong>
                  <ClickableWords text={item.plural} />
                </div>
              )}

              {item.singular && (
                <div style={{ color: '#64748b', fontSize: '0.92rem' }}>
                  <strong style={{ color: '#2563eb' }}>المفرد: </strong>
                  <ClickableWords text={item.singular} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
