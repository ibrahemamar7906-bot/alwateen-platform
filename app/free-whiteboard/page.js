'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

// Dynamically load the Whiteboard to prevent SSR issues with Fabric.js accessing 'window'
const WhiteboardComponent = dynamic(() => import('../teacher-assistant/whiteboard/WhiteboardComponent'), { 
  ssr: false,
  loading: () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100dvh', backgroundColor: '#f8fafc', color: '#0f5132', fontSize: '1.5rem', fontWeight: 'bold', fontFamily: 'Tajawal' }}>
      جاري تحميل محرك السبورة المجانية... 🎨
    </div>
  )
})

export default function FreeWhiteboardPage() {
  return (
    <div style={{ width: '100%', height: '100dvh', overflow: 'hidden', position: 'relative' }}>
      {/* SEO hidden text so Google indexes this specific page highly for these keywords */}
      <div style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: 0 }}>
        <h1>سبورة تفاعلية - سبورة الوتين المجانية</h1>
        <p>
          جرب أفضل سبورة تفاعلية مجانية من منصة الوتين. سبورة المعلم الذكية تحتوي على أدوات شرح متطورة، أدوات هندسية، مجسمات 3D لمعامل العلوم، ألعاب تعليمية، وسبورة الخط العربي.
          يمكنك استخدام سبورة الوتين التفاعلية مباشرة بدون تسجيل أو حساب. مثالية للتعليم عن بعد، الشرح الأونلاين، والتدريس التفاعلي.
        </p>
      </div>
      
      <WhiteboardComponent />
    </div>
  )
}
