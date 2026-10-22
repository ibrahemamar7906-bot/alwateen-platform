'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function StudentAIPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/student-dashboard')
  }, [router])

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', fontFamily: 'Tajawal, sans-serif' }}>
      <p>جارٍ التوجيه إلى لوحة تحكم الطالب...</p>
    </div>
  )
}