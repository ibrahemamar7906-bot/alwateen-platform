import Script from 'next/script'
import PremiumGuard from '../components/PremiumGuard'
import { Prep2AudioProvider } from './components/Prep2AudioContext'

export default function Layout({ children }) {
  return (
    <>
      <Script 
        src="https://code.responsivevoice.org/responsivevoice.js?key=VvhiMT52" 
        strategy="afterInteractive"
      />
      <Prep2AudioProvider>
        <PremiumGuard>{children}</PremiumGuard>
      </Prep2AudioProvider>
    </>
  )
}
