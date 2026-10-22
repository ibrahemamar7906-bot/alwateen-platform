'use client'

import { useEffect } from 'react'

export default function PwaInit() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return

    let refreshing = false

    // Listen for controller changes to reload and apply new updates automatically
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true
        window.location.reload()
      }
    })

    const handleRegistration = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js')

        // 1. If there is already a waiting worker, activate it immediately
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' })
        }

        // 2. Check for updates on load
        registration.update().catch(() => {})

        // 3. Listen for new incoming updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (!newWorker) return

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New update available! Trigger skipWaiting to take over automatically
              newWorker.postMessage({ type: 'SKIP_WAITING' })
            }
          })
        })

        // 4. Auto-check updates when returning to the app or when online
        const checkForUpdates = () => {
          registration.update().catch(() => {})
        }

        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') {
            checkForUpdates()
          }
        })

        window.addEventListener('online', checkForUpdates)
        window.addEventListener('focus', checkForUpdates)

        // Check periodically every 15 minutes
        const intervalId = setInterval(checkForUpdates, 15 * 60 * 1000)

        return () => {
          clearInterval(intervalId)
          window.removeEventListener('online', checkForUpdates)
          window.removeEventListener('focus', checkForUpdates)
        }
      } catch (err) {
        console.log('PWA ServiceWorker registration failed: ', err)
      }
    }

    if (document.readyState === 'complete') {
      handleRegistration()
    } else {
      window.addEventListener('load', handleRegistration, { once: true })
    }

    // Auto-recover from chunk load errors caused by new deployments or obsolete cache
    const handleChunkError = (errorMsg) => {
      if (
        typeof errorMsg === 'string' && (
          errorMsg.includes('Loading chunk') ||
          errorMsg.includes('Failed to load chunk') ||
          errorMsg.includes('ChunkLoadError') ||
          errorMsg.includes('Refused to execute script')
        )
      ) {
        const lastReload = sessionStorage.getItem('last_chunk_reload')
        const now = Date.now()
        if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
          sessionStorage.setItem('last_chunk_reload', now.toString())
          window.location.reload()
        }
      }
    }

    const onGlobalError = (event) => {
      handleChunkError(event?.message || '')
    }

    const onUnhandledRejection = (event) => {
      const reason = event?.reason?.message || event?.reason?.toString() || ''
      handleChunkError(reason)
    }

    window.addEventListener('error', onGlobalError)
    window.addEventListener('unhandledrejection', onUnhandledRejection)

    return () => {
      window.removeEventListener('error', onGlobalError)
      window.removeEventListener('unhandledrejection', onUnhandledRejection)
    }
  }, [])

  return null
}

