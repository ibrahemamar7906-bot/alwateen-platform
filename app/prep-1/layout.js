import Script from 'next/script'
import PremiumGuard from '../components/PremiumGuard'
import { Prep1AudioProvider } from './components/Prep1AudioContext'

export default function Layout({ children }) {
  return (
    <>
      <Script 
        src="https://code.responsivevoice.org/responsivevoice.js?key=VvhiMT52" 
        strategy="afterInteractive"
      />
      <Prep1AudioProvider>
        <PremiumGuard>{children}</PremiumGuard>
      </Prep1AudioProvider>
    </>
  )
}
