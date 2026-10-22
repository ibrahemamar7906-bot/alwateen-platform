import './globals.css'
import PwaInit from './components/PwaInit'
import PwaInstallPrompt from './components/PwaInstallPrompt'
import SessionGuard from './components/SessionGuard'
import AppLoader from './components/AppLoader'
import ToastProvider from './components/ToastProvider'
import WhatsAppFloat from './components/WhatsAppFloat'
import { Tajawal } from 'next/font/google'
import Script from 'next/script'

const tajawal = Tajawal({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '700', '800'],
  display: 'swap',
})

export const metadata = {
  title: 'منصة الوتين التعليمية | بوابتك للتفوق والتعلم التفاعلي',
  description: 'منصة الوتين التعليمية تقدم تجربة تعليمية متكاملة لجميع مراحل العام والأزهر، مع فصول تفاعلية وبث مباشر وأدوات متطورة للمعلمين والطلاب.',
  keywords: ['منصة تعليمية', 'تعلم اللغة العربية', 'نظام لايف', 'أدوات للمعلمين', 'بث مباشر', 'سبورة تفاعلية', 'الوتين', 'منصة الوتين', 'أزهر وعام'],
  authors: [{ name: 'المستر إبراهيم عمار' }],
  openGraph: {
    title: 'منصة الوتين التعليمية | نظام تعليمي متكامل',
    description: 'نظام لايف متكامل وأدوات ذكية للمعلمين، مع كورسات تفاعلية لتعلم اللغة العربية. انضم الآن واستمتع بأفضل تجربة تعليمية.',
    url: 'https://alwateen.com',
    siteName: 'منصة الوتين التعليمية',
    locale: 'ar_EG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'منصة الوتين التعليمية | أدوات للمعلمين وفصول تفاعلية',
    description: 'نظام بث مباشر متكامل وأدوات احترافية للمعلمين، مع سبورة تفاعلية متطورة.',
  },
}

export const viewport = {
  themeColor: '#1A2E86',
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" className={tajawal.className}>
      <head>
        {/* iOS PWA full-screen mode */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="منصة الوتين" />

        {/* Android PWA theme */}
        <meta name="theme-color" content="#1A2E86" />
        <meta name="mobile-web-app-capable" content="yes" />

        {/* Icons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/logo.png" />
        <link rel="manifest" href="/manifest.json" />

        {/* Global ChunkLoadError Auto-Recovery on new deployments */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('error', function(e) {
                if (e && e.message && (e.message.indexOf('ChunkLoadError') !== -1 || e.message.indexOf('Failed to load chunk') !== -1 || e.message.indexOf('Loading chunk') !== -1)) {
                  if (!window.__chunkReloaded) {
                    window.__chunkReloaded = true;
                    window.location.reload(true);
                  }
                }
              });
              window.addEventListener('unhandledrejection', function(e) {
                if (e && e.reason && (e.reason.name === 'ChunkLoadError' || (e.reason.message && (e.reason.message.indexOf('Failed to load chunk') !== -1 || e.reason.message.indexOf('Loading chunk') !== -1)))) {
                  if (!window.__chunkReloaded) {
                    window.__chunkReloaded = true;
                    window.location.reload(true);
                  }
                }
              });
            `
          }}
        />
      </head>
      <body className={tajawal.className}>
        {/* ResponsiveVoice TTS via Next.js Script - Moved to body to avoid preload mismatch warnings */}
        <Script 
          src="https://code.responsivevoice.org/responsivevoice.js?key=VvhiMT52" 
          strategy="lazyOnload"
        />
        
        <PwaInit />
        <PwaInstallPrompt />
        <AppLoader />
        <ToastProvider>
          <SessionGuard>
            {children}
          </SessionGuard>
        </ToastProvider>
        <WhatsAppFloat />
      </body>
    </html>
  )
}


