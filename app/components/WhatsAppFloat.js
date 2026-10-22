'use client'

import { usePathname } from 'next/navigation'

export default function WhatsAppFloat() {
  const pathname = usePathname()

  // Hide WhatsApp button when inside whiteboard, document editor, or live classroom
  if (pathname && (pathname.includes('whiteboard') || pathname.includes('document-editor') || pathname.includes('virtual-classroom') || pathname.includes('/live'))) {
    return null
  }

  return (
    <a 
      href="https://wa.me/201507952002" 
      target="_blank" 
      rel="noopener noreferrer" 
      className="whatsapp-float no-print"
      aria-label="تواصل معنا على واتساب"
    >
      <svg width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
      </svg>
    </a>
  )
}
