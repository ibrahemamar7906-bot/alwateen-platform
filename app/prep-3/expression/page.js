'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ExpressionRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/prep-3/dictation')
  }, [router])
  return null
}
