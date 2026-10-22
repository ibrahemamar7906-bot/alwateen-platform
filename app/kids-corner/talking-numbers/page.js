'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import styles from './page.module.css'
import { speakWhenReady } from '../../../utils/tts'

function TalkingNumbersInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const lang = searchParams.get('lang') || 'ar' // 'ar' or 'en'
  const isAr = lang === 'ar'

  const [selectedNum, setSelectedNum] = useState(null)

  const toArabicWord = (num) => {
    const ones = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة', 'عشرة'];
    const teens = ['', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'];
    const tens = ['', '', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
    if (num <= 10) return ones[num];
    if (num < 20) return teens[num - 10];
    if (num < 100) {
      const o = num % 10;
      const t = Math.floor(num / 10);
      if (o === 0) return tens[t];
      return `${ones[o]} و${tens[t]}`;
    }
    if (num === 100) return 'مائة';
    return num;
  }

  const toEnglishWord = (num) => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    if (num < 20) return ones[num];
    if (num < 100) {
      const o = num % 10;
      const t = Math.floor(num / 10);
      if (o === 0) return tens[t];
      return `${tens[t]} ${ones[o]}`;
    }
    if (num === 100) return 'One Hundred';
    return num;
  }

  const speak = (num) => {
    if (isAr) {
      speakWhenReady(toArabicWord(num), 'Arabic Male')
    } else {
      speakWhenReady(num.toString(), 'US English Female')
    }
  }

  const handleNumberClick = (n) => {
    setSelectedNum(n)
    speak(n)
  }

  const numbers = Array.from({length: 100}, (_, i) => i + 1);

  return (
    <div className={styles.container} style={{ direction: isAr ? 'rtl' : 'ltr' }}>
      <header className={styles.header}>
        <Link href={`/kids-corner/${isAr ? 'math' : 'english'}`} className={styles.backBtn}>
          {isAr ? 'العودة للركن' : 'Back to Corner'}
        </Link>
        <h1 className={styles.title}>{isAr ? 'الأرقام الناطقة 🔊' : 'Talking Numbers 🔊'}</h1>
      </header>

      {/* Selected Number Display (Sticky at top) */}
      <div className={`${styles.displayArea} ${selectedNum ? styles.active : ''}`}>
        {selectedNum ? (
          <>
            <div className={styles.hugeNumber}>{selectedNum}</div>
            <div className={styles.numberWord}>{isAr ? toArabicWord(selectedNum) : toEnglishWord(selectedNum)}</div>
          </>
        ) : (
          <div className={styles.placeholder}>
            {isAr ? 'اضغط على أي رقم لسماعه' : 'Click any number to hear it'}
          </div>
        )}
      </div>

      <div className={styles.gridContainer}>
        <div className={styles.grid}>
          {numbers.map(n => (
            <button 
              key={n} 
              className={`${styles.numBtn} ${selectedNum === n ? styles.selected : ''}`}
              onClick={() => handleNumberClick(n)}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function TalkingNumbers() {
  return (
    <Suspense fallback={<div style={{padding: '50px', textAlign: 'center'}}>جاري التحميل...</div>}>
      <TalkingNumbersInner />
    </Suspense>
  )
}
