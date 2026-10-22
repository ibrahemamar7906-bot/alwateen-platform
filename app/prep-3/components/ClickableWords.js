'use client'

import React from 'react'
import { usePrep3Audio } from './Prep3AudioContext'

export default function ClickableWords({
  text,
  className = '',
  style = {},
  highlightTargetWord = null
}) {
  const { playWord, activeWord } = usePrep3Audio()

  if (!text) return null

  // Split lines first to preserve line breaks
  const lines = typeof text === 'string' ? text.split('\n') : [String(text)]

  return (
    <span className={className} style={{ display: 'inline', ...style }}>
      {lines.map((line, lineIdx) => {
        // Tokenize line: separates words, punctuation, and whitespace
        const tokens = line.split(/(\s+|[«»"'\(\)\[\]\{\}\.\,\،\؛\:\?\!\-\–\—]+)/g)

        return (
          <React.Fragment key={lineIdx}>
            {tokens.map((token, tokenIdx) => {
              if (!token) return null

              const isWord = /[\u0600-\u06FF\w]/.test(token)
              if (!isWord) {
                return <span key={tokenIdx}>{token}</span>
              }

              const cleanWord = token.replace(/^[«"'\(\[\{]+|[»"'\)\]\}\.\,\،\؛\:\?\!]+$/g, '').trim()
              const isSpokenActive = activeWord && (activeWord === cleanWord || activeWord === token)
              
              const isTargetWord = highlightTargetWord && (
                cleanWord.toLowerCase() === highlightTargetWord.toLowerCase() ||
                token.toLowerCase() === highlightTargetWord.toLowerCase()
              )

              return (
                <span
                  key={tokenIdx}
                  onClick={(e) => {
                    e.stopPropagation()
                    playWord(cleanWord || token)
                  }}
                  title={`اضغط للاستماع إلى نطق: "${cleanWord || token}"`}
                  style={{
                    cursor: 'pointer',
                    display: 'inline',
                    padding: isTargetWord ? '2px 6px' : '1px 3px',
                    margin: '0 1px',
                    borderRadius: '4px',
                    transition: 'all 0.15s ease',
                    backgroundColor: isSpokenActive 
                      ? '#6ee7b7' 
                      : isTargetWord 
                        ? '#fef08a' 
                        : 'transparent',
                    color: isSpokenActive 
                      ? '#064e3b' 
                      : isTargetWord 
                        ? '#854d0e' 
                        : 'inherit',
                    fontWeight: isSpokenActive || isTargetWord ? 800 : 'inherit',
                    borderBottom: isTargetWord ? '2px solid #eab308' : 'none',
                    boxShadow: isSpokenActive ? '0 0 0 2px #059669' : 'none',
                    userSelect: 'text'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSpokenActive && !isTargetWord) {
                      e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.12)'
                      e.currentTarget.style.textDecoration = 'underline dotted #059669'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSpokenActive && !isTargetWord) {
                      e.currentTarget.style.backgroundColor = 'transparent'
                      e.currentTarget.style.textDecoration = 'none'
                    }
                  }}
                >
                  {token}
                </span>
              )
            })}
            {lineIdx < lines.length - 1 && <br />}
          </React.Fragment>
        )
      })}
    </span>
  )
}

