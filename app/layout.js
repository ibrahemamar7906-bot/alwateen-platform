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
  metadataBase: new URL('https://alwateen.com'),
  title: {
    default: 'منصة الوتين التعليمية | إشراف المستر إبراهيم عمار (أشمون - المنوفية)',
    template: '%s | منصة الوتين التعليمية'
  },
  description: 'منصة الوتين التعليمية بإشراف المستر إبراهيم عمار - أشمون، محافظة المنوفية. المنصة الرائدة لتعليم اللغة العربية وتأسيس الطلاب لجميع مراحل التعليم العام والأزهر الشريف (ابتدائي، إعدادي، ثانوي) مع فصول تفاعلية وبث مباشر وسبورة ذكية.',
  keywords: [
    'منصة الوتين', 'منصة الوتين التعليمية', 'المستر إبراهيم عمار', 'إبراهيم عمار لغة عربية',
    'أشمون', 'المنوفية', 'مستر إبراهيم عمار أشمون', 'لغة عربية أشمون',
    'تعليم عام وأزهر', 'ثانوية عامة', 'الشهادة الإعدادية', 'تأسيس لغة عربية',
    'سبورة تفاعلية', 'فصول افتراضية', 'بث مباشر تعليمي', 'نحو وبلاغة', 'ألعاب تعليمية'
  ],
  authors: [{ name: 'المستر إبراهيم عمار', url: 'https://alwateen.com' }],
  creator: 'المستر إبراهيم عمار',
  publisher: 'منصة الوتين التعليمية',
  formatDetection: {
    telephone: true,
    address: true,
    email: true,
  },
  alternates: {
    canonical: 'https://alwateen.com',
  },
  openGraph: {
    title: 'منصة الوتين التعليمية | إشراف المستر إبراهيم عمار',
    description: 'منصة تعليمية متكاملة لتعليم اللغة العربية لجميع المراحل (عام وأزهر) في أشمون والمنوفية وكافة المحافظات، مع فصول تفاعلية وبث مباشر.',
    url: 'https://alwateen.com',
    siteName: 'منصة الوتين التعليمية',
    locale: 'ar_EG',
    type: 'website',
    images: [
      {
        url: '/poster.jpg',
        width: 1200,
        height: 675,
        alt: 'بوستر منصة الوتين التعليمية - المستر إبراهيم عمار | تعلّم بذكاء.. تميّز بجدارة',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'منصة الوتين التعليمية | المستر إبراهيم عمار',
    description: 'فصول لايف، سبورة تفاعلية ذكية، وأقوى شرح للغة العربية عام وأزهر في أشمون والمنوفية.',
    images: ['/poster.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
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
        {/* ResponsiveVoice TTS via Next.js Script */}
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
