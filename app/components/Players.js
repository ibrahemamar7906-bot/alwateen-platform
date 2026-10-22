'use client'

import React, { useEffect } from 'react'

/**
 * 1. مشغل Google Drive المتطور
 * يحتوي على حماية بسيطة لمنع الضغط بالزر الأيمن (Right Click)
 */
export function DrivePlayer({ videoUrl }) {
  // Extract video ID from standard drive link to format it as embed link
  // e.g., https://drive.google.com/file/d/1ABC123/view -> https://drive.google.com/file/d/1ABC123/preview
  let embedUrl = videoUrl
  if (videoUrl && videoUrl.includes('/view')) {
    embedUrl = videoUrl.replace('/view', '/preview')
  }

  // منع الزر الأيمن
  const handleContextMenu = (e) => {
    e.preventDefault()
    return false
  }

  return (
    <div 
      style={{
        position: 'relative',
        width: '100%',
        paddingTop: '56.25%', // 16:9 Aspect Ratio
        backgroundColor: '#000',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
      }}
      onContextMenu={handleContextMenu}
    >
      <iframe 
        src={embedUrl} 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          border: 'none'
        }}
        allow="autoplay; fullscreen; encrypted-media" 
        allowFullScreen
      />
      {/* طبقة حماية إضافية تمنع بعض تفاعلات التحميل إذا كانت متوفرة */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '50px',
        height: '50px',
        zIndex: 10,
        background: 'transparent' // تغطية زر التحميل (pop-out) في درايف
      }} />
    </div>
  )
}

/**
 * 2. مشغل عروض Canva التفاعلية
 */
export function CanvaPlayer({ designUrl }) {
  // روابط كانفا للتضمين تأتي عادة بصيغة /view?embed
  let embedUrl = designUrl
  if (designUrl && !designUrl.includes('embed')) {
    embedUrl = designUrl.endsWith('/view') ? `${designUrl}?embed` : `${designUrl}/view?embed`
  }

  return (
    <div 
      style={{
        position: 'relative',
        width: '100%',
        paddingTop: '56.25%', // 16:9 Aspect Ratio
        boxShadow: '0 2px 8px 0 rgba(63,69,81,0.16)',
        borderRadius: '12px',
        overflow: 'hidden'
      }}
    >
      <iframe
        loading="lazy"
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          top: 0,
          left: 0,
          border: 'none',
          padding: 0,
          margin: 0
        }}
        src={embedUrl}
        allowFullScreen
        allow="fullscreen"
      />
    </div>
  )
}
