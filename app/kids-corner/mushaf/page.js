'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import InteractiveMushafOverlay from '../../teacher-assistant/whiteboard/InteractiveMushafOverlay'

export default function StandaloneMushafPage() {
  const router = useRouter()
  return (
    <div style={{ minHeight: '100vh', background: '#0f172a' }}>
      <InteractiveMushafOverlay
        isActive={true}
        onClose={() => router.push('/kids-corner')}
      />
    </div>
  )
}
