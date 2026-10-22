'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function TextsRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/prep-3/reading-and-texts')
  }, [router])
  return null
}
