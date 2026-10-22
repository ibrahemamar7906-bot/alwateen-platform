import Script from 'next/script'
import PremiumGuard from '../components/PremiumGuard'
import { Prep3AudioProvider } from './components/Prep3AudioContext'

export default function Layout({ children }) {
  return (
    <>
      <Script 
        src="https://code.responsivevoice.org/responsivevoice.js?key=VvhiMT52" 
        strategy="afterInteractive"
      />
      <Prep3AudioProvider>
        <PremiumGuard>{children}</PremiumGuard>
      </Prep3AudioProvider>
    </>
  )
}
