export const dynamic = 'force-static'

export default function manifest() {
  return {
    name: 'منصة الوتين التعليمية',
    short_name: 'الوتين',
    description: 'منصة تعليمية تفاعلية شاملة',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#1A2E86',
    icons: [
      {
        src: '/logo.png',
        sizes: 'any',
        type: 'image/png',
      },
      {
        src: '/logo.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/logo.png',
        sizes: '512x512',
        type: 'image/png',
      }
    ],
  }
}
