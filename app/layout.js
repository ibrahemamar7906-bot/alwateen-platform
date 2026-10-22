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
        url: '/logo.png',
        width: 800,
        height: 600,
        alt: 'شعار منصة الوتين التعليمية - المستر إبراهيم عمار',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'منصة الوتين التعليمية | المستر إبراهيم عمار',
    description: 'فصول لايف، سبورة تفاعلية ذكية، وأقوى شرح للغة العربية عام وأزهر في أشمون والمنوفية.',
    images: ['/logo.png'],
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
