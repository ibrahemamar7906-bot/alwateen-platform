'use client'

import React from 'react'
import { Volume2, VolumeX, Play, Square, Music, Sparkles } from 'lucide-react'
import { usePrep1Audio } from './Prep1AudioContext'
import ClickableWords from './ClickableWords'

export default function PoetrySection({
  title = 'النص الشعري والأبيات',
  poet = '',
  verses = [],
  id = 'poem'
}) {
  const { playText, playSequence, stop, currentId, isSpeaking, sequenceIndex } = usePrep1Audio()

  const isPlayingWholePoem = currentId === `${id}-all` && isSpeaking

  // Combine verses for whole poem playback
  const versesTextArray = verses.map(v => `${v.sadr} .. ${v.ajuz}`)

  const handlePlayAll = () => {
    if (isPlayingWholePoem) {
      stop()
    } else {
      playSequence(`${id}-all`, versesTextArray)
    }
  }

  const handlePlayVerse = (verseIdx) => {
    const verseId = `${id}-verse-${verseIdx}`
    const textToSpeak = `${verses[verseIdx].sadr} .. ${verses[verseIdx].ajuz}`
    playText(verseId, textToSpeak)
  }

  return (
    <div
      style={{
        background: '#ffffff',
        padding: '28px',
        borderRadius: '20px',
        border: '1px solid #e2e8f0',
        marginBottom: '35px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.04)'
      }}
    >
      {/* Poem Header & Full Recitation Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '15px',
          marginBottom: '25px',
          paddingBottom: '16px',
          borderBottom: '2px solid #ecfdf5'
        }}
      >
        <div>
          <h2
            style={{
              color: '#065f46',
              margin: '0 0 6px 0',
              fontSize: '1.45rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <Music size={26} color="#059669" />
            <span>{title}</span>
          </h2>
          {poet && (
            <span style={{ color: '#64748b', fontSize: '0.95rem', fontWeight: 600 }}>
              للشاعر: {poet}
            </span>
          )}
        </div>

        {/* Global Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={handlePlayAll}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: isPlayingWholePoem ? '#dc2626' : '#059669',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '0.95rem',
              fontFamily: 'Tajawal, sans-serif',
              boxShadow: isPlayingWholePoem
                ? '0 4px 15px rgba(220, 38, 38, 0.35)'
                : '0 4px 15px rgba(5, 150, 105, 0.3)',
              transition: 'all 0.2s ease'
            }}
            title={isPlayingWholePoem ? 'إيقاف قراءة القصيدة' : 'استمع للقصيدة كاملة بيتاً بعد بيت'}
          >
            {isPlayingWholePoem ? <Square size={18} /> : <Play size={18} />}
            <span>{isPlayingWholePoem ? 'إيقاف القراءة الكاملة' : '🎧 استمع للقصيدة كاملة'}</span>
          </button>
        </div>
      </div>

      {/* Helpful Hint */}
      <div
        style={{
          background: '#f0fdf4',
          padding: '10px 16px',
          borderRadius: '10px',
          border: '1px solid #bbf7d0',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#166534',
          fontSize: '0.88rem'
        }}
      >
        <Sparkles size={16} color="#16a34a" />
        <span>
          يمكنك الاستماع للقصيدة كاملة، أو قراءة أي بيت بمفرده عبر زر "قراءة البيت"، كما يمكنك الضغط على أي كلمة مفردة لسماع نطقها.
        </span>
      </div>

      {/* Verses List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {verses.map((verse, idx) => {
          const verseId = `${id}-verse-${idx}`
          const isPlayingThisVerse = (currentId === verseId && isSpeaking) || (isPlayingWholePoem && sequenceIndex === idx)

          return (
            <div
              key={idx}
              style={{
                background: isPlayingThisVerse ? '#f0fdf4' : '#f8fafc',
                border: isPlayingThisVerse ? '2px solid #059669' : '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '18px 22px',
                transition: 'all 0.25s ease',
                boxShadow: isPlayingThisVerse
                  ? '0 6px 20px rgba(5, 150, 105, 0.15)'
                  : '0 2px 5px rgba(0,0,0,0.02)'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                {/* Verse Number Badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      background: isPlayingThisVerse ? '#059669' : '#e2e8f0',
                      color: isPlayingThisVerse ? '#ffffff' : '#475569',
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.85rem',
                      fontWeight: 800
                    }}
                  >
                    {idx + 1}
                  </span>
                </div>

                {/* The Two Hemistichs (الصدر والعجز) */}
                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '24px',
                    flexWrap: 'wrap',
                    textAlign: 'center',
                    minWidth: '280px'
                  }}
                >
                  {/* الصدر */}
                  <div
                    style={{
                      fontSize: '1.25rem',
                      color: '#1e293b',
                      fontWeight: 600,
                      lineHeight: '1.9'
                    }}
                  >
                    <ClickableWords text={verse.sadr} />
                  </div>

                  {/* فاصل الشطرين */}
                  <span style={{ color: '#059669', fontWeight: 800, fontSize: '1.3rem' }}>
                    ∴
                  </span>

                  {/* العجز */}
                  <div
                    style={{
                      fontSize: '1.25rem',
                      color: '#1e293b',
                      fontWeight: 600,
                      lineHeight: '1.9'
                    }}
                  >
                    <ClickableWords text={verse.ajuz} />
                  </div>
                </div>

                {/* Read Single Verse Button */}
                <div>
                  <button
                    onClick={() => handlePlayVerse(idx)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: isPlayingThisVerse && !isPlayingWholePoem ? '#dc2626' : '#ecfdf5',
                      color: isPlayingThisVerse && !isPlayingWholePoem ? '#ffffff' : '#059669',
                      border: '1px solid #a7f3d0',
                      padding: '7px 14px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      fontFamily: 'Tajawal, sans-serif',
                      transition: 'all 0.2s ease'
                    }}
                    title="استمع لنطق هذا البيت كاملاً"
                  >
                    {isPlayingThisVerse && !isPlayingWholePoem ? (
                      <VolumeX size={16} />
                    ) : (
                      <Volume2 size={16} />
                    )}
                    <span>{isPlayingThisVerse && !isPlayingWholePoem ? 'إيقاف' : 'قراءة البيت'}</span>
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
